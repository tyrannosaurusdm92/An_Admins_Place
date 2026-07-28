# Capability Map

## Browser-side capabilities

- Multiple persistent conversations
- Searchable conversation history
- Local memories with kinds, tags, importance, and retrieval
- Reusable enabled/disabled local skills
- Project context and additional system instructions
- Text and image attachment context
- Safe arithmetic parser without `eval`
- JSON validation and formatting
- Text statistics
- SHA-256 hashing
- Current time information
- Search over the built-in specialist corpus
- Import/export of non-secret workspace state
- Browser speech recognition where supported
- Browser speech synthesis
- Responsive desktop/mobile UI
- Service-worker application-shell caching
- Graceful backend error display and optional local retrieval fallback

## Apps Script backend actions

- `health`
- `chat`
- `memory.remember`
- `memory.search`
- `memory.list`
- `memory.forget`
- `skill.save`
- `skill.list`
- `generate.record`
- `generate.document`
- `generate.workflow`
- `generate.component`
- `generate.schema`
- `generate.checklist`
- `image.generate`
- `3d.generate`
- `3d.plan`
- `job.status`
- `asset.upload`
- `project.get`
- `project.save`
- `project.patch`
- `sort.items`

## Model-hosted tools exposed by the backend agent

- Hosted web search
- Persistent memory recall and storage
- Safe public URL fetching
- Project retrieval and patching
- Item sorting/grouping
- Image generation when enabled
- 3D blueprint/provider generation when enabled
- Approved external tools registered in the backend

## Boundaries

Features such as native ChatGPT connectors, proprietary browsing infrastructure, account-level memories, private system prompts, OpenAI internal tools, native file converters, scheduled automations, and hidden model weights are not transferable into this standalone ZIP. Similar user-facing workflows require separate APIs, permissions, backend implementations, and service accounts.
