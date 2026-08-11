const RULES=[
  [/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,"[email]"],
  [/\b(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}\b/g,"[phone]"],
  [/\b\d{3}-\d{2}-\d{4}\b/g,"[ssn-like]"],
  [/\b(?:sk-[A-Za-z0-9_-]{20,}|AIza[0-9A-Za-z_-]{20,})\b/g,"[secret]"],
];
export function redactForLogs(text){ let s=String(text??""); for(const [re,repl] of RULES) s=s.replace(re,repl); return s.slice(0,4000); }
