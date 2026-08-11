/* AI-Brain generic capability extraction. Source group: world-life-simulation-a. Original UI shell omitted; embedded logic retained. */
window.OURSPACE_SHARED_BACKEND="https://script.google.com/macros/s/AKfycbxe3P6MBofPEhPfTAaz05TWEYhScX9QgpHzBKCdwPGnvzvVoyfllu0bAghZKqHs4E3hGg/exec";window.OURSPACE_SHARED_LIBRARY="https://script.google.com/macros/library/d/1v06thwdjlv-j82hqHibJF3_gik7i8p9fFfK9nj0EOfi8VHhwT11jK5Eb/4";


{
  "world-project-hub":{
    "name":"World Project Hub",
    "purpose":"General player resource",
    "accent":"cyan/orange campaign portal",
    "texture":"retro runes, dark overlay, player-safe shell",
    "seed":"WorldBuilder World Project Hub",
    "rune":"#CA6309",
    "pageBg":"none"
  },
  "hungry-gods":{
    "name":"World Systems",
    "purpose":"Divine horror, cults, appetites, prisons, omens",
    "accent":"blood-orange, grave-cyan, black glass",
    "texture":"heavy shadow, divine pressure, ritual sparks",
    "seed":"WorldBuilder World Systems",
    "rune":"#B00020",
    "pageBg":"none"
  },
  "materials-craft":{
    "name":"Materials / Craft",
    "purpose":"Alchemy, divine fluid, crafting, engines, industry",
    "accent":"cyan plasma and brass-orange machinery",
    "texture":"wet electricity, brass plates, dark laboratory glow",
    "seed":"WorldBuilder Materials Craft",
    "rune":"#CA6309",
    "pageBg":"none"
  },
  "skyships":{
    "name":"Skyships",
    "purpose":"Air routes, vessels, docks, transit, storms",
    "accent":"nebula-cyan, copper, deep navy",
    "texture":"cloud haze, engine light, metal hull silhouette",
    "seed":"WorldBuilder Skyships",
    "rune":"#D7AA63",
    "pageBg":"none"
  },
  "settlements":{
    "name":"Settlements",
    "purpose":"Cities, villages, ports, districts, laws, rumors",
    "accent":"fogbound teal, candle gold, rust",
    "texture":"street maps, tavern boards, port ledgers",
    "seed":"WorldBuilder Settlements",
    "rune":"#8A5C2B",
    "pageBg":"none"
  },
  "factions":{
    "name":"Factions",
    "purpose":"Orders, guilds, rivals, ranks, debts, safehouses",
    "accent":"banner cyan, seal gold, conspiracy black",
    "texture":"wax seals, ledger shadows, coded signs",
    "seed":"WorldBuilder Factions",
    "rune":"#7B75C9",
    "pageBg":"none"
  },
  "bestiary":{
    "name":"Bestiary",
    "purpose":"Monsters, NPCs, sightings, behavior, weaknesses",
    "accent":"predator teal, bone white, warning orange",
    "texture":"field notes, claw marks, lantern fog",
    "seed":"WorldBuilder Bestiary",
    "rune":"#FF5A7A",
    "pageBg":"none"
  },
  "session-board":{
    "name":"Session Board",
    "purpose":"Recaps, prep, active quests, notes, player reminders",
    "accent":"readable cyan, parchment gold, dark blue",
    "texture":"bulletin board, ink, table lamp glow",
    "seed":"WorldBuilder Session Board",
    "rune":"#FFD56E",
    "pageBg":"none"
  }
}



