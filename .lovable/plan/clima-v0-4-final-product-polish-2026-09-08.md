# CLIMA V0.4 — Final Product Polish

## Scope
Refine the existing interface and wording only. Preserve the deterministic scoring engine, Ask CLIMA architecture and guardrails, supported inputs, and all current functionality.

## Implementation
1. **Comparison hierarchy and density**
   - Recompose the comparison summary around a clear `Option A → Option B` score sequence, with the point difference as a dominant editorial element on desktop and mobile.
   - Tighten the Option B editor and result spacing without removing inputs, score categories, changes, or interpretation.
   - Make changed-parameter rows compact and mobile-safe.

2. **Deterministic interpretation**
   - Keep comparison prose rule-based and based only on existing score/category deltas.
   - Prioritise the largest category movements, group shared parameter context to avoid repetition, and retain careful non-causal wording.

3. **Ask CLIMA and terminology**
   - Use the requested heading and description, with comparison-aware wording when both options are available.
   - Audit visible labels for the required CLIMA terminology and remove abbreviated or inconsistent dimension names where they appear in presentation copy.

4. **Disclaimer**
   - Replace the current repeated disclaimer with one concise statement covering early-stage heuristic exploration/comparison and all required non-simulation, non-regulatory, non-certification, and non-prediction limits.

5. **Responsive polish and verification**
   - Fix mobile wrapping, control sizing, spacing, and alignment across the landing page, dashboard, results, Option B, comparison, and Ask CLIMA.
   - Verify the complete flow at desktop and mobile widths, including Option B editing and comparison output.

## Guardrails
- No changes to `src/lib/clima-scoring.ts` scoring rules, values, thresholds, or calculations; only the exported disclaimer text may be updated.
- No changes to the Ask CLIMA request architecture or AI guardrails.
- No new functionality, data storage, authentication, metrics, locations, building types, certification logic, or simulation.
