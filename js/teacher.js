/*
  teacher.js: the screens a teacher sees.
    Dashboard, Students, Student summary (with parent report),
    Problem areas, Review questions.
*/
(function () {
  'use strict';
  var HNSA = (window.HNSA = window.HNSA || {});
  var D = HNSA.Data, AI = HNSA.AI, Store = HNSA.Store, UI = HNSA.UI, Charts = HNSA.Charts;
  var esc = UI.esc, icon = UI.icon;
  var Tc = (HNSA.Teacher = {});

  Tc.nav = [
    { route: 'centres', label: 'All centres', icon: 'grid', only: 'foundation' },
    { route: 'dashboard', label: 'Batch dashboard', icon: 'chart' },
    { route: 'students', label: 'Students', icon: 'users', also: ['student'] },
    { route: 'problems', label: 'Problem areas', icon: 'alert' },
    { route: 'review', label: 'Review questions', icon: 'check' }
  ];

  var filter = { q: '', status: 'all' };
  var openWho = {};      // which problem rows show their student list
  var reportFor = null;  // student id whose parent report is open
  var render = function () { HNSA.App.render(); };
  var classLabel = D.school.className + ', ' + D.school.section + ', ' + D.school.centre;

  function scoreText(m) { return m.taken ? m.latest.score + ' of ' + m.latest.total : 'Not taken'; }
  function change(m) {
    if (!m.taken) return '<span class="muted">No score yet</span>';
    var d = m.latest.pct - m.scores[m.scores.length - 2].value;
    return d > 0 ? '<span class="up">Up ' + d + '</span>' : d < 0 ? '<span class="down">Down ' + Math.abs(d) + '</span>' : 'No change';
  }
  function wrongColor(pct) { return pct >= 40 ? 'var(--weak)' : pct >= 20 ? 'var(--mid)' : 'var(--good)'; }

  /* ================= All centres (Foundation view) ================= */
  Tc.centres = function () {
    var st = Store.classStats();
    // The Hojai numbers come from the live demo batch; the other centres are sample numbers.
    var centres = D.centres.map(function (c) {
      var x = {}; for (var k in c) x[k] = c[k];
      if (c.id === 'hojai') {
        x.avg = st.avgPct; x.trend = c.trend.slice(0, 5).concat([st.avgPct]);
        x.weak = st.ranked.slice(0, 2).map(function (r) { return r.topic.name; });
      }
      return x;
    });
    var totalStudents = centres.reduce(function (a, c) { return a + c.students; }, 0);
    var totalHelp = centres.reduce(function (a, c) { return a + c.help; }, 0);
    var overall = Math.round(centres.reduce(function (a, c) { return a + c.avg * c.students; }, 0) / totalStudents);
    var lowest = centres.slice().sort(function (a, b) { return a.avg - b.avg; })[0];
    var colours = ['#0f7a4d', '#b87a00', '#5b3dc4', '#9a97ae'];

    var html = '<div class="page-head"><div><h1>All centres</h1><p>' + D.testName + ' across Hojai, Barpeta, Dhubri and Badarpur. ' + totalStudents.toLocaleString('en-IN') + ' students.</p></div></div><div class="stack">';
    html += '<div class="grid-4">' + stat(centres.length, '', 'centres') + stat(totalStudents.toLocaleString('en-IN'), '', 'students in all centres') +
      stat(overall + '%', '', 'average across centres') + stat(totalHelp, '', 'students need help (below 50%)') + '</div>';
    html += '<section class="ai-note">' + icon('spark', 20) + '<div><strong>AI Mentor’s note for the Foundation</strong><p>' + esc(lowest.name) + ' has the lowest average this week (' + lowest.avg + '%) and ' + lowest.help + ' students below 50%. Its top gaps are ' + esc(lowest.weak[0].toLowerCase()) + ' and ' + esc(lowest.weak[1].toLowerCase()) + '. A shared remedial plan from the strongest centre on these topics would help.</p></div></section>';

    html += '<section class="card"><div class="card-head"><div><h2>Centre by centre</h2><p>Choose a centre to open its batch dashboard. In this demo only the Hojai demo batch opens; the Hojai average comes from it.</p></div></div><div class="table-wrap"><table class="table"><thead><tr><th>Centre</th><th>Students</th><th>Batches</th><th>' + D.testName + ' average</th><th>Change</th><th>Need help</th><th>Top gaps this week</th></tr></thead><tbody>';
    centres.forEach(function (c) {
      var prev = c.trend[4], d = c.avg - prev;
      var kind = c.avg >= 65 ? 'good' : c.avg >= 55 ? 'mid' : 'weak';
      html += '<tr' + (c.id === 'hojai' ? ' class="is-link is-me" data-action="open-centre" tabindex="0" role="link" aria-label="Open Hojai"' : '') + '><td><strong>' + esc(c.name) + '</strong>' + (c.id === 'hojai' ? ' ' + UI.chip('Demo centre', 'violet') : '') + '</td>' +
        '<td class="num">' + c.students + '</td><td class="num">' + c.batches + '</td><td>' + UI.chip(c.avg + '%', kind) + '</td>' +
        '<td class="num">' + (d > 0 ? '<span class="up">Up ' + d + '</span>' : d < 0 ? '<span class="down">Down ' + Math.abs(d) + '</span>' : 'No change') + '</td>' +
        '<td class="num">' + c.help + '</td><td>' + esc(c.weak.join(', ')) + '</td></tr>';
    });
    html += '</tbody></table></div></section>';

    html += '<div class="grid-2"><section class="card"><div class="card-head"><div><h2>Average by mock, each centre</h2><p>Percent correct</p></div></div>' +
      Charts.line({ labels: ['Mock 1', 'Mock 2', 'Mock 3', 'Mock 4', 'Mock 5', 'Mock 6'], label: 'Average score of each centre in each weekly mock',
        series: centres.map(function (c, i) { return { name: c.name, color: colours[i], values: c.trend }; }) }) + '</section>';
    html += '<section class="card"><div class="card-head"><div><h2>Students who need help, by centre</h2><p>Scored below 50% in ' + D.testName + '</p></div></div>' +
      Charts.bars(centres.map(function (c) { return { label: c.name, value: Math.round((c.help / c.students) * 100), note: c.help + ' of ' + c.students, color: c.help / c.students >= 0.2 ? 'var(--weak)' : 'var(--mid)', tip: c.name + ': ' + c.help + ' of ' + c.students + ' students below 50%' }; }), { wide: true }) + '</section></div>';

    html += '<section class="card"><div class="card-head"><div><h2>Shared across centres</h2><p>What the Foundation can act on this week</p></div></div><div class="list">' +
      '<div class="list-item"><div><div class="list-title">Projectile motion is weak in 3 of 4 centres</div><div class="list-sub">Share the Badarpur remedial plan with Hojai, Dhubri and Barpeta.</div></div>' + UI.chip('Teaching', 'violet') + '</div>' +
      '<div class="list-item"><div><div class="list-title">' + totalHelp + ' students below 50% across all centres</div><div class="list-sub">Each one has a named gap and a plan. Mentors have the list.</div></div>' + UI.chip('Mentoring', 'violet') + '</div>' +
      '<div class="list-item"><div><div class="list-title">Selection Test 2027 reports</div><div class="list-sub">Every applicant can receive a free weakness report. Ready to switch on for Phase I.</div></div>' + UI.chip('Admissions', 'violet') + '</div></div></section>';
    return html + '</div>';
  };

  /* ================= Dashboard ================= */
  Tc.dashboard = function () {
    var st = Store.classStats(), models = Store.models();
    var help = models.filter(function (m) { return m.status.key === 'help'; }).sort(function (a, b) { return a.latest.pct - b.latest.pct; });
    var top = st.ranked[0], diff = st.avgPct - st.trend[4];

    var html = (Store.session().role === 'foundation' ? '<a class="back" href="#/teacher/centres">' + icon('back', 16) + 'All centres</a>' : '') +
      '<div class="page-head"><div><h1>' + classLabel + '</h1><p>' + D.testName + ' at a glance. ' + st.total + ' students in this batch.</p></div></div><div class="stack">';

    html += '<div class="grid-4">' +
      stat(st.total, '', 'students in the batch') +
      stat(st.taken, 'of ' + st.total, 'took ' + D.testName) +
      stat(st.avgPct + '%', '', 'batch average, ' + (diff > 0 ? 'up ' + diff : diff < 0 ? 'down ' + Math.abs(diff) : 'same as') + ' from last test') +
      stat(help.length, '', 'students need help (below 50%)') + '</div>';

    if (top && top.wrong) {
      var g = top.gapList[0];
      html += '<section class="ai-note">' + icon('spark', 20) + '<div><strong>AI Mentor’s note for this week</strong><p>' +
        top.wrong + ' of ' + top.takers + ' students lost marks in ' + esc(top.topic.name.toLowerCase()) + '. ' +
        (g ? 'For ' + g.n + ' of them the exact gap is “' + esc(g.gap) + '”. ' : '') + esc(AI.classAction(top)) + '</p></div></section>';
    }

    html += '<div class="grid-2"><section class="card"><div class="card-head"><div><h2>Where the batch is stuck</h2><p>Students who got it wrong in ' + D.testName + '</p></div>' +
      '<a class="btn btn-sm" href="#/teacher/problems">See all</a></div>' +
      Charts.bars(st.ranked.map(function (x) {
        return { label: x.topic.name, value: x.wrongPct, note: x.wrong + ' of ' + x.takers, color: wrongColor(x.wrongPct),
                 tip: x.topic.name + ': ' + x.wrong + ' of ' + x.takers + ' students wrong (' + x.wrongPct + '%)' };
      }), { wide: true }) + '</section>';

    html += '<section class="card"><div class="card-head"><div><h2>Students who need help</h2><p>Scored below 50% in ' + D.testName + '</p></div>' +
      '<a class="btn btn-sm" href="#/teacher/students">All students</a></div>';
    html += help.length ? '<div class="list">' + help.slice(0, 6).map(function (m) {
      var f = m.findings[0];
      return '<a class="list-item" href="#/teacher/student/' + m.id + '"><div><div class="list-title">' + esc(m.name) + '</div>' +
        '<div class="list-sub">' + (f ? 'Main gap: ' + esc(f.gap) : 'No gap found') + '</div></div>' + UI.chip(scoreText(m), 'weak') + '</a>';
    }).join('') + '</div>' : '<p class="muted">No student scored below 50% in this test.</p>';
    html += '</section></div>';

    html += '<div class="grid-2"><section class="card"><div class="card-head"><div><h2>Batch average by mock</h2><p>Percent correct, whole batch</p></div></div>' +
      Charts.line({ labels: ['Mock 1', 'Mock 2', 'Mock 3', 'Mock 4', 'Mock 5', 'Mock 6'], label: 'Batch average in each weekly mock',
                    series: [{ name: 'Class average', color: '#0f7a4d', values: st.trend }] }) + '</section>';
    html += '<section class="card"><div class="card-head"><div><h2>Average by subject</h2><p>Percent correct in ' + D.testName + '</p></div></div>' +
      Charts.bars(D.subjects.map(function (s) { return { label: s, value: st.subjectAvg[s] }; })) + '</section></div>';
    return html + '</div>';
  };
  function stat(num, small, label) {
    return '<section class="card"><div class="stat-num">' + num + (small ? ' <small>' + small + '</small>' : '') + '</div><div class="stat-label">' + label + '</div></section>';
  }

  /* ================= Students ================= */
  Tc.students = function () {
    var models = Store.models();
    var counts = { all: models.length, help: 0, watch: 0, ok: 0, absent: 0 };
    models.forEach(function (m) { counts[m.status.key] += 1; });
    var q = filter.q.trim().toLowerCase();
    var rows = models.filter(function (m) {
      return (filter.status === 'all' || m.status.key === filter.status) && (!q || m.name.toLowerCase().indexOf(q) !== -1 || String(m.roll) === q);
    });
    var pills = [['all', 'All'], ['help', 'Needs help'], ['watch', 'Needs attention'], ['ok', 'On track'], ['absent', 'Test not taken']];

    var html = '<div class="page-head"><div><h1>Students</h1><p>' + models.length + ' students in ' + classLabel + '. Choose a student to see the full summary.</p></div></div>' +
      '<section class="card"><div class="filters"><input class="input" id="st-search" data-input="st-search" value="' + esc(filter.q) + '" placeholder="Search by name or roll no." aria-label="Search students">' +
      pills.map(function (p) {
        return '<button type="button" class="pill' + (filter.status === p[0] ? ' is-on' : '') + '" data-action="st-filter" data-id="' + p[0] + '" aria-pressed="' + (filter.status === p[0]) + '">' + p[1] + ' (' + counts[p[0]] + ')</button>';
      }).join('') + '</div>';

    if (!rows.length) return html + '<p class="muted">No student matches this search. Clear the search box or choose “All”.</p></section>';

    html += '<div class="table-wrap"><table class="table"><thead><tr><th>Roll</th><th>Name</th><th>Aiming for</th><th>' + D.testName + '</th><th>Change</th><th>Topics to work on</th><th>Status</th></tr></thead><tbody>';
    rows.forEach(function (m) {
      html += '<tr class="is-link' + (m.isDemo ? ' is-me' : '') + '" data-action="open-student" data-id="' + m.id + '" tabindex="0" role="link" aria-label="Open ' + esc(m.name) + '">' +
        '<td class="num">' + m.roll + '</td><td><div class="name-cell"><span class="avatar">' + m.initials + '</span>' + esc(m.name) +
        (m.isDemo ? ' ' + UI.chip('Demo student', 'violet') : '') + '</div></td><td>' + m.aspirant + '</td>' +
        '<td class="num">' + (m.taken ? '<strong>' + scoreText(m) + '</strong> <span class="muted">(' + m.latest.pct + '%)</span>' : '<span class="muted">Not taken</span>') + '</td>' +
        '<td class="num">' + change(m) + '</td><td class="num">' + m.findings.length + '</td><td>' + UI.chip(m.status.label, m.status.kind) + '</td></tr>';
    });
    return html + '</tbody></table></div></section>';
  };

  /* ================= One student ================= */
  Tc.student = function (id) {
    var m = Store.model(id);
    if (!m) return '<p>Student not found. <a href="#/teacher/students">Back to all students</a></p>';
    var st = Store.classStats();
    var mine = m.scores.map(function (s) { return s.value; });
    while (mine.length < 6) mine.push(null);

    var html = '<a class="back" href="#/teacher/students">' + icon('back', 16) + 'All students</a><div class="stack">';
    html += '<section class="card"><div class="page-head" style="margin-bottom:0"><div class="profile"><span class="avatar avatar-lg">' + m.initials + '</span><div><h1>' + esc(m.name) + '</h1>' +
      '<p>Roll no. ' + m.roll + ', ' + classLabel + ', aiming for ' + m.aspirant + '</p></div>' + UI.chip(m.status.label, m.status.kind) + '</div>' +
      '<button type="button" class="btn" data-action="report-open" data-id="' + m.id + '">' + icon('print', 18) + 'Parent report</button></div></section>';

    html += '<section class="ai-note">' + icon('spark', 20) + '<div><strong>AI Mentor summary</strong><p>' + esc(AI.summary(m)) + '</p></div></section>';

    html += '<div class="grid-3">' +
      stat(m.taken ? m.latest.score : 'None', m.taken ? 'of ' + m.latest.total : '', m.taken ? 'score in ' + D.testName : D.testName + ' not taken yet') +
      stat(m.taken ? UI.fmt(m.latest.timeTotal) : m.scores[m.scores.length - 1].value + '%', '', m.taken ? 'time taken (suggested ' + UI.fmt(m.latest.expectedTotal) + ')' : 'score in ' + D.prevTestName) +
      stat(m.planDoneCount, 'of ' + m.plan.tasks.length, 'plan tasks done this week') + '</div>';

    html += '<div class="grid-2"><section class="card"><div class="card-head"><div><h2>Score by mock</h2><p>Percent correct</p></div></div>' +
      Charts.line({ labels: ['Mock 1', 'Mock 2', 'Mock 3', 'Mock 4', 'Mock 5', 'Mock 6'], label: 'Score of ' + m.name + ' in each weekly mock, with the batch average',
        series: [{ name: 'Batch average', color: '#9a97ae', values: st.trend }, { name: m.name.split(' ')[0], color: '#0f7a4d', values: mine }] }) + '</section>';
    html += '<section class="card"><div class="card-head"><div><h2>Topics to work on</h2><p>From ' + m.findingsFrom + '</p></div></div>';
    html += m.findings.length ? '<div class="list">' + m.findings.map(function (f) {
      return '<div class="list-item"><div><div class="list-title">' + esc(f.gap) + '</div><div class="list-sub">' + f.subject + ', ' + esc(D.topicById[f.topic].name) + '</div></div>' + UI.typeChip(f.type) + '</div>';
    }).join('') + '</div>' : '<p class="muted">No weak topics found in the last test.</p>';
    html += '</section></div>';

    html += '<section class="card"><div class="card-head"><div><h2>Topic table</h2><p>Strength in each topic, out of 100</p></div></div>' + UI.topicTable(m.mastery) + '</section>';

    if (m.taken) {
      html += '<section class="card"><div class="card-head"><div><h2>' + D.testName + ', question by question</h2></div></div><div class="table-wrap"><table class="table"><thead><tr>' +
        '<th>No.</th><th>Topic</th><th>Time</th><th>Result</th><th>What AI Mentor found</th></tr></thead><tbody>';
      m.latest.rows.forEach(function (r, i) {
        html += '<tr><td class="num">' + (i + 1) + '</td><td><strong>' + esc(D.topicById[r.q.topic].name) + '</strong><div class="list-sub">' + r.q.subject + '</div></td>' +
          '<td class="num">' + UI.fmt(r.timeSec) + '<div class="list-sub">suggested ' + UI.fmt(r.q.expected) + '</div></td><td>' + UI.rowVerdict(r) + '</td>' +
          '<td>' + (r.type && r.type !== 'slow' && r.type !== 'rushed' ? 'Gap: ' + esc(r.gap) : r.type === 'slow' ? 'Needs timed practice' : r.type === 'rushed' ? 'Rushed, basics are fine' : '<span class="muted">No problem</span>') + '</td></tr>';
      });
      html += '</tbody></table></div></section>';
    }
    return html + '</div>';
  };

  /* ================= Problem areas ================= */
  Tc.problems = function () {
    var st = Store.classStats();
    var html = '<div class="page-head"><div><h1>Problem areas</h1><p>Where most students lost marks in ' + D.testName + ', and the exact gap behind each one.</p></div></div><div class="stack">';

    html += '<section class="card"><div class="card-head"><div><h2>Topics to teach again</h2><p>Most missed first. ' + st.taken + ' students took the test.</p></div></div>';
    st.ranked.forEach(function (x, i) {
      var open = !!openWho[x.q.id];
      html += '<div class="problem"><div class="rank">' + (i + 1) + '</div><div><div class="problem-head"><h3>' + esc(x.topic.name) + '</h3>' + UI.chip(x.q.subject, 'violet') + '</div>' +
        '<div class="meter" data-tip="' + x.wrong + ' of ' + x.takers + ' students wrong"><span class="bar-track"><span class="bar-fill" style="width:' + x.wrongPct + '%;background:' + wrongColor(x.wrongPct) + '"></span></span>' +
        '<strong class="num">' + x.wrong + ' of ' + x.takers + ' wrong (' + x.wrongPct + '%)</strong></div>';
      if (x.wrong) {
        html += '<p class="small"><strong>Exact gaps:</strong> ' + x.gapList.map(function (g) { return esc(g.gap) + ' (' + g.n + ')'; }).join(', ') + '</p>' +
          '<p class="small" style="margin-top:6px">' + reasonChips(x) + '</p>' +
          '<div class="action-line">' + icon('spark', 16) + '<span><strong>Suggested:</strong> ' + esc(AI.classAction(x)) + '</span></div>' +
          '<div style="margin-top:10px"><button type="button" class="btn btn-sm" data-action="toggle-who" data-id="' + x.q.id + '" aria-expanded="' + open + '">' + (open ? 'Hide students' : 'Show the ' + x.wrong + (x.wrong === 1 ? ' student' : ' students')) + '</button></div>';
        if (open) {
          html += '<div class="who-list">' + x.students.map(function (s) {
            return '<a href="#/teacher/student/' + s.id + '" class="chip chip-neutral" data-tip="' + esc(UI.types[s.type].label + (s.type !== 'rushed' ? ': ' + s.gap : '')) + '">' + esc(s.name) + '</a>';
          }).join('') + '</div>';
        }
      } else {
        html += '<p class="small muted">Everyone got this right.</p>';
      }
      html += '</div></div>';
    });
    html += '</section>';

    html += '<section class="card"><div class="card-head"><div><h2>Right answer, but slow</h2><p>Students who took more than one and a half times the suggested time</p></div></div>';
    html += st.slowTopics.length ? '<div class="list">' + st.slowTopics.map(function (x) {
      return '<div class="list-item"><div><div class="list-title">' + esc(x.topic.name) + '</div><div class="list-sub">' + x.q.subject + '. A 10-minute timed drill in class will help.</div></div>' +
        UI.chip(x.slow + (x.slow === 1 ? ' student' : ' students'), 'mid') + '</div>';
    }).join('') + '</div>' : '<p class="muted">No one was slow in this test.</p>';
    html += '</section>';

    html += '<section class="card"><div class="card-head"><div><h2>Batch topic table</h2><p>Average strength of the whole batch in each topic, out of 100</p></div></div>' + UI.topicTable(st.masteryAvg) + '</section>';
    return html + '</div>';
  };
  function reasonChips(x) {
    var out = [];
    if (x.types.concept) out.push(UI.chip('Concept not clear: ' + x.types.concept, 'weak'));
    if (x.types.application) out.push(UI.chip('Needs problem practice: ' + x.types.application, 'mid'));
    if (x.types.rushed) out.push(UI.chip('Answered too fast: ' + x.types.rushed, 'mid'));
    return out.join(' ');
  }

  /* ================= Review questions ================= */
  Tc.review = function () {
    var st = Store.classStats(), rv = Store.review();
    var doneCount = D.review.filter(function (q) { return rv[q.id]; }).length;
    var html = '<div class="page-head"><div><h1>Review questions</h1><p>AI Mentor suggests practice questions for the gaps it found. No question reaches a student until a teacher approves it.</p></div>' +
      UI.chip(doneCount + ' of ' + D.review.length + ' reviewed', doneCount === D.review.length ? 'good' : 'neutral') + '</div><div class="stack">';
    D.review.forEach(function (q) {
      var n = 0;
      st.questions.forEach(function (x) { n += x.gaps[q.forGap] || 0; });
      var state = rv[q.id];
      html += '<section class="card"><div class="problem-head">' + UI.chip(q.subject, 'violet') + UI.chip(q.level, 'neutral') +
        '<span class="small muted">For the gap “' + esc(q.forGap) + '”' + (n ? ', missed by ' + n + (n === 1 ? ' student' : ' students') : '') + '</span></div>' +
        '<p class="review-q">' + q.text + '</p><div class="review-opts">' + q.options.map(function (o, i) {
          return '<span class="' + (i === q.answer ? 'is-right' : '') + '">' + 'ABCD'.charAt(i) + '. ' + o + (i === q.answer ? ' <span class="small">(correct answer)</span>' : '') + '</span>';
        }).join('') + '</div><div class="btn-row" style="align-items:center">';
      if (state) {
        html += UI.chip(state === 'approved' ? 'Approved. Added to practice sets.' : 'Rejected. Will not be used.', state === 'approved' ? 'good' : 'weak') +
          '<button type="button" class="btn btn-sm btn-plain" data-action="review-undo" data-id="' + q.id + '">Undo</button>';
      } else {
        html += '<button type="button" class="btn btn-primary btn-sm" data-action="review-approve" data-id="' + q.id + '">' + icon('tick', 16) + 'Approve</button>' +
          '<button type="button" class="btn btn-sm" data-action="review-reject" data-id="' + q.id + '">Reject</button>';
      }
      html += '</div></section>';
    });
    return html + '</div>';
  };

  /* ================= Parent report (opens over the page) ================= */
  Tc.overlay = function () {
    if (!reportFor) return '';
    var m = Store.model(reportFor);
    if (!m) return '';
    var first = m.name.split(' ')[0];
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var now = new Date();
    var strong = D.topics.slice().sort(function (a, b) { return m.mastery[b.id] - m.mastery[a.id]; }).slice(0, 3);
    var next = m.plan.tasks.filter(function (t) { return !m.planDone[t.id]; }).slice(0, 4);

    var html = '<div class="modal-back" data-action="report-close-back"><div class="modal" role="dialog" aria-modal="true" aria-label="Parent report for ' + esc(m.name) + '">' +
      '<div class="modal-tools"><button type="button" class="btn btn-sm" data-action="report-close">' + icon('back', 16) + 'Close</button>' +
      '<button type="button" class="btn btn-primary btn-sm" data-action="print">' + icon('print', 16) + 'Print or save as PDF</button></div>' +
      '<div class="report"><div class="report-head"><div><h2>Progress report for parents</h2><p class="muted">' + esc(D.school.name) + ' (demo)</p></div>' +
      '<div class="small" style="text-align:right"><strong>' + esc(m.name) + '</strong><br>' + classLabel + ', roll no. ' + m.roll + '<br>' + months[now.getMonth()] + ' ' + now.getFullYear() + '</div></div>' +
      '<section><h3>Summary</h3><p>' + esc(AI.summary(m)) + '</p></section>' +
      '<section><h3>Marks in the weekly mocks</h3><table class="table"><thead><tr>' + m.scores.map(function (s) { return '<th>' + s.short + '</th>'; }).join('') + '</tr></thead>' +
      '<tbody><tr>' + m.scores.map(function (s) { return '<td class="num"><strong>' + s.value + '%</strong></td>'; }).join('') + '</tr></tbody></table></section>' +
      '<section><h3>' + esc(first) + ' is doing well in</h3><ul>' + strong.map(function (t) { return '<li>' + esc(t.name) + ' (' + t.subject + ')</li>'; }).join('') + '</ul></section>' +
      '<section><h3>' + esc(first) + ' needs to work on</h3>' + (m.findings.length ? '<ul>' + m.findings.map(function (f) {
        return '<li><strong>' + esc(f.gap) + '</strong> (' + f.subject + '): ' + UI.types[f.type].label.toLowerCase() + '.</li>';
      }).join('') + '</ul>' : '<p>No weak topics found in the last test.</p>') + '</section>' +
      '<section><h3>Plan for this week</h3>' + (next.length ? '<ul>' + next.map(function (t) { return '<li>' + esc(t.title) + ' (' + t.minutes + ' minutes)</li>'; }).join('') + '</ul>' : '<p>All tasks for this week are done.</p>') +
      '<p class="small muted" style="margin-top:6px">' + m.planDoneCount + ' of ' + m.plan.tasks.length + ' tasks done so far.</p></section>' +
      '<p class="report-note">Written by AI Mentor from test data and checked by the class teacher before it is sent. This is a demo with sample data.</p>' +
      '</div></div></div>';
    return html;
  };

  /* ================= Actions ================= */
  Tc.actions = {
    'st-filter': function (el) { filter.status = el.getAttribute('data-id'); render(); },
    'open-student': function (el) { HNSA.App.go('#/teacher/student/' + el.getAttribute('data-id')); },
    'open-centre': function () { HNSA.App.go('#/teacher/dashboard'); },
    'toggle-who': function (el) { var id = el.getAttribute('data-id'); openWho[id] = !openWho[id]; render(); },
    'report-open': function (el) { reportFor = el.getAttribute('data-id'); render(); },
    'report-close': function () { reportFor = null; render(); },
    'report-close-back': function (el, ev) { if (ev.target === el) { reportFor = null; render(); } },
    'print': function () { window.print(); },
    'review-approve': function (el) { Store.setReview(el.getAttribute('data-id'), 'approved'); render(); },
    'review-reject': function (el) { Store.setReview(el.getAttribute('data-id'), 'rejected'); render(); },
    'review-undo': function (el) { Store.setReview(el.getAttribute('data-id'), null); render(); }
  };
  Tc.inputs = {
    'st-search': function (el) { filter.q = el.value; render(); }
  };
  Tc.resetLocal = function () { filter = { q: '', status: 'all' }; openWho = {}; reportFor = null; };
  Tc.closeOverlay = function () { if (reportFor) { reportFor = null; return true; } return false; };
})();
