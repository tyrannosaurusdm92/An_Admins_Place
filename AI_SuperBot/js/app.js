(function (global) {
  'use strict';

  const SB = global.Superbot = global.Superbot || {};
  const U = SB.util;
  const app = SB.app = { attachments: [], recognition: null };

  async function init() {
    SB.store.load();
    bindUI();
    renderAll();
    registerServiceWorker();
    await refreshHealth(false);
  }

  function bindUI() {
    U.id('newConversation').addEventListener('click', () => {
      SB.store.newConversation();
      renderAll();
      U.id('messageInput').focus();
    });
    U.id('conversationSearch').addEventListener('input', renderConversationList);
    U.id('sendButton').addEventListener('click', sendCurrent);
    U.id('stopButton').addEventListener('click', () => { SB.orchestrator.cancel(); setBusy(false); });
    U.id('messageInput').addEventListener('keydown', event => {
      if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendCurrent(); }
    });
    U.id('messageInput').addEventListener('input', event => {
      SB.store.state.draft = event.target.value;
      SB.store.save();
      autoGrow(event.target);
    });
    U.id('attachButton').addEventListener('click', () => U.id('fileInput').click());
    U.id('fileInput').addEventListener('change', event => addFiles(event.target.files));
    U.id('modeSelect').addEventListener('change', event => SB.store.setSettings({ preferredMode: event.target.value }));
    U.id('healthButton').addEventListener('click', () => refreshHealth(true));
    U.id('sidebarToggle').addEventListener('click', () => document.body.classList.toggle('sidebar-collapsed'));
    U.id('inspectorToggle').addEventListener('click', () => document.body.classList.toggle('inspector-collapsed'));
    U.id('voiceButton').addEventListener('click', toggleVoiceInput);
    U.id('clearConversation').addEventListener('click', () => {
      if (confirm('Clear this conversation?')) { SB.store.clearMessages(); renderAll(); }
    });
    U.id('exportButton').addEventListener('click', exportData);
    U.id('importButton').addEventListener('click', () => U.id('importInput').click());
    U.id('importInput').addEventListener('change', importData);
    U.id('saveSettings').addEventListener('click', saveSettings);
    U.id('testSettings').addEventListener('click', () => { saveSettings(false); refreshHealth(true); });
    U.id('saveMemory').addEventListener('click', saveMemoryFromForm);
    U.id('saveSkill').addEventListener('click', saveSkillFromForm);
    U.id('projectContext').addEventListener('change', event => { SB.store.state.projectContext = event.target.value; SB.store.save(); });
    U.id('quickCommands').addEventListener('click', event => {
      const button = event.target.closest('[data-command]');
      if (!button) return;
      U.id('messageInput').value = button.dataset.command;
      U.id('messageInput').focus();
      autoGrow(U.id('messageInput'));
    });
    U.$$('.inspector-tab').forEach(button => button.addEventListener('click', () => showInspectorTab(button.dataset.tab)));
    U.id('messageList').addEventListener('click', async event => {
      const copy = event.target.closest('[data-copy-message]');
      const speak = event.target.closest('[data-speak-message]');
      const code = event.target.closest('[data-copy-code]');
      if (copy) {
        const message = SB.store.activeConversation().messages.find(item => item.id === copy.dataset.copyMessage);
        if (message) { await U.copyText(message.content); U.toast('Message copied.'); }
      }
      if (speak) {
        const message = SB.store.activeConversation().messages.find(item => item.id === speak.dataset.speakMessage);
        if (message && 'speechSynthesis' in global) { speechSynthesis.cancel(); speechSynthesis.speak(new SpeechSynthesisUtterance(message.content)); }
      }
      if (code) {
        const wrap = code.closest('.code-wrap');
        const codeNode = wrap && wrap.querySelector('code');
        if (codeNode) { await U.copyText(codeNode.textContent); U.toast('Code copied.'); }
      }
    });
    U.id('conversationList').addEventListener('click', event => {
      const row = event.target.closest('[data-conversation-id]');
      const del = event.target.closest('[data-delete-conversation]');
      if (del) {
        event.stopPropagation();
        if (confirm('Delete this conversation?')) { SB.store.deleteConversation(del.dataset.deleteConversation); renderAll(); }
        return;
      }
      if (row) { SB.store.selectConversation(row.dataset.conversationId); renderAll(); }
    });
    U.id('memoryList').addEventListener('click', event => {
      const del = event.target.closest('[data-forget-memory]');
      if (del) { SB.memory.localForget(del.dataset.forgetMemory); renderMemory(); }
    });
    U.id('skillList').addEventListener('click', event => {
      const del = event.target.closest('[data-remove-skill]');
      const toggle = event.target.closest('[data-toggle-skill]');
      if (del) SB.memory.removeSkill(del.dataset.removeSkill);
      if (toggle) SB.memory.toggleSkill(toggle.dataset.toggleSkill);
      renderSkills();
    });
    global.addEventListener('dragover', event => event.preventDefault());
    global.addEventListener('drop', event => {
      if (event.dataTransfer && event.dataTransfer.files.length) {
        event.preventDefault();
        addFiles(event.dataTransfer.files);
      }
    });
  }

  async function sendCurrent() {
    if (SB.orchestrator.busy) return;
    const input = U.id('messageInput');
    const text = input.value;
    if (!text.trim() && !app.attachments.length) return;
    input.value = '';
    SB.store.state.draft = '';
    SB.store.save();
    autoGrow(input);
    const attachments = app.attachments.splice(0);
    renderAttachments();
    setBusy(true);
    renderMessages();
    try {
      await SB.orchestrator.send(text, attachments, { mode: U.id('modeSelect').value });
      if (SB.store.settings.autoReadAloud) {
        const messages = SB.store.activeConversation().messages;
        const last = messages[messages.length - 1];
        if (last && last.role === 'assistant' && 'speechSynthesis' in global) speechSynthesis.speak(new SpeechSynthesisUtterance(last.content));
      }
    } catch (error) {
      U.toast(U.errorMessage(error), 'error', 6000);
    } finally {
      setBusy(false);
      renderAll();
      input.focus();
    }
  }

  async function addFiles(fileList) {
    for (const file of Array.from(fileList || [])) {
      try {
        const ext = U.fileExtension(file.name);
        if (String(file.type || '').startsWith('image/')) {
          if (file.size > SB.CONFIG.maxImageBytes) throw new Error(`${file.name} exceeds the ${U.formatBytes(SB.CONFIG.maxImageBytes)} image limit.`);
          app.attachments.push({ id: U.uid('attachment'), name: file.name, type: file.type, size: file.size, kind: 'image', dataUrl: await U.fileToDataUrl(file) });
        } else if (SB.CONFIG.supportedTextExtensions.includes(ext) || String(file.type || '').startsWith('text/')) {
          app.attachments.push({ id: U.uid('attachment'), name: file.name, type: file.type || 'text/plain', size: file.size, kind: 'text', text: await U.readTextFile(file) });
        } else {
          app.attachments.push({ id: U.uid('attachment'), name: file.name, type: file.type, size: file.size, kind: 'metadata' });
        }
      } catch (error) {
        U.toast(U.errorMessage(error), 'error');
      }
    }
    U.id('fileInput').value = '';
    renderAttachments();
  }

  function renderAttachments() {
    const host = U.id('attachmentTray');
    host.innerHTML = app.attachments.map(item => `<div class="attachment-chip"><span>${item.kind === 'image' ? '▧' : '▤'}</span><b>${U.escapeHtml(item.name)}</b><small>${U.formatBytes(item.size)}</small><button type="button" data-remove-attachment="${item.id}" aria-label="Remove">×</button></div>`).join('');
    U.$$('[data-remove-attachment]', host).forEach(button => button.addEventListener('click', () => {
      app.attachments = app.attachments.filter(item => item.id !== button.dataset.removeAttachment);
      renderAttachments();
    }));
  }

  function setBusy(busy) {
    U.id('sendButton').hidden = busy;
    U.id('stopButton').hidden = !busy;
    U.id('messageInput').disabled = busy;
    document.body.classList.toggle('is-busy', busy);
    if (busy) renderMessages();
  }

  function renderAll() {
    renderConversationList();
    renderMessages();
    renderSettings();
    renderMemory();
    renderSkills();
    renderCapabilities();
    U.id('projectContext').value = SB.store.state.projectContext || '';
    U.id('messageInput').value = SB.store.state.draft || '';
    U.id('modeSelect').value = SB.store.settings.preferredMode || 'chat';
    autoGrow(U.id('messageInput'));
  }

  function renderConversationList() {
    const query = String(U.id('conversationSearch').value || '').toLowerCase();
    const rows = SB.store.state.conversations.filter(conversation => !query || conversation.title.toLowerCase().includes(query) || conversation.messages.some(message => message.content.toLowerCase().includes(query)));
    U.id('conversationList').innerHTML = rows.map(conversation => {
      const last = conversation.messages[conversation.messages.length - 1];
      return `<button type="button" class="conversation-row ${conversation.id === SB.store.state.selectedConversationId ? 'active' : ''}" data-conversation-id="${conversation.id}"><span><b>${U.escapeHtml(conversation.title)}</b><small>${last ? U.escapeHtml(U.truncate(last.content.replace(/\s+/g, ' '), 72)) : 'No messages yet'}</small></span><i>${U.formatDate(conversation.updatedAt)}</i><span class="delete-conversation" data-delete-conversation="${conversation.id}" title="Delete">×</span></button>`;
    }).join('') || '<div class="empty-state">No matching conversations.</div>';
  }

  function renderMessages() {
    const host = U.id('messageList');
    const conversation = SB.store.activeConversation();
    U.id('conversationTitle').textContent = conversation.title;
    if (!conversation.messages.length) {
      host.innerHTML = `<section class="welcome-card"><span class="eyebrow">SUPERBOT INTELLIGENCE</span><h2>Cloud agent when connected. Useful local tools when offline.</h2><p>This package provides a secure frontend, a large searchable skill corpus, persistent local memory, and an Apps Script agent backend adapter. Configure the repository and project token in Settings before expecting cloud-model responses.</p><div class="welcome-grid"><button data-seed="Explain what this Superbot can and cannot do.">Capabilities</button><button data-seed="Audit my project requirements and create an implementation plan.">Plan a project</button><button data-seed="/help">Command help</button></div></section>`;
      U.$$('[data-seed]', host).forEach(button => button.addEventListener('click', () => { U.id('messageInput').value = button.dataset.seed; U.id('messageInput').focus(); }));
      return;
    }
    host.innerHTML = conversation.messages.map(message => `<article class="message ${message.role} ${message.status || ''}"><div class="avatar">${message.role === 'user' ? 'YOU' : 'SB'}</div><div class="message-body"><header><b>${message.role === 'user' ? 'You' : 'Superbot'}</b><span>${U.formatDate(message.createdAt)}</span>${message.source ? `<em>${U.escapeHtml(message.source)}</em>` : ''}</header><div class="message-content">${message.status === 'pending' ? '<div class="thinking"><i></i><i></i><i></i><span>Thinking</span></div>' : U.markdown(message.content)}</div><footer><button type="button" data-copy-message="${message.id}">Copy</button>${message.role === 'assistant' ? `<button type="button" data-speak-message="${message.id}">Read aloud</button>` : ''}</footer></div></article>`).join('');
    requestAnimationFrame(() => { host.scrollTop = host.scrollHeight; });
  }

  function renderSettings() {
    const settings = SB.store.settings;
    U.id('settingBackendUrl').value = settings.backendUrl || '';
    U.id('settingLibrary').value = settings.backendLibrary || '';
    U.id('settingRepository').value = settings.repository || '';
    U.id('settingToken').value = settings.projectToken || '';
    U.id('settingProjectId').value = settings.projectId || '';
    U.id('settingUserId').value = settings.userId || '';
    U.id('settingSystem').value = settings.systemInstructions || '';
    U.id('settingContext').checked = Boolean(settings.includeProjectContext);
    U.id('settingFallback').checked = Boolean(settings.autoFallback);
    U.id('settingReadAloud').checked = Boolean(settings.autoReadAloud);
  }

  function saveSettings(showToast = true) {
    SB.store.setSettings({
      backendUrl: U.id('settingBackendUrl').value.trim(),
      backendLibrary: U.id('settingLibrary').value.trim(),
      repository: U.id('settingRepository').value.trim(),
      projectToken: U.id('settingToken').value.trim(),
      projectId: U.id('settingProjectId').value.trim() || SB.CONFIG.defaultProjectId,
      userId: U.id('settingUserId').value.trim() || SB.CONFIG.defaultUserId,
      systemInstructions: U.id('settingSystem').value.trim(),
      includeProjectContext: U.id('settingContext').checked,
      autoFallback: U.id('settingFallback').checked,
      autoReadAloud: U.id('settingReadAloud').checked
    });
    if (showToast) U.toast('Settings saved.');
  }

  async function refreshHealth(showToast) {
    const status = U.id('backendStatus');
    status.className = 'status-pill checking';
    status.textContent = 'Checking backend…';
    const result = await SB.client.health();
    if (result.ok) {
      status.className = 'status-pill online';
      status.textContent = `Backend online · ${result.version || 'unknown version'}`;
      if (showToast) U.toast('Backend health check succeeded.', 'success');
    } else {
      status.className = 'status-pill offline';
      status.textContent = 'Backend unavailable';
      if (showToast) U.toast(result.error || 'Backend health check failed.', 'error', 6000);
    }
  }

  function renderMemory() {
    const list = SB.store.state.localMemories;
    U.id('memoryCount').textContent = `${list.length} local`;
    U.id('memoryList').innerHTML = list.length ? list.slice(0, 100).map(item => `<article class="mini-card"><header><b>${U.escapeHtml(item.kind)}</b><span>${Number(item.importance || 0.5).toFixed(2)}</span></header><p>${U.escapeHtml(item.text)}</p><small>${(item.tags || []).map(tag => `#${U.escapeHtml(tag)}`).join(' ')}</small><button type="button" data-forget-memory="${item.id}">Forget</button></article>`).join('') : '<div class="empty-state">No local memories saved.</div>';
  }

  function renderSkills() {
    const list = SB.store.state.savedSkills;
    U.id('skillCount').textContent = `${list.filter(item => item.enabled).length}/${list.length} enabled`;
    U.id('skillList').innerHTML = list.length ? list.map(item => `<article class="mini-card ${item.enabled ? '' : 'disabled'}"><header><b>${U.escapeHtml(item.name)}</b><button type="button" data-toggle-skill="${item.id}">${item.enabled ? 'Disable' : 'Enable'}</button></header><p>${U.escapeHtml(item.instructions)}</p><button type="button" data-remove-skill="${item.id}">Remove</button></article>`).join('') : '<div class="empty-state">No reusable local skills saved.</div>';
  }

  function renderCapabilities() {
    U.id('capabilityList').innerHTML = SB.CAPABILITIES.map(item => `<li><span>${item.backend ? '☁' : '◆'}</span><b>${U.escapeHtml(item.label)}</b><small>${item.backend ? 'backend' : 'local'}</small></li>`).join('');
    U.id('corpusCount').textContent = new Intl.NumberFormat().format(SB.retrieval.size());
  }

  function saveMemoryFromForm() {
    try {
      SB.memory.localRemember({ text: U.id('memoryText').value, kind: U.id('memoryKind').value, importance: Number(U.id('memoryImportance').value) });
      U.id('memoryText').value = '';
      renderMemory();
      U.toast('Local memory saved.');
    } catch (error) { U.toast(U.errorMessage(error), 'error'); }
  }

  function saveSkillFromForm() {
    try {
      SB.memory.saveSkill({ name: U.id('skillName').value, instructions: U.id('skillInstructions').value });
      U.id('skillName').value = '';
      U.id('skillInstructions').value = '';
      renderSkills();
      U.toast('Local skill saved.');
    } catch (error) { U.toast(U.errorMessage(error), 'error'); }
  }

  function showInspectorTab(tab) {
    U.$$('.inspector-tab').forEach(button => button.classList.toggle('active', button.dataset.tab === tab));
    U.$$('.inspector-panel').forEach(panel => panel.classList.toggle('active', panel.dataset.panel === tab));
    SB.store.state.ui.panel = tab;
    SB.store.save();
  }

  function exportData() {
    U.download(`superbot-export-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(SB.store.exportAll(), null, 2), 'application/json');
    U.toast('Export created.');
  }

  async function importData(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    try {
      SB.store.importAll(JSON.parse(await file.text()));
      renderAll();
      U.toast('Import completed.', 'success');
    } catch (error) { U.toast(`Import failed: ${U.errorMessage(error)}`, 'error'); }
    event.target.value = '';
  }

  function toggleVoiceInput() {
    const Recognition = global.SpeechRecognition || global.webkitSpeechRecognition;
    if (!Recognition) return U.toast('Speech recognition is not supported by this browser.', 'error');
    if (app.recognition) { app.recognition.stop(); return; }
    const recognition = app.recognition = new Recognition();
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onstart = () => U.id('voiceButton').classList.add('active');
    recognition.onresult = event => {
      let text = '';
      for (let i = event.resultIndex; i < event.results.length; i++) text += event.results[i][0].transcript;
      U.id('messageInput').value = text;
      autoGrow(U.id('messageInput'));
    };
    recognition.onerror = event => U.toast(`Speech recognition error: ${event.error}`, 'error');
    recognition.onend = () => { app.recognition = null; U.id('voiceButton').classList.remove('active'); };
    recognition.start();
  }

  function autoGrow(area) {
    area.style.height = 'auto';
    area.style.height = `${Math.min(220, Math.max(52, area.scrollHeight))}px`;
  }

  async function registerServiceWorker() {
    if ('serviceWorker' in navigator && location.protocol !== 'file:') {
      try { await navigator.serviceWorker.register('./service-worker.js'); } catch { /* local servers may disable it */ }
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})(window);
