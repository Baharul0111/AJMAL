# AI Mentor: demo for Ajmal Super 40

A clickable demo of the AI-based student improvement system proposed for
Ajmal Super 40 (Ajmal Foundation). It shows how the final product will look and work
for a student, for a batch teacher, and for the Foundation looking across all four centres.

This is a demo, not the real product. All data is sample data and student names are made up.
The "AI" is a set of simple rules, so it works offline with no account, no API key and no cost.

Prepared by Baharul Islam, AI/ML Engineer, iTCart Private Limited.

---

## How to run

1. Unzip the folder `ajmal-super40-ai-mentor-demo`.
2. Open the folder.
3. Double-click `index.html`. It opens in your browser.

That is all. No install, no internet and no server are needed.
It works in Chrome, Edge, Firefox and Safari, on a laptop or a phone.

If the page looks blank (some locked-down browsers block local files), run a small
local server instead. Open a terminal inside the folder and type:

```
python3 -m http.server 8000
```

Then open `http://localhost:8000` in the browser. On Windows use `python -m http.server 8000`.

## Demo logins

The login screen has three choices. The details are already filled in, so just press **Log in**.

| Who        | ID                              | Password | What you see                                                         |
| ---------- | ------------------------------- | -------- | -------------------------------------------------------------------- |
| Student    | `student@ajmalsuper40.demo`     | demo1234 | Home, Take test, My progress, Learning plan, Ask AI Mentor           |
| Teacher    | `teacher@ajmalsuper40.demo`     | demo1234 | Batch dashboard, Students, Problem areas, Review questions           |
| Foundation | `foundation@ajmalsuper40.demo`  | demo1234 | All centres (Hojai, Barpeta, Dhubri, Badarpur), plus the teacher pages |

Any ID and password are accepted. Only the Student, Teacher or Foundation choice matters.

## A 5-minute demo script

**As the student (Sahil Ahmed, NEET Two-Year, Batch A, Hojai)**

1. Log in as **Student**. The home page says Weekly Mock 6 is ready.
2. Open **Take test** and press **Start the test**. Point out the stopwatch and the suggested time.
3. Answer the 8 questions using the table below. This shows every kind of AI finding.
4. The AI then asks 2 smaller questions for each mistake to find the exact gap. Use the second table.
5. On the **result** page, show "What AI Mentor found": the exact weak idea, why, and what to do.
6. Open **Learning plan**: a 7-day plan built from the mistakes. Tick a task.
7. Open **My progress**: the topic table. Tap a red tile.
8. Open **Ask AI Mentor** and press a suggested question.

| Question              | What to do in the demo                           | Correct answer       |
| --------------------- | ------------------------------------------------ | -------------------- |
| 1 Projectile motion   | Answer wrong: choose A (1 s)                     | B (2 s)              |
| 2 Mole concept        | Answer wrong: choose B                           | A (3 × 10^23)        |
| 3 Trigonometry        | Answer wrong within 15 seconds: choose A (4/5)   | B (−4/5)             |
| 4 Cell division       | Wait about 50 seconds, then answer correctly     | B (Metaphase)        |
| 5 Friction            | Answer correctly                                 | B (4 m/s²)           |
| 6 Electronic config.  | Answer correctly                                 | B ([Ar] 3d5 4s1)     |
| 7 Sets                | Answer correctly                                 | A (5)                |
| 8 Cell organelles     | Answer correctly                                 | B (Mitochondrion)    |

| Follow-up question                 | What to do            | Correct answer |
| ---------------------------------- | --------------------- | -------------- |
| Vertical component of 20 m/s       | Answer wrong: B       | A (10 m/s)     |
| Ball thrown up at 10 m/s           | Answer correctly      | B (1 s)        |
| Molar mass of water                | Answer correctly      | C (18 g/mol)   |
| Moles in 88 g of CO2               | Answer wrong: B       | C (2 mol)      |
| cos²θ when sin θ = 3/5             | Answer correctly      | B (16/25)      |
| Positive ratio in second quadrant  | Answer correctly      | A (sin θ)      |

