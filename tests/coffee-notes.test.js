'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const { updateCoffeeNotes } = require('../coffee-notes');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

test('missing or duplicate notes markers are rejected instead of silently dropping an update', () => {
  assert.throws(() => updateCoffeeNotes('<html>No notes slot</html>', 'Important note'), /notes marker/i);
  assert.throws(() => updateCoffeeNotes(html + html, 'Important note'), /notes marker/i);
});

// Supplemental edge coverage for the escaped-text rendering mechanism.
test('markup, script tags and marker-looking text are displayed literally', () => {
  const note = '</section><script>alert("x")</script><!-- COFFEE_NOTES_END -->';
  const result = updateCoffeeNotes(html, note);
  assert.ok(result.includes('&lt;/section&gt;&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;'));
  assert.equal(result.match(/<!-- COFFEE_NOTES_END -->/g).length, 1);
  assert.ok(!result.includes('<script>'));
});

test('JavaScript replacement tokens and shell-looking text remain literal', () => {
  const note = '$& $` $\' $$ $(printf unsafe) ${process.env.TOKEN}';
  const result = updateCoffeeNotes(html, note);
  assert.ok(result.includes('$&amp; $` $&#39; $$ $(printf unsafe) ${process.env.TOKEN}'));
  assert.equal(result.match(/<!DOCTYPE html>/g).length, 1);
});

test('Windows newlines and blank lines become safe line and paragraph breaks', () => {
  const result = updateCoffeeNotes(html, '  First\r\nSecond\r\n \t\r\nThird\rFourth  ');
  assert.ok(result.includes('<p>First<br>Second</p>'));
  assert.ok(result.includes('<p>Third<br>Fourth</p>'));
});

test('empty and whitespace-only notes produce an empty hidden block', () => {
  for (const note of ['', ' \n\t\r\n ']) {
    const result = updateCoffeeNotes(html, note);
    assert.match(result, /<section class="week-note" aria-labelledby="note-title" hidden>/);
    assert.ok(!result.match(/<!-- COFFEE_NOTES_START -->([\s\S]*?)<!-- COFFEE_NOTES_END -->/)[1].includes('<p>'));
  }
});

test('clearing takes precedence over supplied replacement notes', () => {
  const result = updateCoffeeNotes(html, 'Do not publish this', { clearNotes: true });
  assert.ok(!result.includes('Do not publish this'));
  assert.match(result, /aria-labelledby="note-title" hidden>/);
});

test('updating twice replaces rather than appends or double-escapes notes', () => {
  const once = updateCoffeeNotes(html, 'Coffee & tea');
  const twice = updateCoffeeNotes(once, 'Coffee & tea');
  assert.equal(twice, once);
  assert.ok(!updateCoffeeNotes(once, 'New note').includes('Coffee &amp; tea'));
});
