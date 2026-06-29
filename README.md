# InstaInsight Analyzer
Instagram follower analysis tool. Privacy-first, client-only.

## Features
- No password. All processing in-browser.
- Export to CSV.
- Persists last scan in localStorage.
- PWA installable.
- Smart scraper with rate-limit handling.

## Tech Stack
- React 19, Vite 6
- TypeScript
- Tailwind CSS
- PWA Manifest

## Usage
### Desktop
1. Drag "Scan IG Followers" bookmarklet to bookmarks bar.
2. On instagram.com (logged in), click the bookmark.
3. Click "Copy Results" when done.
4. Paste into InstaInsight app.

### Mobile
1. Open InstaInsight. Hold "Press & Hold To Copy" → script copied.
2. Bookmark InstaInsight page.
3. Edit bookmark: change URL to the pasted script. Name it "Scan IG".
4. Open instagram.com (new tab), tap bookmarks, run "Scan IG".
5. Copy result, paste back in InstaInsight.

## Development
```bash
npm install
npm run dev   # http://localhost:3000
npm run build # production build
npm run deploy # build + gh-pages
```

## See also
- [DOCUMENTATION.md](./DOCUMENTATION.md) - technical deep dive