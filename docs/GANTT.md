# Work Plan — Gantt Chart
**CM3050 Final Year Project | Submission: March 23, 2026**

> This document addresses examiner feedback: *"A proper workplan is missing. Add a week-wise plan (Gantt chart) with tasks, milestones, testing and buffer time."*

---

## Development Iterations Overview

This project follows an iterative development methodology with two distinct prototype iterations:

| Iteration | Period | Focus | Status |
|-----------|--------|-------|--------|
| Iteration 1 | Weeks 7–10 (Nov–Dec 2025) | Local state prototype gamified checklist, points engine, simulated streak | Complete |
| Iteration 2 | Weeks 19–21 (Feb–Mar 2026) | Firebase integration authentication, persistent data, offline sync, Resources Map, ML personalisation | In Progress |

Each iteration produced a working, testable build. Iteration 1 validated the gamification logic and UI. Iteration 2 addresses all examiner feedback and elevates the prototype to production-ready standard.

---

## Visual Overview

Full project schedule across all 22 weeks, from initial research to final submission.

| Task | W1–2 | W3–4 | W5–6 | W7–8 | W9–10 | W11–13 | W14–16 | W17–18 | W19 | W20 | W21 | W22 |
|------|------|------|------|------|-------|--------|--------|--------|-----|-----|-----|-----|
| **— Phase 1: Research & Design —** | | | | | | | | | | | | |
| Domain research | Yes | Yes | | | | | | | | | | |
| Literature review | | Yes | Yes | | | | | | | | | |
| Architecture & data model | | | Yes | Yes | | | | | | | | |
| **— Iteration 1 (Prototype) —** | | | | | | | | | | | | |
| React Native prototype build | | | | Yes | Yes | | | | | | | |
| Prototype self-evaluation | | | | | Yes | | | | | | | |
| Preliminary report writing | | | | | Yes | | | | | | | |
| Preliminary report submission | | | | | Yes | | | | | | | |
| **— Phase 2: Planning & Analysis —** | | | | | | | | | | | | |
| Feedback analysis & gap review | | | | | | Yes | Yes | | | | | |
| Firebase architecture research | | | | | | | Yes | Yes | | | | |
| Gantt chart & workplan creation | | | | | | | | Yes | | | | |
| **— Iteration 2 (Firebase) —** | | | | | | | | | | | | |
| Firebase setup & authentication | | | | | | | | | Yes | | | |
| Firestore integration + offline | | | | | | | | | Yes | | | |
| Resources Map (Cairo) | | | | | | | | | Yes | | | |
| Streak logic & badges | | | | | | | | | | Yes | | |
| Push notifications (FCM) | | | | | | | | | | Yes | | |
| ML personalisation (ML Kit) | | | | | | | | | | Yes | | |
| APK build & testing | | | | | | | | | | Yes | | |
| **— Evaluation —** | | | | | | | | | | | | |
| Participant recruitment | | | | | | | | | | Yes | | |
| Pre-test survey distribution | | | | | | | | | | Yes | | |
| User study execution (7 days) | | | | | | | | | | | Yes | |
| Post-test survey & data export | | | | | | | | | | | Yes | |
| Statistical analysis (t-test) | | | | | | | | | | | Yes | |
| **— Final Report —** | | | | | | | | | | | | |
| Implementation chapter | | | | | | | | | | | | Yes |
| Evaluation chapter | | | | | | | | | | | | Yes |
| Literature review revision | | | | | | | | | | | | Yes |
| Assembly, proofread, submission | | | | | | | | | | | | Yes |

**Submission deadline: March 23, 2026 (Week 22)**

---

## Iteration 1 Summary (Complete)
**Weeks 7–10 | November–December 2025**

Iteration 1 delivered a working frontend prototype using local React Native state only. No backend was connected  the goal was to validate the gamification concept before investing in infrastructure.

**Delivered:**
- Gamified checklist with point values per item (Basic / Gear / Health categories)
- Real-time score calculation on item toggle
- Progress bar with percentage completion
- Simulated streak counter (static, not timestamp-based)
- Tab navigation structure

**Limitations identified (resolved in Iteration 2):**
- Data lost on app restart  no persistence
- Streak counter not connected to real dates
- No user accounts or authentication
- No backend sync or offline capability
- No Resources Map

**Submitted:** Preliminary Report, December 18, 2025, Grade: 53.33%

---

## Iteration 2 Plan (In Progress)
**Weeks 19–21 | February–March 2026**

Iteration 2 directly addresses all examiner feedback and all limitations identified in Iteration 1.

---

### Week 19 — Firebase Foundation
**February 14–20, 2026**

| Day | Date | Task | Planned Hrs | Actual Hrs | Notes |
|-----|------|------|-------------|------------|-------|
| Sat | Feb 14 | Firebase project creation + SDK installation | 3 | | |
| Sun | Feb 15 | Authentication screens — Login and Signup UI | 4 | | |
| Mon | Feb 16 | Firebase Auth wiring — email/password flow | 3 | | |
| Tue | Feb 17 | Firestore integration — migrate useState to db hooks | 5 | | |
| Wed | Feb 18 | Offline persistence testing — WiFi toggle simulation | 3 | | |
| Thu | Feb 19 | Security rules deployment + Firebase Discord review | 2 | | |
| Fri | Feb 20 | Resources Map — React Native Maps + Cairo seed data | 4 | | |
| | | **Week total** | **24 hrs** | | |

**Week 19 Milestone:** Firebase connected, data persisting across sessions, Resources Map visible on device.

---

### Week 20 — Advanced Features + Study Preparation
**February 21–27, 2026**

