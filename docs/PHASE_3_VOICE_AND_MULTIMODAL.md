# Phase 3: Voice Synthesis & Multimodal Interviewing

> **Status**: `⏳ UPCOMING / IN DESIGN`  
> **Target**: Realistic AI interviewer voice synthesis (TTS), live conversational audio streaming (Gemini Live API), and in-browser coding environment.

---

## 🎯 Objective

Transform the mock interview experience from text/STT into a lifelike spoken interview with an AI interviewer persona and in-browser coding sandbox for engineering interviews.

---

## 📋 Planned Features & Tasks

### 1. Text-to-Speech (TTS) — AI Interviewer Voice

- [ ] **Browser SpeechSynthesis Integration**
  - [ ] Add speaker icon (`🔊 Listen to Question`) on each question card in `app/interview/page.tsx`.
  - [ ] Auto-play option when a new question appears.
- [ ] **High-Fidelity AI Voice (Gemini / ElevenLabs / Web Audio)**
  - [ ] Generate natural, conversational spoken questions with realistic pauses and emphasis.

---

### 2. Real-Time Conversational Interviewing (Gemini Live API)

- [ ] **Bidirectional Audio WebSocket Stream**
  - [ ] WebSocket connection to stream live candidate audio directly to Gemini.
  - [ ] Candidate speaks naturally; Gemini interrupts or follows up dynamically.
  - [ ] Dynamic follow-up questions when candidate answers lack clarity or depth.

---

### 3. In-Browser Coding Sandbox (Practical Coding Questions)

- [ ] **Code Editor Component (Monaco / CodeMirror)**
  - [ ] Integrated into `app/interview/page.tsx` for practical coding questions.
  - [ ] Multi-language support (JavaScript, TypeScript, Python, Java, C++).
  - [ ] Syntax highlighting, indentation, and autocomplete.
- [ ] **Code Execution / AI Code Analysis**
  - [ ] AI review of code structure, time complexity ($O(N)$), space complexity, and edge cases.

---

### 4. Video / Webcam & Delivery Analysis (Optional)

- [ ] **Webcam Feed & Eye Contact Tracker**
  - [ ] Display candidate video feed in interview room.
  - [ ] Analysis of speaking pace, filler words ("um", "ah", "like"), and confidence score.
