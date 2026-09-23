(()=>{
'use strict';

const SHARE_CONTEXT=(window.__GF_SHARE_CONTEXT__&&typeof window.__GF_SHARE_CONTEXT__==='object')?window.__GF_SHARE_CONTEXT__:{};
const API_URL=String(SHARE_CONTEXT.backendUrl||'https://script.google.com/macros/s/AKfycbxdSerHFZpaNKTx4__lhms9jxzMkkG5CvrRTEQB51XHObqlgoFDl7JcLNSvSQB7RqQpdw/exec');
const FORM_ID='will-saville-references';
const EXPECTED_FIELDS=['name','pronouns','contactInfo','howIKnowWilliam','howLongKnown','characterDescription','otherDetails'];
const SESSION_KEY='willReferences.adminSession.v2';
const EDIT_KEYS=Object.freeze({responseId:'gf.responseId',editToken:'gf.editToken',response:'gf.responseDraft'});
let backendSchema=null;
const PACKET_DOCS_KEY='willReferences.packetDocuments.v2';
let adminResponses=[];
let packetDocuments=[];
const packetFiles=new Map();
const packetObjectUrls=new Map();

const DEFAULT_DOCUMENTS=[
  {id:'vawa-certification',label:'VAWA certification application packet',kind:'pdf',sourceUrl:'https://drive.google.com/file/d/1ewK41JQgMWm5RcB_rK2ltUOIWKdeZIN5/view?usp=sharing',attachmentName:'2024-04-23 VAWA Certification Application Packet - Andrew Blake-Newton.pdf',highlights:'This April 2024 packet is the paperwork I submitted in connection with the safety-related move. It is part of the record showing that I did not simply leave stable housing without explanation; the move went through a formal housing-protection process.',include:true},
  {id:'vawa-move-approval',label:'VAWA move approval and contract termination',kind:'pdf',sourceUrl:'https://drive.google.com/file/d/1LzduX450DLdaDRy6uGMgzJ850OAsIJXf/view?usp=sharing',attachmentName:'2024-05-06 VAWA Move Approval and 2024-05-08 Contract Termination Notice - Andrew Blake-Newton.pdf',highlights:'This file contains the May 2024 VAWA move approval and the related contract termination notice. Together, they document that the move from my former Michigan residence was approved for safety reasons and that the prior housing contract ended as part of that process.',include:true},
  {id:'mshda-portability',label:'MSHDA outgoing portability request',kind:'pdf',sourceUrl:'https://drive.google.com/file/d/1icxDbgmx45ZjpLK-A6K8p8Q6WrV1Aszn/view?usp=sharing',attachmentName:'2024-08-08 MSHDA Outgoing Portability Request to Metro Housing Boston.pdf',highlights:'This August 2024 MSHDA request shows the portability process that moved my Housing Choice Voucher assistance from Michigan to the Boston area after the safety relocation.',include:true},
  {id:'section8-voucher',label:'Section 8 voucher and reasonable accommodation approval',kind:'pdf',sourceUrl:'https://drive.google.com/file/d/1XacOxIlQBtCLxoK5zIIk-mXiytW9JA_-/view?usp=sharing',attachmentName:'2024-08-28 Section 8 Voucher and 2024-12-20 Reasonable Accommodation Approval.pdf',highlights:'This file contains my August 2024 Housing Choice Voucher paperwork and a December 2024 reasonable accommodation approval. It documents both the voucher itself and an accommodation that was approved while I was using the program.',include:true},
  {id:'mshda-livein-bedroom',label:'MSHDA extra-bedroom reasonable accommodation approval',kind:'pdf',sourceUrl:'https://drive.google.com/file/d/1z3P7b8c5QeyOGBVoikiJgkLiwqAryTP2/view?usp=drive_link',attachmentName:'2023-10-30 MSHDA Reasonable Accommodation Approval - Extra Bedroom for Live-In Aide.pdf',highlights:'This October 2023 MSHDA approval documents an extra bedroom as a reasonable accommodation connected with a live-in aide.',include:true},
  {id:'ra-medical-letter',label:'Reasonable accommodation medical letter',kind:'pdf',sourceUrl:'https://drive.google.com/file/d/196NXrT6HCQOvm94QGAxY7fzsgsNZJAWO/view?usp=drive_link',attachmentName:'2024-12-19 Reasonable Accommodation Medical Letter - Andrew Blake-Newton (William Saville).pdf',highlights:'This December 2024 letter provides medical support for a reasonable accommodation request. I do not repeat the private medical details on the public site; the full letter is included only when it is actually needed in the packet.',include:true},
  {id:'service-animal',label:'Service animal letter',kind:'pdf',sourceUrl:'https://drive.google.com/file/d/1MQs9ZdcvMJy4VbOgB5x63de6ZL4uCaT3/view?usp=drive_link',attachmentName:'2026-08-30 William Saville Service Animal Letter.pdf',highlights:"This August 2026 letter documents my service animal accommodation and can be included when that information is relevant to a housing review.",include:true},
  {id:'ssa-benefit',label:'Social Security benefit verification',kind:'pdf',sourceUrl:'https://drive.google.com/file/d/1vAeCMGD5kCB8lB5e6PVaTJ_hIonv18Ha/view?usp=sharing',attachmentName:'2026-08-31 Social Security Benefit Verification Letter - Andrew Blake-Newton.pdf',highlights:'This Social Security Administration letter is dated August 31, 2026. It confirms SSI of $994 per month beginning July 2026 and confirms that I am entitled to monthly payments as a disabled individual.',include:true},
  {id:'screening-report',label:'September 22 rental screening report',kind:'pdf',sourceUrl:'https://drive.google.com/file/d/1Zm9SFSd33ktjhFhqiqWd9x2RFQXiOOwq/view?usp=sharing',attachmentName:'ApplicantScreeningReport_84126991_2026-09-22-17.27.54.pdf.pdf',highlights:'This is the September 22, 2026 Bainbridge Park screening report that prompted this project. It records the decline, proposed rent of $1,550, monthly income of $994, and the 156 percent rent-to-income calculation, along with the reasons listed for the result. It also records nearly two years at my current address.',include:true}
];
const surface=document.getElementById('merged-luxury-editorial__website-surface');
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));

function setStatus(el,message,state=''){
  if(!el)return;
  el.textContent=message||'';
  if(state)el.dataset.state=state;else delete el.dataset.state;
}

async function parseJsonResponse(response){
  const text=await response.text();
  let data;
  try{data=JSON.parse(text);}catch(_){throw new Error('The form service returned an unreadable response.');}
  if(!data || data.ok!==true)throw new Error((data&&data.error)||'The form service could not complete the request.');
  return data;
}

async function apiGet(action){
  const url=new URL(API_URL);
  url.searchParams.set('action',action);
  const response=await fetch(url.toString(),{method:'GET',cache:'no-store',redirect:'follow'});
  return parseJsonResponse(response);
}

async function apiPost(payload){
  const response=await fetch(API_URL,{
    method:'POST',
    headers:{'Content-Type':'text/plain;charset=UTF-8'},
    body:JSON.stringify(payload),
    cache:'no-store',
    redirect:'follow',
    credentials:'omit'
  });
  return parseJsonResponse(response);
}

