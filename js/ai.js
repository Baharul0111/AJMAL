/*
  ai.js: the DEMO "AI Mentor".

  This is not a real AI model. It is a small set of clear rules, so the demo
  works offline with no API key and gives the same result every time.
  In the full product, the steps marked [AI] would call a real AI model.

  What it looks at for every question:
    1. Was the answer right or wrong?
    2. How long did it take, compared with the suggested time?
    3. If wrong: the answers to two smaller follow-up questions,
       which show the exact idea the student is missing.
*/
(function () {
  'use strict';
  var HNSA = (window.HNSA = window.HNSA || {});
  var D = HNSA.Data;
  var AI = (HNSA.AI = {});

  AI.FAST = 0.35;        // faster than 35% of the suggested time = answered too fast
  AI.SLOW = 1.5;         // slower than 150% of the suggested time = slow
  AI.MAX_FOLLOW = 3;     // the demo checks follow-ups for up to 3 mistakes
  AI.DAILY_MINUTES = 90; // study time planned per day

  function fmt(sec) {
    sec = Math.max(0, Math.round(sec));
    return Math.floor(sec / 60) + ':' + ('0' + (sec % 60)).slice(-2);
  }
  AI.fmt = fmt;
  function secs(n) { return n + (n === 1 ? ' second' : ' seconds'); }

  AI.speed = function (q, timeSec) {
    var ratio = timeSec / q.expected;
    return ratio < AI.FAST ? 'fast' : ratio > AI.SLOW ? 'slow' : 'ok';
  };

  /* Which mistakes get follow-up questions (first few wrong or skipped answers). */
  AI.followupQueue = function (answers) {
    var out = [];
    answers.forEach(function (a) {
      var q = D.questionById[a.qid];
      if (a.choice !== q.answer && out.length < AI.MAX_FOLLOW) out.push(q.id);
    });
    return out;
  };

  /* [AI] Read one finished test and say what went wrong and why. */
  AI.analyse = function (attempt) {
    var byId = {};
    attempt.answers.forEach(function (a) { byId[a.qid] = a; });
    var fu = attempt.followups || {};
    var rows = [], findings = [], score = 0, timeTotal = 0, expectedTotal = 0, perSubject = {};
    D.subjects.forEach(function (s) { perSubject[s] = { correct: 0, total: 0 }; });

    D.questions.forEach(function (q) {
      var a = byId[q.id] || { choice: null, timeSec: 0 };
      var skipped = a.choice === null || a.choice === undefined;
      var correct = !skipped && a.choice === q.answer;
      var speed = AI.speed(q, a.timeSec);
      var topic = D.topicById[q.topic];
      var row = { q: q, choice: skipped ? null : a.choice, correct: correct, skipped: skipped, timeSec: a.timeSec, speed: speed, type: null };
      timeTotal += a.timeSec; expectedTotal += q.expected;
      perSubject[q.subject].total += 1;
      if (correct) { score += 1; perSubject[q.subject].correct += 1; }

      var f = null;
      if (correct) {
        if (speed === 'slow') {
          f = { type: 'slow', gap: topic.name, rootTopic: q.topic,
                evidence: 'Right answer, but it took ' + fmt(a.timeSec) + '. The suggested time is ' + fmt(q.expected) + '. In an exam this leaves less time for other questions.',
                tip: q.explain };
        }
      } else {
        var fa = q.followups[0], fb = q.followups[1];
        var asked = fu[fa.id] !== undefined && fu[fb.id] !== undefined;
        var tooFast = !skipped && speed === 'fast';
        var lead = skipped ? 'You skipped this question. ' : 'You missed this question. ';
        if (asked) {
          var aOk = fu[fa.id] === fa.answer, bOk = fu[fb.id] === fb.answer;
          if (!aOk && !bOk) {
            f = { type: 'concept', gap: fa.gap, rootTopic: fa.topic, tip: fa.tip,
                  evidence: lead + 'You also missed both smaller questions, so start with “' + fa.gap + '” and then “' + fb.gap + '”.' };
          } else if (!aOk || !bOk) {
            var bad = aOk ? fb : fa, good = aOk ? fa : fb;
            f = { type: 'concept', gap: bad.gap, rootTopic: bad.topic, tip: bad.tip,
                  evidence: lead + 'In the smaller questions you got “' + good.gap + '” right and “' + bad.gap + '” wrong. So the exact gap is “' + bad.gap + '”.' };
          } else if (tooFast) {
            f = { type: 'rushed', gap: topic.name, rootTopic: q.topic, tip: q.explain,
                  evidence: 'You answered in ' + secs(a.timeSec) + '. The suggested time is ' + fmt(q.expected) + '. You got both smaller questions right, so this was a rushed answer, not a concept gap.' };
          } else {
            f = { type: 'application', gap: q.applyGap, rootTopic: q.topic, tip: q.explain,
                  evidence: lead + 'You got both smaller questions right, so you know the basics. The slip is in putting the steps together.' };
          }
        } else if (tooFast) {
          f = { type: 'rushed', gap: topic.name, rootTopic: q.topic, tip: q.explain,
                evidence: 'You answered in ' + secs(a.timeSec) + '. The suggested time is ' + fmt(q.expected) + '. That is too fast to read the question properly.' };
        } else {
          f = { type: 'concept', gap: topic.name, rootTopic: q.topic, tip: q.explain,
                evidence: lead + 'The follow-up check was not done for this one, so revise the whole topic.' };
        }
      }
      if (f) {
        f.key = q.id; f.qid = q.id; f.subject = q.subject; f.topic = q.topic;
        f.timeSec = a.timeSec; f.expected = q.expected;
        row.type = f.type; row.gap = f.gap; row.rootTopic = f.rootTopic;
        findings.push(f);
      }
      rows.push(row);
    });

    var order = { concept: 0, application: 1, slow: 2, rushed: 3 };
    findings.sort(function (x, y) { return order[x.type] - order[y.type]; });
    return { score: score, total: D.questions.length, pct: Math.round((score / D.questions.length) * 100),
             timeTotal: timeTotal, expectedTotal: expectedTotal, perSubject: perSubject, rows: rows, findings: findings };
  };

  /* [AI] Turn one finding into simple steps for the student. */
  AI.advice = function (f) {
    var topic = D.topicById[f.topic], root = D.topicById[f.rootTopic] || topic;
    if (f.type === 'concept') {
      return ['Revise “' + f.gap + '” from NCERT ' + root.subject + ', chapter “' + root.chapter + '”.',
              'Solve 10 easy questions on it.',
              'Take a 5-question check after two days.'];
    }
    if (f.type === 'application') {
      return ['Solve 8 full problems on ' + topic.name.toLowerCase() + '. Write every step.',
              'Take a 5-question check after two days.'];
    }
    if (f.type === 'rushed') {
      return ['Redo this question slowly. Read it twice before you answer.',
              'Solve 5 similar questions without a timer.'];
    }
    return ['Do a timed drill: 10 questions on ' + topic.name.toLowerCase() + '.',
            'Target: ' + fmt(f.expected || 60) + ' per question.'];
  };

  /* [AI] Build a 7-day plan from the findings. Weakest ideas come first. */
  AI.buildPlan = function (findings, start) {
    start = start || new Date();
    var days = [];
    for (var i = 0; i < 7; i++) {
      var d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      days.push({ index: i, date: d, tasks: [], minutes: 0 });
    }
    function place(fromDay, task) {
      var k = Math.min(fromDay, 5);
      while (k < 5 && days[k].minutes + task.minutes > AI.DAILY_MINUTES) k++;
      days[k].tasks.push(task); days[k].minutes += task.minutes;
      return k;
    }
    findings.forEach(function (f) {
      var topic = D.topicById[f.topic], root = D.topicById[f.rootTopic] || topic, d0;
      var base = { subject: root.subject, finding: f.key };
      function T(n, kind, title, detail, minutes) {
        return { id: f.key + '-' + n, kind: kind, title: title, detail: detail, minutes: minutes, subject: base.subject };
      }
      if (f.type === 'concept') {
        d0 = place(0, T(1, 'Revise', 'Revise: ' + f.gap, 'NCERT ' + root.subject + ', chapter “' + root.chapter + '”. Make short notes.', 40));
        place(d0, T(2, 'Practise', '10 easy questions on ' + lower(f.gap), 'Check each answer before moving on.', 30));
        place(d0 + 2, T(3, 'Check', '5-question check on ' + lower(topic.name), 'If you score 4 or 5, this topic turns green.', 15));
      } else if (f.type === 'application') {
        d0 = place(0, T(1, 'Practise', '8 full problems on ' + lower(topic.name), 'Write every step. Do not skip lines.', 40));
        place(d0 + 2, T(2, 'Check', '5-question check on ' + lower(topic.name), 'If you score 4 or 5, this topic turns green.', 15));
      } else if (f.type === 'slow') {
        d0 = place(0, T(1, 'Timed drill', '10 timed questions on ' + lower(topic.name), 'Target: ' + fmt(f.expected || 60) + ' per question.', 25));
        place(d0 + 2, T(2, 'Timed drill', 'Timed drill again on ' + lower(topic.name), 'Try to beat your last time.', 20));
      } else {
        d0 = place(0, T(1, 'Redo', 'Redo the ' + lower(topic.name) + ' question slowly', 'Read the question twice before you answer.', 10));
        place(d0, T(2, 'Practise', '5 more ' + lower(topic.name) + ' questions, no timer', 'Accuracy first. Speed comes later.', 15));
      }
    });
    // Light revision on any empty day, so every day has something small.
    for (var j = 0; j < 6; j++) {
      if (!days[j].tasks.length) {
        days[j].tasks.push({ id: 'keep-' + j, kind: 'Keep up', title: '10 mixed questions from your strong topics',
                             detail: 'A short revision so strong topics stay strong.', minutes: 20, subject: 'All subjects' });
        days[j].minutes += 20;
      }
    }
    days[6].tasks.push({ id: 'retest', kind: 'Check', title: 'Re-test on this week’s topics',
                         detail: '10 questions in the computer lab. Your plan for next week comes from this.', minutes: 20, subject: 'All subjects' });
    days[6].tasks.push({ id: 'mentor', kind: 'Talk', title: 'Show this plan to your mentor',
                         detail: 'Two minutes. Tell them what felt hard.', minutes: 5, subject: 'All subjects' });
    days[6].minutes += 25;
    var all = [];
    days.forEach(function (day) { day.tasks.forEach(function (t) { all.push(t); }); });
    return { days: days, tasks: all };
  };
  function lower(s) { return s.charAt(0).toLowerCase() + s.slice(1); }

  /* Update topic strength (0 to 100) after a test. */
  AI.masteryAfter = function (base, analysis) {
    var m = {}, k;
    for (k in base) m[k] = base[k];
    var outcome = { ok: 92, slow: 72, rushed: 50, application: 45, concept: 30 };
    analysis.rows.forEach(function (r) {
      var t = r.q.topic;
      var o = r.correct ? (r.type === 'slow' ? outcome.slow : outcome.ok) : outcome[r.type];
      m[t] = Math.round(0.45 * m[t] + 0.55 * o);
      if (r.type === 'concept' && r.rootTopic && r.rootTopic !== t) {
        m[r.rootTopic] = Math.round(0.5 * m[r.rootTopic] + 0.5 * 25);
      }
    });
    return m;
  };

  /* [AI] One short paragraph about a student, for the teacher and the parent report. */
  AI.summary = function (model) {
    var first = model.name.split(' ')[0], s;
    var best = bestTopic(model);
    if (!model.taken) {
      s = first + ' has not taken ' + D.testName + ' yet. Last score: ' + model.scores[model.scores.length - 1].value + '% in ' + D.prevTestName + '.';
      if (model.findings.length) s += ' From the last test, the main gap is “' + model.findings[0].gap + '” (' + model.findings[0].subject + ').';
      return s;
    }
    var prev = model.scores[model.scores.length - 2].value, diff = model.latest.pct - prev;
    s = first + ' scored ' + model.latest.score + ' out of ' + model.latest.total + ' in ' + D.testName + ' (' + model.latest.pct + '%), ';
    s += diff > 0 ? 'up ' + diff + ' points from the last mock.' : diff < 0 ? 'down ' + Math.abs(diff) + ' points from the last mock.' : 'the same as the last mock.';
    var concept = model.findings.filter(function (f) { return f.type === 'concept' || f.type === 'application'; });
    var slow = model.findings.filter(function (f) { return f.type === 'slow'; });
    var rushed = model.findings.filter(function (f) { return f.type === 'rushed'; });
    if (concept.length) s += ' Main gap: “' + concept[0].gap + '” (' + concept[0].subject + ').';
    if (slow.length) s += ' Correct but slow in ' + lower(D.topicById[slow[0].topic].name) + '.';
    if (rushed.length) s += ' Rushed the ' + lower(D.topicById[rushed[0].topic].name) + ' question.';
    if (!model.findings.length) s += ' No weak topics found in this mock.';
    if (best) s += ' Strongest area: ' + lower(best.name) + '.';
    return s;
  };
  function bestTopic(model) {
    var top = null, v = -1;
    D.topics.forEach(function (t) { if (model.mastery[t.id] > v) { v = model.mastery[t.id]; top = t; } });
    return top;
  }
  AI.bestTopic = bestTopic;

  /* [AI] Answers in the "Ask AI Mentor" chat. Simple keyword rules in the demo. */
  AI.reply = function (text, model) {
    var t = text.toLowerCase(), f = model.findings, first = f[0];
    function has() { for (var i = 0; i < arguments.length; i++) if (t.indexOf(arguments[i]) !== -1) return true; return false; }

    if (has('first', 'start', 'which topic', 'focus', 'weak', 'priority')) {
      if (!first) return 'No weak topics were found in your last test. Keep doing the short mixed revision in your plan so strong topics stay strong.';
      var why = first.type === 'concept' ? 'the idea itself is not clear yet, and other topics depend on it'
              : first.type === 'application' ? 'you know the basics but lose marks in full problems'
              : first.type === 'slow' ? 'you get it right but lose time' : 'you answered too fast';
      var s = 'Start with “' + first.gap + '” in ' + first.subject + ', because ' + why + '. It is the first task in your learning plan.';
      if (f[1]) s += ' After that, move to “' + f[1].gap + '” (' + f[1].subject + ').';
      return s;
    }
    if (has('time', 'slow', 'fast', 'speed', 'long')) {
      var parts = [];
      f.forEach(function (x) {
        if (x.type === 'slow') parts.push('You were correct but slow in ' + lower(D.topicById[x.topic].name) + ' (' + fmt(x.timeSec) + ' against a suggested ' + fmt(x.expected) + ').');
        if (x.type === 'rushed') parts.push('You answered the ' + lower(D.topicById[x.topic].name) + ' question in only ' + secs(x.timeSec) + ', which is too fast.');
      });
      if (!parts.length) parts.push('Your time per question was fine in the last mock.');
      parts.push('A good target is about 1 minute for a short numerical and 30 seconds for a direct theory question.');
      return parts.join(' ');
    }
    if (has('mistake', 'wrong', 'explain', 'solution', 'why')) {
      if (model.latest) {
        var bad = model.latest.rows.filter(function (r) { return !r.correct; })[0];
        if (bad) return 'In the ' + lower(D.topicById[bad.q.topic].name) + ' question the correct answer is ' + strip(bad.q.options[bad.q.answer]) + '. ' + strip(bad.q.explain);
        return 'You had no wrong answers in ' + D.testName + '. Well done.';
      }
      if (first) return first.evidence + ' Tip: ' + strip(first.tip);
    }
    if (has('score', 'mark', 'result', 'progress')) {
      var last = model.scores[model.scores.length - 1], before = model.scores[0];
      return 'Your latest score is ' + last.value + '% (' + last.label + '). You started at ' + before.value + '% in ' + before.label + '. ' +
             (last.value >= before.value ? 'That is a rise of ' + (last.value - before.value) + ' points.' : 'That is a drop, so let us fix the weak topics first.');
    }
    if (has('prepare', 'how', 'study', 'improve', 'plan')) {
      if (!first) return 'Keep your daily routine: one short mixed revision each day and the re-test at the end of the week.';
      var steps = AI.advice(first).map(function (x, i) { return (i + 1) + '. ' + x; }).join(' ');
      return 'For “' + first.gap + '”: ' + steps + ' Your learning plan already has these as daily tasks, about ' + AI.DAILY_MINUTES + ' minutes a day.';
    }
    if (has('neet', 'jee', 'board', 'exam')) {
      return 'For both the board exam and ' + model.aspirant + ', you need clear basics and good speed. Your plan mixes both: “Revise” and “Practise” tasks build the basics, and “Timed drill” tasks build speed.';
    }
    if (has('hello', 'hi', 'hey')) return 'Hello ' + model.name.split(' ')[0] + '. Ask me about your weak topics, your time, or how to prepare.';
    return 'I am a demo, so I can only answer questions about your test, weak topics, time and learning plan. Try one of the suggested questions below.';
  };
  function strip(html) { return String(html).replace(/<sup>(.*?)<\/sup>/g, '^$1').replace(/<[^>]+>/g, ''); }

  /* Class-level numbers for the teacher. */
  AI.classStats = function (models) {
    var takers = models.filter(function (m) { return m.taken; });
    var st = { total: models.length, taken: takers.length, avgPct: 0, questions: [], subjectAvg: {}, trend: [], masteryAvg: {}, slowTopics: [] };
    st.avgPct = takers.length ? Math.round(takers.reduce(function (s, m) { return s + m.latest.pct; }, 0) / takers.length) : 0;

    D.questions.forEach(function (q, qi) {
      var item = { q: q, topic: D.topicById[q.topic], takers: takers.length, wrong: 0, slow: 0,
                   types: { concept: 0, application: 0, rushed: 0 }, gaps: {}, students: [] };
      takers.forEach(function (m) {
        var r = m.latest.rows[qi];
        if (!r.correct) {
          item.wrong += 1; item.types[r.type] += 1;
          if (r.type !== 'rushed') item.gaps[r.gap] = (item.gaps[r.gap] || 0) + 1;
          item.students.push({ id: m.id, name: m.name, type: r.type, gap: r.gap, isDemo: m.isDemo });
        } else if (r.type === 'slow') { item.slow += 1; }
      });
      item.wrongPct = takers.length ? Math.round((item.wrong / takers.length) * 100) : 0;
      item.gapList = Object.keys(item.gaps).map(function (g) { return { gap: g, n: item.gaps[g] }; })
                           .sort(function (a, b) { return b.n - a.n; });
      st.questions.push(item);
    });
    st.ranked = st.questions.slice().sort(function (a, b) { return b.wrong - a.wrong; });
    st.slowTopics = st.questions.filter(function (x) { return x.slow > 0; }).sort(function (a, b) { return b.slow - a.slow; });

    D.subjects.forEach(function (s) {
      var c = 0, t = 0;
      takers.forEach(function (m) { c += m.latest.perSubject[s].correct; t += m.latest.perSubject[s].total; });
      st.subjectAvg[s] = t ? Math.round((c / t) * 100) : 0;
    });
    for (var k = 0; k < 5; k++) {
      st.trend.push(Math.round(models.reduce(function (s, m) { return s + m.scores[k].value; }, 0) / models.length));
    }
    st.trend.push(st.avgPct);
    D.topics.forEach(function (t) {
      st.masteryAvg[t.id] = Math.round(models.reduce(function (s, m) { return s + m.mastery[t.id]; }, 0) / models.length);
    });
    return st;
  };

  /* What the teacher should do about a topic most students got wrong. */
  AI.classAction = function (item) {
    var main = item.gapList[0] ? item.gapList[0].gap : item.topic.name;
    if (item.wrongPct >= 40) return 'Teach “' + main + '” again to the whole batch (one period).';
    if (item.wrongPct >= 20) return 'Hold a small-group session on “' + main + '” for these ' + item.wrong + ' students.';
    if (item.wrong > 0) return 'Individual follow-up is enough. Most of the batch is fine.';
    return 'No action needed.';
  };
})();
