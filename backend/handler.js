const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS" || event.requestContext?.http?.method === "OPTIONS") {
    return { statusCode: 200, headers: CORS_HEADERS, body: "" };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const role = body.role || "New User";
    const module = body.module || "Dashboard";
    const summary = body.crmState?.summary || "No context available";

    const systemPrompt = `You are an onboarding assistant for OptifiNow CRM.
The user is a ${role} currently in the ${module} module.
CRM context: ${summary}
Reply with exactly 2-3 short, actionable next steps numbered 1, 2, 3.
Use plain language. One sentence per step. No markdown. No fluff.`;

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

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ steps }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Failed to get guidance. Check Lambda logs." }),
    };
  }
};