function getAdminSession(){
  try{
    const raw=sessionStorage.getItem(SESSION_KEY);
    if(!raw)return null;
    const data=JSON.parse(raw);
    if(!data.sessionToken||!data.expiresAt||Date.now()>=Date.parse(data.expiresAt)){sessionStorage.removeItem(SESSION_KEY);return null;}
    return data;
  }catch(_){return null;}
}
function setAdminSession(data){sessionStorage.setItem(SESSION_KEY,JSON.stringify({sessionToken:data.sessionToken,expiresAt:data.expiresAt,adminEmail:data.adminEmail||''}));}
function clearAdminSession(){sessionStorage.removeItem(SESSION_KEY);}

async function checkBackend(){
  const status=$('#backend-status');
  try{
    const [health,schema]=await Promise.all([apiGet('health'),apiGet('form.schema')]);
    const keys=(schema.form?.fields||[]).map(f=>f.key);
    const matches=schema.form?.id===FORM_ID && EXPECTED_FIELDS.every((k,i)=>keys[i]===k);
    const edit=schema.form?.editing||{};
    const storage=edit.storageHint||{};
    const capabilities=health.version==='2.0.0' && health.apiVersion==='2026-09-23.forms.v2' && health.responseEditingAllowed===true && health.shareLinkSupported===true && health.adminDeleteSupported===true && schema.form?.responseEditingAllowed===true && edit.mode==='browser-memory-edit-token' && edit.loadAction==='response.loadForEdit' && edit.submitAction==='form.submit' && storage.responseId===EDIT_KEYS.responseId && storage.editToken===EDIT_KEYS.editToken && storage.response===EDIT_KEYS.response;
    if(!matches||!capabilities)throw new Error('The form service does not match the expected response contract.');
    backendSchema=schema.form;
    applyFormSchema(backendSchema);
    if(status){
      status.innerHTML='<span class="status-dot ok" aria-hidden="true"></span>The reference form is connected and ready.';
      status.dataset.state='success';
    }
    document.documentElement.dataset.backend='connected';
    return {health,schema};
  }catch(err){
    if(status){
      status.innerHTML='<span class="status-dot" aria-hidden="true"></span>The reference form is configured, but this browser could not complete a live connection check. If submission fails, please try again later.';
      status.dataset.state='pending';
      status.title=String(err&&err.message||err);
    }
    document.documentElement.dataset.backend='unverified';
    return null;
  }
}

function applyFormSchema(formSchema){
  if(!formSchema)return;
  const title=$('#web-luxury-editorial-desktop-shell--contact-title');
  if(title&&formSchema.title)title.textContent=formSchema.title;
  const titleWrap=title?.closest('.page-title');
  const subtitle=titleWrap?.querySelector('p');
  if(subtitle&&formSchema.subtitle)subtitle.textContent=formSchema.subtitle;
  const confirmation=$('[data-confirmation-message]');
  if(confirmation&&formSchema.confirmationMessage)confirmation.textContent=formSchema.confirmationMessage;
  for(const field of formSchema.fields||[]){
    const input=$(`[name="${CSS.escape(field.key)}"]`);
    if(!input)continue;
    const card=input.closest('.form-card');
    const label=card?.querySelector('label.question-label');
    if(label){
      label.textContent='';
      label.append(document.createTextNode(field.label+(field.required?' ':'')));
      if(field.required){const mark=document.createElement('span');mark.className='required-mark';mark.textContent='*';label.append(mark);}
    }
    const help=card?.querySelector('.help-text');
    if(help&&field.help)help.textContent=field.help;
    input.required=!!field.required;
    if(field.type==='dropdown'&&Array.isArray(field.options)&&input.tagName==='SELECT'){
      const current=input.value;
      input.innerHTML='<option value="" disabled>Choose one</option>'+field.options.map(v=>`<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`).join('');
      input.value=field.options.includes(current)?current:'';
    }
  }
}

function initCounters(){
  $$('[data-count-target]').forEach(el=>{
    const target=document.getElementById(el.dataset.countTarget);
    if(!target)return;
    const update=()=>{target.textContent=String(el.value.length);};
    el.addEventListener('input',update);update();
  });
}

function getEditMemory(){
  try{
    const responseId=localStorage.getItem(EDIT_KEYS.responseId)||'';
    const editToken=localStorage.getItem(EDIT_KEYS.editToken)||'';
    const raw=localStorage.getItem(EDIT_KEYS.response)||'';
    const draft=raw?JSON.parse(raw):null;
    return responseId&&editToken?{responseId,editToken,draft}:null;
  }catch(_){return null;}
}
function saveEditMemory(memory){
  if(!memory?.responseId||!memory?.editToken)return;
  localStorage.setItem(EDIT_KEYS.responseId,String(memory.responseId));
  localStorage.setItem(EDIT_KEYS.editToken,String(memory.editToken));
  localStorage.setItem(EDIT_KEYS.response,JSON.stringify(memory));
}
function clearEditMemory(){
  try{Object.values(EDIT_KEYS).forEach(k=>localStorage.removeItem(k));}catch(_){}
}
function setFormValues(response){
  if(!response)return;
  for(const key of EXPECTED_FIELDS){const el=$(`[name="${CSS.escape(key)}"]`);if(el)el.value=String(response[key]??'');}
  $$('[data-count-target]').forEach(el=>el.dispatchEvent(new Event('input',{bubbles:true})));
}
function setEditUi(memory,serverData=null){
  const panel=$('#reference-edit-panel');
  const summary=$('#reference-edit-summary');
  const submit=$('#reference-submit');
  if(!memory){if(panel)panel.hidden=true;if(submit)submit.textContent='Submit reference';return;}
  if(panel)panel.hidden=false;
  const revision=Number(serverData?.revision||memory?.draft?.revision||memory?.revision||1);
  const updated=serverData?.updatedAt||memory?.draft?.updatedAt||memory?.updatedAt||'';
  if(summary)summary.textContent=`This browser can update response ${memory.responseId}. Current revision: ${revision}${updated?`. Last saved ${formatDate(updated)}.`:''}`;
  if(submit)submit.textContent='Update reference';
}

function formPayload(form){
  const fd=new FormData(form);
  const payload={
    action:'form.submit',
    formId:FORM_ID,
    website:String(fd.get('website')||''),
    response:{
      name:String(fd.get('name')||'').trim(),
      pronouns:String(fd.get('pronouns')||'').trim(),
      contactInfo:String(fd.get('contactInfo')||'').trim(),
      howIKnowWilliam:String(fd.get('howIKnowWilliam')||'').trim(),
      howLongKnown:String(fd.get('howLongKnown')||'').trim(),
      characterDescription:String(fd.get('characterDescription')||'').trim(),
      otherDetails:String(fd.get('otherDetails')||'').trim()
    }
  };
  const memory=getEditMemory();
  if(memory){payload.responseId=memory.responseId;payload.editToken=memory.editToken;}
  return payload;
}

