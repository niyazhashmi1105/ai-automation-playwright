# AI-Automation-E2E-Framework

End-to-end automation framework for a web app and a REST API, built on **Playwright Test** and
**TypeScript (strict)**. One runner covers UI, API and hybrid tests. CI runs on GitHub Actions.

- Web target: `https://www.saucedemo.com` (test-id attribute `data-test`)
- API target: `https://jsonplaceholder.typicode.com`
- Environments: `qa`, `staging` (select with `TEST_ENV`)

## Architecture

```
                         ┌──────────────────────────────┐
                         │          tests/  (specs)     │
                         │  setup/  web/  api/          │
                         └──────────────┬───────────────┘
                                        │ import only
                         ┌──────────────▼───────────────┐
                         │   src/fixtures  (mergeTests) │
                         │  page · api · data fixtures  │
                         └───┬──────────┬───────────┬───┘
                             │          │           │
               ┌─────────────▼──┐ ┌─────▼──────┐ ┌──▼──────────────┐
               │ src/pages      │ │ src/api    │ │ src/utils       │
               │  BasePage      │ │ BaseApi-   │ │ readJson, step, │
               │  + components  │ │ Client     │ │ logger, schema  │
               └───────┬────────┘ └─────┬──────┘ └──┬──────────────┘
                       │                │           │
                 Web app (UI)       REST API     test-data/*.json
                                                  config/env (.env)
```

## Folder tree

```
config/
  env.ts               typed env loader (process env > .env > config/env/.env.<TEST_ENV>)
  constants.ts         routes, tags, timeouts, paths
  env/.env.qa|staging  non-secret URLs per environment
src/
  pages/               BasePage + one class per screen, index.ts barrel
  components/          Header, SideMenu, ErrorBanner (composed into pages)
  api/                 BaseApiClient, PostsClient, UsersClient, schemas.ts
  fixtures/            page / api / data fixtures, merged in index.ts
  utils/               dataReader, helpers, logger, randomData, schemaValidator
  types/               interfaces for test data and API models
test-data/             web.json, api.json (+ optional <env>/ overrides)
tests/
  setup/auth.setup.ts  logs in once, saves .auth/user.json
  web/                 login, inventory, cart, checkout, hybrid, seed
  api/                 posts, users, schemaValidator
specs/                 Markdown test plans (planner agent format)
scripts/               CI helpers (report summary)
.github/workflows/     playwright.yml
.claude/agents/, .mcp.json   Agents + MCP servers (playwright-test, atlassian, azure-devops)
CLAUDE.md              rules for AI agents
```

## Design decisions

| Decision | Why |
|---|---|
| Specs import only from `src/fixtures` | One stable surface; refactors inside `src/` don't touch specs. |
| Page objects + components, no selectors in specs | Selector changes fixed in one place; specs read as user intent. |
| `getByTestId` first (`data-test`) | Most stable locator; role/label next; never XPath. |
| `step()` wrapper in page objects and API client | HTML report and trace read as business steps. |
| Auth via setup project + `storageState` | Log in once; web tests start authenticated and run in parallel. |
| API fixture has its own `APIRequestContext` on `API_BASE_URL` | API calls work inside web tests (hybrid) regardless of the page `baseURL`. |
| `ApiResponse<T>` never throws on non-2xx | Negative tests assert on `status` directly. |
| JSON test data + `{{placeholder}}` resolver | Data-driven rows, unique values per run, secrets via `{{env:VAR}}`. |
| Light in-house schema validator | Contract checks without adding a runtime dependency. |
| dotenv only runtime dependency | Small surface, fast `npm ci`. |
| Blob reports + merge job in CI | Shards and API job combine into one HTML report. |

## Quick start

```bash
npm ci
npx playwright install --with-deps chromium
cp .env.example .env          # optional: demo password already in config/env/
npm run typecheck
npm test                      # everything
```

