// Static checks for the framework rules in CLAUDE.md. No dependencies.
// Usage: node scripts/check-rules.js   (exit 1 on any violation)
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const rel = (f) => path.relative(ROOT, f).split(path.sep).join('/');

function walk(dir, exts) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return [];
  return fs.readdirSync(abs, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return walk(p, exts);
    return exts.some((x) => e.name.endsWith(x)) ? [path.join(ROOT, p)] : [];
  });
}

const violations = [];
const report = (file, line, rule, msg) => violations.push({ file: rel(file), line, rule, msg });

function eachLine(file, fn) {
  fs.readFileSync(file, 'utf8')
    .split('\n')
    .forEach((text, i) => {
      const code = text.replace(/\/\/.*$/, ''); // ignore line comments
      fn(code, i + 1, text);
    });
}

const specs = walk('tests', ['.spec.ts']);
const srcAndTests = [...walk('src', ['.ts']), ...walk('tests', ['.ts']), ...walk('config', ['.ts'])];
const PW_LOCATOR = /\.(locator|getByTestId|getByRole|getByText|getByLabel|getByPlaceholder|getByAltText|getByTitle|frameLocator)\(|page\.\$\$?\(/;

// R1 + R2: specs import only from src/fixtures; no raw selectors in specs.
for (const f of specs) {
  eachLine(f, (code, n) => {
    const m = code.match(/\bfrom\s+['"]([^'"]+)['"]/);
    if (m && m[1].startsWith('.') && !/\/src\/fixtures$/.test(m[1])) {
      report(f, n, 'R1 spec-imports', `specs import only from src/fixtures (found '${m[1]}')`);
    }
    if (PW_LOCATOR.test(code)) {
      report(f, n, 'R2 raw-selector', 'locators belong in page objects/components, not specs');
    }
  });
}

// R3-R6: across src, tests, config.
for (const f of srcAndTests) {
  eachLine(f, (code, n) => {
    if (/waitForTimeout\s*\(/.test(code)) report(f, n, 'R3 no-wait-for-timeout', 'use web-first assertions / auto-waiting');
    if (/xpath=|locator\(\s*['"`]\s*\/\//.test(code)) report(f, n, 'R4 no-xpath', 'use getByTestId > getByRole > getByLabel/Text > CSS');
    if (/\b(test|describe|it)(\.describe)?\.only\s*\(/.test(code)) report(f, n, 'R5 no-only', 'remove .only before merging');
    if (/\b(password|token|secret|apiKey)\s*[:=]\s*['"`][^'"`{}\s]{4,}['"`]/i.test(code)) {
      report(f, n, 'R6 no-hardcoded-secret', 'secrets come from env ({{env:NAME}} placeholder)');
    }
  });
}

// R6 also for test data JSON: secret-like keys must be "{{env:NAME}}" placeholders.
// Exception: rows with an "expectedError" key are negative cases with deliberately wrong values.
const SECRET_KEY = /^(password|token|secret|apiKey)$/i;
function scanJson(file, node, trail) {
  if (Array.isArray(node)) return node.forEach((v, i) => scanJson(file, v, `${trail}[${i}]`));
  if (!node || typeof node !== 'object') return;
  const negative = Object.prototype.hasOwnProperty.call(node, 'expectedError');
  for (const [k, v] of Object.entries(node)) {
    if (typeof v === 'string' && SECRET_KEY.test(k) && v !== '' && !negative && !/^\{\{env:\w+\}\}$/.test(v)) {
      report(file, 0, 'R6 no-hardcoded-secret', `${trail}.${k}: use "{{env:NAME}}" placeholder`);
    }
    scanJson(file, v, `${trail}.${k}`);
  }
}
for (const f of walk('test-data', ['.json'])) scanJson(f, JSON.parse(fs.readFileSync(f, 'utf8')), '$');

// R7: page objects extend BasePage.
for (const f of walk('src/pages', ['.ts'])) {
  const name = path.basename(f);
  if (name === 'BasePage.ts' || name === 'index.ts') continue;
  if (!/extends\s+BasePage\b/.test(fs.readFileSync(f, 'utf8'))) {
    report(f, 1, 'R7 extends-basepage', 'page objects must extend BasePage');
  }
}

// R8: every test has tags (via test(title, { tag: [...] })) — checked in check-coverage.js from the
// Playwright test list, which sees data-driven tests too.

if (violations.length) {
  console.error(`✖ ${violations.length} rule violation(s):`);
  for (const v of violations) console.error(`  ${v.file}:${v.line}  [${v.rule}] ${v.msg}`);
  process.exit(1);
}
console.log(`✔ rules OK (${specs.length} specs, ${srcAndTests.length} TS files checked)`);
