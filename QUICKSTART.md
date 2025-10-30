# 🚀 Quick Start Guide - LeySam Anglers

Get your app running in 5 minutes!

## ⚡ Step 1: Firebase Setup (2 minutes)

1. Go to https://console.firebase.google.com/
2. Create new project: "LeySam Anglers"
3. Enable these services:
   - **Authentication** → Email/Password → Enable
   - **Firestore Database** → Create → Test mode → asia-southeast1
   - **Storage** → Get Started → Test mode

4. Get config:
   - Click ⚙️ → Project Settings
   - Scroll down → Add web app
   - Copy the config values

5. Update `src/services/firebase.ts`:
   ```typescript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",           // Paste yours here
     authDomain: "YOUR_AUTH_DOMAIN",   // Paste yours here
     projectId: "YOUR_PROJECT_ID",     // Paste yours here
     storageBucket: "YOUR_STORAGE_BUCKET",  // Paste yours here
     messagingSenderId: "YOUR_SENDER_ID",    // Paste yours here
     appId: "YOUR_APP_ID"              // Paste yours here
   };
   ```

## ⚡ Step 2: Start the App (1 minute)

```bash
npm start
```

Wait for QR code to appear.

## ⚡ Step 3: Open on Phone (1 minute)

**Android:**
- Open Expo Go app
- Tap "Scan QR code"
- Scan the QR code

**iOS:**
- Open Expo Go app
- Project should appear automatically
- Or scan QR with Camera app

## ⚡ Step 4: Test It! (1 minute)

1. **Sign Up:**
   - Tap "Don't have an account? Sign Up"
   - Enter name, email, password
   - Tap "Sign Up"

2. **Add a Spot:**
   - Tap green + button on map
   - Fill in details
   - Tap "Capture Current Location"
   - Tap "Add Fishing Spot"

3. **Post a Catch:**
   - Go to "Catch Reports" tab
   - Tap blue + button
   - Fill in your catch details
   - Add photos (optional)
   - Tap "Post Catch Report"

## ✅ You're Done!

Your app is now running and connected to Firebase!

## 🆘 Quick Troubleshooting

**Can't connect?**
```bash
npm start -- --tunnel
```

**Firebase errors?**
- Double-check your config in `src/services/firebase.ts`
- Make sure Email/Password auth is enabled

**Need help?**
- See `SETUP_GUIDE.md` for detailed instructions
- See `FIREBASE_CONFIG.md` for Firebase help

---

**Happy Fishing! 🎣**