| Script | What it does |
|---|---|
| `npm test` | All projects (setup, web-chromium, api) |
| `npm run test:web` | Web tests (runs auth setup first) |
| `npm run test:api` | API tests only, no browser |
| `npm run test:smoke` / `test:regression` | Filter by tag |
| `npm run test:headed` / `test:debug` / `test:ui` | Local debugging |
| `npm run report` | Open the last HTML report |
| `npm run codegen` | Record locators against the web app |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run agents:init` | Regenerate Playwright Test Agents for Claude |

Useful env flags: `TEST_ENV=staging`, `EXTRA_BROWSERS=true` (adds Firefox + Pixel 7 projects),
`LOG_LEVEL=debug` (logs API bodies).

## Tests included

- **Web:** login (valid, data-driven invalid/locked/empty, dismiss error, logout + route guard),
  inventory (catalogue, data-driven sorting, product details), cart (add/remove, badge),
  checkout (full journey with item total / tax / total checks, data-driven form validation),
  hybrid (API user data drives the checkout form).
- **API:** posts (list + schema + response time, get by id, 404, create 201, PUT, PATCH, DELETE,
  data-driven query filters), users (list, get, 404, nested posts, filter), schema validator self-check.

## Playwright Test Agents (analyse → plan → generate → heal)

`npm run agents:init` creates planner, generator and healer agents in `.claude/agents/` and the
`playwright-test` MCP server in `.mcp.json`. In Claude Code:

0. **Analyse** (optional, custom agent) — "Use the requirements-analyst agent to analyse Jira story
   `SHOP-123`" (or an Azure DevOps work item ID, JQL or WIQL query). It reads the story read-only,
   checks acceptance criteria for testability, lists open questions, maps the story to existing
   page objects, tests and data, and writes `specs/requirements/SHOP-123-analysis.md`. It is not
   regenerated by `agents:init`. Connection, via MCP servers in `.mcp.json`:
   - **Jira Cloud** — `atlassian` (Atlassian Rovo remote MCP). Run `/mcp` in Claude Code, pick
     `atlassian`, sign in in the browser (OAuth). No token in the repo.
   - **Azure DevOps Services** — `azure-devops` (`@azure-devops/mcp`, domains core/work/work-items).
     `export ADO_ORG=<org name>` (the part after `dev.azure.com/`) before starting Claude Code; first
     tool call opens a Microsoft sign-in in the browser.
   - **Fallback (Jira Server/DC, Azure DevOps Server, or no MCP):** REST with curl, using
     `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN` or `ADO_ORG_URL`, `ADO_PROJECT`, `ADO_PAT`
     (Work Items Read) from your shell. Never commit them.
   Write tools (create/edit/transition/comment) are denied in `.claude/settings.json`.
1. **Plan** — "Use the playwright-test-planner agent to explore the inventory page and write
   `specs/inventory-plan.md`. Seed: `tests/web/seed.spec.ts`." The planner drives the app from the
   seed (already logged in) and writes a plan like [specs/checkout-plan.md](specs/checkout-plan.md).
   Point it at an analysis file to plan from a story: "...from `specs/requirements/SHOP-123-analysis.md`".
2. **Generate** — "Use the playwright-test-generator agent to implement
   `specs/inventory-plan.md` into `tests/web/`." It follows [CLAUDE.md](CLAUDE.md): fixtures,
   page objects, tags, JSON data.
3. **Heal** — "Use the playwright-test-healer agent to fix failing tests in `tests/web/`." It
   replays failures, repairs locators in page objects and re-runs until green or `fixme`.

Review generated code like any other PR: run `npm run typecheck` and the suite.

## PR review agent and auto-merge

```
feature/* PR ─▶ PR Review Agent (pr-review.yml)
                 gates: typecheck · framework rules · coverage · discovery
                 Claude review vs CLAUDE.md ─▶ inline + summary comments, verdict
                   ├─ REQUEST_CHANGES ─▶ check fails, auto-merge off ─▶ author pushes fix ─┐
                   └─ APPROVE ─▶ auto-merge (squash) when all required checks are green    │
reviewer comments ─▶ PR Comment Fix Agent (pr-address-comments.yml)                        │
                 holds auto-merge, edits code, runs `npm run verify`, pushes, replies ─────┘ (re-review)
```

- Gates locally: `npm run verify`. Review locally: "Use the pr-reviewer agent on my branch".
- Coverage gate (`scripts/check-coverage.js`): every test tagged; public page/component/client
  methods added in the PR must be used by a test. Older unused methods only warn.
- Rules gate (`scripts/check-rules.js`): CLAUDE.md rules R1–R7 (spec imports, raw selectors,
  `waitForTimeout`, XPath, `.only`, hard-coded secrets, `BasePage`).

**One-time GitHub setup**
1. Install the Claude GitHub App (`/install-github-app` in Claude Code) and add secret
   `ANTHROPIC_API_KEY`. Its pushes re-trigger the review.
2. Settings → General → allow auto-merge.
3. Branch protection on `main`: require PR; required checks `AI review`, `Static checks`,
   `API tests`, `Web tests (shard 1/2)`, `Web tests (shard 2/2)`; require conversation resolution;
   require review from Code Owners (`.github/CODEOWNERS`).
4. Optional secret `MERGE_TOKEN` (fine-grained PAT or App token, contents + pull requests write)
   so the merge commit triggers workflows on `main`.

## CI (GitHub Actions)

Workflow: [.github/workflows/playwright.yml](.github/workflows/playwright.yml)

- Triggers: push and PR to `main`, nightly 02:00 UTC, manual dispatch (`test_env`, `grep`).
- PRs run `@smoke` only; push and nightly run everything.
- Jobs: `static-checks` (typecheck + discovery) → `api-tests` and `web-tests` (2 shards, browser
  cache) → `merge-reports` (single HTML report artifact + job summary).
- Concurrency cancels older runs on the same ref.

Repository secrets to add (Settings → Secrets and variables → Actions):

| Secret | Required | Used for |
|---|---|---|
| `WEB_PASSWORD` | no (demo default in `config/env/.env.<env>`) | Overrides the UI login password; required for a real app |
| `API_TOKEN` | no | Sent as `Authorization: Bearer` when set |

## How to extend

| I want to… | Do this |
|---|---|
| Add a screen | `src/pages/NewPage.ts` extends `BasePage` (set `path`, `pageReadyLocator`) → export in `src/pages/index.ts` → add fixture in `src/fixtures/page.fixtures.ts` |
| Add a shared UI part | `src/components/Thing.ts` extends `BaseComponent` → compose into pages |
| Add an API resource | `src/api/ThingClient.ts` extends `BaseApiClient` → schema in `schemas.ts` → types in `src/types` → fixture in `api.fixtures.ts` |
| Add test data | Add to `test-data/*.json` + interface in `src/types/index.ts`; env-specific copy in `test-data/<env>/` |
| Add a data-driven test | Loop JSON rows at module level, one `test()` per row with `row.title` in the name |
| Add an environment | `config/env/.env.<name>` + add the name to `TEST_ENVS` in `config/env.ts` + workflow `test_env` options |
| Add a browser | Set `EXTRA_BROWSERS=true` or add a `webProject(...)` in `playwright.config.ts` |
| Add a tag | Add to `TAGS` in `config/constants.ts`; use in `{ tag: [...] }` |
