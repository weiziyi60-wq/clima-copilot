# CLIMA: Climate Design Companion

Build a polished web application called "CLIMA".

CLIMA is an AI-powered sustainable design copilot for architects and designers. It provides rapid early-stage environmental feedback based on basic architectural design parameters.

The product should feel like a professional ClimateTech / PropTech SaaS platform rather than a student project.

Create a clean, minimal and sophisticated interface with generous whitespace, strong typography, subtle environmental visual cues, and an architecture-focused aesthetic.

Create two main views:

1. LANDING PAGE

Hero section:

CLIMA

AI Sustainable Design Copilot

Headline:

Design with climate, before simulation.

Supporting text:

Rapid, explainable sustainability feedback for early-stage architectural decisions.

Primary button:

Analyse a Design

Include a simple section explaining:

Input design parameters → Analyse environmental performance → Improve the design

2. ANALYSIS DASHBOARD

Create a project input panel with:

- Location

  Default: Singapore

- Building Type

  Residential

  Office

  Mixed-use

- Primary Orientation

  North-South

  East-West

  Northeast-Southwest

  Northwest-Southeast

- Window-to-Wall Ratio

  Slider from 20% to 80%

  Default 50%

- External Shading

  None

  Horizontal

  Vertical

  Mixed

- Natural Ventilation Strategy

  Yes / No

- Greenery Integration

  Low / Medium / High

Add a primary button:

Analyse Design

On the results side create placeholder components for:

- Overall Sustainability Score /100

- Solar Control

- Daylight

- Natural Ventilation

- Envelope Performance

- Energy Potential

Below the scores create:

KEY RISKS

and

AI RECOMMENDATIONS

Use placeholder content for now.

Do not implement real AI functionality or complex calculations yet.

Focus on creating the complete responsive frontend interface and interaction structure.

The application should look credible enough to present as an early-stage ClimateTech startup prototype.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://clima-copilot.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/608318bc-7041-401c-aa63-1220387f110b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
