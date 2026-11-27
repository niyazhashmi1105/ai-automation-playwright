// Coverage gate for the E2E framework. No dependencies.
//  C1  Every test has exactly one of @smoke/@regression and at least one of @web/@api/@e2e.
//  C2  Every public method of a page object, component or API client is used somewhere
//      (a spec, a fixture, or another page object). Unused methods are dead or untested code.
//      With --base <ref> (PR mode) only methods added/changed since <ref> fail; older gaps warn.
//      Without --base every unused method fails.
// Usage: node scripts/check-coverage.js [--base origin/main]   (exit 1 on any gap)
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const rel = (f) => path.relative(ROOT, f).split(path.sep).join('/');
const problems = [];
const warnings = [];
const baseIdx = process.argv.indexOf('--base');
const BASE = baseIdx > -1 ? process.argv[baseIdx + 1] : null;

// Lines added/changed since BASE, per file: Map<relPath, Set<lineNo>>.
function changedLines(base) {
  const diff = execFileSync('git', ['diff', '-U0', '--no-color', `${base}...HEAD`, '--', 'src'], { cwd: ROOT, encoding: 'utf8' });
  const map = new Map();
  let file = null;
  for (const l of diff.split('\n')) {
    if (l.startsWith('+++ ')) file = l.startsWith('+++ b/') ? l.slice(6) : null;
    const h = l.match(/^@@ -\S+ \+(\d+)(?:,(\d+))? @@/);
    if (h && file) {
      const start = Number(h[1]);
      const count = h[2] === undefined ? 1 : Number(h[2]);
      if (!map.has(file)) map.set(file, new Set());
      for (let n = start; n < start + count; n++) map.get(file).add(n);
    }
  }
  return map;
}
const changed = BASE ? changedLines(BASE) : null;

// ---- C1: tags, from the real Playwright test list (includes data-driven tests) ----
const EXEMPT_FILES = new Set(['web/seed.spec.ts']); // planner seed, see CLAUDE.md
const EXEMPT_PROJECTS = new Set(['setup']);

const listJson = execFileSync('npx', ['playwright', 'test', '--list', '--reporter=json'], {
  cwd: ROOT,
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024,
  stdio: ['ignore', 'pipe', 'inherit'],
});
const list = JSON.parse(listJson);
const tests = [];
const walkSuite = (s, file) => {
  for (const sp of s.specs ?? []) {
    for (const t of sp.tests) tests.push({ project: t.projectName, file, line: sp.line, title: sp.title, tags: sp.tags });
  }
  for (const c of s.suites ?? []) walkSuite(c, file);
};
for (const s of list.suites ?? []) walkSuite(s, s.file);

const seen = new Set();
for (const t of tests) {
  if (EXEMPT_PROJECTS.has(t.project) || EXEMPT_FILES.has(t.file)) continue;
  const key = `${t.file}:${t.line}:${t.title}`;
  if (seen.has(key)) continue; // same test in several browser projects
  seen.add(key);
  const level = t.tags.filter((x) => x === 'smoke' || x === 'regression');
  const layer = t.tags.filter((x) => x === 'web' || x === 'api' || x === 'e2e');
  if (level.length !== 1) problems.push(`tests/${t.file}:${t.line}  [C1 tags] "${t.title}" needs exactly one of @smoke/@regression`);
  if (layer.length < 1) problems.push(`tests/${t.file}:${t.line}  [C1 tags] "${t.title}" needs @web, @api or @e2e`);
}

// ---- C2: public methods of page objects / components / API clients are used ----
function walk(dir) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return [];
  return fs.readdirSync(abs, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(abs, e.name);
    return e.isDirectory() ? walk(path.join(dir, e.name)) : e.name.endsWith('.ts') ? [p] : [];
  });
}
const owners = [...walk('src/pages'), ...walk('src/components'), ...walk('src/api')].filter((f) => {
  const b = path.basename(f);
  return !b.startsWith('Base') && b !== 'index.ts' && b !== 'schemas.ts';
});
const usageFiles = [...walk('src'), ...walk('tests')];
const contents = new Map(usageFiles.map((f) => [f, fs.readFileSync(f, 'utf8')]));

const METHOD = /^\s{2}(?:public\s+)?(?:async\s+)?(?:get\s+)?([a-zA-Z_]\w*)\s*\([^)]*\)?[^;]*\{\s*$/;
const SKIP = new Set(['constructor', 'if', 'for', 'while', 'switch', 'catch', 'function']);
let methodCount = 0;
for (const f of owners) {
  const lines = contents.get(f).split('\n');
  lines.forEach((line, i) => {
    if (/^\s*(private|protected|static|readonly)\b/.test(line)) return;
    const m = line.match(METHOD);
    if (!m || SKIP.has(m[1])) return;
    methodCount++;
    const name = m[1];
    const use = new RegExp(`\\.${name}\\b`);
    const used = usageFiles.some((u) => {
      const text = contents.get(u);
      return u === f ? (text.match(new RegExp(`this\\.${name}\\b`, 'g')) ?? []).length > 0 : use.test(text);
    });
    if (used) return;
    const msg = `${rel(f)}:${i + 1}  [C2 unused] ${name}() is never used by a test, fixture or page`;
    const isNew = !changed || (changed.get(rel(f)) ?? new Set()).has(i + 1);
    (isNew ? problems : warnings).push(msg);
  });
}

if (warnings.length) {
  console.warn(`⚠ ${warnings.length} existing gap(s), not added by this change:`);
  for (const w of warnings) console.warn(`  ${w}`);
}
if (problems.length) {
  console.error(`✖ ${problems.length} coverage gap(s):`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log(`✔ coverage OK (${seen.size} tests tagged, ${methodCount} page/component/client methods used)`);
