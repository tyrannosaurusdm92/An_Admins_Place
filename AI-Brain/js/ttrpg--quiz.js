/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-a. */
(() => {
"use strict";

const DATA = window.UNIVERSAL_DATA;
if (!DATA) throw new Error("Universal quiz data bundle failed to load.");

const ALIGN = DATA.alignment;
const AXES = ALIGN.axes;
const AXIS_IDS = AXES.map(a => a.id);
const AXIS_BY_ID = Object.fromEntries(AXES.map(a => [a.id, a]));
const MIN = ALIGN.min;
const MAX = ALIGN.max;
const MID = ALIGN.midpoint;

const byId = id => document.getElementById(id);
const els = {
  home: byId("homeScreen"), quiz: byId("quizScreen"), resultScreen: byId("resultScreen"),
  stage: byId("stage"), result: byId("result"), mode: byId("modeLabel"),
  title: byId("stageTitle"), subtitle: byId("stageSubtitle"), bar: byId("progressBar"),
  progress: byId("progressText"), homeBtn: byId("homeButton"), backBtn: byId("backButton"),
  printBtn: byId("printButton"), homeStats: byId("homeStats")
};

const blankState = () => ({
  mode: null,
  stage: "home",
  questionIndex: 0,
  answers: [],
  profile: { characterName: "", familyId: "", raceId: "", optionId: "", classId: "", subclassId: "" },
  commitments: {
    background: [{ axis: "", direction: 0 }, { axis: "", direction: 0 }],
    covenantAxes: [],
    classFocus: [{ axis: "", direction: 0 }, { axis: "", direction: 0 }],
    convictions: [{ text: "", grade: "Major" }, { text: "", grade: "Minor" }],
    tie: { text: "", grade: "Major" }
  },
  trackers: { resonance: 3, claim: 0, resolve: 0, strain: 0 },
  result: null
});
let state = blankState();

const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
}[c]));
const clamp = n => Math.max(MIN, Math.min(MAX, Math.round(Number(n) || 0)));
const cap = s => String(s || "").charAt(0).toUpperCase() + String(s || "").slice(1);
const slugify = s => String(s || "universal_character").normalize("NFKD").replace(/[^\w]+/g, "_").replace(/^_+|_+$/g, "").toLowerCase();
const signed = n => Number(n) > 0 ? `+${Number(n)}` : String(Number(n));
const list = items => `<ul class="rule-list">${(items || []).map(x => `<li>${esc(x)}</li>`).join("")}</ul>`;

function family() {
  return DATA.races.families.find(x => x.id === state.profile.familyId) || null;
}
function race() {
  return family()?.races.find(x => x.id === state.profile.raceId) || null;
}
function option() {
  return race()?.options.find(x => x.id === state.profile.optionId) || null;
}
function klass() {
  return DATA.classes.classes.find(x => x.id === state.profile.classId) || null;
}
function subclass() {
  return klass()?.subclasses.find(x => x.id === state.profile.subclassId) || null;
}
function deityByName(name) {
  return DATA.deities.deities.find(x => x.name === name) || null;
}
function covenantDeity() {
  return deityByName(klass()?.deity);
}
function creatorDeity() {
  return deityByName(family()?.creatorDeity);
}
function questions() {
  return state.mode === "deep" ? DATA.questions.deep : DATA.questions.quick;
}
function selectedRaceName() {
  return option()?.fullName || option()?.name || race()?.name || "";
}

function show(screen) {
  [els.home, els.quiz, els.resultScreen].forEach(x => x.classList.remove("active"));
  screen.classList.add("active");
  els.backBtn.disabled = screen === els.home;
  els.printBtn.disabled = screen !== els.resultScreen;
  window.scrollTo({ top: 0, behavior: "instant" });
}

function setProgress(percent, text) {
  els.bar.style.width = `${Math.max(0, Math.min(100, percent))}%`;
  els.progress.textContent = text;
}

function reset() {
  state = blankState();
  show(els.home);
  els.mode.textContent = "Quiz";
  els.title.textContent = "Character Profile";
  els.subtitle.textContent = "";
  setProgress(0, "");
}

function start(mode) {
  state = blankState();
  state.mode = mode;
  state.stage = "profile";
  show(els.quiz);
  renderProfile();
}

function profileValid() {
  const r = race(), c = klass(), s = subclass();
  if (!family() || !r || !c || !s) return false;
  if (r.options.length && !option()) return false;
  return Boolean(covenantDeity());
}

function optionTags(items, selected, placeholder) {
  return `<option value="">${esc(placeholder)}</option>${items.map(item =>
    `<option value="${esc(item.id)}"${item.id === selected ? " selected" : ""}>${esc(item.name)}</option>`
  ).join("")}`;
}

