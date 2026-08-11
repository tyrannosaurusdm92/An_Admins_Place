/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-c. */
"use strict";

const DATA_URL = "data/races.json";
const GENETICS_URL = "data/genetics.json";
const TURN_DURATION = 820;
const GENETIC_SUBTYPE_TYPES = new Set(["bloodline", "lineage", "ancestry"]);

const fallbackData = {
  bookTitle: "Universal Races Compendium",
  subtitle: "Races, bloodlines, lineages, forms, and two-parent heritage",
  categories: [],
  races: []
};
const fallbackGenetics = {metadata:{}, race_pairs:[], subtype_rules:{}};

const state = {
  data: fallbackData,
  genetics: fallbackGenetics,
  raceById: new Map(),
  pairByKey: new Map(),
  categoryByName: new Map(),
  spreads: [],
  categorySpreadIndex: new Map(),
  raceSpreadIndex: new Map(),
  heritageSpreadIndex: -1,
  currentSpread: -1,
  selectedSubtype: {},
  searchTerm: "",
  zoom: clamp(Number(readSetting("universal-races-book-zoom", "1")) || 1, .7, 1.8),
  isTurning: false,
  dataReady: false,
  dataPromise: null,
  heritage: {
    parentARaceId: "",
    parentASubtypeId: "",
    parentBRaceId: "",
    parentBSubtypeId: "",
    includeAssisted: false,
    selectedTraits: new Set(),
    signature: ""
  }
};

const appShell = document.getElementById("appShell");
const closedCover = document.getElementById("closedCover");
const openBookBtn = document.getElementById("openBookBtn");
const book = document.getElementById("book");
const turnSheet = document.getElementById("turnSheet");
const leftPage = document.getElementById("leftPage");
const rightPage = document.getElementById("rightPage");
const pageStatus = document.getElementById("pageStatus");
const zoomLabel = document.getElementById("zoomLabel");
const miniIndex = document.getElementById("miniIndex");
const searchInput = document.getElementById("searchInput");
const titleTop = document.getElementById("bookTitleTop");
const subtitleTop = document.getElementById("bookSubtitleTop");
const controls = {
  cover: document.getElementById("coverBtn"),
  index: document.getElementById("indexBtn"),
  heritage: document.getElementById("heritageBtn"),
  prev: document.getElementById("prevBtn"),
  next: document.getElementById("nextBtn"),
  zoomOut: document.getElementById("zoomOutBtn"),
  zoomIn: document.getElementById("zoomInBtn"),
  zoomFit: document.getElementById("zoomFitBtn"),
  prevBottom: document.getElementById("prevBottomBtn"),
  nextBottom: document.getElementById("nextBottomBtn")
};

init();

function init(){
  bindControls();
  applyZoom();
  renderClosedCover();
}

function readSetting(key, fallback=""){ try{return localStorage.getItem(key) || fallback;}catch{return fallback;} }
function writeSetting(key, value){ try{localStorage.setItem(key, value);}catch{} }

function bindControls(){
  openBookBtn.addEventListener("click", () => openTo(0));
  controls.cover.addEventListener("click", renderClosedCover);
  controls.index.addEventListener("click", () => openTo(0));
  controls.heritage.addEventListener("click", async () => {
    await ensureDataReady();
    openTo(state.heritageSpreadIndex);
  });
  controls.prev.addEventListener("click", previousSpread);
  controls.next.addEventListener("click", nextSpread);
  controls.prevBottom.addEventListener("click", previousSpread);
  controls.nextBottom.addEventListener("click", nextSpread);
  controls.zoomOut.addEventListener("click", () => setZoom(state.zoom - .1));
  controls.zoomIn.addEventListener("click", () => setZoom(state.zoom + .1));
  controls.zoomFit.addEventListener("click", () => setZoom(1));
  searchInput.addEventListener("input", event => {
    state.searchTerm = event.target.value.trim().toLowerCase();
    renderMiniIndex();
  });
  document.addEventListener("keydown", event => {
    if(event.target && event.target.closest && event.target.closest("input,select,textarea,button")) return;
    if(event.key === "ArrowRight" || event.key === "PageDown") nextSpread();
    if(event.key === "ArrowLeft" || event.key === "PageUp") previousSpread();
    if(event.key === "Home") openTo(0);
  });
}

