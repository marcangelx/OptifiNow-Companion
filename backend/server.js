require("dotenv").config();
const express = require("express");
const OpenAI = require("openai");

const app = express();
app.use(express.json());

// Allow requests from the local HTML file opened in a browser
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/ask", async (req, res) => {
  const { role = "New User", module = "Dashboard", crmState, userMessage = "What should I do next?" } = req.body;
  const summary = crmState?.summary || "No context available";

  const systemPrompt = `You are an onboarding assistant for OptifiNow CRM.
The user is a ${role} currently in the ${module} module.
CRM context: ${summary}

Respond ONLY with a JSON object with two fields:
1. "steps": an array of exactly 2-3 short, actionable next steps. Plain language, one sentence each.
2. "highlight": the single CSS selector of the most relevant UI element to focus on, chosen from this list:
   - ".icon-btn-view"   (view/read actions)
   - ".icon-btn-update" (edit/update actions)
   - ".icon-btn-delete" (delete/remove actions)
   - ".btn-primary"     (add/create actions)
   - "#searchInput"     (search/find/filter actions)
   - null               (if no element is clearly relevant)

Example: {"steps":["Do this first.","Then do this."],"highlight":".btn-primary"}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      response_format: { type: "json_object" },
      max_tokens: 300,
      temperature: 0.4,
    });

    const parsed = JSON.parse(completion.choices[0].message.content || "{}");
    const steps = Array.isArray(parsed.steps) ? parsed.steps : [];
    const highlight = parsed.highlight || null;

    res.json({ steps, highlight });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Companion backend running on http://localhost:${PORT}`));
