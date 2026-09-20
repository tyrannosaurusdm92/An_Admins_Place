(function(g){"use strict";const P=g.PeoplePlaces,D=P.SpeculativeData,E=P.SpeculativeLocationEngine;
const additions=[
// Fantasy settlement/location archetypes. These are original records using generic public-domain/common genre concepts.
{id:'sky-city',name:'Sky City',category:'Settlements & Communities',generics:['Sky City','Cloud City','Aerial Settlement'],texture:'sky',genre:'fantasy',scheme:'fantasy',assignment:'apartment'},
{id:'underwater-city',name:'Underwater City',category:'Settlements & Communities',generics:['Underwater City','Reef City','Submerged Settlement'],texture:'waters',genre:'fantasy',scheme:'fantasy',assignment:'apartment'},
{id:'necropolis-city',name:'Necropolis',category:'Settlements & Communities',generics:['Necropolis','Memorial City','City of Tombs'],texture:'shadow',genre:'fantasy',scheme:'fantasy',assignment:'apartment'},
{id:'kingdom-capital',name:'Kingdom Capital',category:'Settlements & Communities',generics:['Capital','Royal City','Crown City'],texture:'magical',genre:'fantasy',scheme:'fantasy',assignment:'apartment'},
{id:'magic-school',name:'Magic School',category:'Buildings & Interiors',generics:['Magic School','Arcane Academy','School of Magic'],texture:'magical',genre:'fantasy',scheme:'fantasy-building',assignment:'academy'},
{id:'magic-shop',name:'Magic Shop',category:'Buildings & Interiors',generics:['Magic Shop','Arcane Shop','Enchanted Goods Shop'],texture:'magical',genre:'fantasy',scheme:'fantasy-building',assignment:'shop'},
{id:'mage-tower',name:'Mage Tower',category:'Buildings & Interiors',generics:['Mage Tower','Wizard Tower','Arcane Tower'],texture:'magical',genre:'fantasy',scheme:'fantasy-building',assignment:'tower'},
{id:'market-square',name:'Market Square',category:'Buildings & Interiors',generics:['Market Square','Bazaar Court','Trade Square'],texture:'magical',genre:'fantasy',scheme:'fantasy-building',assignment:'hall'},
{id:'guild-district',name:'Guild District',category:'Settlements & Communities',generics:['Guild District','Craft Quarter','Guild Ward'],texture:'magical',genre:'fantasy',scheme:'fantasy',assignment:'hall'},
{id:'realm-gate',name:'Realm Gate',category:'Magical & Otherworldly',generics:['Realm Gate','World Gate','Arcane Passage'],texture:'magical',genre:'fantasy',scheme:'fantasy',assignment:'sector'},
// Sci-fi/space archetypes. Space remains the dominant frame whenever Sci-Fi is selected.
{id:'orbital-outpost',name:'Orbital Outpost',category:'Stations & Habitats',generics:['Orbital Outpost','Space Outpost','Orbital Enclave'],texture:'station',genre:'scifi',scheme:'station',assignment:'station'},
{id:'deep-space-outpost',name:'Deep-Space Outpost',category:'Stations & Habitats',generics:['Deep-Space Outpost','Frontier Station','Remote Outpost'],texture:'space',genre:'scifi',scheme:'station',assignment:'station'},
{id:'planetary-metropolis',name:'Planetary Metropolis',category:'Colonies & Settlements',generics:['Planetary Metropolis','Colony City','Planetary City'],texture:'planetary',genre:'scifi',scheme:'station',assignment:'station'},
{id:'dome-city',name:'Dome City',category:'Colonies & Settlements',generics:['Dome City','Pressure-Dome Settlement','Habitat City'],texture:'planetary',genre:'scifi',scheme:'station',assignment:'station'},
{id:'underwater-colony',name:'Underwater Colony',category:'Colonies & Settlements',generics:['Underwater Colony','Subsea Habitat','Oceanic Colony'],texture:'waters',genre:'scifi',scheme:'station',assignment:'station'},
{id:'moonbase',name:'Moonbase',category:'Colonies & Settlements',generics:['Moonbase','Lunar Base','Lunar Settlement'],texture:'planetary',genre:'scifi',scheme:'station',assignment:'station'},
{id:'comet-mining-base',name:'Comet Mining Base',category:'Facilities & Interiors',generics:['Comet Mining Base','Ice-Mining Base','Comet Facility'],texture:'facility',genre:'scifi',scheme:'facility',assignment:'facility'},
{id:'mecha-bay',name:'Mecha Bay',category:'Facilities & Interiors',generics:['Mecha Bay','Heavy Robotics Bay','Machine Hangar'],texture:'facility',genre:'scifi',scheme:'facility',assignment:'facility'},
{id:'satellite-array',name:'Satellite Array',category:'Astronomical Locations',generics:['Satellite Array','Orbital Satellite Network','Sensor Constellation'],texture:'space',genre:'scifi',scheme:'celestial',assignment:'sector'},
{id:'asteroid-belt',name:'Asteroid Belt',category:'Astronomical Locations',generics:['Asteroid Belt','Rock Belt','Minor-Planet Belt'],texture:'space',genre:'scifi',scheme:'celestial',assignment:'sector'},
{id:'black-hole-observatory',name:'Black-Hole Observatory',category:'Facilities & Interiors',generics:['Black-Hole Observatory','Relativity Observatory','Deep-Gravity Observatory'],texture:'cosmic',genre:'scifi',scheme:'facility',assignment:'facility'},
{id:'exoplanet',name:'Exoplanet',category:'Astronomical Locations',generics:['Exoplanet','Outer World','Survey World'],texture:'planetary',genre:'scifi',scheme:'celestial',assignment:'sector'},
{id:'quasar-sector',name:'Quasar Sector',category:'Astronomical Locations',generics:['Quasar Sector','Active-Galaxy Sector','High-Energy Survey Region'],texture:'cosmic',genre:'scifi',scheme:'celestial',assignment:'sector'}
];
const existing=new Set(D.locations.map(x=>x.id));for(const x of additions)if(!existing.has(x.id)){D.locations.push(x);existing.add(x.id)}
function add(pool,ids){for(const id of ids)if(!pool.includes(id))pool.push(id)}
add(E.pools.fantasy.hub,['sky-city','underwater-city','necropolis-city','kingdom-capital']);
add(E.pools.fantasy.home,['sky-city','underwater-city','kingdom-capital','guild-district']);
add(E.pools.fantasy.school,['magic-school','mage-tower']);
add(E.pools.fantasy.work,['magic-school','magic-shop','mage-tower','market-square','guild-district']);
add(E.pools.scifi.hub,['orbital-outpost','deep-space-outpost','planetary-metropolis','dome-city','underwater-colony','moonbase']);
add(E.pools.scifi.home,['orbital-outpost','planetary-metropolis','dome-city','underwater-colony','moonbase']);
add(E.pools.scifi.work,['orbital-outpost','deep-space-outpost','planetary-metropolis','dome-city','underwater-colony','moonbase','comet-mining-base','mecha-bay','black-hole-observatory']);
P.register('GenreCoverageExpansion',{additions:additions.map(x=>x.id),researchBasis:'Public generator-category coverage was consulted for breadth; no FantasyNameGenerators.com name lists or generator output are bundled.'});})(window);