function renderProfile() {
  state.stage = "profile";
  els.mode.textContent = state.mode === "deep" ? "Covenant Examination" : "Eight-Axis Snapshot";
  els.title.textContent = "Canonical Character Profile";
  els.subtitle.textContent = "Choose ancestry and one of the 22 class-bound divine covenants.";
  setProgress(5, "Step 1 of 3 • Identity");

  const f = family(), r = race(), c = klass(), s = subclass(), cd = creatorDeity(), pd = covenantDeity();
  const raceOptions = f?.races || [];
  const nestedOptions = r?.options || [];
  const classOptions = DATA.classes.classes;
  const subclassOptions = c?.subclasses || [];

  els.stage.innerHTML = `
    <div class="form-grid">
      <div class="field full">
        <label for="characterName">Character name</label>
        <input class="input" id="characterName" maxlength="100" value="${esc(state.profile.characterName)}" placeholder="Optional for the quiz; recommended for export">
      </div>
      <div class="field">
        <label for="familySelect">Creator race family</label>
        <select class="select" id="familySelect">${optionTags(DATA.races.families, state.profile.familyId, "Choose one of 22 creator families")}</select>
        <div class="help">${f ? esc(f.description) : "Each family is canonically associated with one creator deity."}</div>
      </div>
      <div class="field">
        <label for="raceSelect">Parent race</label>
        <select class="select" id="raceSelect" ${f ? "" : "disabled"}>${optionTags(raceOptions, state.profile.raceId, "Choose a parent race")}</select>
        <div class="help">${r ? esc(r.description) : "Select a creator family first."}</div>
      </div>
      <div class="field">
        <label for="optionSelect">Bloodline, lineage, ancestry, or form</label>
        <select class="select" id="optionSelect" ${r && nestedOptions.length ? "" : "disabled"}>
          ${nestedOptions.length ? optionTags(nestedOptions, state.profile.optionId, "Choose the required nested option") : '<option value="">No nested option required</option>'}
        </select>
        <div class="help">${option() ? esc(option().description) : nestedOptions.length ? "This race requires a canonical nested option." : "The selected parent race is complete without another choice."}</div>
      </div>
      <div class="field">
        <label for="classSelect">Canonical merged class</label>
        <select class="select" id="classSelect">${optionTags(classOptions, state.profile.classId, "Choose one of 22 classes")}</select>
        <div class="help">${c ? esc(c.description) : "Every class has three subclasses and exactly one assigned deity."}</div>
      </div>
      <div class="field">
        <label for="subclassSelect">Subclass</label>
        <select class="select" id="subclassSelect" ${c ? "" : "disabled"}>${optionTags(subclassOptions, state.profile.subclassId, "Choose one of 3 subclasses")}</select>
        <div class="help">${s ? esc(s.identity) : "Select a class first."}</div>
      </div>
    </div>

    <div class="grid two" style="margin-top:16px">
      <article class="card identity-card">
        <div class="kicker">Ancestry record</div>
        <h3>${f ? esc(f.name) : "No creator family selected"}</h3>
        <p><strong>Creator deity:</strong> ${cd ? esc(cd.name) : "—"}</p>
        ${cd ? `<p class="muted">${esc(cd.createdPeoplesRecord || cd.description)}</p>` : '<p class="muted">Ancestry identifies creator lore but does not automatically force moral movement in the new system.</p>'}
        ${f ? `<details class="details"><summary>Creation doctrine</summary><p class="muted">${esc(f.doctrine)}</p></details>` : ""}
      </article>
      <article class="card deity-card">
        <div class="kicker">Active class covenant</div>
        <h3>${pd ? esc(pd.name) : "Select a class"}</h3>
        ${pd ? `<p><strong>${esc(pd.titles.join(" • "))}</strong></p><p class="muted">${esc(pd.virtue)}</p><p><strong>Assigned class:</strong> ${esc(c.name)}</p>` : '<p class="muted">The class’s assigned deity is automatic and cannot be replaced by an unrelated patron.</p>'}
      </article>
    </div>

    <div class="notice violet" style="margin-top:16px"><strong>Canon rule:</strong> ancestry, class, and deity provide identity, duties, pressures, practices, and hazards. They do not mechanically force later alignment movement without demonstrated conduct.</div>
    <div id="profileWarning" class="warning-text small" style="margin-top:12px"></div>
    <div class="stage-footer">
      <button class="btn ghost" type="button" id="cancelProfile">Return Home</button>
      <button class="btn" type="button" id="continueProfile" ${profileValid() ? "" : "disabled"}>Continue to Commitments</button>
    </div>`;

  byId("characterName").addEventListener("input", e => state.profile.characterName = e.target.value);
  byId("familySelect").addEventListener("change", e => {
    state.profile.familyId = e.target.value;
    state.profile.raceId = "";
    state.profile.optionId = "";
    renderProfile();
  });
  byId("raceSelect").addEventListener("change", e => {
    state.profile.raceId = e.target.value;
    state.profile.optionId = "";
    renderProfile();
  });
  byId("optionSelect").addEventListener("change", e => {
    state.profile.optionId = e.target.value;
    renderProfile();
  });
  byId("classSelect").addEventListener("change", e => {
    state.profile.classId = e.target.value;
    state.profile.subclassId = "";
    state.commitments.covenantAxes = [];
    state.commitments.classFocus = [{ axis: "", direction: 0 }, { axis: "", direction: 0 }];
    renderProfile();
  });
  byId("subclassSelect").addEventListener("change", e => {
    state.profile.subclassId = e.target.value;
    renderProfile();
  });
  byId("cancelProfile").addEventListener("click", reset);
  byId("continueProfile").addEventListener("click", () => {
    if (!profileValid()) return;
    renderCommitments();
  });
}

