# Page Turn Engine Notes

The page turn is implemented with a 3D half-sheet on desktop and a full-sheet turn on narrow screens. During a turn the sheet receives:

- progressive Y-axis rotation;
- lift away from the page block;
- slight droop and skew to avoid a rigid-card look;
- dynamic fold ridges;
- a thicker curled outer edge;
- changing highlight/shadow density;
- drag-to-turn support with completion/cancel inertia;
- a local `assets/page-flip.wav` paper-rustle sound.

Reduced-motion browser preferences are respected for the floating cover. The sound may be disabled from the toolbar and the preference is saved locally.
