(function(ns){
'use strict';
const U=ns.util,S=ns.store.state;
let creatorReady=false;
let pendingCreatorRequest=null;
let pendingStudioTransfer=null;

function id(name){return document.getElementById(name)}
function openModal(name){
  const backdrop=id('modalBackdrop'), modal=id(name);
  if(backdrop)backdrop.hidden=false;
  if(modal)modal.hidden=false;
}
function closeModal(name){
  const modal=id(name);
  if(modal)modal.hidden=true;
  const anyOpen=[...document.querySelectorAll('.modal')].some(m=>!m.hidden);
  if(!anyOpen&&id('modalBackdrop'))id('modalBackdrop').hidden=true;
}
function selectedProject(){return S.projects.find(p=>p.id===S.selectedProjectId)||null}
function projectContext(){
  const p=selectedProject();
  if(!p)return null;
  return {id:p.id,name:p.name,repository:p.repository,category:p.category,status:p.status,summary:p.summary,stack:p.stack,tags:p.tags,notes:p.notes};
}
function renderChat(){
  const c=ns.assistant.activeConversation(),root=id('chatLog');
  if(!root)return;
  root.innerHTML=c.messages.length?c.messages.map(m=>`<div class="message ${m.role==='user'?'user':'assistant'}"><span class="meta">${m.role==='user'?'You':'Assistant'} · ${U.date(m.createdAt)}</span>${U.escape(m.content)}</div>`).join(''):'<div class="empty-card">Ask about a project, repository, file set, implementation plan, or sorting problem.</div>';
  root.scrollTop=root.scrollHeight;
  const title=id('conversationTitle');if(title)title.textContent=c.title;
  const context=id('assistantContext');if(context){const p=selectedProject();context.textContent=p?`${p.name} · ${S.files.filter(f=>(p.fileIds||[]).includes(f.id)||f.projectId===p.id).length} indexed files`:'No project selected · local fallback enabled'}
}
function looksLike3DRequest(text){
  const q=String(text||'').toLowerCase();
  const asksCreation=/\b(create|generate|make|build|model|sculpt|design|construct|render|turn|convert)\b/.test(q);
  const subject=/\b(3\s*d|three[-\s]?dimensional|mesh|model|sculpt|object|asset|figurine|statue|prop|character|creature|furniture|vehicle|building)\b/.test(q);
  const meta=/\b(why|what is wrong|what's wrong|cannot|can't|doesn't|not working|fix|debug|explain)\b/.test(q)&&!(/\b(create|generate|make|build)\b/.test(q));
  return asksCreation&&subject&&!meta;
}
function readAsDataURL(blob){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(r.error||new Error('Could not read reference image'));r.readAsDataURL(blob)})}
async function attachedImages(){
  const output=[];
  for(const fileId of (S.chatAttachments||[]).slice(0,8)){
    const meta=S.files.find(f=>f.id===fileId);
    if(!meta||!(meta.type||'').startsWith('image/'))continue;
    const stored=await ns.store.db.get(fileId);
    if(!stored?.blob)continue;
    if(stored.blob.size>12*1024*1024){U.toast(`${meta.name} is too large for an in-browser reference transfer.`, 'error');continue}
    output.push({name:meta.name,type:meta.type,dataUrl:await readAsDataURL(stored.blob)});
  }
  return output;
}
function creatorPayload(prompt,referenceDataUrls,autoGenerate=true){
  const settings=ns.store.settings();
  return {type:'upad-create-3d',prompt,autoGenerate,referenceDataUrls,backendUrl:settings.backendUrl,project:projectContext()};
}
function sendCreatorPayload(){
  if(!creatorReady||!pendingCreatorRequest)return;
  const frame=id('creatorFrame');
  if(!frame?.contentWindow)return;
  frame.contentWindow.postMessage(pendingCreatorRequest,'*');
  pendingCreatorRequest=null;
}
async function launchCreator(prompt='',opts={}){
  openModal('creatorModal');
  const frame=id('creatorFrame');
  const refs=opts.references||await attachedImages();
  pendingCreatorRequest=creatorPayload(prompt,refs,opts.autoGenerate!==false);
  creatorReady=false;
  const src='creator.html';
  if(!frame.src||!frame.src.includes('creator.html'))frame.src=src;
  else setTimeout(()=>{creatorReady=true;sendCreatorPayload()},120);
}
function launchStudio(){
  openModal('studioModal');
  const frame=id('studioFrame');
  if(frame&&!frame.src)frame.src='studio.html';
}
function transferToStudio(data){
  closeModal('creatorModal');
  openModal('studioModal');
  const frame=id('studioFrame');
  pendingStudioTransfer={type:'upad-load-glb',name:data.name||'generated_3d_object.glb',buffer:data.buffer,spec:data.spec||null};
  const deliver=()=>{
    if(!pendingStudioTransfer||!frame.contentWindow)return;
    const payload=pendingStudioTransfer;
    pendingStudioTransfer=null;
    frame.contentWindow.postMessage(payload,'*',[payload.buffer]);
  };
  frame.addEventListener('load',()=>setTimeout(deliver,120),{once:true});
  frame.src=`studio.html?generated=${Date.now()}`;
}
function workflowJump(view){
  const button=document.querySelector(`.nav-button[data-view="${view}"]`);
  if(button)button.click();
}
function refreshProjectSelector(){
  const select=id('headerProjectSelect');if(!select)return;
  const current=S.selectedProjectId||'';
  const signature=S.projects.map(p=>`${p.id}:${p.name}`).join('|');
  if(select.dataset.signature!==signature){
    select.innerHTML='<option value="">No project selected</option>'+S.projects.map(p=>`<option value="${U.escape(p.id)}">${U.escape(p.name||'Untitled project')}</option>`).join('');
    select.dataset.signature=signature;
  }
  select.value=current;
}
function selectProject(projectId){
  S.selectedProjectId=projectId||null;
  ns.store.save();
  const proxy=document.querySelector(`[data-project-ai="${CSS.escape(projectId||'')}"]`);
  if(proxy)proxy.click();
  else{
    refreshProjectSelector();
    renderChat();
    const detailButton=document.querySelector(`.project-card[data-project-id="${CSS.escape(projectId||'')}"]`);
    if(detailButton)detailButton.click();
  }
}
function openProjectEditor(){
  workflowJump('directory');
  const p=selectedProject();
  if(p)ns.directory.toForm(p);
  const drawer=id('projectEditorDrawer');
  if(drawer){drawer.open=true;setTimeout(()=>drawer.scrollIntoView({behavior:'smooth',block:'start'}),50)}
}
async function route3DChat(event){
  const input=id('chatInput'),text=input?.value.trim();
  if(!text||!looksLike3DRequest(text))return;
  event.preventDefault();event.stopImmediatePropagation();
  input.value='';
  ns.assistant.add('user',text,{kind:'3d-request'});
  ns.assistant.add('assistant','Opening the AI 3D Creator. I will build an editable model immediately in the browser, use attached images as visual references, and keep every generated part available for manipulation and Effects Studio transfer.',{kind:'3d-launch'});
  renderChat();
  try{await launchCreator(text,{autoGenerate:true})}catch(error){U.toast(`Could not prepare the 3D creator: ${error.message}`,'error')}
}
function bindButtons(){
  const createButtons=['openCreator','heroCreate3D','quickCreate3D','dockCreate3D'];
  createButtons.forEach(name=>{const el=id(name);if(el)el.addEventListener('click',()=>{
    const prompt=id('chatInput')?.value.trim()||'';
    launchCreator(prompt,{autoGenerate:Boolean(prompt)}).catch(e=>U.toast(e.message,'error'));
  })});
  ['heroOpenStudio','dockOpenStudio'].forEach(name=>{const el=id(name);if(el)el.onclick=launchStudio});
  const heroImport=id('heroImport');if(heroImport)heroImport.onclick=()=>{workflowJump('sorter');id('sortFileInput')?.click()};
  document.querySelectorAll('[data-view-jump]').forEach(b=>b.onclick=()=>workflowJump(b.dataset.viewJump));
  document.querySelectorAll('[data-workflow-view]').forEach(b=>b.onclick=()=>workflowJump(b.dataset.workflowView));
  const newProject=id('directoryNewProject');if(newProject)newProject.onclick=()=>id('newProject')?.click();
  const editor=id('openProjectEditor');if(editor)editor.onclick=openProjectEditor;
  const choose=id('sorterChooseFilesTop');if(choose)choose.onclick=()=>id('chooseSortFiles')?.click();
  const build=id('sorterBuildTop');if(build)build.onclick=()=>id('previewSort')?.click();
  const projectSelect=id('headerProjectSelect');if(projectSelect)projectSelect.onchange=e=>selectProject(e.target.value);
  const form=id('chatForm');if(form)form.addEventListener('submit',route3DChat,true);
}
function bindMessages(){
  window.addEventListener('message',event=>{
    const data=event.data||{};
    if(data.type==='upad-creator-ready'){
      creatorReady=true;
      sendCreatorPayload();
    }else if(data.type==='upad-3d-ready'){
      ns.assistant.add('assistant',`3D model ready: ${data.name||'generated object'} with ${data.meshCount||0} editable parts. Refine it in the creator, export GLB/OBJ/STL, or send it directly into Effects Studio.`,{kind:'3d-ready',spec:data.spec||null});
      renderChat();
      U.toast('Editable 3D model created.','success');
    }else if(data.type==='upad-edit-generated-3d'&&data.buffer){
      ns.assistant.add('assistant',`Sending ${data.name||'the generated model'} into Effects Studio for painting, materials, text, transforms, and effects.`,{kind:'studio-transfer'});
      renderChat();
      transferToStudio(data);
    }
  });
}
function bindMutationRefresh(){
  const root=id('directoryList');
  if(root)new MutationObserver(refreshProjectSelector).observe(root,{childList:true,subtree:true});
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-project-select],[data-project-edit],[data-project-ai],#projectForm,#quickProjectForm,#deleteProject,#duplicateProject'))setTimeout(refreshProjectSelector,30);
  });
}
function init(){
  bindButtons();bindMessages();bindMutationRefresh();refreshProjectSelector();
  window.UPAD3D={launch:launchCreator,openStudio:launchStudio,looksLikeRequest:looksLike3DRequest};
}
document.addEventListener('DOMContentLoaded',init);
})(window.UPAD);
