const BACKEND_URL = "http://localhost:3000/ask";

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

function logout() {
  localStorage.removeItem("selectedRole");
  window.location.href = "index.html";
}

function askCompanion() {
  localStorage.setItem("selectedRole", roleSelect.value);
  window.location.href = "listing.html";
}

// Init preview on load and on role change
if (roleSelect) {
  updatePreview();
  roleSelect.addEventListener("change", updatePreview);
}

// ── Contacts listing ──

// Mock user personas per role and manager→rep hierarchy
const MOCK_USERS = {
  "Sales Rep": { name: "Jamie Cruz" },
  "Manager":   { name: "Sarah Williams", reps: ["Jamie Cruz", "Drew Patel"] },
  "Admin":     { name: "Admin User" },
};

const CONTACTS = [
  { name: "Alex Rivera",   email: "alex.rivera@acmecorp.com",   phone: "(415) 555-0101", company: "Acme Corp",        status: "hot",    lastActivity: "Today",     assignedTo: "Jamie Cruz" },
  { name: "Jordan Lee",    email: "jordan.lee@brightwave.io",   phone: "(312) 555-0188", company: "BrightWave",       status: "warm",   lastActivity: "Yesterday", assignedTo: "Jamie Cruz" },
  { name: "Morgan Chen",   email: "morgan.chen@nexatech.com",   phone: "(628) 555-0234", company: "NexaTech",         status: "cold",   lastActivity: "Feb 17",    assignedTo: "Drew Patel" },
  { name: "Taylor Brooks", email: "t.brooks@summitgroup.com",   phone: "(213) 555-0099", company: "Summit Group",     status: "client", lastActivity: "Feb 15",    assignedTo: "Sarah Williams" },
  { name: "Sam Patel",     email: "sam.patel@orbitinc.com",     phone: "(408) 555-0145", company: "Orbit Inc",        status: "warm",   lastActivity: "Feb 14",    assignedTo: "Jamie Cruz" },
  { name: "Casey Morgan",  email: "casey.m@bluepeak.net",       phone: "(503) 555-0177", company: "BluePeak",         status: "cold",   lastActivity: "Feb 10",    assignedTo: "Drew Patel" },
  { name: "Jamie Nguyen",  email: "jamie.n@vertexsolutions.io", phone: "(206) 555-0222", company: "Vertex Solutions", status: "hot",    lastActivity: "Today",     assignedTo: "Chris Vega" },
  { name: "Riley Adams",   email: "r.adams@crestline.com",      phone: "(720) 555-0311", company: "Crestline Co",     status: "client", lastActivity: "Feb 18",    assignedTo: "Chris Vega" },
];

const STATUS_BADGE = { hot: "badge-hot", warm: "badge-warm", cold: "badge-cold", client: "badge-client" };

function getVisibleContacts(role) {
  if (role === "Admin") return CONTACTS;
  const user = MOCK_USERS[role];
  if (!user) return [];
  if (role === "Manager") {
    const visible = [user.name, ...(user.reps || [])];
    return CONTACTS.filter(c => visible.includes(c.assignedTo));
  }
  // Sales Rep — own records only
  return CONTACTS.filter(c => c.assignedTo === user.name);
}

function getActionButtons(role) {
  const view   = `<button class="icon-btn icon-btn-view"   title="View"   onclick="alert('View — coming soon!')"><i data-lucide="eye"></i></button>`;
  const update = `<button class="icon-btn icon-btn-update" title="Update" onclick="alert('Update — coming soon!')"><i data-lucide="pencil"></i></button>`;
  const del    = `<button class="icon-btn icon-btn-delete" title="Delete" onclick="alert('Delete — coming soon!')"><i data-lucide="trash-2"></i></button>`;
  if (role === "Sales Rep") return view + update;
  return view + update + del; // Manager and Admin
}

