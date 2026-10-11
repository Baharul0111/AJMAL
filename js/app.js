/*
  app.js: login screen, page frame (side menu), routing and click handling.

  Pages are chosen by the part after # in the address, for example
  #/student/home or #/teacher/problems. This works when index.html is
  opened directly from a folder, with no server.
*/
(function () {
  'use strict';
  var HNSA = (window.HNSA = window.HNSA || {});
  var D = HNSA.Data, Store = HNSA.Store, UI = HNSA.UI, Student = HNSA.Student, Teacher = HNSA.Teacher;
  var esc = UI.esc, icon = UI.icon;
  var App = (HNSA.App = {});

  var root = document.getElementById('app');
  var loginRole = 'student', notice = '', lastPath = null;
  var HOME = { student: '#/student/home', teacher: '#/teacher/dashboard', foundation: '#/teacher/centres' };

  App.route = function () {
    var parts = (window.location.hash || '').replace(/^#\/?/, '').split('/');
    return { role: parts[0] || '', page: parts[1] || '', arg: parts[2] || '' };
  };
  App.go = function (hash) {
    if (window.location.hash === hash) App.render(); else window.location.hash = hash;
  };

  function brand() {
    return '<div class="brand"><div class="brand-mark" aria-hidden="true"><small>1</small><b>Ai</b></div>' +
      '<div><div class="brand-name">AI Mentor</div><div class="brand-sub">Demo for ' + D.school.short + '</div></div></div>';
  }

  /* ---------- Login ---------- */
  function loginView() {
    var isStudent = loginRole === 'student';
    var heroTiles = [['ve', 36], ['mo', 48], ['tr', 71], ['co', 88]].map(function (p) {
      return UI.tile(D.topicById[p[0]], p[1]);
    }).join('');
    return '<div class="login"><section class="login-art">' + brand() +
      '<div><h1>Find the exact topic each student is missing.</h1>' +
      '<p>Every weekly mock becomes a personal study plan. Runs in the computer lab of each centre. No student phones needed.</p></div>' +
      '<div><div class="hero-tiles">' + heroTiles + '</div><p class="hero-cap">One tile for each topic. The number is the student’s strength out of 100.</p></div></section>' +
      '<section class="login-form"><div class="login-box"><h2>Log in</h2><p class="muted">Choose who you are. The demo details are already filled in.</p>' +
      '<div class="role-switch">' +
      '<button type="button" class="' + (isStudent ? 'is-on' : '') + '" data-action="role" data-id="student" aria-pressed="' + isStudent + '">' + icon('test', 18) + 'Student</button>' +
      '<button type="button" class="' + (loginRole === 'teacher' ? 'is-on' : '') + '" data-action="role" data-id="teacher" aria-pressed="' + (loginRole === 'teacher') + '">' + icon('users', 18) + 'Teacher</button>' +
      '<button type="button" class="' + (loginRole === 'foundation' ? 'is-on' : '') + '" data-action="role" data-id="foundation" aria-pressed="' + (loginRole === 'foundation') + '">' + icon('grid', 18) + 'Foundation</button></div>' +
      '<form data-form="login" autocomplete="off">' +
      '<label class="field"><span>' + (isStudent ? 'Student ID' : loginRole === 'teacher' ? 'Teacher ID' : 'Foundation ID') + '</span><input class="input" name="id" value="' + loginRole + '@ajmalsuper40.demo"></label>' +
      '<label class="field"><span>Password</span><input class="input" name="pw" type="password" value="demo1234" autocomplete="off"></label>' +
      '<button class="btn btn-primary" type="submit">Log in as ' + (isStudent ? 'student' : loginRole === 'teacher' ? 'teacher' : 'Foundation') + '</button></form>' +
      (notice ? '<p class="login-note" role="status"><strong>' + esc(notice) + '</strong></p>' : '') +
      '<p class="login-note">Demo version with sample data. Student names are made up. No real student information is used.</p>' +
      '<button type="button" class="btn btn-plain btn-sm" data-action="reset" style="margin-top:4px">' + icon('reset', 16) + 'Reset demo data</button>' +
      '</div></section></div>';
  }

  /* ---------- Page frame ---------- */
  function frame(role, r, content, overlay) {
    var mod = role === 'student' ? Student : Teacher;
    var me = role === 'student' ? Store.me() : null;
    var who = Store.session().role === 'foundation' ? D.foundation : D.teacher;
    var name = me ? me.name : who.name;
    var sub = me ? D.school.className + ', ' + D.school.section + ', roll no. ' + me.roll : who.role;
    var initials = me ? me.initials : who.initials;
    function links(cls) {
      return mod.nav.filter(function (n) { return !n.only || n.only === Store.session().role; }).map(function (n) {
        var on = r.page === n.route || (n.also && n.also.indexOf(r.page) !== -1);
        return '<a href="#/' + role + '/' + n.route + '" class="' + (on ? 'is-active' : '') + '"' + (on ? ' aria-current="page"' : '') + '>' + icon(n.icon, cls === 'b' ? 22 : 20) + '<span>' + n.label + '</span></a>';
      }).join('');
    }
    return '<div class="shell"><aside class="side">' + brand() + '<nav class="nav" aria-label="Main menu">' + links('s') + '</nav>' +
      '<div class="side-foot"><div class="who"><span class="avatar">' + initials + '</span><div><div class="who-name">' + esc(name) + '</div><div class="who-role">' + esc(sub) + '</div></div></div>' +
      '<div class="side-links"><button type="button" class="btn btn-sm" data-action="logout">' + icon('logout', 16) + 'Log out</button></div></div></aside>' +
      '<div class="main"><div class="demo-bar"><strong class="only-small">AI Mentor</strong><span class="chip chip-neutral">Demo with sample data</span>' +
      '<button type="button" class="btn btn-sm only-small" data-action="logout">Log out</button></div>' +
      '<main class="page" id="page">' + content + '</main></div></div>' +
      '<nav class="bottom-nav" aria-label="Main menu">' + links('b') + '</nav>' + (overlay || '');
  }

  /* ---------- Render ---------- */
  App.render = function () {
    var session = Store.session(), r = App.route();
    hideTip();

    if (!session) {
      if (r.role !== 'login') { lastPath = null; window.location.hash = '#/login'; if (App.route().role !== 'login') return; }
      draw(loginView(), '#/login');
      return;
    }
    var role = session.role === 'foundation' ? 'teacher' : session.role, mod = role === 'student' ? Student : Teacher;
    var known = { student: ['home', 'test', 'result', 'progress', 'plan', 'mentor'], teacher: ['centres', 'dashboard', 'students', 'student', 'problems', 'review'] };
    if (r.role !== role || known[role].indexOf(r.page) === -1) { window.location.hash = HOME[session.role]; return; }

    var content = mod[r.page](r.arg);
    var overlay = role === 'teacher' ? Teacher.overlay() : '';
    draw(frame(role, r, content, overlay), window.location.hash);
  };

  function draw(html, path) {
    // Remember where the keyboard focus was, so redrawing the page does not lose it.
    var a = document.activeElement, keep = null;
    if (a && a !== document.body) {
      keep = { id: a.id, action: a.getAttribute && a.getAttribute('data-action'), did: a.getAttribute && a.getAttribute('data-id'),
               start: a.selectionStart, end: a.selectionEnd };
    }
    root.innerHTML = html;
    if (path !== lastPath) { window.scrollTo(0, 0); lastPath = path; return; }
    if (keep) {
      var el = keep.id ? document.getElementById(keep.id)
             : keep.action ? root.querySelector('[data-action="' + keep.action + '"]' + (keep.did ? '[data-id="' + keep.did + '"]' : '')) : null;
      if (el) {
        el.focus({ preventScroll: true });
        if (keep.id && typeof keep.start === 'number' && el.setSelectionRange) { try { el.setSelectionRange(keep.start, keep.end); } catch (e) { /* not a text field */ } }
      }
    }
  }

  /* ---------- Actions shared by every page ---------- */
  var actions = {
    'role': function (el) { loginRole = el.getAttribute('data-id'); notice = ''; App.render(); },
    'logout': function () { Store.logout(); Student.resetLocal(); Teacher.resetLocal(); notice = ''; App.go('#/login'); },
    'reset': function () {
      Store.reset(); Student.resetLocal(); Teacher.resetLocal();
      notice = 'Demo data has been reset.'; App.go('#/login');
    }
  };
  var forms = {
    'login': function () { notice = ''; Store.login(loginRole); App.go(HOME[loginRole]); }
  };
  function find(kind, name) {
    var session = Store.session(), mod = session ? (session.role === 'student' ? Student : Teacher) : null;
    if (kind === 'actions' && actions[name]) return actions[name];
    if (kind === 'forms' && forms[name]) return forms[name];
    return mod && mod[kind] ? mod[kind][name] : null;
  }

  document.addEventListener('click', function (ev) {
    var el = ev.target.closest ? ev.target.closest('[data-action]') : null;
    if (!el || el.disabled) return;
    var fn = find('actions', el.getAttribute('data-action'));
    if (fn) fn(el, ev);
  });
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && Store.session() && Store.session().role === 'teacher' && Teacher.closeOverlay()) { App.render(); return; }
    // Table rows that open a student behave like links for keyboard users.
    if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.matches && ev.target.matches('tr[data-action]')) {
      ev.preventDefault();
      var fn = find('actions', ev.target.getAttribute('data-action'));
      if (fn) fn(ev.target, ev);
    }
  });
  document.addEventListener('submit', function (ev) {
    var name = ev.target.getAttribute('data-form');
    if (!name) return;
    ev.preventDefault();
    var fn = find('forms', name);
    if (fn) fn(ev.target);
  });
  document.addEventListener('input', function (ev) {
    var name = ev.target.getAttribute && ev.target.getAttribute('data-input');
    var fn = name ? find('inputs', name) : null;
    if (fn) fn(ev.target);
  });
  window.addEventListener('hashchange', App.render);

  /* ---------- Small tooltip for charts and tiles ---------- */
  var tip = document.createElement('div');
  tip.id = 'tip'; tip.setAttribute('role', 'tooltip');
  document.body.appendChild(tip);
  function hideTip() { tip.classList.remove('is-on'); }
  document.addEventListener('mouseover', function (ev) {
    var el = ev.target.closest ? ev.target.closest('[data-tip]') : null;
    if (!el) { hideTip(); return; }
    tip.textContent = el.getAttribute('data-tip');
    tip.classList.add('is-on');
  });
  document.addEventListener('mousemove', function (ev) {
    if (!tip.classList.contains('is-on')) return;
    var x = Math.min(ev.clientX + 14, window.innerWidth - tip.offsetWidth - 8);
    var y = ev.clientY + 18;
    if (y + tip.offsetHeight > window.innerHeight - 8) y = ev.clientY - tip.offsetHeight - 10;
    tip.style.left = Math.max(8, x) + 'px'; tip.style.top = y + 'px';
  });
  document.addEventListener('focusin', function (ev) {
    var el = ev.target.closest ? ev.target.closest('[data-tip]') : null;
    if (!el) { hideTip(); return; }
    var b = el.getBoundingClientRect();
    tip.textContent = el.getAttribute('data-tip');
    tip.style.left = Math.max(8, b.left) + 'px'; tip.style.top = (b.bottom + 8) + 'px';
    tip.classList.add('is-on');
  });

  App.render();
})();
