# Character Pool Research Expansion Audit

Research/build date: 2026-09-20

- Original profiles: **56**
- Added this pass: **78**
- Expanded total: **134**

## Pool size by fandom

- **Marvel Movies: 16** (6 added this pass)
- **Palia: 16** (10 added this pass)
- **Coral Island: 15** (10 added this pass)
- **Disney Movies: 13** (5 added this pass)
- **DC Movies: 12** (5 added this pass)
- **Fallout 76: 11** (6 added this pass)
- **Avatar: The Last Airbender: 10** (6 added this pass)
- **Resident Evil: 10** (6 added this pass)
- **Hazbin Hotel: 9** (5 added this pass)
- **Fallout 4: 8** (7 added this pass)
- **Harry Potter: 7** (6 added this pass)
- **Steven Universe: 7** (6 added this pass)

## Continuation infrastructure

- Every character now has a stable `character_id` and a `continuation_profile`.
- `continuation_context_template.json` tracks relationship milestones, consent vocabulary, shared jokes, affirmations, secrets, injuries, open plots, and the previous scene’s emotional turn.
- Same-name characters in different fandoms are safe because retrieval uses `character_id`, not display name.
- The continuation contract explicitly prevents re-running first meetings, first kisses, boundary negotiations, or canon-divergence decisions as though they were new.

## Adult-only / fictional-only safeguards

- All romantic/sexual participants must be explicitly 18+.
- Original-series minor Avatar eras remain blocked; adult/post-canon versions must be selected.
- Ambiguous young-adult game characters require story metadata age >=18 before hard-explicit generation.
- Actors, voice actors, creators, celebrities, streamers, and other real people remain blocked.

## Research boundary

Canon/identity fields are source-grounded summaries. Romance, brat-tamer, explicit diction, and aftercare fields are transformative generator inference based on canon personality plus Jasper’s project specification.
