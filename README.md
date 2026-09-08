# CLIMA — AI Sustainable Design Copilot

> **Design with climate, before simulation.**

CLIMA is an early-stage AI decision-support prototype for climate-responsive architectural design.

It helps architects rapidly evaluate basic design decisions, compare alternatives, identify climate-related risks, and receive context-aware design guidance before moving into detailed environmental simulation.

**Live Demo:** https://clima-copilot.lovable.app

---

## Why CLIMA?

Early architectural decisions — such as façade orientation, glazing ratio, external shading, and ventilation strategy — can strongly influence environmental performance.

However, detailed simulation is often introduced later in the design process.

CLIMA explores a simple question:

> **Can designers receive structured, explainable climate feedback while design decisions are still flexible?**

The prototype is designed as an early-stage screening and decision-support tool rather than a replacement for professional building-performance simulation.

---

## Product Principle

### Rules calculate. AI interprets. Designers decide.

CLIMA deliberately separates quantitative assessment from generative AI.

A deterministic scoring engine evaluates every design using the same predefined framework. The AI layer receives the design inputs and calculated results as read-only context, then helps the designer interpret them and explore potential improvements.

This hybrid architecture makes the assessment more consistent, transparent, and explainable than relying on an LLM to generate both the evaluation and the advice.

---

## Core Features

### 1. Climate Responsiveness Assessment

Designers provide a small set of early-stage architectural parameters:

- Primary glazed façade orientation
- Window-to-wall ratio
- External shading strategy
- Natural ventilation strategy
- Greenery integration

CLIMA evaluates the design across five dimensions:

- Solar Control
- Daylight Potential
- Natural Ventilation Potential
- Envelope Strategy
- Energy Potential

These are combined into a **Climate Responsiveness Score /100** for rapid option screening.

---

### 2. Compare Design Options

CLIMA allows designers to compare an existing design (Option A) with an alternative design (Option B).

Both options are evaluated using the same deterministic scoring engine.

The comparison identifies:

- Overall score difference
- Subscore changes
- Modified design parameters
- Deterministic explanations of why the design performs differently

This supports rapid A/B testing during early-stage design iteration.

---

### 3. Ask CLIMA

Ask CLIMA is a context-aware AI design advisor.

Instead of asking a general-purpose chatbot to assess a building from scratch, the AI receives structured context including:

- Design parameters
- Precomputed Climate Responsiveness Score
- Five assessment subscores
- Option comparison results when available

The AI then helps interpret the assessment, identify priorities, discuss trade-offs, and suggest potential design interventions.

The AI does **not** calculate or modify the deterministic score.

---

## AI Guardrails

CLIMA is intentionally designed to prevent the generative AI layer from presenting unsupported quantitative claims.

Ask CLIMA is instructed not to invent:

- Energy savings percentages
- Cooling loads
- Carbon reductions
- RETV values
- Daylight simulation results
- Green Mark ratings or certification outcomes

When a question requires detailed building-performance analysis, the system explains that simulation or professional assessment would be required.

---

## Assessment Framework

The current prototype is configured for early-stage residential design in Singapore's hot-humid climate.

The heuristic framework considers relationships between:

**Orientation → solar exposure**

**Window-to-wall ratio → daylight, solar exposure, and envelope sensitivity**

**External shading → solar protection**

**Ventilation strategy → passive cooling potential**

**Combined design characteristics → early-stage energy potential**

The framework is informed by tropical climate-responsive design principles and Singapore building-performance guidance.

It is designed for **consistent comparison between early design options**, not prediction of actual building performance.

---

## Example Design Iteration

An example test demonstrates how CLIMA supports design iteration.

**Option A**

- West-facing primary glazed façade
- 75% WWR
- No external shading
- No intentional natural ventilation strategy

Climate Responsiveness Score: **23 / 100 — High Climate Risk**

**Option B**

- West-facing primary glazed façade
- 45% WWR
- Mixed external shading
- Cross ventilation

Climate Responsiveness Score: **83 / 100 — Good Potential**

CLIMA then explains which assessment dimensions improved and allows the designer to ask follow-up questions about priorities and design trade-offs.

---

## System Architecture

```text
Architectural Design Inputs
          ↓
Deterministic Assessment Engine
          ↓
Climate Responsiveness Score
+ Five Subscores
          ↓
Option Comparison
          ↓
Structured Context
          ↓
Generative AI Advisor
          ↓
Explainable Design Guidance
