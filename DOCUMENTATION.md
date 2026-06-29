# InstaInsight Analyzer

## Purpose
Analyze Instagram followers/following locally.
No data leaves browser. Passwordless.

## Tech Stack
- React 19
- Vite 6
- TypeScript
- Tailwind CSS
- PWA
- Chrome Extension (optional)

## How It Works
1. User runs scraper script on instagram.com tab.
2. Script calls Instagram internal APIs via active session.
3. Returns follower/following lists as JSON.
4. Data sent to app via postMessage or clipboard.
5. App computes sets: unfollowback, fans, mutuals.
6. Results shown in UI; stored in localStorage for diff.

## Security
- 100% client-side.
- No server, no tracking.
- Uses only user's Instagram session.

## Data Flow
Scraper → (postMessage/clipboard) → Parser → UI
Parser: utils/instagramParser.ts
Scraper: utils/browserScript.ts (bookmarklet)

## Project Layout
- components/ : UI (StatsCard, UserList, SessionScanner)
- utils/    : parser, script generator, types
- extension/: Chrome extension files
- App.tsx   : root state & tabs
- index.tsx : entry
- vite.config.ts, tsconfig.json
- public/   : PWA assets, scraper.js copy
- dist/     : production build
- docs/     : GitHub Pages (copy of dist)

## Build & Run
Install: npm install
Dev: npm run dev → http://localhost:3000
Build: npm run build
Deploy: npm run deploy (build + gh-pages)

## Notes
- Scraper rotates X-IG-App-ID to avoid rate limits.
- On 429, waits 60s with countdown.
- Manual copy fallback for mobile/restricted env.
- Extension injects content.js, sends via chrome.runtime.