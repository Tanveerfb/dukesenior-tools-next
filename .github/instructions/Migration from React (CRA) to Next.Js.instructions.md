---

applyTo: '\*\*'
---Migration to Next.js (TypeScript) – Project Guide
Overview
This project is a full migration of the original React (CRA) playground to a modern Next.js (TypeScript) stack. The goal is to preserve all historical tournament data (from Firestore), modernize the codebase, and make future tournaments easier to manage and extend.

Key Points
Legacy Data: All previous tournament data (Tourney 3, Tourney 4, etc.) is still stored in Firestore and will be displayed in the new app using adapter functions. No data is lost.
Tech Stack: Next.js (App Router, TypeScript), Firebase (Auth, Firestore, Storage), Bootstrap + custom SCSS.
Hosting: The app is deployed on Firebase Hosting (same as before).
Auth: Uses Firebase Auth (client-side only for now).
Styling: Bootstrap and custom SCSS are used for UI consistency.
Migration Details
Adapters: Legacy tournament collections are accessed via adapter functions that normalize data for new components.
Pages: Tournament pages (e.g., /phasmo/phasmo-tourney-4) show both historical and future data.
No Data Loss: All previous runs, standings, and player info are visible and queryable.
Future-Proof: New tournaments will use a normalized schema for easier management.
How to Contribute
Clone the repo and run npm install.
Environment Variables: Add your Firebase config to .env.local (see example below).
Run locally: npm run dev
Legacy Data: Use adapter functions in src/lib/legacy/ to access old tournament data.
New Features: Add new tournaments using the config system in src/lib/tournaments/config.ts.
Styling: Use Bootstrap classes and extend with custom SCSS in src/styles/global.scss.
Firebase Config Example (.env.local)
Legacy Data Access Example
Questions or Help
For migration questions, see MIGRATION.md or ask in project chat.
For legacy data issues, check adapter functions or Firestore rules.
