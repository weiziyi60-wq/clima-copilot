import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

/**
 * Generative layer ONLY.
 * This endpoint never computes, recomputes or alters a score: the numbers are
 * produced exclusively by src/lib/clima-scoring.ts on the client and passed in
 * here as read-only context for interpretation.
 */

const RequestSchema = z.object({
  question: z.string().min(1).max(1000),
  inputs: z.object({
    orientation: z.string(),
    wwr: z.number(),
    shading: z.string(),
    ventilation: z.string(),
    greenery: z.string(),
  }),
  scores: z.object({
    overall: z.number(),
    classification: z.string(),
    solarControl: z.number(),
    daylight: z.number(),
    ventilation: z.number(),
    envelope: z.number(),
    energy: z.number(),
  }),
  explanations: z.array(z.string()).max(20).default([]),
  actions: z.array(z.string()).max(10).default([]),
});

const SYSTEM_PROMPT = `You are the CLIMA Design Advisor — an early-stage climate-responsive design assistant for architects working in Singapore's hot-humid climate.

ABSOLUTE CONSTRAINTS
- A separate deterministic rule-based engine has already produced every number you are given. It is the only source of numerical truth.
- Never calculate, recalculate, estimate, adjust, predict or contradict any score or sub-score. Never state what a score "would become".
- Never invent energy savings percentages, cooling loads, carbon reductions, RETV or OTTV values, daylight simulation metrics (DF, sDA, UDI), or Green Mark ratings or certification outcomes.
- If asked for such figures, say plainly that CLIMA V0.1 is a heuristic early-stage screening tool and that those values require environmental simulation and professional assessment.

WHAT YOU DO
- Explain which of the given design parameters are driving the current result.
- Discuss architectural trade-offs in concrete façade, plan and section terms.
- Suggest practical passive-design improvements appropriate to a hot-humid equatorial climate (high diffuse sky, low-angle east/west sun, low wind speeds, high humidity).
- Respect constraints the user states. If a parameter is fixed by the client or brief, accept it and prioritise the remaining levers — do not repeat advice to change the fixed parameter.
- Always distinguish heuristic early-stage guidance from validated simulation results.

STYLE
- Concise, professional architectural language. 120-200 words unless the user asks for more.
- Short paragraphs or tight bullets. No generic sustainability boilerplate unrelated to the given inputs.
- Refer to the given scores qualitatively (strong, weak, the limiting factor) rather than performing arithmetic on them.`;

export const Route = createFileRoute("/api/ask-clima")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) {
          return new Response(
            JSON.stringify({ error: "The AI advisor is not configured." }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }

        let body: z.infer<typeof RequestSchema>;
        try {
          body = RequestSchema.parse(await request.json());
        } catch {
          return new Response(JSON.stringify({ error: "Invalid request." }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const { inputs, scores, explanations, actions, question } = body;

        const context = [
          "PROJECT CONTEXT (read-only, produced by the deterministic CLIMA engine):",
          "Location: Singapore. Building type: Residential.",
          `Primary glazed façade orientation: ${inputs.orientation}`,
          `Window-to-wall ratio: ${inputs.wwr}%`,
          `External shading: ${inputs.shading}`,
          `Ventilation strategy: ${inputs.ventilation}`,
          `Greenery integration: ${inputs.greenery} (recorded only; excluded from the V0.1 score)`,
          "",
          "DETERMINISTIC RESULTS (do not alter):",
          `Climate Responsiveness Score: ${scores.overall}/100 — ${scores.classification}`,
          `Solar Control: ${scores.solarControl}/25`,
          `Daylight Potential: ${scores.daylight}/20`,
          `Natural Ventilation Potential: ${scores.ventilation}/20`,
          `Envelope Strategy: ${scores.envelope}/20`,
          `Energy Potential: ${scores.energy}/15`,
          "",
          explanations.length ? `Engine rationale:\n- ${explanations.join("\n- ")}` : "",
          actions.length ? `Engine priority actions:\n- ${actions.join("\n- ")}` : "",
          "",
          `ARCHITECT'S QUESTION:\n${question}`,
        ]
          .filter(Boolean)
          .join("\n");

        let upstream: Response;
        try {
          upstream = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Lovable-API-Key": apiKey,
              "X-Lovable-AIG-SDK": "fetch",
            },
            body: JSON.stringify({
              model: "openai/gpt-5.6-luna",
              instructions: SYSTEM_PROMPT,
              input: context,
              store: false,
              stream: true,
            }),
          });
        } catch {
          return new Response(
            JSON.stringify({ error: "Could not reach the AI advisor. Please try again." }),
            { status: 502, headers: { "Content-Type": "application/json" } },
          );
        }

        if (!upstream.ok || !upstream.body) {
          const detail = await upstream.text().catch(() => "");
          let message = "The AI advisor is temporarily unavailable.";
          if (upstream.status === 429)
            message = "Too many requests right now. Please wait a moment and ask again.";
          else if (upstream.status === 402)
            message =
              "AI credits are exhausted for this workspace. Add credits in Lovable to continue using the advisor.";
          else if (upstream.status === 403)
            message = "AI access is currently blocked for this workspace.";
          console.error("ask-clima gateway error", upstream.status, detail.slice(0, 500));
          return new Response(JSON.stringify({ error: message }), {
            status: upstream.status,
            headers: { "Content-Type": "application/json" },
          });
        }

        // Re-emit only the final answer text. Reasoning summaries are never
        // requested and never forwarded to the browser.
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        const reader = upstream.body.getReader();
        let buffer = "";

        const stream = new ReadableStream<Uint8Array>({
          async pull(controller) {
            const { done, value } = await reader.read();
            if (done) {
              controller.close();
              return;
            }
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";
            for (const line of lines) {
              if (!line.startsWith("data:")) continue;
              const payload = line.slice(5).trim();
              if (!payload || payload === "[DONE]") continue;
              try {
                const event = JSON.parse(payload) as {
                  type?: string;
                  delta?: string;
                };
                if (event.type === "response.output_text.delta" && event.delta) {
                  controller.enqueue(encoder.encode(event.delta));
                }
              } catch {
                /* ignore partial or non-JSON frames */
              }
            }
          },
          cancel(reason) {
            return reader.cancel(reason);
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
