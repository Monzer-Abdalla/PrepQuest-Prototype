# PrepQuest

![Status](https://img.shields.io/badge/Status-In%20Development-orange)
![Platform](https://img.shields.io/badge/Platform-Android-green)
![Framework](https://img.shields.io/badge/Framework-React%20Native%20%28Expo%29-blue)
![Backend](https://img.shields.io/badge/Backend-Firebase-yellow)
![License](https://img.shields.io/badge/License-Academic-lightgrey)

A gamified mobile application that transforms disaster preparedness from a reactive obligation into a proactive daily habit.

Built on React Native (Expo) with a Firebase backend, PrepQuest uses points, streaks, and daily quests to drive the kind of consistent preparedness behaviour that saves lives before disasters strike not during them.

---

## The Problem

Most disaster apps are reactive. They alert you when a crisis is already happening. But if you have not already built a kit, identified evacuation routes, or located nearby shelters, an alert is too late to be useful.

PrepQuest addresses the **"reactivity gap"** by incentivising preparedness during the calm periods before any disaster when there is still time to act.

A second problem: the most effective proactive tools (such as HazAdapt) are geo-restricted and unavailable across large parts of the world, including the MENA region. PrepQuest is built to be globally accessible from launch.

---

## Features

| Feature | Status | Description |
|---------|--------|-------------|
| Gamified Checklist | Complete | Points system, progress bar, category filtering (Basic / Gear / Health) |
| Firebase Auth | In Progress | Email and password sign-up and login |
| Cloud Firestore | In Progress | Persistent data with real-time sync |
| Offline-First | In Progress | Full functionality without internet; syncs on reconnect |
| Resources Map | In Progress | Shelters and medical centres — Cairo, Egypt |
| Streak Tracking | Planned | Timestamp-based daily streak logic |
| Push Notifications | Planned | Daily quest reminders via Firebase Cloud Messaging |
| ML Personalisation | Planned | Adaptive quest recommendations using Firebase ML Kit |
| Achievement Badges | Planned | Milestone rewards |

---


## Development Iterations

| Iteration | Period | Description | Status |
|-----------|--------|-------------|--------|
| Iteration 1 | Weeks 7–10 (Nov–Dec 2025) | Local state prototype — gamification engine, points system, simulated streak, tab navigation | Complete |
| Iteration 2 | Weeks 19–21 (Feb–Mar 2026) | Firebase integration — auth, persistent data, offline sync, Resources Map, ML personalisation | In Progress |

Iteration 1 validated the core gamification concept and was submitted as the preliminary report prototype (December 2025). Iteration 2 directly addresses all examiner feedback and extends the app to production-ready standard.

---

## Tech Stack

**Frontend**
- React Native via Expo SDK 54
- TypeScript
- React Navigation (tab-based)
- React Native Maps

**Backend**
- Firebase Authentication
- Cloud Firestore (offline persistence enabled)
- Firebase Cloud Messaging
- Firebase ML Kit

**Development Environment**
- Windows 10, Android Studio, Pixel 5 emulator (API 31)
- Node.js, VS Code, Git

---

## Data Model

```
/users/{userId}
    displayName       string
    email             string
    totalPoints       number
    currentLevel      number
    streakCount       number
    lastActiveDate    timestamp

/users/{userId}/user_checklists/{itemId}
    title             string
    completed         boolean
    completedAt       timestamp
    points            number
    category          string    (Basic | Gear | Health)

/checklists/{itemId}            -- master templates, read-only
    title             string
    category          string
    points            number
    description       string

/resources/{resourceId}         -- Cairo shelters and medical centres
    name              string
    location          geopoint
    type              string    (Shelter | Medical | Supply)
    contact           string
```

---

## Architecture

```
React Native (Expo)
        |
   Service Layer
   |           |
Auth         Firestore DB
Service      Service
        |
  Firebase Platform
  |-- Firebase Authentication
  |-- Cloud Firestore (offline persistence)
  |-- Firebase Cloud Messaging
  |-- Firebase ML Kit
```

The UI communicates exclusively through a service layer (`src/services/firebase.ts`). This separation of concerns allows for independent testing of business logic and insulates the UI from backend changes.

---

## Getting Started

**Prerequisites**
- Node.js v18 or higher
- Android Studio with a configured emulator (Pixel 5, API 31 recommended)
- Expo CLI
- A Firebase project (see Configuration below)

**Installation**

```bash
git clone https://github.com/Monzer-Abdalla/PrepQuest-Prototype.git
cd PrepQuest-Prototype
npm install
npx expo start
```

Press `a` in the terminal to open on the Android emulator.

**Firebase Configuration**

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Email/Password authentication
3. Create a Firestore database (region: europe-west2)
4. Copy your project config into `src/services/firebase.ts`

Note: `src/services/firebase.ts` is listed in `.gitignore` and must never be committed. API keys must stay off version control.

---

## Project Status

This is a final year academic project currently in the implementation phase (Week 19 of 22).

| Phase | Period | Status |
|-------|--------|--------|
| Research, Design and Prototype | Weeks 1–10 (Oct–Dec 2025) | Complete |
| Feedback Analysis and Planning | Weeks 11–18 (Jan–Feb 2026) | Complete |
| Implementation and User Study | Weeks 19–21 (Feb–Mar 2026) | In Progress |
| Final Report | Week 22 (Mar 2026) | Pending |

Full workplan: [docs/GANTT.md](docs/GANTT.md)  
Full timeline: [docs/TIMELINE.md](docs/TIMELINE.md)

---

## Preliminary Report Results

Submitted December 18, 2025. Grade: 53.33%.

| Examiner Feedback | Response |
|-------------------|----------|
| No workplan submitted | Gantt chart created — see docs/GANTT.md |
| Prototype too basic (local state only) | Firebase integration in progress (Week 19) |
| Add a resources map or alert flow | Resources Map — Cairo locations (Week 19) |
| Evaluation plan lacks specific metrics | Paired t-test defined, Likert instrument specified |
| Add 5–8 test cases with outcomes | Test case table created in GANTT.md |

---

## Evaluation Plan

**User Study**
- Participants: N = 6–8 (peers and family, Egypt)
- Duration: 7 days
- Instrument: General Self-Efficacy Scale (adapted), 5 questions, 1–5 Likert
- Analysis: Paired t-test, alpha = 0.05
- Hypothesis: Measurable increase in preparedness confidence score post-intervention

**Technical Testing**
- 8 documented test cases covering authentication, points logic, offline sync, and map rendering

---

## Academic Context

| Field | Detail |
|-------|--------|
| Module | CM3050 — Developing a Mobile App for Local Disaster Preparedness |
| Institution | University of London, BSc Computer Science |
| Academic Year | 2025/2026 |
| Submission | March 23, 2026 |