{
  "schema": "worldbuilder.worldbuilder.settlement_profile_bridge.v1",
  "template": true,
  "templateState": "editable-retro-website-template",
  "settlementId": "",
  "settlementName": "",
  "provinceId": "",
  "provinceName": "",
  "mapWindowSelector": "#settlementMapWindow",
  "mapShellSelector": "#settlementMapShell",
  "worldbuilderTargetSelector": "#worldbuilderSettlementMapTarget",
  "mapLegendSelector": "#settlementMapLegend",
  "locationPanelSelector": "#selectedLocation",
  "locationSearchSelector": "#locationSearch",
  "displayPolicy": {
    "settlementHtmlCreatesPins": false,
    "settlementHtmlDisplaysPins": false,
    "worldbuilderFillsSettlementMapWindow": true,
    "allowCanvasMount": true,
    "allowSvgMount": true,
    "allowImageMount": true,
    "allowIframeMount": true
  },
  "bindingContract": {
    "requiredBindingIds": [
      "settlementId",
      "pinId",
      "locationId"
    ],
    "events": {
      "selectLocation": "worldbuilder:worldbuilder-location-selected",
      "locationIndex": "worldbuilder:worldbuilder-location-index",
      "openedLocation": "worldbuilder:settlement-location-opened",
      "mapReady": "worldbuilder:worldbuilder-map-ready",
      "mapResetRequest": "worldbuilder:settlement-map-reset-requested",
      "postMessageSelectType": "worldbuilder.worldbuilder.locationSelected",
      "postMessageLocationIndexType": "worldbuilder.worldbuilder.locationIndex",
      "postMessageMapMountType": "worldbuilder.worldbuilder.mapMount",
      "postMessageMapReadyType": "worldbuilder.worldbuilder.mapReady"
    }
  },
  "locations": []
}



