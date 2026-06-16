# Wix source archive inspection

These Wix-related archives were merged into An Admin's Place as draggable modules, source manifests, and exportable static/back-end adapter patterns. Raw React Native, native simulator, Node, and CLI frameworks are documented instead of copied wholesale into the GitHub Pages runtime because those pieces require non-browser toolchains.

## react-native-ui-lib-master.zip
- Outer bundle: `wix 1.zip`
- Adapter: React Native UI Lib
- Merged use: Design-system/card/form/layout module palette inspired by Wix UI Lib components.
- Runtime strategy: static HTML/CSS component patterns; React Native source is documented, not bundled into GitHub Pages runtime
- Files inspected: 1540
- Archive size: 128.31 MB
- Common extensions: .png (404), .tsx (314), .ts (230), .json (184), .js (151), .gif (51), [no ext] (28), .java (26)
- Key files:
  - `react-native-ui-lib-master/LICENSE`
  - `react-native-ui-lib-master/README.md`
  - `react-native-ui-lib-master/demo/package.json`
  - `react-native-ui-lib-master/docuilib/README.md`
  - `react-native-ui-lib-master/docuilib/package.json`
  - `react-native-ui-lib-master/eslint-rules/README.md`
  - `react-native-ui-lib-master/eslint-rules/package.json`
  - `react-native-ui-lib-master/expoDemo/package.json`
- Package summaries:
  - `react-native-ui-lib-master/demo/package.json`: unicorn-demo-app 1.1.16 — 
  - `react-native-ui-lib-master/docuilib/package.json`: uilib-docs 4.0.1 — 
  - `react-native-ui-lib-master/eslint-rules/package.json`: eslint-plugin-uilib 3.0.0 — uilib set of eslint rules
  - `react-native-ui-lib-master/expoDemo/package.json`: unnamed  — 
- README signal: --- ## Notes #### React Native New Arc We are working on upgrading our UI Library to support the new React Native Architecture. Currently, we support React Native 0.73, and we plan to support React Native 0.77 next. While we don’t have a timeline yet, this is part of our roadmap. ## Links - [Docs](https://wix.github.io/react-native-ui-lib/)

## velo-external-db-master.zip
- Outer bundle: `wix 1.zip`
- Adapter: Velo External DB
- Merged use: Dataset/collection/backend bridge pattern for external data storage.
- Runtime strategy: static dataset editor + optional Google Apps Script endpoint template
- Files inspected: 675
- Archive size: 0.55 MB
- Common extensions: .ts (372), .json (127), .js (81), [no ext] (33), .md (21), .yaml (11), .tf (9), .svg (7)
- Key files:
  - `velo-external-db-master/LICENSE`
  - `velo-external-db-master/README.md`
  - `velo-external-db-master/package.json`
- Package summaries:
  - `velo-external-db-master/package.json`: velo-external-database-adapter  — 
- README signal: # Wix Velo External Database Adaptor ## Overview Velo by Wix is a development platform built on top of Wix, adding a built-in database and node.js backend. The built-in database is a document based database optimized for websites and content. Depending on the specific workload, it can support 10K - 100K records, and for some workloads even more. It

## cli-examples-main.zip
- Outer bundle: `wix 2.zip`
- Adapter: Wix CLI Examples
- Merged use: Project scaffold/checklist module for turning designs into repeatable project templates.
- Runtime strategy: static template manifest generator
- Files inspected: 80
- Archive size: 0.30 MB
- Common extensions: .md (42), .ts (16), .json (10), .tsx (7), [no ext] (2), .mjs (1), .png (1), .html (1)
- Key files:
  - `cli-examples-main/CLI App - FAQ manager/README.md`
  - `cli-examples-main/CLI App - FAQ manager/package.json`
- Package summaries:
  - `cli-examples-main/CLI App - FAQ manager/package.json`: faq-manager 1.0.0 — 
- README signal: # FAQ Manager A [Wix CLI](https://dev.wix.com/docs/wix-cli) app that lets site owners create and manage FAQ sections from the Wix dashboard, then display them on their site with a customizable accordion widget. Use this guide to explore the app, run it locally, connect AI tools (Wix Skills + Wix MCP), and rebuild the same pattern in your own Wix CL

## Detox-master.zip
- Outer bundle: `wix 2.zip`
- Adapter: Detox
- Merged use: Testing dashboard/checklist module for mobile/web flows.
- Runtime strategy: manual QA/test-plan export; true Detox requires Node/mobile test runner outside GitHub Pages
- Files inspected: 2126
- Archive size: 46.81 MB
- Common extensions: .js (755), .png (210), .md (195), .kt (153), .mdx (72), .java (66), .swift (65), .json (62)
- Key files:
  - `Detox-master/LICENSE`
  - `Detox-master/README.md`
  - `Detox-master/detox-cli/package.json`
  - `Detox-master/detox/LICENSE`
  - `Detox-master/detox/README.md`
  - `Detox-master/detox/package.json`
  - `Detox-master/generation/README.md`
  - `Detox-master/generation/package.json`
