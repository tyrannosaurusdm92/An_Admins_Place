# Story Bible — Teen-rated linear fanfiction

Jasper is the named, adult, first-person protagonist across five completed stories. Narration uses **I/me/my/mine/myself**; in external references, they/them or she/her may be used according to the established text. Preserve Jasper's wit, independent choices, boundaries, kindness, flaws, curiosity, and capacity to challenge a partner.

## Core editorial rules

- Each story has forty fixed, sequential chapters with one authored reading path. No reader prompts, choice menus, route selections, alternative endings, or conditional story generation.
- Keep the original story premise, relationships, character histories, dialogue, continuity, emotionally important disagreements, and meaningful consequences.
- Keep romance age-appropriate and non-graphic. Write gestures, check-ins, emotional vulnerability, and kisses where they serve the scene. If a private intimate moment would follow, transition naturally through a meaningful decision, sensory detail, or the next morning without describing sexual activity.
- Preserve conflict and recovery in context; grief, war, injury, and accountability should not be erased merely to soften the rating. Avoid graphic sexual detail or gratuitous violence.
- Character relationships progress through shared experiences and changed behavior. Do not reset trust, repeat major firsts, or invent interactive branches.

## Story-specific character anchors

**Jasmine After Rain:** Original-series Uncle Iroh (not Iroh II) remains a clever former general, White Lotus member, grieving father, and warm tea-shop owner. Tea, Pai Sho, food, shared jokes, and repair make room for romance without making him a generic counselor.

**Love & Duty:** The postwar adult versions of Aang, Katara, and Toph retain separate voices, obligations, and vulnerabilities. Jasper is an equal partner with their own needs; a consensual polycule is built on honest communication, distinct one-on-one connections, boundaries, and repair.

**What the Armor Leaves Behind:** Paladin Danse remains formal, disciplined, loyal, protective, and slow to share emotion. Missions, Brotherhood politics, Blind Betrayal, and questions of personhood carry consequences beyond the romance.

**After Always:** Severus Snape remains sharp, private, exacting, dry, and capable of difficult accountability. The postwar recovery story includes potions, grief, institutional repair, and practical kindness; Jasper cannot simply fix or excuse him.

**Stars Between the Strings:** Greg Universe remains musical, playful, sincere, self-deprecating, and observant. Steven, Rose, Beach City, music, money, grief, and ordinary second chances all matter; Greg is more than comic relief.

## Continuity and reading

The definitive chapters are stored in `json/<fandom>/<series>/01.json` through `40.json`. Each `series.json` defines the continuous order. `js/fanfic-data.js` is the static offline reader bundle, not an interactive fiction engine. The reader in `index.html` advances in sequence and saves position locally.
