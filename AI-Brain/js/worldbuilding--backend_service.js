/* Genericized for AI-Brain capability use. Provenance group: world-life-simulation-a. */
(function (global) {
  "use strict";
  const WF = global.WorldBuilder;

  class BackendService {
    constructor(config = WF.BACKEND) { this.config = config; }

    async request(action, payload = {}, timeoutMs = 18000) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetch(this.config.endpoint, {
          method: "POST",
          mode: "cors",
          redirect: "follow",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({
            action,
            source: "AI-Brain worldbuilding and simulation intelligence",
            projectVersion: WF.VERSION,
            libraryId: this.config.libraryId,
            libraryVersion: this.config.libraryVersion,
            libraryUrl: this.config.libraryUrl,
            layoutLock: "setting-agnostic-galaxy",
            ...payload
          }),
          signal: controller.signal
        });
        const text = await response.text();
        if (!response.ok) throw new Error(`Backend returned ${response.status}`);
        try { return JSON.parse(text); } catch { return { ok: true, text }; }
      } finally {
        clearTimeout(timer);
      }
    }

    localInterpret(prompt, world) {
      const text = String(prompt || "").trim();
      const result = {
        ok: true,
        localFallback: true,
        changes: [],
        message: "Applied a local deterministic interpretation because the remote backend was unavailable."
      };
      const rename = text.match(/rename\s+(?:the\s+)?world\s+(?:to|as)\s+["']?([^"']+)["']?/i);
      if (rename) {
        world.name = rename[1].trim().slice(0, 80);
        result.changes.push(`World renamed to ${world.name}`);
      }

      const ocean = text.match(/(?:add|generate|create)\s+(\d+)?\s*(?:new\s+)?(?:underwater|ocean[- ]floor|seafloor|reef|abyssal)\s+(?:settlements?|cities?)/i);
      if (ocean) {
        result.command = {
          type: "add-ocean-settlements",
          count: Math.max(1, Math.min(12, Number(ocean[1] || 1)))
        };
        result.changes.push(`Requested ${result.command.count} ocean settlement(s)`);
      }
      if (/regenerate|redesign|rebuild/i.test(text) && /selected|this|ocean|underwater|seafloor/i.test(text)) {
        result.command = { type: "regenerate-selected-ocean-city" };
        result.changes.push("Requested a redesign of the selected ocean city");
      }
      if (/reef/i.test(text)) {
        result.command = { ...(result.command || { type: "add-ocean-settlements", count: 1 }), reef: true, environment: "Underwater with Reefs" };
        result.changes.push("Reef habitat preference enabled");
      }
      if (/trench/i.test(text)) {
        result.command = { ...(result.command || { type: "add-ocean-settlements", count: 1 }), environment: "Trench Wall City" };
        result.changes.push("Trench-wall placement enabled");
      }
      if (/hydrothermal|vent/i.test(text)) {
        result.command = { ...(result.command || { type: "add-ocean-settlements", count: 1 }), environment: "Hydrothermal Vent Settlement" };
        result.changes.push("Hydrothermal-vent placement enabled");
      }
      if (/canyon/i.test(text)) {
        result.command = { ...(result.command || { type: "add-ocean-settlements", count: 1 }), environment: "Submarine Canyon City" };
        result.changes.push("Submarine-canyon placement enabled");
      }
      const layouts = {
        radial: /radial|palace/i,
        terraced: /terrace|tiered/i,
        ring: /ring|circular/i,
        "canyon-linear": /linear|canyon line/i,
        clustered: /cluster|organic/i
      };
      for (const [layout, pattern] of Object.entries(layouts)) {
        if (pattern.test(text)) {
          result.command = { ...(result.command || { type: "add-ocean-settlements", count: 1 }), layout };
          result.changes.push(`${layout} layout selected`);
          break;
        }
      }
      const styles = ["reef-palace spires", "shell-vault domes", "copper-and-glass pressure towers", "basalt arcades", "pearl-lantern terraces", "kelp-canopy halls", "nautilus observatories", "coral buttress citadels"];
      for (const style of styles) {
        if (style.split(" ").some((word) => word.length > 5 && text.toLowerCase().includes(word))) {
          result.command = { ...(result.command || { type: "add-ocean-settlements", count: 1 }), architectureStyle: style };
          result.changes.push(`${style} architecture selected`);
          break;
        }
      }
      if (!result.changes.length) {
        result.message += " Try ‘add 3 reef cities with radial palace layouts’, ‘regenerate the selected ocean city’, or ‘rename the world to …’.";
      }
      return result;
    }

    async assist(prompt, world) {
      try {
        return await this.request("worldbuilder_assist", { prompt, world });
      } catch (error) {
        const local = this.localInterpret(prompt, world);
        local.remoteError = error.message;
        return local;
      }
    }
  }

  WF.BackendService = BackendService;
})(window);

;/* WorldBuilder companion metadata */
(function(g){"use strict";var m={"module":"js.backend_service","category":"system","sourceFile":"js/backend_service.js","companionCss":"css/backend_service.css","accessModel":"front-facing-authoring"};g.WorldBuilderCompanions=g.WorldBuilderCompanions||{};g.WorldBuilderCompanions[m.module]=m;if(g.dispatchEvent)g.dispatchEvent(new CustomEvent("worldbuilder:script-ready",{detail:m}));})(window);
