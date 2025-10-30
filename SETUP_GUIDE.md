# LeySam Anglers - Complete Setup Guide

This guide will walk you through setting up the LeySam Anglers app from scratch.

## Step 1: Verify Prerequisites

Ensure you have installed:
- ✅ Node.js (v16+): `node --version`
- ✅ npm: `npm --version`
- ✅ Expo CLI: `npm install -g expo-cli`
- ✅ Expo Go app on your phone

## Step 2: Install Dependencies

The dependencies should already be installed. If not, run:

```bash
npm install
```

## Step 3: Set Up Firebase (IMPORTANT!)

### 3.1 Create Firebase Project

1. Go to https://console.firebase.google.com/
2. Click "Add project" or "Create a project"
3. Enter project name: "LeySam Anglers" (or your choice)
4. Disable Google Analytics (optional for this project)
5. Click "Create project"

### 3.2 Enable Email/Password Authentication

1. In Firebase Console, click "Authentication" in the left menu
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Click on "Email/Password"
5. Enable the toggle and click "Save"

### 3.3 Create Firestore Database

1. Click "Firestore Database" in the left menu
2. Click "Create database"
3. Select "Start in test mode" (we'll add security rules later)
4. Choose a location: **asia-southeast1 (Singapore)** - closest to Philippines
5. Click "Enable"

### 3.4 Enable Firebase Storage

1. Click "Storage" in the left menu
2. Click "Get started"
3. Keep the default security rules (test mode)
4. Use the same location as Firestore
5. Click "Done"

### 3.5 Get Your Firebase Configuration

1. Click the gear icon ⚙️ next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon `</>`
5. Register app with nickname: "LeySam Anglers Web"
6. You'll see a configuration object like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "leysam-anglers.firebaseapp.com",
  projectId: "leysam-anglers",
  storageBucket: "leysam-anglers.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

### 3.6 Update Your App Configuration

1. Open the file: `src/services/firebase.ts`
2. Replace the placeholder values with your actual Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_ACTUAL_AUTH_DOMAIN",
  projectId: "YOUR_ACTUAL_PROJECT_ID",
  storageBucket: "YOUR_ACTUAL_STORAGE_BUCKET",
  messagingSenderId: "YOUR_ACTUAL_MESSAGING_SENDER_ID",
  appId: "YOUR_ACTUAL_APP_ID"
};
```

3. Save the file

## Step 4: Start the Development Server

```bash
npm start
```

You should see:
- A QR code in your terminal
- A browser window opening with Metro bundler

## Step 5: Run on Your Mobile Device

### For Android:
1. Open **Expo Go** app from Play Store
2. Tap "Scan QR code"
3. Scan the QR code from your terminal/browser
4. Wait for the app to load (may take 1-2 minutes first time)

### For iOS:
1. Open **Expo Go** app from App Store
2. If on the same WiFi, the project should appear automatically
3. OR scan the QR code using your Camera app
4. Wait for the app to load

## Step 6: Test the App

### 6.1 Create an Account
1. Open the app - you'll see the Login screen
2. Tap "Don't have an account? Sign Up"
3. Fill in:
   - Display Name: Your name
   - Email: your.email@example.com
   - Password: at least 6 characters
   - Confirm Password: same as password
4. Tap "Sign Up"
5. You should see "Account created successfully!"

### 6.2 Add a Fishing Spot
1. You'll be on the Map screen (centered on Leyte/Samar)
2. Tap the green "+" button at the bottom right
3. Fill in spot details:
   - Spot Name: e.g., "Tacloban Bay"
   - Description: Details about the spot
   - Fish Types: e.g., "Tuna, Mackerel, Grouper"
   - Best Fishing Time: e.g., "Early morning 5-8 AM"
4. Tap "Capture Current Location" (grant location permission if asked)
5. Optionally add photos
6. Tap "Add Fishing Spot"
7. Return to map - you should see your marker!

### 6.3 Post a Catch Report
1. Go to "Catch Reports" tab at the bottom
2. Tap the blue "+" button
3. Fill in catch details:
   - Title: e.g., "Amazing Tuna Catch!"
   - Description: Your fishing story
   - Fish Type: e.g., "Yellowfin Tuna"
   - Weight (optional): e.g., "15kg"
   - Length (optional): e.g., "80cm"
4. Add photos of your catch
5. Tap "Post Catch Report"
6. Your post appears in the feed!

### 6.4 Interact with Content
1. Tap the ❤️ icon to like posts
2. Tap on any post to view full details
3. View other users' fishing spots on the map

## Troubleshooting Common Issues

### Issue 1: "Cannot connect to Metro"
**Solution:**
- Ensure phone and computer are on the same WiFi
- Try: `npm start -- --tunnel`
- Restart Expo Go app

### Issue 2: "Firebase: Error (auth/...)"
**Solution:**
- Check `src/services/firebase.ts` has correct config
- Verify Email/Password is enabled in Firebase Console
- Check internet connection

### Issue 3: Map not loading
**Solution:**
- Test on a physical device (not simulator)
- Grant location permissions when prompted
- Check if you're in a location with GPS signal

### Issue 4: Images not uploading
**Solution:**
- Grant camera/photo permissions when prompted
- Check Firebase Storage is enabled
- Check internet connection

### Issue 5: "Module not found"
**Solution:**
```bash
npm start -- --clear
```
Or reinstall:
```bash
rm -rf node_modules
npm install
```

## Firebase Security Rules (Production)

Before deploying to production, update your Firebase security rules:

### Firestore Rules
1. Go to Firestore Database > Rules
2. Replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth.uid == userId;
    }
    
    match /fishingSpots/{spotId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.userId;
    }
    
    match /catchReports/{reportId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.userId;
    }
  }
}
```

3. Click "Publish"

### Storage Rules
1. Go to Storage > Rules
2. Replace with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.resource.size < 5 * 1024 * 1024;
    }
  }
}
```

3. Click "Publish"

## Testing Checklist

- [ ] Can create a new account
- [ ] Can login with existing account
- [ ] Can view map with Leyte/Samar region
- [ ] Can capture current location
- [ ] Can add a fishing spot with photos
- [ ] Can see fishing spot markers on map
- [ ] Can view catch reports feed
- [ ] Can post a catch report with photos
- [ ] Can like posts
- [ ] Can view profile information
- [ ] Can logout

## Next Steps

1. **Invite Friends**: Share the app with fellow anglers
2. **Explore Features**: Try all functionalities
3. **Report Issues**: Note any bugs or improvements
4. **Customize**: Modify colors, add features as needed

## Need Help?

- Check Firebase Console for backend errors
- View logs in Expo Go app (shake device → "Toggle Developer Menu" → "Show/Hide Element Inspector")
- Review the main README.md for more details
- Check Expo documentation: https://docs.expo.dev

---

**You're all set! Happy fishing! 🎣**