async function ensureDataReady(){
  if(state.dataReady) return;
  if(state.dataPromise) return state.dataPromise;
  state.dataPromise = (async () => {
    if(!window.UNIVERSAL_RACE_DATA || !window.UNIVERSAL_GENETICS_DATA) await loadEmbeddedDataScript().catch(() => null);
    if(window.UNIVERSAL_RACE_DATA && window.UNIVERSAL_GENETICS_DATA){
      state.data = window.UNIVERSAL_RACE_DATA;
      state.genetics = window.UNIVERSAL_GENETICS_DATA;
    }else{
      const [raceResponse, geneticsResponse] = await Promise.all([
        fetch(DATA_URL,{cache:"no-store"}),
        fetch(GENETICS_URL,{cache:"no-store"})
      ]);
      if(!raceResponse.ok || !geneticsResponse.ok) throw new Error("Race data could not be loaded.");
      state.data = await raceResponse.json();
      state.genetics = await geneticsResponse.json();
    }
    hydrateData();
  })().catch(error => {
    console.error(error);
    state.data = fallbackData;
    state.genetics = fallbackGenetics;
    hydrateData();
  });
  return state.dataPromise;
}

function loadEmbeddedDataScript(){
  return new Promise((resolve,reject) => {
    const existing = document.querySelector("script[data-universal-embedded]");
    if(existing){
      existing.addEventListener("load",resolve,{once:true});
      existing.addEventListener("error",reject,{once:true});
      return;
    }
    const script = document.createElement("script");
    script.src = "embedded-data.js";
    script.defer = true;
    script.dataset.universalEmbedded = "true";
    script.onload = resolve;
    script.onerror = () => reject(new Error("embedded-data.js failed to load"));
    document.body.appendChild(script);
  });
}

function hydrateData(){
  const categories = [...(state.data.categories || [])].sort((a,b) =>
    Number(a.pantheon_order || 999) - Number(b.pantheon_order || 999)
  );
  state.data.categories = categories;
  state.raceById = new Map((state.data.races || []).map(r => [r.id,r]));
  state.pairByKey = new Map((state.genetics.race_pairs || []).map(pair => [pair.key,pair]));
  state.categoryByName = new Map(categories.map(c => [categoryName(c),c]));
  state.spreads = [{type:"toc",title:"Table of Contents"}];
  state.categorySpreadIndex = new Map();
  state.raceSpreadIndex = new Map();

  for(const category of categories){
    const name = categoryName(category);
    state.categorySpreadIndex.set(name,state.spreads.length);
    state.spreads.push({type:"category",category,title:name});
    for(const race of racesForCategory(name)){
      state.raceSpreadIndex.set(race.id,state.spreads.length);
      state.spreads.push({type:"race",race,title:race.name});
    }
  }

  state.heritageSpreadIndex = state.spreads.length;
  state.spreads.push({type:"heritage",title:"Heritage Generator"});
  titleTop.textContent = state.data.bookTitle || fallbackData.bookTitle;
  subtitleTop.textContent = state.data.subtitle || fallbackData.subtitle;

  const first = state.data.races?.[0];
  if(first && !state.heritage.parentARaceId){
    state.heritage.parentARaceId = first.id;
    state.heritage.parentASubtypeId = first.subtypes?.[0]?.id || "";
  }
  normalizeHeritageParents(true);
  state.dataReady = true;
  renderMiniIndex();
  appShell.classList.remove("is-loading");
}

function renderClosedCover(){
  state.currentSpread = -1;
  appShell.classList.remove("is-open");
  closedCover.hidden = false;
  book.hidden = true;
  pageStatus.textContent = "Cover";
  updateButtonStates();
}

async function openTo(index){
  await ensureDataReady();
  appShell.classList.add("is-open");
  closedCover.hidden = true;
  book.hidden = false;
  state.currentSpread = clamp(index,0,Math.max(0,state.spreads.length-1));
  renderCurrentSpread();
}

function renderCurrentSpread(){
  const spread = state.spreads[state.currentSpread];
  if(!spread) return;
  if(spread.type === "toc") renderTableOfContents();
  if(spread.type === "category") renderCategorySpread(spread.category);
  if(spread.type === "race") renderRaceSpread(spread.race);
  if(spread.type === "heritage") renderHeritageSpread();
  pageStatus.textContent = `${state.currentSpread + 1} / ${state.spreads.length} — ${spread.title}`;
  updateButtonStates();
  updateMiniCurrent();
}

function renderTableOfContents(){
  const entries = (state.data.categories || []).map((category,index) => ({
    number:index+1,
    title:categoryName(category),
    subtitle:`Created by ${category.creator_deity} • ${racesForCategory(categoryName(category)).length} parent races`,
    category:categoryName(category)
  }));
  entries.push({number:23,title:"Heritage Generator",subtitle:"Two direct parents and inherited racial traits",heritage:true});
  const midpoint = 12;
  leftPage.innerHTML = pageWrap(`
    <p class="kicker">Universal Races Compendium</p>
    <h2>Table of Contents</h2>
    <div class="flourish"></div>
    <p>The first twenty-two sections contain every race, bloodline, lineage, ancestry, and form, arranged in pantheon order by creator category. The final section contains the two-parent Heritage Generator.</p>
    <div class="count-ribbon"><span>${state.data.races.length} parent races</span><span>${countSubtypes()} subtypes</span><span>23 sections</span></div>
    <div class="toc-list">${entries.slice(0,midpoint).map(tocEntryMarkup).join("")}</div>
  `);
  rightPage.innerHTML = pageWrap(`
    <p class="kicker">Sections 13–23</p>
    <h2>Contents Continued</h2>
    <div class="flourish"></div>
    <div class="toc-list">${entries.slice(midpoint).map(tocEntryMarkup).join("")}</div>
  `);
  bindTocButtons();
}

