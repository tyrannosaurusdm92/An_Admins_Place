# Jasper Story Writer + Private Bridge Boundary

This document is the authoritative runtime description for the current build.

## Responsibility split

The normal story writer owns:

- plot and chapter progression;
- banter and humor;
- slow-burn pacing;
- canon-character personality and distinct dialogue voice;
- first-person Jasper POV and grammar;
- continuous dialogue and scene continuity;
- memory/callbacks;
- relationship state and choice consequences;
- plot-hole auditing;
- boundaries/consent framing;
- praise, positive affirmations, emotional safety, and relationship rituals;
- aftercare/reconnection and the next plot beat after a returned private interlude.

The normal writer may build romance and sensual tension, but it stops at a clean choice/seam **before nudity or sexual action**. It does not replace that section with a censorship fade and it does not write the private interlude itself.

`js/explicit-bridge.js` owns only the bounded private-interlude handoff. It preserves the exact pre-handoff scene state, delegates to the user's single private instruction placeholder, and then returns the story to the normal writer.

## Single placeholder

There is exactly one searchable user-editable placeholder in the project. Search the project for the llama sentence. Replace only the text between the backticks in `js/explicit-bridge.js`.

While the placeholder remains unchanged, ordinary story generation works, but a private-interlude choice stops with `PRIVATE_BRIDGE_PLACEHOLDER_UNEDITED` instead of allowing the normal writer to cross the boundary.

## Literotica reference

The user-supplied `LITEROTICA_REFERENCE` object lives only in `js/explicit-bridge.js` and is attached to private-handoff context. It is not the normal writer's characterization source. Its rules explicitly preserve canon voice, Jasper's profile, and William's writing style.

## Story-first generation

Ordinary continuation uses `mature_on_page` as the backend compatibility mode and targets `@generate`.

A deliberately selected private route uses the compatibility target `@generate-explicit-detailed`; that target is now a routing signal only. The normal writer stops at the seam. The private bridge must be configured before the backend request can proceed.

When an authored next chapter exists, the private interlude is followed by `Return to the story`, which routes back to that authored chapter. The normal writer then owns reconnection, dialogue, emotional consequences, memory updates, and plot progression again.

## Adult-only rule

Jasper is fixed as an adult born in 1999. No repeated age checkbox or participant-age roster is required. The project automatically blocks explicitly under-18 scenarios and requires adult-era framing where canon characters have younger versions.