function renderContacts(list) {
  const tbody = document.getElementById("contactsBody");
  if (!tbody) return;
  const empty = document.getElementById("emptyState");
  tbody.innerHTML = "";
  if (list.length === 0) { empty.style.display = "block"; return; }
  empty.style.display = "none";
  const role = localStorage.getItem("selectedRole") || "";
  list.forEach(c => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><strong>${c.name}</strong></td>
      <td><a href="mailto:${c.email}" class="action-link">${c.email}</a></td>
      <td>${c.phone}</td>
      <td>${c.company}</td>
      <td><span class="badge ${STATUS_BADGE[c.status]}">${c.status}</span></td>
      <td>${c.lastActivity}</td>
      <td>${c.assignedTo}</td>
      <td class="tbl-actions">${getActionButtons(role)}</td>
    `;
    tbody.appendChild(row);
  });
  if (typeof lucide !== "undefined") lucide.createIcons();
}

function filterContacts() {
  const role = localStorage.getItem("selectedRole") || "";
  const q = document.getElementById("searchInput").value.toLowerCase();
  renderContacts(getVisibleContacts(role).filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.email.toLowerCase().includes(q) ||
    c.company.toLowerCase().includes(q)
  ));
}

// ── UI Highlighting ──
const HIGHLIGHT_RULES = [
  { keywords: ["view", "see", "read", "look", "open"],   selector: ".icon-btn-view",   label: "View buttons",        tip: "Click to view this contact" },
  { keywords: ["update", "edit", "modify", "change"],    selector: ".icon-btn-update", label: "Update buttons",      tip: "Click to edit this contact" },
  { keywords: ["delete", "remove", "trash"],             selector: ".icon-btn-delete", label: "Delete buttons",      tip: "Click to delete this contact" },
  { keywords: ["add", "create", "new"],                  selector: ".btn-primary",     label: "Add Contact button",  tip: "Click to add a new contact" },
  { keywords: ["search", "find", "filter"],              selector: "#searchInput",     label: "search bar",          tip: "Type here to search contacts" },
];

const MODULE_DEFAULTS = {
  "Leads":     ".icon-btn-view",
  "Dashboard": "#searchInput",
  "Settings":  ".btn-primary",
};

const ONBOARDING_STEPS = {
  "Sales Rep": [
    {
      message: "Welcome! This is your Contacts table — it shows only the leads and clients assigned to you.",
      selector: "#contactsTable",
      tip: "Your assigned contacts live here",
      crmState: { summary: "3 contacts assigned to you, 2 need follow-up today" },
    },
    {
      message: "Use the Search bar to quickly find a contact by name, email, or company.",
      selector: "#searchInput",
      tip: "Type here to filter contacts",
      crmState: { summary: "12 new leads uncontacted, pipeline empty" },
    },
    {
      message: "Use the View and Edit buttons on each row to review or update a contact's details.",
      selector: ".icon-btn-view",
      tip: "Click to view this contact",
      crmState: { summary: "Alex Rivera marked hot — last contact was today" },
    },
  ],
  "Manager": [
    {
      message: "Welcome! As a Manager you can see contacts assigned to yourself and your entire team.",
      selector: "#contactsTable",
      tip: "Your team's contacts live here",
      crmState: { summary: "5 contacts across 2 reps, 1 contact unassigned" },
    },
    {
      message: "Search across all your reps' contacts using the Search bar.",
      selector: "#searchInput",
      tip: "Filter across team contacts",
      crmState: { summary: "3 reps inactive this week, Q2 quota at 40%" },
    },
    {
      message: "Use the Add Contact button to create a new contact or lead for your team.",
      selector: ".btn-primary",
      tip: "Click to add a new contact",
      crmState: { summary: "New lead from conference not yet added to CRM" },
    },
    {
      message: "Use the View and Edit buttons to review any contact in your team.",
      selector: ".icon-btn-view",
      tip: "Click to view this contact",
      crmState: { summary: "Taylor Brooks marked client — renewal due next month" },
    },
  ],
  "Admin": [
    {
      message: "Welcome, Admin! You have full visibility over every contact in the system.",
      selector: "#contactsTable",
      tip: "Full contact database",
      crmState: { summary: "8 total contacts across all reps, 2 unassigned" },
    },
    {
      message: "Click Add Contact to manually onboard a new user or lead.",
      selector: ".btn-primary",
      tip: "Click to add a new contact",
      crmState: { summary: "2 users pending setup, email integration not configured" },
    },
    {
      message: "Use the Search bar to locate any contact in the database instantly.",
      selector: "#searchInput",
      tip: "Search the entire database",
      crmState: { summary: "Email integration not configured, 2 users pending setup" },
    },
    {
      message: "As Admin, you can delete any record using the red trash icon — use with care.",
      selector: ".icon-btn-delete",
      tip: "Admin-only: delete this record",
      crmState: { summary: "1 duplicate contact detected — consider cleanup" },
    },
  ],
};

let tourSteps = [];
let currentTourStep = -1;
let onboardingEnabled = false;

function clearHighlights() {
  document.querySelectorAll(".ui-highlight").forEach(el => {
    el.classList.remove("ui-highlight");
    el.removeAttribute("data-tip");
  });
}

function highlightUI(text) {
  clearHighlights();
  const lower = text.toLowerCase();
  let matched = HIGHLIGHT_RULES.find(rule => rule.keywords.some(k => lower.includes(k)));

  if (!matched) {
    const role = localStorage.getItem("selectedRole") || "Sales Rep";
    const ctx = getContext(role);
    const selector = MODULE_DEFAULTS[ctx.module];
    if (selector) {
    const els = document.querySelectorAll(selector);
    if (els.length > 0) els.forEach(el => el.classList.add("ui-highlight"));
  }
    return null;
  }

  const els = document.querySelectorAll(matched.selector);
  if (els.length === 0) return null;
  els.forEach(el => {
    el.classList.add("ui-highlight");
    el.setAttribute("data-tip", matched.tip);
  });
  setTimeout(clearHighlights, 4000);
  return matched.label;
}

// ── Onboarding Tour ──
function updateOnboardingToggle() {
  const btn = document.getElementById("onboardingToggle");
  if (!btn) return;
  btn.textContent = `Onboarding: ${onboardingEnabled ? "ON" : "OFF"}`;
  btn.classList.toggle("onboarding-toggle-on", onboardingEnabled);
}

function toggleOnboarding() {
  if (onboardingEnabled) {
    endTour();
  } else {
    const role = localStorage.getItem("selectedRole") || "Sales Rep";
    startTour(role);
  }
}

function startTour(role) {
  tourSteps = ONBOARDING_STEPS[role] || [];
  if (tourSteps.length === 0) return;
  onboardingEnabled = true;
  updateOnboardingToggle();
  currentTourStep = 0;
  renderTourStep(0);
}

function renderTourStep(index) {
  if (index >= tourSteps.length) { endTour(); return; }
  const step = tourSteps[index];
  const total = tourSteps.length;

  if (!document.querySelector(step.selector)) {
    if (index + 1 < total) { currentTourStep = index + 1; renderTourStep(currentTourStep); }
    else endTour();
    return;
  }

  // Open chat panel
  const chatPanel = document.getElementById("chatPanel");
  const messages = document.getElementById("chatMessages");
  if (chatPanel && chatPanel.classList.contains("hidden")) {
    chatPanel.classList.remove("hidden");
  }

  // Step indicator
  const label = document.createElement("div");
  label.className = "chat-bubble bot tour-step-label";
  label.textContent = `Step ${index + 1} of ${total}`;
  messages.appendChild(label);

  // Step message
  const bubble = document.createElement("div");
  bubble.className = "chat-bubble bot";
  bubble.textContent = step.message;
  messages.appendChild(bubble);

  // CRM context
  const ctx = document.createElement("div");
  ctx.className = "chat-bubble bot tour-context";
  ctx.textContent = `Context: ${step.crmState.summary}`;
  messages.appendChild(ctx);

  // Navigation buttons
  const isLast = index === total - 1;
  const actions = document.createElement("div");
  actions.className = "tour-chat-actions";
  actions.innerHTML = `
    <button class="tour-chat-btn-end" onclick="endTour()">End Tour</button>
    <button class="tour-chat-btn-next" onclick="advanceTour()">${isLast ? "Finish ✓" : "Next →"}</button>
  `;
  messages.appendChild(actions);
  messages.scrollTop = messages.scrollHeight;

  // Highlight element
  clearHighlights();
  document.querySelectorAll(step.selector).forEach(el => {
    el.classList.add("ui-highlight");
    el.setAttribute("data-tip", step.tip);
  });
  document.querySelector(step.selector).scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function advanceTour() {
  document.querySelectorAll(".tour-chat-actions").forEach(el => el.remove());
  currentTourStep += 1;
  if (currentTourStep >= tourSteps.length) endTour();
  else renderTourStep(currentTourStep);
}

function endTour() {
  const wasActive = currentTourStep >= 0;
  onboardingEnabled = false;
  updateOnboardingToggle();
  currentTourStep = -1;
  tourSteps = [];
  clearHighlights();
  document.querySelectorAll(".tour-chat-actions").forEach(el => el.remove());
  if (wasActive) {
    const messages = document.getElementById("chatMessages");
    if (messages) {
      const bubble = document.createElement("div");
      bubble.className = "chat-bubble bot";
      bubble.textContent = "Tour complete! You're all set to explore OptifiNow.";
      messages.appendChild(bubble);
      messages.scrollTop = messages.scrollHeight;
    }
  }
}

// ── AI Chatbot ──
function toggleChat() {
  const panel = document.getElementById("chatPanel");
  if (!panel) return;
  panel.classList.toggle("hidden");
  if (!panel.classList.contains("hidden")) {
    document.getElementById("chatInput").focus();
    if (typeof lucide !== "undefined") lucide.createIcons();
  }
}

function appendBotBubble(text, messages) {
  const botBubble = document.createElement("div");
  botBubble.className = "chat-bubble bot";
  botBubble.textContent = text;
  messages.appendChild(botBubble);
  messages.scrollTop = messages.scrollHeight;
}

async function sendMessage() {
  const input = document.getElementById("chatInput");
  const messages = document.getElementById("chatMessages");
  const text = input.value.trim();
  if (!text) return;

  const userBubble = document.createElement("div");
  userBubble.className = "chat-bubble user";
  userBubble.textContent = text;
  messages.appendChild(userBubble);
  input.value = "";
  messages.scrollTop = messages.scrollHeight;

  const tourKeywords = ["tour", "onboard", "guide me", "show me around", "walk me through", "help me start"];
  if (tourKeywords.some(k => text.toLowerCase().includes(k))) {
    const role = localStorage.getItem("selectedRole") || "Sales Rep";
    startTour(role);
    return;
  }

  const highlightedLabel = highlightUI(text);

  if (text.toLowerCase() === "where do i start?") {
    const role = localStorage.getItem("selectedRole") || "Sales Rep";
    const ctx = getContext(role);
    try {
      const res = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: ctx.role, module: ctx.module, crmState: ctx.crmState }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const reply = data.steps ? data.steps.join("\n") : "No steps returned.";
      appendBotBubble(reply, messages);
    } catch (err) {
      appendBotBubble("Could not reach the backend. Make sure the server is running.", messages);
    }
  } else {
    const reply = highlightedLabel
      ? `I've highlighted the ${highlightedLabel} on the page for you.`
      : "Backend functionality coming soon!";
    setTimeout(() => appendBotBubble(reply, messages), 500);
  }
}

if (document.getElementById("contactsBody")) {
  const role = localStorage.getItem("selectedRole") || "";
  renderContacts(getVisibleContacts(role));
  const helloText = document.getElementById("helloText");
  if (helloText) {
    const role = localStorage.getItem("selectedRole") || "Guest";
    helloText.textContent = `Hello, ${role}!`;
  }
}