const palette = {
  brandingAccents: {
    lightest: ["#E8FFFF", "#D6FFFA", "#C9FFF4", "#FFE6C9", "#FFF3D6"],
    light: ["#99FFFF", "#7EFBEA", "#65E9D2", "#F7B36B", "#EFA35C"],
    medium: ["#00FFFF", "#00D9D9", "#2FBED8", "#CA6309", "#B85A08"],
    dark: ["#008B8B", "#007A78", "#0B6E74", "#7A3A07", "#643006"],
    darkest: ["#003C42", "#003A3A", "#062D34", "#2A1304", "#1A0A02"]
  },
  buttons: {
    lightest: ["#FFFFFF", "#ECFFFF", "#FFF1E6", "#F1FFF9", "#E9F8FF"],
    light: ["#C8FFFF", "#BDF7F1", "#FFD0AA", "#B9F0DF", "#BDEBFF"],
    medium: ["#00FFFF", "#CA6309", "#3D9FA0", "#2FBED8", "#4BC7B0"],
    dark: ["#008C96", "#8B3F05", "#1F6668", "#167A8C", "#2D766A"],
    darkest: ["#001E24", "#220E02", "#09292C", "#061F27", "#0A241F"]
  },
  pageOverlays: {
    lightest: ["#D8E6E8", "#C9DAD8", "#E8D7C8", "#D5ECE8", "#E0E6F0"],
    light: ["#8FA4A7", "#7F9997", "#A88D78", "#79AAA1", "#8AA3B8"],
    medium: ["#44575C", "#3F5655", "#5B4030", "#36655F", "#3C5067"],
    dark: ["#162126", "#142323", "#23170F", "#112823", "#151E2C"],
    darkest: ["#000000", "#03070A", "#07090A", "#091017", "#0C1017"]
  },
  navMenus: {
    lightest: ["#EFFBFF", "#E8FFF9", "#FFF3E8", "#F4FAF9", "#F1F1FF"],
    light: ["#B7E9F2", "#A5E7D9", "#FFC99A", "#C7D7D4", "#C9C9E8"],
    medium: ["#2FBED8", "#3D9FA0", "#CA6309", "#557F82", "#595E8D"],
    dark: ["#0B4F5E", "#195154", "#753506", "#2C4144", "#272A55"],
    darkest: ["#03161A", "#071B1C", "#240E02", "#0C1416", "#0A0B20"]
  },
  text: {
    lightest: ["#FFFFFF", "#F3E9DB", "#FFF8ED", "#EFFFFF", "#F9FFFC"],
    light: ["#D4C6B6", "#C9EDEA", "#FFD7B0", "#C8D9E8", "#DDF8EF"],
    medium: ["#A79A8D", "#8DE0DC", "#D7AA63", "#82A9B5", "#9AB7AE"],
    dark: ["#6E635A", "#3D9FA0", "#8A5C2B", "#456672", "#4E6C61"],
    darkest: ["#2D2722", "#0B3F43", "#3A200B", "#162E38", "#1A3029"]
  },
  sliders: {
    lightest: ["#DFFFFF", "#E4FFF8", "#FFEBD9", "#F4FFFC", "#E6F7FF"],
    light: ["#91FFFF", "#9EF2E4", "#FFBD85", "#ADEDD6", "#A6E7FF"],
    medium: ["#00FFFF", "#1FD1C2", "#CA6309", "#49C7A8", "#2FBED8"],
    dark: ["#007E8A", "#0E716B", "#854006", "#267661", "#0E7083"],
    darkest: ["#00242B", "#052C2A", "#2B1202", "#082820", "#042631"]
  },
  scrollbars: {
    lightest: ["#EEF9F9", "#E5FFFA", "#FFF0DF", "#E6EEF0", "#F7F7F7"],
    light: ["#B2D9D9", "#9FEEDD", "#F0B474", "#A6BEC5", "#BFCBD1"],
    medium: ["#5EAAAA", "#48BAA6", "#CA6309", "#6D858E", "#87919A"],
    dark: ["#275859", "#1F675C", "#6E3306", "#293D44", "#3E454B"],
    darkest: ["#0A1B1D", "#071F1D", "#1F0C02", "#0A1317", "#11161B"]
  },
  borders: {
    lightest: ["#D9FFFF", "#E8FFF6", "#FFE9C8", "#F6FFFF", "#F0E8FF"],
    light: ["#9EFFFF", "#ABF5E3", "#F1C070", "#C7FFFF", "#C5B8E8"],
    medium: ["#00FFFF", "#00BFAF", "#D7AA63", "#8DE0DC", "#7B75C9"],
    dark: ["#00848A", "#13786D", "#8A5C2B", "#3D9FA0", "#3A3476"],
    darkest: ["#00282B", "#062A25", "#2D1906", "#0B3032", "#161344"]
  },
  backgrounds: {
    lightest: ["#CDD7D8", "#C7D8D5", "#DAC5B2", "#D0DDE2", "#D9D2E8"],
    light: ["#7C9496", "#74918B", "#A07659", "#7692A2", "#887CA4"],
    medium: ["#263A40", "#243D3C", "#4B2F1E", "#25384D", "#302946"],
    dark: ["#091017", "#07090A", "#120A05", "#0B1220", "#100B18"],
    darkest: ["#000305", "#000000", "#050201", "#020712", "#04030A"]
  },
  status: {
    lightest: ["#FFF7D1", "#FFE5DA", "#E6FFFF", "#E6F5FF", "#F1E9FF"],
    light: ["#FFD56E", "#FFA88C", "#9EFFFF", "#9ED8FF", "#CBB6FF"],
    medium: ["#E8C76E", "#FF5A7A", "#00FFFF", "#2FBED8", "#8B5CFF"],
    dark: ["#8A6730", "#9E1D36", "#008A91", "#0B6070", "#44269A"],
    darkest: ["#2D1D07", "#30060E", "#002A30", "#061E26", "#160B38"]
  }
};

