/*
  ui.js: small building blocks shared by the student and teacher screens
  (icons, chips, topic tiles, finding cards, time formatting).
*/
(function () {
  'use strict';
  var HNSA = (window.HNSA = window.HNSA || {});
  var D = HNSA.Data, AI = HNSA.AI;
  var UI = (HNSA.UI = {});

  UI.esc = function (s) {
    return String(s === null || s === undefined ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };
  UI.fmt = AI.fmt;

  var paths = {
    home: 'M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
    test: 'M9 3h6v3H9z M9 4.5H5V21h14V4.5h-4 M8.5 13l2.5 2.5L15.5 10',
    chart: 'M3 20h18 M6 20v-7 M11 20V6 M16 20v-10',
    plan: 'M4 6h16v14H4z M4 10h16 M8 3v4 M16 3v4',
    chat: 'M4 5h16v11H10l-5 4v-4H4z',
    grid: 'M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z',
    users: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z M2.5 20c.6-3.4 3.2-5.5 6.5-5.5s5.9 2.1 6.5 5.5 M16 4.2a3.5 3.5 0 0 1 0 6.6 M18 14.8c1.9.7 3.2 2.5 3.6 5.2',
    alert: 'M12 3l9.5 17h-19z M12 10v4 M12 17v.4',
    check: 'M5 4h14v16H5z M8.5 12l2.5 2.5 4.5-5',
    logout: 'M14 4h5v16h-5 M10 8l-4 4 4 4 M6 12h9',
    clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 2',
    back: 'M15 5l-7 7 7 7',
    print: 'M7 8V3h10v5 M7 17H4V9h16v8h-3 M7 14h10v7H7z',
    spark: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z M19 16l.7 2 .2.1 2 .7-2 .7-.2.1-.7 2-.7-2-.2-.1-2-.7 2-.7.2-.1z',
    reset: 'M4 12a8 8 0 1 0 2.6-5.9 M4 4v4.5h4.5',
    send: 'M4 12l16-8-6 16-3-6.5z',
    tick: 'M5 12.5l4.5 4.5L19 7.5'
  };
  UI.icon = function (name, size) {
    size = size || 20;
    return '<svg class="icon" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
           'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + paths[name] + '"/></svg>';
  };

  UI.level = function (pct) {
    return pct >= 70 ? { key: 'good', label: 'Strong' } : pct >= 45 ? { key: 'mid', label: 'Getting there' } : { key: 'weak', label: 'Needs work' };
  };
  UI.chip = function (text, kind) { return '<span class="chip chip-' + (kind || 'neutral') + '">' + UI.esc(text) + '</span>'; };

  UI.types = {
    concept: { label: 'Concept not clear', kind: 'weak' },
    application: { label: 'Basics fine, needs problem practice', kind: 'mid' },
    rushed: { label: 'Answered too fast', kind: 'mid' },
    slow: { label: 'Correct but slow', kind: 'mid' }
  };
  UI.typeChip = function (type) { var t = UI.types[type]; return UI.chip(t.label, t.kind); };

  /* A topic tile, drawn like a cell of the periodic table. */
  UI.tile = function (topic, pct, opts) {
    opts = opts || {};
    var lv = UI.level(pct);
    var tag = opts.action ? 'button' : 'div';
    var attrs = opts.action ? ' type="button" data-action="' + opts.action + '" data-id="' + topic.id + '"' : '';
    return '<' + tag + ' class="tile tile-' + lv.key + (opts.selected ? ' is-selected' : '') + (opts.small ? ' tile-small' : '') + '"' + attrs +
      ' data-tip="' + UI.esc(topic.name + ': ' + pct + '% (' + lv.label + ')') + '"' +
      (opts.action ? ' aria-pressed="' + (opts.selected ? 'true' : 'false') + '"' : '') + '>' +
      '<span class="tile-pct">' + pct + '</span>' +
      '<span class="tile-sym">' + topic.sym + '</span>' +
      '<span class="tile-name">' + UI.esc(topic.name) + '</span></' + tag + '>';
  };

  /* The whole topic table, one row of tiles per subject. */
  UI.topicTable = function (mastery, opts) {
    opts = opts || {};
    var html = '<div class="topic-table">';
    D.subjects.forEach(function (sub) {
      html += '<div class="topic-row"><div class="topic-row-name">' + sub + '</div><div class="tiles">';
      D.topics.filter(function (t) { return t.subject === sub; }).forEach(function (t) {
        html += UI.tile(t, mastery[t.id], { action: opts.action, selected: opts.selected === t.id });
      });
      html += '</div></div>';
    });
    html += '</div><div class="tile-legend">' +
      '<span><i class="dot dot-good"></i>Strong, 70 and above</span>' +
      '<span><i class="dot dot-mid"></i>Getting there, 45 to 69</span>' +
      '<span><i class="dot dot-weak"></i>Needs work, below 45</span></div>';
    return html;
  };

  /* One "what the AI found" card. */
  UI.finding = function (f, opts) {
    opts = opts || {};
    var topic = D.topicById[f.topic], t = UI.types[f.type];
    var html = '<article class="finding finding-' + t.kind + '">' +
      '<header><div><h3>' + UI.esc(f.gap) + '</h3><p class="muted">' + f.subject + ', ' + UI.esc(topic.name) + '</p></div>' + UI.typeChip(f.type) + '</header>' +
      '<p><strong>Why:</strong> ' + UI.esc(f.evidence) + '</p>';
    if (!opts.compact) {
      html += '<div class="finding-do"><strong>What to do</strong><ol>' +
        AI.advice(f).map(function (s) { return '<li>' + UI.esc(s) + '</li>'; }).join('') + '</ol></div>';
      if (f.tip) html += '<p class="finding-tip">' + UI.icon('spark', 16) + '<span><strong>Quick reminder:</strong> ' + f.tip + '</span></p>';
    }
    return html + '</article>';
  };

  UI.rowVerdict = function (r) {
    if (r.skipped) return UI.chip('Skipped', 'weak');
    if (r.correct) return r.type === 'slow' ? UI.chip('Correct but slow', 'mid') : UI.chip('Correct', 'good');
    return r.type === 'rushed' ? UI.chip('Wrong, too fast', 'mid') : UI.chip('Wrong', 'weak');
  };

  UI.dayName = function (day) {
    var names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var lead = day.index === 0 ? 'Today' : day.index === 1 ? 'Tomorrow' : names[day.date.getDay()];
    return { lead: lead, date: day.date.getDate() + ' ' + months[day.date.getMonth()] };
  };

  UI.greeting = function () {
    var h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  };
})();
