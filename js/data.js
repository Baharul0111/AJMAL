/*
  data.js: all sample data for the demo.

  Nothing here is real. Student names are made up.
  To change the demo, edit the lists in this file:
    - TOPICS      the tiles shown in the topic table
    - QUESTIONS   the 8 test questions, each with 2 smaller follow-up questions
    - REVIEW      AI-suggested questions that wait for a teacher's approval
    - STUDENTS    the 24 sample students of Class XI A
*/
(function () {
  'use strict';
  var HNSA = (window.HNSA = window.HNSA || {});
  var D = (HNSA.Data = {});

  D.school = { name: 'Ajmal Super 40, Ajmal Foundation', short: 'Ajmal Super 40', className: 'NEET Two-Year', section: 'Batch A', centre: 'Hojai' };
  D.testName = 'Weekly Mock 6';
  D.prevTestName = 'Weekly Mock 5';
  D.demoStudentId = 's12';
  D.teacher = { name: 'Mr. R. Ahmed', role: 'Batch teacher, Hojai', initials: 'RA' };
  D.foundation = { name: 'Dr. K. Islam', role: 'Ajmal Foundation', initials: 'KI' };
  /* Centre-level sample numbers for the Foundation view (made up). avg = this week's mock average in %. */
  D.centres = [
    { id: 'hojai', name: 'Hojai', students: 820, batches: 14, avg: null, trend: [57, 58, 59, 61, 61, null], help: 112, weak: ['Projectile motion', 'Trigonometric ratios'] },
    { id: 'barpeta', name: 'Barpeta', students: 410, batches: 7, avg: 59, trend: [54, 55, 57, 58, 58, 59], help: 74, weak: ['Mole concept', 'Electronic configuration'] },
    { id: 'dhubri', name: 'Dhubri', students: 380, batches: 6, avg: 55, trend: [52, 53, 55, 57, 58, 55], help: 88, weak: ['Projectile motion', 'Trigonometric identities'] },
    { id: 'badarpur', name: 'Badarpur', students: 350, batches: 6, avg: 64, trend: [55, 58, 60, 62, 63, 64], help: 41, weak: ['Chemical bonding', 'Cell division'] }
  ];
  D.subjects = ['Physics', 'Chemistry', 'Maths', 'Biology'];

  /* ---------- Topics (one tile each) ---------- */
  D.topics = [
    { id: 'un', sym: 'Un', name: 'Units and measurement', subject: 'Physics', chapter: 'Units and Measurements' },
    { id: 'ms', sym: 'Ms', name: 'Motion in a straight line', subject: 'Physics', chapter: 'Motion in a Straight Line' },
    { id: 've', sym: 'Ve', name: 'Vectors', subject: 'Physics', chapter: 'Motion in a Plane' },
    { id: 'pj', sym: 'Pj', name: 'Projectile motion', subject: 'Physics', chapter: 'Motion in a Plane' },
    { id: 'nl', sym: 'Nl', name: 'Newton’s laws', subject: 'Physics', chapter: 'Laws of Motion' },
    { id: 'fr', sym: 'Fr', name: 'Friction', subject: 'Physics', chapter: 'Laws of Motion' },

    { id: 'mo', sym: 'Mo', name: 'Mole concept', subject: 'Chemistry', chapter: 'Some Basic Concepts of Chemistry' },
    { id: 'at', sym: 'At', name: 'Atomic models', subject: 'Chemistry', chapter: 'Structure of Atom' },
    { id: 'ec', sym: 'Ec', name: 'Electronic configuration', subject: 'Chemistry', chapter: 'Structure of Atom' },
    { id: 'pt', sym: 'Pt', name: 'Periodic trends', subject: 'Chemistry', chapter: 'Classification of Elements and Periodicity in Properties' },
    { id: 'cb', sym: 'Cb', name: 'Chemical bonding', subject: 'Chemistry', chapter: 'Chemical Bonding and Molecular Structure' },

    { id: 'se', sym: 'Se', name: 'Sets', subject: 'Maths', chapter: 'Sets' },
    { id: 'fn', sym: 'Fn', name: 'Relations and functions', subject: 'Maths', chapter: 'Relations and Functions' },
    { id: 'tr', sym: 'Tr', name: 'Trigonometric ratios', subject: 'Maths', chapter: 'Trigonometric Functions' },
    { id: 'ti', sym: 'Ti', name: 'Trigonometric identities', subject: 'Maths', chapter: 'Trigonometric Functions' },
    { id: 'cx', sym: 'Cx', name: 'Complex numbers', subject: 'Maths', chapter: 'Complex Numbers and Quadratic Equations' },

    { id: 'bc', sym: 'Bc', name: 'Biological classification', subject: 'Biology', chapter: 'Biological Classification' },
    { id: 'pk', sym: 'Pk', name: 'Plant kingdom', subject: 'Biology', chapter: 'Plant Kingdom' },
    { id: 'ak', sym: 'Ak', name: 'Animal kingdom', subject: 'Biology', chapter: 'Animal Kingdom' },
    { id: 'co', sym: 'Co', name: 'Cell organelles', subject: 'Biology', chapter: 'Cell: The Unit of Life' },
    { id: 'bm', sym: 'Bm', name: 'Biomolecules', subject: 'Biology', chapter: 'Biomolecules' },
    { id: 'cd', sym: 'Cd', name: 'Cell division', subject: 'Biology', chapter: 'Cell Cycle and Cell Division' }
  ];
  D.topicById = {};
  D.topics.forEach(function (t) { D.topicById[t.id] = t; });

  /* ---------- Test questions ----------
     expected  = suggested time in seconds
     answer    = index of the correct option (0 = first option)
     followups = two smaller questions the AI asks only if the main one is wrong.
                 Each one checks a single idea behind the main question.
     Question and option text may use simple HTML such as <sub> and <sup>.
  */
  D.questions = [
    {
      id: 'p1', subject: 'Physics', topic: 'pj', expected: 75,
      text: 'A ball is thrown at 20 m/s at an angle of 30° above the ground. Take g = 10 m/s². How long does the ball stay in the air?',
      options: ['1 s', '2 s', '2√3 s', '4 s'], answer: 1,
      explain: 'Time of flight = 2u sin θ ÷ g = (2 × 20 × ½) ÷ 10 = 2 s.',
      applyGap: 'Putting the steps together in a projectile problem',
      followups: [
        { id: 'p1a', topic: 've', gap: 'Resolving a vector into components',
          text: 'A velocity of 20 m/s makes an angle of 30° with the horizontal. What is its vertical component?',
          options: ['10 m/s', '10√3 m/s', '20 m/s', '5 m/s'], answer: 0,
          tip: 'Vertical component = u sin θ = 20 × ½ = 10 m/s. Horizontal component = u cos θ.' },
        { id: 'p1b', topic: 'ms', gap: 'Motion under gravity',
          text: 'A ball is thrown straight up at 10 m/s. Take g = 10 m/s². How long does it take to reach the highest point?',
          options: ['0.5 s', '1 s', '2 s', '10 s'], answer: 1,
          tip: 'At the top the speed is zero, so t = u ÷ g = 10 ÷ 10 = 1 s.' }
      ]
    },
    {
      id: 'c1', subject: 'Chemistry', topic: 'mo', expected: 70,
      text: 'How many molecules are there in 9 g of water (H<sub>2</sub>O)? Take H = 1, O = 16 and Avogadro’s number = 6 × 10<sup>23</sup>.',
      options: ['3 × 10<sup>23</sup>', '6 × 10<sup>23</sup>', '1.2 × 10<sup>24</sup>', '5.4 × 10<sup>24</sup>'], answer: 0,
      explain: 'Molar mass of water = 18 g. Moles = 9 ÷ 18 = 0.5. Molecules = 0.5 × 6 × 10<sup>23</sup> = 3 × 10<sup>23</sup>.',
      applyGap: 'Going from mass to moles to molecules in one problem',
      followups: [
        { id: 'c1a', topic: 'mo', gap: 'Calculating molar mass',
          text: 'What is the molar mass of water, H<sub>2</sub>O? Take H = 1 and O = 16.',
          options: ['16 g/mol', '17 g/mol', '18 g/mol', '34 g/mol'], answer: 2,
          tip: 'H<sub>2</sub>O has 2 hydrogen atoms and 1 oxygen atom: (2 × 1) + 16 = 18 g/mol.' },
        { id: 'c1b', topic: 'mo', gap: 'Converting mass to moles',
          text: 'How many moles are there in 88 g of CO<sub>2</sub>? The molar mass of CO<sub>2</sub> is 44 g/mol.',
          options: ['0.5 mol', '1 mol', '2 mol', '44 mol'], answer: 2,
          tip: 'Moles = mass ÷ molar mass = 88 ÷ 44 = 2 mol.' }
      ]
    },
    {
      id: 'm1', subject: 'Maths', topic: 'tr', expected: 60,
      text: 'If sin θ = 3/5 and θ lies in the second quadrant, what is cos θ?',
      options: ['4/5', '−4/5', '3/4', '−3/4'], answer: 1,
      explain: 'cos²θ = 1 − 9/25 = 16/25, so cos θ = ±4/5. In the second quadrant cos is negative, so cos θ = −4/5.',
      applyGap: 'Using the identity and the sign rule together',
      followups: [
        { id: 'm1a', topic: 'ti', gap: 'Using sin²θ + cos²θ = 1',
          text: 'If sin θ = 3/5, what is cos²θ?',
          options: ['9/25', '16/25', '4/5', '2/5'], answer: 1,
          tip: 'cos²θ = 1 − sin²θ = 1 − 9/25 = 16/25.' },
        { id: 'm1b', topic: 'tr', gap: 'Signs of ratios in each quadrant',
          text: 'In the second quadrant, which of these is positive?',
          options: ['sin θ', 'cos θ', 'tan θ', 'All three'], answer: 0,
          tip: 'In the second quadrant only sin (and cosec) are positive. cos and tan are negative.' }
      ]
    },
    {
      id: 'b1', subject: 'Biology', topic: 'cd', expected: 30,
      text: 'In which stage of mitosis do the chromosomes line up at the centre (equator) of the cell?',
      options: ['Prophase', 'Metaphase', 'Anaphase', 'Telophase'], answer: 1,
      explain: 'In metaphase the chromosomes line up at the equator and form the metaphase plate.',
      applyGap: 'Matching each event to its stage of mitosis',
      followups: [
        { id: 'b1a', topic: 'cd', gap: 'Order of the stages of mitosis',
          text: 'In which stage of mitosis do the sister chromatids separate and move to opposite poles?',
          options: ['Prophase', 'Metaphase', 'Anaphase', 'Telophase'], answer: 2,
          tip: 'Order: Prophase, Metaphase, Anaphase, Telophase. Chromatids separate in anaphase.' },
        { id: 'b1b', topic: 'cd', gap: 'Parts of a chromosome',
          text: 'Spindle fibres attach to which part of a chromosome?',
          options: ['Kinetochore', 'Telomere', 'Nucleolus', 'Chromatid arm'], answer: 0,
          tip: 'Spindle fibres attach to the kinetochores, which sit at the centromere.' }
      ]
    },
    {
      id: 'p2', subject: 'Physics', topic: 'fr', expected: 60,
      text: 'A 5 kg block is pulled along a rough floor with a horizontal force of 30 N. The friction force on it is 10 N. What is the acceleration of the block?',
      options: ['2 m/s²', '4 m/s²', '6 m/s²', '8 m/s²'], answer: 1,
      explain: 'Net force = 30 − 10 = 20 N. Acceleration = 20 ÷ 5 = 4 m/s².',
      applyGap: 'Including friction when finding the net force',
      followups: [
        { id: 'p2a', topic: 'nl', gap: 'Finding the net force',
          text: 'Two forces act on a body along the same line: 30 N to the right and 10 N to the left. What is the net force?',
          options: ['40 N to the right', '20 N to the right', '20 N to the left', '10 N to the right'], answer: 1,
          tip: 'Forces in opposite directions subtract: 30 − 10 = 20 N, towards the bigger force.' },
        { id: 'p2b', topic: 'nl', gap: 'Using F = ma',
          text: 'A net force of 20 N acts on a 4 kg body. What is its acceleration?',
          options: ['0.2 m/s²', '5 m/s²', '16 m/s²', '80 m/s²'], answer: 1,
          tip: 'a = F ÷ m = 20 ÷ 4 = 5 m/s².' }
      ]
    },
    {
      id: 'c2', subject: 'Chemistry', topic: 'ec', expected: 45,
      text: 'Which is the correct electronic configuration of chromium (atomic number 24)?',
      options: ['[Ar] 3d<sup>4</sup> 4s<sup>2</sup>', '[Ar] 3d<sup>5</sup> 4s<sup>1</sup>', '[Ar] 3d<sup>6</sup>', '[Ar] 4s<sup>2</sup> 4p<sup>4</sup>'], answer: 1,
      explain: 'Chromium is an exception. One electron moves from 4s to 3d, giving [Ar] 3d<sup>5</sup> 4s<sup>1</sup>, because a half-filled d subshell is extra stable.',
      applyGap: 'Remembering the exceptions (Cr and Cu)',
      followups: [
        { id: 'c2a', topic: 'ec', gap: 'Order of filling orbitals',
          text: 'By the Aufbau principle, which of these orbitals is filled first?',
          options: ['3d', '4s', '4p', '4d'], answer: 1,
          tip: 'The orbital with the lower (n + l) fills first. 4s has n + l = 4. 3d and 4p have 5.' },
        { id: 'c2b', topic: 'ec', gap: 'Stability of half-filled subshells',
          text: 'Why is a 3d<sup>5</sup> arrangement extra stable?',
          options: ['The d subshell is exactly half-filled', 'The d subshell is completely filled', 'The d subshell is empty', 'All its electrons are paired'], answer: 0,
          tip: 'A d subshell holds 10 electrons. With 5 it is exactly half-filled, which is extra stable.' }
      ]
    },
    {
      id: 'm2', subject: 'Maths', topic: 'se', expected: 60,
      text: 'In a class of 40 students, 25 like Physics and 20 like Chemistry. 10 students like both. How many students like neither subject?',
      options: ['5', '10', '15', '35'], answer: 0,
      explain: 'Students who like at least one subject = 25 + 20 − 10 = 35. Neither = 40 − 35 = 5.',
      applyGap: 'Turning a word problem into sets',
      followups: [
        { id: 'm2a', topic: 'se', gap: 'Union formula for two sets',
          text: 'If n(A) = 25, n(B) = 20 and n(A ∩ B) = 10, what is n(A ∪ B)?',
          options: ['15', '35', '45', '55'], answer: 1,
          tip: 'n(A ∪ B) = n(A) + n(B) − n(A ∩ B) = 25 + 20 − 10 = 35.' },
        { id: 'm2b', topic: 'se', gap: 'Complement of a set',
          text: 'The universal set U has 40 elements and set A has 35 elements. How many elements are in A′ (the complement of A)?',
          options: ['5', '35', '40', '75'], answer: 0,
          tip: 'A′ holds everything in U that is not in A: 40 − 35 = 5.' }
      ]
    },
    {
      id: 'b2', subject: 'Biology', topic: 'co', expected: 35,
      text: 'Which organelle is the site of aerobic respiration and has its own DNA and 70S ribosomes?',
      options: ['Golgi apparatus', 'Mitochondrion', 'Lysosome', 'Endoplasmic reticulum'], answer: 1,
      explain: 'Mitochondria carry out aerobic respiration and make ATP. They have their own circular DNA and 70S ribosomes.',
      applyGap: 'Linking each organelle to its job',
      followups: [
        { id: 'b2a', topic: 'co', gap: 'Types of ribosomes',
          text: 'Which type of ribosome is found in prokaryotes, mitochondria and chloroplasts?',
          options: ['60S', '70S', '80S', '90S'], answer: 1,
          tip: '70S ribosomes are in prokaryotes, mitochondria and chloroplasts. 80S ribosomes are in the cytoplasm of eukaryotes.' },
        { id: 'b2b', topic: 'co', gap: 'Membranes around organelles',
          text: 'Which of these organelles is surrounded by a double membrane?',
          options: ['Lysosome', 'Mitochondrion', 'Ribosome', 'Golgi apparatus'], answer: 1,
          tip: 'Mitochondria, chloroplasts and the nucleus have a double membrane. Ribosomes have no membrane.' }
      ]
    }
  ];
  D.questionById = {};
  D.questions.forEach(function (q) { D.questionById[q.id] = q; });

  /* ---------- AI-suggested questions that wait for the teacher ---------- */
  D.review = [
    { id: 'r1', subject: 'Physics', topic: 've', level: 'Easy', forGap: 'Resolving a vector into components',
      text: 'A force of 10 N acts at 60° to the horizontal. What is its horizontal component?',
      options: ['5 N', '5√3 N', '10 N', '20 N'], answer: 0 },
    { id: 'r2', subject: 'Chemistry', topic: 'mo', level: 'Easy', forGap: 'Converting mass to moles',
      text: 'What is the mass of 0.5 mol of CO<sub>2</sub>? Take C = 12 and O = 16.',
      options: ['11 g', '22 g', '44 g', '88 g'], answer: 1 },
    { id: 'r3', subject: 'Maths', topic: 'tr', level: 'Medium', forGap: 'Signs of ratios in each quadrant',
      text: 'If cos θ = −1/2 and θ lies in the second quadrant, what is θ?',
      options: ['60°', '120°', '150°', '240°'], answer: 1 },
    { id: 'r4', subject: 'Physics', topic: 'nl', level: 'Easy', forGap: 'Finding the net force',
      text: 'A 2 kg block rests on a level table. Take g = 10 m/s². What is the normal force on the block?',
      options: ['2 N', '10 N', '20 N', '200 N'], answer: 2 },
    { id: 'r5', subject: 'Biology', topic: 'cd', level: 'Easy', forGap: 'Order of the stages of mitosis',
      text: 'In which phase of the cell cycle is DNA copied (replicated)?',
      options: ['G<sub>1</sub> phase', 'S phase', 'G<sub>2</sub> phase', 'M phase'], answer: 1 }
  ];

  /* ---------- Sample students (names are made up) ----------
     ability is a number from 0 to 1 used only to generate believable sample marks. */
  var roster = [
    ['Aarav Das', 'NEET', 0.82], ['Nazia Begum', 'NEET', 0.58], ['Rohan Kalita', 'NEET', 0.71],
    ['Priyanka Deka', 'NEET', 0.66], ['Imran Hussain', 'NEET', 0.47], ['Ankita Sarma', 'NEET', 0.88],
    ['Farhan Ali', 'NEET', 0.52], ['Dipika Baruah', 'NEET', 0.74], ['Mustafa Rahman', 'NEET', 0.61],
    ['Riya Nath', 'NEET', 0.79], ['Sameer Khan', 'NEET', 0.44], ['Sahil Ahmed', 'NEET', 0.62],
    ['Jyoti Medhi', 'NEET', 0.69], ['Nikita Bora', 'NEET', 0.55], ['Tanvir Hoque', 'NEET', 0.85],
    ['Pooja Roy', 'NEET', 0.63], ['Zubair Ahmed', 'NEET', 0.49], ['Minakshi Talukdar', 'NEET', 0.77],
    ['Rahul Barman', 'NEET', 0.57], ['Sultana Parbin', 'NEET', 0.68], ['Kunal Choudhury', 'NEET', 0.73],
    ['Afsana Khatun', 'NEET', 0.41], ['Bikash Pathak', 'NEET', 0.64], ['Rehana Sultana', 'NEET', 0.59]
  ];
  var absent = { s5: true, s22: true }; // did not take Weekly Mock 6

  // How easy each topic is for the whole class (in marks out of 100).
  var topicEase = { un: 6, ms: 2, ve: -14, pj: -18, nl: -2, fr: -6, mo: -12, at: 4, ec: -9, pt: 3, cb: -4,
                    se: 8, fn: 0, tr: -10, ti: -13, cx: -3, bc: 10, pk: 7, ak: 5, co: 9, bm: 1, cd: 6 };
  // How easy each test question is. A student gets it right when ability + ease (+ a little luck) is above 0.5.
  var qEase = { p1: -0.25, c1: -0.2, m1: -0.19, b1: -0.02, p2: -0.11, c2: -0.16, m2: -0.07, b2: 0.03 };
  // For a wrong answer: chance the root gap is follow-up A, follow-up B, or neither (application).
  var gapMix = { p1: [0.65, 0.2], c1: [0.3, 0.5], m1: [0.3, 0.5], b1: [0.6, 0.2], p2: [0.5, 0.25],
                 c2: [0.35, 0.4], m2: [0.5, 0.25], b2: [0.5, 0.3] };

  function prng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  var rnd = prng(20261010);
  D.students = roster.map(function (r, i) {
    var id = 's' + (i + 1), a = r[2];
    var s = { id: id, roll: i + 1, name: r[0], aspirant: r[1], isDemo: id === D.demoStudentId };

    // Topic strength before Weekly Mock 6
    s.baseMastery = {};
    D.topics.forEach(function (t) {
      s.baseMastery[t.id] = clamp(Math.round(a * 100 + topicEase[t.id] + (rnd() * 16 - 8)), 8, 98);
    });

    // Scores (%) in Weekly Mocks 1 to 5
    var drift = rnd() * 4 - 1;
    s.history = [1, 2, 3, 4, 5].map(function (k) {
      return clamp(Math.round(a * 100 - 8 + drift * k + (rnd() * 12 - 6)), 20, 98);
    });

    // Weekly Mock 6 attempt (sample). The demo student takes it live instead.
    s.attempt = null;
    var answers = [], fu = {};
    D.questions.forEach(function (q) {
      var correct = a + qEase[q.id] + (rnd() - 0.5) * 0.36 > 0.5;
      var r1 = rnd(), f;
      if (r1 < 0.1) f = 0.18 + rnd() * 0.15;          // very fast
      else if (r1 < 0.26) f = 1.55 + rnd() * 0.7;     // slow
      else f = 0.55 + rnd() * 0.85;                   // normal
      var wrongChoice = (q.answer + 1 + Math.floor(rnd() * 3)) % 4;
      answers.push({ qid: q.id, choice: correct ? q.answer : wrongChoice, timeSec: Math.max(4, Math.round(q.expected * f)) });
      var r2 = rnd(), mix = gapMix[q.id];
      if (!correct) {
        var fa = q.followups[0], fb = q.followups[1];
        var aWrong = r2 < mix[0], bWrong = !aWrong && r2 < mix[0] + mix[1];
        if (f < 0.35 && rnd() < 0.75) { aWrong = false; bWrong = false; } // a rushed answer, not a concept gap
        fu[fa.id] = aWrong ? (fa.answer + 1) % 4 : fa.answer;
        fu[fb.id] = bWrong ? (fb.answer + 1) % 4 : fb.answer;
      }
    });
    if (!absent[id] && !s.isDemo) s.attempt = { answers: answers, followups: fu };
    s.absent = !!absent[id];
    s.planDoneShare = rnd(); // share of plan tasks already ticked (sample)
    return s;
  });

  // The demo student: fixed, readable history so the story is easy to tell.
  var demo = D.students.filter(function (s) { return s.isDemo; })[0];
  demo.history = [48, 55, 52, 60, 63];
  demo.baseMastery.mo = 38; demo.baseMastery.tr = 41; demo.baseMastery.un = 58;
  demo.baseMastery.ve = 36; demo.baseMastery.pj = 34; demo.baseMastery.ti = 44;
  demo.baseMastery.co = 84; demo.baseMastery.bc = 81; demo.baseMastery.se = 76;
  // What the AI found for the demo student in Weekly Mock 5 (used until Test 6 is taken).
  demo.seedFindings = [
    { key: 't5-mo', type: 'concept', subject: 'Chemistry', topic: 'mo', rootTopic: 'mo', gap: 'Converting mass to moles',
      evidence: 'You missed two mole questions in Weekly Mock 5. In both, the mass was not changed into moles first.',
      tip: 'Moles = mass ÷ molar mass. Always do this step before anything else.' },
    { key: 't5-tr', type: 'concept', subject: 'Maths', topic: 'tr', rootTopic: 'tr', gap: 'Signs of ratios in each quadrant',
      evidence: 'You found the right value but the wrong sign in two trigonometry questions.',
      tip: 'Quadrant 1: all positive. Quadrant 2: sin. Quadrant 3: tan. Quadrant 4: cos.' },
    { key: 't5-un', type: 'slow', subject: 'Physics', topic: 'un', rootTopic: 'un', gap: 'Unit conversion',
      timeSec: 140, expected: 60,
      evidence: 'Right answers, but each unit conversion took about 2:20. Suggested time is 1:00.',
      tip: 'Write the units on every line and cancel them like numbers.' }
  ];
})();
