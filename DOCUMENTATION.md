# 📑 InstaInsight Technical Documentation: Comprehensive Deep Dive!

Hello everyone! 👋 This documentation is carefully crafted to ensure that every developer—from beginners learning the ropes to seasoned seniors—can fully grasp how InstaInsight Analyzer works from start to finish.

Let's dive into the technical details in a friendly yet professional manner!

---

## 🚀 Philosophy: Secure by Design
Our primary principle is absolute: **User data security is non-negotiable.**
We will never, and have no way to, ask for your Instagram password. We leverage the user's existing browser session to ensure that data acquisition is both legal and secure within the user's own environment.

---

## 🛠️ Tech Stack
- **React 19**: The latest version for building highly responsive and modern UIs.
- **Vite 6**: A lightning-fast build tool that elevates the developer experience.
- **TypeScript**: Providing robust type safety to eliminate common bugs during development.
- **Tailwind CSS**: For a clean, aesthetic, and easily maintainable design system.
- **PWA**: Making the web app installable on mobile and desktop for better accessibility.

---

## 🏗️ Architecture & Data Flow

InstaInsight is a **Client-Only** application. This means 100% of the processing happens locally on your device. No sensitive data is ever sent to external servers.

### 1. Data Acquisition
Instagram enforces strict CORS (Cross-Origin Resource Sharing) policies. This prevents external websites from directly calling their internal APIs.
**Our Solution:**
- We provide a **Scraper Script** (pure JavaScript) that the user runs within the context of the `instagram.com` tab.
- Since it runs in that context, the script is authorized to call the internal Instagram APIs (`/api/v1/friendships/...`) using the user's active session.

### 2. Handling Limits (*Evasion & Reliability*)
Instagram is very sensitive to automated requests. To handle this like a pro, we've implemented:
- **App-ID Rotation**: We rotate the `X-IG-App-ID` header to minimize the footprint of the scraper.
- **Rate Limit Grace Period**: If the script encounters a `429 (Too Many Requests)` error, it automatically pauses for 60 seconds. A transparent countdown timer keeps the user informed throughout the process.

### 3. Data Synchronization
Once the script has fetched the follower lists, it sends the raw data back to the main app via two channels:
- **Primary Channel**: Using `window.postMessage` for seamless automatic syncing.
- **Fallback Channel**: Manual Clipboard JSON transfer for cases where automatic syncing is restricted.

### 4. Processing Core (`utils/instagramParser.ts`)
This is where the mathematical set operations happen:
- **Unfollback**: `Following \ Followers` (Those you follow who don't follow you back).
- **Fans**: `Followers \ Following` (Followers who you haven't followed back).
- **Mutuals**: `Following ∩ Followers` (Friends who follow each other).

---

## 📁 Directory Breakdown
```text
├── components/          # UI Component library (StatsCards, UserLists, Scanner)
├── services/            # Business logic for Instagram API interaction
├── utils/
├── browserScript.ts # Scraper script generator (Injectable JS)
└── instagramParser.ts # The "brains" behind the follower analysis
├── types.ts             # TypeScript interfaces for data safety
├── App.tsx              # Root component (State Management & UI Flow)
└── site.webmanifest     # PWA configuration for installation
```

---

## 🚦 Getting Started (For Developers)

1. **Install**: `npm install`.
2. **Develop**: `npm run dev`.
3. **View**: Open `http://localhost:3000` in your browser.

---

## 💡 Future Recommendations
1. **Dynamic Batching**: Adjusting sleep durations dynamically based on list size for faster fetching.
2. **Detailed History**: Tracking exact timestamps of when a user followed/unfollowed (requires more persistent background scanning).

---
*We hope this documentation helps you understand and potentially contribute to InstaInsight. Happy coding!*
