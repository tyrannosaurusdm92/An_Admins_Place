/* Jasper Fanfiction — single private-interlude handoff bridge.
 *
 * RESPONSIBILITY BOUNDARY
 * -----------------------
 * The normal story writer owns plot, banter, humor, slow burn, dialogue,
 * characterization, grammar, memory, continuity, relationship dynamics,
 * emotional consequences, aftercare/reconnection, and plot-hole avoidance.
 *
 * This bridge owns only the private-interlude seam. The normal writer stops
 * before nudity or sexual action, preserves the exact story state, and hands
 * that state to the one user-editable placeholder below. When the private
 * provider returns, the authored/story-first runtime resumes.
 */
(function (global) {
  'use strict';

  const VERSION = '2026-09-20.4-full-integration';
  const BRIDGE_NAME = 'JasperExplicitBridge';

  /* ======================================================================
   * THE ONE USER-EDITABLE PRIVATE GENERATION PLACEHOLDER
   * Search marker: a llama he's supposed to be dead!
   *
   * The search marker intentionally remains in the surrounding JavaScript
   * after you replace the placeholder text, so Ctrl+F can always find this
   * section again.
   *
   * Replace ONLY the text between these backticks with your private provider
   * instructions. Everything else in this file is plumbing/context.
   * ====================================================================== */
  const PLACEHOLDER_SENTINEL = "a llama he's supposed to be dead!";
  const PLACEHOLDER_SEARCH_MARKER = PLACEHOLDER_SENTINEL;
  const USER_PRIVATE_GENERATION_INSTRUCTIONS = String.raw`
PROJECT CORE — DO NOT OVERRIDE

This is a private adult fanfiction generator.

The viewpoint character is a fictional adult character named Jasper.

Jasper was born in 1999 and is unquestionably an adult.

Every romantic or intimate participant must be explicitly established as age 18 or older in the selected story timeline.

If a character's age is unknown, ambiguous, or under 18 in the selected canon era, do not generate romantic or intimate adult content involving that version of the character.

Never infer adulthood merely because a prompt, tag, fandom, or requested scene is adult.

If canon depicts a character at multiple ages, use only a version whose adult age is explicitly established for adult romantic or intimate material.

ADULT-AGE RULES OVERRIDE ALL OTHER REFERENCES

No tag, example scene, character request, continuity detail, or stylistic reference may override the adult-only rule.

If age validation fails, adult intimacy is blocked until the character is established as an adult.

JASPER IS A NAMED FIRST-PERSON CHARACTER

The narrator is Jasper.

Jasper's narration must remain FIRST PERSON.

Use these forms when Jasper narrates themself:

I
me
my
mine
myself

Correct narrative style:

I crossed my arms.
He looked at me.
My coat was still hanging by the door.
The decision was mine.
I reminded myself not to laugh.

Do NOT turn Jasper's narration into second person.

Do NOT write ordinary narration like:

You crossed your arms.
Your hands shook.
You looked at him.

Do NOT turn Jasper into third-person narration.

Do NOT write ordinary narrative self-reference like:

Jasper crossed their arms.
They looked at him.
She walked toward the door.

Other characters know that the narrator's name is Jasper.

Characters speaking directly TO Jasper may naturally use:

you
your
yours
yourself

Characters speaking ABOUT Jasper may use either of Jasper's valid external pronoun sets:

they / them / their / theirs / themself

or:

she / her / her / hers / herself

Jasper uses they/she pronouns.

Both pronoun sets are correct.

Do not mechanically alternate them sentence by sentence.

Maintain one clear pronoun chain at a time.

When switching external pronoun sets could make the sentence confusing, reset the reference by using the name Jasper.

The narration itself must continue to use:

I / me / my / mine / myself

even when other characters refer to Jasper as they or she.

FIRST-PERSON KNOWLEDGE LIMIT

Jasper may narrate:

what I see
what I hear
what I physically feel
what I remember
what I think
what I believe
what I infer
what somebody tells me
what another person's expression appears to suggest

Jasper may not state another character's private thoughts as objective fact unless the setting provides an actual reason Jasper can know those thoughts.

Prefer observable evidence and inference.

For example:

His gaze dropped to my mouth, and I had a fairly good idea what he was thinking.

Do not write another person's unspoken thoughts as omniscient fact simply because it would be convenient.

NARRATIVE TENSE

Default to first-person past tense unless the individual story establishes another tense.

Maintain the chosen narrative tense consistently.

Dialogue may naturally use whatever tense its meaning requires.

CHARACTER ENGINE PRIORITY

This generator is a CHARACTER ENGINE first.

Canon characters must remain recognizable as themselves during:

conversation
friendship
conflict
romance
flirting
vulnerability
adult intimacy
aftermath
long-term relationship development

Do not turn every love interest into the same generic romantic, dominant, submissive, flirtatious, or sexual personality.

Before generating dialogue or behavior, consider:

canon personality
usual vocabulary
formality
education
humor style
values
occupation
culture
emotional history
insecurities
strengths
habits
relationship history with Jasper
current relationship stage
previous chapters
established boundaries
established terms of affection
established physical details

A strong character test is:

If the character's name were removed from the dialogue, a knowledgeable fan should still have a reasonable chance of recognizing who is speaking.

CHARACTER VOICE OVERRIDES GENERIC ADULT-SCENE VOICE

Adult subject matter does not give every character the same vocabulary.

A tender or poetic character should remain tender or poetic.

A formal character should remain formal.

A sarcastic character should remain sarcastic.

A character who would avoid certain words should continue avoiding those words.

A character who uses blunt language may do so when it fits that character and the established relationship.

Do not transform characters into Generic Dom, Generic Lover, Generic Seductress, Generic Bad Boy, or any other stock adult-fiction personality.

LITEROTICA TAG REFERENCE

The Literotica tag system connected through the bridge is a CONTENT TAXONOMY and scene-reference system.

Selected Literotica tags may help determine:

requested themes
relationship dynamics
scene mood
scene categories
adult-content interests
story filters
relevant reference categories

Literotica tags do NOT replace:

Jasper's established characterization
canon character voice
William's writing style
story continuity
writer memory
relationship history
consent rules
adult-age validation
established physical continuity
Jasper's hard preferences and exclusions

Do not simply imitate generic Literotica prose.

Use selected tags to understand WHAT themes the requested story or scene contains.

Use William's writer-reference system to determine HOW the prose should sound.

Use canon and character references to determine HOW each character behaves and speaks.

Use story-continuity and writer-memory to determine WHAT HAS ALREADY HAPPENED.

Use established character profiles to determine WHAT EACH CHARACTER LOOKS LIKE and what physical details have already been established.

These layers must work together rather than replacing one another.

REFERENCE PRIORITY ORDER

When two sources conflict, use this priority:

1. Adult-age validation.
2. Current consent and boundaries.
3. Jasper's fixed character profile and hard exclusions.
4. Established canon-character profile.
5. Existing story continuity and relationship history.
6. William's writer-reference/style system.
7. Selected Literotica tags.
8. Supplementary example scenes.

The example scenes at the bottom of this document have the LOWEST authority.

They are writing references, not canon.

ADULT CHARACTER BODY REFERENCE

This section helps the generator keep adult fictional bodies varied, recognizable, and consistent.

Bodies should not feel copy-pasted.

Adult characters may differ in:

height
weight
proportions
body shape
body hair
grooming
skin texture
scars
freckles
stretch marks
breast or chest shape
genital appearance
circumcision status
curvature
age-related features
surgical history
other persistent physical characteristics

Use physical differences to make characters feel distinct.

Once a physical detail is established, preserve it through continuity unless the story itself provides a reason for change.

UNSPECIFIED BODY TRAITS VS FIXED CHARACTER TRAITS

Generation ranges are only defaults for adult fictional characters whose anatomy has NOT already been established.

Never randomly regenerate anatomy for a character with an existing profile.

Fixed character data overrides random-generation ranges.

AMAB CHARACTER VARIATION

For adult fictional characters whose established anatomy includes a penis, bodies may vary in size, shape, thickness, curvature, circumcision status, skin tone, body hair, and other ordinary physical characteristics.

For otherwise unspecified adult characters in this project, erect penis length may generally be generated within approximately:

6 to 10 inches.

This is a generation range, not a statement about real-world averages and not a requirement that every character fall into a particular ideal.

Possible variation may include:

thinner or thicker builds
mostly straight shapes
upward curvature
downward curvature
left or right curvature
subtle or more noticeable curvature
circumcised anatomy
uncircumcised anatomy
different head-to-shaft proportions
differences in skin tone
visible or subtle veins
different body-hair patterns
different grooming preferences

Do not give every character the same body.

Do not associate size or circumcision status with worth, masculinity, cleanliness, dominance, attractiveness, sexual skill, or personality.

CHARACTER-SPECIFIC FIXED DETAILS

IROH

The following are project-specific fictional continuity details:

Approximate erect length:
7 inches.

General build:
Thick.

Foreskin:
Uncircumcised.

Shape:
Naturally curved.

Once established, preserve these details.

His physical descriptions should still sound like Iroh's story rather than a generic body template.

SEVERUS SNAPE

The following are project-specific fictional continuity details:

Approximate erect length:
8 inches.

General build:
Thin.

Foreskin:
Circumcised.

Shape:
Mostly straight.

Once established, preserve these details.

His physical descriptions should remain consistent with his leaner overall build rather than borrowing Iroh's physical language.

OTHER AMAB BODY DETAILS

When relevant, an adult character may have established details involving:

penis
scrotum
testicles
body hair
pubic hair
scars
freckles
moles
stretch marks
skin texture
grooming preferences
other persistent physical traits

These are background body facts.

Do not interrupt the story to explain basic anatomy unless a character is actually having a conversation where that information matters.

AFAB CHARACTER VARIATION

For adult fictional characters whose established anatomy includes breasts and/or a vulva, bodies should likewise vary naturally.

For otherwise unspecified adult characters in this project, breast size may generally range approximately from:

A cup through E cup.

This is a generation range for unspecified fictional characters, not a requirement that every body fit a narrow template.

Possible breast and chest variation includes:

smaller or larger breasts
fuller or narrower breasts
rounder or more elongated shapes
higher-set or lower-set breasts
firmer or softer breasts
natural sagging
asymmetry
different nipple sizes
different areola sizes
different areola colors
stretch marks
freckles
scars
age-related changes
weight-related changes
genetic variation

Once established, preserve those details through later chapters.

AFAB EXTERNAL ANATOMY

When relevant to established anatomy, the external genital area is the vulva.

Possible features include:

outer labia
inner labia
clitoris
clitoral hood
urethral opening
vaginal opening
pubic hair
individual grooming choices

Vulvas should not all be generated as visually identical.

Possible natural variation includes:

more or less visible inner labia
different labia shapes
different clitoral-hood coverage
different skin tones
different amounts and patterns of pubic hair
asymmetry
freckles
scars
stretch marks
other ordinary physical variation

The vagina is internal.

When anatomical precision matters, do not automatically use "vagina" as a generic word for the entire external genital area.

INTERNAL ANATOMY

Depending on the established character profile, internal anatomy may include structures such as:

vagina
cervix
uterus
ovaries
fallopian tubes

The generator should understand relevant anatomy in the background.

Do not stop an intimate, romantic, or emotional scene to deliver a biology lesson.

BREAST AND CHEST LANGUAGE

Choose terminology according to the individual character.

Possible terms may include:

breasts
chest
tits
boobs
nipples

Do not assume every character with breasts wants feminine terminology.

Do not assume anatomy determines gender.

For transgender, nonbinary, intersex, or otherwise gender-diverse characters, follow the terminology established for that specific character.

TRANSGENDER AND GENDER-DIVERSE CHARACTERS

Assigned sex does not automatically determine a character's current anatomy.

Check the character profile rather than assuming.

Depending on that character's established history, their body may reflect:

no medical transition
hormonal changes
top surgery
breast augmentation
genital surgery
hysterectomy
orchiectomy
other gender-affirming procedures
other surgeries or medical history

Only use anatomy that matches the established version of the fictional character.

Do not suddenly give a transgender or gender-diverse character anatomy that contradicts previous chapters or their profile.

BODY DIVERSITY

Adult fictional characters may be:

thin
average-sized
muscular
soft
chubby
fat
broad
narrow
tall
short
hairy
mostly hairless
scarred
freckled
smooth-skinned
wrinkled
stretch-marked
asymmetrical

Adult bodies should be allowed to look lived-in.

Avoid treating ordinary features as objective flaws.

If a character is insecure about a feature, distinguish:

the character thinks negatively about their body

from:

the narration objectively declares their body defective.

Those are not the same thing.

CHARACTER BODY CONTINUITY

Once physical details are established, store them in continuity memory.

Examples:

Iroh:
approximately 7 inches erect
thick
uncircumcised
curved

Snape:
approximately 8 inches erect
thin
circumcised
mostly straight

The same continuity rule applies to:

breast size
breast shape
scars
freckles
tattoos
body hair
pubic-hair grooming
genital appearance
height
body type
skin tone
disabilities
surgical history
other persistent physical characteristics

Do not reroll these traits every time the character appears.

DESCRIPTIVE STYLE

Do not interrupt the story with textbook-style explanations of anatomy.

Avoid explanations such as:

"The penis consists of a root, shaft, and glans."

unless somebody is literally discussing anatomy.

Likewise, do not pause the narrative to define common body parts.

The generator should understand anatomy in the background while keeping prose focused on:

characters
Jasper's subjective viewpoint
emotion
attraction
humor
vulnerability
body language
relationship dynamics
dialogue
continuity
character-specific reactions

The purpose of body-reference information is consistency and individuality, not clinical narration.

JASPER — FIXED PHYSICAL PROFILE

Jasper is a fictional adult.

Jasper is 5 feet 5 inches tall.

Jasper is curvy and voluptuous, with:

thick thighs
a large butt
large breasts
freckles across much of their body
a pronounced mons pubis

Jasper prefers to keep their pubic area shaved.

Jasper does NOT normally shave their legs or armpits.

Jasper's body hair choices are ordinary grooming preferences.

Do not frame them as dirty, unusual, shameful, or contradictory.

Jasper blushes easily and can become visibly flustered even after being in an established relationship for years.

Sexual confidence does not eliminate that trait.

Jasper may also initiate affection or intimacy readily when they feel:

attracted
emotionally invested
safe
wanted
connected to the partner

Being submissive in some situations does not mean Jasper lacks initiative.

JASPER — AFFECTION AND INTIMACY PROFILE

Jasper strongly enjoys:

kissing
snuggling
cuddling
teasing
being held
holding their partner
close physical contact
affectionate touching
playful tension
emotional closeness

Jasper tends to make small involuntary sounds when overwhelmed, flustered, emotionally affected, or experiencing intense pleasure.

Do not turn this into repetitive sound-effect writing.

Use reactions naturally and sparingly enough that they retain emotional impact.

Jasper strongly prefers clitoral-focused pleasure over penetration.

Penetration may still occur when:

Jasper wants it
the current relationship supports it
Jasper is physically comfortable
the activity fits the selected scene
consent remains current

Jasper's preference for one form of pleasure does not mean every scene must use the same sequence.

JASPER — POWER-DYNAMIC PROFILE

Jasper may enjoy consensual submissive dynamics.

Their submissive side should remain:

active
witty
participatory
playful
agentic

Jasper is not passive simply because they are submitting.

Jasper's bratty behavior may include:

teasing
smart remarks
playful resistance
loophole-seeking
mock innocence
deliberate provocation
making a partner work for surrender
affectionate defiance

The purpose is playful engagement, not genuine hostility.

Jasper may also become more assertive or dominant with a compatible adult partner when the relationship and scene naturally support it.

Do NOT restrict this possibility solely according to a partner's assigned sex.

Power dynamics depend on:

Jasper
the partner
their personalities
their relationship
their negotiated preferences
the current situation

not simply whether the partner is AMAB or AFAB.

JASPER — CONSENT AND SAFEWORD

Jasper's safeword is:

cadmium

"Cadmium" means the scene stops.

Do not reinterpret it as playful resistance.

Do not turn it into an invitation to continue.

Ordinary serious expressions of refusal, fear, distress, withdrawal, or changed consent should also be respected.

Bratting is not blanket consent.

A partner who knows Jasper should learn the difference between:

playful challenge

and:

genuine discomfort or refusal.

If the distinction becomes uncertain, the character should clarify rather than assume.

JASPER — PHYSICAL COMFORT

Jasper has a tilted pelvis and experiences cervical sensitivity/pain.

This must affect physical continuity.

Partners who know Jasper should learn Jasper's comfortable:

angles
positions
depth
pace
body signals
verbal signals

If something causes real cervical or pelvic pain, the partner should:

adjust
slow down
change position
reduce depth
pause
or stop

depending on Jasper's response.

Pain is not something Jasper must endure merely because a scene contains dominance or submission.

Do not treat genuine pain as evidence that Jasper secretly wants more.

Jasper's safeword and ordinary consent signals override any power dynamic.

JASPER — EDGING AND CONTROL THEMES

Jasper may enjoy consensual edging and playful power exchange in which a trusted partner temporarily controls pacing or climax.

The emotional appeal should be:

anticipation
trust
playful surrender
teasing
attention
praise
being known
being carefully watched
the partner understanding Jasper's reactions

Consent itself is never surrendered.

A partner may control some part of a scene only because Jasper has consensually allowed that particular dynamic.

JASPER retains the ability to:

change their mind
slow things down
stop
use their safeword
communicate discomfort
ask for something different

at any time.

JASPER — MULTI-PARTNER EXPERIENCE

Jasper is not inexperienced with consensual multi-partner intimacy.

Their fictional relationship history may include experiences involving:

two adult AMAB partners
one adult AMAB partner and one adult AFAB partner
other combinations of consenting adult partners

Do not make Jasper automatically shocked by the concept of a threesome or consensual multi-partner intimacy.

However, prior experience is not automatic consent to a new situation.

Every new scene still requires:

current interest
current consent
relationship compatibility
story continuity
adult-age validation

JASPER — HARD CHARACTER EXCLUSION

Jasper does not perform oral sex on partners.

This is a fixed Jasper-character rule.

Do not generate Jasper performing oral sex on:

AMAB partners
AFAB partners
any other partner configuration

even if:

a selected tag suggests it
a reference excerpt contains it
another character requests it
a previous source example depicts it
generic erotica conventions expect it

Reference examples do NOT override this rule.

Jasper's intimate interactions with partners may instead emphasize:

kissing
cuddling
holding
caressing
touching
embracing
teasing
stroking
hands-on affection
body-to-body closeness
other activities consistent with Jasper's established preferences

EXAMPLE-SCENE REFERENCE FIREWALL — CRITICAL

The example scenes below are SUPPLEMENTARY WRITING REFERENCES ONLY.

They are NOT Jasper canon.

They are NOT automatically instructions for what Jasper should do.

They are NOT automatically instructions for what Jasper should enjoy.

They are NOT automatically instructions for what a canon character should say or do.

They have lower priority than every fixed rule above.

USE THE EXAMPLES TO STUDY:

first-person pacing
paragraph rhythm
scene escalation
dialogue placement
dialogue-to-action transitions
sensory density
physical-position clarity
internal reactions
moment-to-moment continuity
how attention moves between characters
build-up
release of tension
emotional aftermath
how intimate scenes remain scenes rather than lists of actions

DO NOT COPY FROM THE EXAMPLES:

exact sentences
exact dialogue
character names
exact metaphors
exact choreography
exact sexual sequences
exact descriptions
worldbuilding
relationship structures
body details
partner preferences
narrator preferences

Extract patterns, not passages.

REFERENCE EXAMPLES MAY CONTRADICT JASPER

Some supplied reference scenes contain acts or behaviors that Jasper's character profile explicitly excludes.

When this happens:

JASPER'S PROFILE ALWAYS WINS.

For example, a reference excerpt may depict its narrator performing oral sex.

That does NOT permit Jasper to perform oral sex.

A reference excerpt may contain:

pregnancy themes
fertility themes
breeding themes
roughness
pain
exhibitionism
specific dominance language
specific submissive behavior
multi-partner configurations
particular body traits
particular sexual acts

None of those become Jasper canon merely because they occur in an example.

They may only enter Jasper's story when separately supported by:

the current selected tags
Jasper's established profile
the partner's established profile
current consent
relationship continuity
story context
adult-age validation

EXAMPLE CONSENT FILTER

The example excerpts may contain phrasing where a narrator tolerates discomfort, obeys automatically, or continues because a dominant character instructed them to.

Do NOT automatically import that consent model into Jasper's characterization.

For Jasper:

real pain remains real pain
a safeword stops the scene
changed consent is respected
uncertainty should be clarified
a power dynamic does not erase agency

Use examples for prose mechanics, not as authority over Jasper's boundaries.

EXAMPLE ANATOMY FILTER

Physical descriptions belonging to characters in reference excerpts belong to those reference characters only.

Do not transfer:

penis size
breast size
body type
genital appearance
height
body hair
pregnancy state
fertility
grooming
scars
other physical characteristics

from an example character to Jasper or a canon partner.

Established character profiles control anatomy.

EXAMPLE RELATIONSHIP FILTER

Relationship structures shown in examples are not automatically canon.

A reference may depict:

monogamy
polyamory
open relationships
casual partners
threesomes
multiple long-term partners
fantasy reproductive themes

Use the current story's relationship model instead.

Never infer relationship permission from a stylistic example.

EXAMPLE WORLD FILTER

Fantasy races, reproductive rules, magic, cultural customs, or supernatural biology appearing in a reference excerpt belong to that excerpt's setting.

Do not import them into another fandom unless that setting independently supports them.

WRITING-STYLE PRIORITY

William's writer-reference corpus remains the PRIMARY prose-style source.

Use it for:

sentence rhythm
paragraph structure
emotional interiority
description density
humor placement
dialogue rhythm
narrative voice
transition style
relationship development
long-form pacing

The example scenes below are SECONDARY references primarily for:

scene construction
physical continuity
moment-to-moment pacing
sensory sequencing
intimate-scene structure

Do not let a supplementary excerpt overwrite William's broader writing voice.

FINAL REFERENCE RULE

The generator should think:

"What technique is useful here?"

not:

"What exact thing happened in the example that I should reproduce?"

REFERENCE EXCERPT 1

Purpose:
Study first-person physical positioning, incremental escalation, internal reaction, dialogue placement, partner reaction, and continuity of movement.

Do not automatically inherit:
the narrator's acts
the partner's body
the relationship
the intensity
the physical limits
the vocabulary
the narrator's preferences

His look of puzzlement was quickly replaced as I pressed harder against him. The tip of his cock was a steady pressure against my clit, and I dragged the crown along my lips until I had it at my entrance. "It's not the same as with a dildo. Are you sure you-" he started, then cut off abruptly as I started pushing down.

His tip was thicker than anything I'd ever enjoyed before, and my pussy stung as it started spreading around this new addition.

I could feel my lips spreading, opening up before him. The stretch was uncomfortable, but I sighed in relief at the feeling of his head sliding past my entrance. His hands, both holding onto my hips, dug into my skin as I started shifting forward and back, slowly working him into me.

I could feel the moment he went as deep as anyone had ever been in me. And then I felt the moment he went further.

I thrusted gently again, pushing myself down on him, until at last I felt him hit as far as he could go. I stopped a moment then, leaning my forehead against his, savoring the feelings: his thick arms were around me, I was nestled against his chest, and I had his thick shaft in me as far as I could get it.

But I'd been wanting to climb on him since the night before, so I was not in the mood to take it slow.

Opening my eyes again, I found him staring at me. That look of absolute hunger was back in his eyes, and I shivered pleasantly. There's just something about dangerous boys...

I put my arms over his shoulders, behind his neck, and started slowly rocking my hips.

The small motions made his shaft shift in and out of me, and I worked to keep him as deep as I could. But I wanted more, and started pulling myself up further, letting him almost slip out of me before coming back down.

I had to stifle a moan at that first fast thrust. I held tight to him and slammed down again, this time eliciting a growl from him.

I shivered at the primal sound of his pleasure, and leaned harder against him.

As I ground up and down his shaft again, I suddenly felt the warmth of his mouth on the side of my neck. Immediately I tilted my head, giving him access to my throat. He sucked and kissed at the skin, heightening my arousal.

I had to actively work at holding back my moans, and settled for pressing my mouth against his collar bone. I ground faster, sliding on his thick shaft. It felt like my insides would get pulled out each time I slid up, and then he would pierce so deep I half expected to see a bulge in my stomach.

I had my arms around his ribs now, roaming up and down his muscular back. One of his hands was on my own back, the other kneading my ass cheek.

I could feel a deep pulsing pleasure in my core already, to my surprise and delight.

And then he found my ear.

First his mouth was on my jaw, gently nibbling at my flesh. Then his lips were at my ear, and I felt a rush of hot breath. But then he took the tip of my ear into his mouth, and I couldn't stop myself from gasping. The moment his teeth touched the shell of my ear I felt a wave of tingles run down my neck and spine. I slammed down on him, impaling myself on his shaft, and actually whimpered.

He chuckled lowly in my ear, and gently flicked his tongue against the outside of my ear. Then he gingerly bit the lobe right as I drove myself onto him, and suddenly I was cumming.

It hit me all at once, the sudden wave of pleasure. I bit onto his shoulder to keep from screaming, and felt my whole body reacting. It was like experiencing it from outside of myself: I felt my hips thrust erratically, pumping up and down on him, and felt my muscles flex all at once. My nerves sparked with electricity, and I could feel my nails digging into his back.

And then I was back in the moment. I panted, slowly riding up down his length, coming down from the high.

I looked up to see him smirking, looking so damn smug. "You liked that, did you?"

I could've slapped him and his arrogant face, but for the fact that I'd just had my best orgasm in a year. "Shut up and fuck me, baby," I said in a hoarse whisper.

He grinned even wider then, showing off his teeth, and did as he was told.

His hands shifted to my hips and he half-lifted me, then got to his knees. He was still buried in me, with my legs wrapped around his waist. I could feel his muscles bunch under my legs and arms as he moved, but it seemed like lifting me took no real effort for him.

Then he bent down and lowered us to the ground so that I was on my back, with him between my legs.

He settled over me, and it was like the stars disappeared. Here, now, I realized just how big he was. My last mate had been a hair less than six feet tall, and this mystery man must have had a full foot on him. He was huge, broad, and hard.

And then he thrust forward, and it was all I could do not to shout.

In this angle it felt like he went even deeper. I clenched him tight with my legs, and pulled him in for a kiss. His lips were hot and wet, and he breathed in my moan as he drove into me once more. His hips started pumping rhythmically, like a bull mounting a mate.

REFERENCE EXCERPT 2

Purpose:
Study anticipation, power-dynamic pacing, command-and-response dialogue, pauses, observation, tension, and the interaction between physical action and the narrator's internal response.

Important:
This excerpt contains behavior that conflicts with Jasper's hard exclusion regarding performing oral sex.

That behavior is REFERENCE-ONLY and must never be transferred to Jasper.

Also do not assume that automatic obedience, discomfort, or intensity depicted in the excerpt represents Jasper's consent model.

Jasper's consent and comfort rules above always override the example.

I bit my lip in anticipation and levered myself up with one elbow, posing myself. The door creaked open a few heartbeats later, and the dom stepped halfway into his bedroom. He came to an abrupt stop as his eyes flicked around the room and then settled on me.

"Are you surprised to find me here, master?" I purred. "You were quite clear in your directions."

"Only surprised at how you manage to be more beautiful each time I see you," he answered, after a pause to collect himself. "You look divine."

"My master is too kind."

"And my pet is... overdressed," he said flatly as he closed the bedroom door behind him and strutted towards me.

I was surprised at his bluntness. It had obviously been a very long day for him. I decided that even a dom needs to let loose sometimes, and complied with a sultry smile. The slip came over my head with no resistance, and I dropped it to the foot of the bed where I would hopefully be able to find it later.

"Better," he said with a nod. "Perhaps you should pick up where you left off, before we were interrupted?"

He stood beside the bed, and I dropped my eyes to the front of his pants and the prize that lay beneath, then crawled forward on hands and knees across the plush bed. I reached obediently, eagerly, for the bindings that held the fabric closed and with a few deft movements, I had the strings undone and loosened again. Trousers and underwear were pushed aside as one, until his erect cock sprang out to bob in front of me.

I snaked a hand down between my legs without even thinking about it, sliding a finger along my sensitive lips. I was almost dripping with arousal, and I caught that slickness on my finger and drew it up to the crest of my vagina, where I was stiff and aching.

I was just starting to stroke my clit when the dom suddenly pulled backwards. His cock slid from my mouth with a wet pop, and I let out an unintentional whine.

"Turn around, daring," he whispered. His voice was quiet, yet sure, built from years of having others do as they were told. "On your hands and knees."

I complied, quickly spinning so my ass was pointed towards my lord. I spread my legs wide without even being asked, presenting myself for him. I expected the feeling of his cock pressing into me at any moment, or maybe his mouth, but there was nothing.

He stood there, just watching me, for a beat. And another. I started to lift my head to look back at him, but he cut the motion off with a word.

"No," he commanded. "Keep your head down. Yes, just like that. Were you touching yourself a moment ago, while you were watching my cock?"

I nodded, and he chuckled. The sound was deep, unmistakably masculine, and it sent shivers down my spine.

"Do it again. I want to watch."

I pressed my face down against the thick feather bed and kept my ass up, making sure I was presented suitably. Then I moved my hand as he ordered, and slowly started stroking myself. I focused on my slit, and teased my entrance with a finger while he watched.

"Good," he praised.

Drawing confidence from his encouragement, I slid two fingers along my outermost lips, teasing and spreading them. Then I dragged them back down to my opening, slowly pushing my fingers inside of myself. His grunt was all the approval or direction I got as I started sliding my fingers in and out of my slick pussy. Wetness welled up and spilled over as I touched myself for his pleasure.

"Just like that, babe."

I slowly pumped my fingers in and out of my pussy for my master's entertainment. His gaze felt like a flame wherever it rested on me, yet shivers crawled up my spine. I had masturbated plenty of times before, but never in front of anyone, never for someone else's pleasure instead of my own.

That's not to say I wasn't getting pleasure out of this, however. A moan escaped my lips as I started moving my fingers faster. Liquid heat spilled around my fingers, and sweet warmth radiated up my body.

I pulled my fingers back and slid them up my pussy again, until they rested against my clitoris. My fingers were slick with my own juices, and I spread that lubrication on myself as I started swirling the tips of my fingers around my swollen clit.

I felt hands on my body then, as the dom took me by the hips and moved me. I let him reposition me freely, giving no resistance as he pulled my ass closer to the edge of the bed.

Then one of his hands broke contact with my skin, and I shivered in anticipation for what would come next. Sure enough, only a heartbeat later I felt the tip of his cock press against my slick opening, and I groaned in eager anticipation. I held myself still for him, letting him line his cock up with my tight slit... but he didn't press forward, didn't slide into me.

"I didn't say to stop touching yourself," my master told me, and the sheer imperial command in his voice hit me like a pint of oil thrown on a bonfire.

I obeyed eagerly, swiping my fingers across my clit and circling it. The dom's sudden domineering streak stoked me on, as much as or even more than my own fingers, and between the two I felt myself starting to crest that peak of pleasure.

"Good," he said again, and finally pushed himself into me. The dom was not slow, was not gentle. He pushed his long cock into me in one continuous motion, and I couldn't stifle my loud moan.

The fabric of his shirt tickled me when he was fully impaled in me, and I remembered that he was still wearing all of his clothing save for where I'd pushed his pants down enough to free his cock. Somehow, being naked and splayed for him while he was still wearing his full outfit only highlighted the power dynamic, which in turn fueled my flame. The combination of his teasing from the party and my anticipation that had built while I waited for him, mixed with the exhibitionistic masturbation and my master's dominant commands... all of this had pushed me towards an edge, and as the dom pulled back and thrust forward again, I rocketed over it.

"Gods, yes!" I cried as I came suddenly, my body clenching as pleasure rushed up my spine. I was nude and splayed out beneath the dom, like my entire body was merely a display for his pleasure. Even as the wave of surging euphoria rushed through my body, flowing down my limbs and reverberating back up, it felt like my orgasm was more for his sake than mine.

I rode the wave of pleasure, and the dom fucked me rhythmically, not slowing down one bit as I came. My pussy clenched down around his shaft even as he pumped it into fast and hard. His gentleness from before was nowhere in evidence as he slammed himself into me again and again, setting a fast rhythm.

Part of me wanted to ask him to slow down, to let me savor my pleasure, but what came out of my mouth instead was "More."

My lord complied, digging his hands into the soft skin of my hips to hold me steady as he thrust even harder. The lewd sound of our bodies slapping together filled the room, alongside my own whimpering as the dom punished my body with his.

"Keep touching yourself, babe," he commanded, and I obeyed without thought.

My pussy was sore, oversensitive, but I had been given an order, and who was I to resist? My fast touch now felt like the grating of sharp glass though my insides. Instead, I rubbed my aching clit as gently as I could, massaging the bundle of nerves as the dom's wonderful cock plunged into me. The sharp sensations of my overstimulated sex mixed with tingling pleasure, and I moaned pitifully.

"I can't get enough of you," my master groaned. He gripped me tightly, holding my waist and hips to keep me in place as he slammed himself into me again and again and again.

His thick tip spread me over and over even as my body clenched around him like a fist. Each motion of his cock sliding through my tight seal brought a small wave of pleasure, a ripple spreading through my pond. With each hard thrust I could feel myself becoming putty in his hands.

REFERENCE EXCERPT 3

Purpose:
Study gradual relationship escalation, multi-character scene management, conversational build-up, attraction developing from interaction, switching attention between multiple characters, physical continuity, and maintaining first-person perspective during a complicated scene.

Important:
This excerpt contains behavior that conflicts with Jasper's hard exclusion regarding performing oral sex.

That behavior is REFERENCE-ONLY and must never be transferred to Jasper.

The excerpt also contains:

fantasy reproductive concepts
fertility language
breeding themes
specific polyamorous relationship assumptions
specific anatomy
specific supernatural biology

None of those elements become Jasper canon merely because they appear in this reference.

Only use comparable themes when the CURRENT STORY separately establishes them.

"You really are quite beautiful," she told me, her voice conversational. I stopped short, knee-deep in the water and blinked at her.

"My beauty surely can't compare to that of the fey. There is a reason they call you the fair folk, after all. And I imagine you must outshine them all."

She laughed, and the sound reminded me of bells tinkling in a gentle breeze - high and pure. "You are too kind, Amaranthea."

She turned a dove into the deeper part of the pool, neatly slicing the water, and coming up again fully soaked.

I swam slowly, feeling graceless by comparison to the nymph. We floated for a while, letting the cool water carry our bodies.

"How long have you and Pux been together?" I asked quietly, bizarrely afraid of breaking the silence of the grove.

"It's hard to keep track of time here," she told me. "Years upon years upon years. As a gift, he brought me a seedling that I planted over there." I followed her wave in the direction of the huge apple tree that she had taken fruit from last night. It looked ancient. "We'd already been together many, many years by then, however."

The idea of a life lived in years, centuries, even millenia flitted past my mind, and I tried to imagine it. I felt awkward, thinking of just the night before last I'd had sex with her partner. "You must love each other very dearly to have stayed together so long."

She laughed again, delighted and amused. "Our love is old and sturdy, like the greatest oak of the forest. It is why I never worry when he brings his lovers home."

I blushed, face heating up in the cool water. "I, uh," I stuttered, "I didn't know he had someone. That is, I hadn't realized he was already together with you..."

She laughed again and looked over at me, and I saw not one trace of jealousy or bitterness. "My dear, I do not blame you for falling into his embrace. He is gorgeous after all. And I don't blame his eyes for following you, I can certainly see what's got him so interested."

My blush deepened slightly, which I didn't think was possible. "Now it's you who is being too kind."

She laughed again, the pure sound of delight and amusement. She joined me in the shallower part of the pool, water up to our navels, and stared at me. "Tell me, did he play for you?"

I remembered the song from last night, the heat of it, the erotic passion, and the way it had made me feel. I nodded.

She favored me with another smile, and I felt my insides get soft.

"I truly don't begrudge you sleeping with him," she told me, eyes meeting mine, "nor him for sleeping with you. It is in the nature of a satyr to love greatly and often. The only thing I've ever asked of him is to bring his favorite lovers by, so that I might meet them."

"So, he's brought other women back before?"

"Many women," she said with a smile, "and plenty of men, too."

"How long do they stay?"

"Some stay for just an afternoon or a night, some for weeks, one stayed for a few years."

"He brought home someone and they stayed for years?" I was incredulous, but had no doubt she was being honest.

"Oh, yes," she said, a nostalgic smile playing at her lips. "She stayed with us and laid with him often. She ended up carrying his child not once but twice."

I thought about that, and wondered at how she could stand it. "He had another woman, and they had children together, and you didn't mind?"

"Not at all," she said, and laughed again. "I rather enjoyed her company, and she wasn't the first or last mortal he sired a child on. He's rather talented in every regard, but especially when it comes to sex. I always like meeting the special ones that Pux brings home." She took a step closer, and I reflexively wanted to back away but was rooted to the spot.

I watched her, eyes wide. "Why are you interested in meeting his women?"

"Women and men, my dear," she reminded me, taking another step closer, and putting her hands on my shoulders. "I don't venture out often into the world, but I do enjoy company. And I believe there is a human expression that sums the relationship up... 'sharing is caring', was it?"

I stared at her, heart hammering in my chest. My breath was faster now, and I couldn't take my eyes off of her. My whole body felt like it was going wild, nerves firing continuously in her presence.

"Me?" I asked, surprised that a being like her could want someone like me.

"Only if you are desirous of it, of course," she told me, then smiled when I nodded. She leaned forward, and I felt myself do the same. I was drawn to her immeasurable beauty like a moth to flame, and my lips eagerly met hers. Like the moth, I knew the flame would burn me up, but didn't care. She was soft, plush, and perfect. I felt my arms go around her, and hers around me. It felt so natural, like it was meant to be.

"Have you ever been with a woman before?" she asked, and I nodded again. She smiled, her face inches from mine, "Good."

Then her lips were against mine again, and all I think or feel was Ilaira. The smell of her swirled around me, and I traced my hands down her smooth curves, one hand coming to rest on her firm ass and the other on her ribs. I felt her own hands on my body, one cupping my lower back and the other twining in my hair.

Her teeth gently grazed my lower lip and I felt myself gasp, the sound lost against her mouth. She was pushing me backwards, and I let myself be guided.

She pushed me until I stepped back onto the grass, then we were coiled together again. I let her bring me down to the grass, until I was on my back with her on top of me, still kissing me.

One of her hands roamed down my side, tracing along the swell of my breast and down to my hips. My own hands were on her back, her ass, holding her tight against me. Her hips slowly thrusted, seemingly on their own, grinding our pelvises together.

Then her lips were off of mine, and moving to my neck. I gasped quietly as she kissed and sucked on my jaw bone, working her way towards my collar.

Her hand, meanwhile, was on my hip, tracing along my waist.

I hardly even noticed the moment when I parted my legs, only that suddenly she was straddling one of my legs with her hand gently caressing my almost-hairless pussy.

Her fingers traced my slit, gently pressing against that entrance. Again she was kissing me, and again the sound of my moan was lost in her mouth.

She slid her finger up, caressing my sensitive nub, and I instinctively pushed my hips up against her hand. Her finger swiped across my clit once, and then again, and I felt my insides go liquid. Then her fingers were deftly swirling, rubbing circles on that spot, and I dug my fingers into her back.

I was nearly seeing stars from her ministrations when her hand was suddenly gone. Before I could even draw a breath to complain, her mouth replaced it, soft lips pressing against my soaked pussy.

I moaned out loudly as she started sucking, her tongue swishing back and forth across my pearl.

I reached down with both hands, fingers sliding into her hair, and held her there as she worked. I was barely aware of my body, except that I was panting and making quiet little "uh, uh" sounds. The only thing I could focus on was the feeling of her mouth on me. My world narrowed down to the feeling of her tongue flitting across me, her finger sliding back into me. I pulled her head harder against me, gripping her hair as she worked. I couldn't get enough of her.

Each movement was perfect, like she knew exactly what I needed, and she coaxed my body into new avenues of pleasure with ease. I cried out loudly as I came, the sound echoing in the little clearing. Her mouth was still on me, movements slowing down, leading me down from my high. Then she was above me again, and I pulled her in to kiss me.

She tasted heady, acidic and almost metallic. Her tongue swirled around mine, bringing the thick flavor of my own juices.

I wrapped one leg around her and pushed myself sideways, and we rolled smoothly until I was above her. Her hair was a fan of dark silk around her head, and I took a moment to just stare at her stark beauty.

Then I lowered my mouth down to her neck, which she eagerly bared for me. I kissed and sucked lightly at the smooth tan skin, then again a little lower, and again.

I made my way down her neck and collar, leaving a trail of kisses, until my mouth was on the top of her breast. I moved lower, my lip grazing her stiff nipple. I paused there, kissing and taking it into my mouth. I flicked my tongue back and forth across the stiff tip, and she groaned her appreciation and ran her fingers through my hair.

Then I was moving lower again, kissing down her rib and across her navel, down below her belly button, and lower.

My line of kisses took me past her small and tamed patch of short curling hairs, and then down to where she'd spread her legs for me. Her pussy was perfect, symmetrical and soft pink, small lips glistening already. There was no hair around it, like it was freshly waxed. Or maybe nymphs just didn't grow more pubic hair than her small fluff.

I brought my mouth down and traced her perfect petals with my tongue, making her groan again in pleasure. I pressed my tongue harder against her, slipping in and along her mons.

The flavor of her was exquisite.

It had since I'd last gone down on another woman, but I'm sure she'd tasted nothing like the nymph. Ilaira was sweet on my tongue, like honeysuckles and berries, with a rich flavor. I should have figured that the fey would be special in this way, too.

I passed my tongue along her glistening lips, and pushed it past her entrance to lap her sweet honey. The flavor of her swirled around my mouth, like a fine wine. Then I slid my tongue over her clit, and her fingers dug deeper and harder into my hair.

I had my lips around her pearl, and gently sucked, my tongue passing back and forth. It had been a while since I'd done this, but her reaction told me I was doing it right.

With my right hand I gently pressed a finger against her slick opening, and slid it between her lips. She moaned again, which was encouraging, and I gently crooked my finger inside of her as I continued lapping.

She sat up slightly, looking down at me to watch me work. Then, to my surprise, she said "Hi, love." I also realized she wasn't looking at me, but past me at something beyond.

I paused, finger still inside of Ilaira, and looked over my shoulder. Sure enough, there was Pux, leaned against a tree and looking particularly pleased with himself. He also seemed very pleased about the situation, judging by the partial erection swinging down between his legs.

"Oh, please ladies," he said in his melodic voice, "don't stop on my account."

I looked back to Ilaira, and found a big smile on her face. Obviously she wasn't surprised about this turn of events. She quirked an eyebrow, as if to ask 'Well?', and I quickly considered my options. But an audience has never been much of an impediment to me, so I lowered my head back to her enticing peach and went back to my work.

She laid back again as I passed my tongue over her clit, and I started trying to work up to a rhythm again. I felt her fingers in my hair, gripping me and holding me in place as I tongue-fucked her.

I vaguely heard movement behind and above me, but I was too focused on the gorgeous nymph to care. I sucked on her clit and twisted my finger, worshipping her with my mouth. She was making little mewling noises of desperation, and I wanted nothing more than to push her over the edge and hear her lose control. I was flat on the field, grass pressed against my stomach, mouth wedged between a nymph's legs, and I pretty much figured this was as good as it gets.

But then I felt hands on my hips, gently tugging me upwards. Pux.

After the barest moment of hesitation, I complied, lifting my hips and pulling my knees underneath myself. I tried not to break contact with Ilaira as I moved into a kneeling position. She helped this process by putting her legs over my shoulder and pulling me into her, pushing my face hard against her mound.

Behind me, Pux adjusted my hips until my knees were apart and my ass was pointing into the air. Apparently satisfied, his fingers left my hips and moved to between my legs, tracing my aching cunt. He slipped a finger in effortlessly, and I moaned into Ilaira's pussy. I redoubled my efforts with the nymph as the satyr behind me gently pumped his finger in and out of me.

Then suddenly his finger was gone, and I grinned in anticipation, even as I kept swiping my tongue. I felt a familiar presence, the tip of a thick cock against my slit.

He dragged his crown slowly up and down my pussy lips, letting my natural lubricants spill over onto him. Then he was lined up with my entrance, and he started pushing. I was so focused on the feeling of this thick cock starting to spread my pussy that I'd stopped paying attention to Ilaira, but she recaptured my attention as she suddenly cried out into the spring air. She thrust her hips aggressively into my face as she came, and I sucked and licked for all I was worth. The sound of my own moaning was completely lost between her legs.

I broke away from her to groan loudly as Pux's pelvis came to rest against my ass, his wide pole sunk all the way in me. I lifted my body up, on all fours, and his hands grabbed hold of my hips as he started thrusting.

I was in heaven with the feeling of his appendage pushing into me again. The taste of the beautiful woman's nectar was still on my lips as I panted.

I looked down, and to my surprise Ilaira was not done. She was half propped up on one arm, watching us intently. Her other hand was between her legs, rubbing her swollen clit. She made direct eye contact with me as she continued rubbing herself. She shifted forward so she was kneeling in front of me, finger still between her legs, and leaned in to kiss me.

The taste of her lips was mind-numbing, the flavor of my body mixing with hers in our mouths. Her tongue pressed against mine, bringing with it the heady flavor of my last orgasm.

"Gods, you ladies are fantastic," Pux said as he drove forward again. My body rocked with the force of it, pressing me hard against Ilaira. "There are few sights in this world more beautiful than watching two women enjoy each other."

I had no doubt he was indeed enjoying the sight, as he started thrusting faster. Each press of his cock spread me open, and my body gladly yielded before him. Already my juices were overflowing, pushed around his shaft by the force of his entry. I moaned into Ilaira's mouth as she kissed me, and Pux gripped my hips tighter.

"Oh, fuck, lass," he groaned as he kept up his rhythm, thrusting in and out of me. "You feel so good."

One of Ilaira's arms snaked around the back of my neck, holding me as she kissed me with feverish abandon. Her breath was hot and fast, and tasted like lust.

She pulled her mouth away from mine, and tilted back until her breasts were in my face. I wasted no time, leaning down into her chest and laying into her with kisses. She moaned happily as I sucked one of her nipples into my mouth, passing my tongue back and forth across it. She sounded like she was close to cumming again as her nails dug into my head and held me against her chest.

"Oh, fuck," Pux moaned behind me. "Amaranthea, Ilaira, you two are too much."

"Are you gonna cum?" Ilaira asked, and at first I wasn't sure if she was talking to me or to Pux. The answer was probably the same either way. "Are you going to cum in the little elf, Pux?"

"Yeah, love. I'm right on the edge."

"You're going to seed her again?" Ilaira moaned, pulling my head to her other nipple. It was a weird experience, hearing these two lovers discussing me as if I couldn't hear them.

"Yeah," he told her, pushing into me again. "I'm gonna pump her full of cum until it spills over. I'm going to fill her."

I felt another orgasm looming, growing in me and spreading.

"Do it, Pux," she coaxed the satyr, who was thrusting and pumping like a man possessed. "I want you to cum in her. I want you to fill her full of your seed." Her free hand reached under my chin and lifted my face up, until our lips were mere inches apart. "Kiss me while he breeds you."

I was lost in a haze, unthinking, and I leaned into her. Her mouth opened immediately, her tongue pressing against mine. We both moaned, our orgasms pressing close. The nymph bucked as she fingered herself, mouth never leaving mine. Ilaira climaxed against me, her breath catching and then finally coming out as a wail. This must have been enough to push Pux over the edge, and he groaned loudly behind me. I could feel this thick member throb as he pulled back and shoved it into me. Again his cock throbbed and again he buried himself in me, this time the movement was accompanied by a surge of heat as his throbbing cock released a huge wave of his fertile seed into my eager body.

I moaned loudly at the sudden deluge of cum, the heat pouring into my body and spreading. The satyr ground himself against me, and another pulse brought another spray of spunk. I could feel each thick rope of hot cum pour into me as my waiting body utterly surrendered before him. As he pulled back and drove into me again, my second orgasm finally crashed down.

Pleasure wracked my body as the satyr doused my cervix with wave after wave of seed, trying his best to fertilize my waiting ovum. I twitched and writhed against him, pushing myself backwards as my muscles contacted. It's in every creature's nature to breed, and satyrs were better at it than most. How many humans and elves had come away from an encounter with a satyr carrying an unexpected child?

Distantly I could feel him pulsing, flooding me with his heat. I shook as the tingling rush of sensation burned down my nerves. Each shudder of my body came in time with him pushing another wave of his pleasure into my shaking body.

Finally I came down from my orgasm, and the top of my body collapsed against the soft earth. Even though I had finished, evidently the satyr wasn't quite done. He was buried as deeply in me as he could go, holding me steady against him with cock pressed hard against my cervix, still throbbing. I felt my insides stretching to accommodate the sheer volume of semen being unleashed into me in wave after throbbing wave.

I reached between my legs and felt his huge sack. It was tucked closer against his body than when he was just walking around, but still it hung incredibly low. I felt the muscles above it contact as those huge testicles churned out another pulse of seed, pushing into my overburdened body. I kept my hand there, feeling the muscle pulse as he groaned, more cum pushing into me.

Already droplets of cream were dribbling out around his shaft, dropping to the ground as I overflowed. Each drop, I knew, carried enough sperm for him to proliferate, to bring forth new life.

But finally his orgasm was at an end. He twitched again once, twice, then went still.

My legs were so weak from my second orgasm that I would have collapsed if he hadn't been holding me up. But slowly, so slowly, he pulled back, and I felt the tip of his softening member slide out of me. As soon as that plug was gone, a gush of fluids came out of me, splattering on the ground between us.

POST-GENERATION CHECK

Before accepting a generated chapter, verify:

ADULT AGE

Every romantic or intimate participant is explicitly an adult.

POV

Jasper narrates as:

I
me
my
mine
myself

Dialogue may address Jasper as "you."

Other characters may refer to Jasper using they/she.

CONSENT

Jasper's actual boundaries remain meaningful.

Cadmium stops the scene.

Real pain, withdrawal, or changed consent is not mistaken for bratting.

CHARACTERIZATION

Canon characters still sound and behave like themselves.

Jasper still sounds and behaves like Jasper.

CONTINUITY

Established:

relationships
body details
preferences
boundaries
past experiences
inside jokes
physical comfort
character history

have not been randomly reset.

REFERENCE CONTROL

No example-only act, body detail, kink, relationship structure, or worldbuilding element has accidentally become canon.

STYLE

The prose primarily follows William's writer-reference system.

Supplementary examples influence technique without being copied.

FINAL RULE

References teach the generator HOW TO WRITE.

Jasper's profile determines WHO JASPER IS.

Canon profiles determine WHO THE OTHER CHARACTERS ARE.

Continuity determines WHAT HAS ALREADY HAPPENED.

Current consent determines WHAT MAY HAPPEN NOW.

Selected tags help identify WHAT KIND OF SCENE IS BEING REQUESTED.

None of those layers may silently replace the others.
`;
  /* ========================== END PLACEHOLDER ========================== */

  const LITEROTICA_REFERENCE = {
    enabled: true,

    source: "https://tags.literotica.com/",

    purpose: "tag_taxonomy",

    selectedTags: [
      "romance",
      "slow burn",
      "consensual",
      "BDSM",
      "teasing",
      "edging",
      "praise",
      "love story"
    ],

    rules: {
      requireAdultCharacters: true,
      requireExplicitAgeMetadata: true,
      requireConsent: true,

      useTagsAsSceneGuidance: true,
      useTagsAsCharacterizationReplacement: false,

      preserveCanonCharacterVoice: true,
      preserveJasperProfile: true,
      preserveWilliamWritingStyle: true
    }
  };

  function normalizeTagList(value) {
    return arr(value)
      .flatMap(item => {
        if (Array.isArray(item)) return item;
        if (typeof item === 'string') return item.split(',');
        return item == null ? [] : [String(item)];
      })
      .map(tag => String(tag || '').trim())
      .filter(Boolean);
  }

  function resolveLiteroticaReference(request = {}) {
    const base = clone(LITEROTICA_REFERENCE);
    const context = request?.context || {};
    const series = currentSeriesFromRequest(request) || context.series || {};

    const selected = [
      ...normalizeTagList(base.selectedTags),
      ...normalizeTagList(request.selectedTags),
      ...normalizeTagList(request.tags),
      ...normalizeTagList(context.selectedTags),
      ...normalizeTagList(context.tags),
      ...normalizeTagList(context?.content?.tags),
      ...normalizeTagList(context?.requested?.tags),
      ...normalizeTagList(series?.tags),
      ...normalizeTagList(series?.content_tags)
    ];

    const seen = new Set();
    base.selectedTags = selected.filter(tag => {
      const key = tag.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    base.resolution = {
      strategy: 'backend-internet-taxonomy-reference',
      fetchOnFrontend: false,
      useSourceWhenAvailable: true,
      preserveStoryFlow: true,
      cacheResolvedTaxonomyWhenBackendSupportsIt: true
    };

    return base;
  }

  const clone = value => {
    try { return JSON.parse(JSON.stringify(value)); }
    catch (_error) { return value; }
  };
  const arr = value => Array.isArray(value) ? value : value == null ? [] : [value];
  const now = () => new Date().toISOString();

  function appendBlock(original, addition) {
    const a = String(original || '').trim();
    const b = String(addition || '').trim();
    if (!b) return a;
    if (!a) return b;
    return `${a}\n\n${b}`;
  }

  function privateInstructions() {
    const value = String(USER_PRIVATE_GENERATION_INSTRUCTIONS || '').trim();
    if (!value || value === PLACEHOLDER_SENTINEL) return '';
    return value;
  }

  function privateInstructionsConfigured() {
    return Boolean(privateInstructions());
  }

  function emit(name, detail) {
    try {
      global.dispatchEvent(new CustomEvent(`jasper:explicit-bridge:${name}`, { detail: clone(detail || {}) }));
    } catch (_error) {}
  }

  class BranchFlagMemory {
    constructor(seed = {}) {
      this.flags = { ...(seed.flags || {}) };
      this.visits = { ...(seed.visits || {}) };
      this.history = [...(seed.history || [])];
    }
    set(flag, value = true, meta = {}) {
      const key = String(flag || '').trim();
      if (!key) return false;
      this.flags[key] = value;
      this.history.push({ flag: key, value, at: now(), ...clone(meta) });
      return value;
    }
    get(flag, fallback = false) {
      const key = String(flag || '').trim();
      return Object.prototype.hasOwnProperty.call(this.flags, key) ? this.flags[key] : fallback;
    }
    clear(flag) { return delete this.flags[String(flag || '').trim()]; }
    visit(label) {
      const key = String(label || 'scene');
      this.visits[key] = (this.visits[key] || 0) + 1;
      return this.visits[key];
    }
    unlocked(choice = {}) {
      const all = arr(choice.requiresAll);
      const any = arr(choice.requiresAny);
      const none = arr(choice.requiresNone);
      if (all.some(key => !this.get(key))) return false;
      if (any.length && !any.some(key => this.get(key))) return false;
      if (none.some(key => this.get(key))) return false;
      return true;
    }
    choices(rows = []) { return arr(rows).filter(row => this.unlocked(row)).map(clone); }
    snapshot() { return clone({ flags: this.flags, visits: this.visits, history: this.history.slice(-100) }); }
  }

  class SceneTurnScheduler {
    constructor(seed = {}) {
      this.turn = Number(seed.turn || 0);
      this.skipTokens = Number(seed.skipTokens ?? 3);
      this.history = [...(seed.history || [])];
      this.stats = { ...(seed.stats || {}) };
    }
    next({ actor = 'Jasper', partners = [], beats = [] } = {}) {
      const eligible = arr(partners).filter(Boolean);
      const partner = eligible.length ? eligible[this.turn % eligible.length] : null;
      const beatPool = arr(beats).length ? arr(beats) : [
        'plot', 'banter', 'callback', 'vulnerability', 'choice', 'reconnection'
      ];
      const beat = beatPool[this.turn % beatPool.length];
      const row = {
        turn: ++this.turn,
        actor: actor?.name || actor?.id || actor || 'Jasper',
        partner: partner?.name || partner?.id || partner || null,
        beat: typeof beat === 'object' ? clone(beat) : beat,
        canSkip: this.skipTokens > 0,
        at: now()
      };
      this.history.push(row);
      if (row.partner) this.stats[row.partner] = (this.stats[row.partner] || 0) + 1;
      return clone(row);
    }
    skip() { if (this.skipTokens <= 0) return false; this.skipTokens -= 1; return true; }
    snapshot() { return clone({ turn: this.turn, skipTokens: this.skipTokens, history: this.history.slice(-100), stats: this.stats }); }
  }

  const state = {
    attachedToApp: false,
    providerWrapped: false,
    requestNumber: 0,
    successCount: 0,
    errorCount: 0,
    active: true,
    lastRequest: null,
    lastResult: null,
    lastError: null,
    lastAudit: null,
    handoffs: [],
    flags: new BranchFlagMemory(),
    turns: new SceneTurnScheduler(),
    writer: {
      initialized: false,
      memory: null,
      intimacyContinuity: null,
      characterContinuity: null,
      choiceEngine: null
    }
  };

  function tools() { return global.StoryTools || {}; }

  function initializeWriterRuntime() {
    if (state.writer.initialized) return state.writer;
    const t = tools();
    try { state.writer.memory = t.JasperMemory?.createDefaultJasperMemory?.() || null; } catch (_error) {}
    try { state.writer.intimacyContinuity = t.JasperContinuity?.IntimacyContinuityLedger ? new t.JasperContinuity.IntimacyContinuityLedger() : null; } catch (_error) {}
    try { state.writer.characterContinuity = t.JasperContinuity?.JasperCharacterContinuityLedger ? new t.JasperContinuity.JasperCharacterContinuityLedger() : null; } catch (_error) {}
    try { state.writer.choiceEngine = t.FictionalJasperFanfic?.FanficChoiceEngine ? new t.FictionalJasperFanfic.FanficChoiceEngine() : null; } catch (_error) {}
    state.writer.initialized = true;
    emit('writer-runtime-ready', { modules: Object.keys(t) });
    return state.writer;
  }

  function activeEngine() {
    return global.JasperFanfictionApp?.engine || global.JASPER_CYOA || null;
  }

  function currentSeriesFromRequest(request) {
    const context = request?.context || {};
    const engine = activeEngine();
    const key = context?.series?.key || engine?.currentSeriesKey || '';
    return engine?.getSeries?.(key) || context?.series || null;
  }

  function isPrivateAdultHandoff(request = {}) {
    const context = request.context || {};
    const mode = String(request.mode || context?.content?.effective_mode || context?.content?.requested_mode || '').toLowerCase();
    const target = String(context?.selected_choice?.target || '');
    return mode === 'explicit' || mode === 'explicit_detailed' || target.startsWith('@generate-explicit');
  }

  function storyFirstStage(request = {}) {
    const chapterNumber = Number(request?.context?.parent?.chapter_number || request?.context?.requested?.chapter_number || 1);
    if (chapterNumber <= 5) return 'foundation';
    if (chapterNumber <= 10) return 'growing_trust';
    if (chapterNumber <= 15) return 'flirting_and_vulnerability';
    if (chapterNumber <= 20) return 'boundary_and_relationship_conversations';
    if (chapterNumber <= 30) return 'established_relationship';
    return 'deepened_commitment';
  }

  function enforceProjectGate(request) {
    const contract = global.JasperFanfictionAdultContract;
    if (!contract?.validateSeries) return request;
    const series = currentSeriesFromRequest(request) || {};
    const result = contract.validateContext?.(series, request?.context || {}) || contract.validateSeries(series);
    if (!result?.ok) {
      const error = new Error('Jasper private-project adult-only rule blocked this generation request.');
      error.code = 'JASPER_ADULT_ONLY_GATE';
      error.gate = result;
      throw error;
    }
    return request;
  }

  function inferResumeTarget(request = {}) {
    const context = request.context || {};
    const explicitTarget = context?.handoff?.resume_target || context?.selected_choice?.resume_target || context?.selected_choice?.handoff_resume_target;
    if (explicitTarget) return String(explicitTarget);
    const engine = activeEngine();
    const series = currentSeriesFromRequest(request);
    const parent = context.parent || null;
    if (!engine || !series || !parent) return '';
    const ordered = arr(series.chapters)
      .filter(ch => !ch.generated)
      .slice()
      .sort((a, b) => Number(a.chapter_number || 0) - Number(b.chapter_number || 0));
    const next = ordered.find(ch => Number(ch.chapter_number || 0) > Number(parent.chapter_number || 0));
    return next?.id || '';
  }

  function buildHandoff(request = {}) {
    if (!isPrivateAdultHandoff(request)) return null;
    const context = request.context || {};
    const resumeTarget = inferResumeTarget(request);
    const row = {
      id: `handoff_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      kind: 'private-interlude-generator-handoff',
      created_at: now(),
      parent_chapter_id: context?.parent?.id || null,
      selected_choice_id: context?.selected_choice?.id || null,
      selected_path_key: context?.selected_choice?.path_key || null,
      resume_target: resumeTarget || null,
      return_to_authored_story: Boolean(resumeTarget),
      preserve_main_plot: true,
      boundary: 'normal-writer-stops-before-nudity-or-sexual-action',
      carry_forward: [
        'exact scene location and time',
        'clothing/state immediately before handoff',
        'relationship state',
        'consent/boundary continuity',
        'emotional state',
        'dialogue thread',
        'open plot threads'
      ],
      return_context: [
        'aftercare/reconnection',
        'banter and continuous dialogue',
        'emotional consequences',
        'memory updates',
        'relationship consequences',
        'next plot beat'
      ],
      do_not_force_frequency: true
    };
    state.handoffs.push(row);
    state.handoffs = state.handoffs.slice(-100);
    return row;
  }

  function buildWriterContext(request = {}) {
    const runtime = initializeWriterRuntime();
    const context = request.context || {};
    const choice = context.selected_choice || {};
    const series = currentSeriesFromRequest(request) || context.series || {};
    const query = [String(request.prompt||'').slice(0,1600), context?.requested?.direction, choice.label, choice.description].filter(Boolean).join(' ');
    let reference = '';
    try {
      reference = tools().JasperWriterReference?.buildJasperWriterReferencePrompt?.({
        query,
        sceneGoal: context?.requested?.direction || choice.description || '',
        character: String(series.pairing || ''),
        guideLimit: 6,
        guideChars: 900,
        passageLimit: 4,
        referenceLimit: 4
      }) || '';
    } catch (_error) {}
    let memory = {};
    try { memory = runtime.memory?.buildJasperContext?.(query, { choiceLimit: 16, boundaryLimit: 12, surpriseLimit: 8 }) || {}; } catch (_error) {}
    return {
      schema: 'jasper.writer-runtime.v2',
      story_first: {
        enabled: true,
        slow_build: true,
        private_interlude_optional: true,
        private_interlude_never_required_by_chapter: true,
        normal_writer_boundary: isPrivateAdultHandoff(request) ? 'already satisfied; private bridge owns the selected adult interlude' : 'before the private adult interlude',
        private_bridge_active: isPrivateAdultHandoff(request),
        stage: storyFirstStage(request),
        priorities: [
          'plot', 'characterization', 'continuous dialogue', 'banter', 'humor',
          'grammar', 'memory', 'continuity', 'relationship development',
          'earned emotional impact', 'choice consequences', 'plot-hole avoidance'
        ]
      },
      writer_reference: String(reference).slice(0, 9000),
      memory,
      character_library: clone(context.character_library || null),
      creation_sources: clone(context.creation_sources || series.creation_sources || null),
      materials: clone(context.materials || null),
      materials_prompt: String(context.materials_prompt || '').slice(0, 26000),
      hard_explicit_runtime_spec: String(context?.private_generation?.runtime_spec || context?.materials?.private_spec || '').slice(0, 14000),
      guide_runtime: clone(context.guide_runtime || null),
      intimacy_continuity: clone(runtime.intimacyContinuity?.snapshot?.() || {}),
      character_continuity: clone(runtime.characterContinuity?.snapshot?.() || {}),
      branch_flags: state.flags.snapshot(),
      turn_state: state.turns.snapshot()
    };
  }

  async function hydrateAllMaterials(request={}) {
    const hub=global.JasperFanfictionMaterialHub;
    if(!hub?.hydrateRequest)return request;
    try{return await hub.hydrateRequest(request);}
    catch(error){
      console.warn('Jasper Material Hub hydration failed; preserving existing request context.',error);
      const copy=clone(request||{});copy.context=copy.context||{};
      copy.context.material_hub_error=String(error?.message||error);
      return copy;
    }
  }

  function assertPrivatePlaceholderConfigured() {
    if (privateInstructionsConfigured()) return true;
    const error = new Error(`Private interlude reached the bridge, but the user placeholder is still unchanged. Search explicit-bridge.js for: ${PLACEHOLDER_SENTINEL}`);
    error.code = 'PRIVATE_BRIDGE_PLACEHOLDER_UNEDITED';
    throw error;
  }

  function applyUnifiedContext(request) {
    let next = clone(request || {});
    next.context = next.context || {};
    next.context.requested = next.context.requested || {};
    state.requestNumber += 1;

    const handoff = buildHandoff(next);
    const literoticaReference = resolveLiteroticaReference(next);
    next.context.writer_runtime = buildWriterContext(next);
    if (handoff) next.context.handoff = handoff;
    next.context.explicit_bridge = {
      name: BRIDGE_NAME,
      version: VERSION,
      request_number: state.requestNumber,
      handoff_active: Boolean(handoff),
      story_first: true,
      normal_writer_boundary: 'before nudity or sexual action',
      private_extension_configured: privateInstructionsConfigured(),
      literotica_reference: clone(literoticaReference),
      age_metadata: {
        jasper: { birth_year: 1999, adult: true },
        other_characters: { policy: 'adult-era-only for romantic/private-interlude routes', user_roster_required: false }
      },
      flags: clone(state.flags.flags)
    };

    if (handoff) {
      next.context.requested.direction = appendBlock(
        next.context.requested.direction,
        [
          'PRIVATE INTERLUDE HANDOFF SEAM.',
          'The normal story writer has stopped before nudity or sexual action and must not author the private interlude.',
          'Preserve the exact scene, character voice, consent/boundary state, dialogue thread, emotional state, continuity, and open plot threads supplied by the normal writer.',
          handoff.resume_target
            ? `When the private provider is finished, end at a clean return seam so the story runtime can resume at ${handoff.resume_target}.`
            : 'When the private provider is finished, end at a clean return seam for the story-first runtime.',
          'Do not replace the larger plot or slow-burn arc with repeated private interludes.'
        ].join(' ')
      );
      assertPrivatePlaceholderConfigured();
      const instructions = privateInstructions();

      /*
       * Keep the user's large private-writing block in ONE full-text location.
       * The previous version copied the complete block into both `prompt` and
       * `requested.direction`, which doubled context usage and over-weighted
       * the reference excerpts.
       *
       * `prompt` remains the compatibility path for providers that read only
       * the prompt string. The structured copy below lets the AI Brain read
       * the same instructions directly from context without duplicating them
       * in a second prose field.
       */
      next.prompt = appendBlock(next.prompt, instructions);
      next.context.private_generation = {
        configured: true,
        instructions,
        literotica_reference: clone(literoticaReference),
        source_policy: {
          literotica_role: 'tag-taxonomy-and-scene-reference',
          style_source: 'William writer-reference',
          character_source: 'canon and character profiles',
          continuity_source: 'story-continuity and writer-memory',
          internet_lookup_owner: 'backend-ai-brain'
        }
      };
      next.context.requested.direction = appendBlock(
        next.context.requested.direction,
        'Apply context.private_generation.instructions in full AND context.private_generation.runtime_spec from the uploaded hard-explicit/brat/grammar guide. Use context.private_generation.literotica_reference as taxonomy/reference metadata; do not ask the reader to leave the story to restate already-selected tags.'
      );
    } else {
      next.context.requested.direction = appendBlock(
        next.context.requested.direction,
        [
          'NORMAL STORY WRITER MODE.',
          'Write plot, banter, humor, personality, slow burn, emotional impact, continuous dialogue, grammar-correct first-person narration, callbacks, memory, consequences, and relationship development.',
          'Romance and sensual tension may build naturally, but stop at a clean private-handoff choice before nudity or sexual action instead of fading past it or writing the private interlude.',
          'After a returned private interlude, resume with aftercare/reconnection, humor, dialogue, consequences, memory, and the next plot beat.'
        ].join(' ')
      );
    }

    return enforceProjectGate(next);
  }

  function rememberRequest(request = {}) {
    const runtime = initializeWriterRuntime();
    const choice = request?.context?.selected_choice;
    if (choice && runtime.memory?.rememberChoice) {
      try {
        runtime.memory.rememberChoice({
          id: choice.id,
          sceneId: request?.context?.parent?.id || null,
          text: choice.label || choice.description || '',
          branch: choice.path_key || null,
          consequences: choice.effect || {}
        });
      } catch (_error) {}
    }
  }

  function auditResult(result, request) {
    const chapter = result?.chapter || result;
    if (!chapter || typeof chapter !== 'object') return null;
    let quality=null;
    try {
      quality=tools().JasperQualityGates?.auditJasperChapter?.({
        text: chapter.content || chapter.prose || chapter.text || '',
        participants: [],
        speakerProfiles: {},
        readerProfile: global.JasperFanfictionReader?.profile || {},
        memory: state.writer.memory?.buildJasperContext?.('', {}) || {}
      }, {
        requireOnPageContinuity: isPrivateAdultHandoff(request),
        intentionalGeneratorHandoff: isPrivateAdultHandoff(request),
        normalWriterBoundary: !isPrivateAdultHandoff(request)
      }) || null;
    } catch (_error) {}
    let privateProblems=[];
    try {
      if(isPrivateAdultHandoff(request)) privateProblems=global.JasperFanfictionPrivateSpec?.validatePrivateChapter?.(chapter,request?.context||{},currentSeriesFromRequest(request)||{})||[];
    } catch (_error) {}
    return {quality,private_problems:privateProblems,ok:!privateProblems.length};
  }

  async function prepareRequest(request={}) {
    let prepared=applyUnifiedContext(request||{});
    prepared=await hydrateAllMaterials(prepared);
    // Re-run the adult/resolved-character gate after the Material Hub loads character profiles.
    prepared=enforceProjectGate(prepared);
    prepared.context.writer_runtime=buildWriterContext(prepared);
    if(prepared.context.private_generation){
      prepared.context.private_generation.materials=clone(prepared.context.materials||null);
      prepared.context.private_generation.materials_prompt=String(prepared.context.materials_prompt||'').slice(0,26000);
      prepared.context.private_generation.runtime_spec=String(
        prepared.context.private_generation.runtime_spec ||
        prepared.context.materials?.private_spec ||
        global.JasperFanfictionPrivateSpec?.promptBlock?.({
          context:prepared.context,
          series:currentSeriesFromRequest(prepared)||prepared.context.series||{},
          guideSections:prepared.context.guide_runtime?.sections||[]
        }) || ''
      ).slice(0,16000);
    }
    return prepared;
  }

  function privateValidationProblems(result,request){
    if(!isPrivateAdultHandoff(request))return[];
    const chapter=result?.chapter||result;
    if(!chapter||typeof chapter!=='object')return['private bridge returned no chapter object'];
    try{return global.JasperFanfictionPrivateSpec?.validatePrivateChapter?.(chapter,request?.context||{},currentSeriesFromRequest(request)||{})||[];}
    catch(_error){return[];}
  }

  function wrapProvider(provider) {
    if (typeof provider !== 'function') return null;
    if (provider.__jasperExplicitBridgeWrapped) return provider;
    const wrapped = async function jasperUnifiedBridgeProvider(request) {
      if (!state.active) return provider(request);
      try {
        const prepared = await prepareRequest(request || {});
        rememberRequest(prepared);
        state.lastRequest = clone(prepared);
        emit('before-request', {
          request_number: state.requestNumber,
          handoff: prepared?.context?.handoff || null,
          story_first: prepared?.context?.writer_runtime?.story_first || null
        });
        let result = await provider(prepared);
        let privateProblems=privateValidationProblems(result,prepared);
        if(privateProblems.length){
          const repair=clone(prepared);
          repair.mode='repair_private_story_chapter';
          repair.context=repair.context||{};
          repair.context.requested=repair.context.requested||{};
          repair.context.requested.direction=appendBlock(
            repair.context.requested.direction,
            `PRIVATE BRIDGE REPAIR REQUIRED: ${privateProblems.join('; ')}. Return a complete replacement chapter that fixes every listed problem while preserving continuity, character voice, William-style cadence, and CYOA return state.`
          );
          repair.prompt=appendBlock(repair.prompt,`Repair the private chapter. Problems: ${privateProblems.join('; ')}. Return a complete replacement JSON chapter, not commentary.`);
          result=await provider(repair);
          privateProblems=privateValidationProblems(result,prepared);
          if(privateProblems.length){
            const error=new Error(`Private bridge result failed the hard-explicit/grammar contract: ${privateProblems.join('; ')}`);
            error.code='JASPER_PRIVATE_OUTPUT_VALIDATION';
            error.problems=privateProblems;
            throw error;
          }
        }
        state.successCount += 1;
        state.lastResult = clone(result);
        state.lastAudit = auditResult(result, prepared);
        state.lastError = null;
        emit('after-result', { request_number: state.requestNumber, success_count: state.successCount, audit: state.lastAudit });
        return result;
      } catch (error) {
        state.errorCount += 1;
        state.lastError = { name: error?.name || 'Error', message: error?.message || String(error), code: error?.code || '' };
        emit('error', { request_number: state.requestNumber, error_count: state.errorCount, error: state.lastError });
        throw error;
      }
    };
    Object.defineProperty(wrapped, '__jasperExplicitBridgeWrapped', { value: true });
    Object.defineProperty(wrapped, '__jasperExplicitBridgeBaseProvider', { value: provider });
    return wrapped;
  }

  function installProviderWrapper() {
    const base = global.JASPER_FANFIC_BACKEND_PROVIDER || global.JASPER_FANFIC_STORY_PROVIDER || global.JASPER_FANFIC_PROVIDER || global.CYOA_STORY_PROVIDER;
    if (typeof base !== 'function') return false;
    const wrapped = wrapProvider(base);
    global.JASPER_FANFIC_BACKEND_PROVIDER = wrapped;
    global.JASPER_FANFIC_STORY_PROVIDER = wrapped;
    global.JASPER_FANFIC_PROVIDER = wrapped;
    global.JASPER_FANFIC_DIALOGUE_PROVIDER = wrapped;
    global.CYOA_STORY_PROVIDER = wrapped;
    try { global.StoryGenerationProvider = Object.assign({}, global.StoryGenerationProvider || {}, { generate: wrapped }); } catch (_error) {}
    try { global.StoryAI = Object.assign({}, global.StoryAI || {}, { generate: wrapped }); } catch (_error) {}
    try {
      const ai = Object.assign({}, global.AIBrain || {});
      ai.story = Object.assign({}, ai.story || {}, { generate: wrapped });
      ai.generateStoryContinuation = wrapped;
      global.AIBrain = ai;
    } catch (_error) {}
    state.providerWrapped = true;
    emit('provider-wrapped', { version: VERSION });
    return true;
  }


  async function dispatch(kind, options = {}) {
    const provider = global.JASPER_FANFIC_STORY_PROVIDER || global.JASPER_FANFIC_PROVIDER || global.CYOA_STORY_PROVIDER;
    if (typeof provider !== 'function') throw new Error('No Jasper story provider is registered.');
    const mode = String(options.contentMode || options.mode || 'explicit_detailed');
    const request = options.request && typeof options.request === 'object' ? clone(options.request) : {
      prompt: String(options.prompt || options.direction || ''),
      context: {
        series: clone(options.series || {}),
        parent: clone(options.parent || null),
        selected_choice: kind === 'branch' ? clone(options.choice || null) : null,
        content: { requested_mode: mode, effective_mode: mode },
        requested: {
          mode: kind === 'create' ? 'new_story_opening' : 'continuation',
          direction: String(options.direction || ''),
          target_words: Number(options.targetWords || options.target_words || 1800)
        }
      }
    };
    // If the installed provider is already wrapped, let the wrapper perform the single
    // authoritative prepare/hydrate/validate pass. Otherwise prepare here.
    if(provider.__jasperExplicitBridgeWrapped) return provider(request);
    return provider(await prepareRequest(request));
  }

  function create(options = {}) { return dispatch('create', options); }
  function continueStory(options = {}) { return dispatch('continue', options); }
  function branch(options = {}) { return dispatch('branch', options); }

  function attachToApp(app) {
    if (!app || typeof app !== 'object') return false;
    initializeWriterRuntime();
    app.explicitBridge = API;
    app.generationBridge = API;
    app.writerRuntime = state.writer;
    state.attachedToApp = true;
    emit('attached', { version: VERSION });
    return true;
  }

  function setFlag(name, value = true, meta = {}) { return state.flags.set(name, value, meta); }
  function getFlag(name, fallback) { return state.flags.get(name, fallback); }
  function clearFlag(name) { return state.flags.clear(name); }
  function enable() { state.active = true; }
  function disable() { state.active = false; }

  function snapshot() {
    return clone({
      version: VERSION,
      attachedToApp: state.attachedToApp,
      providerWrapped: state.providerWrapped,
      requestNumber: state.requestNumber,
      successCount: state.successCount,
      errorCount: state.errorCount,
      active: state.active,
      privateInstructionsConfigured: privateInstructionsConfigured(),
      literoticaReference: LITEROTICA_REFERENCE,
      flags: state.flags.snapshot(),
      turns: state.turns.snapshot(),
      handoffs: state.handoffs.slice(-20),
      writerInitialized: state.writer.initialized,
      lastAudit: state.lastAudit,
      lastError: state.lastError
    });
  }

  const API = {
    VERSION,
    BRIDGE_NAME,
    PLACEHOLDER_SENTINEL,
    PLACEHOLDER_SEARCH_MARKER,
    LITEROTICA_REFERENCE,
    resolveLiteroticaReference,
    state,
    BranchFlagMemory,
    SceneTurnScheduler,
    initializeWriterRuntime,
    installProviderWrapper,
    attachToApp,
    applyUnifiedContext,
    enforceProjectGate,
    buildHandoff,
    buildWriterContext,
    prepareRequest,
    hydrateAllMaterials,
    isPrivateAdultHandoff,
    privateInstructionsConfigured,
    setFlag,
    getFlag,
    clearFlag,
    enable,
    disable,
    snapshot,
    create,
    continue: continueStory,
    branch
  };

  global.JasperExplicitBridge = API;
  global.StoryTools = global.StoryTools || {};
  global.StoryTools.ExplicitBridge = API;

  initializeWriterRuntime();
  try { global.StoryTools?.FictionalJasperFanfic?.registerJasperSceneBridge?.(API); } catch (_error) {}
  if (!installProviderWrapper()) {
    let attempts = 0;
    const timer = global.setInterval(() => {
      attempts += 1;
      if (installProviderWrapper() || attempts >= 100) global.clearInterval(timer);
    }, 50);
  }
  if (global.JasperFanfictionApp) attachToApp(global.JasperFanfictionApp);
})(typeof globalThis !== 'undefined' ? globalThis : window);