function axisSelectOptions(allowed, selected, placeholder = "No adjustment") {
  const items = (allowed || AXIS_IDS).map(id => AXIS_BY_ID[id]).filter(Boolean);
  return `<option value="">${esc(placeholder)}</option>${items.map(a =>
    `<option value="${esc(a.id)}"${a.id === selected ? " selected" : ""}>${esc(a.name)}</option>`
  ).join("")}`;
}

function directionOptions(selected) {
  return `
    <option value="0"${Number(selected) === 0 ? " selected" : ""}>No movement</option>
    <option value="-1"${Number(selected) === -1 ? " selected" : ""}>−250 toward low endpoint</option>
    <option value="1"${Number(selected) === 1 ? " selected" : ""}>+250 toward high endpoint</option>`;
}

function commitmentErrors() {
  const errors = [];
  const bg = state.commitments.background.filter(x => x.axis && Number(x.direction));
  const cf = state.commitments.classFocus.filter(x => x.axis && Number(x.direction));
  if (new Set(bg.map(x => x.axis)).size !== bg.length) errors.push("Background adjustments must use different axes.");
  if (new Set(cf.map(x => x.axis)).size !== cf.length) errors.push("Class discipline adjustments must use different focus axes.");
  if (state.commitments.covenantAxes.length > 3) errors.push("Choose no more than three covenant pressures.");
  if (state.commitments.convictions.some(x => !x.text.trim())) errors.push("Enter both starting Convictions.");
  if (state.commitments.convictions.filter(x => x.grade === "Defining").length > 1) errors.push("Only one starting Conviction may be Defining.");
  return errors;
}

function commitmentPreview() {
  const totals = Object.fromEntries(AXIS_IDS.map(id => [id, 0]));
  for (const x of state.commitments.background) if (x.axis && Number(x.direction)) totals[x.axis] += Number(x.direction) * 250;
  const pd = covenantDeity();
  for (const id of state.commitments.covenantAxes) totals[id] += Math.sign(Number(pd?.pressures?.[id]) || 0) * 250;
  for (const x of state.commitments.classFocus) if (x.axis && Number(x.direction)) totals[x.axis] += Number(x.direction) * 250;
  const used = AXIS_IDS.filter(id => totals[id]);
  return used.length ? used.map(id => `${AXIS_BY_ID[id].name} ${signed(totals[id])}`).join(" • ") : "No optional creation movement selected; all axes remain at the 1500 pivot before answers.";
}