function hashString(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(arr, rng) {
  return arr[Math.floor(rng() * arr.length)];
}

function chooseProjectTheme(projectName) {
  const rng = mulberry32(hashString(projectName));
  return {
    brandingAccent: pick(palette.brandingAccents.medium, rng),
    buttonLightBg: pick(palette.buttons.lightest, rng),
    buttonDarkBg: pick(palette.buttons.darkest, rng),
    buttonTextOnLight: pick(palette.buttons.darkest, rng),
    buttonTextOnDark: pick(palette.buttons.lightest, rng),
    navTextOnLight: pick(palette.navMenus.darkest, rng),
    navTextOnDark: pick(palette.navMenus.lightest, rng),
    bodyTextOnLight: pick(palette.text.darkest, rng),
    bodyTextOnDark: pick(palette.text.lightest, rng),
    bgLight: pick(palette.backgrounds.lightest, rng),
    bgDark: pick(palette.backgrounds.darkest, rng),
    surfaceLight: pick(palette.pageOverlays.lightest, rng),
    surfaceDark: pick(palette.pageOverlays.darkest, rng),
    border: pick([].concat(palette.borders.light, palette.borders.medium, palette.borders.dark), rng),
    slider: pick([].concat(palette.sliders.light, palette.sliders.medium, palette.sliders.dark), rng),
    scrollbar: pick([].concat(palette.scrollbars.light, palette.scrollbars.medium, palette.scrollbars.dark), rng),
    status: pick([].concat(palette.status.light, palette.status.medium, palette.status.dark), rng)
  };
}

const WORLD_ASPECTS = JSON.parse(document.getElementById("worldbuilderWorldAspects").textContent);

function applyTheme(aspectKey) {
  const aspect = WORLD_ASPECTS[aspectKey] || WORLD_ASPECTS["world-project-hub"];
  const t = chooseProjectTheme(aspect.seed || aspect.name);
  const root = document.documentElement.style;

  root.setProperty("--bg-light", t.bgLight);
  root.setProperty("--bg-dark", t.bgDark);
  root.setProperty("--surface-light", t.surfaceLight);
  root.setProperty("--surface-dark", t.surfaceDark);
  root.setProperty("--text-light", t.bodyTextOnDark);
  root.setProperty("--text-dark", t.bodyTextOnLight);
  root.setProperty("--button-light-bg", t.buttonLightBg);
  root.setProperty("--button-dark-bg", t.buttonDarkBg);
  root.setProperty("--button-text-on-light", t.buttonTextOnLight);
  root.setProperty("--button-text-on-dark", t.buttonTextOnDark);
  root.setProperty("--border-accent", t.border);
  root.setProperty("--slider-accent", t.slider);
  root.setProperty("--scrollbar-accent", t.scrollbar);
  root.setProperty("--status-accent", t.status);
  root.setProperty("--brand-accent", t.brandingAccent);
  root.setProperty("--rune-accent", aspect.rune || "#CA6309");
  root.setProperty("--page-bg-image", aspect.pageBg || "none");

  document.body.dataset.worldAspect = aspectKey;
  document.getElementById("aspectNameReadout").textContent = aspect.name;
  document.getElementById("aspectPurposeReadout").textContent = aspect.purpose;
  document.getElementById("aspectAccentReadout").textContent = aspect.accent;
  document.getElementById("aspectTextureReadout").textContent = aspect.texture;
  document.getElementById("aspectJsonReadout").textContent = JSON.stringify(aspect, null, 2);

  try { localStorage.setItem("worldbuilder_template_aspect", aspectKey); } catch (err) {}
}

(function(){
  const floatingNav=document.getElementById('floatingNav');
  const toggle=document.getElementById('floatingNavToggle');
  const panel=document.getElementById('floatingNavPanel');
  const select=document.getElementById('floatingNavSelect');
  const go=document.getElementById('floatingNavGo');
  const aspectSelect=document.getElementById('worldAspectSelect');
  let drag=false,moved=false,startX=0,startY=0,origX=0,origY=0;

  function jumpTo(value){
    const target=document.querySelector(value);
    if(target){target.scrollIntoView({behavior:'smooth',block:'start'});}
  }

  toggle.addEventListener('pointerdown',function(e){
    drag=true;moved=false;startX=e.clientX;startY=e.clientY;
    const rect=floatingNav.getBoundingClientRect();origX=rect.left;origY=rect.top;
    toggle.setPointerCapture(e.pointerId);
  });
  toggle.addEventListener('pointermove',function(e){
    if(!drag)return;
    const dx=e.clientX-startX,dy=e.clientY-startY;
    if(Math.abs(dx)+Math.abs(dy)>5)moved=true;
    const nextX=Math.max(4,Math.min(window.innerWidth-80,origX+dx));
    const nextY=Math.max(4,Math.min(window.innerHeight-80,origY+dy));
    floatingNav.style.left=nextX+'px';floatingNav.style.top=nextY+'px';
  });
  toggle.addEventListener('pointerup',function(e){
    drag=false;
    try{toggle.releasePointerCapture(e.pointerId)}catch(err){}
    if(!moved){
      floatingNav.classList.toggle('collapsed');
      toggle.setAttribute('aria-expanded',String(!floatingNav.classList.contains('collapsed')));
    }
  });
  go.addEventListener('click',function(){jumpTo(select.value)});
  select.addEventListener('change',function(){jumpTo(select.value)});
  panel.addEventListener('click',function(e){e.stopPropagation()});

  document.querySelectorAll('.module-toggle').forEach(function(btn){
    btn.addEventListener('click',function(){
      const module=btn.closest('.module');
      module.classList.toggle('collapsed');
      btn.textContent=module.classList.contains('collapsed')?'+':'−';
    });
  });

  aspectSelect.addEventListener('change',function(){
    applyTheme(aspectSelect.value);
  });

  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'&&!floatingNav.classList.contains('collapsed')){
      floatingNav.classList.add('collapsed');
      toggle.setAttribute('aria-expanded','false');
    }
  });

  let savedAspect = "world-project-hub";
  try { savedAspect = localStorage.getItem("worldbuilder_template_aspect") || savedAspect; } catch (err) {}
  if(!WORLD_ASPECTS[savedAspect]) savedAspect = "world-project-hub";
  aspectSelect.value = savedAspect;
  applyTheme(savedAspect);
})();



