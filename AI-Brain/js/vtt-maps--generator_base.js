/* AI-Brain generic capability extraction. Source group: legacy-capability-patterns. Original UI shell omitted; embedded logic retained. */

const state = {
  pins: [],
  pinMode: false,
  files: {
    json: null,
    docx: null,
    pdf: null,
    html: null,
    mapImage: null
  }
};

const fields = [
  "provinceName",
  "settlementName",
  "governmentType",
  "settlementTags",
  "deitiesWorshipped",
  "settlementPreferred",
  "timeZone",
  "publicTransportation",
  "population",
  "squareMiles",
  "squareKilometers",
  "dangerRating",
  "axisAltruism",
  "axisLawfulness",
  "axisCooperation",
  "axisHonor",
  "locationInfo",
  "npcInfo"
];

const mapViewer = document.getElementById("mapViewer");
const mapImage = document.getElementById("mapImage");
const mapFrame = document.getElementById("mapFrame");
const mapPlaceholder = document.getElementById("mapPlaceholder");
const mapStatus = document.getElementById("mapStatus");

fields.forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener("input", updatePreview);
});

function getSettlementData(){
  const data = {};
  fields.forEach(id => {
    const el = document.getElementById(id);
    data[id] = el ? el.value : "";
  });

  data.pins = state.pins.map(pin => ({
    id: pin.id,
    label: pin.label,
    xPercent: pin.xPercent,
    yPercent: pin.yPercent
  }));

  data.exportedAt = new Date().toISOString();
  return data;
}

function updatePreview(){
  const val = id => document.getElementById(id)?.value || "—";

  document.getElementById("previewProvince").textContent = val("provinceName");
  document.getElementById("previewSettlement").textContent = val("settlementName");
  document.getElementById("previewGovernment").textContent = val("governmentType");
  document.getElementById("previewPopulation").textContent = val("population");
  document.getElementById("previewDanger").textContent = val("dangerRating");
  document.getElementById("previewTimeZone").textContent = val("timeZone");

  const tagPreview = document.getElementById("tagPreview");
  const tags = (document.getElementById("settlementTags").value || "")
    .split(",")
    .map(t => t.trim())
    .filter(Boolean);

  tagPreview.innerHTML = "";

  if (!tags.length){
    tagPreview.innerHTML = '<span class="tag">No tags yet</span>';
    return;
  }

  tags.forEach(tag => {
    const span = document.createElement("span");
    span.className = "tag";
    span.textContent = tag;
    tagPreview.appendChild(span);
  });
}

document.getElementById("mapImageUpload").addEventListener("change", event => {
  const file = event.target.files[0];
  if (!file) return;

  state.files.mapImage = file;
  const url = URL.createObjectURL(file);

  mapImage.src = url;
  mapImage.style.display = "block";
  mapFrame.style.display = "none";
  mapPlaceholder.style.display = "none";
  mapStatus.textContent = "Map image loaded";
});

document.getElementById("htmlUpload").addEventListener("change", async event => {
  const file = event.target.files[0];
  if (!file) return;

  state.files.html = file;
  const html = await file.text();
  const blob = new Blob([html], { type:"text/html" });
  const url = URL.createObjectURL(blob);

  mapFrame.src = url;
  mapFrame.style.display = "block";
  mapImage.style.display = "none";
  mapPlaceholder.style.display = "none";
  mapStatus.textContent = "HTML map loaded";
});

document.getElementById("jsonUpload").addEventListener("change", async event => {
  const file = event.target.files[0];
  if (!file) return;

  state.files.json = file;

  try{
    const json = JSON.parse(await file.text());
    hydrateFromJSON(json);
    document.getElementById("uploadStatus").textContent = "JSON uploaded and loaded into fields.";
  }catch(error){
    document.getElementById("uploadStatus").textContent = "JSON upload failed: invalid JSON.";
  }
});

document.getElementById("docxUpload").addEventListener("change", event => {
  state.files.docx = event.target.files[0] || null;
  document.getElementById("uploadStatus").textContent = "DOCX uploaded and stored for export.";
});

document.getElementById("pdfUpload").addEventListener("change", event => {
  const file = event.target.files[0];
  if (!file) return;

  state.files.pdf = file;
  document.getElementById("pdfFrame").src = URL.createObjectURL(file);
  document.getElementById("uploadStatus").textContent = "PDF uploaded and ready to view in-site.";
});

