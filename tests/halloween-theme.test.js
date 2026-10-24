'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const css = html.match(/<style>([\s\S]*?)<\/style>/)[1];

function token(name) {
  return css.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1].trim();
}

function contrast(foreground, background) {
  const luminance = hex => {
    const channels = hex.slice(1).match(/../g).map(value => {
      const channel = parseInt(value, 16) / 255;
      return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    });
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  };
  const values = [luminance(foreground), luminance(background)].sort((a, b) => a - b);
  return (values[1] + 0.05) / (values[0] + 0.05);
}

test('Midnight ember keeps both status states legible on the approved dark palette', () => {
  assert.equal(token('on-bg-gradient-start'), '#111117');
  assert.equal(token('on-bg-gradient-end'), '#2b1e18');
  assert.equal(token('card-bg'), '#242126');
  assert.equal(token('on-accent'), '#ffad66');
  assert.notEqual(token('on-accent'), token('off-accent'));
  for (const name of ['text-main', 'on-accent', 'off-accent', 'text-muted']) {
    assert.ok(contrast(token(name), token('card-bg')) >= 4.5, `${name} must meet WCAG AA`);
  }
});

test('the corner web scales with the viewport and stays decorative', () => {
  const web = html.match(/<svg\b[^>]*class="halloween-web"[^>]*>/)?.[0];
  assert.ok(web, 'expected the inline corner web');
  assert.match(web, /aria-hidden="true"/);
  assert.match(web, /focusable="false"/);
  assert.match(web, /viewBox="0 0 200 200"/);
  const style = css.match(/\.halloween-web\s*\{([^}]+)\}/)?.[1];
  assert.ok(style, 'expected a responsive web style');
  assert.match(style, /width:\s*clamp\(82px,\s*20vw,\s*208px\)/);
  assert.match(style, /pointer-events:\s*none/);
  assert.match(style, /height:\s*auto/);
});
