# RPG / Worldbuilding / VTT Source Archive Inspection
These uploaded repositories were merged into **An Admin's Place** as draggable modules, tools, source adapters, and export manifests. Server-only, Docker, PHP, Python, Roll20 sandbox, and Foundry-only code is represented as static GitHub Pages-compatible adapters rather than copied wholesale into the editor runtime.

## mp3player-master.zip
- Adapter: AJAX MP3 player plugin
- Category: Audio/media tools
- Runtime handling: Static audio player + playlist adapter; PHP folder scanning is represented as browser file/URL playlist tools.
- Entries: 89
- Compressed size: 384,291 bytes
- Uncompressed size: 1,629,262 bytes
- Main extension counts: .php: 71, .txt: 2, .css: 2, .gif: 2, [none]: 1, .html: 1, .png: 1, .js: 1

Notable source files sampled:
- `mp3player-master/index.html`
- `mp3player-master/mp3player/player/css/blackandwhite.css`
- `mp3player-master/mp3player/player/css/styles.css`
- `mp3player-master/mp3player/player/mp3playerplugin.js`

README excerpt:
> ### mp3player-master/README.txt
> 
> AJAX MP3 Player Plugin
> Version 1.0
> By Joseph Moore
> 
> This is an AJAX MP3 player that uses PHP to read a folder of files on your server and builds an HTML5 audio player in Javascript. 
> 
> Structure of the plugin
> 
> - mp3player
>  - player
>   + mp3playerplugin.js
>   - css
>    + styles.css
>    + blackandwhite.css
>   - images
>    + icons.png
>    + ajax-loader.gif
>    + ajax-loader2.gif
>   - php
>    + getsongs.php
>    - getid3
>  - music
>   + MUSIC-GOES-HERE.txt
> 
> INSTRUCTIONS
> 
> 1.) Copy plugin folder "mp3player" to the root folder of your site's HTML. 
> 
> 2.) Insert jQuery library, jQuery ui, the plugin JS, and the plugin CSS files into the head of the html page. You can copy and paste this code:
> 
> <link rel="stylesheet" href="mp3player/player/css/styles.css" type="text/css" media="all" />
> <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.5.1/jquery.min.js"></script> 
> <script src="http://ajax.googleapis.com/ajax/libs/jqueryui/1.8/jquery-ui.min.js"></script>
> <script type="text/javascript" src="mp3player/player/mp3playerplugin.js"></script> 
> 
> The styles.css file included with the plugin will preserve any styles you may have set for tables, and the div you insert into the markup. I

## player-main.zip
- Adapter: Player Mp3 site
- Category: Audio/media tools
- Runtime handling: Modern HTML5 player skin adapted into a draggable audio/media module.
- Entries: 1,712
- Compressed size: 5,259,709 bytes
- Uncompressed size: 14,723,007 bytes
- Main extension counts: .svg: 1607, .less: 18, .scss: 18, .css: 15, .js: 15, .yml: 4, .eot: 3, .ttf: 3, .woff: 3, .woff2: 3, .json: 2, .md: 1, .txt: 1, .jpg: 1, .html: 1

Notable source files sampled:
- `player-main/README.md`
- `player-main/css/style.css`
- `player-main/fonts/fontawesome/css/all.css`
- `player-main/fonts/fontawesome/css/all.min.css`
- `player-main/fonts/fontawesome/css/brands.css`
- `player-main/fonts/fontawesome/css/brands.min.css`
- `player-main/fonts/fontawesome/css/fontawesome.css`
- `player-main/fonts/fontawesome/css/fontawesome.min.css`
- `player-main/fonts/fontawesome/css/regular.css`
- `player-main/fonts/fontawesome/css/regular.min.css`
- `player-main/fonts/fontawesome/css/solid.css`
- `player-main/fonts/fontawesome/css/solid.min.css`
- `player-main/fonts/fontawesome/css/svg-with-js.css`
- `player-main/fonts/fontawesome/css/svg-with-js.min.css`
- `player-main/fonts/fontawesome/css/v4-shims.css`
- `player-main/fonts/fontawesome/css/v4-shims.min.css`
- `player-main/fonts/fontawesome/js/all.js`
- `player-main/fonts/fontawesome/js/all.min.js`

