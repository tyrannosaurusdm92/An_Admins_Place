/* Run with Node from the repository root: node tests/backend-3d-smoke.js */
const fs=require('fs');
const vm=require('vm');
const code=fs.readFileSync('backend/Code.gs','utf8');
const properties={};
const context={
  console,JSON,Date,Math,Array,Object,String,Number,Boolean,RegExp,Error,Map,Set,
  Utilities:{getUuid:()=>`test-${Math.random().toString(36).slice(2)}`,sleep:()=>{},computeDigest:()=>[],base64Encode:()=>'',base64Decode:()=>[]},
  PropertiesService:{getScriptProperties:()=>({getProperty:key=>properties[key]||'',setProperty:(key,value)=>properties[key]=value,deleteProperty:key=>delete properties[key]})},
  CacheService:{getScriptCache:()=>({get:()=>null,put:()=>{},remove:()=>{}})},
  LockService:{getScriptLock:()=>({tryLock:()=>true,releaseLock:()=>{}})},
  UrlFetchApp:{fetch:()=>{throw new Error('External provider must not be required by the fallback test.')}},
  ContentService:{createTextOutput:value=>({value,setMimeType(){return this}}),MimeType:{JSON:'json'}},
  DriveApp:{},SpreadsheetApp:{},Session:{getActiveUser:()=>({getEmail:()=>''})},MimeType:{},Logger:{log:()=>{}}
};
vm.createContext(context);
vm.runInContext(code,context,{filename:'backend/Code.gs'});
const result=context.SuperbotThreeD.generate({prompt:'a broad ceramic fountain with a low basin and carved fish details',realism:.8,detail:.85},{repo:'test/repository',projectId:'smoke-test',userId:'test-user',requestId:'test-request'});
if(!result?.ready||!result?.spec?.components?.length)throw new Error('3D procedural fallback did not produce an editable blueprint.');
console.log(JSON.stringify({mode:result.mode,ready:result.ready,name:result.spec.name,category:result.spec.category,components:result.spec.components.length,materials:result.spec.materials.length},null,2));
