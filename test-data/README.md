# Test data

- `web.json`, `api.json` — shared data for every environment.
- `<env>/<file>.json` — optional per-environment override. When present it replaces the shared
  file of the same name for that `TEST_ENV` (whole-file override, not a merge).
- Placeholders resolved at read time: `{{uniqueId}}`, `{{firstName}}`, `{{lastName}}`,
  `{{postalCode}}`, `{{email}}`, `{{timestamp}}`, `{{env:VAR_NAME}}`.
- Never put secrets here. Reference them with `{{env:WEB_PASSWORD}}`.