(function expandedSettlementTravelController(){
  "use strict";

  const travelModule = document.getElementById("travel");
  const mapShell = document.getElementById("settlementMapShell");
  const mapWindow = document.getElementById("settlementMapWindow");
  const mapTarget = document.getElementById("worldbuilderSettlementMapTarget");
  const mapGrid = document.getElementById("settlementMapGridOverlay");
  const mapStatus = document.getElementById("settlementMapStatus");
  const mapLegend = document.getElementById("settlementMapLegend");
  const fitButton = document.getElementById("mapFitToggle");
  const gridButton = document.getElementById("mapGridToggle");
  const resetButton = document.getElementById("mapResetButton");
  const fullscreenButton = document.getElementById("mapFullscreenButton");
  const searchInput = document.getElementById("locationSearch");
  const searchClear = document.getElementById("settlementSearchClear");
  const results = document.getElementById("locationResults");
  const resultCount = document.getElementById("settlementSearchCount");
  const selectedPanel = document.getElementById("selectedLocation");
  const directoryBody = document.getElementById("travelDirectoryBody");
  const addRecordButton = document.getElementById("addTravelRecord");
  const bridgeNode = document.getElementById("worldbuilder-settlement-bridge-data");

  if(!travelModule || !mapWindow || !searchInput || !directoryBody) return;

  let bridge = {locations:[]};
  try{ bridge = JSON.parse(bridgeNode?.textContent || "{}"); }catch(error){ console.warn("Settlement bridge data could not be read.", error); }
  let externalLocations = Array.isArray(bridge.locations) ? bridge.locations.slice() : [];
  let currentResults = [];
  let selectedRecordId = "";
  let refreshTimer = 0;

  function normalize(value){
    return String(value ?? "").toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  }

  function slug(value){
    return normalize(value).replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"") || "travel-record";
  }

  function textOf(cell){ return (cell?.innerText || cell?.textContent || "").replace(/\s+/g," ").trim(); }

  function directoryRecords(){
    return Array.from(directoryBody.querySelectorAll("tr[data-travel-record]")).map((row,index)=>{
      const cells = row.querySelectorAll("td");
      const name = textOf(cells[0]) || `Travel Record ${index+1}`;
      const type = textOf(cells[1]);
      const notes = textOf(cells[2]);
      const tags = textOf(cells[3]);
      if(!row.dataset.recordId) row.dataset.recordId = `${slug(name)}-${index+1}`;
      return {
        id:row.dataset.recordId,
        locationId:row.dataset.recordId,
        name,
        title:name,
        type,
        use:type,
        notes,
        description:notes,
        tags:tags.split(/[,;|]/).map(v=>v.trim()).filter(Boolean),
        source:"directory",
        row
      };
    });
  }

  function normalizeExternalRecord(item,index){
    const name = item.name || item.title || item.locationName || item.label || `Map Location ${index+1}`;
    return {
      ...item,
      id:item.locationId || item.id || item.pinId || `worldbuilder-${slug(name)}-${index+1}`,
      locationId:item.locationId || item.id || "",
      name,
      title:name,
      type:item.type || item.category || item.service || "WorldBuilder location",
      use:item.use || item.service || item.category || "",
      notes:item.notes || item.description || item.summary || item.playerNotes || "",
      description:item.description || item.summary || item.notes || "",
      tags:Array.isArray(item.tags) ? item.tags : String(item.tags || "").split(/[,;|]/).map(v=>v.trim()).filter(Boolean),
      source:item.source || "worldbuilder"
    };
  }

  function allRecords(){
    const mapRecords = externalLocations.map(normalizeExternalRecord);
    const seen = new Set();
    return directoryRecords().concat(mapRecords).filter(record=>{
      const key = record.id || `${record.name}|${record.type}`;
      if(seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function searchableText(record){
    return normalize([
      record.name,record.title,record.type,record.use,record.notes,record.description,
      record.settlementName,record.provinceName,record.district,record.address,
      ...(record.tags || [])
    ].filter(Boolean).join(" "));
  }

  function escapeHtml(value){
    return String(value ?? "").replace(/[&<>'"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[char]);
  }

  function renderResults(){
    const query = normalize(searchInput.value);
    const tokens = query.split(/\s+/).filter(Boolean);
    currentResults = allRecords().filter(record=>{
      const haystack = searchableText(record);
      return tokens.every(token=>haystack.includes(token));
    });
    resultCount.textContent = `${currentResults.length} record${currentResults.length === 1 ? "" : "s"}`;
    results.replaceChildren();

    if(!currentResults.length){
      const empty = document.createElement("div");
      empty.className = "settlement-no-results";
      empty.textContent = query ? "No settlement or travel records match that search." : "No travel records are available yet.";
      results.appendChild(empty);
      return;
    }

    currentResults.forEach(record=>{
      const button = document.createElement("button");
      button.type = "button";
      button.className = "settlement-location-result";
      button.dataset.recordId = record.id;
      button.innerHTML = `<span><strong>${escapeHtml(record.name)}</strong><small>${escapeHtml(record.type || record.source)}</small></span><span class="result-arrow" aria-hidden="true">›</span>`;
      button.addEventListener("click",()=>selectRecord(record,true));
      results.appendChild(button);
    });
  }

  function detailRows(record){
    const pairs = [
      ["Location",record.name],
      ["Type / Use",record.type || record.use],
      ["Player Notes",record.notes || record.description],
      ["Settlement",record.settlementName],
      ["Province",record.provinceName],
      ["District",record.district],
      ["Address / Area",record.address || record.area],
      ["Travel Time",record.travelTime],
      ["Cost",record.cost],
      ["Hazards",Array.isArray(record.hazards) ? record.hazards.join(", ") : record.hazards],
      ["Rumors",Array.isArray(record.rumors) ? record.rumors.join("\n") : record.rumors],
      ["Source",record.source === "directory" ? "Editable travel directory" : "WorldBuilder map"]
    ].filter(([,value])=>value !== undefined && value !== null && String(value).trim() !== "");
    return pairs;
  }

  function selectRecord(record,shouldScroll){
    selectedRecordId = record.id;
    directoryBody.querySelectorAll("tr").forEach(row=>row.classList.toggle("is-search-selected",row.dataset.recordId === record.id));
    selectedPanel.classList.remove("is-empty");
    const rows = detailRows(record).map(([label,value])=>`<dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd>`).join("");
    const tags = (record.tags || []).map(tag=>`<span class="settlement-result-tag">${escapeHtml(tag)}</span>`).join("");
    selectedPanel.innerHTML = `<h3>${escapeHtml(record.name)}</h3><dl>${rows}</dl>${tags ? `<div class="settlement-result-tags">${tags}</div>` : ""}`;

    const detail = {...record};
    delete detail.row;
    window.dispatchEvent(new CustomEvent("worldbuilder:settlement-location-opened",{detail,bubbles:true}));

    if(record.row){
      record.row.scrollIntoView({behavior:"smooth",block:"center"});
    }else if(shouldScroll){
      selectedPanel.scrollIntoView({behavior:"smooth",block:"center"});
    }
  }

  function scheduleRefresh(){
    window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(()=>{
      renderResults();
      if(selectedRecordId){
        const updated = allRecords().find(record=>record.id === selectedRecordId);
        if(updated) selectRecord(updated,false);
      }
    },120);
  }

  function jumpTo(selector){
    const target = document.querySelector(selector);
    if(!target) return;
    if(travelModule.classList.contains("collapsed")){
      travelModule.classList.remove("collapsed");
      const toggle = travelModule.querySelector(".module-toggle");
      if(toggle) toggle.textContent = "−";
    }
    target.scrollIntoView({behavior:"smooth",block:"start"});
    try{ history.replaceState(null,"",selector); }catch(error){}
  }

  document.querySelectorAll("[data-travel-jump]").forEach(button=>{
    button.addEventListener("click",()=>jumpTo(button.dataset.travelJump));
  });

  fitButton?.addEventListener("click",event=>{
    const fill = mapWindow.classList.toggle("is-fill");
    mapWindow.dataset.mapFitMode = fill ? "fill" : "fit";
    event.currentTarget.setAttribute("aria-pressed",String(fill));
    mapWindow.dispatchEvent(new CustomEvent("worldbuilder:settlement-map-fit-changed",{detail:{mode:fill ? "fill" : "fit"},bubbles:true}));
  });

  gridButton?.addEventListener("click",event=>{
    const hidden = mapGrid.classList.toggle("hidden");
    event.currentTarget.setAttribute("aria-pressed",String(!hidden));
  });

  resetButton?.addEventListener("click",()=>{
    mapWindow.classList.remove("is-fill");
    mapWindow.dataset.mapFitMode = "fit";
    fitButton?.setAttribute("aria-pressed","false");
    mapWindow.dispatchEvent(new CustomEvent("worldbuilder:settlement-map-reset-requested",{bubbles:true}));
    mapStatus.textContent = "Map reset requested.";
  });

  fullscreenButton?.addEventListener("click",async()=>{
    try{
      if(document.fullscreenElement) await document.exitFullscreen();
      else await mapShell.requestFullscreen();
    }catch(error){
      mapStatus.textContent = "Fullscreen could not be opened in this browser.";
      console.warn("Settlement map fullscreen request was rejected.",error);
    }
  });

  document.addEventListener("fullscreenchange",()=>{
    if(fullscreenButton) fullscreenButton.textContent = document.fullscreenElement === mapShell ? "Exit Fullscreen" : "Fullscreen";
  });

  function setMapReady(detail){
    mapTarget.dataset.worldbuilderMapReady = "true";
    const message = detail?.message || detail?.title || "WorldBuilder map content is ready.";
    mapStatus.textContent = message;
  }

  function receiveLocation(record){
    if(!record || typeof record !== "object") return;
    const normalized = normalizeExternalRecord(record,externalLocations.length);
    const existingIndex = externalLocations.findIndex(item=>String(item.locationId || item.id || item.pinId) === String(normalized.id));
    if(existingIndex >= 0) externalLocations.splice(existingIndex,1,record);
    else externalLocations.push(record);
    renderResults();
    selectRecord(normalized,true);
  }

  function receiveLocationIndex(list){
    if(!Array.isArray(list)) return;
    externalLocations = list.slice();
    renderResults();
  }

  window.addEventListener("worldbuilder:worldbuilder-map-ready",event=>setMapReady(event.detail));
  window.addEventListener("worldbuilder:worldbuilder-location-selected",event=>receiveLocation(event.detail));
  window.addEventListener("worldbuilder:worldbuilder-location-index",event=>receiveLocationIndex(event.detail?.locations || event.detail));
  window.addEventListener("message",event=>{
    const data = event.data;
    if(!data || typeof data !== "object") return;
    if(data.type === "worldbuilder.worldbuilder.mapReady" || data.type === "worldbuilder.worldbuilder.mapMount") setMapReady(data);
    if(data.type === "worldbuilder.worldbuilder.locationSelected") receiveLocation(data.location || data.detail || data);
    if(data.type === "worldbuilder.worldbuilder.locationIndex") receiveLocationIndex(data.locations || data.detail?.locations || []);
  });

  const mapObserver = new MutationObserver(()=>{
    const mounted = mapTarget.children.length > 0;
    if(mounted) setMapReady({message:"WorldBuilder map content was mounted in the expanded settlement window."});
  });
  mapObserver.observe(mapTarget,{childList:true});

  searchInput.addEventListener("input",renderResults);
  searchInput.addEventListener("keydown",event=>{
    if(event.key === "Enter" && currentResults[0]){
      event.preventDefault();
      selectRecord(currentResults[0],true);
    }
    if(event.key === "Escape"){
      searchInput.value = "";
      renderResults();
    }
  });
  searchClear?.addEventListener("click",()=>{
    searchInput.value = "";
    renderResults();
    searchInput.focus();
  });

  document.addEventListener("keydown",event=>{
    const tag = document.activeElement?.tagName;
    const editing = document.activeElement?.isContentEditable || tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
    if(event.key === "/" && !editing){
      event.preventDefault();
      if(travelModule.classList.contains("collapsed")) travelModule.querySelector(".module-toggle")?.click();
      jumpTo("#settlement-search-area");
      window.setTimeout(()=>searchInput.focus(),260);
    }
  });

  addRecordButton?.addEventListener("click",()=>{
    const row = document.createElement("tr");
    row.dataset.travelRecord = "";
    row.dataset.recordId = `travel-record-${Date.now()}`;
    ["New Location","Type or use","Add player-facing notes, travel details, hazards, costs, or rumors.","search tags"].forEach(value=>{
      const cell = document.createElement("td");
      cell.contentEditable = "true";
      cell.textContent = value;
      row.appendChild(cell);
    });
    directoryBody.appendChild(row);
    scheduleRefresh();
    row.scrollIntoView({behavior:"smooth",block:"center"});
    row.cells[0].focus();
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(row.cells[0]);
    selection.removeAllRanges();
    selection.addRange(range);
  });

  directoryBody.addEventListener("input",scheduleRefresh);
  directoryBody.addEventListener("click",event=>{
    const row = event.target.closest("tr[data-travel-record]");
    if(!row || event.target.isContentEditable) return;
    const record = directoryRecords().find(item=>item.row === row);
    if(record) selectRecord(record,false);
  });

  renderResults();
})();
