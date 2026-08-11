/* AI-Brain generic capability extraction. Source group: active-session-runtime-b. Original UI shell omitted; embedded logic retained. */

    window.WorldBuilder_BACKEND_URL="https://script.google.com/macros/s/AKfycbxe3P6MBofPEhPfTAaz05TWEYhScX9QgpHzBKCdwPGnvzvVoyfllu0bAghZKqHs4E3hGg/exec";
    window.WorldBuilder_LIBRARY_REFERENCE="https://script.google.com/macros/library/d/1v06thwdjlv-j82hqHibJF3_gik7i8p9fFfK9nj0EOfi8VHhwT11jK5Eb/4";
  


document.addEventListener('DOMContentLoaded', function(){
  var b=document.getElementById('open-painterly-from-galaxy');
  if(b) b.addEventListener('click', function(){
    if(window.UniversalSimulatorViewerManager) window.UniversalSimulatorViewerManager.showPage('life');
    var p=document.querySelector('#life-native [data-view="painterly"]'); if(p) p.click();
  });
});



document.addEventListener('DOMContentLoaded',function(){document.querySelectorAll('[data-start-method]').forEach(function(b){b.addEventListener('click',function(){var m=b.dataset.startMethod;if(m==='continent'&&window.UniversalSimulatorWorkspace)UniversalSimulatorWorkspace.activateGlobe('continent');if(m==='upload'){var x=document.querySelector('#page-imports input[type=file]');if(x)x.click();}if(m==='superbot'){var t=document.getElementById('superbot-dock-toggle');if(t)t.click();}});});});