README excerpt:
> ### player-main/README.md
> 
> # Player Mp3 - Site
> 
> ![Player Mp3](images/player.jpg?raw=true "Player Mp3")
> 
> Player mp3 usado em meu site.<br><br>
> Foi usado neste projeto HTML5, CSS3 e JS.<br><br>
> <strong>Ver no Codepen =></strong> https://codepen.io/hiltonmuccillo/pen/VwMMJgw
> 
> ### player-main/fonts/fontawesome/svgs/brands/readme.svg
> 
> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M528.3 46.5H388.5c-48.1 0-89.9 33.3-100.4 80.3-10.6-47-52.3-80.3-100.4-80.3H48c-26.5 0-48 21.5-48 48v245.8c0 26.5 21.5 48 48 48h89.7c102.2 0 132.7 24.4 147.3 75 .7 2.8 5.2 2.8 6 0 14.7-50.6 45.2-75 147.3-75H528c26.5 0 48-21.5 48-48V94.6c0-26.4-21.3-47.9-47.7-48.1zM242 311.9c0 1.9-1.5 3.5-3.5 3.5H78.2c-1.9 0-3.5-1.5-3.5-3.5V289c0-1.9 1.5-3.5 3.5-3.5h160.4c1.9 0 3.5 1.5 3.5 3.5v22.9zm0-60.9c0 1.9-1.5 3.5-3.5 3.5H78.2c-1.9 0-3.5-1.5-3.5-3.5v-22.9c0-1.9 1.5-3.5 3.5-3.5h160.4c1.9 0 3.5 1.5 3.5 3.5V251zm0-60.9c0 1.9-1.5 3.5-3.5 3.5H78.2c-1.9 0-3.5-1.5-3.5-3.5v-22.9c0-1.9 1.5-3.5 3.5-3.5h160.4c1.9 0 3.5 1.5 3.5 3.5v22.9zm259.3 121.7c0 1.9-1.5 3.5-3.5 3.5H337.5c-1.9 0-3.5-1.5-3.5-3.5v-22.9c0-1.9 1.5-3.5 3.5-3.5h160.4c1.9 0 3.5 1.5 3.5 3.5v22.9zm0-60.9c0 1.9-1.5 3.5-3.5 3.5H337.5c-1.9 0-3.5-1.5-3.5-3.5V228c0-1.9 1.5-3.5 3.5-3.5h160.4c1.9 0 3.5 1.5 3.5 3.5v22.9zm0-60.9c0 1.9-1.5 3.5-3.5 3.5H337.5c-1.9 0-3.5-1.5-3.5-3.5v-22.8c0-1.9 1.5-3.5 3.5-3.5h160.4c1.9 0 3.5 1.5 3.5 3.5V190z"/></svg>

## roll20-api-scripts-master.zip
- Adapter: Roll20 API Scripts
- Category: Roll20/Foundry/VTT adapters
- Runtime handling: Roll20 API script vault, macro planner, and command notes; original API scripts remain external to Roll20.
- Entries: 6,033
- Compressed size: 152,790,416 bytes
- Uncompressed size: 560,403,495 bytes
- Main extension counts: .js: 2422, .md: 409, .json: 399, .png: 211, .html: 49, [none]: 42, .txt: 27, .ts: 15, .gif: 13, .hdc: 13, .jpg: 10, .mjs: 9, .hde: 8, .mht: 4, .rtf: 4

Notable source files sampled:
- `roll20-api-scripts-master/.github/pr.json`
- `roll20-api-scripts-master/.github/workflows/validate_script_json.yml`
- `roll20-api-scripts-master/.types/package.json`
- `roll20-api-scripts-master/.vscode/settings.json`
- `roll20-api-scripts-master/13th Age Official Character Sheet Companion/1.0/13th Age Official Character Sheet Companion.js`
- `roll20-api-scripts-master/13th Age Official Character Sheet Companion/script.json`
- `roll20-api-scripts-master/5E Resting in Style/1.0.0/5E-Resting-in-Style.js`
- `roll20-api-scripts-master/5E Resting in Style/1.1.0/5E-Resting-in-Style.js`
- `roll20-api-scripts-master/5E Resting in Style/1.2.0/5E-Resting-in-Style.js`
- `roll20-api-scripts-master/5E Resting in Style/1.2.1/5E-Resting-in-Style.js`
- `roll20-api-scripts-master/5E Resting in Style/README.md`
- `roll20-api-scripts-master/5E Resting in Style/script.json`
- `roll20-api-scripts-master/5EBattleMaster/0.1/5ebattlemaster.js`
- `roll20-api-scripts-master/5EBattleMaster/README.md`
- `roll20-api-scripts-master/5EBattleMaster/script.json`
- `roll20-api-scripts-master/5eShapedCompanion/1.0.0/5eShapedCompanion.js`
- `roll20-api-scripts-master/5eShapedCompanion/1.0.0/CHANGELOG.md`
- `roll20-api-scripts-master/5eShapedCompanion/1.0.0/README.md`

