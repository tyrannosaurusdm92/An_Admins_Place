/* Genericized for AI-Brain capability use. Provenance group: world-life-simulation-a. */
(function(global){"use strict";
const WF=global.WorldBuilder;
const {createRng,fantasyName,fbm,hashNoise2d,pick,randomBetween,randomInt,shuffle,uniqueNames,xmur3}=WF.Random;
const CONTINENT_EDITOR_BASE_SURFACE = {
  id: "continent-editor-base",
  ageMa: 90,
  label: "Continent Editor Base Surface",
  texture: "./assets/textures/geologic_090ma.jpg",
  note: "Setting-neutral editable surface used to seed continent movement, painting, smoothing, coast shaping, terrain, and climate authoring."
};
const EPOCHS = { base: CONTINENT_EDITOR_BASE_SURFACE, 90: CONTINENT_EDITOR_BASE_SURFACE };

const BASE_PLATES = [
  { lon: -132, lat: 48, form: "Crescent" },
  { lon: -48, lat: 27, form: "Crown" },
  { lon: 38, lat: 48, form: "Reach" },
  { lon: 124, lat: 25, form: "Fan" },
  { lon: -104, lat: -31, form: "Stormhook" },
  { lon: -8, lat: -34, form: "Rift" },
  { lon: 101, lat: -43, form: "Horseshoe" }
];

const CLIMATES = [
  "humid monsoon forest and storm coast",
  "temperate fernwood, peatland, and river plain",
  "seasonal savanna, dry upland, and inland basin",
  "tropical rainforest, mangrove, and reef coast",
  "cool maritime conifer forest and tundra bog",
  "high plateau, rain shadow, and volcanic valley",
  "warm coastal forest, broad delta, and lagoon belt"
];

const GEOLOGIES = [
  "continent-continent collision arc",
  "rifted shield and volcanic plateau",
  "subduction coast with an offshore trench",
  "fold belt, foreland basin, and broad shelf",
  "transform valleys and pull-apart lakes",
  "island-arc collision and accreted terranes",
  "uplifted craton cut by long river systems"
];

const ENERGY_SYSTEMS = [
  "coal-fired steam and direct-current dynamos",
  "hydroelectric turbines and electrified rail",
  "geothermal boilers and copper-grid substations",
  "tidal barrages and compressed-air works",
  "peat, biomass, steam engines, and telegraph batteries",
  "volcanic heat exchangers and arc-lamp districts",
  "river turbines, flywheel storage, and tram grids"
];

const CITY_TYPES = ["Capital", "Metropolis", "Industrial City", "Rail City", "Port", "Airship City", "Canal City"];
const ROUTE_COLORS = {
  rail: "rgba(239, 184, 93, 0.62)",
  steamship: "rgba(96, 217, 232, 0.48)",
  airship: "rgba(214, 152, 255, 0.42)",
  telegraph: "rgba(255, 225, 155, 0.30)",
  submarine: "rgba(71, 224, 231, 0.66)",
  seafloor_rail: "rgba(151, 244, 230, 0.70)",
  bathysphere: "rgba(104, 160, 255, 0.58)",
  canal: "rgba(115, 220, 203, 0.52)"
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function smoothstep(edge0, edge1, value) {
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function wrapLongitude(lon) {
  let result = lon;
  while (result < -180) result += 360;
  while (result >= 180) result -= 360;
  return result;
}

function longitudeDelta(a, b) {
  return wrapLongitude(a - b);
}

function lonLatToPixel(lon, lat, width, height) {
  return {
    x: ((wrapLongitude(lon) + 180) / 360) * width,
    y: ((90 - clamp(lat, -90, 90)) / 180) * height
  };
}

function bilinearSample(data, width, height, lon, lat) {
  let x = ((wrapLongitude(lon) + 180) / 360) * width;
  let y = ((90 - clamp(lat, -89.999, 89.999)) / 180) * height;
  x = ((x % width) + width) % width;
  y = clamp(y, 0, height - 1.001);

  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = (x0 + 1) % width;
  const y1 = Math.min(height - 1, y0 + 1);
  const tx = x - x0;
  const ty = y - y0;

  const i00 = (y0 * width + x0) * 4;
  const i10 = (y0 * width + x1) * 4;
  const i01 = (y1 * width + x0) * 4;
  const i11 = (y1 * width + x1) * 4;

  const out = [0, 0, 0, 255];
  for (let channel = 0; channel < 3; channel += 1) {
    const top = data[i00 + channel] + (data[i10 + channel] - data[i00 + channel]) * tx;
    const bottom = data[i01 + channel] + (data[i11 + channel] - data[i01 + channel]) * tx;
    out[channel] = top + (bottom - top) * ty;
  }
  return out;
}

function seededNumber(seedText) {
  return xmur3(String(seedText))();
}

function loadImage(src) {
  src = WF.TextureData?.[src] || src;
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Unable to load image: ${src}`));
    image.src = src;
  });
}

function nearestPlateData(lon, lat, plates) {
  const distances = [];
  const cosLat = Math.max(0.2, Math.cos((lat * Math.PI) / 180));
  for (let i = 0; i < plates.length; i += 1) {
    const plate = plates[i];
    const dx = longitudeDelta(lon, plate.outputLon) * cosLat;
    const dy = lat - plate.outputLat;
    distances.push({ index: i, distance: Math.hypot(dx, dy) });
  }
  distances.sort((a, b) => a.distance - b.distance);
  return { first: distances[0], second: distances[1] };
}

function inversePlateTransform(lon, lat, plate) {
  const outCos = Math.max(0.28, Math.cos((plate.outputLat * Math.PI) / 180));
  const srcCos = Math.max(0.28, Math.cos((plate.sourceLat * Math.PI) / 180));
  const x = longitudeDelta(lon, plate.outputLon) * outCos;
  const y = lat - plate.outputLat;
  const angle = (-plate.rotation * Math.PI) / 180;
  const xr = x * Math.cos(angle) - y * Math.sin(angle);
  const yr = x * Math.sin(angle) + y * Math.cos(angle);
  return {
    lon: wrapLongitude(plate.sourceLon + xr / srcCos),
    lat: clamp(plate.sourceLat + yr, -89.5, 89.5)
  };
}

function blendedSourceCoordinate(lon, lat, plates, nearest) {
  const a = plates[nearest.first.index];
  const b = plates[nearest.second.index];
  const pa = inversePlateTransform(lon, lat, a);
  const pb = inversePlateTransform(lon, lat, b);
  const separation = nearest.second.distance - nearest.first.distance;
  const weightA = 0.5 + 0.5 * smoothstep(0, 13, separation);
  let lonB = pb.lon;
  while (lonB - pa.lon > 180) lonB -= 360;
  while (lonB - pa.lon < -180) lonB += 360;
  return {
    lon: wrapLongitude(pa.lon * weightA + lonB * (1 - weightA)),
    lat: pa.lat * weightA + pb.lat * (1 - weightA),
    edge: Math.exp(-Math.pow(separation / 8.5, 2)),
    plateA: nearest.first.index,
    plateB: nearest.second.index
  };
}

function boundaryKind(a, b, seed) {
  const low = Math.min(a, b);
  const high = Math.max(a, b);
  const value = hashNoise2d(low * 41 + high * 17, high * 67 + low * 13, seed);
  if (value < 0.44) return "collision";
  if (value < 0.75) return "divergent";
  return "transform";
}

function isSourceWater(r, g, b, seaLevel) {
  const score = b - r * 0.72 - g * 0.31;
  const cyanShelf = b > 135 && g > 105 && r < 130 && b >= g * 0.9;
  const threshold = 17 - seaLevel / 45;
  return score > threshold || cyanShelf;
}

function createPlateRegistry(rng, options) {
  const displacement = options.displacement / 100;
  const continentNames = uniqueNames(rng, 7);
  const plateOrder = shuffle(rng, BASE_PLATES);
  return plateOrder.map((base, index) => {
    const maxLonShift = 8 + 58 * displacement;
    const maxLatShift = 4 + 25 * displacement;
    const sourceLon = base.lon + randomBetween(rng, -8, 8);
    const sourceLat = base.lat + randomBetween(rng, -6, 6);
    const outputLon = wrapLongitude(sourceLon + randomBetween(rng, -maxLonShift, maxLonShift));
    const outputLat = clamp(sourceLat + randomBetween(rng, -maxLatShift, maxLatShift), -66, 70);
    const rotation = randomBetween(rng, -42, 42) * displacement;
    return {
      id: `plate-${index + 1}`,
      name: `${continentNames[index]} ${base.form}`,
      sourceLon,
      sourceLat,
      outputLon,
      outputLat,
      rotation,
      climate: pick(rng, CLIMATES),
      geology: pick(rng, GEOLOGIES),
      energy: pick(rng, ENERGY_SYSTEMS),
      areaMillionKm2: Number(randomBetween(rng, 8.5, 28.5).toFixed(1))
    };
  });
}

function continentBiomeColor(lat, moisture, heat, fantasy) {
  const absLat = Math.abs(lat);
  let r;
  let g;
  let b;
  if (absLat < 18) {
    r = 47 + 32 * (1 - moisture);
    g = 112 + 72 * moisture;
    b = 62 + 25 * fantasy;
  } else if (absLat < 34) {
    if (moisture < 0.42) {
      r = 150 + 38 * heat;
      g = 119 + 35 * moisture;
      b = 66 + 20 * fantasy;
    } else {
      r = 68 + 34 * heat;
      g = 126 + 47 * moisture;
      b = 72 + 22 * fantasy;
    }
  } else if (absLat < 60) {
    r = 72 + 35 * (1 - moisture);
    g = 113 + 54 * moisture;
    b = 70 + 20 * fantasy;
  } else {
    r = 82 + 38 * heat;
    g = 102 + 36 * moisture;
    b = 82 + 17 * fantasy;
  }
  if (fantasy > 0) {
    r += 18 * fantasy * (0.5 - moisture);
    b += 34 * fantasy * moisture;
  }
  return [r, g, b];
}

function oceanColor(depth, lat, fantasy) {
  const shallow = clamp(1 - Math.abs(depth) / 6000, 0, 1);
  const polar = smoothstep(50, 86, Math.abs(lat));
  let r = 6 + 22 * shallow + 8 * polar;
  let g = 50 + 98 * shallow + 18 * fantasy;
  let b = 83 + 105 * shallow + 22 * fantasy;
  if (depth < -7000) {
    r *= 0.55;
    g *= 0.65;
    b *= 0.78;
  }
  return [r, g, b];
}

function blendColor(a, b, t) {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t
  ];
}

function sampleHeight(heightMap, width, height, lon, lat) {
  const pixel = lonLatToPixel(lon, lat, width, height);
  const x0 = Math.floor(pixel.x) % width;
  const y0 = clamp(Math.floor(pixel.y), 0, height - 1);
  return heightMap[y0 * width + x0];
}

function isCoastal(heightMap, width, height, lon, lat) {
  if (sampleHeight(heightMap, width, height, lon, lat) <= 0) return false;
  const offsets = [
    [3, 0], [-3, 0], [0, 3], [0, -3], [5, 2], [-5, -2]
  ];
  return offsets.some(([dx, dy]) => sampleHeight(heightMap, width, height, lon + dx, lat + dy) <= 0);
}

function generateCities(rng, world, heightMap, width, height, options) {
  const target = Math.round(14 + options.industry * 0.3);
  const perPlate = new Array(world.continents.length).fill(2);
  for (let i = perPlate.reduce((a, b) => a + b, 0); i < target; i += 1) {
    perPlate[i % perPlate.length] += 1;
  }

  const cityNames = uniqueNames(rng, target + 10);
  const cities = [];
  let nameIndex = 0;

  world.continents.forEach((plate, plateIndex) => {
    const count = perPlate[plateIndex];
    for (let localIndex = 0; localIndex < count; localIndex += 1) {
      let lon = plate.outputLon;
      let lat = plate.outputLat;
      let found = false;
      for (let attempt = 0; attempt < 240; attempt += 1) {
        const radiusLon = localIndex === 0 ? 14 : 39;
        const radiusLat = localIndex === 0 ? 10 : 25;
        lon = wrapLongitude(plate.outputLon + randomBetween(rng, -radiusLon, radiusLon));
        lat = clamp(plate.outputLat + randomBetween(rng, -radiusLat, radiusLat), -72, 72);
        const elevation = sampleHeight(heightMap, width, height, lon, lat);
        if (elevation > 35 && elevation < 4200) {
          found = true;
          break;
        }
      }
      if (!found) {
        for (let attempt = 0; attempt < 500; attempt += 1) {
          lon = randomBetween(rng, -180, 180);
          lat = randomBetween(rng, -68, 68);
          if (sampleHeight(heightMap, width, height, lon, lat) > 25) break;
        }
      }

      const coastal = isCoastal(heightMap, width, height, lon, lat);
      let type = localIndex === 0 ? "Capital" : pick(rng, CITY_TYPES.slice(1));
      if (coastal && localIndex !== 0 && rng() < 0.58) type = "Port";
      const basePopulation = type === "Capital" ? randomBetween(rng, 180000, 920000) : randomBetween(rng, 18000, 430000);
      const population = Math.round(basePopulation * (0.55 + options.industry / 100));
      const city = {
        id: `city-${cities.length + 1}`,
        name: cityNames[nameIndex++],
        type,
        continentId: plate.id,
        continent: plate.name,
        lon: Number(lon.toFixed(4)),
        lat: Number(lat.toFixed(4)),
        elevationM: Math.round(sampleHeight(heightMap, width, height, lon, lat)),
        population,
        coastal,
        power: pick(rng, ENERGY_SYSTEMS),
        specialty: pick(rng, [
          "locomotive works", "copper foundries", "airship yards", "tidal engineering", "glass telegraph insulators",
          "mechanical computation", "ironclad construction", "pressure medicine", "arc-light manufacture", "canal turbines"
        ])
      };
      cities.push(city);
    }
  });
  return cities;
}

function greatCircleDistance(a, b) {
  const toRad = Math.PI / 180;
  const lat1 = a.lat * toRad;
  const lat2 = b.lat * toRad;
  const dLat = (b.lat - a.lat) * toRad;
  const dLon = longitudeDelta(b.lon, a.lon) * toRad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function generateRoutes(rng, world, cities) {
  const routes = [];
  const byContinent = new Map();
  cities.forEach((city) => {
    if (!byContinent.has(city.continentId)) byContinent.set(city.continentId, []);
    byContinent.get(city.continentId).push(city);
  });

  for (const continentCities of byContinent.values()) {
    const capital = continentCities.find((city) => city.type === "Capital") || continentCities[0];
    continentCities.forEach((city) => {
      if (city.id === capital.id) return;
      routes.push({
        id: `route-${routes.length + 1}`,
        from: capital.id,
        to: city.id,
        mode: city.coastal && capital.coastal && rng() < 0.32 ? "steamship" : "rail",
        distanceKm: Math.round(greatCircleDistance(capital, city))
      });
    });
  }

  const capitals = cities.filter((city) => city.type === "Capital").sort((a, b) => a.lon - b.lon);
  for (let i = 0; i < capitals.length; i += 1) {
    const from = capitals[i];
    const to = capitals[(i + 1) % capitals.length];
    routes.push({
      id: `route-${routes.length + 1}`,
      from: from.id,
      to: to.id,
      mode: from.coastal && to.coastal && rng() < 0.55 ? "steamship" : "airship",
      distanceKm: Math.round(greatCircleDistance(from, to))
    });
  }

  capitals.forEach((from, index) => {
    const to = capitals[(index + 2) % capitals.length];
    routes.push({
      id: `route-${routes.length + 1}`,
      from: from.id,
      to: to.id,
      mode: "telegraph",
      distanceKm: Math.round(greatCircleDistance(from, to))
    });
  });

  return routes;
}

function drawWrappedLine(ctx, from, to, width, height, color, lineWidth, dash = []) {
  const a = lonLatToPixel(from.lon, from.lat, width, height);
  const b = lonLatToPixel(to.lon, to.lat, width, height);
  let bx = b.x;
  if (bx - a.x > width / 2) bx -= width;
  if (bx - a.x < -width / 2) bx += width;

  const curvature = Math.min(85, Math.abs(bx - a.x) * 0.12 + Math.abs(b.y - a.y) * 0.08);
  const midX = (a.x + bx) / 2;
  const midY = (a.y + b.y) / 2 - curvature;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.setLineDash(dash);
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.quadraticCurveTo(midX, midY, bx, b.y);
  ctx.stroke();
  if (bx < 0 || bx >= width) {
    ctx.beginPath();
    ctx.moveTo(a.x + (bx < 0 ? -width : width), a.y);
    ctx.quadraticCurveTo(midX + (bx < 0 ? -width : width), midY, b.x, b.y);
    ctx.stroke();
  }
  ctx.restore();
}

function renderIndustryOverlay(canvas, world) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const cityMap = new Map((world.settlements || world.cities).map((city) => [city.id, city]));

  world.routes.forEach((route) => {
    const from = cityMap.get(route.from);
    const to = cityMap.get(route.to);
    if (!from || !to) return;
    const dash = route.mode === "airship" ? [8, 7] : route.mode === "telegraph" ? [2, 5] : [];
    drawWrappedLine(ctx, from, to, canvas.width, canvas.height, ROUTE_COLORS[route.mode], route.mode === "rail" ? 1.15 : 0.9, dash);
  });

  (world.settlements || world.cities).forEach((city) => {
    const p = lonLatToPixel(city.lon, city.lat, canvas.width, canvas.height);
    const radius = city.type === "Capital" ? 3.1 : city.type === "Metropolis" ? 2.4 : 1.7;
    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius * 4.2);
    gradient.addColorStop(0, "rgba(255, 244, 197, 0.98)");
    gradient.addColorStop(0.22, "rgba(255, 188, 76, 0.88)");
    gradient.addColorStop(1, "rgba(255, 137, 46, 0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius * 4.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = city.elevationM < 0 ? "#7ff7ee" : (city.type === "Capital" ? "#fff3be" : "#ffc267");
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx.fill();
  });
}


function generateOceanSettlements(rng, world, heightMap, width, height, options) {
  const target = Math.max(8, Math.round(7 + options.industry * 0.16 + options.fantasy * 0.05));
  const names = uniqueNames(rng, target + 4);
  const environments = ["Underwater with Reefs", "Underwater without Reefs", "Trench Wall City", "Hydrothermal Vent Settlement", "Submarine Canyon City", "Ocean Surface Floating Settlement"];
  const settlements = [];
  for (let i = 0; i < target; i += 1) {
    const environment = environments[i % environments.length];
    const floating = environment.includes("Surface");
    let lon = 0, lat = 0, elevationM = -1200;
    for (let attempt = 0; attempt < 2500; attempt += 1) {
      lon = randomBetween(rng, -180, 180); lat = randomBetween(rng, -72, 72);
      elevationM = sampleHeight(heightMap, width, height, lon, lat);
      const valid = floating ? elevationM < -60 && elevationM > -2400 :
        environment.includes("Trench") ? elevationM < -4800 :
        environment.includes("Reefs") ? elevationM < -40 && elevationM > -900 : elevationM < -700 && elevationM > -7200;
      if (valid) break;
    }
    const oceanIndex = Math.floor(((wrapLongitude(lon) + 180) / 360) * world.oceans.length) % world.oceans.length;
    settlements.push({
      id: `ocean-settlement-${i + 1}`, name: names[i], type: floating ? "Floating Ocean City" : (i % 5 === 0 ? "Seafloor Capital" : "Underwater Settlement"),
      environment, oceanId: world.oceans[oceanIndex].id, ocean: world.oceans[oceanIndex].name,
      lon: +lon.toFixed(4), lat: +lat.toFixed(4), elevationM: floating ? 12 : Math.round(elevationM),
      seafloorDepthM: Math.max(0, Math.round(-elevationM)), population: Math.round(randomBetween(rng, 8000, 260000) * (0.55 + options.industry / 100)),
      coastal: false, reef: environment.includes("Reefs"), districtCount: 5 + Math.floor(rng() * 8),
      power: pick(rng, ["geothermal vent turbines", "tidal dynamos and pressure batteries", "surface cable and steam accumulator", "thermal-gradient engines", "submarine hydroelectric turbines"]),
      specialty: pick(rng, ["pressure-dome construction", "reef horticulture", "submersible yards", "abyssal mining", "bioluminescent glass", "deep-sea telegraph relays", "vent chemistry"])
    });
  }
  return settlements;
}

function connectOceanRoutes(rng, world) {
  const all = world.cities.concat(world.oceanSettlements);
  const coastal = world.cities.filter(c => c.coastal);
  for (const settlement of world.oceanSettlements) {
    const candidates = coastal.length ? coastal : world.cities;
    const nearest = candidates.slice().sort((a,b)=>greatCircleDistance(settlement,a)-greatCircleDistance(settlement,b))[0];
    if (nearest) world.routes.push({id:`route-${world.routes.length+1}`,from:nearest.id,to:settlement.id,mode:settlement.environment.includes("Surface")?"steamship":"submarine",distanceKm:Math.round(greatCircleDistance(nearest,settlement))});
  }
  const submerged = world.oceanSettlements.filter(s=>!s.environment.includes("Surface"));
  submerged.forEach((from,i)=>{const to=submerged[(i+1)%submerged.length];if(to&&to!==from)world.routes.push({id:`route-${world.routes.length+1}`,from:from.id,to:to.id,mode:i%3===0?"seafloor_rail":"bathysphere",distanceKm:Math.round(greatCircleDistance(from,to))});});
  return all;
}

function renderSeafloorCanvas(canvas, heightMap, width, height) {
  const ctx = canvas.getContext("2d"); const image = ctx.createImageData(width,height);
  for (let i=0;i<heightMap.length;i++) { const h=heightMap[i], o=i*4; let c;
    if(h>=0)c=[24,34,30]; else {const d=Math.min(1,Math.abs(h)/11000), shelf=Math.max(0,1-Math.abs(h)/1800);c=[Math.round(14+42*shelf),Math.round(44+76*shelf-22*d),Math.round(55+78*shelf-16*d)]; if(h<-6500)c=[16,20,37];}
    image.data[o]=c[0];image.data[o+1]=c[1];image.data[o+2]=c[2];image.data[o+3]=255;
  }
  ctx.putImageData(image,0,0);ctx.save();ctx.globalAlpha=.28;ctx.strokeStyle="#9be8df";ctx.lineWidth=.55;
  for(const depth of [200,1000,2000,4000,6000,8000]){ctx.beginPath();for(let y=1;y<height-1;y+=3)for(let x=1;x<width-1;x+=3){const idx=y*width+x;if(Math.abs(Math.abs(heightMap[idx])-depth)<95)ctx.rect(x,y,.7,.7);}ctx.stroke();}
  ctx.restore();
}

function generateWorldName(rng) {
  const epithets = [
    "Aetherworld", "Ocean World", "Twin-Tide Sphere", "Sky-Crowned World", "Living World", "Starbound Sphere"
  ];
  return `${fantasyName(rng)} — ${pick(rng, epithets)}`;
}

class WorldGenerator {
  constructor({ worldCanvas, industryCanvas, cloudCanvas, seafloorCanvas }) {
    this.worldCanvas = worldCanvas;
    this.industryCanvas = industryCanvas;
    this.cloudCanvas = cloudCanvas;
    this.seafloorCanvas = seafloorCanvas;
    this.imageCache = new Map();
    this.sourceCanvas = document.createElement("canvas");
    this.cloudSource = null;
  }

  async getImage(src) {
    if (!this.imageCache.has(src)) this.imageCache.set(src, loadImage(src));
    return this.imageCache.get(src);
  }

  async generate(options, onProgress = () => {}) {
    const epoch = EPOCHS[options.epoch] || EPOCHS.base;
    const rng = createRng(`${options.seed}|${options.epoch}|${options.displacement}|${options.fantasy}`);
    const seedNumber = seededNumber(options.seed);

    onProgress("Loading Continent Editor base surface");
    const [sourceImage, cloudImage] = await Promise.all([
      this.getImage(epoch.texture),
      this.getImage("./assets/textures/clouds.png")
    ]);

    this.sourceCanvas.width = sourceImage.naturalWidth || sourceImage.width;
    this.sourceCanvas.height = sourceImage.naturalHeight || sourceImage.height;
    const sourceCtx = this.sourceCanvas.getContext("2d", { willReadFrequently: true });
    sourceCtx.drawImage(sourceImage, 0, 0);
    const sourceData = sourceCtx.getImageData(0, 0, this.sourceCanvas.width, this.sourceCanvas.height).data;

    const width = this.worldCanvas.width;
    const height = this.worldCanvas.height;
    const ctx = this.worldCanvas.getContext("2d", { willReadFrequently: true });
    const imageData = ctx.createImageData(width, height);
    const heightMap = new Float32Array(width * height);
    const landMask = new Uint8Array(width * height);
    const continents = createPlateRegistry(rng, options);
    const fantasy = options.fantasy / 100;
    const relief = 0.35 + options.relief / 82;

    onProgress("Rearranging continental plate regions");
    for (let y = 0; y < height; y += 1) {
      const lat = 90 - ((y + 0.5) / height) * 180;
      for (let x = 0; x < width; x += 1) {
        const lon = ((x + 0.5) / width) * 360 - 180;
        const nearest = nearestPlateData(lon, lat, continents);
        const sourceCoordinate = blendedSourceCoordinate(lon, lat, continents, nearest);
        const sample = bilinearSample(
          sourceData,
          this.sourceCanvas.width,
          this.sourceCanvas.height,
          sourceCoordinate.lon,
          sourceCoordinate.lat
        );

        const waterFromSource = isSourceWater(sample[0], sample[1], sample[2], options.seaLevel);
        const broadNoise = fbm((lon + 180) / 46, (lat + 90) / 46, seedNumber, 5);
        const detailNoise = fbm((lon + 180) / 15, (lat + 90) / 15, seedNumber + 991, 4);
        const climateNoise = fbm((lon + 180) / 68, (lat + 90) / 68, seedNumber + 1881, 4);
        const kind = boundaryKind(sourceCoordinate.plateA, sourceCoordinate.plateB, seedNumber);
        const edge = sourceCoordinate.edge;

        let elevation;
        if (waterFromSource) {
          const brightness = (sample[0] + sample[1] + sample[2]) / 3;
          const shelf = clamp((brightness - 48) / 145, 0, 1);
          elevation = -520 - (1 - shelf) * 5200 - 900 * detailNoise;
          if (kind === "divergent") elevation += edge * (1900 + 800 * detailNoise) * relief;
          if (kind === "collision") elevation -= edge * (2300 + 1700 * detailNoise) * relief;
        } else {
          elevation = 110 + 1450 * broadNoise ** 2 + 650 * detailNoise;
          if (kind === "collision") elevation += edge * (2700 + 2300 * detailNoise) * relief;
          if (kind === "divergent") elevation += edge * (350 + 750 * detailNoise) * relief;
          if (kind === "transform") elevation += edge * (180 + 520 * detailNoise) * relief;
          if (Math.abs(lat) > 62) elevation *= 0.72;
        }

        elevation -= options.seaLevel;
        elevation = clamp(elevation, -11000, 8200);
        const isLand = elevation > 0;
        const index = y * width + x;
        heightMap[index] = elevation;
        landMask[index] = isLand ? 1 : 0;

        let color;
        if (isLand) {
          const heat = clamp(1 - Math.abs(lat) / 86, 0, 1);
          const moisture = clamp(0.16 + 0.76 * climateNoise + (waterFromSource ? 0.15 : 0), 0, 1);
          const biome = continentBiomeColor(lat, moisture, heat, fantasy);
          const sourceLand = [sample[0], sample[1], sample[2]];
          color = blendColor(sourceLand, biome, 0.52 + fantasy * 0.22);
          if (elevation > 3300) {
            const rock = [116, 105, 91];
            color = blendColor(color, rock, clamp((elevation - 3300) / 3100, 0, 0.82));
          }
          if (Math.abs(lat) > 68) {
            color = blendColor(color, [92, 111, 90], 0.38);
          }
        } else {
          color = oceanColor(elevation, lat, fantasy);
          color = blendColor([sample[0], sample[1], sample[2]], color, 0.62);
        }

        const outIndex = index * 4;
        imageData.data[outIndex] = clamp(color[0], 0, 255);
        imageData.data[outIndex + 1] = clamp(color[1], 0, 255);
        imageData.data[outIndex + 2] = clamp(color[2], 0, 255);
        imageData.data[outIndex + 3] = 255;
      }
      if (y % 64 === 0) await new Promise((resolve) => requestAnimationFrame(resolve));
    }

    onProgress("Sculpting continuous terrain and bathymetry");
    const shaded = new Uint8ClampedArray(imageData.data);
    const reliefScale = 0.23 + options.relief / 145;
    for (let y = 1; y < height - 1; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const index = y * width + x;
        const left = heightMap[y * width + ((x - 1 + width) % width)];
        const right = heightMap[y * width + ((x + 1) % width)];
        const up = heightMap[(y - 1) * width + x];
        const down = heightMap[(y + 1) * width + x];
        const dx = (right - left) / 2200;
        const dy = (down - up) / 2200;
        const nx = -dx * reliefScale;
        const ny = -dy * reliefScale;
        const nz = 1;
        const length = Math.hypot(nx, ny, nz);
        const light = clamp((nx * -0.46 + ny * -0.34 + nz * 0.82) / length, -1, 1);
        let shade = 0.77 + 0.34 * light;
        if (heightMap[index] < 0) shade *= 0.93 + 0.08 * clamp(1 + heightMap[index] / 9000, 0, 1);
        const outIndex = index * 4;
        shaded[outIndex] = clamp(shaded[outIndex] * shade, 0, 255);
        shaded[outIndex + 1] = clamp(shaded[outIndex + 1] * shade, 0, 255);
        shaded[outIndex + 2] = clamp(shaded[outIndex + 2] * shade, 0, 255);
      }
    }
    imageData.data.set(shaded);
    ctx.putImageData(imageData, 0, 0);

    onProgress("Building terrain-linked settlement and transit networks");
    const oceanNames = uniqueNames(rng, 5, ["Ocean", "Deep", "Sea"]);
    const galaxyState = window.WorldBuilderGalaxy && WorldBuilderGalaxy.getState ? WorldBuilderGalaxy.getState() : null;
    const mainPlanet = galaxyState && galaxyState.system && galaxyState.system.planets.find((planet) => planet.isMainWorld);
    const mainMoons = mainPlanet && Array.isArray(mainPlanet.moons) ? mainPlanet.moons.slice(0, 3) : [];
    const world = {
      schemaVersion: "3.0",
      generator: "WorldBuilder Setting-Agnostic Terrain Generator",
      seed: options.seed,
      layoutLock: {
        mode: "setting-agnostic-continent-editor",
        availableBaseSurfaces: ["continent-editor-base"],
        selectedBaseSurface: epoch.id,
        continentalPlacementChanges: true,
        modernEarthBasemapAllowed: false,
        rule: "The Continent Editor base surface seeds terrain, after which controlled plate displacement, rotation, terrain, climate, settlement, era, magic, and technology rules are applied."
      },
      name: generateWorldName(rng),
      epoch,
      generatedAt: new Date().toISOString(),
      planet: {
        radiusKm: 6371,
        gravityG: 1,
        axialTiltDeg: 23.44,
        dayHours: 24,
        climate: "generated from the selected planet and climate profile",
        permanentSurfaceIce: false,
        atmosphere: "Earth-like nitrogen-oxygen atmosphere",
        industrialStage: "project era profile"
      },
      lunarSystem: {
        moonCount: Math.max(1, Math.min(3, mainMoons.length || 2)),
        moons: mainMoons.map((moon) => ({ id: moon.id, name: moon.name, radiusKm: moon.radiusKm, orbitKm: moon.orbitKm, retrograde: !!moon.retrograde })),
        behavior: mainMoons.length === 1 ? "single dominant lunar tide" : (mainMoons.length === 3 ? "three-body compound tide with shifting spring and neap alignments" : "two-body compound tide with beat modulation"),
        tidalAmplification: options.tides / 100
      },
      generationOptions: { ...options },
      continents,
      oceans: oceanNames.map((name, index) => ({
        id: `ocean-${index + 1}`,
        name,
        character: pick(rng, [
          "warm western-boundary current and cyclone corridor",
          "equatorial upwelling and reef-rich shelves",
          "stormy open-polar gateway and deep-water formation",
          "archipelago basin with severe compound tides",
          "broad world ocean with long steamship passages"
        ])
      })),
      cities: [],
      oceanSettlements: [],
      settlements: [],
      provinces: [],
      routes: [],
      features: {}
    };

    world.cities = generateCities(rng, world, heightMap, width, height, options);
    world.oceanSettlements = generateOceanSettlements(rng, world, heightMap, width, height, options);
    world.settlements = world.cities.concat(world.oceanSettlements);
    world.routes = generateRoutes(rng, world, world.cities);
    connectOceanRoutes(rng, world);
    const moduleContext = WF.makeModuleContext({ world, rng, options, heightMap, width, height });
    WF.applyRegisteredModules(world, moduleContext);
    world.statistics = {
      landPercent: Number((100 * landMask.reduce((sum, value) => sum + value, 0) / landMask.length).toFixed(1)),
      cityCount: world.cities.length,
      oceanSettlementCount: world.oceanSettlements.length,
      settlementCount: world.settlements.length,
      provinceCount: world.provinces.length,
      routeCount: world.routes.length,
      electrifiedRouteCount: world.routes.filter((route) => route.mode === "rail" || route.mode === "telegraph").length,
      coastalCityCount: world.cities.filter((city) => city.coastal).length,
      averageElevationM: Math.round(heightMap.reduce((sum, value) => sum + value, 0) / heightMap.length)
    };

    renderSeafloorCanvas(this.seafloorCanvas, heightMap, width, height);
    renderIndustryOverlay(this.industryCanvas, world);

    const cloudCtx = this.cloudCanvas.getContext("2d");
    cloudCtx.clearRect(0, 0, this.cloudCanvas.width, this.cloudCanvas.height);
    cloudCtx.globalAlpha = 0.74;
    cloudCtx.drawImage(cloudImage, 0, 0, this.cloudCanvas.width, this.cloudCanvas.height);
    cloudCtx.globalCompositeOperation = "screen";
    cloudCtx.fillStyle = `rgba(135, 215, 220, ${0.035 + options.tides / 2500})`;
    cloudCtx.fillRect(0, 0, this.cloudCanvas.width, this.cloudCanvas.height);
    cloudCtx.globalCompositeOperation = "source-over";
    cloudCtx.globalAlpha = 1;

    onProgress("Synchronizing globe layers");
    return {
      world,
      heightMap,
      landMask,
      width,
      height,
      worldCanvas: this.worldCanvas,
      industryCanvas: this.industryCanvas,
      cloudCanvas: this.cloudCanvas,
      seafloorCanvas: this.seafloorCanvas
    };
  }
}

function exportCompositeMap(result, includeIndustry = true) {
  const canvas = document.createElement("canvas");
  canvas.width = result.worldCanvas.width;
  canvas.height = result.worldCanvas.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(result.worldCanvas, 0, 0);
  if (includeIndustry) ctx.drawImage(result.industryCanvas, 0, 0);
  return canvas;
}

Object.assign(WF,{EPOCHS,WorldGenerator,exportCompositeMap,renderIndustryOverlay});
})(window);

;/* WorldBuilder companion metadata */
(function(g){"use strict";var m={"module":"js.world-generator","category":"system","sourceFile":"js/world-generator.js","companionCss":"css/world-generator.css","accessModel":"front-facing-authoring"};g.WorldBuilderCompanions=g.WorldBuilderCompanions||{};g.WorldBuilderCompanions[m.module]=m;if(g.dispatchEvent)g.dispatchEvent(new CustomEvent("worldbuilder:script-ready",{detail:m}));})(window);