function renderCommitments() {
  state.stage = "commitments";
  els.mode.textContent = state.mode === "deep" ? "Covenant Examination" : "Eight-Axis Snapshot";
  els.title.textContent = "Creation Commitments";
  els.subtitle.textContent = "Apply only the optional starting pressures you intend the character to embody.";
  setProgress(15, "Step 2 of 3 • Starting scores, Convictions, and Tie");

  const c = klass(), pd = covenantDeity();
  const pressureEntries = Object.entries(pd?.pressures || {}).filter(([, v]) => Number(v));
  const focusAxes = c?.axisFocus || [];
  const errors = commitmentErrors();

  els.stage.innerHTML = `
    <div class="notice"><strong>Starting rule:</strong> all eight axes begin at 1500. Background may adjust up to two axes, the covenant may adjust up to three listed pressures, and class discipline may adjust up to two focus axes. Each selected creation adjustment is exactly 250 points.</div>

    <section class="commitment-section card">
      <div class="kicker">Background • up to two axes</div>
      <h3>Demonstrated history before play</h3>
      <p class="muted">Use these only when the character’s established background already supports the direction.</p>
      ${state.commitments.background.map((row, i) => `
        <div class="commitment-row">
          <div class="field"><label for="bgAxis${i}">Background axis ${i + 1}</label><select class="select" id="bgAxis${i}">${axisSelectOptions(null, row.axis)}</select></div>
          <div class="field"><label for="bgDir${i}">Direction</label><select class="select" id="bgDir${i}">${directionOptions(row.direction)}</select></div>
        </div>`).join("")}
    </section>

    <section class="commitment-section card deity-card">
      <div class="kicker">${esc(pd?.name || "Deity")} • up to three pressures</div>
      <h3>Covenant pressure accepted at creation</h3>
      <p class="muted">These are not forced morality. Select the pressures this character has actually internalized.</p>
      <div class="check-grid">
        ${pressureEntries.map(([id, dir]) => {
          const a = AXIS_BY_ID[id], checked = state.commitments.covenantAxes.includes(id);
          return `<label class="check-card"><input type="checkbox" data-covenant-axis="${esc(id)}" ${checked ? "checked" : ""}><span><strong>${esc(a.name)}</strong><br><span class="${dir > 0 ? "direction-high" : "direction-low"}">${dir > 0 ? "+250 toward " + esc(a.high) : "−250 toward " + esc(a.low)}</span></span></label>`;
        }).join("")}
      </div>
      <p class="small muted"><strong>Virtue:</strong> ${esc(pd?.virtue || "")}</p>
    </section>

    <section class="commitment-section card">
      <div class="kicker">${esc(c?.name || "Class")} • up to two focus axes</div>
      <h3>Class disciplines</h3>
      <p class="muted">The class identifies focus axes, but the player chooses whether the established discipline leans toward the low or high endpoint.</p>
      ${state.commitments.classFocus.map((row, i) => `
        <div class="commitment-row">
          <div class="field"><label for="classAxis${i}">Class focus ${i + 1}</label><select class="select" id="classAxis${i}">${axisSelectOptions(focusAxes, row.axis)}</select></div>
          <div class="field"><label for="classDir${i}">Direction</label><select class="select" id="classDir${i}">${directionOptions(row.direction)}</select></div>
        </div>`).join("")}
      <details class="details"><summary>Practices and hazards</summary><div class="grid two"><div><strong>Practices</strong>${list(c?.practices)}</div><div><strong>Hazards</strong>${list(c?.hazards)}</div></div></details>
    </section>

    <section class="commitment-section card">
      <div class="kicker">Convictions and Tie</div>
      <h3>What creates meaningful cost?</h3>
      <p class="muted">The new rules begin with two Convictions. At most one may be Defining. A Tie is optional and does not itself set Altruism or Cooperation.</p>
      <div class="form-grid">
        ${state.commitments.convictions.map((x, i) => `
          <div class="field"><label for="conviction${i}">Conviction ${i + 1}</label><textarea class="textarea" id="conviction${i}" placeholder="A principle the character accepts cost to uphold">${esc(x.text)}</textarea></div>
          <div class="field"><label for="convictionGrade${i}">Grade</label><select class="select" id="convictionGrade${i}">
            ${["Minor", "Major", "Defining"].map(g => `<option${x.grade === g ? " selected" : ""}>${g}</option>`).join("")}
          </select><div class="help">${esc(ALIGN.rules.convictions.grades[x.grade.toLowerCase()] || "")}</div></div>`).join("")}
        <div class="field"><label for="tieText">Tie (optional)</label><textarea class="textarea" id="tieText" placeholder="Person, community, place, deity, faction, or ideal">${esc(state.commitments.tie.text)}</textarea></div>
        <div class="field"><label for="tieGrade">Tie grade</label><select class="select" id="tieGrade">${["Minor", "Major", "Defining"].map(g => `<option${state.commitments.tie.grade === g ? " selected" : ""}>${g}</option>`).join("")}</select></div>
      </div>
    </section>

    <div class="notice violet" style="margin-top:16px"><strong>Creation movement preview:</strong> <span id="commitmentPreview">${esc(commitmentPreview())}</span></div>
    <div id="commitmentWarning" class="${errors.length ? "warning-text" : "ok-text"} small" style="margin-top:12px">${errors.length ? errors.map(esc).join(" ") : "Commitments are valid."}</div>
    <div class="stage-footer">
      <button class="btn ghost" id="backToProfile" type="button">Back to Profile</button>
      <button class="btn" id="beginQuestions" type="button" ${errors.length ? "disabled" : ""}>Begin ${state.mode === "deep" ? "Examination" : "Snapshot"}</button>
    </div>`;

  const rerender = () => renderCommitments();
  const refreshCommitmentValidation = () => {
    const liveErrors = commitmentErrors();
    const warning = byId("commitmentWarning");
    if (warning) {
      warning.className = `${liveErrors.length ? "warning-text" : "ok-text"} small`;
      warning.textContent = liveErrors.length ? liveErrors.join(" ") : "Commitments are valid.";
    }
    const begin = byId("beginQuestions");
    if (begin) begin.disabled = Boolean(liveErrors.length);
    const preview = byId("commitmentPreview");
    if (preview) preview.textContent = commitmentPreview();
  };
  state.commitments.background.forEach((row, i) => {
    byId(`bgAxis${i}`).addEventListener("change", e => { row.axis = e.target.value; if (!row.axis) row.direction = 0; rerender(); });
    byId(`bgDir${i}`).addEventListener("change", e => { row.direction = Number(e.target.value); rerender(); });
  });
  document.querySelectorAll("[data-covenant-axis]").forEach(box => box.addEventListener("change", e => {
    const id = e.target.dataset.covenantAxis;
    if (e.target.checked) {
      if (!state.commitments.covenantAxes.includes(id) && state.commitments.covenantAxes.length < 3) state.commitments.covenantAxes.push(id);
    } else state.commitments.covenantAxes = state.commitments.covenantAxes.filter(x => x !== id);
    rerender();
  }));
  state.commitments.classFocus.forEach((row, i) => {
    byId(`classAxis${i}`).addEventListener("change", e => { row.axis = e.target.value; if (!row.axis) row.direction = 0; rerender(); });
    byId(`classDir${i}`).addEventListener("change", e => { row.direction = Number(e.target.value); rerender(); });
  });
  state.commitments.convictions.forEach((x, i) => {
    byId(`conviction${i}`).addEventListener("input", e => { x.text = e.target.value; refreshCommitmentValidation(); });
    byId(`convictionGrade${i}`).addEventListener("change", e => { x.grade = e.target.value; rerender(); });
  });
  byId("tieText").addEventListener("input", e => state.commitments.tie.text = e.target.value);
  byId("tieGrade").addEventListener("change", e => { state.commitments.tie.grade = e.target.value; });
  byId("backToProfile").addEventListener("click", renderProfile);
  byId("beginQuestions").addEventListener("click", () => {
    const liveErrors = commitmentErrors();
    if (liveErrors.length) { renderCommitments(); return; }
    state.answers = [];
    state.questionIndex = 0;
    renderQuestion();
  });
}

