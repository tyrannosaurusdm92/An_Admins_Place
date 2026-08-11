export class PsychiatryApiClient {
  constructor({endpoint,fetchImpl=globalThis.fetch}={}){this.endpoint=endpoint;this.fetchImpl=fetchImpl;}
  async chat(message,{context={},options={}}={}){
    if(!this.endpoint) throw new Error("Backend endpoint is not configured");
    const res=await this.fetchImpl(this.endpoint,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({module:"psychiatry2",action:"chat",message,context,options})});
    if(!res.ok) throw new Error(`Backend request failed: ${res.status}`);
    return res.json();
  }
}
