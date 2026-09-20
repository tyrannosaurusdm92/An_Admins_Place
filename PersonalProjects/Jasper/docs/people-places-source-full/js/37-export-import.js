(function(g){"use strict";const P=g.PeoplePlaces;
function exportWorld(world){const blob=new Blob([JSON.stringify(world,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`people-places-${world.id}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000)}
async function importWorld(file){const text=await file.text(),world=JSON.parse(text),v=P.WorldModel.validate(world);if(!v.ok)console.warn('Imported world validation warnings',v.issues);return world}
P.register('ExportImport',{exportWorld,importWorld});})(window);