- Package summaries:
  - `Detox-master/detox-cli/package.json`: detox-cli 20.51.3 — Optional wrapper for Detox CLI, meant to be installed globally
  - `Detox-master/detox/package.json`: detox 20.51.3 — E2E tests and automation for mobile
  - `Detox-master/generation/package.json`: generation 20.41.0 — Generate wrapper code for native dependencies
  - `Detox-master/package.json`: root 20.51.3 — 
- README signal: <!-- markdownlint-configure-file { "first-line-heading": 0 } --> <h1 align="center"> Detox </h1> <b>Gray box end-to-end testing and automation framework for mobile apps.</b> <h1></h1> ## What Does a Detox Test Look Like? This is a test for a login screen, it runs on a device/simulator like an actual user:

## import-cost-master.zip
- Outer bundle: `wix 2.zip`
- Adapter: Import Cost
- Merged use: Import/dependency audit tool module for pasted JS/TS code.
- Runtime strategy: browser regex analyzer for import lines and dependency notes
- Files inspected: 131
- Archive size: 1.17 MB
- Common extensions: .js (61), .ts (24), .json (19), [no ext] (12), .md (6), .png (2), .vue (2), .yml (1)
- Key files:
  - `import-cost-master/LICENSE`
  - `import-cost-master/README.md`
  - `import-cost-master/package.json`
- Package summaries:
  - `import-cost-master/package.json`: import-cost-monorepo  — 
- README signal: # Import Cost ![Build Status](https://github.com/wix/import-cost/workflows/build/badge.svg) [![Stand With Ukraine](https://raw.githubusercontent.com/vshymanskyy/StandWithUkraine/main/badges/StandWithUkraine.svg)](https://www.wix.com/stands-with-ukraine) This extension will display inline in the editor the size of the imported package. The extension

## wix-ecom-cowork-main.zip
- Outer bundle: `wix 2.zip`
- Adapter: Wix Ecom Cowork
- Merged use: Ecommerce/gallery/quote-request module pattern.
- Runtime strategy: static product/service quote cart with optional backend submit
- Files inspected: 86
- Archive size: 0.27 MB
- Common extensions: .md (78), .json (3), [no ext] (2), .js (2), .html (1)
- Key files:
  - `wix-ecom-cowork-main/LICENSE`
  - `wix-ecom-cowork-main/README.md`
- README signal: # Wix Manager — Claude Cowork Plugin Manage your entire Wix business by having a conversation with Claude. Products, orders, events, bookings, content — no dashboards, no forms. Just ask. ----- ## Installation In Claude Desktop, go to **+** → **Add marketplace from GitHub** and enter: ``` itayher/wix-ecom-cowork

## wix-mcp-master.zip
- Outer bundle: `wix 2.zip`
- Adapter: Wix MCP
- Merged use: AI/tool connector notes and prompt/skill pack holder.
- Runtime strategy: static prompt/tool manifest module
- Files inspected: 2
- Archive size: 0.00 MB
- Common extensions: .md (1), .json (1)
- Key files:
  - `wix-mcp-master/README.md`
- README signal: # [Wix MCP](https://mcp.wix.com) Wix now provides a [Model Context Protocol](https://modelcontextprotocol.io/introduction) (MCP) server that allows you to work with Wix tools and services in your chosen AI client. By configuring the Wix MCP server, you enable your client to search the Wix documentation, write code for the Wix platform, and make API

## AppleSimulatorUtils-master.zip
- Outer bundle: `wix 3.zip`
- Adapter: Apple Simulator Utils
- Merged use: iOS simulator/device readiness checklist folded into testing dashboard.
- Runtime strategy: documentation/checklist module; native tool not run inside browser
- Files inspected: 55
- Archive size: 0.07 MB
- Common extensions: .h (14), .m (13), .md (7), [no ext] (3), .plist (3), .pbxproj (2), .xcworkspacedata (2), .xcscheme (2)
- Key files:
  - `AppleSimulatorUtils-master/LICENSE`
  - `AppleSimulatorUtils-master/README.md`
- README signal: # AppleSimulatorUtils A collection of utils for Apple simulators. ## Deprecation Notice **AppleSimulatorUtils** remains an actively maintained project. However, we have deprecated certain functionalities that overlap with features provided by the **`xcrun simctl`** command in the latest **Command Line Tools for Xcode**. In addition to avoid redunda