function validateReference(payload){
  const r=payload.response;
  const liveFields=Array.isArray(backendSchema?.fields)?backendSchema.fields:[];
  const required=liveFields.length?liveFields.filter(f=>f.required).map(f=>f.key):['name','pronouns','contactInfo','howIKnowWilliam','howLongKnown','characterDescription'];
  const missing=required.filter(k=>!r[k]);
  if(missing.length)throw new Error('Please complete every required question before submitting.');
  const liveDuration=liveFields.find(f=>f.key==='howLongKnown');
  const allowed=Array.isArray(liveDuration?.options)&&liveDuration.options.length?liveDuration.options:['6 months to 1 year','1 to 2 years','2 to 4 years','4 to 7 years','7 to 10 years','10+ years'];
  if(!allowed.includes(r.howLongKnown))throw new Error('Please choose how long you have known William.');
  if(r.name.length>1000||r.pronouns.length>1000||r.howIKnowWilliam.length>1000||r.howLongKnown.length>1000)throw new Error('One of the short-answer fields is too long.');
  if(r.contactInfo.length>2000)throw new Error('Contact information is too long.');
  if(r.characterDescription.length>12000||r.otherDetails.length>12000)throw new Error('One of the long-answer fields is too long.');
}

async function loadSavedResponseForEdit({silent=false}={}){
  const memory=getEditMemory();
  const status=$('#reference-form-status');
  if(!memory){setEditUi(null);return null;}
  if(!silent)setStatus(status,'Loading your saved response for editing...','pending');
  try{
    const data=await apiPost({action:'response.loadForEdit',responseId:memory.responseId,editToken:memory.editToken});
    setFormValues(data.response);
    const merged={...memory,draft:{...memory.draft,...data,response:data.response}};
    saveEditMemory({responseId:memory.responseId,editToken:memory.editToken,revision:data.revision,updatedAt:data.updatedAt,response:data.response});
    setEditUi(merged,data);
    if(!silent)setStatus(status,'Your previously submitted response is loaded. Saving will update the same response.','success');
    return data;
  }catch(err){
    const message=String(err&&err.message||err);
    if(/response not found|not authorized|credentials are missing|cannot be edited/i.test(message)){
      clearEditMemory();setEditUi(null);
      if(!silent)setStatus(status,'Saved editing access is no longer valid. You can submit a new response.','pending');
    }else if(!silent){
      setStatus(status,'The saved response could not be reloaded right now. Your editing token remains stored in this browser.','pending');
    }
    return null;
  }
}

function initReferenceForm(){
  const form=$('#reference-form');
  if(!form)return;
  const status=$('#reference-form-status');
  const success=$('#reference-success');
  const submit=$('#reference-submit');
  setEditUi(getEditMemory());
  loadSavedResponseForEdit({silent:true});
  form.addEventListener('submit',async e=>{
    e.preventDefault();
    if(!form.reportValidity())return;
    const payload=formPayload(form);
    const editing=!!(payload.responseId&&payload.editToken);
    try{
      validateReference(payload);
      submit.disabled=true;
      setStatus(status,editing?'Updating your reference...':'Submitting your reference...','pending');
      const data=await apiPost(payload);
      if(data.browserMemory)saveEditMemory(data.browserMemory);
      const memory=getEditMemory();
      setEditUi(memory,data);
      setStatus(status,data.updated?'Reference updated successfully.':'Reference submitted successfully. This browser can update the same response later.','success');
      if(success){
        success.classList.add('is-visible');
        const msg=$('[data-confirmation-message]',success);
        if(msg)msg.textContent=data.confirmationMessage||backendSchema?.confirmationMessage||'Thank you for taking the time to provide a reference for me.';
        const rid=$('[data-response-id]',success);
        if(rid)rid.textContent=data.responseId?`Response ID: ${data.responseId} | Revision ${data.revision||1}`:'';
        const editMsg=$('[data-edit-message]',success);
        if(editMsg)editMsg.textContent=data.responseEditingAllowed?'This browser saved editing access so you can correct this same response later. Reference writers cannot delete submitted responses.':'';
      }
      success?.scrollIntoView({behavior:'smooth',block:'center'});
    }catch(err){
      setStatus(status,String(err&&err.message||err),'error');
    }finally{submit.disabled=false;}
  });
  form.addEventListener('reset',()=>{requestAnimationFrame(()=>{setStatus(status,'');success?.classList.remove('is-visible');$$('[data-count-target]').forEach(el=>el.dispatchEvent(new Event('input',{bubbles:true})));});});
  $('#reference-reload-edit')?.addEventListener('click',()=>loadSavedResponseForEdit());
  $('#reference-forget-edit')?.addEventListener('click',()=>{
    clearEditMemory();setEditUi(null);success?.classList.remove('is-visible');setStatus(status,'Editing access was removed from this browser. The submitted response remains stored and cannot be deleted by the responder.','success');
  });
}

function adminUiState(mode){
  const emailStep=$('#admin-email-step');
  const codeStep=$('#admin-code-step');
  const dash=$('#admin-dashboard');
  emailStep.hidden=mode!=='email';
  codeStep.hidden=mode!=='code';
  dash.hidden=mode!=='dashboard';
}

async function loadResponses(){
  const session=getAdminSession();
  if(!session){adminUiState('email');return;}
  const status=$('#admin-status');
  const list=$('#admin-responses');
  setStatus(status,'Loading responses...','pending');
  try{
    const data=await apiPost({action:'admin.listResponses',sessionToken:session.sessionToken,offset:0,limit:1000});
    adminResponses=data.responses||[];
    renderResponses(adminResponses,data.total||0);
    setStatus(status,`${data.total||0} response${data.total===1?'':'s'} available.`,'success');
  }catch(err){
    if(/session|auth/i.test(String(err&&err.message||err))){clearAdminSession();adminUiState('email');}
    setStatus(status,String(err&&err.message||err),'error');
    adminResponses=[];
    if(list)list.innerHTML='';
  }
}

function escapeHtml(value){return String(value??'').replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));}
function formatDate(value){const d=new Date(value);return isNaN(d)?String(value||''):d.toLocaleString();}

function renderResponses(responses,total){
  const host=$('#admin-responses');
  const count=$('#admin-response-count');
  if(count)count.textContent=String(total);
  if(!host)return;
  if(!responses.length){host.innerHTML='<div class="project-note"><strong>No responses yet</strong>Submitted references will appear here after they are saved.</div>';return;}
  host.innerHTML=responses.map(r=>`<article class="response-card" data-response-id="${escapeHtml(r.responseId)}">
    <div class="response-card-head">
      <div><h3>${escapeHtml(r.name||'Unnamed reference')}</h3><div class="response-meta">${escapeHtml(r.pronouns)} | ${escapeHtml(r.howIKnowWilliam)} | ${escapeHtml(r.howLongKnown)}</div><div class="response-meta">Submitted ${escapeHtml(formatDate(r.submittedAt))}${r.updatedAt&&r.updatedAt!==r.submittedAt?` | Updated ${escapeHtml(formatDate(r.updatedAt))}`:''} | Revision ${escapeHtml(r.revision||1)}</div></div>
      <label class="response-select"><input type="checkbox" class="admin-response-select" value="${escapeHtml(r.responseId)}"/> Select</label>
    </div>
    <p><strong>Contact:</strong> ${escapeHtml(r.contactInfo)}</p>
    <p><strong>Character statement</strong>
${escapeHtml(r.characterDescription)}</p>
    ${r.otherDetails?`<p><strong>Other details</strong>
${escapeHtml(r.otherDetails)}</p>`:''}
    <div class="response-meta">Response ID: ${escapeHtml(r.responseId)} | Responder editable: ${r.responderEditable?'Yes':'No'} | Locked: ${r.locked?'Yes':'No'}</div>
    <div class="button-row response-admin-actions"><button class="danger" type="button" data-delete-response="${escapeHtml(r.responseId)}" data-delete-name="${escapeHtml(r.name||'this response')}">Delete response</button></div>
  </article>`).join('');
}

