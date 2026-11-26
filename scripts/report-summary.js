// Print a Markdown summary of a Playwright JSON report. Used by CI for the job summary.
// Usage: node scripts/report-summary.js results.json >> "$GITHUB_STEP_SUMMARY"
const fs = require('node:fs');

const file = process.argv[2] ?? 'results.json';
const { stats } = JSON.parse(fs.readFileSync(file, 'utf-8'));

const lines = [
  '## Playwright results',
  '',
  `Environment: \`${process.env.TEST_ENV ?? 'qa'}\` · Filter: \`${process.env.GREP || 'all'}\``,
  '',
  '| Passed | Failed | Flaky | Skipped | Duration |',
  '|---|---|---|---|---|',
  `| ${stats.expected} | ${stats.unexpected} | ${stats.flaky} | ${stats.skipped} | ${(stats.duration / 1000).toFixed(1)}s |`,
  '',
  stats.unexpected > 0 ? ':x: Failures found. ' : ':white_check_mark: All tests passed. ',
  'Download the **playwright-report** artifact for the full HTML report.',
];
process.stdout.write(lines.join('\n') + '\n');
