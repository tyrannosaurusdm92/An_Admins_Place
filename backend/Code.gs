/**
 * Generic Google Apps Script backend template for projects exported from An Admin's Place.
 * Deploy as Web App. Execute as: Me. Access: choose what your project needs.
 */
const ADMIN_PLACE_PROJECT = 'an-admins-place-template';

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || 'ping';
  if (action === 'ping') {
    return json_({ ok: true, project: ADMIN_PLACE_PROJECT, time: new Date().toISOString() });
  }
  if (action === 'loadProject') {
    return json_({ ok: true, project: loadProject_() });
  }
  if (action === 'records') {
    const bucket = (e.parameter && e.parameter.bucket) || 'events';
    return json_({ ok: true, bucket: bucket, records: loadBucket_(bucket) });
  }
  return json_({ ok: true, message: 'An Admin\'s Place backend is running.', action: action });
}

function doPost(e) {
  let payload = {};
  try {
    payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    return json_({ ok: false, error: 'Invalid JSON: ' + err.message });
  }
  const action = payload.action || 'saveProject';
  if (action === 'saveProject') {
    saveProject_(payload.data || payload.project || payload);
    return json_({ ok: true, action: action, savedAt: new Date().toISOString() });
  }
  if (action === 'formSubmission') {
    appendRecord_('formSubmissions', payload.data || {});
    return json_({ ok: true, action: action });
  }
  if (action === 'datasetRow') {
    appendRecord_('datasetRows', payload.data || {});
    return json_({ ok: true, action: action });
  }
  if (action === 'ecomQuote') {
    appendRecord_('ecomQuotes', payload.data || payload.cart || {});
    return json_({ ok: true, action: action });
  }
  if (action === 'notificationSignup') {
    appendRecord_('notificationSignups', payload.data || {});
    return json_({ ok: true, action: action });
  }
  if (action === 'appendMessage') {
    appendRecord_('messages', payload.data || payload.message || {});
    return json_({ ok: true, action: action });
  }
  if (action === 'saveCampaignRecord') {
    appendRecord_('campaignRecords', payload.data || payload);
    return json_({ ok: true, action: action });
  }
  if (action === 'saveVttScene') {
    appendRecord_('vttScenes', payload.data || payload);
    return json_({ ok: true, action: action });
  }
  if (action === 'saveWorldbuildingArticle') {
    appendRecord_('worldbuildingArticles', payload.data || payload);
    return json_({ ok: true, action: action });
  }
  if (action === 'saveCharacter') {
    appendRecord_('characters', payload.data || payload);
    return json_({ ok: true, action: action });
  }
  if (action === 'saveAudioMetadata') {
    appendRecord_('audioMetadata', payload.data || payload);
    return json_({ ok: true, action: action });
  }
  if (action === 'saveMapScannerData') {
    appendRecord_('mapScannerData', payload.data || payload);
    return json_({ ok: true, action: action });
  }
  if (action === 'saveSettlementGeneratorData') {
    appendRecord_('settlementGeneratorData', payload.data || payload);
    return json_({ ok: true, action: action });
  }
  if (action === 'saveGeoJsonOverlay') {
    appendRecord_('geoJsonOverlays', payload.data || payload.geojson || payload);
    return json_({ ok: true, action: action });
  }
  if (action === 'saveConversationScanPacket') {
    appendRecord_('conversationScanPackets', payload.data || payload.packet || payload);
    return json_({ ok: true, action: action });
  }
  if (action === 'saveResponseCatalog') {
    appendRecord_('responseCatalogs', payload.data || payload.catalog || payload);
    return json_({ ok: true, action: action });
  }
  if (action === 'saveLoreGeneratorRecord') {
    appendRecord_('loreGeneratorRecords', payload.data || payload);
    return json_({ ok: true, action: action });
  }
  if (action === 'saveSettlementModule') {
    appendRecord_('settlementModules', payload.data || payload);
    return json_({ ok: true, action: action });
  }
  if (action === 'saveImmersiveLocationSet') {
    appendRecord_('immersiveLocationSets', payload.data || payload);
    return json_({ ok: true, action: action });
  }
  if (action === 'saveUniversalVttConversion') {
    appendRecord_('universalVttConversions', payload.data || payload);
    return json_({ ok: true, action: action });
  }
  if (action === 'saveDungeonFogTimerLog') {
    appendRecord_('dungeonFogTimerLogs', payload.data || payload);
    return json_({ ok: true, action: action });
  }
  if (action === 'saveDungeonFogSvgRecord') {
    appendRecord_('dungeonFogSvgRecords', payload.data || payload);
    return json_({ ok: true, action: action });
  }
  if (action === 'saveTileAssemblyManifest') {
    appendRecord_('tileAssemblyManifests', payload.data || payload);
    return json_({ ok: true, action: action });
  }
  if (action === 'saveLoginEvent') {
    appendRecord_('loginEvents', payload.data || payload);
    return json_({ ok: true, action: action });
  }
  appendRecord_('events', payload);
  return json_({ ok: true, action: action });
}

function saveProject_(projectData) {
  PropertiesService.getScriptProperties().setProperty('projectData', JSON.stringify(projectData || {}));
}

function loadProject_() {
  const raw = PropertiesService.getScriptProperties().getProperty('projectData');
  return raw ? JSON.parse(raw) : null;
}

function appendRecord_(bucket, record) {
  const props = PropertiesService.getScriptProperties();
  const key = 'bucket_' + bucket;
  const existing = loadBucket_(bucket);
  existing.push({ at: new Date().toISOString(), record: record });
  props.setProperty(key, JSON.stringify(existing.slice(-500)));
}

function loadBucket_(bucket) {
  const raw = PropertiesService.getScriptProperties().getProperty('bucket_' + bucket);
  return raw ? JSON.parse(raw) : [];
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
