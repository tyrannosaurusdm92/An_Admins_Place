export function tokenize(s=''){return [...new Set(s.toLowerCase().replace(/[^a-z0-9\s-]/g,' ').split(/\s+/).filter(x=>x.length>2))];}
export function score(query,item){const q=tokenize(query);const hay=JSON.stringify(item).toLowerCase();return q.reduce((n,t)=>n+(hay.includes(t)?1:0),0);}
export function topK(query,items,k=8){return items.map(x=>[score(query,x),x]).filter(x=>x[0]>0).sort((a,b)=>b[0]-a[0]).slice(0,k).map(x=>x[1]);}
export function compactContext(items,maxChars=12000){let out='';for(const x of items){const line=JSON.stringify(x);if(out.length+line.length+1>maxChars)break;out+=line+'\n';}return out;}