function effectText(effects) {
  const parts = Object.entries(effects || {}).filter(([, n]) => Number(n)).map(([id, n]) => `${AXIS_BY_ID[id].name} ${signed(n)}`);
  return parts.length ? parts.join(" • ") : "No score movement";
}

function renderQuestion() {
  state.stage = "questions";
  const qs = questions();
  const q = qs[state.questionIndex];
  const selected = state.answers[state.questionIndex];
  const baseProgress = 20;
  const pct = baseProgress + ((state.questionIndex + 1) / qs.length) * 75;
  els.mode.textContent = state.mode === "deep" ? "Covenant Examination" : "Eight-Axis Snapshot";
  els.title.textContent = `${AXIS_BY_ID[q.axis].name} Question`;
  els.subtitle.textContent = state.mode === "deep" ? "Choose the behavior this character would most likely demonstrate under these stakes." : "Choose the position that best describes the character at creation.";
  setProgress(pct, `Question ${state.questionIndex + 1} of ${qs.length}`);

  els.stage.innerHTML = `
    <article class="question">
      <div class="kicker">Primary axis • ${esc(AXIS_BY_ID[q.axis].name)}</div>
      <h2>${esc(q.prompt)}</h2>
      <p class="muted question-note">${esc(q.context || q.note || AXIS_BY_ID[q.axis].question)}</p>
      <div class="choice-grid">
        ${q.options.map((o, i) => `<button class="choice${selected === i ? " selected" : ""}" type="button" data-choice="${i}">
          <strong>${i + 1}. ${esc(o.label)}</strong>
          <span class="effect-preview">${esc(effectText(o.effects))}</span>
        </button>`).join("")}
      </div>
    </article>
    <div class="stage-footer">
      <button class="btn ghost" type="button" id="questionBack">${state.questionIndex ? "Previous Question" : "Back to Commitments"}</button>
      <button class="btn" type="button" id="questionNext" ${Number.isInteger(selected) ? "" : "disabled"}>${state.questionIndex === qs.length - 1 ? "Resolve Alignment" : "Next Question"}</button>
    </div>`;

  document.querySelectorAll("[data-choice]").forEach(button => button.addEventListener("click", e => {
    state.answers[state.questionIndex] = Number(e.currentTarget.dataset.choice);
    renderQuestion();
  }));
  byId("questionBack").addEventListener("click", () => {
    if (state.questionIndex > 0) { state.questionIndex--; renderQuestion(); }
    else renderCommitments();
  });
  byId("questionNext").addEventListener("click", () => {
    if (!Number.isInteger(state.answers[state.questionIndex])) return;
    if (state.questionIndex < qs.length - 1) { state.questionIndex++; renderQuestion(); }
    else resolveAlignment();
  });
}

function addMovement(scores, breakdown, source, effects) {
  for (const id of AXIS_IDS) {
    const amount = Number(effects?.[id]) || 0;
    if (!amount) continue;
    scores[id] += amount;
    breakdown[id].push({ source, amount });
  }
}

function phaseDetail(score) {
  const n = clamp(score);
  if (n <= 249) return { phase: "Defining Low", step: "Absolute Low", side: "low" };
  if (n <= 499) return { phase: "Defining Low", step: "Deep Low", side: "low" };
  if (n <= 749) return { phase: "Defining Low", step: "Established Low", side: "low" };
  if (n <= 999) return { phase: "Contested Low", step: "Low-Leaning", side: "low" };
  if (n <= 1249) return { phase: "Contested Low", step: "Contested Low", side: "low" };
  if (n <= 1499) return { phase: "Contested Low", step: "Edge Low", side: "low" };
  if (n === 1500) return { phase: "Pivot", step: "Exact Pivot", side: "pivot" };
  if (n <= 1749) return { phase: "Contested High", step: "Edge High", side: "high" };
  if (n <= 1999) return { phase: "Contested High", step: "Contested High", side: "high" };
  if (n <= 2249) return { phase: "Contested High", step: "High-Leaning", side: "high" };
  if (n <= 2499) return { phase: "Defining High", step: "Established High", side: "high" };
  if (n <= 2749) return { phase: "Defining High", step: "Deep High", side: "high" };
  return { phase: "Defining High", step: "Absolute High", side: "high" };
}

function profileBandLabel(axis, score) {
  if (score < 1000) return axis.low;
  if (score < 2000) return axis.neutral;
  return axis.high;
}
function registryLabel(axis, score) {
  if (score < 1000) return axis.low;
  if (score < 2000) return "Neutral";
  return axis.high;
}

