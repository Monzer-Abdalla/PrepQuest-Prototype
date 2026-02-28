# Project Timeline — CM3050 Final Year Project

> Disaster Preparedness Mobile Application  
> University of London — BSc Computer Science  
> Academic Year 2025/2026

---

## Development Approach

This project was developed using an iterative methodology across two formal prototype iterations:

- **Iteration 1** (Weeks 7–10): Frontend prototype with local state  validated gamification logic and UI design
- **Iteration 2** (Weeks 19–21): Full Firebase integration  addressed all examiner feedback, added persistence, offline sync, and Resources Map

---

## Phase 1: Research, Design and Iteration 1 Prototype
**October 7 – December 18, 2025 | Weeks 1–10 | Status: COMPLETE**

| Week | Dates | Activity |
|------|-------|----------|
| 1–2 | Oct 7–20 | Project scoping, template selection (CM3050), domain research |
| 3–4 | Oct 21–Nov 3 | Literature review — gamification theory, competitor app analysis |
| 5–6 | Nov 4–17 | System architecture design, Firestore data model, UI wireframes |
| 7–8 | Nov 18–Dec 1 | Iteration 1 build — React Native prototype, gamification engine, local state |
| 9–10 | Dec 2–18 | Iteration 1 self-evaluation, preliminary report writing and submission |

**Iteration 1 delivered:**
- Gamified checklist (points, progress bar, categories)
- Real-time score calculation
- Simulated streak counter
- Tab navigation structure

**Deliverable:** Preliminary Report submitted December 18, 2025  
**Result:** 53.33% (27/48 points)

**Limitations identified for Iteration 2:**
- No data persistence (resets on restart)
- Streak not timestamp-based
- No authentication or user accounts
- No Firebase backend
- No Resources Map

---

## Phase 2: Feedback Analysis and Architecture Planning
**December 19, 2025 – February 13, 2026 | Weeks 11–18 | Status: COMPLETE**

| Week | Dates | Activity |
|------|-------|----------|
| 11–15 | Dec 19–Jan 29 | Academic continuation, design refinement, Firebase research |
| 16 | Jan 30, 2026 | Feedback received gap analysis, Iteration 2 strategy defined |
| 17 | Feb 2 | Firebase offline-first architecture confirmed, SDK compatibility checked |
| 18 | Feb 9 | Firestore schema finalised, Gantt chart produced, ML approach decided |

**Key decisions confirmed:**
- Firebase ML Kit selected over custom model training (timeline constraint)
- Resources Map confirmed as mandatory (examiner explicitly requested)
- Paired t-test selected for user study statistical analysis
- Participant target revised to N=6–8 due to timeline compression

---

## Phase 3:  Iteration 2 Implementation, Study and Submission
**February 14 – March 23, 2026 | Weeks 19–22 | Status: IN PROGRESS**

### Week 19 (Feb 14–20) — Firebase Foundation
Iteration 2 begins. All Iteration 1 limitations addressed this week.

- Firebase project creation and SDK installation
- Email and password authentication
- Cloud Firestore with offline persistence enabled
- Local state migrated to Firestore hooks
- Firebase security rules deployed
- Resources Map — Cairo shelters and medical centres

### Week 20 (Feb 21–27) — Advanced Features + Study Preparation
- Timestamp-based streak tracking logic (replacing Iteration 1 simulation)
- Achievement badges system
- Push notifications via Firebase Cloud Messaging
- ML personalisation layer — Firebase ML Kit (adaptive quest recommendations)
- Release APK build
- Participant recruitment (N=6–8), consent forms, pre-test survey

### Week 21 (Mar 2–8) — User Study Execution
- Seven-day study period with daily participant check-ins
- Post-test survey (identical 5-question Likert instrument)
- Firebase Analytics data export
- Statistical analysis — paired t-test, alpha=0.05

### Week 22 (Mar 9–23) — Final Report
- Implementation chapter covering both iterations (~2000 words)
- Evaluation chapter with statistical results (~2500 words)
- Literature review restructured around 2–3 clear themes
- Design chapter updated security, streak logic, privacy considerations
- Test cases section (5–8 documented cases with outcomes)
- Full assembly, reference consistency check, proofreading
- **Submission deadline: March 23, 2026**

---

## Project Summary

| Metric | Value |
|--------|-------|
| Total duration | 22 weeks |
| Prototype iterations | 2 |
| Iteration 1 | Weeks 7–10 (frontend, local state) |
| Iteration 2 | Weeks 19–21 (Firebase, full features) |
| Active development | ~8 weeks across both iterations |
| Planning and research | ~14 weeks |
| Final submission | March 23, 2026 |

---

*This timeline addresses examiner feedback: "Add a complete workplan with dates, tasks and risk handling."*
