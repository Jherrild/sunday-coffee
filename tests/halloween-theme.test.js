'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const css = html.match(/<style>([\s\S]*?)<\/style>/)[1];

function rule(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return css.match(new RegExp(`(?:^|})\\s*${escaped}\\s*\\{([^}]+)\\}`))?.[1] || '';
}

function token(name, theme = 'halloween') {
  const declarations = theme === 'default' ? rule(':root') : rule(`:root[data-theme="${theme}"]`);
  return declarations.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1].trim();
}

// Theme selection is deliberately static: missing/unknown values inherit :root.
test('a single HTML theme attribute selects scoped tokens without a runtime dependency', () => {
  assert.match(html.match(/<html\b[^>]*>/)?.[0] || '', /\bdata-theme="[^"]+"/);
  assert.doesNotMatch(html, /<script\b/i);
  assert.ok(rule(':root'), 'default tokens must not require a theme attribute');
  assert.ok(rule(':root[data-theme="halloween"]'), 'Halloween is an opt-in override');
  assert.doesNotMatch(css, /:root\[data-theme="default"\]/);
});

test('the default theme restores green/white and neutral off-state colors with legible accents', () => {
  const expected = {
    'on-bg-gradient-start': '#e0ffe4',
    'on-bg-gradient-end': '#a8ffce',
    'off-bg-gradient-start': '#f6f6f6',
    'off-bg-gradient-end': '#dadada',
    'card-bg': '#ffffff',
    'text-main': '#333333',
  };
  for (const [name, value] of Object.entries(expected)) assert.equal(token(name, 'default'), value);
  for (const name of ['text-main', 'on-accent', 'off-accent', 'text-muted']) {
    assert.ok(contrast(token(name, 'default'), token('card-bg', 'default')) >= 4.5, `${name} must meet WCAG AA`);
  }
});

test('shared card and chip rules use theme tokens, including borders and shadows', () => {
  for (const [selector, properties] of Object.entries({
    '.card': ['background', 'border', 'border-top', 'box-shadow'],
    '.chip': ['background', 'border'],
  })) {
    for (const property of properties) {
      assert.match(rule(selector), new RegExp(`(?:^|;)\\s*${property}:\\s*var\\(--[\\w-]+\\)\\s*;`), `${selector} ${property} must be fully tokenized`);
    }
  }
  assert.equal(token('card-border'), '1px solid #5d4034');
  assert.equal(token('card-border-top'), '2px solid #d57937');
  assert.equal(token('card-shadow'), '0 18px 40px rgba(0, 0, 0, 0.3)');
  assert.equal(token('card-border', 'default'), '0 solid transparent');
  assert.equal(token('card-border-top', 'default'), '0 solid transparent');
  assert.equal(token('card-shadow', 'default'), '0 18px 40px rgba(0, 0, 0, 0.12)');
});

function contrast(foreground, background) {
  const luminance = color => {
    const rgb = Array.isArray(color) ? color : color.slice(1).match(/../g).map(value => parseInt(value, 16) / 255);
    const channels = rgb.map(channel => {
      return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    });
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  };
  const values = [luminance(foreground), luminance(background)].sort((a, b) => a - b);
  return (values[1] + 0.05) / (values[0] + 0.05);
}

test('tag labels retain contrast over their translucent fill plus the strongest card glow', () => {
  const blend = (foreground, background, alpha) => foreground.map((channel, i) => channel * alpha + background[i] * (1 - alpha));
  for (const theme of ['default', 'halloween']) {
    const card = token('card-bg', theme).slice(1).match(/../g).map(value => parseInt(value, 16) / 255);
    for (const status of ['on', 'off']) {
      const [r, g, b, alpha] = token(`${status}-accent-soft`, theme).match(/[\d.]+/g).map(Number);
      const soft = [r, g, b].map(value => value / 255);
      const glow = blend(soft, card, alpha * 0.9);
      const tag = blend(soft, glow, alpha);
      const ratio = contrast(token(`${status}-accent`, theme), tag);
      assert.ok(ratio >= 4.5, `${theme} ${status} tag contrast is ${ratio.toFixed(2)}; must meet WCAG AA`);
    }
  }
});

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