function cloneDefaultDocuments(){return DEFAULT_DOCUMENTS.map(d=>({...d}));}

function loadPacketDocuments(){
  try{
    const raw=localStorage.getItem(PACKET_DOCS_KEY);
    if(!raw)return cloneDefaultDocuments();
    const parsed=JSON.parse(raw);
    if(!Array.isArray(parsed)||!parsed.length)return cloneDefaultDocuments();
    return parsed.map((d,i)=>({
      id:String(d.id||`custom-${Date.now()}-${i}`),
      label:String(d.label||'Supporting document'),
      kind:d.kind==='image'?'image':'pdf',
      sourceUrl:String(d.sourceUrl||''),
      attachmentName:String(d.attachmentName||d.label||'Supporting document'),
      highlights:String(d.highlights||''),
      include:d.include!==false,
      custom:!!d.custom
    }));
  }catch(_){return cloneDefaultDocuments();}
}

function savePacketDocuments(){
  const safe=packetDocuments.map(({id,label,kind,sourceUrl,attachmentName,highlights,include,custom})=>({id,label,kind,sourceUrl,attachmentName,highlights,include,custom}));
  localStorage.setItem(PACKET_DOCS_KEY,JSON.stringify(safe));
}

function driveFileId(url){
  const value=String(url||'');
  const match=value.match(/\/d\/([A-Za-z0-9_-]+)/)||value.match(/[?&]id=([A-Za-z0-9_-]+)/);
  return match?match[1]:'';
}

function documentPreviewUrl(doc){
  const url=String(doc.sourceUrl||'').trim();
  const id=driveFileId(url);
  if(doc.kind==='image')return id?`https://drive.google.com/uc?export=view&id=${encodeURIComponent(id)}`:url;
  return id?`https://drive.google.com/file/d/${encodeURIComponent(id)}/preview`:url;
}

function revokePacketObjectUrl(id){
  const old=packetObjectUrls.get(id);
  if(old){URL.revokeObjectURL(old);packetObjectUrls.delete(id);}
}

function getPacketObjectUrl(id){
  if(packetObjectUrls.has(id))return packetObjectUrls.get(id);
  const file=packetFiles.get(id);
  if(!file)return '';
  const url=URL.createObjectURL(file);
  packetObjectUrls.set(id,url);
  return url;
}

function openDocumentViewer(doc,{preferLocal=false}={}){
  const modal=$('#document-viewer');
  const frame=$('#document-viewer-frame');
  const image=$('#document-viewer-image');
  const title=$('#document-viewer-title');
  const source=$('#document-viewer-source');
  if(!modal||!frame||!image)return;
  const local=preferLocal?getPacketObjectUrl(doc.id):'';
  const url=local||documentPreviewUrl(doc);
  if(!url){setStatus($('#packet-status'),'No preview source is available for this document.','error');return;}
  title.textContent=doc.label||doc.attachmentName||'Supporting document';
  if(source){source.href=doc.sourceUrl||url;source.hidden=!(doc.sourceUrl||url);}
  const isImage=(doc.kind==='image')||(packetFiles.get(doc.id)?.type||'').startsWith('image/');
  if(isImage){image.src=url;image.hidden=false;frame.hidden=true;frame.removeAttribute('src');}
  else{frame.src=url;frame.hidden=false;image.hidden=true;image.removeAttribute('src');}
  modal.hidden=false;
  document.body.classList.add('document-viewer-open');
  $('#document-viewer-close')?.focus();
}

function closeDocumentViewer(){
  const modal=$('#document-viewer');
  const frame=$('#document-viewer-frame');
  const image=$('#document-viewer-image');
  if(!modal)return;
  modal.hidden=true;
  frame?.removeAttribute('src');
  image?.removeAttribute('src');
  document.body.classList.remove('document-viewer-open');
}

function renderDocumentLoaders(){
  const host=$('#document-loader-grid');
  if(!host)return;
  host.innerHTML=packetDocuments.filter(d=>d.include!==false && String(d.sourceUrl||'').trim()).map((d,i)=>`<article class="document-loader-card" data-doc-id="${escapeHtml(d.id)}">
    <div class="document-loader-head"><div class="document-loader-title"><span class="document-type-badge">${d.kind==='image'?'IMAGE':'PDF'}</span><div><span class="mini">Attachment ${String(i+1).padStart(2,'0')}</span><h3>${escapeHtml(d.label)}</h3></div></div><div class="attachment-label">Grab from Drive: <strong>${escapeHtml(d.attachmentName)}</strong></div></div>
    <p>${escapeHtml(d.highlights||'Supporting document for the housing reference packet.')}</p>
    <div class="document-loader-frame">${d.kind==='image'?`<img src="${escapeHtml(documentPreviewUrl(d))}" alt="Preview of ${escapeHtml(d.label)}" loading="lazy"/>`:`<iframe src="${escapeHtml(documentPreviewUrl(d))}" title="Preview of ${escapeHtml(d.label)}" loading="lazy"></iframe>`}</div>
    <div class="button-row"><button type="button" data-view-source-doc="${escapeHtml(d.id)}">View fullscreen</button><a class="button secondary" href="${escapeHtml(d.sourceUrl)}" target="_blank" rel="noopener">Open in Drive</a></div>
  </article>`).join('');
}

function documentById(id){return packetDocuments.find(d=>d.id===id)||null;}