README excerpt:
> ### roll20-api-scripts-master/5E Resting in Style/README.md
> 
> # 5E Resting in Style
> 
> This script for the 5E OGL character sheet solves the error prone task of
> updating your character sheet when resting. Using `!long-rest` and `!short-rest`
> commands will update your sheet, and report to you everything it is doing.
> 
> ## Short rest
> 
> Select your character, then run the `!short-rest` command. It will:
> 
> - check your hit points and hit dice, and remind you to use them if needed.
> 
> - replenish Warlock **Pact Magic** spell slots. This works correctly even if you
>   are a multiclass spell caster.
> 
> - replenish class specific resources, like **Wild Shape**, **Second Wind** and **Channel Divinity**.
> 
>     :+1: It knows that Bards regain **Bardic Inspiration** at class level 5.
> 
>     :+1: It knows that Sorcerers gain 4 Sorcery Points at class level 20.
> 
> - replenish subclass specific resources, like **Superiority Dice** and **Hexblade's Curse**.
> 
> - remind Wizards to use **Arcane Recovery**, and Bards to use **Song of Rest**.
> 
> - turn off global modifiers with a short duration, like **Bless**, **Sacred Weapon** and **Shield of Faith**.
> 
> ## Long rest
> 
> Select your character, then run the `!long-rest` command. It will:
> 
> - replenish your hit points.
> 
> - replenish the c
> 
> ### roll20-api-scripts-master/5EBattleMaster/README.md
> 
> # 5E BattleMaster
> A roll20 API Script for DND 5e combat across the board, compatible with the 5E OGL character sheet system.
> 
> ## Current Functionality
> 1. Handle attack rolls, saving throws, and damage dealing for:
>     * Direct Weapon Attacks
>     * Direct Spell Attacks
>     * AOE Spell Attacks
> 
> ## User Guide
> To begin combat, the GM simply needs to type "!combat start". On each player's turn, they will be prompted with 4 options for actions. The players simply need to click a tar

Roll20 script.json examples cataloged:
- 13th Age Official Character Sheet Companion — roll20-api-scripts-master/13th Age Official Character Sheet Companion
- 5E Resting in Style — roll20-api-scripts-master/5E Resting in Style
- 5E BattleMaster — roll20-api-scripts-master/5EBattleMaster
- 5th Edition OGL by Roll20 Companion — roll20-api-scripts-master/5th Edition OGL by Roll20 Companion
- ABFRoll — roll20-api-scripts-master/ABFRoll
- APIHeartBeat — roll20-api-scripts-master/APIHeartBeat
- APILogic — roll20-api-scripts-master/APILogic
- APISelection — roll20-api-scripts-master/APISelection
- ARC.doom — roll20-api-scripts-master/ARC
- Aborea Character Sheet AutoCalculations — roll20-api-scripts-master/Aborea
- AddCustomTurn — roll20-api-scripts-master/AddCustomTurn
- AgoneCleanOlds — roll20-api-scripts-master/AgoneCleanOlds
- AgoneDice — roll20-api-scripts-master/AgoneDice
- Alien RPG Dice Roller — roll20-api-scripts-master/AlienRPGroller
- Align — roll20-api-scripts-master/Align
- AlignmentTracker — roll20-api-scripts-master/AlignmentTracker
- Ammo — roll20-api-scripts-master/Ammo
- Anchor — roll20-api-scripts-master/Anchor
- Areas of Effect — roll20-api-scripts-master/AreasOfEffect
- Ars Magica 5e--Automated Stress Die — roll20-api-scripts-master/ArsMagica5eStressDie
- Assemble — roll20-api-scripts-master/Assemble
- AttackMaster — roll20-api-scripts-master/AttackMaster
- AutoLinker — roll20-api-scripts-master/AutoLinker
- Aziz Light — roll20-api-scripts-master/Aziz Light!
- Base64 — roll20-api-scripts-master/Base64

