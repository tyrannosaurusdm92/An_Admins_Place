/* Jasper Fanfiction — fandom/canon context normalizer. */
(function(global){'use strict';
function build(series={},chapter=null){const era=global.JasperFanfictionCanonEra?.context?.(series)||{};return {schema:'jasper.fanfiction.fandom-context.v1',fandom:series.fandom||'',series_title:series.title||series.series_title||'',series_path:series.series_path||'',canon_window:series.canon_window||chapter?.canon_window||'',pairing:series.pairing||chapter?.pairing||'',story_bible:series.story_bible||'',character_bible:series.character_bible||[],must_include:series.must_include||[],avoid:series.avoid||[],...era};}
global.JasperFanfictionFandomContext=Object.freeze({build});
})(typeof globalThis!=='undefined'?globalThis:window);
