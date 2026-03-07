# InstaInsight Analyzer: Deep Dive into Your Followers!

Hello there! **InstaInsight Analyzer** is a modern web tool designed to help you analyze your Instagram followers. Find out who isn't following you back, identify your biggest fans, and see your mutual friends—all **without needing your password**. It's privacy-focused and easy to use!



## Key Features
- **Privacy First**: We never ask for your password. All data is processed 100% locally in your browser.
- **History Tracking**: Automatically identifies "Recently Unfollowed" users by comparing with your last scan.
- **Export to CSV**: Download any results list as a CSV file for your own records.
- **Persistence**: Your last scan is saved locally in your browser so it stays there even after a refresh.
- **PWA Support**: Want quick access? You can install this as a standalone app on your mobile or desktop.
- **Smart Scraper**: Our built-in script handles Instagram's API limits with automatic rotations and a countdown timer.

## Deep Dive Documentation
For developers (from beginners to seniors) who want to understand the inner workings and technical architecture, please check:
 **[DOCUMENTATION.md](./DOCUMENTATION.md)**

## How to Use (Desktop)
1. **Bookmark Support**: Drag the purple **"Scan IG Followers"** button from the app to your browser's **Bookmarks Bar**.
2. **Open Instagram**: Open [Instagram.com](https://www.instagram.com) in a new tab and ensure you are logged in.
3. **Start Scan**: Click the bookmark you just saved. A purple scanning overlay will appear on the Instagram page.
4. **Copy Results**: Once the scan is complete, click the **"Copy Results"** button in the overlay.
5. **Analyze**: Return to the InstaInsight tab and paste the data into the analysis box.

## How to Use (Mobile)
We have a specialized **3-Step Wizard** built into the app for mobile users:
1. **Step 1**: Press & hold the **"COPY KEY"** button in the app.
2. **Step 2**: Tap the **"GO TO INSTAGRAM"** button. 
 - *Ninja Tip:* Open it in a **New Tab** to avoid the Instagram app blocking you.
3. **Step 3**: In the IG tab, type `javascript:` in the address bar and paste the script. 
4. **Final Step**: Once the scan is done, copy the result and paste it back into the InstaInsight app.

## Developer: Local Installation
If you want to run this project on your own machine:
1. **Install Dependencies**:
 ```bash
 npm install
 ```
2. **Start the App**:
 ```bash
 npm run dev
 ```
3. Open `http://localhost:3000` in your browser.

## ️ Built With
- React 19 + Vite 6
- TypeScript
- Tailwind CSS
- Web App Manifest (PWA)

---
*Empowering users to have full control over their social data in a secure and ethically-conscious way.*
