/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-c. */
(function(global){"use strict";
const {RgbTerrain}=og;
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function wrapLongitude(lon) {
  let result = lon;
  while (result < -180) result += 360;
  while (result >= 180) result -= 360;
  return result;
}

function mercatorTileLon(x, z) {
  return (x / 2 ** z) * 360 - 180;
}

const MERCATOR_MAX_LAT = 85.0511287798066;
const TILEGROUP_NORTH = 20;
const TILEGROUP_SOUTH = 300;

function tileLatitude(y, z, tileGroup) {
  if (tileGroup === TILEGROUP_NORTH) {
    return 90 - (y / 2 ** z) * (90 - MERCATOR_MAX_LAT);
  }
  if (tileGroup === TILEGROUP_SOUTH) {
    return -MERCATOR_MAX_LAT - (y / 2 ** z) * (90 - MERCATOR_MAX_LAT);
  }
  const n = Math.PI - (2 * Math.PI * y) / 2 ** z;
  return (180 / Math.PI) * Math.atan(Math.sinh(n));
}

function encodeTerrarium(height) {
  const value = clamp(height + 32768, 0, 65535.996);
  const r = Math.floor(value / 256);
  const g = Math.floor(value - r * 256);
  const b = Math.floor((value - Math.floor(value)) * 256);
  return [r, g, b];
}

function bilinearHeight(result, lon, lat) {
  if (!result) return 0;
  const { width, height, heightMap } = result;
  let x = ((wrapLongitude(lon) + 180) / 360) * width;
  let y = ((90 - clamp(lat, -90, 90)) / 180) * height;
  x = ((x % width) + width) % width;
  y = clamp(y, 0, height - 1.001);
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = (x0 + 1) % width;
  const y1 = Math.min(height - 1, y0 + 1);
  const tx = x - x0;
  const ty = y - y0;
  const h00 = heightMap[y0 * width + x0];
  const h10 = heightMap[y0 * width + x1];
  const h01 = heightMap[y1 * width + x0];
  const h11 = heightMap[y1 * width + x1];
  const top = h00 + (h10 - h00) * tx;
  const bottom = h01 + (h11 - h01) * tx;
  return top + (bottom - top) * ty;
}

class ProceduralTerrainFactory {
  constructor() {
    this.result = null;
    this.tileCache = new Map();
    this.version = 0;
    this.tileSize = 64;
  }

  setResult(result) {
    this.result = result;
    this.version += 1;
    this.tileCache.clear();
  }

  createProvider(heightFactor = 1) {
    const terrain = new RgbTerrain("Generated Planetary Relief", {
      url: "data:image/png;base64,",
      encoding: "terrarium",
      imageSize: this.tileSize,
      plainGridSize: 32,
      minZoom: 0,
      maxZoom: 10,
      maxNativeZoom: 5,
      heightFactor,
      geoidSrc: null,
      noDataValues: [-32768],
      gridSizeByZoom: [32, 32, 32, 32, 32, 32, 32, 24, 16, 12, 8, 4]
    });
    terrain.setUrlRewriteCallback((x, y, z, tileGroup) => this.getTileDataUrl(x, y, z, tileGroup));
    return terrain;
  }

  getTileDataUrl(tileX, tileY, tileZoom, tileGroup) {
    const key = `${this.version}:${tileGroup}:${tileZoom}:${tileX}:${tileY}`;
    if (this.tileCache.has(key)) return this.tileCache.get(key);

    const canvas = document.createElement("canvas");
    canvas.width = this.tileSize;
    canvas.height = this.tileSize;
    const ctx = canvas.getContext("2d");
    const image = ctx.createImageData(this.tileSize, this.tileSize);

    for (let py = 0; py < this.tileSize; py += 1) {
      for (let px = 0; px < this.tileSize; px += 1) {
        let elevation = 0;
        if (this.result) {
          const worldX = tileX + px / (this.tileSize - 1);
          const worldY = tileY + py / (this.tileSize - 1);
          const lon = mercatorTileLon(worldX, tileZoom);
          const lat = tileLatitude(worldY, tileZoom, tileGroup);
          elevation = bilinearHeight(this.result, lon, lat);
        }
        const [r, g, b] = encodeTerrarium(elevation);
        const index = (py * this.tileSize + px) * 4;
        image.data[index] = r;
        image.data[index + 1] = g;
        image.data[index + 2] = b;
        image.data[index + 3] = 255;
      }
    }
    ctx.putImageData(image, 0, 0);
    const url = canvas.toDataURL("image/png");
    this.tileCache.set(key, url);

    if (this.tileCache.size > 420) {
      const oldest = this.tileCache.keys().next().value;
      this.tileCache.delete(oldest);
    }
    return url;
  }
}

global.WorldBuilder.ProceduralTerrainFactory=ProceduralTerrainFactory;
})(window);

;/* WorldBuilder companion metadata */
(function(g){"use strict";var m={"module":"js.terrain-provider","category":"terrain","sourceFile":"js/terrain-provider.js","companionCss":"css/terrain-provider.css","accessModel":"front-facing-authoring"};g.WorldBuilderCompanions=g.WorldBuilderCompanions||{};g.WorldBuilderCompanions[m.module]=m;if(g.dispatchEvent)g.dispatchEvent(new CustomEvent("worldbuilder:script-ready",{detail:m}));})(window);