function hydrateFromJSON(json){
  fields.forEach(id => {
    if (json[id] !== undefined && document.getElementById(id)){
      document.getElementById(id).value = json[id];
    }
  });

  clearPins(false);

  if (Array.isArray(json.pins)){
    json.pins.forEach(pin => {
      createPin(pin.xPercent, pin.yPercent, pin.label || "Pin", pin.id);
    });
  }

  updatePreview();
}

function enablePinMode(){
  state.pinMode = !state.pinMode;
  mapStatus.textContent = state.pinMode
    ? "Place Pin Mode: click map to add pin"
    : "Place Pin Mode off";
}

mapViewer.addEventListener("click", event => {
  if (!state.pinMode) return;
  if (event.target.classList.contains("map-pin")) return;

  const rect = mapViewer.getBoundingClientRect();
  const xPercent = ((event.clientX - rect.left) / rect.width) * 100;
  const yPercent = ((event.clientY - rect.top) / rect.height) * 100;

  const label = prompt("Pin label:", "Location Pin") || "Location Pin";
  createPin(xPercent, yPercent, label);
  state.pinMode = false;
  mapStatus.textContent = "Pin placed";
});

function addPinAtCenter(){
  const label = prompt("Pin label:", "Center Pin") || "Center Pin";
  createPin(50, 50, label);
}

function createPin(xPercent, yPercent, label, id){
  const pinId = id || crypto.randomUUID();

  const pin = document.createElement("div");
  pin.className = "map-pin";
  pin.dataset.id = pinId;
  pin.dataset.label = label;
  pin.style.left = `${xPercent}%`;
  pin.style.top = `${yPercent}%`;

  mapViewer.appendChild(pin);

  state.pins.push({
    id: pinId,
    label,
    xPercent,
    yPercent
  });

  makePinDraggable(pin);

  pin.addEventListener("contextmenu", event => {
    event.preventDefault();
    if (confirm("are you sure?")){
      removePin(pinId);
    }
  });
}

function makePinDraggable(pin){
  let dragging = false;

  pin.addEventListener("mousedown", event => {
    if (event.button !== 0) return;
    dragging = true;
    event.preventDefault();
  });

  window.addEventListener("mousemove", event => {
    if (!dragging) return;

    const rect = mapViewer.getBoundingClientRect();

    let xPercent = ((event.clientX - rect.left) / rect.width) * 100;
    let yPercent = ((event.clientY - rect.top) / rect.height) * 100;

    xPercent = Math.max(0, Math.min(100, xPercent));
    yPercent = Math.max(0, Math.min(100, yPercent));

    pin.style.left = `${xPercent}%`;
    pin.style.top = `${yPercent}%`;

    const record = state.pins.find(p => p.id === pin.dataset.id);
    if (record){
      record.xPercent = Number(xPercent.toFixed(4));
      record.yPercent = Number(yPercent.toFixed(4));
    }
  });

  window.addEventListener("mouseup", () => {
    dragging = false;
  });
}

function removePin(id){
  const pin = document.querySelector(`.map-pin[data-id="${id}"]`);
  if (pin) pin.remove();
  state.pins = state.pins.filter(p => p.id !== id);
}

function clearPins(confirmFirst = true){
  if (confirmFirst && !confirm("are you sure?")) return;

  document.querySelectorAll(".map-pin").forEach(pin => pin.remove());
  state.pins = [];
}

function openPdfModal(){
  if (!state.files.pdf && !document.getElementById("pdfFrame").src){
    alert("Please upload a PDF first.");
    return;
  }

  document.getElementById("pdfModal").classList.add("open");
}

function closePdfModal(){
  document.getElementById("pdfModal").classList.remove("open");
}

function downloadJSON(){
  const data = getSettlementData();
  const filename = safeName(data.settlementName || "settlement") + ".json";
  downloadBlob(JSON.stringify(data, null, 2), filename, "application/json");
}