function addPacketDocument(partial={}){
  const id=`custom-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
  const doc={id,label:'New supporting document',kind:'pdf',sourceUrl:'',attachmentName:'Supporting document.pdf',highlights:'Add the document highlights that should appear in the exported packet.',include:true,custom:true,...partial};
  packetDocuments.push(doc);savePacketDocuments();renderPacketOrganizer();renderDocumentLoaders();return doc;
}

function inferKindFromFile(file){return file?.type?.startsWith('image/')?'image':'pdf';}
function isSupportedPacketFile(file){return !!file && (file.type==='application/pdf'||file.type==='image/png'||file.type==='image/jpeg'||/\.(pdf|png|jpe?g)$/i.test(file.name));}
function normalizeFileName(value){return String(value||'').toLowerCase().replace(/\.[a-z0-9]+$/,'').replace(/[^a-z0-9]+/g,'');}

function assignPacketFile(id,file){
  if(!isSupportedPacketFile(file))throw new Error('Use a PDF, PNG, JPG, or JPEG file.');
  revokePacketObjectUrl(id);
  packetFiles.set(id,file);
  const doc=documentById(id);
  if(doc){doc.kind=inferKindFromFile(file);if(!doc.attachmentName||doc.attachmentName==='Supporting document.pdf')doc.attachmentName=file.name;savePacketDocuments();}
}

function autoAttachFiles(files){
  let attached=0,created=0;
  for(const file of files){
    if(!isSupportedPacketFile(file))continue;
    const key=normalizeFileName(file.name);
    let target=packetDocuments.find(d=>!packetFiles.has(d.id) && (normalizeFileName(d.attachmentName)===key || normalizeFileName(d.label)===key));
    if(!target)target=packetDocuments.find(d=>!packetFiles.has(d.id) && (normalizeFileName(d.attachmentName).includes(key)||key.includes(normalizeFileName(d.attachmentName))));
    if(!target){
      const label=file.name.replace(/\.[^.]+$/,'').replace(/[_-]+/g,' ').replace(/\s+/g,' ').trim();
      target=addPacketDocument({label,kind:inferKindFromFile(file),attachmentName:file.name,highlights:'Supporting document included in the final housing reference packet.'});
      created++;
    }
    assignPacketFile(target.id,file);attached++;
  }
  renderPacketOrganizer();
  return {attached,created};
}

function movePacketDocument(id,direction){
  const index=packetDocuments.findIndex(d=>d.id===id);
  if(index<0)return;
  const next=index+direction;
  if(next<0||next>=packetDocuments.length)return;
  const [doc]=packetDocuments.splice(index,1);
  packetDocuments.splice(next,0,doc);
  savePacketDocuments();renderPacketOrganizer();renderDocumentLoaders();
}

function removePacketDocument(id){
  const index=packetDocuments.findIndex(d=>d.id===id);
  if(index<0)return;
  revokePacketObjectUrl(id);packetFiles.delete(id);packetDocuments.splice(index,1);
  savePacketDocuments();renderPacketOrganizer();renderDocumentLoaders();
}

function renderPacketOrganizer(){
  const host=$('#packet-document-list');
  if(!host)return;
  host.innerHTML=packetDocuments.map((d,i)=>{
    const file=packetFiles.get(d.id);
    return `<article class="packet-doc-item" draggable="true" data-doc-id="${escapeHtml(d.id)}">
      <div class="packet-doc-order"><button type="button" class="packet-drag-handle" title="Drag to reorder" aria-label="Drag ${escapeHtml(d.label)} to reorder">↕</button><strong>${String(i+1).padStart(2,'0')}</strong></div>
      <div class="packet-doc-main">
        <div class="packet-doc-top"><label class="packet-include"><input type="checkbox" data-doc-field="include" ${d.include!==false?'checked':''}/> Include in final packet</label><span class="packet-file-state ${file?'ready':'missing'}">${file?'Attached: '+escapeHtml(file.name):'Attach file for this export'}</span></div>
        <div class="packet-doc-fields">
          <label>Label<input data-doc-field="label" value="${escapeHtml(d.label)}"/></label>
          <label>Type<select data-doc-field="kind"><option value="pdf" ${d.kind==='pdf'?'selected':''}>PDF</option><option value="image" ${d.kind==='image'?'selected':''}>Image</option></select></label>
          <label class="wide">Google Drive or source link<input data-doc-field="sourceUrl" value="${escapeHtml(d.sourceUrl)}" placeholder="https://drive.google.com/file/d/.../view"/></label>
          <label class="wide">Attachment name<input data-doc-field="attachmentName" value="${escapeHtml(d.attachmentName)}"/></label>
          <label class="wide">Highlights for exported PDF<textarea data-doc-field="highlights">${escapeHtml(d.highlights)}</textarea></label>
        </div>
        <input class="packet-file-input" type="file" accept="application/pdf,image/png,image/jpeg" hidden/>
        <div class="button-row packet-doc-actions"><button type="button" data-doc-action="attach">${file?'Replace attached file':'Attach file'}</button><button class="secondary" type="button" data-doc-action="preview" ${(!file&&!d.sourceUrl)?'disabled':''}>Preview</button><button class="secondary" type="button" data-doc-action="up" ${i===0?'disabled':''}>Move up</button><button class="secondary" type="button" data-doc-action="down" ${i===packetDocuments.length-1?'disabled':''}>Move down</button><button class="secondary" type="button" data-doc-action="remove">Remove slot</button></div>
      </div>
    </article>`;
  }).join('');
}

function initDocumentViewer(){
  $('#document-viewer-close')?.addEventListener('click',closeDocumentViewer);
  $('#document-viewer')?.addEventListener('click',e=>{if(e.target.id==='document-viewer')closeDocumentViewer();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape' && !$('#document-viewer')?.hidden)closeDocumentViewer();});
  $('#document-loader-grid')?.addEventListener('click',e=>{
    const button=e.target.closest('[data-view-source-doc]');
    if(!button)return;
    const doc=documentById(button.dataset.viewSourceDoc);if(doc)openDocumentViewer(doc);
  });
}

function initPacketOrganizer(){
  packetDocuments=loadPacketDocuments();
  renderDocumentLoaders();
  renderPacketOrganizer();
  initDocumentViewer();
  const list=$('#packet-document-list');
  let draggedId='';
  list?.addEventListener('input',e=>{
    const item=e.target.closest('.packet-doc-item');if(!item)return;
    const doc=documentById(item.dataset.docId);if(!doc)return;
    const field=e.target.dataset.docField;if(!field)return;
    doc[field]=field==='include'?!!e.target.checked:String(e.target.value||'');
    savePacketDocuments();
  });
  list?.addEventListener('change',e=>{
    const item=e.target.closest('.packet-doc-item');if(!item)return;
    const id=item.dataset.docId;
    if(e.target.classList.contains('packet-file-input')){
      const file=e.target.files?.[0];if(!file)return;
      try{assignPacketFile(id,file);setStatus($('#packet-status'),`Attached ${file.name}.`,'success');renderPacketOrganizer();}
      catch(err){setStatus($('#packet-status'),String(err.message||err),'error');}
      return;
    }
    const doc=documentById(id);const field=e.target.dataset.docField;if(!doc||!field)return;
    doc[field]=field==='include'?!!e.target.checked:String(e.target.value||'');
    savePacketDocuments();renderDocumentLoaders();
  });
  list?.addEventListener('click',e=>{
    const btn=e.target.closest('[data-doc-action]');if(!btn)return;
    const item=btn.closest('.packet-doc-item');const id=item?.dataset.docId;if(!id)return;
    const action=btn.dataset.docAction;
    if(action==='attach')item.querySelector('.packet-file-input')?.click();
    if(action==='preview'){const doc=documentById(id);if(doc)openDocumentViewer(doc,{preferLocal:packetFiles.has(id)});}
    if(action==='up')movePacketDocument(id,-1);
    if(action==='down')movePacketDocument(id,1);
    if(action==='remove')removePacketDocument(id);
  });
  list?.addEventListener('dragstart',e=>{
    const item=e.target.closest('.packet-doc-item');if(!item)return;
    draggedId=item.dataset.docId;item.classList.add('dragging');
    e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',draggedId);
  });
  list?.addEventListener('dragend',e=>{e.target.closest('.packet-doc-item')?.classList.remove('dragging');draggedId='';});
  list?.addEventListener('dragover',e=>{if(e.target.closest('.packet-doc-item')){e.preventDefault();e.dataTransfer.dropEffect='move';}});
  list?.addEventListener('drop',e=>{
    const target=e.target.closest('.packet-doc-item');if(!target)return;e.preventDefault();
    const fromId=draggedId||e.dataTransfer.getData('text/plain');const toId=target.dataset.docId;if(!fromId||fromId===toId)return;
    const from=packetDocuments.findIndex(d=>d.id===fromId),to=packetDocuments.findIndex(d=>d.id===toId);if(from<0||to<0)return;
    const [doc]=packetDocuments.splice(from,1);packetDocuments.splice(to,0,doc);savePacketDocuments();renderPacketOrganizer();renderDocumentLoaders();
  });
  $('#packet-add-document')?.addEventListener('click',()=>{const doc=addPacketDocument();requestAnimationFrame(()=>document.querySelector(`[data-doc-id="${doc.id}"] input[data-doc-field="label"]`)?.focus());});
  $('#packet-reset-documents')?.addEventListener('click',()=>{
    packetDocuments=cloneDefaultDocuments();packetFiles.clear();for(const id of packetObjectUrls.keys())revokePacketObjectUrl(id);savePacketDocuments();renderPacketOrganizer();renderDocumentLoaders();setStatus($('#packet-status'),'Default document list restored. Local files must be attached again for a final export.','success');
  });
  const drop=$('#packet-file-drop'),input=$('#packet-file-drop-input');
  drop?.addEventListener('click',()=>input?.click());
  drop?.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();input?.click();}});
  ['dragenter','dragover'].forEach(type=>drop?.addEventListener(type,e=>{e.preventDefault();drop.classList.add('is-dragover');}));
  ['dragleave','drop'].forEach(type=>drop?.addEventListener(type,e=>{if(type==='drop')e.preventDefault();drop.classList.remove('is-dragover');}));
  drop?.addEventListener('drop',e=>{const result=autoAttachFiles(Array.from(e.dataTransfer.files||[]));setStatus($('#packet-status'),`${result.attached} file${result.attached===1?'':'s'} attached${result.created?`; ${result.created} new slot${result.created===1?'':'s'} created`:''}.`,'success');});
  input?.addEventListener('change',()=>{const result=autoAttachFiles(Array.from(input.files||[]));setStatus($('#packet-status'),`${result.attached} file${result.attached===1?'':'s'} attached${result.created?`; ${result.created} new slot${result.created===1?'':'s'} created`:''}.`,'success');input.value='';});
}

function pdfSafeText(value){
  return String(value??'').replace(/[\u2010-\u2015\u2212]/g,'-').replace(/[\u2018\u2019]/g,"'").replace(/[\u201c\u201d]/g,'"').replace(/\u2022/g,'*').replace(/\u00a0/g,' ').replace(/[^\x09\x0A\x0D\x20-\x7E]/g,'');
}

function wrapPdfText(text,font,size,maxWidth){
  const out=[];
  for(const paragraph of pdfSafeText(text).split(/\n/)){
    if(!paragraph){out.push('');continue;}
    const words=paragraph.split(/\s+/);let line='';
    for(const word of words){
      const test=line?`${line} ${word}`:word;
      if(font.widthOfTextAtSize(test,size)<=maxWidth){line=test;continue;}
      if(line)out.push(line);
      if(font.widthOfTextAtSize(word,size)<=maxWidth){line=word;continue;}
      let chunk='';
      for(const ch of word){const t=chunk+ch;if(font.widthOfTextAtSize(t,size)>maxWidth&&chunk){out.push(chunk);chunk=ch;}else chunk=t;}
      line=chunk;
    }
    if(line)out.push(line);
  }
  return out;
}

function createPdfWriter(pdf,font,bold){
  const width=612,height=792,margin=54,contentWidth=width-margin*2;
  const navy=PDFLib.rgb(0.09,0.20,0.30),teal=PDFLib.rgb(0.18,0.44,0.45),ink=PDFLib.rgb(0.12,0.16,0.20),muted=PDFLib.rgb(0.33,0.39,0.43),pale=PDFLib.rgb(0.95,0.97,0.97);
  const state={page:null,y:0,generatedPages:[]};
  function page(){state.page=pdf.addPage([width,height]);state.y=height-margin;state.generatedPages.push(state.page);return state.page;}
  function ensure(heightNeeded=18){if(!state.page||state.y-heightNeeded<margin)page();}
  function line(text,{size=10,fontFace=font,color=ink,x=margin,gap=4}={}){ensure(size+gap);state.page.drawText(pdfSafeText(text),{x,y:state.y-size,size,font:fontFace,color});state.y-=size+gap;}
  function paragraph(text,{size=10,fontFace=font,color=ink,after=10,lineGap=4,indent=0}={}){
    const lines=wrapPdfText(text,fontFace,size,contentWidth-indent);
    for(const l of lines){ensure(size+lineGap);if(l)state.page.drawText(l,{x:margin+indent,y:state.y-size,size,font:fontFace,color});state.y-=size+lineGap;}
    state.y-=after;
  }
  function heading(text,{size=17,color=navy,after=10}={}){ensure(size+after+8);state.page.drawText(pdfSafeText(text),{x:margin,y:state.y-size,size,font:bold,color});state.y-=size+after;}
  function rule(){ensure(8);state.page.drawRectangle({x:margin,y:state.y-2,width:contentWidth,height:1,color:teal});state.y-=10;}
  function labelValue(label,value){ensure(30);state.page.drawRectangle({x:margin,y:state.y-23,width:contentWidth,height:25,color:pale});state.page.drawText(pdfSafeText(label),{x:margin+8,y:state.y-15,size:8,font:bold,color:navy});const v=pdfSafeText(value);const lines=wrapPdfText(v,font,8,contentWidth-150);state.page.drawText(lines[0]||'',{x:margin+145,y:state.y-15,size:8,font,color:ink});state.y-=29;if(lines.length>1)paragraph(lines.slice(1).join(' '),{size:8,indent:145,after:4});}
  return {state,page,ensure,line,paragraph,heading,rule,labelValue,colors:{navy,teal,ink,muted,pale},size:{width,height,margin,contentWidth}};
}

async function buildFinalPacket(selectedOnly){
  const status=$('#packet-status');
  const selectedIds=$$('.admin-response-select:checked').map(x=>x.value);
  const responses=selectedOnly?adminResponses.filter(r=>selectedIds.includes(r.responseId)):adminResponses.slice();
  if(selectedOnly&&!selectedIds.length){setStatus(status,'Select at least one character reference first.','error');return;}
  if(!responses.length){setStatus(status,'There are no loaded character references to export. Refresh responses first.','error');return;}
  const docs=packetDocuments.filter(d=>d.include!==false);
  const missing=docs.filter(d=>!packetFiles.has(d.id));
  if($('#packet-require-files')?.checked && missing.length){setStatus(status,`Attach ${missing.length} included document${missing.length===1?'':'s'} before building the final packet. The first missing file is: ${missing[0].attachmentName}.`,'error');return;}
  if(!window.PDFLib){setStatus(status,'The PDF builder library did not load. Check the internet connection and reload the page.','error');return;}
  setStatus(status,'Building the final packet in this browser...','pending');
  try{
    const {PDFDocument,StandardFonts,rgb}=window.PDFLib;
    const pdf=await PDFDocument.create();
    const font=await pdf.embedFont(StandardFonts.Helvetica);
    const bold=await pdf.embedFont(StandardFonts.HelveticaBold);
    const w=createPdfWriter(pdf,font,bold);
    w.page();
    w.heading('Andrew Blake-Newton (Will Saville) References',{size:23,after:6});
    w.line('Housing reference packet',{size:12,fontFace:bold,color:w.colors.teal,gap:8});
    w.paragraph(`Prepared ${new Date().toLocaleDateString(undefined,{year:'numeric',month:'long',day:'numeric'})}. This packet begins with ${responses.length} character reference${responses.length===1?'':'s'}. After the references, there are short summaries of the supporting records, followed by the full documents in the order selected for this packet.`,{size:10,color:w.colors.muted,after:14});
    w.rule();
    w.heading('Packet order',{size:14});
    w.paragraph('1. Character references');
    w.paragraph('2. Supporting-document summaries');
    w.paragraph('3. Full supporting documents in organizer order');

    responses.forEach((r,i)=>{
      w.page();
      w.heading(`Reference ${String(i+1).padStart(2,'0')}: ${r.name||'Unnamed reference'}`,{size:18});
      w.labelValue('Pronouns',r.pronouns||'');
      w.labelValue('Contact info',r.contactInfo||'');
      w.labelValue('How I know William',r.howIKnowWilliam||'');
      w.labelValue('How long I have known William',r.howLongKnown||'');
      w.labelValue('Submitted',formatDate(r.submittedAt));
      w.heading("Description of William's character",{size:13,color:w.colors.teal,after:6});
      w.paragraph(r.characterDescription||'No character statement was provided.',{after:12});
      w.heading('Other details',{size:13,color:w.colors.teal,after:6});
      w.paragraph(r.otherDetails||'No additional details were provided.',{after:12});
    });

    if(docs.length){
      w.page();
      w.heading('Supporting Document Summaries',{size:20});
      w.paragraph('The notes below explain what each supporting record contains and why it is included. The full documents follow in the same order.',{color:w.colors.muted,after:14});
      docs.forEach((d,i)=>{
        w.heading(`Attachment ${String(i+1).padStart(2,'0')}: ${d.label}`,{size:13,color:w.colors.teal,after:5});
        w.paragraph(d.highlights||'Supporting document included with this packet.',{after:6});
        w.paragraph(`For the full document, please view ${d.attachmentName}, which is shown after the character references.`,{size:9,fontFace:bold,color:w.colors.navy,after:12});
      });
    }

    const generatedCount=w.state.generatedPages.length;
    w.state.generatedPages.forEach((page,index)=>page.drawText(`Page ${index+1} of ${generatedCount}`,{x:500,y:24,size:8,font,color:w.colors.muted}));

    if(docs.length){
      const divider=pdf.addPage([612,792]);
      divider.drawText('Supporting Documentation',{x:54,y:700,size:22,font:bold,color:rgb(0.09,0.20,0.30)});
      divider.drawText('The full supporting records follow in the order selected for this packet.',{x:54,y:674,size:10,font,color:rgb(0.33,0.39,0.43)});
      let attachmentNumber=0;
      for(const d of docs){
        const file=packetFiles.get(d.id);
        if(!file)continue;
        attachmentNumber++;
        const cover=pdf.addPage([612,792]);
        cover.drawText(`Attachment ${String(attachmentNumber).padStart(2,'0')}`,{x:54,y:700,size:13,font:bold,color:rgb(0.18,0.44,0.45)});
        const titleLines=wrapPdfText(d.label,bold,19,504);
        let y=665;
        for(const line of titleLines){cover.drawText(line,{x:54,y,size:19,font:bold,color:rgb(0.09,0.20,0.30)});y-=25;}
        const nameLines=wrapPdfText(d.attachmentName,font,10,504);
        y-=8;
        for(const line of nameLines){cover.drawText(line,{x:54,y,size:10,font,color:rgb(0.33,0.39,0.43)});y-=15;}
        const bytes=await file.arrayBuffer();
        if(d.kind==='image'||file.type.startsWith('image/')){
          let image;
          if(file.type==='image/png'||/\.png$/i.test(file.name))image=await pdf.embedPng(bytes);
          else if(file.type==='image/jpeg'||/\.jpe?g$/i.test(file.name))image=await pdf.embedJpg(bytes);
          else throw new Error(`${file.name} is not a supported image format. Use PNG or JPG.`);
          const page=pdf.addPage([612,792]);
          const maxW=504,maxH=684;const scale=Math.min(maxW/image.width,maxH/image.height,1);const iw=image.width*scale,ih=image.height*scale;
          page.drawImage(image,{x:(612-iw)/2,y:(792-ih)/2,width:iw,height:ih});
        }else{
          const source=await PDFDocument.load(bytes,{ignoreEncryption:true});
          const pages=await pdf.copyPages(source,source.getPageIndices());
          pages.forEach(page=>pdf.addPage(page));
        }
      }
    }

    const bytes=await pdf.save();
    const blob=new Blob([bytes],{type:'application/pdf'});
    const url=URL.createObjectURL(blob);
    const date=new Date().toISOString().slice(0,10);
    const filename=`Andrew_Blake-Newton_Will_Saville_References_Final_Packet_${date}.pdf`;
    const link=$('#packet-download-link');
    if(link){if(link.dataset.objectUrl)URL.revokeObjectURL(link.dataset.objectUrl);link.dataset.objectUrl=url;link.href=url;link.download=filename;link.hidden=false;link.textContent=`Download ${filename}`;}
    const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();
    setStatus(status,`Final packet built with ${responses.length} reference${responses.length===1?'':'s'} and ${docs.filter(d=>packetFiles.has(d.id)).length} attached supporting document${docs.filter(d=>packetFiles.has(d.id)).length===1?'':'s'}.`,'success');
  }catch(err){setStatus(status,String(err&&err.message||err),'error');}
}

function renderShareState(share){
  share=share||{};
  const published=$('#admin-published-url');
  const link=$('#admin-share-link');
  const note=$('#admin-share-note');
  if(published&&share.publishedTargetUrl)published.value=share.publishedTargetUrl;
  if(link)link.value=share.shareLink||'';
  if(note)note.textContent=share.note||'';
  const rotate=$('#admin-share-rotate');
  const copy=$('#admin-share-copy');
  if(rotate)rotate.disabled=!share.configured;
  if(copy)copy.disabled=!share.shareLink;
}

async function loadAdminSettings(){
  const session=getAdminSession();
  if(!session)return;
  try{
    const data=await apiPost({action:'admin.settings.get',sessionToken:session.sessionToken});
    const box=$('#admin-notifications');if(box)box.checked=!!data.sendResponseNotifications;
    renderShareState(data.shareLink);
    setStatus($('#admin-settings-status'),`Form settings loaded.`,'success');
  }catch(err){
    if(/session|auth/i.test(String(err&&err.message||err))){clearAdminSession();adminUiState('email');}
    setStatus($('#admin-settings-status'),String(err&&err.message||err),'error');
  }
}

async function saveAdminSettings(){
  const session=getAdminSession();if(!session){adminUiState('email');return;}
  const enabled=!!$('#admin-notifications')?.checked;
  const status=$('#admin-settings-status');setStatus(status,'Saving notification setting...','pending');
  try{
    const data=await apiPost({action:'admin.settings.update',sessionToken:session.sessionToken,sendResponseNotifications:enabled});
    const box=$('#admin-notifications');if(box)box.checked=!!data.sendResponseNotifications;
    renderShareState(data.shareLink);
    setStatus(status,data.sendResponseNotifications?'Response notification emails are enabled.':'Response notification emails are disabled.','success');
  }catch(err){setStatus(status,String(err&&err.message||err),'error');}
}

async function loadShareLink(){
  const session=getAdminSession();if(!session){adminUiState('email');return;}
  const status=$('#admin-share-status');setStatus(status,'Refreshing share-link status...','pending');
  try{
    const data=await apiPost({action:'admin.shareLink.get',sessionToken:session.sessionToken});
    renderShareState(data);
    setStatus(status,data.configured?'Share-link status refreshed.':'No share link is configured yet.','success');
  }catch(err){setStatus(status,String(err&&err.message||err),'error');}
}

async function updateShareLink(rotate=false){
  const session=getAdminSession();if(!session){adminUiState('email');return;}
  const status=$('#admin-share-status');
  const publishedUrl=String($('#admin-published-url')?.value||'').trim();
  if(!publishedUrl){setStatus(status,'Enter the published HTTPS URL for form.html first.','error');return;}
  setStatus(status,rotate?'Rotating share link...':'Creating or updating share link...','pending');
  try{
    const data=await apiPost({action:rotate?'admin.shareLink.rotate':'admin.shareLink.create',sessionToken:session.sessionToken,publishedUrl});
    renderShareState(data);
    setStatus(status,rotate?'Share link rotated. The previous share link is no longer valid.':'Share link is configured.','success');
  }catch(err){setStatus(status,String(err&&err.message||err),'error');}
}

async function copyShareLink(){
  const value=String($('#admin-share-link')?.value||'').trim();
  const status=$('#admin-share-status');
  if(!value){setStatus(status,'No share link is available to copy.','error');return;}
  try{await navigator.clipboard.writeText(value);setStatus(status,'Share link copied.','success');}
  catch(_){const input=$('#admin-share-link');input?.select();document.execCommand?.('copy');setStatus(status,'Share link selected. Copy it from the field if the browser blocked automatic copying.','success');}
}

async function deleteAdminResponse(responseId,name){
  const session=getAdminSession();if(!session){adminUiState('email');return;}
  if(!responseId)return;
  const ok=window.confirm(`Delete ${name||'this response'} permanently from the response sheet and trash its stored record file?`);
  if(!ok)return;
  const status=$('#admin-status');setStatus(status,'Deleting response...','pending');
  try{
    await apiPost({action:'admin.deleteResponse',sessionToken:session.sessionToken,responseId});
    setStatus(status,'Response deleted.','success');
    await loadResponses();
  }catch(err){setStatus(status,String(err&&err.message||err),'error');}
}

async function exportPdf(selectedOnly){
  const session=getAdminSession();
  if(!session){adminUiState('email');return;}
  const status=$('#admin-status');
  const checked=$$('.admin-response-select:checked').map(x=>x.value);
  if(selectedOnly && !checked.length){setStatus(status,'Select at least one response first.','error');return;}
  const emailCopy=!!$('#admin-email-copy')?.checked;
  const payload={action:'admin.exportPdf',sessionToken:session.sessionToken,emailCopy};
  if(selectedOnly)payload.responseIds=checked;
  setStatus(status,'Creating PDF export...','pending');
  try{
    const data=await apiPost(payload);
    setStatus(status,`PDF created with ${data.responseCount} response${data.responseCount===1?'':'s'}.`,'success');
    const link=$('#admin-pdf-link');
    if(link){link.href=data.pdfUrl||'#';link.textContent=data.pdfName||'Open PDF export';link.hidden=!data.pdfUrl;}
  }catch(err){setStatus(status,String(err&&err.message||err),'error');}
}

let adminInitialized=false;
function initAdmin(){
  if(adminInitialized)return;
  adminInitialized=true;
  const emailForm=$('#admin-email-form');
  const codeForm=$('#admin-code-form');
  const status=$('#admin-status');
  const session=getAdminSession();
  adminUiState(session?'dashboard':'email');
  if(session)Promise.all([loadResponses(),loadAdminSettings()]);

  emailForm?.addEventListener('submit',async e=>{
    e.preventDefault();
    const email=String(new FormData(emailForm).get('email')||'').trim();
    if(!email)return;
    setStatus(status,'Requesting a one-time sign-in code...','pending');
    try{
      const data=await apiPost({action:'admin.requestCode',email});
      $('#admin-email-hidden').value=email;
      adminUiState('code');
      setStatus(status,data.message||'If this email is authorized, a code has been sent.','success');
      $('#admin-code')?.focus();
    }catch(err){setStatus(status,String(err&&err.message||err),'error');}
  });

  codeForm?.addEventListener('submit',async e=>{
    e.preventDefault();
    const email=$('#admin-email-hidden').value;
    const code=String(new FormData(codeForm).get('code')||'').trim();
    setStatus(status,'Verifying code...','pending');
    try{
      const data=await apiPost({action:'admin.verifyCode',email,code});
      setAdminSession(data);adminUiState('dashboard');setStatus(status,'Admin signed in.','success');
      await Promise.all([loadResponses(),loadAdminSettings()]);
    }catch(err){setStatus(status,String(err&&err.message||err),'error');}
  });

  $('#admin-back-email')?.addEventListener('click',()=>{adminUiState('email');setStatus(status,'');});
  $('#admin-refresh')?.addEventListener('click',()=>Promise.all([loadResponses(),loadAdminSettings()]));
  $('#admin-save-settings')?.addEventListener('click',saveAdminSettings);
  $('#admin-share-create')?.addEventListener('click',()=>updateShareLink(false));
  $('#admin-share-refresh')?.addEventListener('click',loadShareLink);
  $('#admin-share-rotate')?.addEventListener('click',()=>updateShareLink(true));
  $('#admin-share-copy')?.addEventListener('click',copyShareLink);
  $('#packet-export-selected')?.addEventListener('click',()=>buildFinalPacket(true));
  $('#packet-export-all')?.addEventListener('click',()=>buildFinalPacket(false));
  $('#admin-export-selected')?.addEventListener('click',()=>exportPdf(true));
  $('#admin-export-all')?.addEventListener('click',()=>exportPdf(false));
  $('#admin-select-all')?.addEventListener('change',e=>$$('.admin-response-select').forEach(x=>x.checked=e.target.checked));
  $('#admin-responses')?.addEventListener('click',e=>{
    const btn=e.target.closest('[data-delete-response]');if(!btn)return;
    deleteAdminResponse(btn.dataset.deleteResponse,btn.dataset.deleteName);
  });
  $('#admin-logout')?.addEventListener('click',async()=>{
    const session=getAdminSession();
    try{if(session)await apiPost({action:'admin.logout',sessionToken:session.sessionToken});}catch(_){}
    clearAdminSession();adminResponses=[];adminUiState('email');setStatus(status,'Signed out.','success');
    $('#admin-responses').innerHTML='';
  });
}

function bindPageLinks(){
  $$('[data-open-page]').forEach(el=>el.addEventListener('click',e=>{
    e.preventDefault();
    const id=el.dataset.openPage;
    const route=$(`.page-route[data-page="${id}"]`,surface);
    route?.click();
  }));
}

window.addEventListener('DOMContentLoaded',()=>{
  bindPageLinks();
  initCounters();
  initReferenceForm();
  initPacketOrganizer();
  if(location.hash==='#admin')initAdmin();
  checkBackend();
});
window.addEventListener('hashchange',()=>{
  if(location.hash==='#admin')initAdmin();
});
})();
