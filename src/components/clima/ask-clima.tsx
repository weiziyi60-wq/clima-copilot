import { useRef, useState } from "react";
import type { DesignInputs, ScoreResult } from "@/lib/clima-scoring";
import type { Comparison } from "@/lib/clima-compare";

/**
 * Generative layer. Reads the deterministic result (and, when present, the
 * deterministic comparison) as context and never produces or modifies any
 * number itself.
 */
export function AskClima({
  inputs,
  result,
  comparison,
}: {
  inputs: DesignInputs;
  result: ScoreResult;
  comparison?: Comparison | null;
}) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  async function ask(q: string) {
    const trimmed = q.trim();
    if (!trimmed || loading) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    setAnswer("");

    try {
      const res = await fetch("/api/ask-clima", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          question: trimmed,
          inputs,
          scores: {
            overall: result.overall,
            classification: result.classification,
            solarControl: result.solarControl,
            daylight: result.daylight,
            ventilation: result.ventilation,
            envelope: result.envelope,
            energy: result.energy,
          },
          explanations: result.explanations,
          actions: result.actions,
          comparison: comparison
            ? {
                inputsB: comparison.inputsB,
                overallA: comparison.a.overall,
                overallB: comparison.b.overall,
                classificationA: comparison.a.classification,
                classificationB: comparison.b.classification,
                overallDelta: comparison.overallDelta,
                categories: comparison.categories.map((c) => ({
                  label: c.label,
                  max: c.max,
                  a: c.a,
                  b: c.b,
                  delta: c.delta,
                })),
                changes: comparison.changes,
                interpretation: comparison.interpretation,
              }
            : undefined,
        }),
      });

      if (!res.ok || !res.body) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? "The AI advisor is temporarily unavailable.");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        setAnswer((prev) => prev + decoder.decode(value, { stream: true }));
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError("Connection interrupted. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  const suggestions = comparison
    ? [
        "Which of these changes had the greatest impact?",
        "What trade-offs did Option B introduce?",
        "The client wants the large glazing area. Which improvements should I keep?",
      ]
    : [
        "Which parameter is limiting this design most?",
        `The client insists on keeping ${inputs.wwr}% glazing. What can I improve instead?`,
        "How should I treat the façade for this orientation?",
      ];

  return (
    <div className="glass rounded-2xl p-7">
      <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-brand">
        Ask CLIMA
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Discuss this design with your AI climate advisor.
      </p>

      <form
        className="mt-5 flex flex-col gap-3 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          void ask(question);
        }}
      >
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. The client insists on 75% glazing. What can I improve instead?"
          className="min-w-0 flex-1 rounded-lg border border-glass-border bg-secondary px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-brand/50"
        />
        <button
          type="submit"
          disabled={loading || question.trim().length === 0}
          className="brand-gradient flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-ink transition-transform enabled:hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <span className="size-3.5 animate-spin rounded-full border-2 border-ink/30 border-t-ink" />
              Thinking…
            </>
          ) : (
            "Ask CLIMA"
          )}
        </button>
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            disabled={loading}
            onClick={() => {
              setQuestion(s);
              void ask(s);
            }}
            className="rounded-full border border-glass-border px-3 py-1 text-[11px] text-muted-foreground transition-colors hover:border-brand/40 hover:text-foreground disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>

      {error && (
        <p
          className="mt-5 rounded-lg border px-4 py-3 text-sm"
          style={{
            borderColor: "oklch(0.55 0.14 40 / 0.35)",
            color: "oklch(0.48 0.14 40)",
          }}
        >
          {error}
        </p>
      )}

      {(answer || (loading && !error)) && (
        <div className="mt-5 border-t border-glass-border pt-5">
          {answer ? (
            <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              {answer.split(/\n{2,}/).map((block, i) => {
                const lines = block.split("\n");
                const isList = lines.every((l) => /^\s*[-*\u2022]\s+/.test(l));
                if (isList) {
                  return (
                    <ul key={i} className="space-y-2">
                      {lines.map((l, j) => (
                        <li key={j} className="flex gap-3">
                          <span className="mt-2 h-px w-3 shrink-0 bg-brand/60" />
                          <span className="text-pretty">
                            {renderInline(l.replace(/^\s*[-*\u2022]\s+/, ""))}
                          </span>
                        </li>
                      ))}
                    </ul>
                  );
                }
                return (
                  <p key={i} className="text-pretty whitespace-pre-wrap">
                    {renderInline(block)}
                  </p>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              <span className="block h-2 w-2/3 animate-pulse rounded-full bg-foreground/10" />
              <span className="block h-2 w-full animate-pulse rounded-full bg-foreground/10" />
              <span className="block h-2 w-4/5 animate-pulse rounded-full bg-foreground/10" />
            </div>
          )}
          {answer && !loading && (
            <p className="mt-4 text-[10px] leading-relaxed text-muted-foreground">
              AI-generated interpretation of the deterministic CLIMA result. The advisor
              does not calculate or alter scores; guidance is heuristic and requires
              validation through environmental simulation.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/** Minimal inline renderer: **bold** only, no HTML injection. */
function renderInline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") && part.length > 4 ? (
      <strong key={i} className="font-semibold text-foreground">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}