function exportHTML(){
  const data = getSettlementData();
  const title = data.settlementName || "Universal Settlement";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${escapeHTML(title)}</title>
<style>
body{font-family:Georgia,serif;background:#07111a;color:#f3e9db;padding:24px;}
pre{background:#111720;border:1px solid rgba(124,231,255,.18);padding:18px;border-radius:12px;white-space:pre-wrap;}
</style>
</head>
<body>
<h1>${escapeHTML(title)}</h1>
<h2>${escapeHTML(data.provinceName || "Unknown Province")}</h2>
<pre>${escapeHTML(JSON.stringify(data, null, 2))}</pre>
</body>
</html>`;

  downloadBlob(html, safeName(title) + ".html", "text/html");
}

async function exportZip(){
  if (typeof JSZip === "undefined"){
    alert("JSZip did not load. Please check your internet connection or include JSZip locally.");
    return;
  }

  const data = getSettlementData();
  const base = safeName(data.settlementName || "settlement_export");
  const zip = new JSZip();

  const html = buildExportHTML(data);
  const json = JSON.stringify(data, null, 2);
  const docxBlob = await buildMinimalDocx(data);

  zip.file(`${base}.html`, html);
  zip.file(`${base}.json`, json);
  zip.file(`${base}.docx`, docxBlob);

  if (state.files.pdf){
    zip.file(`uploads/${safeName(state.files.pdf.name)}`, state.files.pdf);
  }

  if (state.files.docx){
    zip.file(`uploads/original_${safeName(state.files.docx.name)}`, state.files.docx);
  }

  if (state.files.html){
    zip.file(`uploads/original_${safeName(state.files.html.name)}`, state.files.html);
  }

  if (state.files.mapImage){
    zip.file(`uploads/original_${safeName(state.files.mapImage.name)}`, state.files.mapImage);
  }

  const blob = await zip.generateAsync({ type:"blob" });
  downloadBlob(blob, `${base}_export.zip`, "application/zip");
}

function buildExportHTML(data){
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${escapeHTML(data.settlementName || "Settlement Export")}</title>
<style>
body{font-family:Georgia,serif;background:#07111a;color:#f3e9db;padding:24px;}
section{background:#111720;border:1px solid rgba(124,231,255,.18);padding:18px;margin:0 0 16px;border-radius:12px;}
h1,h2{color:#8de0dc;}
pre{white-space:pre-wrap;}
</style>
</head>
<body>
<h1>${escapeHTML(data.settlementName || "Unnamed Settlement")}</h1>
<h2>${escapeHTML(data.provinceName || "Unnamed Province")}</h2>

<section>
<h3>Settlement Data</h3>
<pre>${escapeHTML(JSON.stringify(data, null, 2))}</pre>
</section>
</body>
</html>`;
}

async function buildMinimalDocx(data){
  const zip = new JSZip();

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:body>
${docxParagraph("Universal Settlement Export")}
${docxParagraph("Province: " + (data.provinceName || ""))}
${docxParagraph("Settlement: " + (data.settlementName || ""))}
${docxParagraph("Government: " + (data.governmentType || ""))}
${docxParagraph("Tags: " + (data.settlementTags || ""))}
${docxParagraph("Deities Worshipped: " + (data.deitiesWorshipped || ""))}
${docxParagraph("Time Zone: " + (data.timeZone || ""))}
${docxParagraph("Public Transportation: " + (data.publicTransportation || ""))}
${docxParagraph("Population: " + (data.population || ""))}
${docxParagraph("Square Miles: " + (data.squareMiles || ""))}
${docxParagraph("Square Kilometers: " + (data.squareKilometers || ""))}
${docxParagraph("Danger Rating: " + (data.dangerRating || ""))}
${docxParagraph("Location Information: " + (data.locationInfo || ""))}
${docxParagraph("NPC Information: " + (data.npcInfo || ""))}
${docxParagraph("Pins: " + JSON.stringify(data.pins || []))}
<w:sectPr/>
</w:body>
</w:document>`;

  zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`);

  zip.folder("_rels").file(".rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);

  zip.folder("word").file("document.xml", documentXml);

  return await zip.generateAsync({
    type:"blob",
    mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  });
}

function docxParagraph(text){
  return `<w:p><w:r><w:t>${escapeXML(text)}</w:t></w:r></w:p>`;
}

function saveState(){
  localStorage.setItem("universalSettlementProfile", JSON.stringify(getSettlementData()));
  alert("Browser data saved.");
}

function downloadBlob(content, filename, type){
  const blob = content instanceof Blob ? content : new Blob([content], { type });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

function safeName(name){
  return String(name || "file")
    .replace(/[^\w\- .]/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 90);
}

function escapeHTML(str){
  return String(str || "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function escapeXML(str){
  return escapeHTML(str);
}

updatePreview();
