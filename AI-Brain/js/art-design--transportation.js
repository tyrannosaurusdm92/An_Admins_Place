/* AI-Brain generic capability extraction. Source group: legacy-capability-patterns. Original UI shell omitted; embedded logic retained. */

const TRANSIT_TEMPLATE = {
  "routes": [],
  "serviceModes": [
    {
      "key": "rail",
      "label": "Rail",
      "color": "#e53935",
      "landOnly": true
    },
    {
      "key": "caravan",
      "label": "Caravan",
      "color": "#2e9d52"
    },
    {
      "key": "ferry",
      "label": "Ferry",
      "color": "#f28c28"
    },
    {
      "key": "skyship",
      "label": "Skyship",
      "color": "#2878ff"
    },
    {
      "key": "portal",
      "label": "Portal",
      "color": "#8d45d6"
    },
    {
      "key": "steamship",
      "label": "Steamship",
      "color": "#b87932"
    },
    {
      "key": "submarine",
      "label": "Submarine",
      "color": "#13b5c8"
    }
  ],
  "routeTypeHeaders": [
    {
      "mode": "rail",
      "title": "Rail",
      "disclaimer": "Land-only. Do not use for ocean, lake, river-only, submerged, or sky routes.",
      "fare": "1 Silver (Basic Ticket)"
    },
    {
      "mode": "caravan",
      "title": "Caravan",
      "disclaimer": "Ground route for road, wilderness, market, or freight transit service.",
      "fare": "5 Copper - 1 Silver"
    },
    {
      "mode": "ferry",
      "title": "Ferry",
      "disclaimer": "Short-to-medium surface water route for lakes, rivers, harbors, canals, reefs, and nearby islands.",
      "fare": "5 Copper - 2 Silver"
    },
    {
      "mode": "skyship",
      "title": "Skyship",
      "disclaimer": "Air route for high terrain, island chains, skyports, and long-distance crossings.",
      "fare": "2 Silver - 3 Gold"
    },
    {
      "mode": "portal",
      "title": "Portal",
      "disclaimer": "Permit-only or story-gated route; supports restrictions and Wednesday recalibration.",
      "fare": "Restricted / 2 Gold - 5 Platinum high-priority"
    },
    {
      "mode": "steamship",
      "title": "Steamship",
      "disclaimer": "Longer-range surface-water passenger service for coastal or major sea-lane travel.",
      "fare": "1 Silver - 5 Gold"
    },
    {
      "mode": "submarine",
      "title": "Submarine",
      "disclaimer": "Underwater route for reefs, trenches, deep-sea settlements, and submerged hubs.",
      "fare": "5 Silver - 5 Gold"
    }
  ],
  "fares": [
    [
      "🚆 Rail",
      "1 Silver (Basic Ticket)",
      "5 Silver - 1 Gold (Private Cabins)",
      "Land-only rail. It can serve cities, towns, tunnels, bridges, and mountain corridors, but it does not travel across open water or underwater routes."
    ],
    [
      "🛤 Caravan Routes",
      "5 Copper - 1 Silver",
      "Varies (Hired Guards, Enchanted Wagons)",
      "Best for local roads, roads through wilderness, merchant freight, and slower transit movement."
    ],
    [
      "⛵ Ferry",
      "5 Copper - 2 Silver",
      "4 Silver - 1 Gold (Private Boat Charter)",
      "Short-to-medium water service for harbors, rivers, lakes, canals, reefs, and islands."
    ],
    [
      "🛩 Skyship",
      "2 Silver - 3 Gold",
      "5 Gold - 10 Platinum (Private Suites, VIP Skydeck)",
      "Premium long-distance air service for mountains, islands, and terrain that land routes cannot easily cross."
    ],
    [
      "🌀 Portal Travel",
      "Restricted (Requires Pass)",
      "2 Gold - 5 Platinum (High-Priority Travel)",
      "Permit-based travel. Use for official, scholarly, military, emergency, or story-gated transit corridors."
    ],
    [
      "🚢 Steamship",
      "1 Silver - 5 Gold",
      "3 Gold - 8 Platinum (Private Stateroom / Charter)",
      "Longer-range surface-water transit and passenger service; slower than portals or skyships but excellent for coastal chains and major sea lanes."
    ],
    [
      "⚓ Submarine",
      "5 Silver - 5 Gold",
      "10 Gold - 15 Platinum (Private Pressure Cabin / Research Charter)",
      "Underwater transit service for deep-sea settlements, reefs, trenches, hidden ports, and submerged transit hubs."
    ]
  ],
  "wednesday": [
    [
      "Rest day",
      "Wednesday remains the reduced-service day."
    ],
    [
      "Live tracker behavior",
      "When route data is added later, the tracker can apply reduced-service timing on Wednesdays."
    ],
    [
      "Template status",
      "No actual route names, route times, provinces, or settlement data are stored in this generic template."
    ]
  ],
  "employees": [
    [
      "Vaelith Runecrest",
      "Dragonborn",
      "Cis-Male",
      "Maintenance Worker",
      "Rail Template Assignment",
      "Monday, Thursday, Saturday",
      "Template Home Base"
    ],
    [
      "Jykara Vale",
      "Elf",
      "Cis-Female",
      "Ferry Operator",
      "Ferry Template Assignment",
      "Tuesday, Friday",
      "Template Home Base"
    ],
    [
      "Thorn Blackroot",
      "Firbolg",
      "Demi-Male",
      "Maintenance Worker",
      "Rail Template Assignment",
      "Wednesday only; rest-of-week assignment returns to prior rail line as needed",
      "Template Home Base"
    ],
    [
      "Kaelis Mirestep",
      "Human",
      "Non-Binary",
      "Skyship Captain",
      "Skyship Template Assignment",
      "Tuesday, Friday",
      "Template Home Base"
    ],
    [
      "Rhogar Embermaw",
      "Orc",
      "Trans-Male",
      "Caravan Driver",
      "Caravan Template Assignment",
      "Monday, Thursday, Saturday",
      "Template Home Base"
    ],
    [
      "Sylri Whisperwind",
      "Aarakocra",
      "Gender-Fluid",
      "Rail Attendant",
      "Rail Template Assignment",
      "Monday, Thursday, Saturday",
      "Template Home Base"
    ],
    [
      "Drazik Coilfang",
      "Yuan-ti",
      "Agender",
      "Cargo Rail Handler",
      "Rail Template Assignment",
      "Monday, Thursday, Saturday",
      "Template Home Base"
    ],
    [
      "Mirelle Duskbloom",
      "Tiefling",
      "Trans-Female",
      "Caravan Driver",
      "Caravan Template Assignment",
      "Monday, Thursday, Saturday",
      "Template Home Base"
    ],
    [
      "Korvun Ashhide",
      "Goliath",
      "Cis-Male",
      "Rail Security Officer",
      "Rail Template Assignment",
      "Wednesday only; rest-of-week assignment returns to prior rail line as needed",
      "Template Home Base"
    ],
    [
      "Zivra Moonpetal",
      "Satyr",
      "Poly-Gender",
      "Ferry Operator",
      "Ferry Template Assignment",
      "Tuesday, Friday",
      "Template Home Base"
    ],
    [
      "Talmek Geargrin",
      "Autognome",
      "Gender-Less",
      "Skyship Navigator",
      "Skyship Template Assignment",
      "Tuesday, Friday",
      "Template Home Base"
    ],
    [
      "Ilyra Softshadow",
      "Half-Elf",
      "Demi-Female",
      "Ticketing Clerk",
      "Portal Template Assignment",
      "Wednesday only; rest-of-week assignment returns to prior rail line as needed",
      "Template Home Base"
    ],
    [
      "Vekk Rustsnout",
      "Goblin",
      "Cis-Male",
      "Train Conductor",
      "Rail Template Assignment",
      "Wednesday only; rest-of-week assignment returns to prior rail line as needed",
      "Template Home Base"
    ],
    [
      "Serapha Dawnveil",
      "Aasimar",
      "Cis-Female",
      "Caravan Driver",
      "Caravan Template Assignment",
      "Monday, Thursday, Saturday",
      "Template Home Base"
    ],
    [
      "Kriv Thornjaw",
      "Lizardfolk",
      "Neutrois",
      "Skyship Deck Officer",
      "Skyship Template Assignment",
      "Tuesday, Friday",
      "Template Home Base"
    ],
    [
      "Velzi Quickpaw",
      "Tabaxi",
      "Gender-Flexible",
      "Express Rail Courier",
      "Rail Template Assignment",
      "Wednesday only; rest-of-week assignment returns to prior rail line as needed",
      "Template Home Base"
    ],
    [
      "Ozmek Brineeye",
      "Triton",
      "Bi-Gender",
      "Maintenance Worker",
      "Rail Template Assignment",
      "Monday, Thursday, Saturday",
      "Template Home Base"
    ],
    [
      "Fenra Hollowbranch",
      "Mandrake",
      "Agender",
      "Station Groundskeeper",
      "Rail Template Assignment",
      "Wednesday only; rest-of-week assignment returns to prior rail line as needed",
      "Template Home Base"
    ],
    [
      "Kaelix Starwake",
      "Astral Elf",
      "Non-Binary",
      "Train Conductor",
      "Rail Template Assignment",
      "Monday, Thursday, Saturday",
      "Template Home Base"
    ],
    [
      "Drogan Flintbrew",
      "Dwarf",
      "Cis-Male",
      "Ferry Operator",
      "Ferry Template Assignment",
      "Monday, Thursday, Saturday",
      "Template Home Base"
    ],
    [
      "Lurei Honeyfern",
      "Halfling",
      "Cis-Female",
      "Skyship Quartermaster",
      "Skyship Template Assignment",
      "Tuesday, Friday",
      "Template Home Base"
    ],
    [
      "Xarvo Mindcoil",
      "Kalashtar",
      "Gender-Fluid",
      "Caravan Driver",
      "Caravan Template Assignment",
      "Tuesday, Friday",
      "Template Home Base"
    ],
    [
      "Tovik Emberclaw",
      "Leonin",
      "Demi-Male",
      "Rail Engineer",
      "Rail Template Assignment",
      "Monday, Thursday, Saturday",
      "Template Home Base"
    ],
    [
      "Myrrh Veilwalker",
      "Hexblood",
      "Trans-Female",
      "Maintenance Worker",
      "Rail Template Assignment",
      "Monday, Thursday, Saturday",
      "Template Home Base"
    ],
    [
      "Quillik Tinkersnap",
      "Kobold",
      "Gender-Less",
      "Maintenance Worker",
      "Rail Template Assignment",
      "Wednesday only; rest-of-week assignment returns to prior rail line as needed",
      "Template Home Base"
    ],
    [
      "Selnara Driftglass",
      "Genasi",
      "Poly-Gender",
      "Transit Dispatcher",
      "Portal Template Assignment",
      "Monday, Thursday, Saturday",
      "Template Home Base"
    ],
    [
      "Vrakk Ironmane",
      "Minotaur",
      "Cis-Male",
      "Freight Rail Supervisor",
      "Rail Template Assignment",
      "Monday, Thursday, Saturday",
      "Template Home Base"
    ],
    [
      "Isolde Gloamwing",
      "Owlin",
      "Cis-Female",
      "Skyship Captain",
      "Skyship Template Assignment",
      "Monday, Thursday, Saturday",
      "Template Home Base"
    ],
    [
      "Krex Chitterfang",
      "Thri-kreen",
      "Neutrois",
      "Ferry Operator",
      "Ferry Template Assignment",
      "Tuesday, Friday",
      "Template Home Base"
    ],
    [
      "Oren Wildstride",
      "Centaur",
      "Demi-Male",
      "Caravan Driver",
      "Caravan Template Assignment",
      "Tuesday, Friday",
      "Template Home Base"
    ],
    [
      "Ysara Tidewhisper",
      "Dril’thar",
      "Cis-Female",
      "Train Conductor",
      "Rail Template Assignment",
      "Monday, Thursday, Saturday",
      "Template Home Base"
    ],
    [
      "Maldrik Graveborn",
      "Reborn",
      "Agender",
      "Skyship Engineer",
      "Skyship Template Assignment",
      "Tuesday, Friday",
      "Template Home Base"
    ],
    [
      "Tivren Mosscloak",
      "Hedge",
      "Non-Binary",
      "Rail Maintenance Technician",
      "Rail Template Assignment",
      "Monday, Thursday, Saturday",
      "Template Home Base"
    ],
    [
      "Arix Velvetstep",
      "Changeling",
      "Gender-Fluid",
      "Passenger Liaison",
      "Portal Template Assignment",
      "Monday, Thursday, Saturday",
      "Template Home Base"
    ],
    [
      "Jorveth Redtusk",
      "Half-Orc",
      "Trans-Male",
      "Skyship Security Chief",
      "Skyship Template Assignment",
      "Tuesday, Friday",
      "Template Home Base"
    ],
    [
      "Vesper Nullsong",
      "Shade",
      "Gender-Less",
      "Maintenance Worker",
      "Rail Template Assignment",
      "Wednesday only; rest-of-week assignment returns to prior rail line as needed",
      "Template Home Base"
    ],
    [
      "Kalliope Reeddance",
      "Cervan",
      "Cis-Female",
      "Caravan Driver",
      "Caravan Template Assignment",
      "Monday, Thursday, Saturday",
      "Template Home Base"
    ],
    [
      "Brixxle Copperthumb",
      "Gnome",
      "Bi-Gender",
      "Ferry Operator",
      "Ferry Template Assignment",
      "Monday, Thursday, Saturday",
      "Template Home Base"
    ],
    [
      "Tharos Grimtalon",
      "Kenku",
      "Cis-Male",
      "Caravan Driver",
      "Caravan Template Assignment",
      "Tuesday, Friday",
      "Template Home Base"
    ],
    [
      "Elyndra Sunshade",
      "Dhampir",
      "Trans-Female",
      "Maintenance Worker",
      "Rail Template Assignment",
      "Wednesday only; rest-of-week assignment returns to prior rail line as needed",
      "Template Home Base"
    ],
    [
      "Vorro Chainhide",
      "Bugbear",
      "Demi-Male",
      "Train Conductor",
      "Rail Template Assignment",
      "Monday, Thursday, Saturday",
      "Template Home Base"
    ],
    [
      "Zephyra Glowtail",
      "Plasmoid",
      "Gender-Fluid",
      "Maintenance Worker",
      "Rail Template Assignment",
      "Monday, Thursday, Saturday",
      "Template Home Base"
    ],
    [
      "Kaevik Runecoil",
      "Gith",
      "Non-Binary",
      "Maintenance Worker",
      "Rail Template Assignment",
      "Wednesday only; rest-of-week assignment returns to prior rail line as needed",
      "Template Home Base"
    ],
    [
      "Nira Cloudstep",
      "Hadozee",
      "Cis-Female",
      "Maintenance Worker",
      "Rail Template Assignment",
      "Monday, Thursday, Saturday",
      "Template Home Base"
    ],
    [
      "Morvane Rotkeeper",
      "Satarre",
      "Agender",
      "Caravan Driver",
      "Caravan Template Assignment",
      "Monday, Thursday, Saturday",
      "Template Home Base"
    ],
    [
      "Pell Brightburrow",
      "Jerbeen",
      "Cis-Male",
      "Ferry Operator",
      "Ferry Template Assignment",
      "Tuesday, Friday",
      "Template Home Base"
    ],
    [
      "Xiv Shadowspark",
      "Shadow Goblin",
      "Poly-Gender",
      "Maintenance Worker",
      "Rail Template Assignment",
      "Wednesday only; rest-of-week assignment returns to prior rail line as needed",
      "Template Home Base"
    ],
    [
      "Aelene Frostwater",
      "Triton",
      "Demi-Female",
      "Maintenance Worker",
      "Rail Template Assignment",
      "Thursday, Saturday, Tuesday",
      "Template Home Base"
    ],
    [
      "Brakka Stonehide",
      "Bearfolk",
      "Cis-Male",
      "Skyship Helmsman",
      "Skyship Template Assignment",
      "Friday, Sunday",
      "Template Home Base"
    ],
    [
      "Orielle Bloomtide",
      "Dara",
      "Cis-Female",
      "Maintenance Worker",
      "Rail Template Assignment",
      "Wednesday only; rest-of-week assignment returns to prior rail line as needed",
      "Template Home Base"
    ],
    [
      "Varn Holloweye",
      "Darakhul",
      "Neutrois",
      "Caravan Driver",
      "Caravan Template Assignment",
      "Friday, Sunday",
      "Template Home Base"
    ],
    [
      "Selrix Quicksilver",
      "Quickstep",
      "Gender-Flexible",
      "Maintenance Worker",
      "Rail Template Assignment",
      "Wednesday only; rest-of-week assignment returns to prior rail line as needed",
      "Template Home Base"
    ],
    [
      "Thimble Wickerheart",
      "Wechselkind",
      "Gender-Less",
      "Maintenance Worker",
      "Rail Template Assignment",
      "Thursday, Saturday, Tuesday",
      "Template Home Base"
    ],
    [
      "Krynn Voidwalker",
      "Disembodied",
      "Agender",
      "Portal Operator",
      "Portal Template Assignment",
      "Thursday, Saturday, Tuesday",
      "Template Home Base"
    ],
    [
      "Raviel Duskrend",
      "Ravenfolk",
      "Trans-Male",
      "Maintenance Worker",
      "Rail Template Assignment",
      "Thursday, Saturday, Tuesday",
      "Template Home Base"
    ],
    [
      "Pyria Glowbranch",
      "Luma",
      "Cis-Female",
      "Caravan Driver",
      "Caravan Template Assignment",
      "Friday, Sunday",
      "Template Home Base"
    ],
    [
      "Mogruk Bonehammer",
      "Gnoll",
      "Cis-Male",
      "Skyship Cargo Master",
      "Skyship Template Assignment",
      "Thursday, Saturday, Tuesday",
      "Template Home Base"
    ],
    [
      "Sylven Ashglade",
      "Corvum",
      "Non-Binary",
      "Rail Navigator",
      "Rail Template Assignment",
      "Thursday, Saturday, Tuesday",
      "Template Home Base"
    ],
    [
      "Izzet Coilgear",
      "Warforged",
      "Gender-Less",
      "Maintenance Worker",
      "Rail Template Assignment",
      "Thursday, Saturday, Tuesday",
      "Template Home Base"
    ],
    [
      "Nethra Vinewhisper",
      "Verdan",
      "Demi-Female",
      "Caravan Driver",
      "Caravan Template Assignment",
      "Friday, Sunday",
      "Template Home Base"
    ],
    [
      "Vokar Reefscar",
      "Sahuagin",
      "Cis-Male",
      "Maintenance Worker",
      "Rail Template Assignment",
      "Friday, Sunday",
      "Template Home Base"
    ],
    [
      "Alune Starweaver",
      "Vulpin",
      "Trans-Female",
      "Station Host",
      "Rail Template Assignment",
      "Thursday, Saturday, Tuesday",
      "Template Home Base"
    ],
    [
      "Drevik Stormsnare",
      "Hobgoblin",
      "Bi-Gender",
      "Caravan Driver",
      "Caravan Template Assignment",
      "Friday, Sunday",
      "Template Home Base"
    ],
    [
      "Cyra Lanternmist",
      "Geppettin",
      "Gender-Fluid",
      "Maintenance Worker",
      "Rail Template Assignment",
      "Wednesday only; rest-of-week assignment returns to prior rail line as needed",
      "Template Home Base"
    ],
    [
      "Orryn Blackbriar",
      "Ratatosk",
      "Demi-Male",
      "Skyship Scout",
      "Skyship Template Assignment",
      "Thursday, Saturday, Tuesday",
      "Template Home Base"
    ]
  ],
  "timeConfig": {
    "earthTimeZone": "America/New_York",
    "earthLabel": "Player Earth Time (Eastern)",
    "universalDayEarthRatio": 0.9045,
    "earthDayUniversalRatio": 1.1056,
    "months": [
      "Thoryn-Rahek",
      "Freysethysra",
      "Nefarokir",
      "Thalunesh",
      "Horundar",
      "Raeshkul",
      "Asethrimir",
      "Sokhivar",
      "Iskazunet",
      "Bastve’enlil",
      "Hathruna"
    ],
    "weekdayMap": [
      "Valkhaday",
      "Nebday",
      "Sigranday",
      "Ishtaday",
      "Marduday",
      "Enkirday",
      "Anubaday"
    ],
    "earthWeekdayMap": [
      "Sunday → Valkhaday",
      "Monday → Nebday",
      "Tuesday → Sigranday",
      "Wednesday → Ishtaday",
      "Thursday → Marduday",
      "Friday → Enkirday",
      "Saturday → Anubaday"
    ],
    "driftBufferLabel": "Drift Buffer / 35-Day Ghost",
    "timeZones": [
      {
        "key": "prime",
        "label": "Prime Meridian / UTC+0 Bh",
        "offsetBelahours": 0
      },
      {
        "key": "utc_minus_10",
        "label": "World Zone UTC-10:00",
        "offsetBelahours": -10.0
      },
      {
        "key": "utc_minus_09",
        "label": "World Zone UTC-09:00",
        "offsetBelahours": -9.0
      },
      {
        "key": "utc_minus_08",
        "label": "World Zone UTC-08:00",
        "offsetBelahours": -8.0
      },
      {
        "key": "utc_minus_07",
        "label": "World Zone UTC-07:00",
        "offsetBelahours": -7.0
      },
      {
        "key": "utc_minus_06",
        "label": "World Zone UTC-06:00",
        "offsetBelahours": -6.0
      },
      {
        "key": "utc_minus_05",
        "label": "World Zone UTC-05:00",
        "offsetBelahours": -5.0
      },
      {
        "key": "utc_minus_04",
        "label": "World Zone UTC-04:00",
        "offsetBelahours": -4.0
      },
      {
        "key": "utc_minus_03",
        "label": "World Zone UTC-03:00",
        "offsetBelahours": -3.0
      },
      {
        "key": "utc_minus_02",
        "label": "World Zone UTC-02:00",
        "offsetBelahours": -2.0
      },
      {
        "key": "utc_minus_01",
        "label": "World Zone UTC-01:00",
        "offsetBelahours": -1.0
      },
      {
        "key": "utc_plus_01",
        "label": "World Zone UTC+01:00",
        "offsetBelahours": 1.0
      },
      {
        "key": "utc_plus_02",
        "label": "World Zone UTC+02:00",
        "offsetBelahours": 2.0
      },
      {
        "key": "utc_plus_03",
        "label": "World Zone UTC+03:00",
        "offsetBelahours": 3.0
      },
      {
        "key": "utc_plus_04",
        "label": "World Zone UTC+04:00",
        "offsetBelahours": 4.0
      },
      {
        "key": "utc_plus_05",
        "label": "World Zone UTC+05:00",
        "offsetBelahours": 5.0
      },
      {
        "key": "utc_plus_06",
        "label": "World Zone UTC+06:00",
        "offsetBelahours": 6.0
      },
      {
        "key": "utc_plus_07",
        "label": "World Zone UTC+07:00",
        "offsetBelahours": 7.0
      },
      {
        "key": "utc_plus_08",
        "label": "World Zone UTC+08:00",
        "offsetBelahours": 8.0
      },
      {
        "key": "utc_plus_09",
        "label": "World Zone UTC+09:00",
        "offsetBelahours": 9.0
      },
      {
        "key": "utc_plus_10",
        "label": "World Zone UTC+10:00",
        "offsetBelahours": 10.0
      }
    ]
  },
  "sourceSummary": "Generic reusable transit template. All loaded routes, province names, settlement names, route names, and route timing data have been removed."
};
TRANSIT_TEMPLATE.timeConfig.months = ['Iskanora','Nebrakhamesh','Sigraveig','Mardrimir','Enkithyr','Anundar','Freyzunet','Nefarokir','Thalunesh','Horundar','Setrimir'];
TRANSIT_TEMPLATE.timeConfig.weekdayMap = ['Monday','Tuesday','Wednesday — Rest Day','Thursday','Friday','Saturday','Sunday'];
TRANSIT_TEMPLATE.timeConfig.earthWeekdayMap = ['Monday → Monday','Tuesday → Tuesday','Wednesday → Wednesday Rest Day','Thursday → Thursday','Friday → Friday','Saturday → Saturday','Sunday → Sunday'];
const $=id=>document.getElementById(id);
const PAGES=[['home','Home'],['routes','Routes'],['fares','Fares'],['time','Time Board'],['rest','Wednesday Rules'],['employees','Employees'],['data','Data Notes']];
let activeMode='all';
function safe(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function titleCase(v){return String(v||'').replace(/(^|\s)\S/g,t=>t.toUpperCase());}
function pad(n){return String(n).padStart(2,'0');}
function selectedWorldZone(){const key=$('worldTimeZone')?.value||'prime';return TRANSIT_TEMPLATE.timeConfig.timeZones.find(z=>z.key===key)||TRANSIT_TEMPLATE.timeConfig.timeZones[0];}
function parseOffset(v){if(v==null)return 0;if(typeof v==='number')return Math.max(-12,Math.min(12,v));const m=String(v).match(/([+-]?\d{1,2})(?::?\d{2})?/);return m?Math.max(-12,Math.min(12,parseInt(m[1],10))):0;}
function findTZ(obj){if(!obj||typeof obj!=='object')return null;const keys=['timeZone','timezone','utcOffset','universalTimeZone','universal_timezone','settlementTimeZone','settlement_timezone'];for(const k of keys){if(obj[k]!=null)return obj[k];}for(const v of Object.values(obj)){const found=findTZ(v);if(found!=null)return found;}return null;}
function applyImportedTimezone(obj){const raw=findTZ(obj);if(raw==null)return;const off=parseOffset(raw);const zones=TRANSIT_TEMPLATE.timeConfig.timeZones;let closest=zones[0],best=999;zones.forEach(z=>{const d=Math.abs((z.offsetBelahours||0)-off);if(d<best){best=d;closest=z;}});$('worldTimeZone').value=closest.key;try{localStorage.setItem('ataWorldTimeZone',closest.key)}catch(e){} updateClock();}
const EASTERN_DATE_FORMATTER=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',weekday:'long',month:'long',day:'2-digit',year:'numeric'});
const EASTERN_TIME_FORMATTER=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',hour:'numeric',minute:'2-digit',second:'2-digit',timeZoneName:'short'});
const EASTERN_WEEKDAY_FORMATTER=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',weekday:'long'});
function universalFromEarth(date=new Date(),zone=selectedWorldZone()){
  const cfg=TRANSIT_TEMPLATE.timeConfig, earthMs=date.getTime(), belaDayMs=86400000*(cfg.universalDayEarthRatio||0.9045), epoch=Date.UTC(2026,0,1,0,0,0);
  const elapsed=earthMs-epoch, totalDays=Math.floor(elapsed/belaDayMs), dayProgress=((elapsed%belaDayMs)+belaDayMs)%belaDayMs/belaDayMs;
  const hoursFloat=(dayProgress*24+(zone.offsetBelahours||0)+24)%24, hour=Math.floor(hoursFloat), minute=Math.floor((hoursFloat-hour)*60), second=Math.floor((((hoursFloat-hour)*60)-minute)*60);
  const idx=((totalDays%330)+330)%330, month=cfg.months[Math.floor(idx/30)]||'Month', dayOfMonth=(idx%30)+1, weekday=cfg.weekdayMap[((totalDays%7)+7)%7]||'';
  const year=1+Math.floor(Math.max(0,totalDays)/330);return{hour,minute,second,month,dayOfMonth,weekday,year,totalDays};
}
function updateClock(){const now=new Date(), z=selectedWorldZone(), b=universalFromEarth(now,z);$('liveClock').textContent=EASTERN_TIME_FORMATTER.format(now);$('earthClockMeta').textContent=EASTERN_DATE_FORMATTER.format(now)+' • player-facing Eastern time';$('universalClock').textContent=`${pad(b.hour)}:${pad(b.minute)}:${pad(b.second)} Bh`;$('worldDate').textContent=`${b.weekday}, ${b.month} ${b.dayOfMonth}, Year ${b.year} • ${z.label}`;$('clockSyncStatus').textContent='Eastern and Universal displays share one live second-by-second update';const banner=$('serviceBanner');if(EASTERN_WEEKDAY_FORMATTER.format(now)==='Wednesday'){banner.textContent='Wednesday reduced-service rules active';banner.className='chip warn';}else{banner.textContent='Standard-service day';banner.className='chip now';}}
function startLiveClock(){updateClock();setTimeout(startLiveClock,1000-(Date.now()%1000)+8);}
function table(headers,rows){return `<table class="dataTable"><thead><tr>${headers.map(h=>`<th>${safe(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${safe(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;}
function renderLocalNav(){const nav=$('localNav');nav.innerHTML=PAGES.map(([id,label],i)=>`<button type="button" data-page="${id}" class="${i===0?'active':''}">${safe(label)}</button>`).join('')+'<span class="spacer"></span><button type="button" id="hideLocalNav">Hide Tabs</button>';nav.addEventListener('click',e=>{const b=e.target.closest('button[data-page]');if(!b)return;document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));document.querySelectorAll('#localNav button[data-page]').forEach(n=>n.classList.remove('active'));$('page-'+b.dataset.page).classList.add('active');b.classList.add('active');});$('hideLocalNav').addEventListener('click',()=>{document.body.classList.add('localNavHidden');try{localStorage.setItem('ataLocalNavHidden','1')}catch(e){}});$('showLocalNav').addEventListener('click',()=>{document.body.classList.remove('localNavHidden');try{localStorage.setItem('ataLocalNavHidden','0')}catch(e){}});try{if(localStorage.getItem('ataLocalNavHidden')==='1')document.body.classList.add('localNavHidden')}catch(e){}}
function renderModeChips(){const chips=$('modeChips');chips.innerHTML=TRANSIT_TEMPLATE.serviceModes.map(m=>`<span class="tag">${safe(m.label)}</span>`).join('');const filters=$('modeFilters');filters.innerHTML=`<button class="primaryBtn modeBtn active" data-mode="all" type="button">All</button>`+TRANSIT_TEMPLATE.serviceModes.map(m=>`<button class="primaryBtn modeBtn" data-mode="${safe(m.key)}" type="button">${safe(m.label)}</button>`).join('');filters.addEventListener('click',e=>{const b=e.target.closest('button[data-mode]');if(!b)return;activeMode=b.dataset.mode;document.querySelectorAll('.modeBtn').forEach(x=>x.classList.remove('active'));b.classList.add('active');$('selectedMode').textContent=activeMode==='all'?'All modes':titleCase(activeMode);runSearch();});}
function renderTemplates(){ $('templateCards').innerHTML=TRANSIT_TEMPLATE.routeTypeHeaders.map(t=>`<article class="card"><div class="panelHead"><h3>${safe(t.title)}</h3><span class="modeTag">${safe(t.mode)}</span></div><p class="note">${safe(t.disclaimer)}</p><div class="meta"><strong>Fare:</strong> ${safe(t.fare)}</div></article>`).join('');}
function renderFares(){ $('fareBox').innerHTML=TRANSIT_TEMPLATE.fares.map(f=>`<article class="card"><h3>${safe(f[0])}</h3><div class="meta"><strong>Public:</strong> ${safe(f[1])}</div><div class="meta"><strong>Private / Premium:</strong> ${safe(f[2])}</div><p class="note">${safe(f[3])}</p></article>`).join('');}
function renderEmployees(){ $('employeeTable').innerHTML=table(['Name','Race','Gender','Role','Assignment','Workdays','Home Base'],TRANSIT_TEMPLATE.employees);}
function renderWednesday(){ $('wednesdayTable').innerHTML=table(['Rule','Details'],TRANSIT_TEMPLATE.wednesday);}
function renderTimeConfig(){const cfg=TRANSIT_TEMPLATE.timeConfig;$('timeConfigCards').innerHTML=[`<article class="card"><h3>Earth Time</h3><p class="note">${safe(cfg.earthLabel||'Player Earth Time')} — America/New_York</p></article>`,`<article class="card"><h3>Universal Ratio</h3><p class="note">1 Universal day = ${safe(cfg.universalDayEarthRatio||0.9045)} Earth days. 1 Earth day = ${safe(cfg.earthDayUniversalRatio||1.1056)} Universal days.</p></article>`,`<article class="card"><h3>Calendar Months</h3><div class="scrollBox"><ol>${cfg.months.map(m=>`<li>${safe(m)}</li>`).join('')}</ol></div></article>`,`<article class="card"><h3>World Time Zones</h3><div class="scrollBox"><ol>${cfg.timeZones.map(z=>`<li>${safe(z.label)}</li>`).join('')}</ol></div></article>`].join('');}
function renderZoneOptions(){const sel=$('worldTimeZone');sel.innerHTML=TRANSIT_TEMPLATE.timeConfig.timeZones.map(z=>`<option value="${safe(z.key)}">${safe(z.label)}</option>`).join('');try{const saved=localStorage.getItem('ataWorldTimeZone');if(saved&&TRANSIT_TEMPLATE.timeConfig.timeZones.some(z=>z.key===saved))sel.value=saved;}catch(e){}sel.addEventListener('change',()=>{try{localStorage.setItem('ataWorldTimeZone',sel.value)}catch(e){}updateClock();});}
function runSearch(){const q=($('settlementSearch')?.value||'').toLowerCase().trim();const cards=[];TRANSIT_TEMPLATE.routeTypeHeaders.filter(t=>(activeMode==='all'||t.mode===activeMode)&&(!q||[t.title,t.mode,t.disclaimer,t.fare].join(' ').toLowerCase().includes(q))).forEach(t=>cards.push(`<article class="card"><h3>${safe(t.title)}</h3><div class="meta">Route type header</div><p class="note">${safe(t.disclaimer)}</p></article>`));TRANSIT_TEMPLATE.fares.filter(f=>(!q||f.join(' ').toLowerCase().includes(q))&&(activeMode==='all'||f.join(' ').toLowerCase().includes(activeMode))).forEach(f=>cards.push(`<article class="card"><h3>${safe(f[0])}</h3><div class="meta">${safe(f[1])} • ${safe(f[2])}</div></article>`));TRANSIT_TEMPLATE.employees.filter(e=>(activeMode==='all'||e.join(' ').toLowerCase().includes(activeMode))&&(!q||e.join(' ').toLowerCase().includes(q))).slice(0,24).forEach(e=>cards.push(`<article class="card"><h3>${safe(e[0])}</h3><div class="meta">${safe(e[3])} • ${safe(e[4])}</div><p class="note">Workdays: ${safe(e[5])}<br>Home: ${safe(e[6])}</p></article>`));if(!cards.length)cards.push('<div class="emptyState">No matching transit information found yet. Loaded route records can be added to the route database.</div>');$('results').innerHTML=cards.join('');$('resultCount').textContent=`${cards.length} result${cards.length===1?'':'s'}`;}
function installGlobalNav(){document.body.classList.add('bdg-has-global-nav');const page=(location.pathname.split('/').pop()||'transportation.html').toLowerCase();document.querySelectorAll('#bd-global-dropdown-nav .bdg-link').forEach(a=>{if((a.getAttribute('href')||'').toLowerCase()===page){a.classList.add('bdg-current');a.setAttribute('aria-current','page');}});function clamp(el,x,y){const r=el.getBoundingClientRect(),maxX=Math.max(0,innerWidth-r.width-8),maxY=Math.max(0,innerHeight-r.height-8);return{x:Math.min(Math.max(8,x),maxX),y:Math.min(Math.max(8,y),maxY)}}function restore(el,key,def){try{const p=JSON.parse(localStorage.getItem(key)||'null');if(p){el.style.left=p.x+'px';el.style.top=p.y+'px';el.style.right='auto';el.style.bottom='auto'}else if(def){Object.assign(el.style,def)}}catch(e){}}function drag(handle,el,key){let sx=0,sy=0,ox=0,oy=0;if(!handle||!el)return;handle.addEventListener('pointerdown',ev=>{const r=el.getBoundingClientRect();sx=ev.clientX;sy=ev.clientY;ox=r.left;oy=r.top;handle.setPointerCapture(ev.pointerId);ev.preventDefault()});handle.addEventListener('pointermove',ev=>{if(!handle.hasPointerCapture(ev.pointerId))return;const p=clamp(el,ox+ev.clientX-sx,oy+ev.clientY-sy);el.style.left=p.x+'px';el.style.top=p.y+'px';el.style.right='auto';el.style.bottom='auto'});handle.addEventListener('pointerup',ev=>{if(handle.hasPointerCapture(ev.pointerId))handle.releasePointerCapture(ev.pointerId);const r=el.getBoundingClientRect();try{localStorage.setItem(key,JSON.stringify({x:r.left,y:r.top}))}catch(e){}})}const nav=$('bd-global-dropdown-nav'),bubble=$('bd-nav-bubble');restore(nav,'bdgNavPos');restore(bubble,'bdgBubblePos',{left:'14px',bottom:'14px'});drag(document.querySelector('.bdg-drag-handle'),nav,'bdgNavPos');drag(document.querySelector('.bdg-bubble-core'),bubble,'bdgBubblePos');$('bdg-hide-nav').addEventListener('click',()=>{document.body.classList.add('bdg-nav-hidden');try{localStorage.setItem('bdgNavHidden','1')}catch(e){}});$('bdg-show-nav').addEventListener('click',()=>{document.body.classList.remove('bdg-nav-hidden');try{localStorage.setItem('bdgNavHidden','0')}catch(e){}});try{if(localStorage.getItem('bdgNavHidden')==='1')document.body.classList.add('bdg-nav-hidden')}catch(e){}}
function init(){installGlobalNav();renderLocalNav();renderZoneOptions();renderModeChips();renderTemplates();renderFares();renderEmployees();renderWednesday();renderTimeConfig();runSearch();$('searchBtn').addEventListener('click',runSearch);$('settlementSearch').addEventListener('input',runSearch);$('timeJson').addEventListener('change',async e=>{const f=e.target.files&&e.target.files[0];if(!f)return;try{applyImportedTimezone(JSON.parse(await f.text()));}catch(err){alert('That JSON could not be read for a timezone field.');}});startLiveClock();}
init();
