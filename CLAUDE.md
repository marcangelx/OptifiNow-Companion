# OptifiNow Companion — CLAUDE.md

## Project Summary

Embedded AI assistant for OptifiNow CRM. Answers **"What should I do next?"** for new users
based on their role and current CRM context. Built as a hackathon MVP: plain HTML frontend,
AWS Lambda backend, OpenAI for intelligence. Ship fast, demo well.

---

## Stack

| Layer    | Tool                          |
|----------|-------------------------------|
| Frontend | Plain HTML + CSS + vanilla JS |
| Backend  | AWS Lambda (Node.js 20)       |
| AI       | OpenAI API — `gpt-4o-mini`   |
| Gateway  | AWS API Gateway (HTTP API)    |
| Data     | Mock JSON (no database)       |

---

## File Structure

```
OptifinowCompanion/
├── frontend/
│   ├── index.html       ← single-page chat widget UI
│   ├── style.css        ← minimal, clean styles
│   └── app.js           ← fetch to Lambda, render response
├── backend/
│   ├── handler.js       ← Lambda entry point (POST /ask)
│   └── package.json     ← { "openai": "^4.x" }
├── mock/
│   └── context.json     ← sample user roles + CRM states
└── CLAUDE.md
```

---

## MVP Scope

### Build This
- [ ] Role selector dropdown (Sales Rep, Manager, Admin)
- [ ] "What should I do next?" button
- [ ] Chat-style response panel showing 2-3 steps
- [ ] Lambda POST endpoint that calls OpenAI and returns steps
- [ ] CORS enabled on Lambda

### Skip This
- Auth / login
- Real CRM data integration
- Conversation history / memory
- Database
- User accounts

---

## Build Order

1. **`mock/context.json`** — define 3 sample user roles with CRM state
2. **`backend/handler.js`** — Lambda reads context, calls OpenAI, returns steps
3. **`backend/package.json`** — add `openai` SDK, zip and upload to Lambda
4. **`frontend/index.html`** — role dropdown + button + response area
5. **`frontend/app.js`** — POST to Lambda URL, render `steps[]` in UI
6. **Test locally** — `node -e "require('./handler').handler({body: JSON.stringify({role:'Sales Rep'})})"`
7. **Deploy** — upload zip to Lambda, attach API Gateway HTTP API, copy URL into `app.js`

---

## OpenAI Prompt Template

```
System:
You are an onboarding assistant for OptifiNow CRM.
The user is a {{role}} currently in the {{module}} module.
CRM context: {{crmState.summary}}
Reply with exactly 2-3 short, actionable next steps.
Use plain language. No markdown. No fluff.

User:
What should I do next?
```

---

## Agent Rules (Claude Coding Guide)

- Use the `openai` npm package — never raw `fetch` to OpenAI
- Always use model `gpt-4o-mini` (fast + cost-effective for demos)
- Lambda response shape: `{ "steps": ["step 1", "step 2", "step 3"] }`
- Always include CORS headers in Lambda response:
  ```js
  headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" }
  ```
- Read `OPENAI_API_KEY` from Lambda environment variable — never hardcode it
- Keep Lambda handler under 50 lines — simple is better
- No sessions, no state — every request is stateless
- If the user asks to add a feature outside MVP scope, flag it and confirm first

---

## Mock Data (`mock/context.json`)

```json
[
  {
    "role": "Sales Rep",
    "module": "Leads",
    "crmState": { "summary": "12 new leads uncontacted, pipeline empty" }
  },
  {
    "role": "Manager",
    "module": "Dashboard",
    "crmState": { "summary": "3 reps inactive this week, Q2 quota at 40%" }
  },
  {
    "role": "Admin",
    "module": "Settings",
    "crmState": { "summary": "Email integration not configured, 2 users pending setup" }
  }
]
```

---

## Unit Test Cases

### TC-01: Lambda Returns Valid Steps
- **Input:** POST `{ role: "Sales Rep", module: "Leads", crmState: { summary: "..." } }`
- **Expected:** Response `{ steps: [...] }` with 2-3 string items
- **Pass:** `steps` is an array, length 2-3, each item is a non-empty string

### TC-02: CORS Headers Present
- **Input:** OPTIONS or POST request to Lambda URL from browser
- **Expected:** Response includes `Access-Control-Allow-Origin: *`
- **Pass:** No CORS error in browser console

### TC-03: Role Change Updates Guidance
- **Input:** User selects "Manager", clicks button, then switches to "Sales Rep", clicks again
- **Expected:** Second response differs from first
- **Pass:** Different steps shown for different roles

### TC-04: API Key Not Exposed
- **Input:** View page source, inspect `app.js`, check Lambda zip
- **Expected:** No OpenAI API key visible in any frontend file
- **Pass:** Key exists only as a Lambda environment variable

### TC-05: Empty/Missing Context Handled
- **Input:** POST with missing `module` or `crmState` fields
- **Expected:** Lambda returns a valid response using defaults or partial context
- **Pass:** No 500 error — UI shows fallback steps

---

## Quick Commands

```bash
# Install backend deps
cd backend && npm install

# Test handler locally
node -e "
const {handler} = require('./handler');
handler({body: JSON.stringify({role:'Sales Rep', module:'Leads', crmState:{summary:'test'}})})
  .then(r => console.log(r.body));
"

# Zip for Lambda upload
zip -r function.zip handler.js node_modules package.json

# Open frontend locally
open ../frontend/index.html
```
