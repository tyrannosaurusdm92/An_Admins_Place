(function () {
  "use strict";

  const engine = window.ConversationScannerRandomizer;
  const byId = (id) => document.getElementById(id);

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[ch]));
  }

  function write(id, value) {
    byId(id).textContent = typeof value === "string" ? value : JSON.stringify(value, null, 2);
  }

  function status(message) {
    byId("status").textContent = message;
  }

  async function loadHosted() {
    status("Loading starter JSON files...");
    const result = await engine.loadHostedJson({ manifestUrl: "json/manifest.json" });
    status(result.ok ? "Starter JSON loaded." : "Starter JSON could not be fetched in this browser mode. Use the directory picker instead.");
    write("packet", result);
    renderState();
  }

  async function loadDirectory(event) {
    const files = Array.prototype.slice.call(event.target.files || []);
    status("Reading selected JSON files...");
    const result = await engine.loadJsonFiles(files);
    status("Loaded " + result.loaded + " JSON file(s). Response entries: " + result.totalEntries + ".");
    write("packet", result);
    renderState();
  }

  function scanOnly() {
    const text = byId("conversation").value;
    const result = engine.scanConversation(text, {
      userName: byId("userName").value,
      tone: byId("tone").value,
      locale: byId("locale").value
    });
    write("packet", result);
    renderSignals(result);
    status("Conversation scanned.");
  }

  function generate() {
    const text = byId("conversation").value;
    const result = engine.generateResponse(text, {
      userName: byId("userName").value,
      tone: byId("tone").value,
      locale: byId("locale").value
    });
    write("response", result.text);
    write("packet", result);
    renderSignals(result.detected);
    renderCandidates(result.topCandidates || []);
    renderState();
    status("Response generated.");
  }

  function renderSignals(signals) {
    const fields = ["topics", "moods", "needs", "tasks", "asks", "questions", "intents"];
    let html = "";
    for (let i = 0; i < fields.length; i += 1) {
      const key = fields[i];
      const list = signals && Array.isArray(signals[key]) ? signals[key] : [];
      html += "<section><h3>" + escapeHtml(key) + "</h3><p>" + escapeHtml(list.length ? list.join(", ") : "none detected") + "</p></section>";
    }
    byId("signals").innerHTML = html;
  }

  function renderCandidates(candidates) {
    let html = "";
    for (let i = 0; i < candidates.length; i += 1) {
      const item = candidates[i] || {};
      html += "<article><strong>" + escapeHtml(item.sourceFile || "local JSON") + "</strong> <span>score " + escapeHtml(item.score) + "</span><p>" + escapeHtml(item.text || "") + "</p></article>";
    }
    byId("candidates").innerHTML = html || "<p>No candidates yet.</p>";
  }

  function renderState() {
    const state = engine.getState();
    byId("stats").textContent = "Files: " + state.files.length + " | Response entries: " + state.responseEntries + " | Recent replies: " + state.recentResponses;
  }

  function resetHistory() {
    const result = engine.resetHistory();
    write("packet", result);
    renderState();
    status("Recent-response memory reset.");
  }

  document.addEventListener("DOMContentLoaded", function () {
    byId("jsonDirectory").addEventListener("change", loadDirectory);
    byId("loadHosted").addEventListener("click", loadHosted);
    byId("scan").addEventListener("click", scanOnly);
    byId("generate").addEventListener("click", generate);
    byId("resetHistory").addEventListener("click", resetHistory);
    renderState();
    generate();
  });
})();
