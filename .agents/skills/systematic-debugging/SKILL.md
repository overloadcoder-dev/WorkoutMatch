---
name: systematic-debugging
description: Use when encountering a bug, failing test, regression, performance anomaly, or unexpected behavior before proposing a fix
---

# Systematic Debugging

Find the cause before changing behavior. Evidence should narrow the problem faster than speculative edits.

## Workflow

### 1. Reproduce

Capture the exact command, input, environment, expected result, observed result, and stable error text. Reduce the reproduction without changing the failure. If it is intermittent, record timing and frequency instead of treating one passing run as resolution.

### 2. Trace

Read the failing path from the boundary inward. Inspect recent changes, logs, state transitions, configuration, and dependency versions. At component or service boundaries, record what enters and leaves. Compare with the nearest working path.

For browser issues, check generated HTML, network requests, console output, hydration, computed styles, event order, and built rather than only development behavior. For SEO or performance regressions, verify the tested URL and environment before trusting an audit score.

### 3. Hypothesize

State one falsifiable explanation:

> Because evidence A differs from the working case at boundary B, changing or instrumenting C should produce result D.

Test one variable at a time. If the result contradicts the hypothesis, discard it and form another from the new evidence. Do not stack speculative fixes.

### 4. Correct

Create the smallest regression check that reproduces the defect when practical. Make one focused correction at the source rather than masking symptoms downstream. Avoid unrelated cleanup until the behavior is stable.

### 5. Verify

Run the original reproduction, the regression check, nearby tests, and the relevant broader check. Remove temporary instrumentation. Report the root cause, evidence, correction, observed verification, and any environment not tested.

## Stop Conditions

Pause and reassess when three attempted corrections fail, the reproduction is not stable, required environment data is missing, or evidence points outside the authorized scope. Use `coordinating-subagents` for an independent verifier when uncertainty or hallucination risk is medium or higher.
