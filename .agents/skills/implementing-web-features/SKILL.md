---
name: implementing-web-features
description: Use when implementing or changing web behavior, planning multi-step feature work, adding focused tests, or verifying completion
---

# Implementing Web Features

Make the smallest complete change that satisfies the approved behavior and project conventions.

## Scale the Workflow

- **Mechanical change:** Inspect the target and nearby convention, edit directly, then run the narrowest relevant validation.
- **Contained behavior change:** State the intended behavior, add or update a focused test when the repository supports it, implement, and run related checks.
- **Multi-step feature:** Write a short plan with concrete files, dependencies, and verification. Keep connected work with one agent; route only independent areas through `coordinating-subagents`.

Do not create a specification, worktree, test harness, abstraction, or dependency solely to satisfy process. Do not skip existing project checks merely because a change appears small.

## Implementation

- Inspect adjacent components, utilities, tests, configuration, and package versions before choosing an API or pattern.
- Preserve framework and repository conventions. Prefer semantic HTML and simple browser behavior before adding client state.
- In Vue or Nuxt, keep props, emits, composables, server/client boundaries, and route behavior explicit. Avoid accidental hydration differences and global state for local concerns.
- In Tailwind, reuse established tokens and component patterns; keep class changes readable and avoid broad mechanical rewrites without need.
- Handle relevant loading, empty, failure, retry, cancellation, stale-response, and unsupported states.
- Avoid unrelated refactors. If a necessary boundary is unclear, improve only the part required by the feature.

## Testing and Verification

For behavior changes, prefer the lowest-cost test that proves user-visible behavior or a stable boundary. Watch a new regression test fail for the intended reason when practical; configuration, copy, and mechanical styling may instead use focused validation or inspection.

Run checks in widening order: targeted test or validation, affected package checks, build/type/lint checks, then relevant browser or production-mode checks. Use `web-quality` when accessibility, performance, or SEO is affected.

Before claiming completion:

1. Re-read the request and inspect the final diff or changed files.
2. Run fresh relevant commands and confirm their exit status and output.
3. Separate observed facts from inference.
4. Report changed files, checks run, important results, and anything not verified.

Never claim a build, test, Lighthouse audit, deployment, or live crawl check succeeded unless its current output was observed.
