# Requirement analyses (`specs/requirements/`)

Written by the **requirements-analyst** agent from Jira or Azure DevOps work items.
One file per work item: `<ID>-analysis.md`. A multi-item query also gets `<query-name>-summary.md`.

Each analysis holds: restated story, acceptance criteria (Given/When/Then) with testability,
open questions for the product owner, mapping to existing page objects / API clients / test data,
test ideas with tags, a duplicate check, risks, a readiness verdict and a hand-off prompt.

## Duplicate check (before any plan is created)

Before handing over to the planner, the analyst checks whether the framework already has each
test idea. It searches:

- `tests/web/` and `tests/api/` specs: titles, `describe` names and assertions (matched on behaviour,
  not only on title words).
- Data-driven rows in `test-data/*.json`.
- Existing plans in `specs/*-plan.md`.

Each test idea gets one status, with evidence (`path:line` and test title):

| Status | Meaning | What happens |
|---|---|---|
| `Covered` | An existing test checks the same steps and expected result. | Not planned. No duplicate test. |
| `Partial` | A test exists but misses an AC, value, negative path or assertion. | Planner plans only the gap; extend the named test. |
| `Planned` | Scenario is in a `specs/*-plan.md` but no test exists yet. | Goes to the generator, not the planner. |
| `New` | Nothing found. | Planner creates it. |

If every idea is `Covered`, the verdict is `Already covered` and there is no hand-off.
The planner only receives `New` and `Partial` scenarios.

## Flow

```
analyst ─▶ specs/requirements/<ID>-analysis.md ─▶ duplicate check
             ├─ all Covered ──────────▶ stop (report covering tests)
             ├─ Planned ──────────────▶ generator ─▶ tests/
             └─ New / Partial ────────▶ planner ─▶ specs/<feature>-plan.md ─▶ generator ─▶ tests/
```

Never include secrets or personal data from tickets.
