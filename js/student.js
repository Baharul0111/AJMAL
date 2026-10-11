/*
  student.js: the screens a student sees.
    Home, Take test (with timer and AI follow-up questions), Result,
    My progress, Learning plan, Ask AI Mentor.
*/
(function () {
  'use strict';
  var HNSA = (window.HNSA = window.HNSA || {});
  var D = HNSA.Data, AI = HNSA.AI, Store = HNSA.Store, UI = HNSA.UI, Charts = HNSA.Charts;
  var esc = UI.esc, icon = UI.icon;
  var S = (HNSA.Student = {});

  S.nav = [
    { route: 'home', label: 'Home', icon: 'home' },
    { route: 'test', label: 'Take test', icon: 'test', also: ['result'] },
    { route: 'progress', label: 'My progress', icon: 'chart' },
    { route: 'plan', label: 'Learning plan', icon: 'plan' },
    { route: 'mentor', label: 'Ask AI Mentor', icon: 'chat' }
  ];

  var T = null;            // the test in progress (kept in memory only)
  var clock = null;        // stopwatch timer
  var pickedTopic = null;  // tile selected on "My progress"
  var render = function () { HNSA.App.render(); };

  function mentorSay(html) {
    return '<div class="mentor"><div class="mentor-face">' + icon('spark', 20) + '</div><div class="mentor-say">' + html + '</div></div>';
  }
  function trendChart(me) {
    var stats = Store.classStats();
    var labels = ['Mock 1', 'Mock 2', 'Mock 3', 'Mock 4', 'Mock 5', 'Mock 6'];
    var mine = me.scores.map(function (s) { return s.value; });
    while (mine.length < 6) mine.push(null);
    return Charts.line({ labels: labels, label: 'Your score in each weekly mock, with the batch average',
      series: [{ name: 'Batch average', color: '#9a97ae', values: stats.trend }, { name: 'You', color: '#0f7a4d', values: mine }] });
  }

  function subjectBars(me) {
    return Charts.bars(D.subjects.map(function (s) {
      return { label: s, value: me.subjectMastery[s], note: String(me.subjectMastery[s]), tip: s + ': ' + me.subjectMastery[s] + ' out of 100' };
    }));
  }

  /* ================= Home ================= */
  S.home = function () {
    var me = Store.me(), first = me.name.split(' ')[0];
    var html = '<div class="page-head"><div><h1>' + UI.greeting() + ', ' + esc(first) + '</h1>' +
      '<p>' + D.school.className + ', ' + D.school.section + ', ' + D.school.centre + ' centre, roll no. ' + me.roll + '. Aiming for ' + me.aspirant + '.</p></div></div><div class="stack">';

    if (!me.taken) {
      html += '<section class="card card-violet"><h2>' + D.testName + ' is ready</h2>' +
        '<p class="muted" style="margin:6px 0 16px">8 questions, about 7 minutes. AI Mentor checks your answers and your time, then makes your plan.</p>' +
        '<a class="btn" href="#/student/test">' + icon('test', 18) + 'Take the test</a></section>';
    } else {
      html += '<section class="card card-violet"><h2>' + D.testName + ': ' + me.latest.score + ' out of ' + me.latest.total + '</h2>' +
        '<p class="muted" style="margin:6px 0 16px">' + (me.findings.length ? 'AI Mentor found ' + me.findings.length + (me.findings.length === 1 ? ' thing' : ' things') + ' to work on and made your plan for this week.' : 'No weak topics found. Your plan keeps your strong topics strong.') + '</p>' +
        '<a class="btn" href="#/student/result">See my result</a></section>';
    }

    var today = me.plan.days[0];
    html += '<div class="grid-2"><section class="card"><div class="card-head"><div><h2>Today in your plan</h2><p>' + today.minutes + ' minutes</p></div>' +
      '<a class="btn btn-sm" href="#/student/plan">Open plan</a></div><div class="tasks">' +
      today.tasks.map(function (t) { return taskButton(t, me); }).join('') + '</div></section>';

    html += '<section class="card"><div class="card-head"><div><h2>Topics to work on</h2><p>From ' + me.findingsFrom + '</p></div>' +
      '<a class="btn btn-sm" href="#/student/progress">My progress</a></div>';
    if (me.findings.length) {
      html += '<div class="list">' + me.findings.slice(0, 4).map(function (f) {
        return '<div class="list-item"><div><div class="list-title">' + esc(f.gap) + '</div><div class="list-sub">' + f.subject + '</div></div>' + UI.typeChip(f.type) + '</div>';
      }).join('') + '</div>';
    } else {
      html += '<p class="muted">Nothing to fix from the last test. Well done.</p>';
    }
    html += '</section></div>';

    html += '<div class="grid-2"><section class="card"><div class="card-head"><div><h2>Your score so far</h2><p>Each point is one weekly mock</p></div></div>' + trendChart(me) + '</section>' +
      '<section class="card"><div class="card-head"><div><h2>Strength by subject</h2><p>Average of your topic scores, out of 100</p></div></div>' + subjectBars(me) + '</section></div>';
    return html + '</div>';
  };

  function taskButton(t, me, readOnly) {
    var done = !!me.planDone[t.id];
    var inner = '<span class="task-box">' + icon('tick', 14) + '</span>' +
      '<span><span class="task-title">' + esc(t.title) + '</span><br><span class="task-detail">' + esc(t.detail) + '</span></span>' +
      '<span class="task-meta"><span>' + t.minutes + ' min</span>' + UI.chip(t.kind, 'violet') + '</span>';
    if (readOnly) return '<div class="task' + (done ? ' is-done' : '') + '">' + inner + '</div>';
    return '<button type="button" class="task' + (done ? ' is-done' : '') + '" data-action="task" data-id="' + t.id + '" aria-pressed="' + done + '">' + inner + '</button>';
  }
  S.taskButton = taskButton;

  /* ================= Take test ================= */
  function stepsBar(done, total, now) {
    var h = '<div class="steps" aria-hidden="true">';
    for (var i = 0; i < total; i++) h += '<i class="' + (i < done ? 'is-done' : i === now ? 'is-now' : '') + '"></i>';
    return h + '</div>';
  }
  function optionButtons(options, selected, action, locked, answer) {
    return '<div class="opts">' + options.map(function (o, i) {
      var cls = 'opt';
      if (locked) { if (i === answer) cls += ' is-right'; else if (i === selected) cls += ' is-wrong'; }
      else if (i === selected) cls += ' is-on';
      return '<button type="button" class="' + cls + '" data-action="' + action + '" data-i="' + i + '"' + (locked ? ' disabled' : '') +
        ' aria-pressed="' + (i === selected) + '"><span class="opt-key">' + 'ABCD'.charAt(i) + '</span><span>' + o + '</span></button>';
    }).join('') + '</div>';
  }
  function startClock() {
    stopClock();
    clock = window.setInterval(function () {
      var el = document.getElementById('sw-time');
      if (!el || !T || T.phase !== 'question') return;
      var q = D.questions[T.idx], sec = (Date.now() - T.qStart) / 1000;
      el.textContent = UI.fmt(sec);
      el.parentNode.classList.toggle('is-over', sec > q.expected * AI.SLOW);
    }, 500);
  }
  function stopClock() { if (clock) { window.clearInterval(clock); clock = null; } }

  S.test = function () {
    var me = Store.me();
    if (!T) {
      if (me.taken) {
        return '<div class="page-head"><div><h1>' + D.testName + '</h1><p>You have taken this test.</p></div></div>' +
          '<section class="card test-wrap"><div class="result-top">' + Charts.ring(me.latest.score, me.latest.total) +
          '<div><h2>You scored ' + me.latest.score + ' out of ' + me.latest.total + '</h2><p class="muted" style="margin:4px 0 16px">Time taken: ' + UI.fmt(me.latest.timeTotal) + '</p>' +
          '<div class="btn-row"><a class="btn btn-primary" href="#/student/result">See my result</a>' +
          '<button type="button" class="btn" data-action="test-again">Take the test again</button></div></div></div></section>';
      }
      return '<div class="page-head"><div><h1>' + D.testName + '</h1><p>A short NEET-style mock: Physics, Chemistry, Maths and Biology.</p></div></div>' +
        '<section class="card test-wrap">' +
        mentorSay('I look at two things: <b>your answers</b> and <b>your time</b>. If you get one wrong, I will ask two smaller questions to find the exact idea you are missing.') +
        '<div class="facts"><div class="fact"><b>8</b><span>questions</span></div><div class="fact"><b>About 7 min</b><span>no time limit</span></div><div class="fact"><b>1 at a time</b><span>you cannot go back</span></div></div>' +
        '<div class="btn-row"><button type="button" class="btn btn-primary" data-action="test-start">' + icon('test', 18) + 'Start the test</button>' +
        '<button type="button" class="btn btn-plain" data-action="test-sample">Short on time? Fill sample answers</button></div></section>';
    }

    if (T.phase === 'question') {
      var q = D.questions[T.idx], last = T.idx === D.questions.length - 1;
      return '<div class="test-wrap"><div class="test-top"><div><div class="small muted" style="margin-bottom:6px">Question ' + (T.idx + 1) + ' of ' + D.questions.length + '</div>' +
        stepsBar(T.idx, D.questions.length, T.idx) + '</div>' +
        '<div class="stopwatch">' + icon('clock', 16) + '<span id="sw-time">' + UI.fmt((Date.now() - T.qStart) / 1000) + '</span><small>suggested ' + UI.fmt(q.expected) + '</small></div></div>' +
        '<section class="card">' + UI.chip(q.subject, 'violet') + '<p class="q-text">' + q.text + '</p>' +
        optionButtons(q.options, T.sel, 'opt') +
        '<div class="test-actions"><button type="button" class="btn btn-plain" data-action="q-skip">Skip this question</button>' +
        '<button type="button" class="btn btn-primary" id="q-next" data-action="q-next"' + (T.sel === null ? ' disabled' : '') + '>' + (last ? 'Finish test' : 'Next question') + '</button></div></section></div>';
    }

    if (T.phase === 'checking') {
      var items = ['Checking your answers', 'Comparing your time with the suggested time', 'Finding the topics behind each mistake'];
      return '<div class="test-wrap"><section class="card">' + mentorSay('Give me a moment. I am reading your test.') +
        '<div class="checking"><ul>' + items.map(function (t, i) {
          return '<li class="' + (i < T.step ? 'is-done' : i === T.step ? 'is-now' : '') + '"><span class="tickbox">' + icon('tick', 14) + '</span>' + t + '</li>';
        }).join('') + '</ul></div></section></div>';
    }

    if (T.phase === 'fu-intro') {
      var wrong = T.answers.filter(function (a) { return a.choice !== D.questionById[a.qid].answer; }).length;
      var n = T.queue.length;
      var say = 'You answered all 8 questions. I found <b>' + wrong + (wrong === 1 ? ' mistake' : ' mistakes') + '</b>. ' +
        (wrong > n ? 'In this demo I check the first ' + n + '. ' : '') +
        'For ' + (n === 1 ? 'it' : 'each one') + ' I will ask <b>2 smaller questions</b>. They show me the exact idea you are missing, so your plan is not longer than it needs to be.';
      return '<div class="test-wrap"><section class="card">' + mentorSay(say) +
        '<div class="btn-row" style="margin-top:20px"><button type="button" class="btn btn-primary" data-action="fu-start">Start</button>' +
        '<button type="button" class="btn btn-plain" data-action="fu-skip">Skip this step and show my result</button></div></section></div>';
    }

    if (T.phase === 'fu') {
      var item = T.fuList[T.fuIdx], f = item.f, parent = D.questionById[item.qid], topic = D.topicById[parent.topic];
      var mistakeNo = T.queue.indexOf(item.qid) + 1;
      var intro = item.k === 0
        ? 'You missed the <b>' + esc(topic.name.toLowerCase()) + '</b> question. Let me check one idea behind it.'
        : 'One more idea behind the same question.';
      var html = '<div class="test-wrap"><div class="test-top"><div><div class="small muted" style="margin-bottom:6px">Finding the gap: mistake ' + mistakeNo + ' of ' + T.queue.length + '</div>' +
        stepsBar(T.fuIdx, T.fuList.length, T.fuIdx) + '</div>' + UI.chip(parent.subject, 'violet') + '</div>' +
        '<section class="card">' + mentorSay(intro) + '<p class="q-text">' + f.text + '</p>' +
        optionButtons(f.options, T.sel, 'fu-opt', T.checked, f.answer);
      if (T.checked) {
        var ok = T.sel === f.answer;
        html += '<div class="feedback ' + (ok ? 'feedback-good' : 'feedback-bad') + '"><p><strong>' + (ok ? 'Correct.' : 'Not quite. The answer is ' + f.options[f.answer] + '.') + '</strong></p><p>' + f.tip + '</p></div>';
        if (item.k === 1) html += '<div style="margin-top:16px">' + mentorSay(gapLine(parent)) + '</div>';
      }
      var lastFu = T.fuIdx === T.fuList.length - 1;
      html += '<div class="test-actions"><span></span>' + (T.checked
        ? '<button type="button" class="btn btn-primary" data-action="fu-next">' + (lastFu ? 'See my result' : 'Next') + '</button>'
        : '<button type="button" class="btn btn-primary" id="fu-check" data-action="fu-check"' + (T.sel === null ? ' disabled' : '') + '>Check answer</button>') +
        '</div></section></div>';
      return html;
    }
    return '';
  };

  function gapLine(parent) {
    var fa = parent.followups[0], fb = parent.followups[1];
    var aOk = T.fu[fa.id] === fa.answer, bOk = T.fu[fb.id] === fb.answer;
    if (!aOk && !bOk) return '<b>Gap found:</b> both ideas need revision. Start with “' + esc(fa.gap) + '”.';
    if (!aOk || !bOk) return '<b>Gap found:</b> “' + esc((aOk ? fb : fa).gap) + '”. You already know “' + esc((aOk ? fa : fb).gap) + '”, so you can skip that.';
    return '<b>You know both ideas.</b> So the slip is in putting them together, or in rushing. I will plan practice, not revision.';
  }

  function recordAnswer(choice) {
    var q = D.questions[T.idx];
    T.answers.push({ qid: q.id, choice: choice, timeSec: Math.max(1, Math.round((Date.now() - T.qStart) / 1000)) });
    if (T.idx < D.questions.length - 1) {
      T.idx += 1; T.sel = null; T.qStart = Date.now();
      render();
    } else {
      stopClock();
      T.phase = 'checking'; T.step = 0;
      render();
      var tick = function () {
        if (!T || T.phase !== 'checking') return;
        T.step += 1;
        if (T.step < 3) { render(); window.setTimeout(tick, 800); return; }
        T.queue = AI.followupQueue(T.answers);
        if (!T.queue.length) return finish();
        T.phase = 'fu-intro';
        render();
      };
      window.setTimeout(tick, 800);
    }
  }
  function finish() {
    Store.saveAttempt({ answers: T.answers, followups: T.fu });
    T = null; stopClock(); pickedTopic = null;
    HNSA.App.go('#/student/result');
  }

  /* ================= Result ================= */
  S.result = function () {
    var me = Store.me();
    if (!me.taken) return S.test();
    var a = me.latest;
    var html = '<div class="page-head"><div><h1>' + D.testName + ' result</h1><p>Checked by AI Mentor using your answers and your time.</p></div>' +
      '<div class="btn-row"><a class="btn btn-primary" href="#/student/plan">' + icon('plan', 18) + 'Open my learning plan</a></div></div><div class="stack">';

    html += '<section class="card"><div class="result-top">' + Charts.ring(a.score, a.total) + '<div class="result-facts">' +
      '<div><div class="stat-num">' + UI.fmt(a.timeTotal) + '</div><div class="stat-label">time taken (suggested ' + UI.fmt(a.expectedTotal) + ')</div></div>' +
      '<div><div class="stat-num">' + a.findings.length + '</div><div class="stat-label">' + (a.findings.length === 1 ? 'thing' : 'things') + ' to work on</div></div>' +
      '<div>' + D.subjects.map(function (s) { return '<div class="small"><strong>' + s + '</strong> ' + a.perSubject[s].correct + ' of ' + a.perSubject[s].total + '</div>'; }).join('') + '</div>' +
      '</div></div></section>';

    html += '<section><h2 style="margin-bottom:12px">What AI Mentor found</h2>';
    if (a.findings.length) {
      html += '<div class="stack">' + a.findings.map(function (f) { return UI.finding(f); }).join('') + '</div>';
    } else {
      html += '<div class="card">' + mentorSay('All 8 correct and on time. No weak topics in this test. I have planned short revision so your strong topics stay strong.') + '</div>';
    }
    html += '</section>';

    html += '<section class="card"><div class="card-head"><div><h2>Question by question</h2><p>Your answer, the correct answer and your time</p></div></div><div class="table-wrap"><table class="table"><thead><tr>' +
      '<th>No.</th><th>Topic</th><th>Your answer</th><th>Correct answer</th><th>Your time</th><th>Result</th></tr></thead><tbody>';
    a.rows.forEach(function (r, i) {
      var topic = D.topicById[r.q.topic];
      html += '<tr><td class="num">' + (i + 1) + '</td><td><strong>' + esc(topic.name) + '</strong><div class="list-sub">' + r.q.subject + '</div>' +
        '<details class="sol"><summary>Show solution</summary><p>' + r.q.text + '</p><p><strong>Solution:</strong> ' + r.q.explain + '</p></details></td>' +
        '<td>' + (r.skipped ? '<span class="muted">No answer</span>' : r.q.options[r.choice]) + '</td><td>' + r.q.options[r.q.answer] + '</td>' +
        '<td class="num">' + UI.fmt(r.timeSec) + '<div class="list-sub">suggested ' + UI.fmt(r.q.expected) + '</div></td><td>' + UI.rowVerdict(r) + '</td></tr>';
    });
    html += '</tbody></table></div></section>';

    html += '<div class="btn-row"><a class="btn" href="#/student/progress">See my progress</a>' +
      '<button type="button" class="btn" data-action="test-again">Take the test again</button></div>';
    return html + '</div>';
  };

  /* ================= My progress ================= */
  S.progress = function () {
    var me = Store.me();
    if (!pickedTopic) {
      pickedTopic = D.topics.slice().sort(function (x, y) { return me.mastery[x.id] - me.mastery[y.id]; })[0].id;
    }
    var html = '<div class="page-head"><div><h1>My progress</h1><p>How you are doing in each test, subject and topic.</p></div></div><div class="stack">';

    html += '<div class="grid-2"><section class="card"><div class="card-head"><div><h2>Score by test</h2><p>Percent correct in each weekly mock</p></div></div>' + trendChart(me) + '</section>';
    html += '<section class="card"><div class="card-head"><div><h2>Strength by subject</h2><p>Average of your topic scores, out of 100</p></div></div>' +
      subjectBars(me) + '</section></div>';

    var t = D.topicById[pickedTopic], pct = me.mastery[t.id], lv = UI.level(pct);
    var f = me.findings.filter(function (x) { return x.rootTopic === t.id || x.topic === t.id; })[0];
    html += '<section class="card"><div class="card-head"><div><h2>My topic table</h2><p>One tile for each topic. The number is your strength out of 100. Choose a tile to see what to do.</p></div></div>' +
      UI.topicTable(me.mastery, { action: 'pick-topic', selected: pickedTopic }) +
      '<div class="finding finding-' + (lv.key === 'good' ? 'good' : lv.key) + '" style="margin-top:16px;border-left-color:var(--' + lv.key + ')">' +
      '<header><div><h3>' + esc(t.name) + '</h3><p class="muted">' + t.subject + ', NCERT chapter “' + esc(t.chapter) + '”</p></div>' + UI.chip(lv.label + ', ' + pct, lv.key) + '</header>';
    if (f) {
      html += '<p><strong>Why:</strong> ' + esc(f.evidence) + '</p><div class="finding-do"><strong>What to do</strong><ol>' +
        AI.advice(f).map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol></div>';
    } else if (lv.key === 'good') {
      html += '<p>This topic is strong. A short mixed revision once a week is enough.</p>';
    } else if (lv.key === 'mid') {
      html += '<p>You are getting there. Solve 10 mixed questions on this topic this week to move it to green.</p>';
    } else {
      html += '<p>This topic needs work. Revise the chapter notes, then solve 10 easy questions before trying harder ones.</p>';
    }
    html += '</div></section>';

    html += '<section class="card"><div class="card-head"><div><h2>Past mocks</h2></div></div><div class="table-wrap"><table class="table"><thead><tr><th>Mock</th><th>Score</th><th>Change</th></tr></thead><tbody>';
    me.scores.slice().reverse().forEach(function (s, i, arr) {
      var prev = arr[i + 1], d = prev ? s.value - prev.value : null;
      html += '<tr><td>' + s.label + '</td><td class="num"><strong>' + s.value + '%</strong></td><td class="num">' +
        (d === null ? '<span class="muted">First mock</span>' : d > 0 ? '<span class="up">Up ' + d + '</span>' : d < 0 ? '<span class="down">Down ' + Math.abs(d) + '</span>' : 'No change') + '</td></tr>';
    });
    html += '</tbody></table></div></section>';
    return html + '</div>';
  };

  /* ================= Learning plan ================= */
  S.plan = function () {
    var me = Store.me(), total = me.plan.tasks.length, done = me.planDoneCount;
    var html = '<div class="page-head"><div><h1>Learning plan</h1><p>Made by AI Mentor from ' + me.findingsFrom + '. About ' + AI.DAILY_MINUTES + ' minutes a day, weakest ideas first.</p></div></div><div class="stack">';
    if (!me.taken) {
      html += '<section class="card">' + mentorSay('This plan is from ' + D.prevTestName + '. Take ' + D.testName + ' and I will make a fresh plan from your new answers.') +
        '<div style="margin-top:14px"><a class="btn btn-primary" href="#/student/test">Take the test</a></div></section>';
    }
    html += '<section class="card"><div class="card-head" style="margin-bottom:0"><div><h2>' + done + ' of ' + total + ' tasks done</h2><p>Tick a task when you finish it.</p></div></div>' +
      '<div class="plan-progress" role="progressbar" aria-valuemin="0" aria-valuemax="' + total + '" aria-valuenow="' + done + '"><i style="width:' + (total ? (done / total) * 100 : 0) + '%"></i></div></section>';
    html += '<section class="card">' + me.plan.days.map(function (day) {
      var nm = UI.dayName(day);
      return '<div class="day"><div><div class="day-name">' + nm.lead + '</div><div class="day-date">' + nm.date + '</div><div class="day-min">' + day.minutes + ' min</div></div>' +
        '<div class="tasks">' + day.tasks.map(function (t) { return taskButton(t, me); }).join('') + '</div></div>';
    }).join('') + '</section>';
    return html + '</div>';
  };

  /* ================= Ask AI Mentor ================= */
  var suggestions = ['Which topic should I study first?', 'How should I prepare for it?', 'Am I too slow or too fast?', 'Explain my last mistake', 'How is my progress?'];
  S.mentor = function () {
    var me = Store.me(), first = me.name.split(' ')[0];
    var html = '<div class="page-head"><div><h1>Ask AI Mentor</h1><p>Ask about your weak topics, your time or your plan.</p></div></div>' +
      '<section class="card" style="max-width:760px"><div class="chat" id="chat">' +
      mentorSay('Hello ' + esc(first) + '. I have read your ' + me.findingsFrom + ' answers. What would you like to know?');
    Store.chat.forEach(function (m) {
      html += m.from === 'me' ? '<div class="msg-me">' + esc(m.text) + '</div>' : mentorSay(m.typing ? '<span class="muted">Thinking…</span>' : esc(m.text));
    });
    html += '</div><div class="suggest">' + suggestions.map(function (s) {
      return '<button type="button" class="pill" data-action="ask" data-text="' + esc(s) + '">' + esc(s) + '</button>';
    }).join('') + '</div>' +
      '<form class="chat-form" data-form="ask"><input class="input" id="ask-input" name="q" autocomplete="off" placeholder="Type your question" aria-label="Your question">' +
      '<button class="btn btn-primary" type="submit">' + icon('send', 18) + 'Send</button></form>' +
      '<p class="login-note">Demo: answers come from simple rules based on your test data, not from a live AI model.</p></section>';
    return html;
  };
  function ask(text) {
    text = String(text || '').trim();
    if (!text) return;
    Store.chat.push({ from: 'me', text: text });
    var wait = { from: 'ai', typing: true, text: '' };
    Store.chat.push(wait);
    render(); showLatest();
    window.setTimeout(function () {
      wait.typing = false; wait.text = AI.reply(text, Store.me());
      if (HNSA.App.route().page === 'mentor') { render(); showLatest(); }
    }, 650);
  }

  function showLatest() {
    var form = document.querySelector('.chat-form');
    if (form && form.scrollIntoView) form.scrollIntoView({ block: 'nearest' });
  }

  /* ================= Actions ================= */
  S.actions = {
    'test-start': function () {
      T = { phase: 'question', idx: 0, sel: null, answers: [], fu: {}, qStart: Date.now() };
      startClock(); render();
    },
    'test-again': function () {
      Store.clearAttempt(); T = null; pickedTopic = null;
      if (HNSA.App.route().page === 'test') render(); else HNSA.App.go('#/student/test');
    },
    'test-sample': function () {
      // A ready-made attempt that shows every kind of finding.
      Store.saveAttempt({
        answers: [
          { qid: 'p1', choice: 0, timeSec: 58 }, { qid: 'c1', choice: 1, timeSec: 64 }, { qid: 'm1', choice: 0, timeSec: 9 },
          { qid: 'b1', choice: 1, timeSec: 16 }, { qid: 'p2', choice: 1, timeSec: 128 }, { qid: 'c2', choice: 1, timeSec: 31 },
          { qid: 'm2', choice: 0, timeSec: 47 }, { qid: 'b2', choice: 1, timeSec: 14 }
        ],
        followups: { p1a: 1, p1b: 1, c1a: 2, c1b: 1, m1a: 1, m1b: 0 }
      });
      T = null; pickedTopic = null;
      HNSA.App.go('#/student/result');
    },
    'opt': function (el) {
      if (!T || T.phase !== 'question') return;
      T.sel = Number(el.getAttribute('data-i'));
      selectInPlace(el, 'q-next');
    },
    'q-next': function () { if (T && T.phase === 'question' && T.sel !== null) recordAnswer(T.sel); },
    'q-skip': function () { if (T && T.phase === 'question') recordAnswer(null); },
    'fu-start': function () {
      T.fuList = [];
      T.queue.forEach(function (qid) {
        D.questionById[qid].followups.forEach(function (f, k) { T.fuList.push({ qid: qid, f: f, k: k }); });
      });
      T.phase = 'fu'; T.fuIdx = 0; T.sel = null; T.checked = false;
      render();
    },
    'fu-skip': function () { finish(); },
    'fu-opt': function (el) {
      if (!T || T.phase !== 'fu' || T.checked) return;
      T.sel = Number(el.getAttribute('data-i'));
      selectInPlace(el, 'fu-check');
    },
    'fu-check': function () {
      if (!T || T.sel === null) return;
      T.fu[T.fuList[T.fuIdx].f.id] = T.sel; T.checked = true;
      render();
    },
    'fu-next': function () {
      if (T.fuIdx < T.fuList.length - 1) { T.fuIdx += 1; T.sel = null; T.checked = false; render(); }
      else finish();
    },
    'task': function (el) { Store.toggleTask(el.getAttribute('data-id')); render(); },
    'pick-topic': function (el) { pickedTopic = el.getAttribute('data-id'); render(); },
    'ask': function (el) { ask(el.getAttribute('data-text')); }
  };
  S.forms = {
    'ask': function (form) { var v = form.elements.q.value; form.elements.q.value = ''; ask(v); }
  };

  // Mark the chosen option without redrawing the page (keeps the stopwatch smooth).
  function selectInPlace(el, nextId) {
    var all = el.parentNode.querySelectorAll('.opt');
    for (var i = 0; i < all.length; i++) {
      all[i].classList.toggle('is-on', all[i] === el);
      all[i].setAttribute('aria-pressed', all[i] === el ? 'true' : 'false');
    }
    var btn = document.getElementById(nextId);
    if (btn) btn.disabled = false;
  }

  S.onLeave = function () { /* the test keeps its place if the student opens another page */ };
  S.resetLocal = function () { T = null; stopClock(); pickedTopic = null; };
  S.inTest = function () { return !!T; };
})();
