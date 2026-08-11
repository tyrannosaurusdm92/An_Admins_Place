/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-a. */
(function(global){
'use strict';
const OM=global.WorldBuilderOrbitalMechanics;
const PC={};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)||0));
const sigmoid=x=>1/(1+Math.exp(-x));
const round=(v,n=1)=>Number(Number(v).toFixed(n));
function compositionValue(p,key){return clamp(p&&p.composition&&p.composition[key],0,100);}
function lunarForcing(planet){const moons=Array.isArray(planet&&planet.moons)?planet.moons:[];if(!moons.length)return 0;const earthMoon=Math.pow(1737,3)/Math.pow(384400,3),mass=Math.max(.15,Number(planet.massEarth)||1);let total=0;moons.slice(0,20).forEach(moon=>{const radius=Math.max(10,Number(moon.radiusKm)||1000),orbit=Math.max(radius*2,Number(moon.orbitKm)||100000);total+=(Math.pow(radius,3)/Math.pow(orbit,3))/earthMoon/mass;});return clamp(total,0,8);}
function derivePlanet(planet,star){
  planet=planet||{};star=star||{};
  const a=Math.max(.001,Number(planet.semiMajorAxisAU)||1),lum=Math.max(.000001,Number(star.luminositySolar)||1);
  const albedo=clamp(planet.albedo==null?.3:planet.albedo,.01,.95);
  const flux=lum/(a*a);
  const equilibriumK=278.5*Math.pow(lum,.25)/Math.sqrt(a)*Math.pow((1-albedo)/.7,.25);
  const pressure=Math.max(0,Number(planet.atmosphere&&planet.atmosphere.pressureBar)||0);
  const greenhouse=Math.max(0,Number(planet.atmosphere&&planet.atmosphere.greenhouseStrength)||0);
  const water=compositionValue(planet,'ocean'),ice=compositionValue(planet,'ice'),mountainousIce=compositionValue(planet,'mountainousIce'),land=compositionValue(planet,'land'),gas=compositionValue(planet,'gas'),volcanic=compositionValue(planet,'volcanic');
  const totalIce=ice+mountainousIce;
  const oceanBuffer=Math.min(10,water*.09)*Math.min(1,pressure+.15);
  const greenhouseK=greenhouse*(18+16*Math.log1p(pressure))*Math.max(.08,1-albedo*.35);
  const surfaceK=equilibriumK+greenhouseK+(volcanic*.08)-Math.min(15,totalIce*.1);
  const radius=Math.max(.02,Number(planet.radiusEarth)||1),mass=Math.max(.0001,Number(planet.massEarth)||Math.pow(radius,3));
  const gravityG=mass/(radius*radius),escapeVelocityEarth=Math.sqrt(mass/radius),density=5.51*mass/Math.pow(radius,3);
  const tilt=clamp(planet.axialTiltDeg,0,180),ecc=clamp(planet.eccentricity,0,.95),rotation=Math.max(.1,Number(planet.rotationHours)||24);
  const seasonalAmplitudeK=(Math.abs(Math.sin(tilt*Math.PI/180))*28+ecc*95)*(1-Math.min(.7,water/140))*(1-Math.min(.45,pressure/20));
  const dayNightAmplitudeK=Math.min(150,18*Math.sqrt(rotation/24))/(1+pressure*1.8+water*.018);
  const humidity=clamp(water*1.15*(pressure?Math.min(1.4,.3+pressure*.45):.05)*Math.exp(-Math.pow((surfaceK-290)/100,2)),0,100);
  const precipitationMm=clamp(humidity*(.6+water/120)*(1+Math.min(2,greenhouse*.2))*12,0,5000);
  const windIndex=clamp((rotation<15?70:rotation<40?48:25)+(Math.abs(tilt-23.4)*.4)+ecc*50-pressure*2+gas*.15,0,100);
  const moonTides=lunarForcing(planet),stormIndex=clamp(humidity*.4+windIndex*.38+ecc*35+Math.max(0,surfaceK-305)*.5+moonTides*2.4,0,100);
  const meanC=surfaceK-273.15;
  let regime='airless / radiative';
  if(planet.type==='gas-giant'||planet.type==='ice-giant'||gas>55) regime='banded giant-atmosphere circulation';
  else if(surfaceK<170) regime='cryogenic frozen';
  else if(surfaceK<240) regime='cold arid / snowball';
  else if(surfaceK<273) regime=water>20?'cold maritime / glacial':'cold continental';
  else if(surfaceK<310) regime=humidity>65?'humid temperate':'temperate';
  else if(surfaceK<370) regime=humidity>55?'hot monsoonal / greenhouse':'hot arid';
  else if(surfaceK<650) regime='runaway greenhouse / superheated';
  else regime='magma / vaporized surface';
  const h2oLiquidTemp=sigmoid((surfaceK-263)/7)*sigmoid((373-surfaceK)/11)*sigmoid((pressure-.04)*8);
  const atmosphereRetention=clamp(sigmoid((escapeVelocityEarth-.3)*4)*sigmoid((surfaceK<500?1:(700-surfaceK)/100))*100,0,100);
  const tempScore=Math.exp(-Math.pow((surfaceK-288)/48,2));
  const pressureScore=pressure<=0?0:Math.exp(-Math.pow(Math.log10(Math.max(.001,pressure))/1.25,2));
  const waterScore=clamp((water+totalIce*.35)/45,0,1);
  const gravityScore=Math.exp(-Math.pow((gravityG-1)/1.2,2));
  const radiationShield=clamp((Number(planet.magneticField)||0)/1.2,0,1)*clamp(pressure/.3,0,1);
  const habitability=clamp(100*(tempScore*.36+pressureScore*.2+waterScore*.18+gravityScore*.14+radiationShield*.12)*h2oLiquidTemp,0,100);
  const hz=OM?OM.habitableZone(lum):{conservativeInnerAU:.95,conservativeOuterAU:1.67,optimisticInnerAU:.75,optimisticOuterAU:1.77};
  const orbitClass=a<hz.optimisticInnerAU?'interior hot zone':a<hz.conservativeInnerAU?'optimistic inner zone':a<=hz.conservativeOuterAU?'conservative habitable zone':a<=hz.optimisticOuterAU?'optimistic outer zone':'outer cold zone';
  const yearDays=OM?OM.orbitalPeriodDays(a,star.massSolar||1,mass):365.25*Math.sqrt(a*a*a);
  const solarDayHours=Math.abs(1/(1/rotation-(planet.orbitDirection==='retrograde'?-1:1)/(yearDays*24)));
  return{fluxEarth:round(flux,3),equilibriumK:round(equilibriumK,1),surfaceK:round(surfaceK,1),surfaceC:round(meanC,1),greenhouseK:round(greenhouseK,1),gravityG:round(gravityG,3),escapeVelocityEarth:round(escapeVelocityEarth,3),densityGcm3:round(density,2),seasonalAmplitudeK:round(seasonalAmplitudeK,1),dayNightAmplitudeK:round(dayNightAmplitudeK,1),humidityPct:round(humidity,1),precipitationMmYear:round(precipitationMm,0),windIndex:round(windIndex,0),stormIndex:round(stormIndex,0),lunarForcing:round(moonTides,2),moonCount:Array.isArray(planet.moons)?planet.moons.length:0,regime,habitability:round(habitability,0),atmosphereRetention:round(atmosphereRetention,0),liquidWaterPotential:round(h2oLiquidTemp*100,0),orbitClass,habitableZone:hz,yearDays:round(yearDays,2),solarDayHours:round(solarDayHours,2),surfaceFractions:{water,ice,mountainousIce,land,gas,volcanic}};
}
function seasonalSeries(planet,star,steps=72){const base=derivePlanet(planet,star),e=clamp(planet.eccentricity,0,.95),a=Math.max(.001,Number(planet.semiMajorAxisAU)||1),tilt=clamp(planet.axialTiltDeg,0,180),rows=[];for(let i=0;i<=steps;i++){const phase=i/steps;const nu=phase*Math.PI*2;const r=a*(1-e*e)/(1+e*Math.cos(nu));const flux=Math.max(.000001,Number(star.luminositySolar)||1)/(r*r);const orbitalTemp=base.surfaceK*Math.pow(flux/base.fluxEarth,.25);const seasonal=base.seasonalAmplitudeK*Math.sin(nu-Math.PI/2)*Math.sin(tilt*Math.PI/180);rows.push({phase,day:phase*base.yearDays,distanceAU:r,flux,tempK:orbitalTemp+seasonal,tempC:orbitalTemp+seasonal-273.15});}return rows;}
function weatherSummary(c){if(!c)return'';const parts=[];if(c.regime.includes('giant'))parts.push('deep jets, belts, vortices, and pressure-driven storms');else{if(c.humidityPct>70)parts.push('frequent cloud decks and precipitation');else if(c.humidityPct>35)parts.push('seasonal cloud and rain systems');else parts.push('limited precipitation and dry circulation');if(c.windIndex>70)parts.push('very strong prevailing winds');else if(c.windIndex>45)parts.push('active winds');else parts.push('generally slower circulation');if(c.stormIndex>70)parts.push('severe storms are common');else if(c.stormIndex>40)parts.push('episodic severe weather');else parts.push('severe storms are uncommon');}return parts.join('; ')+'.';}
function climateBands(planet,star){const c=derivePlanet(planet,star),bands=[];for(let lat=-90;lat<=90;lat+=10){const insolation=Math.max(.06,Math.cos(lat*Math.PI/180));const temp=c.surfaceK-32*(1-insolation)-Math.abs(lat)/90*c.seasonalAmplitudeK*.35;let biome='barren';if(temp<210)biome='cryogenic ice';else if(temp<255)biome='polar ice / tundra';else if(temp<275)biome=c.humidityPct>50?'cold forest / wetland':'cold steppe';else if(temp<300)biome=c.humidityPct>65?'rainforest / wetland':c.humidityPct>30?'temperate forest / grassland':'dry grassland';else if(temp<330)biome=c.humidityPct>65?'hot rainforest / monsoon':c.humidityPct>35?'savanna':'desert';else biome='hot desert / sterile';bands.push({latitude:lat,tempC:round(temp-273.15,1),biome});}return bands;}
Object.assign(PC,{derivePlanet,seasonalSeries,weatherSummary,climateBands,lunarForcing});
global.WorldBuilderPlanetClimate=PC;
})(window);

;/* WorldBuilder companion metadata */
(function(g){"use strict";var m={"module":"js.planet_climate","category":"weather","sourceFile":"js/planet_climate.js","companionCss":"css/planet_climate.css","accessModel":"front-facing-authoring"};g.WorldBuilderCompanions=g.WorldBuilderCompanions||{};g.WorldBuilderCompanions[m.module]=m;if(g.dispatchEvent)g.dispatchEvent(new CustomEvent("worldbuilder:script-ready",{detail:m}));})(window);
