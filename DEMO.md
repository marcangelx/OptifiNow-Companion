# OptifiNow AI Companion — Demo Guide

---

## Mission

New CRM users don't know where to start. Static help docs give the same generic answer to everyone, regardless of role or current state.

**OptifiNow Companion solves this** by answering one question intelligently:

> "What should I do next?"

It knows who you are, what module you're in, and what your CRM state looks like — then gives you 2-3 specific, actionable steps. No fluff. No docs to search through.

---

## Features

| Feature | Description |
|---|---|
| **Role-aware guidance** | Different steps for Sales Rep, Manager, and Admin — not one-size-fits-all |
| **CRM context preview** | Shows the user's current module and state before they even ask |
| **AI-generated steps** | Powered by OpenAI gpt-4o-mini — intelligent, not scripted |
| **Real-time response** | Loading spinner while thinking, steps animate in on arrival |
| **Clean embedded UI** | Non-intrusive card design that fits inside any CRM dashboard |
| **Stateless & fast** | No login, no database — just ask and get an answer instantly |

---

## Demo Walkthrough (Presenter Script)

### Step 1 — Setup (before the audience arrives)

```bash
# Terminal 1 — start the backend
cd backend && npm start
# → "Companion backend running on http://localhost:3000"

# Terminal 2 — serve the frontend
cd frontend && npx serve .
# → open http://localhost:3000 in browser
```

---

### Step 2 — Open the app

Point to the UI. Say:

> "This is the OptifiNow Companion — a small AI widget embedded in the CRM. It's always one click away."

Call out the **context preview box** below the dropdown:

> "Before the user even asks anything, the assistant already knows their module and what's happening in their account."

---

### Step 3 — Demo as Sales Rep

- Select **Sales Rep** from the dropdown
- Context preview shows: `Module: Leads — 12 new leads uncontacted, pipeline empty`
- Click **Get My Next Steps**
- Wait for response (show the loading spinner briefly)

Say:

> "The AI sees 12 uncontacted leads and an empty pipeline. It doesn't just say 'go to the Leads tab' — it tells you exactly what to do based on your actual situation."

---

### Step 4 — Switch to Manager

- Select **Manager** from the dropdown
- Context preview updates immediately: `Module: Dashboard — 3 reps inactive this week, Q2 quota at 40%`
- Click **Get My Next Steps**

Say:

> "Same app, different role, completely different guidance. A manager doesn't need lead tips — they need to act on team performance. The AI knows that."

---

### Step 5 — Switch to Admin

- Select **Admin** from the dropdown
- Context preview: `Module: Settings — Email integration not configured, 2 users pending setup`
- Click **Get My Next Steps**

Say:

> "An admin has a completely different job. The assistant surfaces setup blockers — things that would slow down the whole team if left unresolved."

---

### Step 6 — The Key Point

Say:

> "In a traditional CRM, all three of these users would open the same Help Center and search for answers. With this companion, the right guidance comes to them — personalized, contextual, and instant."

---

## Why This Beats Static Help Docs

| Static Docs | OptifiNow Companion |
|---|---|
| Same content for everyone | Personalized to role |
| User must search | Answer comes to the user |
| Generic instructions | Context-aware next steps |
| Outdated by design | AI adapts dynamically |
| High cognitive load | 2-3 steps, nothing more |

---

## Tech Stack (for technical judges)

| Layer | Technology |
|---|---|
| Frontend | Plain HTML + CSS + Vanilla JS |
| Backend | Node.js + Express |
| AI | OpenAI gpt-4o-mini |
| Infrastructure | AWS Lambda + API Gateway + S3 (Terraform) |
| Local Dev | `.env` for API key, `npx serve` for frontend |

---

## Success Criteria Checklist

- [x] User enters the system and sees their context immediately
- [x] AI-generated guidance appears on button click
- [x] Guidance changes when role changes
- [x] Response is specific and actionable, not generic
- [x] Demonstrates clear value over static documentation
