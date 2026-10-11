/*
  charts.js: three small charts drawn by hand (no chart library needed).
    Charts.line  score over the weekly tests
    Charts.bars  horizontal bars (subjects, problem topics)
    Charts.ring  score ring
*/
(function () {
  'use strict';
  var HNSA = (window.HNSA = window.HNSA || {});
  var C = (HNSA.Charts = {});

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* series: [{ name, color, values: [number|null], muted }]   labels: ['Test 1', ...] */
  C.line = function (opts) {
    var W = 470, H = 230, L = 34, R = 50, T = 18, B = 30;
    var n = opts.labels.length, pw = W - L - R, ph = H - T - B;
    function x(i) { return L + (n === 1 ? pw / 2 : (pw * i) / (n - 1)); }
    function y(v) { return T + ph - (ph * v) / 100; }
    var svg = '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(opts.label || 'Score by test') + '">';

    [0, 25, 50, 75, 100].forEach(function (g) {
      svg += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y(g) + '" y2="' + y(g) + '" class="grid"/>';
      svg += '<text x="' + (L - 8) + '" y="' + (y(g) + 4) + '" text-anchor="end" class="axis">' + g + '</text>';
    });
    opts.labels.forEach(function (lab, i) {
      svg += '<text x="' + x(i) + '" y="' + (H - 8) + '" text-anchor="middle" class="axis">' + esc(lab) + '</text>';
    });

    var ends = [];
    opts.series.forEach(function (s) {
      var pts = [];
      s.values.forEach(function (v, i) { if (v !== null && v !== undefined) pts.push([x(i), y(v), v, i]); });
      if (!pts.length) return;
      svg += '<polyline fill="none" stroke="' + s.color + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" points="' +
             pts.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' ') + '"/>';
      pts.forEach(function (p) {
        svg += '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="4" fill="' + s.color + '" stroke="#fff" stroke-width="2"/>';
        svg += '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="13" fill="transparent" data-tip="' +
               esc(s.name + ': ' + p[2] + '% in ' + opts.labels[p[3]]) + '"/>';
      });
      var last = pts[pts.length - 1];
      ends.push({ x: last[0], y: last[1], v: last[2], early: last[3] < n - 1 });
    });

    // Value labels at the line ends. Nudge them apart if two lines end close together.
    ends.sort(function (a, b) { return a.y - b.y; });
    for (var pass = 0; pass < 6; pass++) {
      for (var i = 1; i < ends.length; i++) {
        if (!ends[i].early && !ends[i - 1].early && ends[i].y - ends[i - 1].y < 15) {
          var mid = (ends[i].y + ends[i - 1].y) / 2;
          ends[i - 1].y = mid - 7.5; ends[i].y = mid + 7.5;
        }
      }
    }
    ends.forEach(function (e) {
      // A line that stops before the last test gets its label above the point, clear of the other line.
      svg += e.early
        ? '<text x="' + e.x + '" y="' + (e.y - 11) + '" text-anchor="middle" class="endlabel">' + e.v + '%</text>'
        : '<text x="' + (e.x + 10) + '" y="' + (e.y + 4) + '" class="endlabel">' + e.v + '%</text>';
    });
    svg += '</svg>';
    svg = '<div class="chart-box">' + svg + '</div>';

    var legend = '';
    if (opts.series.length > 1) {
      legend = '<div class="legend">' + opts.series.map(function (s) {
        return '<span class="legend-item"><span class="legend-key" style="background:' + s.color + '"></span>' + esc(s.name) + '</span>';
      }).join('') + '</div>';
    }
    return legend + svg;
  };

  /* items: [{ label, value (0 to 100), color, note, tip }] */
  C.bars = function (items, opts) {
    opts = opts || {};
    return '<div class="bars' + (opts.wide ? ' bars-wide' : '') + '">' + items.map(function (it) {
      var w = Math.max(0, Math.min(100, it.value));
      return '<div class="bar-row" data-tip="' + esc(it.tip || it.label + ': ' + it.value + '%') + '">' +
        '<span class="bar-label">' + esc(it.label) + '</span>' +
        '<span class="bar-track"><span class="bar-fill" style="width:' + w + '%;background:' + (it.color || 'var(--violet)') + '"></span></span>' +
        '<span class="bar-val">' + esc(it.note || it.value + '%') + '</span></div>';
    }).join('') + '</div>';
  };

  C.ring = function (value, total, caption) {
    var r = 46, c = 2 * Math.PI * r, share = total ? value / total : 0;
    return '<svg class="ring" viewBox="0 0 120 120" role="img" aria-label="' + esc(value + ' out of ' + total + ' correct') + '">' +
      '<circle cx="60" cy="60" r="' + r + '" fill="none" stroke="var(--line)" stroke-width="10"/>' +
      '<circle cx="60" cy="60" r="' + r + '" fill="none" stroke="var(--violet)" stroke-width="10" stroke-linecap="round" ' +
      'stroke-dasharray="' + (c * share).toFixed(1) + ' ' + c.toFixed(1) + '" transform="rotate(-90 60 60)"/>' +
      '<text x="60" y="60" text-anchor="middle" class="ring-num">' + value + '<tspan class="ring-of">/' + total + '</tspan></text>' +
      '<text x="60" y="80" text-anchor="middle" class="ring-cap">' + esc(caption || 'correct') + '</text></svg>';
  };
})();
