const BACKEND_URL = "https://jw1usdp99i.execute-api.us-east-1.amazonaws.com/ask";

const MOCK_CONTEXTS = [
  {
    role: "Sales Rep",
    module: "Leads",
    crmState: { summary: "12 new leads uncontacted, pipeline empty" },
  },
  {
    role: "Manager",
    module: "Dashboard",
    crmState: { summary: "3 reps inactive this week, Q2 quota at 40%" },
  },
  {
    role: "Admin",
    module: "Settings",
    crmState: { summary: "Email integration not configured, 2 users pending setup" },
  },
];

const roleSelect = document.getElementById("roleSelect");
const contextPreview = document.getElementById("contextPreview");
const askBtn = document.getElementById("askBtn");
const btnText = document.getElementById("btnText");
const btnSpinner = document.getElementById("btnSpinner");
const responsePanel = document.getElementById("responsePanel");
const stepsList = document.getElementById("stepsList");

function getContext(role) {
  return MOCK_CONTEXTS.find((c) => c.role === role) || MOCK_CONTEXTS[0];
}

function updatePreview() {
  const ctx = getContext(roleSelect.value);
  contextPreview.textContent = `Module: ${ctx.module} — ${ctx.crmState.summary}`;
}

function setLoading(loading) {
  askBtn.disabled = loading;
  btnText.textContent = loading ? "Thinking..." : "Get My Next Steps";
  btnSpinner.classList.toggle("hidden", !loading);
}

function renderSteps(steps) {
  stepsList.innerHTML = "";
  steps.forEach((step) => {
    const li = document.createElement("li");
    li.textContent = step;
    stepsList.appendChild(li);
  });
  responsePanel.classList.remove("hidden");
}

async function askCompanion() {
  const ctx = getContext(roleSelect.value);
  setLoading(true);
  responsePanel.classList.add("hidden");

  try {
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ctx),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (data.steps && data.steps.length > 0) {
      renderSteps(data.steps);
    } else {
      renderSteps(["No guidance returned. Check the backend console."]);
    }
  } catch (err) {
    console.error(err);
    renderSteps([
      "Could not reach the backend.",
      "Make sure the server is running: cd backend && npm start",
    ]);
  } finally {
    setLoading(false);
  }
}

// Init preview on load and on role change
updatePreview();
roleSelect.addEventListener("change", updatePreview);