function tocEntryMarkup(entry){
  const attr = entry.heritage ? "data-open-heritage" : `data-category-open="${escapeAttr(entry.category)}"`;
  return `<button class="toc-entry" type="button" ${attr}>
    <span class="toc-number">${String(entry.number).padStart(2,"0")}</span>
    <span><strong>${escapeHtml(entry.title)}</strong><small>${escapeHtml(entry.subtitle)}</small></span>
  </button>`;
}

function bindTocButtons(){
  document.querySelectorAll("[data-category-open]").forEach(button =>
    button.addEventListener("click",() => openCategory(button.dataset.categoryOpen))
  );
  document.querySelectorAll("[data-open-heritage]").forEach(button =>
    button.addEventListener("click",() => openTo(state.heritageSpreadIndex))
  );
}

function renderCategorySpread(category){
  const name = categoryName(category);
  const races = racesForCategory(name);
  const sectionNumber = Number(category.pantheon_order || 0);
  const midpoint = Math.ceil(races.length/2);
  leftPage.innerHTML = pageWrap(`
    <p class="kicker">Section ${String(sectionNumber).padStart(2,"0")} • Created by ${escapeHtml(category.creator_deity || "")}</p>
    <h2>${escapeHtml(name)}</h2>
    <div class="flourish"></div>
    <p>${escapeHtml(category.creator_deity || "The creator deity")} created the peoples gathered in this category.</p>
    <div class="count-ribbon"><span>${races.length} parent races</span><span>${races.reduce((sum,r)=>sum+(r.subtypes?.length||0),0)} bloodlines, lineages, ancestries, and forms</span></div>
    <div class="category-race-list">${races.slice(0,midpoint).map(categoryRaceCard).join("")}</div>
  `);
  rightPage.innerHTML = pageWrap(`
    <p class="kicker">${escapeHtml(name)}</p>
    <h2>Races and Bloodlines</h2>
    <div class="flourish"></div>
    <div class="category-race-list">${races.slice(midpoint).map(categoryRaceCard).join("") || `<p>${escapeHtml(name)} contains ${races.length} parent race.</p>`}</div>
  `);
  document.querySelectorAll("[data-race-open]").forEach(button =>
    button.addEventListener("click",() => openRace(button.dataset.raceOpen))
  );
}

function categoryRaceCard(race){
  const subtypeNames = (race.subtypes || []).map(s=>s.name);
  return `<article class="category-race-card">
    <button type="button" data-race-open="${escapeAttr(race.id)}">${escapeHtml(race.name)}</button>
    <p>${escapeHtml(raceLoreText(race))}</p>
    ${subtypeNames.length ? `<small>${escapeHtml(subtypeNames.join(" • "))}</small>` : ""}
  </article>`;
}

function renderRaceSpread(race){
  const subtype = selectedSubtypeFor(race);
  const displayName = [race.name,subtype?.name].filter(Boolean).join(" — ");
  const lore = subtype ? subtypeLoreText(race,subtype) : raceLoreText(race);
  const subtypeCount = race.subtypes?.length || 0;
  leftPage.innerHTML = pageWrap(`
    <p class="kicker">${escapeHtml(race.creator_category)} • Created by ${escapeHtml(race.creator_deity || "")}</p>
    <h2>${escapeHtml(race.name)}</h2>
    <div class="flourish"></div>
    <div class="meta-pills">
      ${race.creature_type ? `<span>${escapeHtml(race.creature_type)}</span>` : ""}
      <span>${subtype ? escapeHtml(labelize(subtype.subtype_type)) : "Parent Race"}</span>
      ${subtypeCount ? `<span>${subtypeCount} ${escapeHtml(race.subtype_label || "subtypes")}</span>` : ""}
    </div>
    ${subtypePickerMarkup(race,subtype)}
    <section class="canon-lore"><h3>${escapeHtml(displayName)}</h3><p>${escapeHtml(lore)}</p></section>
    ${listSection("History and Culture",race.player_lore)}
    ${listSection("Roleplaying",race.roleplaying_notes)}
    ${listSection("Favored Classes",race.recommended_classes)}
  `);
  rightPage.innerHTML = pageWrap(raceStatBlockMarkup(race,subtype));
  const picker = document.getElementById(`subtype-${race.id}`);
  if(picker) picker.addEventListener("change", event => {
    state.selectedSubtype[race.id] = event.target.value;
    renderCurrentSpread();
  });
}

