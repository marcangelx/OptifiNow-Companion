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
  const { role = "New User", module = "Dashboard", crmState } = req.body;
  const summary = crmState?.summary || "No context available";

  const systemPrompt = `You are an onboarding assistant for OptifiNow CRM.
The user is a ${role} currently in the ${module} module.
CRM context: ${summary}
Reply with exactly 2-3 short, actionable next steps numbered 1, 2, 3.
Use plain language. One sentence per step. No markdown. No fluff.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "What should I do next?" },
      ],
      max_tokens: 200,
      temperature: 0.4,
    });

    const text = completion.choices[0].message.content || "";
    const steps = text
      .split("\n")
      .map((line) => line.replace(/^\d+[\.\)]\s*/, "").trim())
      .filter((line) => line.length > 0);

    res.json({ steps });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "OpenAI request failed. Check your API key." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Companion backend running on http://localhost:${PORT}`));
