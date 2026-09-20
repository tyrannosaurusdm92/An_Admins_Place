# explicit-bridge.js

`js/explicit-bridge.js` is the project's **single private-interlude handoff bridge**.

It does not replace `app.js`, the CYOA engine, the writer modules, or the Apps Script provider. It wraps the provider and attaches itself to:

```js
window.JasperFanfictionApp.explicitBridge
window.JasperFanfictionApp.generationBridge
```

Both properties point to the same bridge instance.

## Normal writer vs private bridge

The normal writer owns plot, banter, humor, slow burn, characterization, grammar, memory, continuity, plot-hole avoidance, relationship dynamics, praise/affirmations, aftercare/reconnection, and the next plot beat. It stops before nudity or sexual action.

The bridge owns only the bounded private interlude and the handoff/resume context.

## One placeholder

There is exactly one user-editable private instruction block. Search the project for the llama sentence and replace only the contents of that template literal.

If it has not been replaced, a private route throws `PRIVATE_BRIDGE_PLACEHOLDER_UNEDITED`. This is intentional: the normal writer is not allowed to fill the private section on its own.

## Literotica taxonomy reference

The exact user-provided `LITEROTICA_REFERENCE` object is stored in the bridge. It is sent as private-handoff metadata only. It does not replace canon character voice, Jasper's profile, William's writing style, or the story-first writer.

## Handoff data

The bridge preserves:

- parent chapter and selected choice;
- location/time and immediate scene state;
- dialogue thread;
- relationship and emotional state;
- consent/boundary continuity;
- open plot threads;
- the next authored chapter ID when available.

On return, the normal writer resumes with reconnection/aftercare, banter, dialogue, consequences, memory, and plot.