## worldanvil-templates-master.zip
- Adapter: World Anvil community templates
- Category: Worldbuilding/RPG authoring tools
- Runtime handling: Article template planner, template snippet library, and CSS/skin organizer.
- Entries: 1,602
- Compressed size: 60,956,142 bytes
- Uncompressed size: 78,138,293 bytes
- Main extension counts: .twig: 551, .css: 308, .yml: 176, .png: 57, [none]: 33, .jpg: 22, .md: 21, .json: 10, .js: 9, .webp: 7, .py: 7, .pdf: 6, .svg: 6, .cmd: 6, .txt: 5

Notable source files sampled:
- `worldanvil-templates-master/.github/ISSUE_TEMPLATE.md`
- `worldanvil-templates-master/CODE_OF_CONDUCT.md`
- `worldanvil-templates-master/CONTRIBUTING.md`
- `worldanvil-templates-master/LICENSE.md`
- `worldanvil-templates-master/README.md`
- `worldanvil-templates-master/about-wa.md`
- `worldanvil-templates-master/article-templates/base-template/condition.html.twig`
- `worldanvil-templates-master/article-templates/base-template/document.html.twig`
- `worldanvil-templates-master/article-templates/base-template/ethnicity.html.twig`
- `worldanvil-templates-master/article-templates/base-template/formation.html.twig`
- `worldanvil-templates-master/article-templates/base-template/generic.html.twig`
- `worldanvil-templates-master/article-templates/base-template/item.html.twig`
- `worldanvil-templates-master/article-templates/base-template/landmark.html.twig`
- `worldanvil-templates-master/article-templates/base-template/language.html.twig`
- `worldanvil-templates-master/article-templates/base-template/law.html.twig`
- `worldanvil-templates-master/article-templates/base-template/location.html.twig`
- `worldanvil-templates-master/article-templates/base-template/material.html.twig`
- `worldanvil-templates-master/article-templates/base-template/militaryConflict.html.twig`

