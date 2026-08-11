(function (global) {
  'use strict';

  const SB = global.Superbot = global.Superbot || {};
  const U = SB.util;

  function normalizeCloudResponse(result) {
    const text = result && (result.response || result.output_text || result.reply || result.message || result.answer || result.content);
    if (text) return String(text);
    if (result && result.data) return `\`\`\`json\n${JSON.stringify(result.data, null, 2)}\n\`\`\``;
    return `\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``;
  }

  async function attachmentContext(attachments) {
    const sections = [];
    const references = [];
    for (const attachment of attachments || []) {
      if (attachment.kind === 'text') {
        sections.push(`Attached file: ${attachment.name}\n${U.truncate(attachment.text, SB.CONFIG.maxAttachmentChars)}`);
      } else if (attachment.kind === 'image') {
        references.push({ url: attachment.dataUrl, name: attachment.name, type: attachment.type });
      } else {
        sections.push(`Attached file metadata: ${attachment.name} (${attachment.type || 'unknown'}, ${U.formatBytes(attachment.size)})`);
      }
    }
    return { context: sections.join('\n\n---\n\n'), references };
  }

  const orchestrator = SB.orchestrator = {
    busy: false,

    async send(message, attachments = [], options = {}) {
      const text = String(message || '').trim();
      if (!text && !(attachments || []).length) throw new Error('Enter a message or attach a file.');
      if (this.busy) throw new Error('A request is already running.');
      this.busy = true;
      const userMessage = SB.store.addMessage('user', text || `[${attachments.length} attachment(s)]`, {
        attachments: attachments.map(item => ({ name: item.name, type: item.type, size: item.size, kind: item.kind }))
      });
      let placeholder;
      try {
        placeholder = SB.store.addMessage('assistant', 'Thinking…', { status: 'pending' });
        const result = await this.respond(text, attachments, options);
        SB.store.updateMessage(placeholder.id, {
          content: result.text,
          status: 'complete',
          source: result.source,
          meta: result.meta || {}
        });
        this.captureSuggestedMemories(text);
        return SB.store.updateMessage(placeholder.id, {});
      } catch (error) {
        const failure = `Request failed: ${U.errorMessage(error)}`;
        if (placeholder) SB.store.updateMessage(placeholder.id, { content: failure, status: 'error', source: 'error' });
        throw error;
      } finally {
        this.busy = false;
      }
    },

    async respond(message, attachments, options) {
      const command = await SB.tools.parseCommand(message);
      if (command) return this.runCommand(command, attachments);

      const mode = options.mode || SB.store.settings.preferredMode || 'chat';
      if (mode !== 'chat') return this.runMode(mode, message, attachments, options);

      const { context: fileContext, references } = await attachmentContext(attachments);
      const conversation = SB.store.activeConversation();
      const history = conversation.messages
        .filter(item => item.status !== 'pending' && item.id !== conversation.messages[conversation.messages.length - 1]?.id)
        .slice(-SB.CONFIG.maxHistoryMessages)
        .map(item => ({ role: item.role === 'assistant' ? 'assistant' : 'user', content: item.content }));

      const contextParts = [SB.SYSTEM_BASE];
      if (SB.store.settings.systemInstructions) contextParts.push(`User-configured instructions:\n${U.truncate(SB.store.settings.systemInstructions, 12000)}`);
      if (SB.store.settings.includeProjectContext && SB.store.state.projectContext) contextParts.push(`Project context:\n${U.truncate(SB.store.state.projectContext, 30000)}`);
      const localMemory = SB.memory.buildContext(message);
      if (localMemory) contextParts.push(localMemory);
      const retrieval = SB.retrieval.context(message, { limit: 4, maxChars: 14000 });
      if (retrieval) contextParts.push(retrieval);
      if (fileContext) contextParts.push(fileContext);
      const systemContext = U.truncate(contextParts.join('\n\n===\n\n'), SB.CONFIG.maxContextChars);

      try {
        const cloud = await SB.client.chat({ message, history, systemContext, references });
        return { text: normalizeCloudResponse(cloud), source: 'backend', meta: { requestId: cloud.requestId, responseId: cloud.responseId, toolTrace: cloud.toolTrace || [] } };
      } catch (error) {
        if (!SB.store.settings.autoFallback) throw error;
        return {
          text: `${SB.retrieval.offlineAnswer(message)}\n\nBackend error: ${U.errorMessage(error)}`,
          source: 'local-fallback',
          meta: { backendError: U.errorMessage(error) }
        };
      }
    },

    async runCommand({ command, argument }, attachments) {
      switch (command) {
        case 'help': return { text: SB.tools.helpText, source: 'local-tool' };
        case 'calc': return { text: `Result: **${SB.tools.calculate(argument)}**`, source: 'local-tool' };
        case 'json': return { text: `\`\`\`json\n${SB.tools.formatJson(argument)}\n\`\`\``, source: 'local-tool' };
        case 'text': {
          const stats = SB.tools.textStats(argument);
          const common = stats.common.map(([word, count]) => `${word} (${count})`).join(', ') || 'none';
          return { text: `# Text statistics\n\n- Characters: ${stats.characters}\n- Characters excluding whitespace: ${stats.charactersNoSpaces}\n- Words: ${stats.words}\n- Sentences: ${stats.sentences}\n- Paragraphs: ${stats.paragraphs}\n- Lines: ${stats.lines}\n- Estimated reading time: ${stats.readingMinutes.toFixed(2)} minutes\n- Most common terms: ${common}`, source: 'local-tool' };
        }
        case 'hash': return { text: `SHA-256: \`${await SB.tools.hash(argument)}\``, source: 'local-tool' };
        case 'search': return { text: SB.tools.search(argument), source: 'local-retrieval' };
        case 'time': return { text: SB.tools.currentTime(), source: 'local-tool' };
        case 'health': return { text: `\`\`\`json\n${JSON.stringify(await SB.client.health(), null, 2)}\n\`\`\``, source: 'backend-health' };
        case 'remember': {
          const saved = SB.memory.localRemember({ text: argument, kind: 'fact', importance: 0.7 });
          let backend = '';
          if (SB.client.configured()) {
            try { await SB.client.memoryRemember(saved); backend = ' It was also saved to the backend.'; } catch (error) { backend = ` Backend save failed: ${U.errorMessage(error)}`; }
          }
          return { text: `Saved local memory: **${saved.text}**.${backend}`, source: 'memory' };
        }
        case 'memory': {
          const local = SB.memory.localSearch(argument, 12);
          let cloud = [];
          if (SB.client.configured()) {
            try { cloud = (await SB.client.memorySearch(argument, 12)).memories || []; } catch { cloud = []; }
          }
          const all = [...local.map(item => ({ ...item, location: 'local' })), ...cloud.map(item => ({ ...item, location: 'backend' }))];
          if (!all.length) return { text: 'No matching memories were found.', source: 'memory' };
          return { text: all.map(item => `- **${item.location} / ${item.kind || 'fact'}:** ${item.text || item.content}`).join('\n'), source: 'memory' };
        }
        case 'document':
        case 'workflow':
        case 'component':
        case 'schema':
        case 'checklist': return this.runMode(command, argument, attachments);
        case 'image': return this.runMode('image', argument, attachments);
        case '3d': return this.runMode('3d', argument, attachments);
        case 'export': {
          const payload = JSON.stringify(SB.store.exportAll(), null, 2);
          U.download(`superbot-export-${new Date().toISOString().slice(0, 10)}.json`, payload, 'application/json');
          return { text: 'Exported conversations, local memories, skills, project context, and non-secret settings.', source: 'local-tool' };
        }
        case 'clear':
          SB.store.clearMessages();
          return { text: 'The active conversation was cleared.', source: 'local-tool' };
        default: return { text: `Unknown command: \`/${command}\`\n\n${SB.tools.helpText}`, source: 'local-tool' };
      }
    },

    async runMode(mode, message, attachments = [], options = {}) {
      if (!SB.client.configured()) throw new Error('Backend repository and project token are required for this mode. Open Settings.');
      const { context, references } = await attachmentContext(attachments);
      switch (mode) {
        case 'document':
        case 'workflow':
        case 'component':
        case 'schema':
        case 'checklist': {
          const result = await SB.client.generate(mode, message, context);
          return { text: normalizeCloudResponse(result), source: `backend-${mode}`, meta: result };
        }
        case 'image': {
          const result = await SB.client.generateImage(message, options);
          const asset = result.image || result.asset || result;
          const url = asset.url || asset.webContentLink || asset.downloadUrl || '';
          const details = `\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``;
          return { text: `${url ? `Generated image: ${url}\n\n` : ''}${details}`, source: 'backend-image', meta: result };
        }
        case '3d': {
          const result = await SB.client.generate3D(message, { referenceUrls: references.map(item => item.url), ...options });
          return { text: `# 3D result\n\n\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``, source: 'backend-3d', meta: result };
        }
        default: throw new Error(`Unknown mode: ${mode}`);
      }
    },

    captureSuggestedMemories(userText) {
      for (const candidate of SB.memory.suggestFromTurn(userText)) {
        try { SB.memory.localRemember(candidate); } catch { /* no-op */ }
      }
    },

    cancel() { SB.client.cancel(); }
  };
})(window);