test('optional notes follow the approved left-aligned panel treatment using theme tokens', () => {
  const note = rule('.week-note');
  assert.ok(note, 'expected note panel styling');
  assert.match(note, /text-align:\s*left/);
  assert.match(note, /background:\s*var\(--note-bg\)/);
  assert.match(note, /border:\s*var\(--note-border\)/);
  assert.match(note, /border-radius:\s*14px/);
  assert.match(note, /padding:\s*17px 18px 18px/);
  assert.match(note, /margin:\s*20px 0/);
  assert.match(note, /overflow-wrap:\s*anywhere/);
  assert.doesNotMatch(note, /\bdisplay\s*:/, 'author styles must not override native hidden behavior');
  assert.match(rule('.week-note h2'), /font-size:\s*0\.72rem/);
  assert.match(rule('.week-note h2'), /text-transform:\s*uppercase/);
  assert.match(rule('.week-note h2'), /color:\s*var\(--on-accent\)/);
  assert.match(rule('body.status-off .week-note h2'), /color:\s*var\(--off-accent\)/);
  assert.match(rule('.week-note p'), /font-size:\s*0\.9rem/);
  assert.match(rule('.week-note p'), /font-weight:\s*300/);
  assert.match(rule('.week-note p'), /line-height:\s*1\.75/);
  assert.match(rule('.week-note p + p'), /margin-top:\s*10px/);
  assert.match(css, /@media\s*\(max-width:\s*360px\)\s*\{\s*\.week-note\s*\{\s*padding:\s*15px;/);
  assert.equal(token('note-bg'), '#2e2728');
  assert.equal(token('note-border'), '1px solid #51413c');
  for (const theme of ['default', 'halloween']) {
    assert.ok(token('note-bg', theme));
    assert.ok(token('note-border', theme));
    for (const name of ['text-main', 'on-accent', 'off-accent']) {
      assert.ok(contrast(token(name, theme), token('note-bg', theme)) >= 4.5, `${theme} ${name} on note must meet WCAG AA`);
    }
  }
});

test('notes retain native visibility semantics between unchanged details and footer', () => {
  const section = html.match(/<!-- COFFEE_NOTES_START -->([\s\S]*?)<!-- COFFEE_NOTES_END -->/)?.[1];
  assert.ok(section, 'retain automation markers');
  const opening = section.match(/<section\b[^>]*>/)?.[0] || '';
  assert.match(opening, /class="week-note" aria-labelledby="note-title"/);
  assert.match(section, /<h2 id="note-title">This week<\/h2>/);
  const content = section.replace(/<h2 id="note-title">This week<\/h2>/, '').replace(/<[^>]+>/g, '').trim();
  if (!content) assert.match(opening, /\bhidden\b/, 'empty notes must hide the whole panel');
  else assert.doesNotMatch(opening, /\bhidden\b/, 'populated notes must be visible');
  const details = html.indexOf('<div class="details">');
  const note = html.indexOf('<!-- COFFEE_NOTES_START -->');
  const footer = html.indexOf('<div class="footer">');
  assert.ok(details < note && note < footer);
  assert.match(html.slice(details, note), /<div class="chip">Time: 9:00 AM – 11:00 AM<\/div>/);
  assert.match(html.slice(details, note), /<div class="chip">Location: Our place<\/div>/);
  assert.doesNotMatch(html, /class="(?:navigate|location-row)"|<button\b|<form\b/);
});

test('the corner web scales with the viewport and stays decorative', () => {
  const web = html.match(/<svg\b[^>]*class="halloween-web"[^>]*>/)?.[0];
  assert.ok(web, 'expected the inline corner web');
  assert.match(web, /aria-hidden="true"/);
  assert.match(web, /focusable="false"/);
  assert.match(web, /viewBox="0 0 200 200"/);
  assert.match(rule('.halloween-web'), /display:\s*none/);
  const style = rule(':root[data-theme="halloween"] .halloween-web');
  assert.ok(style, 'expected a theme-scoped responsive web style');
  assert.match(style, /display:\s*block/);
  assert.match(style, /width:\s*clamp\(82px,\s*20vw,\s*208px\)/);
  assert.match(style, /pointer-events:\s*none/);
  assert.match(style, /height:\s*auto/);
});