function subtypePickerMarkup(race,subtype){
  if(!race.subtypes?.length) return "";
  return `<div class="picker-panel">
    <label for="subtype-${escapeAttr(race.id)}">${escapeHtml(race.subtype_label || "Bloodline or lineage")}</label>
    <select id="subtype-${escapeAttr(race.id)}">
      ${race.subtypes.map(s => `<option value="${escapeAttr(s.id)}" ${s.id===subtype?.id?"selected":""}>${escapeHtml(s.name)} (${escapeHtml(labelize(s.subtype_type || "subtype"))})</option>`).join("")}
    </select>
  </div>`;
}

function selectedSubtypeFor(race){
  if(!race.subtypes?.length) return null;
  const id = state.selectedSubtype[race.id] || race.subtypes[0].id;
  state.selectedSubtype[race.id] = id;
  return race.subtypes.find(s => s.id === id) || race.subtypes[0];
}

function raceStatBlockMarkup(race,subtype){
  const traits = combinedTraits(race,subtype);
  const name = [race.name,subtype?.name].filter(Boolean).join(" — ");
  const description = subtype ? subtypeLoreText(race,subtype) : raceLoreText(race);
  const fields = [
    ["Creature Type",race.creature_type],
    ["Creator",race.creator_deity],
    ["Creator Category",race.creator_category],
    ["Ancestry",subtype ? labelize(subtype.subtype_type) : "Parent Race"],
    ["Racial Traits",traits.length ? String(traits.length) : null]
  ].filter(([,value])=>value);
  return `<article class="stat-card canonical-stat-card">
    <header><h3>${escapeHtml(name)}</h3><p>${escapeHtml(description)}</p></header>
    <dl class="stat-grid">${fields.map(([label,value])=>`<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}</dl>
    ${traits.length ? `<section class="trait-list"><h4>Racial Traits</h4>${traits.map(traitMarkup).join("")}</section>` : ""}
    ${subtype?.recommended_classes?.length ? `<section class="stat-section"><h4>Favored Classes</h4><ul>${subtype.recommended_classes.map(x=>`<li>${escapeHtml(x)}</li>`).join("")}</ul></section>` : ""}
  </article>`;
}

function combinedTraits(race,subtype){
  return [...(race.base_traits || []),...(subtype?.traits || [])]
    .filter(trait => trait && (trait.name || trait.description))
    .filter(trait => String(trait.name || "").trim().toLowerCase() !== "overview");
}

function traitMarkup(trait){
  return `<article><h4>${escapeHtml(trait.name || "Trait")}</h4><p>${escapeHtml(cleanDisplayText(trait.description || ""))}</p></article>`;
}

function listSection(title,items=[]){
  const clean = (items||[]).map(x=>cleanDisplayText(typeof x === "string" ? x : JSON.stringify(x))).filter(Boolean);
  if(!clean.length) return "";
  return `<section class="stat-section"><h3>${escapeHtml(title)}</h3><ul>${clean.map(x=>`<li>${escapeHtml(x)}</li>`).join("")}</ul></section>`;
}

function renderHeritageSpread(){
  normalizeHeritageParents(false);
  const a = parentARace(), sa = parentASubtype(), b = parentBRace(), sb = parentBSubtype();
  const compatibility = heritageCompatibility(a,b,sa,sb);
  const candidates = possibleParentBRaces(a,sa);
  const categoriesA = (state.data.categories || []).map(categoryName);
  const categoryA = a?.creator_category || categoriesA[0] || "";
  const categoryBOptions = unique(candidates.map(r=>r.creator_category));
  const categoryB = b?.creator_category || categoryBOptions[0] || "";
  const traits = heritageTraitOptions(a,sa,b,sb);
  syncHeritageTraitSelection(traits);
  leftPage.innerHTML = pageWrap(`
    <p class="kicker">Section 23 • Two Direct Genetic Parents</p>
    <h2>Heritage Generator</h2>
    <div class="flourish"></div>
    <p>Select the two parents. Parent B contains every biological pairing available to Parent A under the race-family, bloodline, humanoid, aquatic, and transitive compatibility rules.</p>
    <div class="heritage-parent-grid">
      ${parentSelectorMarkup("A",a,sa,categoriesA,(state.data.races||[]).filter(r=>r.creator_category===categoryA),null)}
      ${parentSelectorMarkup("B",b,sb,categoryBOptions,candidates.filter(r=>r.creator_category===categoryB),a)}
    </div>
    <label class="assisted-toggle"><input id="heritageAssisted" type="checkbox" ${state.heritage.includeAssisted?"checked":""}> Include assisted or ichor-engineered conception</label>
    ${compatibilityMarkup(compatibility)}
    <section class="inheritance-picker"><h3>Inherited Traits</h3><p class="small-note">Select the racial traits expressed by the child. Each trait remains associated with the parent from whom it was inherited.</p><div class="trait-check-grid">${traits.length ? traits.map(heritageTraitCheckbox).join("") : ""}</div></section>
  `);
  rightPage.innerHTML = pageWrap(heritageStatBlockMarkup(a,sa,b,sb,compatibility,traits));
  bindHeritageControls();
}

function parentSelectorMarkup(role,race,subtype,categories,races,otherRace){
  const sameRace = otherRace && race?.id === otherRace.id;
  let subtypes = race?.subtypes || [];
  if(sameRace) subtypes = subtypes.filter(s => GENETIC_SUBTYPE_TYPES.has(s.subtype_type) && s.id !== state.heritage.parentASubtypeId);
  return `<fieldset class="heritage-parent-card"><legend>Parent ${role}</legend>
    <label>Creator Category<select id="heritage${role}Category">${categories.map(c=>`<option value="${escapeAttr(c)}" ${c===race?.creator_category?"selected":""}>${escapeHtml(c)}</option>`).join("")}</select></label>
    <label>Parent Race<select id="heritage${role}Race">${races.map(r=>`<option value="${escapeAttr(r.id)}" ${r.id===race?.id?"selected":""}>${escapeHtml(r.name)}</option>`).join("")}</select></label>
    ${subtypes.length ? `<label>${escapeHtml(race.subtype_label || "Bloodline or lineage")}<select id="heritage${role}Subtype">${subtypes.map(s=>`<option value="${escapeAttr(s.id)}" ${s.id===subtype?.id?"selected":""}>${escapeHtml(s.name)} (${escapeHtml(labelize(s.subtype_type))})</option>`).join("")}</select></label>` : ""}
  </fieldset>`;
}

function bindHeritageControls(){
  document.getElementById("heritageAssisted")?.addEventListener("change", event => {
    state.heritage.includeAssisted = event.target.checked;
    normalizeHeritageParents(true);
    renderHeritageSpread();
  });
  for(const role of ["A","B"]){
    document.getElementById(`heritage${role}Category`)?.addEventListener("change", event => {
      const races = role === "A"
        ? (state.data.races||[]).filter(r=>r.creator_category===event.target.value)
        : possibleParentBRaces(parentARace(),parentASubtype()).filter(r=>r.creator_category===event.target.value);
      const race = races[0];
      state.heritage[`parent${role}RaceId`] = race?.id || "";
      state.heritage[`parent${role}SubtypeId`] = race?.subtypes?.[0]?.id || "";
      normalizeHeritageParents(true);
      renderHeritageSpread();
    });
    document.getElementById(`heritage${role}Race`)?.addEventListener("change", event => {
      state.heritage[`parent${role}RaceId`] = event.target.value;
      const race = state.raceById.get(event.target.value);
      state.heritage[`parent${role}SubtypeId`] = race?.subtypes?.[0]?.id || "";
      normalizeHeritageParents(true);
      renderHeritageSpread();
    });
    document.getElementById(`heritage${role}Subtype`)?.addEventListener("change", event => {
      state.heritage[`parent${role}SubtypeId`] = event.target.value;
      normalizeHeritageParents(role === "A");
      renderHeritageSpread();
    });
  }
  document.querySelectorAll("[data-heritage-trait]").forEach(input => input.addEventListener("change", event => {
    if(event.target.checked) state.heritage.selectedTraits.add(event.target.dataset.heritageTrait);
    else state.heritage.selectedTraits.delete(event.target.dataset.heritageTrait);
    renderHeritageSpread();
  }));
}

function parentARace(){ return state.raceById.get(state.heritage.parentARaceId) || state.data.races?.[0] || null; }
function parentBRace(){ return state.raceById.get(state.heritage.parentBRaceId) || null; }
function parentASubtype(){ return parentARace()?.subtypes?.find(s=>s.id===state.heritage.parentASubtypeId) || null; }
function parentBSubtype(){ return parentBRace()?.subtypes?.find(s=>s.id===state.heritage.parentBSubtypeId) || null; }
function pairKey(a,b){ return [a.id,b.id].sort().join("__"); }
function isGeneticSubtype(subtype){ return GENETIC_SUBTYPE_TYPES.has(subtype?.subtype_type); }

function heritageCompatibility(a,b,sa,sb){
  if(!a || !b) return {allowed:false,mode:"incompatible",rule_basis:"missing_parent",reasons:["Choose both parents."]};
  if(a.id === b.id){
    const allowed = Boolean(sa && sb && sa.id !== sb.id && isGeneticSubtype(sa) && isGeneticSubtype(sb));
    return allowed
      ? {allowed:true,mode:"biological",rule_basis:"same_parent_subtypes",reasons:["The parents carry two different bloodlines, lineages, or ancestries of the same race."],closure_path:[{race_name:a.name},{race_name:b.name}],closure_hops:1}
      : {allowed:false,mode:"incompatible",rule_basis:"same_parent_invalid",reasons:["A same-race heritage requires two different bloodlines, lineages, or ancestries."]};
  }
  const pair = state.pairByKey.get(pairKey(a,b)) || {mode:"incompatible",rule_basis:"missing",reasons:["These races cannot produce progeny together."]};
  return {...pair,allowed:pair.mode === "biological" || (pair.mode === "assisted" && state.heritage.includeAssisted)};
}

function possibleParentBRaces(a=parentARace(),sa=parentASubtype()){
  if(!a) return [];
  return (state.data.races||[]).filter(race => {
    if(race.id === a.id) return (race.subtypes||[]).some(s=>isGeneticSubtype(s) && s.id !== sa?.id);
    const pair = state.pairByKey.get(pairKey(a,race));
    return pair?.mode === "biological" || (state.heritage.includeAssisted && pair?.mode === "assisted");
  });
}

function normalizeHeritageParents(resetTraits=false){
  const all = state.data.races || [];
  const a = state.raceById.get(state.heritage.parentARaceId) || all[0] || null;
  if(!a) return;
  state.heritage.parentARaceId = a.id;
  if(a.subtypes?.length && !a.subtypes.some(s=>s.id===state.heritage.parentASubtypeId)) state.heritage.parentASubtypeId = a.subtypes[0].id;
  if(!a.subtypes?.length) state.heritage.parentASubtypeId = "";
  const candidates = possibleParentBRaces(a,parentASubtype());
  const b = candidates.find(r=>r.id===state.heritage.parentBRaceId) || candidates[0] || null;
  state.heritage.parentBRaceId = b?.id || "";
  if(b){
    let subs = b.subtypes || [];
    if(b.id === a.id) subs = subs.filter(s=>isGeneticSubtype(s) && s.id !== state.heritage.parentASubtypeId);
    if(subs.length && !subs.some(s=>s.id===state.heritage.parentBSubtypeId)) state.heritage.parentBSubtypeId = subs[0].id;
    if(!subs.length) state.heritage.parentBSubtypeId = "";
  }else state.heritage.parentBSubtypeId = "";
  const signature = [state.heritage.parentARaceId,state.heritage.parentASubtypeId,state.heritage.parentBRaceId,state.heritage.parentBSubtypeId,state.heritage.includeAssisted].join("|");
  if(resetTraits || signature !== state.heritage.signature){
    state.heritage.signature = signature;
    state.heritage.selectedTraits = new Set();
  }
}

function heritageTraitOptions(a,sa,b,sb){
  const parents = [{role:"A",race:a,subtype:sa},{role:"B",race:b,subtype:sb}];
  const out=[];
  for(const parent of parents){
    if(!parent.race) continue;
    combinedTraits(parent.race,parent.subtype).forEach((trait,index)=>out.push({
      id:`${parent.role}:${parent.race.id}:${parent.subtype?.id||"base"}:${index}`,
      role:parent.role,
      race:parent.race,
      subtype:parent.subtype,
      name:trait.name||"Trait",
      description:cleanDisplayText(trait.description||"")
    }));
  }
  return out;
}

function syncHeritageTraitSelection(traits){
  const valid = new Set(traits.map(t=>t.id));
  for(const id of [...state.heritage.selectedTraits]) if(!valid.has(id)) state.heritage.selectedTraits.delete(id);
  if(!state.heritage.selectedTraits.size){
    for(const role of ["A","B"]) traits.filter(t=>t.role===role).slice(0,3).forEach(t=>state.heritage.selectedTraits.add(t.id));
  }
}

function heritageTraitCheckbox(trait){
  return `<label class="trait-check"><input type="checkbox" data-heritage-trait="${escapeAttr(trait.id)}" ${state.heritage.selectedTraits.has(trait.id)?"checked":""}><span><strong>${escapeHtml(trait.name)}</strong><small>Parent ${trait.role}: ${escapeHtml(trait.race.name)}${trait.subtype?` — ${escapeHtml(trait.subtype.name)}`:""}</small></span></label>`;
}

function compatibilityMarkup(result){
  const cls = result.allowed ? (result.mode === "assisted" ? "assisted" : "allowed") : "blocked";
  const title = result.allowed ? (result.mode === "assisted" ? "Assisted conception available" : "Biological progeny available") : "Pairing unavailable";
  const path = result.closure_path?.length ? `<p><strong>Genetic connection:</strong> ${result.closure_path.map(x=>escapeHtml(x.race_name||x.race_id)).join(" → ")}</p>` : "";
  return `<section class="compatibility-card ${cls}"><h3>${title}</h3>${(result.reasons||[]).map(reason=>`<p>${escapeHtml(cleanDisplayText(reason))}</p>`).join("")}${path}</section>`;
}

function heritageStatBlockMarkup(a,sa,b,sb,compatibility,traits){
  const selected = traits.filter(t=>state.heritage.selectedTraits.has(t.id));
  const aLabel = [a?.name,sa?.name].filter(Boolean).join(" — ");
  const bLabel = [b?.name,sb?.name].filter(Boolean).join(" — ");
  const types = unique([a?.creature_type,b?.creature_type].filter(Boolean));
  const creatureType = types.length===1 ? types[0] : (types.every(type=>/humanoid/i.test(type)) ? "Humanoid" : types.join(" / "));
  const mode = compatibility.allowed ? (compatibility.mode === "assisted" ? "Assisted / ichor-engineered" : "Biological") : "Unavailable";
  return `<article class="stat-card heritage-stat-card">
    <header><h3>${escapeHtml(aLabel)} × ${escapeHtml(bLabel)}</h3><p>Two-parent heritage stat block</p></header>
    <dl class="stat-grid">
      <div><dt>Heritage Mode</dt><dd>${escapeHtml(mode)}</dd></div>
      ${creatureType ? `<div><dt>Creature Type</dt><dd>${escapeHtml(creatureType)}</dd></div>` : ""}
      <div><dt>Parent A</dt><dd>${escapeHtml(aLabel)}</dd></div>
      <div><dt>Parent B</dt><dd>${escapeHtml(bLabel)}</dd></div>
      <div><dt>Creator Lines</dt><dd>${escapeHtml(unique([a?.creator_deity,b?.creator_deity].filter(Boolean)).join(" + "))}</dd></div>
      <div><dt>Inherited Traits</dt><dd>${selected.length}</dd></div>
    </dl>
    <section class="trait-list">
      <article><h4>Inheritance</h4><p>The child inherits biological factors from both direct parents. Individual traits can express through dominance, codominance, incomplete dominance, polygenic inheritance, penetrance, and developmental interaction.</p></article>
      ${selected.map(t=>`<article><h4>${escapeHtml(t.name)} <small>(${escapeHtml(t.race.name)})</small></h4><p>${escapeHtml(t.description)}</p></article>`).join("")}
      ${compatibility.allowed ? `<section class="stat-section"><h4>Parent Expressions</h4><p><strong>${escapeHtml(aLabel)}:</strong> ${escapeHtml(sa ? subtypeLoreText(a,sa) : raceLoreText(a))}</p><p><strong>${escapeHtml(bLabel)}:</strong> ${escapeHtml(sb ? subtypeLoreText(b,sb) : raceLoreText(b))}</p></section>` : ""}
    </section>
  </article>`;
}

function renderMiniIndex(){
  if(!state.dataReady){ miniIndex.innerHTML = "<p>Open the book to view the contents.</p>"; return; }
  const term = state.searchTerm;
  const groups = (state.data.categories || []).map(category => {
    const name = categoryName(category);
    const races = racesForCategory(name).filter(race => !term || searchableText(race).includes(term));
    return {category,races};
  }).filter(group => group.races.length || !term);
  miniIndex.innerHTML = `
    <button class="mini-special" data-spread-open="0">Table of Contents</button>
    ${groups.map(group=>`<section class="mini-category"><h3><button type="button" data-category-mini="${escapeAttr(categoryName(group.category))}">${escapeHtml(categoryName(group.category))}</button></h3>${group.races.map(r=>`<button type="button" data-race-mini="${escapeAttr(r.id)}">${escapeHtml(r.name)}</button>`).join("")}</section>`).join("")}
    <button class="mini-special heritage-mini" data-heritage-mini>23. Heritage Generator</button>`;
  miniIndex.querySelector('[data-spread-open="0"]')?.addEventListener("click",()=>openTo(0));
  miniIndex.querySelectorAll("[data-category-mini]").forEach(button=>button.addEventListener("click",()=>openCategory(button.dataset.categoryMini)));
  miniIndex.querySelectorAll("[data-race-mini]").forEach(button=>button.addEventListener("click",()=>openRace(button.dataset.raceMini)));
  miniIndex.querySelector("[data-heritage-mini]")?.addEventListener("click",()=>openTo(state.heritageSpreadIndex));
  updateMiniCurrent();
}

function openCategory(name){
  const index = state.categorySpreadIndex.get(name);
  if(index !== undefined) openTo(index);
}
function openRace(raceId){
  const index = state.raceSpreadIndex.get(raceId);
  if(index !== undefined) openTo(index);
}
function categoryName(category){ return category?.category_name || category?.creator_category || ""; }
function racesForCategory(name){ return (state.data.races || []).filter(race => race.creator_category === name); }
function searchableText(race){
  return [race.name,race.creator_deity,race.creator_category,race.summary,race.canonical_parent_description,...(race.player_lore||[]),...(race.subtypes||[]).flatMap(s => [s.name,s.subtype_type,s.canonical_description,s.canonical_register_name])].filter(Boolean).join(" ").toLowerCase();
}
function raceLoreText(race){ return cleanDisplayText(race?.summary || race?.canonical_parent_description || ""); }
function subtypeLoreText(race,subtype){
  const overview = (subtype?.traits || []).find(trait => String(trait.name || "").trim().toLowerCase() === "overview")?.description;
  if(overview) return cleanDisplayText(overview);
  const text = cleanDisplayText(subtype?.canonical_description || "");
  if(text && !/\b(one of .* bundled bloodlines|not an Elf bloodline|does not create|separate ancestry|closed preset list|tuned lineage expression|canonical ancestry structure)\b/i.test(text)) return text;
  return `${subtype?.name || "This ancestry"} is a ${race?.name || "parent race"} ${String(subtype?.subtype_type || "ancestry").replace(/_/g," ")}.`;
}
function cleanDisplayText(value=""){
  return String(value)
    .replace(/In older divine registers, this people is catalogued by habitat, temperament, resilience, and resonance\.?/gi,"")
    .replace(/Temple marginalia marks this as a tuned lineage expression rather than a separate act of mercy\.?/gi,"")
    .replace(/Temple marginalia records this as a canonical ancestry structure within the deity's single creator category\.?/gi,"")
    .replace(/\bme as DM's\b/gi,"the DM's")
    .replace(/\bme as DM\b/gi,"the DM")
    .replace(/\s+/g," ")
    .trim();
}

function nextSpread(){
  if(state.currentSpread < 0) return openTo(0);
  if(state.currentSpread >= state.spreads.length-1) return;
  animateTurn("next",()=>{state.currentSpread++;renderCurrentSpread();});
}
function previousSpread(){
  if(state.currentSpread <= 0){renderClosedCover();return;}
  animateTurn("prev",()=>{state.currentSpread--;renderCurrentSpread();});
}
function animateTurn(direction,after){
  if(state.isTurning) return;
  state.isTurning=true;
  book.classList.add("ancient-turning",`turning-${direction}`);
  turnSheet.className=`turn-sheet ${direction}`;
  turnSheet.setAttribute("aria-hidden","false");
  setTimeout(()=>{
    after();
    book.classList.remove("ancient-turning",`turning-${direction}`);
    turnSheet.className="turn-sheet";
    turnSheet.setAttribute("aria-hidden","true");
    state.isTurning=false;
  },TURN_DURATION);
}

function updateButtonStates(){
  const closed=state.currentSpread<0;
  controls.prev.disabled=closed;
  controls.next.disabled=closed || state.currentSpread>=state.spreads.length-1;
  controls.prevBottom.disabled=closed;
  controls.nextBottom.disabled=closed || state.currentSpread>=state.spreads.length-1;
}
function updateMiniCurrent(){
  miniIndex.querySelectorAll("button").forEach(button=>button.classList.remove("current"));
  const spread=state.spreads[state.currentSpread];
  if(!spread) return;
  if(spread.type==="toc") miniIndex.querySelector('[data-spread-open="0"]')?.classList.add("current");
  if(spread.type==="category") miniIndex.querySelector(`[data-category-mini="${CSS.escape(categoryName(spread.category))}"]`)?.classList.add("current");
  if(spread.type==="race") miniIndex.querySelector(`[data-race-mini="${CSS.escape(spread.race.id)}"]`)?.classList.add("current");
  if(spread.type==="heritage") miniIndex.querySelector("[data-heritage-mini]")?.classList.add("current");
}
function setZoom(value){ state.zoom=clamp(Number(value),.7,1.8);writeSetting("universal-races-book-zoom",String(state.zoom));applyZoom(); }
function applyZoom(){ document.documentElement.style.setProperty("--book-scale",state.zoom);zoomLabel.textContent=`${Math.round(state.zoom*100)}%`; }
function pageWrap(inner){ return `<div class="page-scroll">${inner}</div>`; }
function countSubtypes(){ return (state.data.races||[]).reduce((sum,race)=>sum+(race.subtypes?.length||0),0); }
function unique(values){ return [...new Set(values)]; }
function labelize(value=""){ return String(value).replace(/[_-]+/g," ").replace(/\b\w/g,c=>c.toUpperCase()); }
function clamp(value,min,max){ return Math.min(max,Math.max(min,value)); }
function escapeHtml(value=""){ return String(value).replace(/[&<>'"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char])); }
function escapeAttr(value=""){ return escapeHtml(value).replace(/`/g,"&#96;"); }