README excerpt:
> ### worldanvil-templates-master/README.md
> 
> # World Anvil Community Repository
> Welcome weary and mighty traveller
> 
> This repository is a list of all templates (Role Playing Games blocks) and skin created for World Anvil by the community.  
> 
> ## License
> By using this repository you agree to abide to the [World Anvil Community License](./LICENSE.md)
> 
> ## Requirements
> - Are you one of those amazing individuals happy to create a template or two, or five for your favorite RPG systems? 
> - Do you have some very basic coding knowledge? 
> - Do you enjoy the warm fuzzy feeling of having hundreds of people be thankful to you? 
> 
> If you have answered yes to at least 2 of the above with YES then you are in the right place! 
> 
> ## Getting started
> In order to start working you will need to read the :  
> - [Newcomers Guide](./newcomers-guide.md)  
> - [Contributions Guidelines](./CONTRIBUTING.md)   
> 
> That's all. - _Get started!_
> 
> ## Getting help
> You can receive help from many way :
> - If you are not already there join us at the [World Anvil Discord Server](https://discord.gg/cxKYPrD) and the **#coders-anonymous channel**  
> (You can alsoassign yourself the Computer Programmer role to gain access to the **#coders-anonymous** channel )
> - Alternatively yo
> 
> ### worldanvil-templates-master/block-system-2.0/talisman/character-sheet/readme.txt
> 
> Rolls are 3d6, third die is the Kismet die.
> 
> Looks like this on the die roller:
> roll 2d6, add 1d6 with special conditions:
> 	cf=1 --> critical fail, shown as 1__
> 	cs=6 --> critical success, shown as 6**
> 
> Kismet die = 1 --> 1 dark fate for the GM
> 
> 	You rolled:2d6+1d6cf=1cs=6: [4, 6]+[1__] = 11
> 
> Kismet die = 6 --> 1 light fate for the player
> 
> 	You rolled:2d6+1d6cf=1cs=6: [2, 2]+[6**] = 10

## world-anvil-master.zip
- Adapter: Foundry VTT World Anvil integration
- Category: Roll20/Foundry/VTT adapters
- Runtime handling: World Anvil → Foundry import/sync checklist and metadata bridge.
- Entries: 39
- Compressed size: 4,827,820 bytes
- Uncompressed size: 5,477,469 bytes
- Main extension counts: .js: 6, .png: 3, .webp: 3, .hbs: 3, .css: 2, .svg: 2, .json: 2, .yml: 1, [none]: 1, .txt: 1, .md: 1, .eot: 1, .ttf: 1, .woff: 1, .html: 1

Notable source files sampled:
- `world-anvil-master/.github/workflows/release.yml`
- `world-anvil-master/README.md`
- `world-anvil-master/css/rpg-awesome.css`
- `world-anvil-master/lang/en.json`
- `world-anvil-master/module.json`
- `world-anvil-master/module/api.js`
- `world-anvil-master/module/config.js`
- `world-anvil-master/module/framework.js`
- `world-anvil-master/module/journal.js`
- `world-anvil-master/module/pagenames.js`
- `world-anvil-master/templates/config.html`
- `world-anvil-master/wa.css`
- `world-anvil-master/wa.js`

README excerpt:
> ### world-anvil-master/README.md
> 
> # Foundry Virtual Tabletop - World Anvil Integration
> 
> This module provides an integration with [World Anvil](https://worldanvil.com) for Foundry Virtual Tabletop, allowing you to import article content from World Anvil into the Foundry VTT journal system and easily keep that content synchronized over time as you update and create articles on the World Anvil platform.
> 
> Watch the following video to learn more about this module and how to use it: https://www.youtube.com/watch?v=o9DMELe7G_o
> 
> -----
> 
> ## Installation
> 
> This module can be installed automatically from the Foundry Virtual Tabletop module browser, or by using the following module manifest url: (https://gitlab.com/foundrynet/world-anvil/-/raw/master/module.json).
> 
> -----
> 
> ## Configuration
> 
> To begin using this module, some initial configuration is required. You must provide a World Anvil user authorization API token which is available to any Guild member user by visiting the **API Keys Management** section of your World Anvil user dashboard.
> 
> Enable the World Anvil module in Foundry VTT and click the small **WA** logo at the bottom-right of the Journal Directory to open the World Anvil browser. This will open an initial configura

## Fantasy-Map-Generator-master.zip
- Adapter: Azgaar Fantasy Map Generator
- Category: Map/dungeon/VTT tools
- Runtime handling: Map generator launcher, seed/settings planner, and export/import slots for maps and world data.
- Entries: 885
- Compressed size: 19,186,912 bytes
- Uncompressed size: 31,246,263 bytes
- Main extension counts: .svg: 338, .js: 186, .ts: 97, .png: 45, .html: 30, .css: 25, .jpg: 22, .json: 17, .md: 11, .yml: 6, .jpeg: 5, [none]: 3, .conf: 1, .toml: 1, .txt: 1

Notable source files sampled:
- `Fantasy-Map-Generator-master/.claude/launch.json`
- `Fantasy-Map-Generator-master/.github/FUNDING.yml`
- `Fantasy-Map-Generator-master/.github/ISSUE_TEMPLATE/bug_report.md`
- `Fantasy-Map-Generator-master/.github/ISSUE_TEMPLATE/feature_request.md`
- `Fantasy-Map-Generator-master/.github/copilot-instructions.md`
- `Fantasy-Map-Generator-master/.github/pull_request_template.md`
- `Fantasy-Map-Generator-master/.github/workflows/bump-version.yml`
- `Fantasy-Map-Generator-master/.github/workflows/deploy.yml`
- `Fantasy-Map-Generator-master/.github/workflows/lint.yml`
- `Fantasy-Map-Generator-master/.github/workflows/playwright.yml`
- `Fantasy-Map-Generator-master/.github/workflows/unit-tests.yml`
- `Fantasy-Map-Generator-master/CODE_OF_CONDUCT.md`
- `Fantasy-Map-Generator-master/ISSUE_TEMPLATE.md`
- `Fantasy-Map-Generator-master/README.md`
- `Fantasy-Map-Generator-master/biome.json`
- `Fantasy-Map-Generator-master/docs/domain/3d-view.md`
- `Fantasy-Map-Generator-master/docs/updates/v1.123.0/v1.123.0 - Eroded Terrain and Satellite Texture.md`
- `Fantasy-Map-Generator-master/main.js`

README excerpt:
> ### Fantasy-Map-Generator-master/README.md
> 
> # Fantasy Map Generator
> 
> Azgaar's _Fantasy Map Generator_ is a free web application that helps fantasy writers, game masters, and cartographers create and edit fantasy maps.
> 
> Link: [azgaar.github.io/Fantasy-Map-Generator](https://azgaar.github.io/Fantasy-Map-Generator).
> 
> Refer to the [project wiki](https://github.com/Azgaar/Fantasy-Map-Generator/wiki) for guidance. The current progress is tracked in [Trello](https://trello.com/b/7x832DG4/fantasy-map-generator). Some details are covered in my old blog [_Fantasy Maps for fun and glory_](https://azgaar.wordpress.com).
> 
> [![preview](https://github.com/Azgaar/Fantasy-Map-Generator/assets/26469650/9502eae9-92e0-4d0d-9f17-a2ba4a565c01)](https://github.com/Azgaar/Fantasy-Map-Generator/assets/26469650/11a42446-4bd5-4526-9cb1-3ef97c868992)
> 
> [![preview](https://github.com/Azgaar/Fantasy-Map-Generator/assets/26469650/e751a9e5-7986-4638-b8a9-362395ef7583)](https://github.com/Azgaar/Fantasy-Map-Generator/assets/26469650/e751a9e5-7986-4638-b8a9-362395ef7583)
> 
> [![preview](https://github.com/Azgaar/Fantasy-Map-Generator/assets/26469650/b0d0efde-a0d1-4e80-8818-ea3dd83c2323)](https://github.com/Azgaar/Fantasy-Map-Generator/assets/26469650/b0d0efde-a0d
> 
> ### Fantasy-Map-Generator-master/public/libs/tinymce/langs/README.md
> 
> This is where language files should be placed.
> 
> Please DO NOT translate these directly, use this service instead: https://crowdin.com/project/tinymce

## Labyrinth-Maker-X-main.zip
- Adapter: Labyrinth Maker X
- Category: Map/dungeon/VTT tools
- Runtime handling: In-browser labyrinth/dungeon generator adapter with seed, ASCII, JSON, and PNG planning notes.
- Entries: 5
- Compressed size: 10,146 bytes
- Uncompressed size: 30,369 bytes
- Main extension counts: .md: 1, .html: 1, .js: 1, .css: 1

Notable source files sampled:
- `Labyrinth-Maker-X-main/README.md`
- `Labyrinth-Maker-X-main/index.html`
- `Labyrinth-Maker-X-main/script.js`
- `Labyrinth-Maker-X-main/style.css`

README excerpt:
> ### Labyrinth-Maker-X-main/README.md
> 
> Procedural Dungeon Generator
> 
> A complete BSP/Room-Corridor procedural map generator built with HTML, CSS, and JavaScript.
> 
> Features
> 
> Deterministic seed generation
> 
> Step visualization
> 
> Editing mode + undo/redo
> 
> ASCII mode + tile mode
> 
> PNG export
> 
> JSON export
> 
> Responsive UI
> 
> Zoom and pan
> 
> 
> Installation
> 
> Just extract the folder and open:
> 
> index.html
> 
> File Structure
> 
> index.html
> style.css
> script.js
> 
> No Dependencies
> 
> Runs entirely in-browser. No server required.

## dungeon-generator-tools-master.zip
- Adapter: Dungeon Generator Tools
- Category: Map/dungeon/VTT tools
- Runtime handling: Browser-side room pattern/palette planner replacing the Python/PIL conversion workflow with editable JSON notes.
- Entries: 30
- Compressed size: 19,310 bytes
- Uncompressed size: 27,096 bytes
- Main extension counts: .png: 23, .py: 2, .md: 1, .bat: 1

Notable source files sampled:
- `dungeon-generator-tools-master/README.md`
- `dungeon-generator-tools-master/patterns_room_converter.py`
- `dungeon-generator-tools-master/pixel_tool_replace_colors.py`

README excerpt:
> ### dungeon-generator-tools-master/README.md
> 
> ## The tools for uwague ##
> ### Room patterns maker -  converts a pixel images of the room into a json file. ###
> Used PIL lib.
>  * 1 pixel = 1 block
>  * Each color equals specific block (see: patterns\palette.png)
>  * Alpha channel responds to the block appearance factor(if 255 = 100%; if <= 155 = 0%)
>  
>  Usage: patterns_room_converter.py [Image file name] [Text file name] [Width pattern] [Height pattern] [Offset between rooms]
> 
> see examples in convertPatterns.bat.
> 
>   ### Pixels replacer - replaces specific colors to others in image file ###
> Used PIL lib.\
> Usage: pixel_tool_replace_colors.py [input image file name] [output image file name] [pattern file]
> 
> see examples of pattern files in 'pattern' folder

## pyvtt-master.zip
- Adapter: pyvtt / Index Card VTT engine
- Category: Roll20/Foundry/VTT adapters
- Runtime handling: Static scene/card board adapter plus deployment notes for the Python/Docker runtime.
- Entries: 273
- Compressed size: 7,566,230 bytes
- Uncompressed size: 8,408,054 bytes
- Main extension counts: .py: 106, .png: 79, .tpl: 20, .js: 15, [none]: 5, .md: 3, .sh: 3, .toml: 2, .txt: 2, .jpg: 2, .css: 2, .yml: 1, .env: 1, .xcf: 1, .ico: 1

Notable source files sampled:
- `pyvtt-master/.github/workflows/python-app.yml`
- `pyvtt-master/API-ENDPOINTS.md`
- `pyvtt-master/README.md`
- `pyvtt-master/TERMS.md`
- `pyvtt-master/buildnumber.py`
- `pyvtt-master/main.py`
- `pyvtt-master/static/client/assets.js`
- `pyvtt-master/static/client/drawing.js`
- `pyvtt-master/static/client/dropdown.js`
- `pyvtt-master/static/client/errors.js`
- `pyvtt-master/static/client/gm.js`
- `pyvtt-master/static/client/jquery-3.3.1.min.js`
- `pyvtt-master/static/client/layout.css`
- `pyvtt-master/static/client/md5.js`
- `pyvtt-master/static/client/music.js`
- `pyvtt-master/static/client/normalize.css`
- `pyvtt-master/static/client/render.js`
- `pyvtt-master/static/client/socket.js`

README excerpt:
> ### pyvtt-master/README.md
> 
> ![Python application](https://github.com/cgloeckner/pyvtt/actions/workflows/python-app.yml/badge.svg?branch=master)
> 
> # pyvtt
> Python-based Virtual Tabletop Tool
> 
> ## What is this?
> 
> This piece of software is the engine behind the [Index Card Virtual Tabletop (ICVTT)](https://icvtt.net). It's mostly designed for playing variations of _Index Card RPG_ (ICRPG) by [Runehammer Games](http://runehammer.online) but can be used with other tabletop games (like _WAR|MAKER_, also by Runehammer Games).
> 
> See the wiki for more details.
> 
> # Docker
> This application includes a simple Dockerfile to build a runnable container.
> 
> `./script/build.sh` will build an image for you. This script accepts one optional parameter: a tag to apply to the resultant image. If no tag is specified, `latest` will be used.
> 
> `./script/run.sh` will (re)start the image. It takes three optional parameters: the tag to use, the port to use, and the path to the location to mount into the container. The default values are `latest`, `8080`, and `/opt/pyvtt/prod` respectively.
> 
> ## Contributions
> 
> Kane Driscol
> - Lead Artist (see commit details)
> - Community Manager for ICVTT over on the [ICRPG Discord Community](https://discord.gg/H76tf

## aedelore-rpg-tools-main.zip
- Adapter: Aedelore RPG Tools
- Category: Player/campaign management tools
- Runtime handling: Character sheet, campaign/session dashboard, NPC/encounter trackers, and backend action templates.
- Entries: 511
- Compressed size: 2,923,358 bytes
- Uncompressed size: 9,079,193 bytes
- Main extension counts: .js: 163, .kt: 92, .css: 24, .html: 15, .png: 14, .md: 10, .txt: 9, [none]: 8, .xml: 8, .woff2: 8, .json: 5, .kts: 3, .properties: 3, .example: 1, .pro: 1

Notable source files sampled:
- `aedelore-rpg-tools-main/README.md`
- `aedelore-rpg-tools-main/android/README.md`
- `aedelore-rpg-tools-main/api/.eslintrc.json`
- `aedelore-rpg-tools-main/api/db.js`
- `aedelore-rpg-tools-main/api/email.js`
- `aedelore-rpg-tools-main/api/helpers.js`
- `aedelore-rpg-tools-main/api/jest.config.js`
- `aedelore-rpg-tools-main/api/logger.js`
- `aedelore-rpg-tools-main/api/middleware/auth.js`
- `aedelore-rpg-tools-main/api/middleware/csrf.js`
- `aedelore-rpg-tools-main/api/middleware/oidc.js`
- `aedelore-rpg-tools-main/api/package.json`
- `aedelore-rpg-tools-main/api/routes/ai.js`
- `aedelore-rpg-tools-main/api/routes/auth.js`
- `aedelore-rpg-tools-main/api/routes/campaigns.js`
- `aedelore-rpg-tools-main/api/routes/characters.js`
- `aedelore-rpg-tools-main/api/routes/dm.js`
- `aedelore-rpg-tools-main/api/routes/errors.js`

README excerpt:
> ### aedelore-rpg-tools-main/README.md
> 
> # Aedelore RPG Tools
> 
> A complete digital toolkit for tabletop RPG players and game masters. Manage your characters, run campaigns, and play sessions - all from your browser or phone.
> 
> ![Aedelore Character Sheet](aedelore.png)
> 
> ![Aedelore DM Tools](DMtool.png)
> 
> ## What is this?
> 
> **For Players:** A digital character sheet that works offline, syncs across devices, and keeps your character safe in the cloud. No more lost paper sheets or forgetting your character at home.
> 
> **For Game Masters:** A complete campaign management system with session planning, encounter tracking, NPC management, and tools to share session summaries with your players.
> 
> Built for the Aedelore RPG system, but supports other systems like D&D 5e, Pathfinder 2e, and Storyteller.
> 
> ## Links
> 
> | | |
> |---|---|
> | **Main Site** | [aedelore.nu](https://aedelore.nu) |
> | **Character Sheet** | [aedelore.nu/character-sheet](https://aedelore.nu/character-sheet) |
> | **DM Session Tools** | [aedelore.nu/dm-session](https://aedelore.nu/dm-session) |
> 
> ## Features
> 
> ### Character Sheet (PWA)
> 
> **Character Management**
> - Full character creation with stats, skills, abilities, and inventory
> - Lock system for campaign play (DM controls whe
> 
> ### aedelore-rpg-tools-main/android/README.md
> 
> # Aedelore - Android App
> 
> Android-klient för [Aedelore](https://aedelore.nu), ett fantasy RPG-system med karaktärsblad och kampanjverktyg.
> 
> ---
> 
> ## Översikt
> 
> | Egenskap | Värde |
> |----------|-------|
> | Paket | `nu.aedelore.app` |
> | Språk | Kotlin |
> | UI | Jetpack Compose + Material 3 |
> | Arkitektur | Clean Architecture (UI → Domain → Data) |
> | DI | Hilt |
> | Nätverk | Retrofit + OkHttp |
> | Lokal DB | Room |
> | Inställningar | DataStore + EncryptedSharedPreferences |
> | Min SDK | 26 (Android 8.0) |
> | Target SDK

## DungeonMasterTools.github.io-master.zip
- Adapter: DungeonMasterTools.github.io
- Category: Worldbuilding/RPG authoring tools
- Runtime handling: 5e quick reference, calendar/weather, item/table tools, and DM helper cards.
- Entries: 1,361
- Compressed size: 19,022,021 bytes
- Uncompressed size: 20,395,522 bytes
- Main extension counts: .png: 1320, .js: 12, .html: 7, .css: 7, [none]: 1, .md: 1, .eot: 1, .svg: 1, .ttf: 1, .woff: 1, .woff2: 1, .map: 1

Notable source files sampled:
- `DungeonMasterTools.github.io-master/README.md`
- `DungeonMasterTools.github.io-master/calendar.html`
- `DungeonMasterTools.github.io-master/css/bootstrap-responsive.css`
- `DungeonMasterTools.github.io-master/css/bootstrap-responsive.min.css`
- `DungeonMasterTools.github.io-master/css/bootstrap.css`
- `DungeonMasterTools.github.io-master/css/bootstrap.min.css`
- `DungeonMasterTools.github.io-master/css/icons.css`
- `DungeonMasterTools.github.io-master/css/quickref.css`
- `DungeonMasterTools.github.io-master/css/simple-sidebar.css`
- `DungeonMasterTools.github.io-master/html/quickref-item.html`
- `DungeonMasterTools.github.io-master/index.html`
- `DungeonMasterTools.github.io-master/items.html`
- `DungeonMasterTools.github.io-master/js/bootstrap.js`
- `DungeonMasterTools.github.io-master/js/bootstrap.min.js`
- `DungeonMasterTools.github.io-master/js/data_action.js`
- `DungeonMasterTools.github.io-master/js/data_bonusaction.js`
- `DungeonMasterTools.github.io-master/js/data_condition.js`
- `DungeonMasterTools.github.io-master/js/data_environment.js`

README excerpt:
> ### DungeonMasterTools.github.io-master/README.md
> 
> # DungeonMasterTools.github.io
> Dungeon Master Tables and Tools for 5e
> 
> DungeonMasterTools.github.io
> 
> Quick Reference Page stolen from https://github.com/crobi/dnd5e-quickref 
> 
> Robbed some tables, which I tweaked and cleaned up for my purposes, from http://www.5edmscreen.com
> 
> Weather chart taken from here: https://dungeonbot.wordpress.com/2015/01/26/simple-weather-lookup-chart