function resolveAlignment() {
  const scores = Object.fromEntries(AXIS_IDS.map(id => [id, MID]));
  const breakdown = Object.fromEntries(AXIS_IDS.map(id => [id, []]));

  for (const x of state.commitments.background) {
    if (x.axis && Number(x.direction)) addMovement(scores, breakdown, "Background", { [x.axis]: Number(x.direction) * 250 });
  }
  const pd = covenantDeity();
  for (const id of state.commitments.covenantAxes) {
    const amount = Math.sign(Number(pd?.pressures?.[id]) || 0) * 250;
    if (amount) addMovement(scores, breakdown, `${pd.name} covenant`, { [id]: amount });
  }
  for (const x of state.commitments.classFocus) {
    if (x.axis && Number(x.direction)) addMovement(scores, breakdown, `${klass().name} discipline`, { [x.axis]: Number(x.direction) * 250 });
  }
  questions().forEach((q, i) => {
    const answer = q.options[state.answers[i]];
    if (answer) addMovement(scores, breakdown, `${state.mode === "deep" ? "Scenario" : "Snapshot"} ${i + 1}`, answer.effects);
  });
  for (const id of AXIS_IDS) scores[id] = clamp(scores[id]);

  const profileAxes = AXES.filter(a => a.profileAxis);
  const profileKey = profileAxes.map(a => registryLabel(a, scores[a.id])).join(" — ");
  const profile = ALIGN.profiles.find(p => p.profile === profileKey) || {
    name: "Unregistered Profile", profile: profileKey,
    description: "The four profile-axis bands did not match a registry entry. Review the canonical profile data."
  };
  const axisResults = AXES.map(a => ({
    ...a, score: scores[a.id], profileBand: profileBandLabel(a, scores[a.id]), phase: phaseDetail(scores[a.id]),
    movement: breakdown[a.id]
  }));
  const expressionAxes = axisResults.filter(a => !a.profileAxis);
  const expressionLine = expressionAxes.map(a => `${a.name}: ${a.profileBand} (${a.phase.step})`).join(" • ");

  state.result = { scores, profile, profileKey, axisResults, expressionLine, breakdown };
  loadTrackers();
  renderResult();
}

function trackerKey() {
  return `universal_alignment_trackers_${slugify(`${state.profile.characterName}_${selectedRaceName()}_${klass()?.name}`)}`;
}
function loadTrackers() {
  state.trackers = { resonance: 3, claim: 0, resolve: 0, strain: 0 };
  try {
    const saved = JSON.parse(localStorage.getItem(trackerKey()) || "null");
    if (saved && typeof saved === "object") {
      state.trackers.resonance = Math.max(0, Math.min(6, Number(saved.resonance) || 0));
      state.trackers.claim = Math.max(0, Math.min(6, Number(saved.claim) || 0));
      state.trackers.resolve = Math.max(0, Math.min(3, Number(saved.resolve) || 0));
      state.trackers.strain = Math.max(0, Math.min(3, Number(saved.strain) || 0));
    }
  } catch (_) { /* local storage may be unavailable on some file:// configurations */ }
}
function saveTrackers() {
  try { localStorage.setItem(trackerKey(), JSON.stringify(state.trackers)); } catch (_) { /* optional persistence */ }
}

function trackerCard(id, title, max, stateName, description) {
  return `<article class="tracker-card"><div class="kicker">${esc(title)}</div><div class="state-name">${esc(stateName)}</div><p class="small muted">${esc(description)}</p><div class="tracker no-print"><button class="btn ghost small-btn" data-track="${id}" data-delta="-1" type="button">−</button><span class="counter">${state.trackers[id]}/${max}</span><button class="btn small-btn" data-track="${id}" data-delta="1" type="button">+</button></div></article>`;
}

