# Test plans (`specs/`)

Markdown test plans written by the **planner** agent (or by hand) and consumed by the
**generator** agent. One file per feature area.

Format rules (match `checkout-plan.md`):

- Header: application, seed file, tags to apply.
- `### N. Suite name` then `#### N.M Scenario name`.
- Each scenario: **Steps** (numbered, user language) and **Expected** (observable results).
- Name the test data source (`test-data/web.json` → key) instead of inlining values.
- Never include secrets.

Generated specs land in `tests/web/` (or `tests/api/`) and must follow `CLAUDE.md`.
