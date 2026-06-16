/* Tiny no-compression ZIP writer for browser exports. */
(function(global){
  'use strict';
  const enc = new TextEncoder();
  let crcTable = null;
  function makeCrcTable(){
    const table = new Uint32Array(256);
    for(let n=0;n<256;n++){
      let c=n;
      for(let k=0;k<8;k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      table[n]=c>>>0;
    }
    return table;
  }
  function crc32(bytes){
    if(!crcTable) crcTable = makeCrcTable();
    let c = 0xffffffff;
    for(let i=0;i<bytes.length;i++) c = crcTable[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  }
  function dosDateTime(date){
    const d = date || new Date();
    const time = (d.getHours() << 11) | (d.getMinutes() << 5) | Math.floor(d.getSeconds()/2);
    const year = Math.max(1980, d.getFullYear());
    const day = ((year - 1980) << 9) | ((d.getMonth()+1) << 5) | d.getDate();
    return {time, day};
  }
  function u16(v){ const a=new Uint8Array(2); new DataView(a.buffer).setUint16(0,v,true); return a; }
  function u32(v){ const a=new Uint8Array(4); new DataView(a.buffer).setUint32(0,v>>>0,true); return a; }
  function concat(parts){
    const len = parts.reduce((n,p)=>n+p.length,0);
    const out = new Uint8Array(len);
    let off=0; for(const p of parts){ out.set(p,off); off+=p.length; }
    return out;
  }
  class ZipStore{
    constructor(){ this.files = []; }
    addFile(path, content){
      const safe = String(path).replace(/^\/+/, '').replace(/\\/g,'/');
      let data;
      if(content instanceof Uint8Array) data = content;
      else if(content instanceof ArrayBuffer) data = new Uint8Array(content);
      else data = enc.encode(String(content ?? ''));
      this.files.push({path:safe, data, crc:crc32(data), date:new Date()});
    }
    async blob(){
      const locals = [];
      const centrals = [];
      let offset = 0;
      for(const f of this.files){
        const name = enc.encode(f.path);
        const dt = dosDateTime(f.date);
        const local = concat([
          u32(0x04034b50), u16(20), u16(0), u16(0), u16(dt.time), u16(dt.day),
          u32(f.crc), u32(f.data.length), u32(f.data.length), u16(name.length), u16(0), name, f.data
        ]);
        locals.push(local);
        const central = concat([
          u32(0x02014b50), u16(20), u16(20), u16(0), u16(0), u16(dt.time), u16(dt.day),
          u32(f.crc), u32(f.data.length), u32(f.data.length), u16(name.length), u16(0), u16(0),
          u16(0), u16(0), u32(0), u32(offset), name
        ]);
        centrals.push(central);
        offset += local.length;
      }
      const centralStart = offset;
      const centralBytes = concat(centrals);
      const end = concat([
        u32(0x06054b50), u16(0), u16(0), u16(this.files.length), u16(this.files.length),
        u32(centralBytes.length), u32(centralStart), u16(0)
      ]);
      return new Blob([concat([...locals, centralBytes, end])], {type:'application/zip'});
    }
    async download(filename){
      const blob = await this.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename.endsWith('.zip') ? filename : `${filename}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(()=>URL.revokeObjectURL(url), 2000);
    }
  }
  global.ZipStore = ZipStore;
})(window);
