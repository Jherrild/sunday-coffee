'use strict';

// Notes are plain text, never HTML or shell source. Keep the page fully static.
function updateCoffeeNotes(html, notes = '', { nextSunday, clearNotes = false } = {}) {
  const markers = /<!-- COFFEE_NOTES_START -->[\s\S]*?<!-- COFFEE_NOTES_END -->/g;
  if ((html.match(markers) || []).length !== 1) {
    throw new Error('Expected exactly one complete notes marker pair');
  }
  const text = clearNotes ? '' : notes.replace(/\r\n?/g, '\n').trim();
  const currentSunday = html.match(/<div class="date">(.*?)<\/div>/)?.[1];
  if (!text && !clearNotes && nextSunday && currentSunday === nextSunday) return html;
  const escapeHtml = value => value.replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
  const paragraphs = text ? text.split(/\n[\t ]*\n+/).map(paragraph =>
    `        <p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`).join('\n') : '';
  const section = `<!-- COFFEE_NOTES_START -->
      <section class="week-note" aria-labelledby="note-title"${text ? '' : ' hidden'}>
        <h2 id="note-title">This week</h2>
${paragraphs}
      </section>
      <!-- COFFEE_NOTES_END -->`;
  return html.replace(/<!-- COFFEE_NOTES_START -->[\s\S]*?<!-- COFFEE_NOTES_END -->/, () => section);
}

module.exports = { updateCoffeeNotes };
