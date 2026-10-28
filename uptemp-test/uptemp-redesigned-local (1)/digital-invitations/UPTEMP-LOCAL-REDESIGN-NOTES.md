# UPTEMP local redesign notes

## Implemented in this working copy
- Rebuilt the homepage with an original UPTEMP light-blue visual system, responsive navigation, invitation preview compositions, occasion discovery, feature explanations, how-it-works, and free-use messaging.
- Updated global design tokens and focus states to the light-blue palette.
- Updated page metadata for UPTEMP.
- Improved template discovery with category query parameters, search query parameters, alphabetical sorting, and consistent Free labels.
- Added data-driven template definitions for the requested invitation styles plus birthday and housewarming options (12 total).
- Set every template definition to free.
- Updated category resolution in the seed/sync scripts to support multi-word category slugs such as `jain-events` and `religious-events`.
- Removed paid-template messaging from the customer creation experience and roadmap copy.
- Updated the invitation editor's workspace chrome to match the light-blue application theme.

## Local setup after copying these files
Run from `D:\xampp\htdocs\tem\digital-invitations` in PowerShell:

```powershell
npm.cmd exec -- prisma generate --schema="packages/database/prisma/schema.prisma"
npm.cmd run templates:sync
```

The template sync upserts template metadata/configuration and does not reset the database or delete invitations, guests, or events. If the database connection is unavailable, fix the local database connection first and rerun the sync.

Then run (if the development server is not already running):

```powershell
npm.cmd run dev
```

Open `http://localhost:3000` and refresh the page.

## Checks performed in the working copy
- Web TypeScript check: passed.
- API TypeScript check: passed.
- Prisma seed/template-sync TypeScript check: passed.
- All template config JSON files parsed successfully; 12 configs are present and all have `isPremium: false`.
- A full Next.js production build could not be completed in this environment because the uploaded Windows dependencies do not include the Linux SWC binary and outbound npm registry access was unavailable. Run `npm.cmd run build:web` on the user's Windows machine after applying the files to verify the platform-specific build.

## Important
This working copy has not been deployed or pushed to GitHub. Review changes locally before committing.
