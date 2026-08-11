/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-b. */
(function (global) {
  'use strict';
  var B = global.WorldBuilderSuperbotBrain = global.WorldBuilderSuperbotBrain || {};
  var H = global.WorldBuilderSuperbotHelper;

  function parseDegrees(text, fallback) {
    var match = String(text || '').match(/(-?\d+(?:\.\d+)?)\s*(?:°|degrees?|deg)?/i);
    return match ? Math.abs(Number(match[1])) : (fallback == null ? 5 : fallback);
  }

  function listContinents() {
    var snapshot = global.WorldBuilderEditor.getSnapshot();
    return snapshot.continents.map(function (c) { return c.name + ' (' + c.center.lat.toFixed(1) + '°, ' + c.center.lon.toFixed(1) + '°)'; }).join('; ') + '.';
  }

  function weatherReply() {
    var climate = global.WorldBuilderClimate && global.WorldBuilderClimate.getLatest();
    if (!climate) return 'The climate engine has not finished its first calculation yet.';
    var strongest = climate.systems.slice().sort(function (a, b) { return b.stormPotential - a.stormPotential; })[0];
    var moved = climate.systems.filter(function (s) { return s.changedFromInitialLatitude; });
    return 'Weather is currently recalculated for ' + climate.systems.length + ' continents. ' + (strongest ? strongest.name + ' has the strongest storm potential at ' + strongest.stormPotential + '%. ' : '') + (moved.length ? moved.map(function (s) { return s.name + ' is now in the ' + s.zone + ' belt'; }).join('; ') + '. ' : '') + (climate.blockedOceanCorridors.length ? climate.blockedOceanCorridors.length + ' ocean corridor' + (climate.blockedOceanCorridors.length === 1 ? ' has' : 's have') + ' narrowed or closed.' : 'No major ocean corridor is currently flagged as blocked.');
  }

  function renameCommand(message) {
    var match = message.match(/(?:rename|change\s+(?:the\s+)?name\s+of)\s+[“"']?(.+?)[”"']?\s+(?:to|as)\s+[“"']?(.+?)[”"']?\s*$/i);
    if (!match) return null;
    var continent = H.findContinent(match[1]);
    if (!continent) return { handled: true, reply: 'I could not match “' + match[1].trim() + '” to a continent in the current frame.' };
    var result = global.WorldBuilderEditor.renameContinent(continent.key, match[2].trim());
    return { handled: true, reply: result.ok ? 'Renamed ' + continent.name + ' to ' + result.name + '. Its attached landmarks and JSON override remain connected.' : 'I could not rename that continent.' };
  }

  function moveCommand(message) {
    var direction = message.match(/\b(north(?:ward)?|south(?:ward)?|east(?:ward)?|west(?:ward)?)\b/i);
    if (!/\b(move|nudge|shift|drag)\b/i.test(message) || !direction) return null;
    var snapshot = global.WorldBuilderEditor.getSnapshot();
    var continent = snapshot.continents.slice().sort(function (a, b) { return b.name.length - a.name.length; }).find(function (c) { return H.normalize(message).indexOf(H.normalize(c.name)) >= 0 || H.normalize(message).indexOf(H.normalize(c.defaultName)) >= 0; });
    if (!continent) continent = snapshot.continents.find(function (c) { return c.key === snapshot.selectedKey; });
    if (!continent) return { handled: true, reply: 'Select a continent or include its current name in the move command.' };
    var degrees = parseDegrees(message, 5), dx = 0, dy = 0;
    if (/north/i.test(direction[1])) dy = degrees;
    if (/south/i.test(direction[1])) dy = -degrees;
    if (/east/i.test(direction[1])) dx = degrees;
    if (/west/i.test(direction[1])) dx = -degrees;
    var result = global.WorldBuilderEditor.moveContinent(continent.key, { dx: dx, dy: dy });
    return { handled: true, reply: result.ok ? 'Moved ' + continent.name + ' ' + degrees + '° ' + direction[1].toLowerCase() + '. Weather, ocean corridors, tectonic status, and attached landmarks were recalculated.' : 'I could not move that continent.' };
  }

  function rotateCommand(message) {
    if (!/\brotate|turn\b/i.test(message)) return null;
    var direction = /counter(?:-|\s*)clockwise|anticlockwise|left/i.test(message) ? -1 : 1;
    var continent = H.findContinent(message);
    if (!continent) return null;
    var degrees = parseDegrees(message, 10);
    var result = global.WorldBuilderEditor.moveContinent(continent.key, { dr: direction * degrees });
    return { handled: true, reply: result.ok ? 'Rotated ' + continent.name + ' ' + degrees + '° ' + (direction < 0 ? 'counterclockwise' : 'clockwise') + '. Its rivers, forests, settlements, and other local-coordinate landmarks rotated with it.' : 'I could not rotate that continent.' };
  }



  function undoCommand(message) {
    var text = String(message || '');
    if (!/\bundo\b/i.test(text) || !/(?:terrain|coast|coastline|edge|delta|island|last change|that|operation)/i.test(text)) return null;
    var undone = global.WorldBuilderEditor.undoLastTerrainOperation && global.WorldBuilderEditor.undoLastTerrainOperation();
    return { handled: true, reply: undone && undone.ok ? 'Undid the complete last grouped terrain operation (' + undone.removed + ' linked edits).' : 'There is no grouped terrain operation to undo.' };
  }

  function helpCommand(message) {
    if (!/^\s*(?:help|what can you do|show commands|commands)\s*[?.!]*\s*$/i.test(String(message || ''))) return null;
    return { handled: true, reply: 'Local WorldBuilder commands include: change a named or numbered planet’s orbit, rings, moons, size, tilt, atmosphere, or surface percentages; move or rotate a continent; rename a planet or continent; preview or apply coastline reshaping; undo the last grouped terrain operation; explain climate; summarize imports; generate names; and rebuild world systems. Example: “please remove all straight edges from all continents by making all of edges wavy deltas with tiny islands.” Prefix it with “preview” to inspect the estimated change without applying it.' };
  }

  function worldStartCommand(message) {
    var text = String(message || '');
    if (!/\b(?:create|generate|start|build|randomize)\b.{0,28}\b(?:new\s+)?(?:base\s+)?world\b/i.test(text) || /\bplanet\b|\bstar\s+system\b/i.test(text)) return null;
    var snapshot = global.WorldBuilderEditor && global.WorldBuilderEditor.getSnapshot && global.WorldBuilderEditor.getSnapshot();
    if (!snapshot || !snapshot.continents || !snapshot.continents.length) return { handled: true, reply: 'The continent editor is not ready yet.' };
    var rng = H.rngFor('world-start|' + text), moved = 0;
    snapshot.continents.forEach(function (continent, index) {
      var longitude = Math.round(((rng() - .5) * 150 + index * 17) * 100) / 100;
      var latitude = Math.round(Math.max(-62, Math.min(62, (rng() - .5) * 112)) * 100) / 100;
      var rotation = Math.round((rng() - .5) * 70 * 100) / 100;
      var result = global.WorldBuilderEditor.moveContinent(continent.key, { lonShift: longitude, latShift: latitude, rotation: rotation });
      if (result && result.ok) moved += 1;
    });
    return { handled: true, reply: 'Done. I started a new base world by repositioning and rotating ' + moved + ' continents while preserving their attached rivers, forests, settlements, routes, and feature catalogs. Weather circulation has been recalculated. You can now paint, smooth, round coastlines, or ask me for another terrain change.' };
  }

  function coastlineCommand(message) {
    var text = String(message || '');
    var isCoastRequest = /(?:coast|coastline|shore|edge|continental edge|straight edge|delta|island)/i.test(text) && /(?:remove|smooth|round|reshape|make|turn|change|wavy|irregular|natural|delta|island)/i.test(text);
    if (!isCoastRequest) return null;
    if (/\bundo\b/i.test(text)) {
      var undone = global.WorldBuilderEditor.undoLastTerrainOperation && global.WorldBuilderEditor.undoLastTerrainOperation();
      return { handled: true, reply: undone && undone.ok ? 'Undid the complete last grouped terrain operation (' + undone.removed + ' linked edits).' : 'There is no grouped terrain operation to undo.' };
    }
    var scope = /\b(all|every|each)\b.{0,22}\bcontinents?\b|\bcontinents?\b.{0,22}\b(all|every|each)\b/i.test(text) ? 'all' : 'selected';
    var named = H.findContinent(text);
    if (named && scope !== 'all') scope = named.key;
    var tiny = /\b(tiny|small|little|miniature)\b/i.test(text);
    var many = /\b(many|lots? of|numerous|dense|archipelago)\b/i.test(text);
    var subtle = /\b(subtle|gentle|slight|lightly)\b/i.test(text);
    var intense = /\b(very|extreme|strong|dramatic|highly)\b/i.test(text);
    var options = {
      scope: scope,
      waviness: subtle ? .38 : (intense ? .95 : .74),
      deltaDensity: /\bdelta/i.test(text) ? (many ? .72 : .48) : .22,
      islandDensity: /\bislands?\b/i.test(text) ? (many ? .68 : .36) : .12,
      islandSizeKm: tiny ? 34 : (/\blarge|big\b/i.test(text) ? 130 : 58),
      samplesPerContinent: many ? 52 : (subtle ? 24 : 38)
    };
    var preview = global.WorldBuilderEditor.previewCoastlineTransformation(options);
    if (/\b(preview|show me|plan only|do not apply|don't apply)\b/i.test(text)) {
      return { handled: true, reply: 'Preview: ' + preview.continentCount + ' continent' + (preview.continentCount === 1 ? '' : 's') + ', about ' + preview.estimatedEdgeDabs + ' edge reshaping points, ' + preview.estimatedDeltas + ' delta branches, and ' + preview.estimatedIslands + ' tiny islands. Nothing was changed.' };
    }
    var result = global.WorldBuilderEditor.applyCoastlineTransformation(options);
    if (!result || !result.ok) return { handled: true, reply: 'I could not find a continent target. Select a continent or say “all continents.”' };
    return { handled: true, reply: 'Done. I reshaped ' + result.continentCount + ' continent' + (result.continentCount === 1 ? '' : 's') + ' using ' + result.edgeSelections + ' irregular coastline points and ' + result.generatedStrokes + ' linked delta/island terrain strokes. Straight-looking edges were softened into wavy land, coast, and shallow-water transitions; small deltas and detached islands were added. The whole change is grouped as one undoable terrain operation. Review it in the live viewer, then use Save & correct tectonic plates.' };
  }


  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, Number(value) || 0)); }

  function exactComposition(planet, changes) {
    var keys = ['ocean','land','ice','mountainousIce','gas','volcanic'];
    var source = clone(planet.composition || {}), fixed = {}, fixedTotal = 0;
    Object.keys(changes).forEach(function(key){ if(keys.indexOf(key)>=0){fixed[key]=clamp(changes[key],0,100);fixedTotal+=fixed[key];} });
    if (fixedTotal > 100) {
      Object.keys(fixed).forEach(function(key){ fixed[key] = fixed[key] / fixedTotal * 100; });
      fixedTotal = 100;
    }
    var free = keys.filter(function(key){return fixed[key]==null;}), freeTotal = free.reduce(function(sum,key){return sum + Math.max(0,Number(source[key])||0);},0), remaining = Math.max(0,100-fixedTotal);
    free.forEach(function(key){ source[key] = freeTotal > 0 ? (Math.max(0,Number(source[key])||0) / freeTotal * remaining) : remaining / Math.max(1,free.length); });
    Object.keys(fixed).forEach(function(key){source[key]=fixed[key];});
    var drift = 100-keys.reduce(function(sum,key){return sum+(Number(source[key])||0);},0);
    source[free[0] || Object.keys(fixed)[0] || 'land'] = (Number(source[free[0] || Object.keys(fixed)[0] || 'land'])||0)+drift;
    return source;
  }

  function percentNear(text, terms) {
    var joined = terms.join('|');
    var patterns = [
      new RegExp('(\\d+(?:\\.\\d+)?)\\s*%\\s*(?:covered\\s+in|covered\\s+by|of|with|made\\s+of|)\\s*(?:' + joined + ')','i'),
      new RegExp('(?:' + joined + ')[^\\d%]{0,28}(\\d+(?:\\.\\d+)?)\\s*%','i')
    ];
    for (var i=0;i<patterns.length;i+=1) { var m=String(text||'').match(patterns[i]); if(m)return Number(m[1]); }
    return null;
  }

  function planetDiff(planet, patch) {
    var parts=[];
    if(patch.name!=null)parts.push('name → '+patch.name);
    if(patch.orbitDirection)parts.push('orbit → '+patch.orbitDirection);
    if(patch.semiMajorAxisAU!=null)parts.push('orbit distance → '+patch.semiMajorAxisAU+' AU');
    if(patch.inclinationDeg!=null)parts.push('orbital inclination → '+patch.inclinationDeg+'°');
    if(patch.axialTiltDeg!=null)parts.push('axial tilt → '+patch.axialTiltDeg+'°');
    if(patch.radiusEarth!=null)parts.push('radius → '+patch.radiusEarth+' Earth radii');
    if(patch.massEarth!=null)parts.push('mass → '+patch.massEarth+' Earth masses');
    if(patch.moonCount!=null)parts.push('moons → '+patch.moonCount);
    if(patch.rings)parts.push(patch.rings.enabled===false?'rings removed':'rings enabled at '+(patch.rings.tiltDeg==null?(planet.rings&&planet.rings.tiltDeg||0):patch.rings.tiltDeg)+'°');
    if(patch.composition)parts.push('surface composition updated');
    if(patch.surfaceMaterials&&patch.surfaceMaterials.nitrogenIceShareOfMountainousIcePct!=null)parts.push('nitrogen ice → '+patch.surfaceMaterials.nitrogenIceShareOfMountainousIcePct+'% of mountainous ice');
    return parts;
  }

  function planetCommand(message) {
    var text=String(message||'');
    var galaxy=global.WorldBuilderGalaxy;
    if(!galaxy||!galaxy.getState)return null;
    var planetWords=/\b(planet|world|moon|rings?|orbit|retrograde|prograde|axial|habitable|atmosphere|gas giant|ice giant|from the sun)\b/i;
    if(!planetWords.test(text))return null;

    var create=text.match(/\b(?:create|add|make|generate)\s+(?:a\s+)?(?:new\s+)?planet(?:\s+(?:named|called))?\s+[“"']?([A-Za-z0-9_’'\- ]{2,50})[”"']?/i);
    var planet=H.findPlanet&&H.findPlanet(text);
    if(create&&/\bnew\s+planet|\bcreate\s+(?:a\s+)?planet|\badd\s+(?:a\s+)?planet/i.test(text)){
      galaxy.addPlanet();
      planet=galaxy.getSelectedPlanet();
      var raw=create[1].trim().replace(/\s+(?:with|that|having|and)\b.*$/i,'').trim();
      if(raw)galaxy.applyPatch(planet.id,{name:raw},'Superbot created planet '+raw+'.');
      planet=galaxy.getSelectedPlanet();
    }
    if(!planet)planet=galaxy.getSelectedPlanet();
    if(!planet)return {handled:true,reply:'Create or select a planet first, or identify one by name or orbital order.'};
    if(planet.protected||planet.locked)return {handled:true,reply:planet.name+' is protected. Unlock it before asking Superbot to change its orbit, composition, rings, or moons.'};

    var patch={},composition={},changes=[];
    var rename=text.match(/(?:rename|change\s+(?:the\s+)?name\s+of)\s+(?:planet\s+)?[“"']?.+?[”"']?\s+(?:to|as)\s+[“"']?([^”"']+)[”"']?\s*$/i);
    if(rename)patch.name=rename[1].trim();

    if(/\bretrograde(?:\s+orbit|\s+rotation)?\b/i.test(text))patch.orbitDirection='retrograde';
    if(/\bprograde(?:\s+orbit|\s+rotation)?\b/i.test(text))patch.orbitDirection='prograde';
    var moons=text.match(/(?:give|have|with|and|add|set(?:\s+it)?\s+to)?[^.]{0,28}?(\d+)\s+moons?\b/i);
    if(moons)patch.moonCount=planet.isMainWorld?clamp(Math.round(Number(moons[1])),1,3):clamp(Math.round(Number(moons[1])),0,100);
    if(/\b(no|zero|remove all|without)\s+moons?\b/i.test(text))patch.moonCount=planet.isMainWorld?1:0;

    var ringMention=/\brings?\b/i.test(text);
    if(ringMention){
      var enabled=!/\b(remove|delete|without|no)\s+(?:all\s+)?rings?\b/i.test(text);
      var ringTilt=null,ringMatch=text.match(/(-?\d+(?:\.\d+)?)\s*(?:°|degrees?|deg)\s*(?:tilted\s+)?(?:set\s+of\s+)?rings?/i)||text.match(/rings?[^.]{0,30}?(-?\d+(?:\.\d+)?)\s*(?:°|degrees?|deg)/i);
      if(ringMatch)ringTilt=Number(ringMatch[1]);
      patch.rings=Object.assign({},planet.rings||{}, {enabled:enabled});
      if(ringTilt!=null)patch.rings.tiltDeg=ringTilt;
      if(/saturn/i.test(text))Object.assign(patch.rings,{innerRadius:1.35,outerRadius:2.75,density:.82,opacity:.72,style:'saturn-like layered ice and rock'});
      if(/thin|faint/i.test(text))Object.assign(patch.rings,{density:.28,opacity:.32});
      if(/thick|dense/i.test(text))Object.assign(patch.rings,{density:.9,opacity:.82});
    }

    var axial=text.match(/(?:axial\s+tilt|tilt(?:ed)?\s+(?:axis|planet))[^\d-]{0,12}(-?\d+(?:\.\d+)?)\s*(?:°|degrees?|deg)?/i);
    if(axial)patch.axialTiltDeg=clamp(Number(axial[1]),0,180);
    var inclination=text.match(/(?:orbital\s+inclination|inclined\s+orbit|orbit\s+(?:angle|inclination))[^\d-]{0,12}(-?\d+(?:\.\d+)?)\s*(?:°|degrees?|deg)?/i);
    if(inclination)patch.inclinationDeg=clamp(Number(inclination[1]),-180,180);
    var distance=text.match(/(?:orbit(?:ing)?\s+(?:at|distance)?|semi-major\s+axis|distance\s+from\s+(?:the\s+)?sun)[^\d]{0,14}(\d+(?:\.\d+)?)\s*(?:AU|astronomical units?)/i);
    if(distance)patch.semiMajorAxisAU=Math.max(.02,Number(distance[1]));
    var eccentricity=text.match(/eccentricity[^\d]{0,12}(0(?:\.\d+)?|\.\d+|1(?:\.0+)?)/i);
    if(eccentricity)patch.eccentricity=clamp(Number(eccentricity[1]),0,.95);
    var radius=text.match(/(?:radius|size)[^\d]{0,16}(\d+(?:\.\d+)?)\s*(?:x|times)?\s*(?:earth(?:'s)?\s+radius|earth radii|earth-sized|earth size)?/i);
    if(radius&&/radius|size/i.test(radius[0]))patch.radiusEarth=clamp(Number(radius[1]),.05,30);
    var mass=text.match(/mass[^\d]{0,14}(\d+(?:\.\d+)?)\s*(?:earth masses?|M⊕)?/i);
    if(mass)patch.massEarth=clamp(Number(mass[1]),.001,10000);
    var rotation=text.match(/(?:rotation|day length)[^\d]{0,14}(\d+(?:\.\d+)?)\s*(hours?|days?)/i);
    if(rotation)patch.rotationHours=Number(rotation[1])*(/^day/i.test(rotation[2])?24:1);
    var pressure=text.match(/(?:atmospheric\s+pressure|pressure)[^\d]{0,14}(\d+(?:\.\d+)?)\s*(?:bar|bars)/i);
    if(pressure)patch.atmosphere=Object.assign({},planet.atmosphere||{},{pressureBar:Math.max(0,Number(pressure[1]))});

    var fields=[
      ['mountainousIce',['mountainous\\s+ice','ice\\s+mountains?','mountain\\s+ice']],
      ['ocean',['oceans?','water']],['land',['land','soil']],['ice',['(?<!mountainous\\s)(?<!mountain\\s)ice\\b','glaciers?']],['gas',['gas','cloud\\s+surface']],['volcanic',['volcanic','lava']]
    ];
    fields.forEach(function(item){var value=percentNear(text,item[1]);if(value!=null)composition[item[0]]=value;});
    if(/\bmostly\s+ocean|ocean\s+world\b/i.test(text)&&composition.ocean==null)composition.ocean=75;
    if(/\bmostly\s+land|land\s+world\b/i.test(text)&&composition.land==null)composition.land=75;
    if(/\bmostly\s+ice|ice\s+world\b/i.test(text)&&composition.ice==null&&composition.mountainousIce==null)composition.ice=75;
    if(/\bmostly\s+gas|gas\s+giant\b/i.test(text)&&composition.gas==null)composition.gas=95;
    if(Object.keys(composition).length)patch.composition=exactComposition(planet,composition);

    var nitrogen=text.match(/(\d+(?:\.\d+)?)\s*%[^.]{0,28}?nitrogen/i)||text.match(/nitrogen[^.]{0,28}?(\d+(?:\.\d+)?)\s*%/i);
    if(nitrogen)patch.surfaceMaterials=Object.assign({},planet.surfaceMaterials||{}, {nitrogenIceShareOfMountainousIcePct:clamp(Number(nitrogen[1]),0,100)});
    if(/\bgas giant\b/i.test(text))patch.type='gas-giant';
    else if(/\bice giant\b/i.test(text))patch.type='ice-giant';
    else if(/\bocean world\b/i.test(text))patch.type='ocean';
    else if(/\bice world\b/i.test(text))patch.type='ice';
    else if(/\bdesert world\b/i.test(text))patch.type='desert';
    else if(/\blava world|volcanic world\b/i.test(text))patch.type='lava';

    changes=planetDiff(planet,patch);
    if(!changes.length){
      if(/\b(weather|climate|habitability|temperature)\b/i.test(text)){
        var gstate=galaxy.getState(),climate=global.WorldBuilderPlanetClimate&&global.WorldBuilderPlanetClimate.derivePlanet(planet,gstate.system.star);
        return {handled:true,reply:climate?planet.name+' currently averages '+climate.surfaceC+' °C, '+climate.humidityPct+'% humidity, '+climate.stormIndex+'% storm intensity, '+climate.gravityG+' g, and '+climate.habitability+'% modeled habitability. It sits in the '+climate.orbitClass+'.':'Climate data is unavailable.'};
      }
      return null;
    }
    if(/\b(preview|show me|plan only|do not apply|don't apply)\b/i.test(text))return {handled:true,reply:'Preview for '+planet.name+': '+changes.join('; ')+'. Nothing was changed.'};
    var result=galaxy.applyPatch(planet.id,patch,'Superbot changed '+planet.name+': '+changes.join('; ')+'.');
    if(!result.ok)return {handled:true,reply:'I could not update '+planet.name+': '+(result.error||'unknown error')};
    return {handled:true,reply:'Done. '+result.planet.name+': '+changes.join('; ')+'. Orbit, climate, map layers, terrain, moons, and simulation bindings were recalculated from the accepted planet state.'};
  }

  async function nameCommand(message) {
    if (!/\b(random|generate|suggest).{0,18}\bname|\bname ideas\b/i.test(message)) return null;
    var continent = H.findContinent(message);
    var category = /ocean|sea|bay|gulf/i.test(message) ? 'water' : 'region';
    var seed = (continent ? continent.name : 'world') + '|' + message;
    var backend = await H.api({ action: 'world.name.generate', seed: seed, category: category, style: /rugged|harsh/i.test(message) ? 'rugged' : (/ocean|sea|bay/i.test(message) ? 'oceanic' : 'lyrical'), count: 8 });
    var names = backend.ok && backend.names && backend.names.length ? backend.names : Array.from({ length: 8 }, function (_, i) { return H.localName(seed + '|' + i, category === 'water' ? 'oceanic' : 'lyrical', category === 'water' ? (i % 2 ? 'Sea' : 'Ocean') : ''); });
    return { handled: true, reply: 'Name ideas: ' + names.join(', ') + '.' };
  }

  async function respond(message) {
    message = String(message || '').trim();
    if (!message) return { reply: 'Type a planet, orbit, rings, moons, terrain composition, species, move, rename, coastline, weather, import, or worldbuilding request.' };
    var local = planetCommand(message) || worldStartCommand(message) || helpCommand(message) || undoCommand(message) || coastlineCommand(message) || renameCommand(message) || moveCommand(message) || rotateCommand(message);
    if (local) return local;
    var naming = await nameCommand(message);
    if (naming) return naming;
    if (/\b(list|show).{0,15}continents\b|\bwhat continents\b/i.test(message)) return { handled: true, reply: listContinents() };
    if (/\bweather|climate|storm|rain|monsoon|wind\b/i.test(message)) return { handled: true, reply: weatherReply() };
    if (/\b(import|docx|json|override)\b/i.test(message)) {
      var snapshot = global.WorldBuilderEditor.getSnapshot();
      var count = snapshot.continents.filter(function (c) { return c.overrideSource; }).length;
      return { handled: true, reply: (snapshot.worldBaseline ? 'A DOCX world baseline is loaded. ' : 'No DOCX baseline is loaded yet. ') + count + ' continent JSON override' + (count === 1 ? ' is' : 's are') + ' active. JSON wins over matching DOCX data, while live moves and renames remain the final layer.' };
    }
    if (/\bforge|regenerate|build world systems\b/i.test(message)) {
      var world = global.WorldBuilderRuntime.generate();
      return { handled: true, reply: world ? 'Regenerated world systems for ' + world.world.name + ' using the current geography, technology, interconnectedness, climate, and overrides.' : 'The world systems could not be regenerated.' };
    }
    var backend = await H.api({ action: 'bot.chat', conversationId: 'worldbuilder-setting-agnostic-complete', message: message, project: 'AI-Brain worldbuilding simulation', meta: H.worldContext() });
    if (backend.ok && backend.reply) return { handled: true, reply: backend.reply, backend: true };
    return { handled: true, reply: 'I could not reach the backend for that broader request. Local galaxy and world commands still work, including orbit, rings, moons, surface composition, planet climate, continent movement, naming, and terrain operations.' };
  }

  B.respond = respond;
}(window));

;/* WorldBuilder immersive detail profile */
(function(global){"use strict";var profile={"id": "superbot_brain", "category": "superbot", "description": "Natural-language world editing, orbital commands, terrain changes, species drafts, diagnostics, and repair plans", "capabilities": ["world edits", "orbits", "terrain", "species", "diagnostics"], "qualityTiers": ["balanced", "high", "ultra"], "accessModel": "front-facing-authoring"};var WF=global.WorldBuilder=global.WorldBuilder||{};WF.ModuleDetailProfiles=WF.ModuleDetailProfiles||{};WF.ModuleDetailProfiles[profile.id]=profile;profile.sample=function(seed,index){var x=((Number(seed)||1)+(Number(index)||0)*2654435761)>>>0;x=(x^x>>>16)*2246822519>>>0;x=(x^x>>>13)*3266489917>>>0;return ((x^x>>>16)>>>0)/4294967295;};profile.describe=function(){return profile.description+" Capabilities: "+profile.capabilities.join(", ")+".";};profile.sceneState=function(intensity){intensity=Math.max(0,Math.min(1,(intensity==null?0.75:Number(intensity))));return {module:profile.id,category:profile.category,intensity:intensity,particles:Math.round(40+intensity*260),detailRadius:Math.round(250+intensity*4750),quality:global.WorldBuilder&&WorldBuilder.Immersion?WorldBuilder.Immersion.qualityProfile().level:"high"};};if(WF.Immersion)WF.Immersion.register(profile.id,profile);else global.addEventListener("worldbuilder:immersion-ready",function(){if(WF.Immersion)WF.Immersion.register(profile.id,profile);},{once:true});})(window);

;/* WorldBuilder companion metadata */
(function(g){"use strict";var m={"module":"js.superbot_brain","category":"superbot","sourceFile":"js/superbot_brain.js","companionCss":"css/superbot_brain.css","accessModel":"front-facing-authoring"};g.WorldBuilderCompanions=g.WorldBuilderCompanions||{};g.WorldBuilderCompanions[m.module]=m;if(g.dispatchEvent)g.dispatchEvent(new CustomEvent("worldbuilder:script-ready",{detail:m}));})(window);
