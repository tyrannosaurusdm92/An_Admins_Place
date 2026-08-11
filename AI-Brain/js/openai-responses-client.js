(function(root){
  "use strict";
  function extractOutputText(data){
    if(data&&typeof data.output_text==="string") return data.output_text;
    const parts=[];
    for(const item of (data&&data.output)||[]){
      for(const c of item.content||[]){if(c&&c.type==="output_text"&&c.text) parts.push(c.text);}
    }
    return parts.join("\n");
  }
  async function createResponse(opts){
    if(!opts||!opts.apiKey) throw new Error("apiKey is required in a server-side environment");
    const body={model:opts.model||"gpt-5",instructions:opts.instructions||"",input:opts.input||""};
    const r=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Authorization":"Bearer "+opts.apiKey,"Content-Type":"application/json"},body:JSON.stringify(body)});
    const data=await r.json(); if(!r.ok) throw new Error((data&&data.error&&data.error.message)||("OpenAI HTTP "+r.status));
    return {raw:data,text:extractOutputText(data)};
  }
  root.PsychiatryPT3OpenAI={createResponse,extractOutputText};
})(typeof globalThis!=="undefined"?globalThis:this);