You will get four findings: two "Concept not clear" (with the exact gap), one "Answered too fast"
and one "Correct but slow".

Short on time? On the test start screen press **Short on time? Fill sample answers**.
It fills a ready-made attempt and jumps straight to the result.

**As the teacher**

1. Press **Log out**, choose **Teacher**, and log in.
2. **Batch dashboard**: batch average, who took the mock, where the batch is stuck, who needs help.
   The count now says 22 of 24, because the student just took the mock.
3. **Students**: open **Sahil Ahmed** (marked "Demo student"). The summary shows the result you just made.
   Press **Parent report** to show the printable report.
4. **Problem areas**: topics most students got wrong, the exact gap behind each, and a suggested action.
5. **Review questions**: the teacher approves or rejects AI-suggested questions. Nothing reaches a student without approval.

**As the Foundation**

1. Press **Log out**, choose **Foundation**, and log in.
2. **All centres**: the four centres side by side, average by mock for each centre, students who need help per centre,
   and what the Foundation can act on this week. The Hojai row is live: its average comes from the demo batch.
3. Press the **Hojai** row to open its batch dashboard, then use the other teacher pages as above.
   In this demo only Hojai opens; the other three centres are sample numbers.

## How the demo AI decides

For every question it looks at the answer and the time taken.

| What happened                                                  | What the AI says                        |
| -------------------------------------------------------------- | --------------------------------------- |
| Wrong, and a follow-up question is also wrong                  | Concept not clear (names the exact gap) |
| Wrong, but both follow-up questions are right                  | Basics fine, needs problem practice     |
| Wrong in under 35% of the suggested time, follow-ups right     | Answered too fast                       |
| Right, but took more than 1.5 times the suggested time         | Correct but slow                        |

The learning plan puts concept gaps first and plans about 90 minutes a day.

## Start again

On the login screen press **Reset demo data**. This clears the test attempt, ticked tasks and reviewed questions.
The student can also press **Take the test again** on the result page.

## What is real and what is simulated

| Part                                   | In this demo                              | In the full product                         |
| -------------------------------------- | ----------------------------------------- | ------------------------------------------- |
| Screens and navigation                 | Real                                      | Same design                                 |
| Timer, scoring, plan, dashboards       | Real, computed from the answers you give  | Same logic, with real test data             |
| AI analysis and chat                   | Simple rules in `js/ai.js`                | A real AI model                             |
| Students, marks, batch and centre numbers | Sample data in `js/data.js`            | Ajmal Super 40's own students and mock tests |
| Login                                  | No real check                             | Real accounts for students, staff and the Foundation |
| Storage                                | This browser only                         | A server on campus or in the cloud          |

## Files

| File              | What it does                                                    |
| ----------------- | --------------------------------------------------------------- |
| `index.html`      | The page you open                                               |
| `css/styles.css`  | Colours, fonts and layout                                       |
| `js/data.js`      | Sample data: topics, the 8 questions, follow-ups, 24 students, 4 centres |
| `js/ai.js`        | The demo AI: analysis, advice, learning plan, chat replies      |
| `js/store.js`     | Saves the demo state in the browser                             |
| `js/charts.js`    | Small charts drawn without any library                          |
| `js/ui.js`        | Shared pieces: icons, chips, topic tiles                        |
| `js/student.js`   | Student screens                                                 |
| `js/teacher.js`   | Teacher screens and the Foundation's all-centres screen         |
| `js/app.js`       | Login, menu and page switching                                  |
| `fonts/`          | The Lexend font, bundled so the demo works offline              |

To change the questions or student names, edit `js/data.js`. Each question has its text,
four options, the index of the correct option (0 is the first) and a suggested time in seconds.

## Credits

Lexend font by The Lexend Project Authors, under the SIL Open Font License (see `fonts/LICENSE-Lexend.txt`).