| Day | Date | Task | Planned Hrs | Actual Hrs | Notes |
|-----|------|------|-------------|------------|-------|
| Sat | Feb 21 | Timestamp-based streak tracking logic | 4 | | |
| Sun | Feb 22 | Achievement badges system | 3 | | |
| Mon | Feb 23 | Push notifications — Firebase Cloud Messaging | 4 | | |
| Tue | Feb 24 | ML personalisation — Firebase ML Kit integration | 5 | | |
| Wed | Feb 25 | Release APK build + emulator testing | 3 | | |
| Thu | Feb 26 | Participant recruitment (N=6–8) + consent forms | 2 | | |
| Fri | Feb 27 | APK distribution + pre-test survey sent | 2 | | |
| | | **Week total** | **23 hrs** | | |

**Week 20 Milestone:** All Iteration 2 features complete, APK distributed, participants confirmed.

---

### Week 21 — User Study Execution + Analysis
**March 2–8, 2026**

| Day | Date | Task | Planned Hrs | Actual Hrs | Notes |
|-----|------|------|-------------|------------|-------|
| Mon | Mar 2 | Study begins — participants use app daily | — | | |
| Mon–Sun | Daily | Participant check-in and support | 1/day | | |
| Wed | Mar 4 | Mid-week support — resolve issues | 2 | | |
| Fri | Mar 6 | Post-test survey distributed | 1 | | |
| Sat | Mar 7 | Firebase Analytics data export | 2 | | |
| Sun | Mar 8 | Statistical analysis — paired t-test, alpha=0.05 | 4 | | |
| | | **Week total** | **10 hrs** | | |

**User Study Methodology:**

| Parameter | Value |
|-----------|-------|
| Participants | N = 6–8 (peers and family, Egypt) |
| Duration | 7 days |
| Instrument | General Self-Efficacy Scale (adapted), 5 questions, 1–5 Likert |
| Pre-test | Administered before APK distributed (Week 20) |
| Post-test | Same 5 questions after 7-day study period |
| Analysis | Paired t-test, alpha = 0.05, p-value reported |
| Expected outcome | Mean delta +1.2 to +1.8 points (p < 0.05) |

**Week 21 Milestone:** Study complete, statistical results calculated, data ready for report.

---

## Week 22 — Final Report
**March 9–23, 2026**

| Day | Date | Task | Planned Hrs | Actual Hrs | Notes |
|-----|------|------|-------------|------------|-------|
| Mon | Mar 9 | Implementation chapter (~2000 words) | 6 | | |
| Tue | Mar 10 | Evaluation chapter (~2500 words) + t-test results | 6 | | |
| Wed | Mar 11 | Literature review — restructure around 2–3 themes | 5 | | |
| Thu | Mar 12 | Design chapter update — security, streak, privacy | 4 | | |
| Fri | Mar 13 | Test cases section — 5–8 cases with outcomes | 3 | | |
| Sat | Mar 14 | Introduction + Conclusion | 3 | | |
| Sun | Mar 15 | References — full consistency check (one style) | 2 | | |
| Mon | Mar 16 | Full document assembly + formatting | 4 | | |
| Tue | Mar 17 | Proofread pass 1 | 3 | | |
| Wed | Mar 18 | Proofread pass 2 + final corrections | 3 | | |
| Thu–Sat | Mar 19–21 | Contingency buffer | — | | |
| Sun | Mar 22 | Final read-through | 2 | | |
| **Mon** | **Mar 23** | **SUBMISSION DEADLINE** | | | |
| | | **Week total** | **41 hrs** | | |

---

## Total Time Budget

| Phase | Weeks | Planned Hours | Status |
|-------|-------|---------------|--------|
| Iteration 1 — Frontend Prototype | 7–10 | ~30 | Complete |
| Iteration 2 — Firebase + Core Features | 19 | 24 | In Progress |
| Iteration 2 — Advanced Features + Study Prep | 20 | 23 | Pending |
| User Study + Analysis | 21 | 10 | Pending |
| Final Report | 22 | 41 | Pending |
| **Total (Implementation)** | **4 weeks** | **98 hours** | |

---

## Risk Register

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Firebase SDK conflict with Expo version | High | High | Use `npx expo install firebase` not npm |
| Unable to recruit 8 participants | Medium | Medium | Accept N=6, extend study to 10 days |
| ML Kit feature unstable | Medium | Low | Fall back to rule-based quest rotation |
| User study shows no measurable change | Low | Medium | Report as honest negative result, analyse causes |
| Report exceeds 9500-word limit | Medium | High | Cut design chapter detail first |
| Illness or unexpected interruption | Low | High | 3-day contingency buffer in Week 22 |

---

## Test Cases

To be completed during Weeks 19–21 and documented in the final report evaluation chapter.

| # | Test Case | Input | Expected Output | Actual | Pass/Fail |
|---|-----------|-------|-----------------|--------|-----------|
| 1 | Sign up with valid credentials | New email + password | Account created, redirected to home | | |
| 2 | Log in with correct credentials | Existing email + password | Data loaded, home screen shown | | |
| 3 | Check checklist item | Tap item checkbox | Points increment by item value | | |
| 4 | Uncheck checklist item | Tap checked item | Points decrement by item value | | |
| 5 | Check item while offline | WiFi off, tap checkbox | Item saves locally, UI updates instantly | | |
| 6 | Restore connectivity after offline action | Toggle WiFi back on | Offline changes sync to Firestore | | |
| 7 | Streak increments after daily completion | Return next day after completing all items | Streak count increases by 1 | | |
| 8 | Resources Map loads Cairo locations | Open Resources tab | 5+ map pins visible in Cairo area | | |
