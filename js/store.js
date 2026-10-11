/*
  store.js: keeps the demo state in the browser (localStorage) and
  builds one "model" per student that every screen reads from.

  Saved state:
    session   who is logged in (student or teacher)
    attempt   the demo student's Weekly Mock 6 answers, times and follow-ups
    planDone  which plan tasks the demo student has ticked
    review    which AI-suggested questions the teacher approved or rejected
*/
(function () {
  'use strict';
  var HNSA = (window.HNSA = window.HNSA || {});
  var D = HNSA.Data, AI = HNSA.AI;
  var Store = (HNSA.Store = {});
  var KEY = 'ajmal-super40-ai-mentor-demo-v1';

  function blank() { return { session: null, attempt: null, planDone: {}, review: {} }; }
  var state = blank(), cache = null;

  function load() {
    try {
      var raw = window.localStorage.getItem(KEY);
      if (raw) {
        var s = JSON.parse(raw), b = blank(), k;
        for (k in b) if (s && s[k] !== undefined) b[k] = s[k];
        state = b;
      }
    } catch (e) { /* storage blocked: the demo still works, it just forgets on reload */ }
  }
  function save() {
    cache = null;
    try { window.localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }
  load();

  Store.chat = []; // chat messages are kept only while the page is open

  Store.session = function () { return state.session; };
  Store.login = function (role) { state.session = { role: role }; save(); };
  Store.logout = function () { state.session = null; Store.chat = []; save(); };
  Store.reset = function () { state = blank(); Store.chat = []; save(); };

  Store.attempt = function () { return state.attempt; };
  Store.saveAttempt = function (attempt) { state.attempt = attempt; state.planDone = {}; save(); };
  Store.clearAttempt = function () { state.attempt = null; state.planDone = {}; save(); };

  Store.toggleTask = function (id) {
    if (state.planDone[id]) delete state.planDone[id]; else state.planDone[id] = true;
    save();
  };
  Store.review = function () { return state.review; };
  Store.setReview = function (id, value) {
    if (value) state.review[id] = value; else delete state.review[id];
    save();
  };

  function build(s) {
    var attempt = s.isDemo ? state.attempt : s.attempt;
    var m = { id: s.id, roll: s.roll, name: s.name, aspirant: s.aspirant, isDemo: s.isDemo };
    m.initials = s.name.split(' ').map(function (p) { return p.charAt(0); }).join('').slice(0, 2);
    m.scores = s.history.map(function (v, i) { return { label: 'Weekly Mock ' + (i + 1), short: 'Mock ' + (i + 1), value: v }; });
    m.taken = !!attempt;

    if (attempt) {
      m.latest = AI.analyse(attempt);
      m.scores.push({ label: D.testName, short: 'Test 6', value: m.latest.pct });
      m.findings = m.latest.findings;
      m.findingsFrom = D.testName;
      m.mastery = AI.masteryAfter(s.baseMastery, m.latest);
    } else {
      m.latest = null;
      m.mastery = {};
      D.topics.forEach(function (t) { m.mastery[t.id] = s.baseMastery[t.id]; });
      m.findings = s.seedFindings || lowestTopicFinding(m);
      m.findingsFrom = D.prevTestName;
    }

    m.subjectMastery = {};
    D.subjects.forEach(function (sub) {
      var list = D.topics.filter(function (t) { return t.subject === sub; });
      m.subjectMastery[sub] = Math.round(list.reduce(function (a, t) { return a + m.mastery[t.id]; }, 0) / list.length);
    });

    m.plan = AI.buildPlan(m.findings);
    m.planDone = {};
    if (s.isDemo) {
      m.plan.tasks.forEach(function (t) { if (state.planDone[t.id]) m.planDone[t.id] = true; });
    } else {
      var n = Math.floor(s.planDoneShare * m.plan.tasks.length);
      m.plan.tasks.slice(0, n).forEach(function (t) { m.planDone[t.id] = true; });
    }
    m.planDoneCount = Object.keys(m.planDone).length;

    var pct = m.taken ? m.latest.pct : null;
    m.status = !m.taken ? { key: 'absent', label: 'Test not taken', kind: 'neutral' }
             : pct >= 70 ? { key: 'ok', label: 'On track', kind: 'good' }
             : pct >= 50 ? { key: 'watch', label: 'Needs attention', kind: 'mid' }
             : { key: 'help', label: 'Needs help', kind: 'weak' };
    return m;
  }

  function lowestTopicFinding(m) {
    var low = null;
    D.topics.forEach(function (t) { if (!low || m.mastery[t.id] < m.mastery[low.id]) low = t; });
    return [{ key: 't5-' + low.id, type: 'concept', subject: low.subject, topic: low.id, rootTopic: low.id, gap: low.name,
              evidence: 'Lowest area in ' + D.prevTestName + '.', tip: '' }];
  }

  function all() {
    if (!cache) {
      var models = D.students.map(build), byId = {};
      models.forEach(function (m) { byId[m.id] = m; });
      cache = { models: models, byId: byId, stats: AI.classStats(models) };
    }
    return cache;
  }
  Store.models = function () { return all().models; };
  Store.model = function (id) { return all().byId[id]; };
  Store.me = function () { return all().byId[D.demoStudentId]; };
  Store.classStats = function () { return all().stats; };
})();
