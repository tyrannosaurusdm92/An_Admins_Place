/* Jasper Fanfiction — automatic adult-only canon-era helper.
 * Jasper is a fixed adult reader (born 1999). The private project never asks
 * the user to maintain participant-age lists or repeated 18+ confirmations.
 */
(function(global){'use strict';

function context(series={}){
  const enforced=global.JasperFanfictionAdultContract?.enforceAdultEra?.(series)||{series:{...series},gate:{ok:true},adjusted:false};
  return {
    fandom:enforced.series.fandom||'',
    canon_window:enforced.series.canon_window||'',
    adult_validation:enforced.gate,
    automatic_adult_era:enforced.adjusted,
    user_confirmation_required:false
  };
}

function validateAdults({series={}}={}){
  const enforced=global.JasperFanfictionAdultContract?.enforceAdultEra?.(series)||{gate:{ok:true},adjusted:false};
  return {...enforced.gate,adultConfirmed:true,user_confirmation_required:false,automatic_adult_era:enforced.adjusted};
}

global.JasperFanfictionCanonEra=Object.freeze({validateAdults,context});
})(typeof globalThis!=='undefined'?globalThis:window);
