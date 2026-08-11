export function assertObject(x,name='value'){if(!x||typeof x!=='object'||Array.isArray(x))throw new TypeError(`${name} must be an object`);return x;}
export function sanitizeUserText(s,max=12000){return String(s??'').replace(/\u0000/g,'').slice(0,max);}
export function noSecrets(obj){const s=JSON.stringify(obj);return !/sk-[A-Za-z0-9_-]{20,}|BEGIN PRIVATE KEY|AIza[0-9A-Za-z_-]{20,}/.test(s);}
