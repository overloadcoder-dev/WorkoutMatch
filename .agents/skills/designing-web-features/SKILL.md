---
name: designing-web-features
description: Use when unresolved product or technical choices could materially change a browser feature, interface, user flow, or client-side behavior
---

# Designing Web Features

Design the shortest web experience that fully serves the user. Scale the process to uncertainty and risk.

## Choose the Design Level

- **Mechanical:** Copy, spacing, obvious styling, or exact-spec changes need no design workflow.
- **Contained:** Inspect the relevant UI and conventions, state the proposed behavior and verification briefly, then proceed unless a material choice remains.
- **Cross-cutting:** For new flows, shared state, data boundaries, or architectural changes, present a focused design and get approval before implementation.

Ask only questions whose answers could change the result. Prefer one recommended approach; add alternatives only when they represent genuine trade-offs.

## Design Checks

Use only checks relevant to the feature:

- Define the user goal, entry point, shortest successful path, and recovery path.
- Assign component and state ownership. Account for loading, empty, error, retry, cancellation, and stale responses.
- Design mobile-first behavior and verify touch, mouse, keyboard, zoom, and responsive content order.
- Prefer semantic HTML and progressive enhancement. JavaScript should add capability rather than repair an unclear document structure.
- Keep framework boundaries replaceable. Vue or Nuxt components should receive explicit inputs and emit clear outcomes; vanilla implementations should use the same separation of markup, state, and effects.
- Use Tailwind utilities consistently with the project’s tokens and component patterns. Avoid arbitrary values when an established token expresses the intent.
- Identify privacy, browser compatibility, network, rendering, hydration, and bundle risks that could change the design.

## Design Output

For contained work, a short conversational proposal is enough. For substantial work, record scope, flow, ownership, key states, failure behavior, risks, and verification. Do not duplicate implementation steps or create documentation merely for ceremony.
