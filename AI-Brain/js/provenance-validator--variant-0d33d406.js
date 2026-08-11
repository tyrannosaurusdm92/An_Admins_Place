(function(global){"use strict";
function validate(x){const errors=[];if(!x)errors.push("missing record");else{if(!x.source&&!x.provenance)errors.push("missing provenance");if(x.confidence!=null&&(x.confidence<0||x.confidence>1))errors.push("confidence out of range");if(x.status&&!["draft","active","deprecated","superseded","example"].includes(x.status))errors.push("unknown status")}return {ok:!errors.length,errors}}
const API={validate};if(typeof module!=="undefined"&&module.exports)module.exports=API;else global.AIBrainProvenanceValidator=API;
})(typeof globalThis!=="undefined"?globalThis:this);
