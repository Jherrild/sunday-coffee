'use strict';

const TIME_ZONE = 'America/Los_Angeles';

// Calendar arithmetic uses UTC only as a date container; the input day is
// explicitly Pacific, independent of the runner's timezone and DST offset.
function getCoffeeDates(now = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(now).map(({ type, value }) => [type, value]));
  const sunday = new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)));
  const weekday = sunday.getUTCDay();
  // Sunday before 09:30 Pacific means today; at/after the cutoff means next week.
  const beforeCutoff = Number(parts.hour) * 60 + Number(parts.minute) < 9 * 60 + 30;
  const daysUntilSunday = weekday === 0 ? (beforeCutoff ? 0 : 7) : 7 - weekday;
  sunday.setUTCDate(sunday.getUTCDate() + daysUntilSunday);

  return {
    nextSunday: sunday.toLocaleDateString('en-US', {
      timeZone: 'UTC', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    }),
    branchDate: sunday.toISOString().slice(0, 10),
    lastUpdated: now.toLocaleDateString('en-US', {
      timeZone: TIME_ZONE, year: 'numeric', month: 'long', day: 'numeric',
    }),
  };
}

module.exports = { getCoffeeDates };
