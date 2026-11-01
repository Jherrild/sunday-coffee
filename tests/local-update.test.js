'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');
const root = path.resolve(__dirname, '..');

// Exercise the real CLI and git, using only disposable repositories and a FILE remote.
function fixture(t) {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'coffee-cli-'));
  t.after(() => fs.rmSync(temp, { recursive: true, force: true }));
  const repo = path.join(temp, 'repo');
  const origin = path.join(temp, 'origin.git');
  fs.mkdirSync(repo);
  const env = { ...process.env, GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_SYSTEM: '/dev/null',
    GIT_CONFIG_NOSYSTEM: '1', GIT_TERMINAL_PROMPT: '0', GIT_ALLOW_PROTOCOL: 'file' };
  const git = (...args) => {
    const result = spawnSync('git', args, { cwd: repo, env, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    return result.stdout;
  };
  git('init', '-b', 'main');
  git('config', 'user.name', 'Coffee Test');
  git('config', 'user.email', 'coffee-test@example.invalid');
  git('config', 'core.hooksPath', path.join(temp, 'no-hooks'));
  for (const name of fs.readdirSync(root).filter(name => /\.(js|sh)$/.test(name) || name === 'index.html')) {
    fs.copyFileSync(path.join(root, name), path.join(repo, name));
  }
  git('add', '.');
  git('commit', '-m', 'Fixture');
  git('init', '--bare', origin);
  git('remote', 'add', 'origin', origin);
  git('push', '-u', 'origin', 'main');
  const clock = path.join(temp, 'clock.cjs');
  fs.writeFileSync(clock, `const RealDate = Date; global.Date = class extends RealDate {
    constructor(...args) { super(...(args.length ? args : ['2026-10-31T18:00:00Z'])); }
  };`);
  return { repo, env: { ...env, TZ: 'UTC', NODE_OPTIONS: `--require=${clock}` }, git };
}

test('local wrapper publishes escaped notes with the requested status in a disposable git remote', t => {
  const { repo, env, git } = fixture(t);
  const before = git('rev-parse', 'main');
  const result = spawnSync('bash', ['update-status.sh', 'off', 'Test <note> & coffee'], { cwd: repo, env, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const html = git('show', 'origin/2026-11-01:index.html');
  assert.ok(html.includes('<p>Test &lt;note&gt; &amp; coffee</p>'));
  assert.match(html, /^<body class="status-off">/m);
  assert.ok(html.includes('<div class="date">Sunday, November 1, 2026</div>'));
  assert.equal(git('rev-parse', 'main'), before, 'do not rewrite local main');
  assert.equal(git('status', '--porcelain'), '');
});

test('local updates refuse a dirty checkout without committing unrelated work', t => {
  const { repo, env, git } = fixture(t);
  fs.writeFileSync(path.join(repo, 'unrelated.txt'), 'User work');
  git('add', 'unrelated.txt');
  const before = git('rev-parse', 'HEAD');
  const result = spawnSync(process.execPath, ['update-status.js', 'false', 'New note'], { cwd: repo, env, encoding: 'utf8' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /clean working tree/);
  assert.equal(git('rev-parse', 'HEAD'), before);
  assert.equal(git('branch', '--show-current').trim(), 'main');
  assert.equal(fs.readFileSync(path.join(repo, 'unrelated.txt'), 'utf8'), 'User work');
  assert.ok(git('status', '--porcelain').includes('A  unrelated.txt'));
});