function renderResult() {
  state.stage = "result";
  show(els.resultScreen);
  const r = state.result;
  const c = klass(), s = subclass(), pd = covenantDeity(), cd = creatorDeity();
  const resonanceRules = ALIGN.rules.covenant.resonance;
  const claimRules = ALIGN.rules.covenant.claim;
  const resonanceState = resonanceRules.states[String(state.trackers.resonance)];
  const claimState = claimRules.states[String(state.trackers.claim)];
  const resonanceEffect = resonanceRules.effects[String(state.trackers.resonance)];
  const claimEffect = claimRules.effects[String(state.trackers.claim)];
  const exportText = JSON.stringify(exportPayload(), null, 2);

  els.result.innerHTML = `
    <div class="center">
      <div class="kicker">${esc(ALIGN.title)} • ${esc(ALIGN.version)}</div>
      <h2 class="result-title">${esc(r.profile.name)}</h2>
      <p><strong>${esc(r.profile.profile)}</strong></p>
      <p class="result-desc">${esc(r.profile.description)}</p>
      <p class="expression">${esc(r.expressionLine)}</p>
    </div>

    <div class="grid two" style="margin-top:20px">
      <article class="card identity-card"><div class="kicker">Character identity</div><h3>${esc(state.profile.characterName || "Unnamed Character")}</h3>
        <p><strong>Ancestry:</strong> ${esc(selectedRaceName())}</p><p><strong>Creator family:</strong> ${esc(family()?.name)}</p><p><strong>Creator deity:</strong> ${esc(cd?.name || "—")}</p>
        <p class="small muted">Creator ancestry is recorded as canon lore; it does not automatically force alignment movement.</p></article>
      <article class="card deity-card"><div class="kicker">Class-bound covenant</div><h3>${esc(c?.name)} • ${esc(s?.name)}</h3>
        <p><strong>Deity:</strong> ${esc(pd?.name)} — ${esc(pd?.titles.join(" • "))}</p><p class="muted">${esc(c?.coreIdentity)}</p></article>
    </div>

    <h3 style="margin-top:24px">All Eight Axes</h3>
    <div class="axis-grid">
      ${r.axisResults.map(a => `<article class="axis-card ${a.profileAxis ? "profile-axis" : ""}">
        <div class="axis-top"><strong>${esc(a.name)}</strong><span class="score">${a.score}/3000</span></div>
        <div class="bar pivot-marker"><span style="width:${(a.score / 3000) * 100}%"></span></div>
        <div><strong>${esc(a.profileBand)}</strong> • ${esc(a.phase.step)}</div>
        <div class="small muted">${esc(a.phase.phase)}${a.phase.side === "pivot" ? "" : ` toward ${esc(a.phase.side === "low" ? a.low : a.high)}`}</div>
        <details class="details"><summary>Movement and axis definition</summary><p>${esc(a.question)}</p>
          ${a.movement.length ? list(a.movement.map(x => `${x.source}: ${signed(x.amount)}`)) : '<p class="muted">No movement from the 1500 pivot.</p>'}
          <p class="small muted"><strong>Do not confuse with:</strong> ${esc(a.notConfusedWith.join(", "))}</p></details>
      </article>`).join("")}
    </div>

    <section class="card covenant-panel" style="margin-top:22px">
      <div class="kicker">${esc(pd?.name)} covenant</div><h3>${esc(pd?.virtue)}</h3>
      <div class="grid two"><div><strong>Edicts</strong>${list(pd?.edicts)}</div><div><strong>Anathemas</strong>${list(pd?.anathemas)}</div></div>
      <div class="shadow-box"><strong>Divine shadow:</strong> ${esc(pd?.shadow)}</div>
      <div class="grid two" style="margin-top:14px"><div><strong>Accepted creation pressures</strong>${state.commitments.covenantAxes.length ? list(state.commitments.covenantAxes.map(id => {
        const dir = Math.sign(Number(pd?.pressures?.[id]) || 0), a = AXIS_BY_ID[id]; return `${a.name}: ${dir > 0 ? "+250 toward " + a.high : "−250 toward " + a.low}`;
      })) : '<p class="muted">None selected.</p>'}</div><div><strong>Domains</strong><p>${esc(pd?.domains.join(" • "))}</p><strong>Manifestation</strong><p class="muted">${esc(pd?.manifestation)}</p></div></div>
    </section>

    <section style="margin-top:22px">
      <h3>Covenant and Conviction Trackers</h3>
      <div class="tracker-grid">
        ${trackerCard("resonance", "Resonance", 6, resonanceState, resonanceEffect)}
        ${trackerCard("claim", "Divine Claim", 6, claimState, claimEffect)}
        ${trackerCard("resolve", "Resolve", 3, `${state.trackers.resolve} available`, ALIGN.rules.convictions.resolve)}
        ${trackerCard("strain", "Conviction Strain", 3, state.trackers.strain >= 3 ? "Threshold reached" : `${state.trackers.strain} accumulated`, ALIGN.rules.convictions.strain)}
      </div>
      <div class="stage-footer no-print"><button class="btn ghost" id="resetTrackers" type="button">Reset Trackers to 3 / 0 / 0 / 0</button></div>
    </section>

    <div class="grid two" style="margin-top:22px">
      <article class="card"><div class="kicker">Class alignment profile</div><h3>${esc(c?.name)}</h3><strong>Practices</strong>${list(c?.practices)}<strong>Hazards</strong>${list(c?.hazards)}<p><strong>Focus axes:</strong> ${esc((c?.axisFocus || []).map(id => AXIS_BY_ID[id]?.name || id).join(" • "))}</p></article>
      <article class="card"><div class="kicker">Bounty and boon</div><h3>${esc(pd?.name)}’s class relationship</h3><p><strong>Bounty trigger:</strong> ${esc(c?.bountyTrigger)}</p><p><strong>Deity boon:</strong> ${esc(c?.deityBoon)}</p><p class="small muted">${esc(ALIGN.rules.class_influence.bounty)}</p></article>
    </div>

    <div class="grid two" style="margin-top:22px">
      <article class="card"><div class="kicker">Starting Convictions</div>${state.commitments.convictions.map(x => `<p><strong>${esc(x.grade)}:</strong> ${esc(x.text)}</p>`).join("")}<p><strong>${esc(state.commitments.tie.grade)} Tie:</strong> ${esc(state.commitments.tie.text || "No Tie entered")}</p></article>
      <article class="card"><div class="kicker">Adjudication guardrails</div><p><strong>Movement:</strong> ${esc(ALIGN.rules.movement.rule)}</p><p><strong>Reputation:</strong> ${esc(ALIGN.rules.reputation.rule)}</p><details class="details"><summary>Anti-farming rules</summary>${list(ALIGN.rules.anti_farming)}</details></article>
    </div>

    <section class="card" style="margin-top:22px"><div class="kicker">Portable result</div><h3>Export JSON</h3><textarea class="textarea export" id="exportText" readonly>${esc(exportText)}</textarea>
      <div class="stage-footer no-print"><div><button class="btn ghost" id="retake" type="button">Retake Quiz</button> <button class="btn ghost" id="printResult" type="button">Print</button></div><div><button class="btn violet" id="copyExport" type="button">Copy JSON</button> <button class="btn" id="downloadExport" type="button">Download JSON</button></div></div></section>`;

  document.querySelectorAll("[data-track]").forEach(button => button.addEventListener("click", e => {
    const id = e.currentTarget.dataset.track;
    const delta = Number(e.currentTarget.dataset.delta);
    const max = id === "resonance" || id === "claim" ? 6 : 3;
    state.trackers[id] = Math.max(0, Math.min(max, state.trackers[id] + delta));
    saveTrackers();
    renderResult();
  }));
  byId("resetTrackers").addEventListener("click", () => {
    state.trackers = { resonance: 3, claim: 0, resolve: 0, strain: 0 };
    saveTrackers();
    renderResult();
  });
  byId("retake").addEventListener("click", reset);
  byId("printResult").addEventListener("click", () => window.print());
  byId("copyExport").addEventListener("click", async e => {
    const text = JSON.stringify(exportPayload(), null, 2);
    try { await navigator.clipboard.writeText(text); e.currentTarget.textContent = "Copied"; }
    catch (_) { byId("exportText").select(); document.execCommand("copy"); }
  });
  byId("downloadExport").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(exportPayload(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob), a = document.createElement("a");
    a.href = url;
    a.download = `${slugify(state.profile.characterName || "universal_character")}_eight_axis_alignment.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  });
}

function exportPayload() {
  const r = state.result;
  return {
    schema: "worldbuilder.universal.character-alignment-result.v2",
    alignmentSystem: { title: ALIGN.title, version: ALIGN.version },
    quizMode: state.mode,
    character: {
      name: state.profile.characterName || null,
      creatorFamily: family()?.name || null,
      creatorDeity: creatorDeity()?.name || null,
      parentRace: race()?.name || null,
      nestedAncestry: option() ? { name: option().name, fullName: option().fullName, type: option().type } : null,
      class: klass()?.name || null,
      subclass: subclass()?.name || null,
      covenantDeity: covenantDeity()?.name || null
    },
    creationCommitments: JSON.parse(JSON.stringify(state.commitments)),
    result: r ? {
      profileName: r.profile.name,
      profileCombination: r.profile.profile,
      profileDescription: r.profile.description,
      expressionLine: r.expressionLine,
      axes: Object.fromEntries(r.axisResults.map(a => [a.id, {
        name: a.name, score: a.score, profileBand: a.profileBand, phase: a.phase.phase,
        step: a.phase.step, movement: a.movement
      }]))
    } : null,
    covenant: {
      virtue: covenantDeity()?.virtue || null,
      edicts: covenantDeity()?.edicts || [],
      anathemas: covenantDeity()?.anathemas || [],
      shadow: covenantDeity()?.shadow || null,
      classPractices: klass()?.practices || [],
      classHazards: klass()?.hazards || [],
      bountyTrigger: klass()?.bountyTrigger || null,
      deityBoon: klass()?.deityBoon || null,
      trackers: { ...state.trackers }
    }
  };
}

function goBack() {
  if (els.resultScreen.classList.contains("active")) {
    show(els.quiz);
    state.stage = "questions";
    state.questionIndex = questions().length - 1;
    renderQuestion();
    return;
  }
  if (!els.quiz.classList.contains("active")) return;
  if (state.stage === "questions") {
    if (state.questionIndex > 0) { state.questionIndex--; renderQuestion(); }
    else renderCommitments();
  } else if (state.stage === "commitments") renderProfile();
  else reset();
}

const counts = DATA.metadata.counts;
els.homeStats.innerHTML = [
  `${counts.axes} axes`, `${counts.profiles} profiles`, `${counts.families} creator families`,
  `${counts.parentRaces} parent races`, `${counts.subtypes} nested options`, `${counts.classes} classes`,
  `${counts.subclasses} subclasses`, `${counts.deities} deities`
].map((x, i) => `<span class="chip ${i % 3 === 1 ? "bronze" : i % 3 === 2 ? "violet" : ""}">${esc(x)}</span>`).join("");

document.querySelectorAll("[data-start]").forEach(button => button.addEventListener("click", () => start(button.dataset.start)));
els.homeBtn.addEventListener("click", reset);
els.backBtn.addEventListener("click", goBack);
els.printBtn.addEventListener("click", () => window.print());
els.backBtn.disabled = true;
els.printBtn.disabled = true;
})();
