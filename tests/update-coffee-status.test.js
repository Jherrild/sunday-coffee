'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');

const root = path.resolve(__dirname, '..');
const originalHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const workflow = fs.readFileSync(path.join(root, '.github/workflows/update-coffee-status.yml'), 'utf8');

// Run the actual workflow's mutation step, never its push/PR/merge steps.
// Freeze the clock in each Node process, including the old inline implementation.
function runUpdate(t, instant, status, timeZone = 'UTC') {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'coffee-test-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.writeFileSync(path.join(dir, 'index.html'), originalHtml);
  for (const name of fs.readdirSync(root).filter(name => name.endsWith('.js'))) {
    fs.copyFileSync(path.join(root, name), path.join(dir, name));
  }
  const clockPath = path.join(dir, 'clock.cjs');
  fs.writeFileSync(clockPath, `
    const RealDate = Date;
    global.Date = class extends RealDate {
      constructor(...args) { super(...(args.length ? args : [process.env.TEST_NOW])); }
      static now() { return new RealDate(process.env.TEST_NOW).getTime(); }
    };
  `);
  const step = workflow.split('      - name: Calculate next Sunday and update files\n')[1]
    .split('\n      - name: ')[0];
  const script = step.split('        run: |\n')[1]
    .split('\n').map(line => line.replace(/^          /, '')).join('\n')
    .replaceAll('${{ inputs.coffee_status }}', String(status));
  const outputPath = path.join(dir, 'outputs');
  const result = spawnSync('bash', ['-e', '-o', 'pipefail', '-c', script], {
    cwd: dir,
    encoding: 'utf8',
    env: {
      ...process.env,
      TZ: timeZone,
      TEST_NOW: instant,
      COFFEE_STATUS: String(status),
      GITHUB_OUTPUT: outputPath,
      NODE_OPTIONS: `--require=${clockPath}`,
    },
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const outputs = Object.fromEntries(fs.readFileSync(outputPath, 'utf8').trim()
    .split('\n').map(line => {
      const equals = line.indexOf('=');
      return [line.slice(0, equals), line.slice(equals + 1)];
    }));
  return { html: fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), outputs };
}

function assertUpdate(result, status, sunday, branchDate, lastUpdated) {
  assert.equal(result.outputs.next_sunday, sunday);
  assert.equal(result.outputs.branch_date, branchDate);
  assert.ok(result.html.includes(`<div class="date">${sunday}</div>`));
  assert.ok(result.html.includes(`<strong>Last updated:</strong> ${lastUpdated}`));
  assert.match(result.html, new RegExp(`^<body class="status-${status ? 'on' : 'off'}">`, 'm'));
  // Examples inside HTML comments must remain untouched.
  assert.deepEqual(result.html.match(/<!--[\s\S]*?-->/g), originalHtml.match(/<!--[\s\S]*?-->/g));
}

test('Saturday evening Pacific targets tomorrow, even though the runner is already on Sunday', t => {
  const result = runUpdate(t, '2026-09-20T03:03:47Z', true);
  assertUpdate(result, true, 'Sunday, September 20, 2026', '2026-09-20', 'September 19, 2026');
});

test('Sunday before 9:30 AM Pacific targets today', t => {
  const result = runUpdate(t, '2026-09-20T16:29:59Z', false);
  assertUpdate(result, false, 'Sunday, September 20, 2026', '2026-09-20', 'September 20, 2026');
});

const boundaryCases = [
  ['before summer UTC rollover', '2026-09-19T16:59:59-07:00', 'September 20, 2026', '2026-09-20', 'September 19, 2026'],
  ['at summer UTC rollover', '2026-09-19T17:00:00-07:00', 'September 20, 2026', '2026-09-20', 'September 19, 2026'],
  ['Saturday just before midnight', '2026-09-19T23:59:59-07:00', 'September 20, 2026', '2026-09-20', 'September 19, 2026'],
  ['Sunday midnight', '2026-09-20T00:00:00-07:00', 'September 20, 2026', '2026-09-20', 'September 20, 2026'],
  ['exact Sunday cutoff', '2026-09-20T09:30:00-07:00', 'September 27, 2026', '2026-09-27', 'September 20, 2026'],
  ['just after Sunday cutoff', '2026-09-20T09:30:01-07:00', 'September 27, 2026', '2026-09-27', 'September 20, 2026'],
  ['Sunday evening', '2026-09-20T23:59:59-07:00', 'September 27, 2026', '2026-09-27', 'September 20, 2026'],
  ['Monday midnight', '2026-09-21T00:00:00-07:00', 'September 27, 2026', '2026-09-27', 'September 21, 2026'],
  ['winter Saturday evening', '2026-01-10T16:00:00-08:00', 'January 11, 2026', '2026-01-11', 'January 10, 2026'],
  ['winter before cutoff', '2026-01-11T09:29:59-08:00', 'January 11, 2026', '2026-01-11', 'January 11, 2026'],
  ['winter exact cutoff', '2026-01-11T09:30:00-08:00', 'January 18, 2026', '2026-01-18', 'January 11, 2026'],
  ['spring DST Saturday', '2026-03-07T23:59:59-08:00', 'March 8, 2026', '2026-03-08', 'March 7, 2026'],
  ['spring DST before cutoff', '2026-03-08T09:29:59-07:00', 'March 8, 2026', '2026-03-08', 'March 8, 2026'],
  ['spring DST cutoff', '2026-03-08T09:30:00-07:00', 'March 15, 2026', '2026-03-15', 'March 8, 2026'],
  ['fall DST first repeated hour', '2026-11-01T01:30:00-07:00', 'November 1, 2026', '2026-11-01', 'November 1, 2026'],
  ['fall DST second repeated hour', '2026-11-01T01:30:00-08:00', 'November 1, 2026', '2026-11-01', 'November 1, 2026'],
  ['fall DST cutoff', '2026-11-01T09:30:00-08:00', 'November 8, 2026', '2026-11-08', 'November 1, 2026'],
  ['year rollover', '2022-12-31T23:59:59-08:00', 'January 1, 2023', '2023-01-01', 'December 31, 2022'],
  ['leap day', '2024-02-29T20:00:00-08:00', 'March 3, 2024', '2024-03-03', 'February 29, 2024'],
];

for (const timeZone of ['UTC', 'America/Los_Angeles', 'Asia/Tokyo']) {
  for (const status of [true, false]) {
    for (const [label, instant, sunday, branchDate, lastUpdated] of boundaryCases) {
      test(`${label}: status=${status}, runner=${timeZone}`, t => {
        assertUpdate(runUpdate(t, instant, status, timeZone), status,
          `Sunday, ${sunday}`, branchDate, lastUpdated);
      });
    }
  }
}

test('the standalone script uses the same Pacific dates for HTML and branch naming', t => {
  const vm = require('node:vm');
  const { createRequire } = require('node:module');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'coffee-local-test-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.writeFileSync(path.join(dir, 'index.html'), originalHtml);
  const commands = [];
  const localRequire = createRequire(path.join(root, 'update-status.js'));
  // Only exercise date wiring; existing git publishing is stubbed, never executed.
  vm.runInNewContext(`
    const RealDate = Date;
    Date = class extends RealDate {
      constructor(...args) { super(...(args.length ? args : ['2026-09-20T03:03:47Z'])); }
    };
    ${fs.readFileSync(path.join(root, 'update-status.js'), 'utf8').replace(/^#!.*\n/, '')}
  `, {
    __dirname: dir,
    console: { log() {}, error() {} },
    process: { argv: ['node', 'update-status.js', 'true'], exit(code) { throw new Error(`exit ${code}`); } },
    require(name) {
      if (name === 'child_process') return { execSync(command) { commands.push(command); return 'test'; } };
      return localRequire(name);
    },
  });
  assert.ok(commands.includes('git checkout -b 2026-09-20'), commands.join('\n'));
  const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
  assert.ok(html.includes('<div class="date">Sunday, September 20, 2026</div>'));
  assert.ok(html.includes('<strong>Last updated:</strong> September 19, 2026'));
});
