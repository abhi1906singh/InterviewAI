# Phase 4: Production Hardening, Rate Limiting & Analytics

> **Status**: `📅 PLANNED`  
> **Target**: Rate limiting, security hardening, user performance analytics, and social shareable credentials.

---

## 🎯 Objective

Harden the application for scale, protect API endpoints from abuse and quota exhaustion, provide long-term preparation analytics, and allow candidates to share their interview scores.

---

## 📋 Planned Features & Tasks

### 1. Security & Rate Limiting

- [ ] **Upstash Redis Rate Limiting** (`@upstash/ratelimit`)
  - [ ] Rate limit `POST /api/parse-resume` (e.g. max 5 uploads per hour per user).
  - [ ] Rate limit `POST /api/generate-questions` (e.g. max 10 sessions per day).
  - [ ] Rate limit `POST /api/evaluate-answer` (prevent spam).
- [ ] **Input Sanitization & PDF Safety**
  - [ ] Strict file validation and virus/malware heuristic checks.

---

### 2. User Preparation Analytics & Skill Radar

- [ ] **Performance Over Time Graphs**
  - [ ] Chart showing score progression across practice sessions (using Recharts or Chart.js).
- [ ] **Skill Gap Heatmap**
  - [ ] Breakdown of scores by topic (e.g. _System Design: 85%_, _Algorithms: 62%_, _Behavioral: 90%_).
  - [ ] Automated suggestions for areas needing practice.

---

### 3. Public Shareable Report Cards & Badges

- [ ] **Public Candidate Certificate / Badge Page** (`/share/[sessionId]`)
  - [ ] Open Graph (OG) social card preview for LinkedIn, Twitter, and portfolio websites.
  - [ ] Verified STAR score badge.

---

### 4. Observability, Logging & Error Tracking

- [ ] **Sentry Integration** (`@sentry/nextjs`)
  - [ ] Automatic capture of client and server runtime errors.
- [ ] **API Latency & Token Usage Monitoring**
  - [ ] Track Gemini API token consumption and response latency.
