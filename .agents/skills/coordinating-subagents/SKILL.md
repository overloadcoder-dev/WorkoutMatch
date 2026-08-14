---
name: coordinating-subagents
description: Use when work has genuinely independent areas that can run concurrently or when medium-or-higher hallucination risk needs independent verification
---

# Coordinating Subagents

Use subagents to isolate independent work or independent verification—not to add ceremony to small, tightly connected tasks. The main agent owns scope, integration, and the final claim.

## Independence Test

Parallelize only when every workstream has:

- a distinct deliverable and clear completion condition;
- enough context to work without following another stream’s intermediate decisions;
- separate files, read-only analysis, or otherwise non-conflicting state;
- value even if another stream finishes later.

Examples include separate UI, SEO, test, and performance investigations when their boundaries are already defined. Keep one agent for a small component, a tightly coupled refactor, shared state design, or edits likely to touch the same files.

## Worker Brief

Give each worker the goal, exact scope, relevant paths, constraints, known evidence, allowed writes, required checks, and expected return format. Workers should return:

1. files or evidence inspected;
2. changes made, if authorized;
3. commands run and observed results;
4. assumptions and unresolved risks.

Review returned work, inspect the actual shared files, resolve conflicts, and run integrated checks. A worker summary is not proof that its edits or tests succeeded.

## Hallucination-Risk Verification

Use a separate read-only verifier when risk is medium or high. Indicators include unfamiliar or version-sensitive APIs, ambiguous repository conventions, security or privacy impact, production SEO or deployment configuration, uncertain external facts, generated configuration, and completion claims lacking direct evidence.

The verifier receives a concrete claim or proposed change—not a vague request to “review everything.” Require:

- paths, documentation, or outputs inspected;
- commands run and exact observations;
- whether each claim is supported, contradicted, or still uncertain;
- confidence and the smallest remaining verification step.

For high-risk decisions, consider two independent evidence sources or verifiers when the cost is proportionate. Verification remains read-only unless the main agent explicitly authorizes a follow-up fix.

## Integration Rules

- Never allow parallel writers to edit the same file.
- Do not accept majority opinion over stronger evidence.
- If worker and verifier disagree, reproduce the evidence and resolve the discrepancy before proceeding.
- Cancel or redirect work that becomes coupled after discovery.
- Report which conclusions came from direct checks, independent verification, or inference.
