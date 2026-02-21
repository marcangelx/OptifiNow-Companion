# OptifiNow AI Companion

An embedded AI assistant for OptifiNow CRM that answers **"What should I do next?"** — personalized to the user's role and current CRM context.

Built as a hackathon MVP in under 3 hours.

---

## What It Does

New CRM users often don't know where to start. This companion eliminates that friction by generating **actionable next steps** based on:
- The user's **role** (Sales Rep, Manager, Admin)

No searching help docs. No generic advice. Just the right next action, right now.

---

## Features

- **Role-aware AI guidance** — Sales Rep, Manager, and Admin each get completely different recommendations
- **CRM context preview** — The assistant shows the user's module and state before they even ask
- **OpenAI gpt-4o-mini** — Fast, cost-effective AI with a focused system prompt

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML + CSS + Vanilla JS |
| Backend | Node.js + Express |
| AI | OpenAI API — `gpt-4o-mini` |

---

## Project Structure

```
OptifinowCompanion/
├── frontend/
│   ├── index.html       # Single-page chat widget UI
│   ├── style.css        # Clean card styles, loading spinner
│   └── app.js           # Fetches backend, renders steps
├── backend/
│   ├── server.js        # Express server for local dev (port 3000)
│   ├── handler.js       # AWS Lambda handler (for cloud deploy)
│   ├── package.json     # express, openai, dotenv
│   └── .env             # OPENAI_API_KEY (gitignored)
├── mock/
│   └── context.json     # Sample user roles + CRM states
├── terraform/
│   ├── main.tf          # Provider + S3 frontend module
│   ├── variables.tf     # Region, environment, project name
│   ├── outputs.tf       # Bucket name, website URL
│   └── modules/
│       ├── lambda/      # Lambda function + IAM + CloudWatch
│       ├── api_gateway/ # HTTP API + POST /ask route
│       └── frontend/    # S3 bucket, versioning, encryption, website hosting
├── DEMO.md              # Hackathon demo walkthrough script
└── README.md            # This file
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- An OpenAI API key — [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

### 1. Install backend dependencies

```bash
cd backend
npm install
```

### 2. Set your API key

Create `backend/.env`:
```
OPENAI_API_KEY=sk-your-key-here
```

### 3. Start the backend

```bash
cd backend
npm start
# → Companion backend running on http://localhost:3000
```

### 4. Serve the frontend

```bash
cd frontend
npx serve .
# → open http://localhost:3000
```

---

## How It Works

1. User selects their role from the dropdown
2. The app loads the matching mock CRM context (module + state)
3. On button click, frontend POSTs `{ role, module, crmState }` to the backend
4. Backend builds a system prompt and calls OpenAI `gpt-4o-mini`
5. Response is split into individual steps and returned as `{ steps: [...] }`
6. Frontend renders the steps as an animated numbered list

### System Prompt Template

```
You are an onboarding assistant for OptifiNow CRM.
The user is a {role} currently in the {module} module.
CRM context: {crmState.summary}
Reply with exactly 2-3 short, actionable next steps numbered 1, 2, 3.
Use plain language. One sentence per step. No markdown. No fluff.
```

---

## Mock User Contexts

| Role | Module | CRM State |
|---|---|---|
| Sales Rep | Leads | 12 new leads uncontacted, pipeline empty |
| Manager | Dashboard | 3 reps inactive this week, Q2 quota at 40% |
| Admin | Settings | Email integration not configured, 2 users pending setup |

---

## AWS Deployment (Terraform)

```bash
# 1. Install backend deps (Lambda needs node_modules in zip)
cd backend && npm install

# 2. Deploy infrastructure
cd terraform
terraform init
terraform plan -out=tfplan
terraform apply tfplan

# 3. Upload frontend
aws s3 sync ../frontend/ s3://$(terraform output -raw frontend_bucket_name)/

# 4. Open the site
terraform output frontend_website_url
```

> The Lambda handler (`backend/handler.js`) is already written and ready to deploy.
> Set `OPENAI_API_KEY` as a Lambda environment variable in the AWS console or via `TF_VAR_openai_api_key`.

---

## Security Notes

- `OPENAI_API_KEY` is stored in `backend/.env` — never committed to git
- `.env` is listed in `.gitignore`
- Terraform state files are also gitignored (may contain sensitive values)
- IAM role follows least-privilege: Lambda only gets `AWSLambdaBasicExecutionRole`

---

## License

MIT — built at a hackathon, free to use and extend.