## headless-templates-main.zip
- Outer bundle: `wix 3.zip`
- Adapter: Wix Headless Templates
- Merged use: Headless CMS/page template planning module.
- Runtime strategy: static content-model and API placeholder module
- Files inspected: 1339
- Archive size: 36.97 MB
- Common extensions: .tsx (400), .ts (207), .astro (184), .js (135), .json (81), .png (58), [no ext] (56), .md (35)
- Key files:
  - `headless-templates-main/LICENSE`
  - `headless-templates-main/README.md`
  - `headless-templates-main/astro/README.md`
  - `headless-templates-main/package.json`
- Package summaries:
  - `headless-templates-main/package.json`: root  — 
- README signal: <h1 align="center">Wix Headless Templates</h1> > Join the Wix Headless community on [Discord](https://discord.gg/n6TBrSnYTp)! 🚀 Welcome to the Wix Headless Templates repository! This repository contains various templates for building headless websites using Wix and different front-end frameworks. Wix Headless allows you to leverage Wix's powerful b

## skills-main.zip
- Outer bundle: `wix 3.zip`
- Adapter: Wix Skills
- Merged use: Reusable skill/instruction library module for builder assistants and project notes.
- Runtime strategy: static skill cards + JSON manifest area
- Files inspected: 376
- Archive size: 3.64 MB
- Common extensions: .md (208), .ts (59), .astro (21), .yaml (18), .json (15), .yml (15), .tsx (10), .mjs (8)
- Key files:
  - `skills-main/LICENSE`
  - `skills-main/README.md`
  - `skills-main/package.json`
- Package summaries:
  - `skills-main/package.json`: @wix/agent-skills 1.8.0 — Wix Skills for AI coding agents — versioned npm distribution of the wix/skills content.
- README signal: # Wix Skills > ⚠️ **EXPERIMENTAL**: This project is in early development. APIs, skill definitions, and behavior may change without notice. Use at your own risk. Agent skills for building Wix app extensions, managing Wix business solutions, developing headless sites, and using the Wix Design System with AI agents. > **Note**: These skills are design

## stylable-master.zip
- Outer bundle: `wix 3.zip`
- Adapter: Stylable
- Merged use: Theme token/CSS architecture module.
- Runtime strategy: CSS variables/theme export panel
- Files inspected: 1415
- Archive size: 2.67 MB
- Common extensions: .ts (473), .css (421), .js (275), .json (130), [no ext] (37), .md (29), .png (14), .tsx (8)
- Key files:
  - `stylable-master/LICENSE`
  - `stylable-master/README.md`
  - `stylable-master/package.json`
- Package summaries:
  - `stylable-master/package.json`: stylable  — 
- README signal: ![Stylable CSS for Components](./stylable.svg) **Stylable** enables you to write reusable, highly-performant components. Each component exposes a style API that maps its internal parts so you can reuse components across teams without sacrificing stylability. - Scopes styles to components so they don't "leak" and clash with other styles. - Enables c

## cli-app-templates-master.zip
- Outer bundle: `wix 4.zip`
- Adapter: Wix CLI App Templates
- Merged use: App starter/template selector module.
- Runtime strategy: static project manifest/checklist generator
- Files inspected: 162
- Archive size: 1.72 MB
- Common extensions: .ejs (55), .tsx (29), .json (25), .ts (25), .md (7), .png (6), [no ext] (5), .css (3)
- Key files:
  - `cli-app-templates-master/LICENSE`
  - `cli-app-templates-master/README.md`
  - `cli-app-templates-master/chart-widget/README.md`
  - `cli-app-templates-master/custom-products-catalog/README.md`
  - `cli-app-templates-master/inventory-countdown/README.md`
  - `cli-app-templates-master/mixpanel-analytics/README.md`
  - `cli-app-templates-master/shipping-rates/README.md`
  - `cli-app-templates-master/site-popup/README.md`
- Package summaries:
  - `cli-app-templates-master/tests/package.json`: tests 1.0.0 — 
- README signal: # Wix CLI App Templates [Wix apps](https://dev.wix.com/docs/build-apps) enhance the functionality of Wix sites by adding new features such as custom pages, dashboard components, third-party integrations, or site analytics. This repo contains templates you can use to rapidly get started building your own Wix app. ## Why start with a template? Starti

## interact-master.zip
- Outer bundle: `wix 4.zip`
- Adapter: Interact.js
- Merged use: Drag/drop/resize behavior planner for modules and exported pages.
- Runtime strategy: browser behavior spec panel
- Files inspected: 582
- Archive size: 8.41 MB
- Common extensions: .ts (303), .md (91), .jpg (46), .html (35), .tsx (29), .css (26), .json (20), .yml (9)
- Key files:
  - `interact-master/LICENSE`
  - `interact-master/README.md`
  - `interact-master/package.json`
- Package summaries:
  - `interact-master/package.json`: interact 1.0.0 — Monorepo for the Interact animation and interaction libraries - web-native, AI-ready, framework-agnostic.
- README signal: <!-- AI: full docs index at https://wix.github.io/interact/llms.txt --> # Wix Interact Web-native animation and interaction libraries — declarative, AI-ready, framework-agnostic. ## What is Interact? **Wix Interact** (`@wix/interact`) is a declarative interaction layer on top of **@wix/motion**. You describe _when_ something should animate and _wha

## react-native-calendars-master.zip
- Outer bundle: `wix 4.zip`
- Adapter: React Native Calendars
- Merged use: Calendar/scheduler module pattern.
- Runtime strategy: static calendar/event list with JSON data
- Files inspected: 290
- Archive size: 11.77 MB
- Common extensions: .png (72), .tsx (44), .ts (43), .js (38), .json (17), .md (14), [no ext] (12), .xml (9)
- Key files:
  - `react-native-calendars-master/LICENSE`
  - `react-native-calendars-master/README.md`
  - `react-native-calendars-master/docsRNC/README.md`
  - `react-native-calendars-master/docsRNC/package.json`
  - `react-native-calendars-master/package.json`
- Package summaries:
  - `react-native-calendars-master/docsRNC/package.json`: docs-rnc 0.0.0 — 
  - `react-native-calendars-master/package.json`: react-native-calendars 1.22.0 — React Native Calendar Components
- README signal: # React Native Calendars 🗓️ 📆 ## A declarative cross-platform React Native calendar component for iOS and Android. <br> This module includes information on how to use this customizable **React Native** calendar component. The package is compatible with both **Android** and **iOS** <br> > ### **Official documentation** >

## react-native-navigation-master.zip
- Outer bundle: `wix 4.zip`
- Adapter: React Native Navigation
- Merged use: Mobile navigation/shell planning module.
- Runtime strategy: static phone-shell navigation preview
- Files inspected: 2709
- Archive size: 31.82 MB
- Common extensions: .mdx (774), .tsx (328), .mm (298), .h (280), .java (257), .kt (170), .png (155), .ts (105)
- Key files:
  - `react-native-navigation-master/LICENSE`
  - `react-native-navigation-master/README.md`
  - `react-native-navigation-master/package.json`
  - `react-native-navigation-master/playground/README.md`
  - `react-native-navigation-master/playground/package.json`
  - `react-native-navigation-master/test-app/README.md`
  - `react-native-navigation-master/test-app/package.json`
  - `react-native-navigation-master/website/package.json`
- Package summaries:
  - `react-native-navigation-master/package.json`: react-native-navigation 8.8.7 — React Native Navigation - truly native navigation for iOS and Android
  - `react-native-navigation-master/playground/package.json`: react-native-navigation-playground 8.4.2 — React Native Navigation - truly native navigation for iOS and Android
  - `react-native-navigation-master/test-app/package.json`: TestApp 0.0.1 — 
  - `react-native-navigation-master/website/package.json`: website 0.0.0 — 
- README signal: <h1 align="center"> React Native Navigation </h1> React Native Navigation provides 100% native platform navigation on both iOS and Android for React Native apps. The JavaScript API is simple and cross-platform - just install it in your app and give your users the native feel they deserve. Ready to get started? Check out the [docs](https://wix.githu

## react-native-notifications-master.zip
- Outer bundle: `wix 4.zip`
- Adapter: React Native Notifications
- Merged use: Notification preference/sign-up module.
- Runtime strategy: browser Notification API placeholder + backend signup payload notes
- Files inspected: 252
- Archive size: 1.25 MB
- Common extensions: .java (41), .ts (28), .h (26), .m (22), .js (21), [no ext] (17), .md (17), .xml (9)
- Key files:
  - `react-native-notifications-master/LICENSE`
  - `react-native-notifications-master/README.md`
  - `react-native-notifications-master/package.json`
  - `react-native-notifications-master/website/README.md`
  - `react-native-notifications-master/website/package.json`
- Package summaries:
  - `react-native-notifications-master/package.json`: react-native-notifications 5.1.0 — Advanced Push Notifications (Silent, interactive notifications) for iOS & Android
  - `react-native-notifications-master/website/package.json`: unnamed  — 
- README signal: <h1 align="center"> React Native Notifications </h1> ![npm](https://img.shields.io/npm/dw/react-native-notifications.svg) Handle all the aspects of push notifications for your app, including remote and local notifications, interactive notifications, silent notifications, and more. **All the native iOS notifications features are supported!** _For in
