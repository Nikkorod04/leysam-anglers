# LeySam Anglers

A mobile application for anglers in Leyte and Samar, Philippines, to share and discover local fishing spots.

## Features

- 🗺️ **Interactive Map**: View fishing spots across Leyte and Samar
- 📍 **Add Fishing Spots**: Pin your favorite fishing locations with details
- 🐟 **Catch Reports**: Share your catches with the community
- 📸 **Photo Sharing**: Upload pictures of your catches
- ❤️ **Social Interaction**: Like and comment on posts
- 🔐 **Firebase Authentication**: Secure signup and login
- 💾 **Cloud Storage**: All data stored securely in Firebase

## Tech Stack

- **React Native** with **Expo**
- **TypeScript**
- **Firebase** (Authentication, Firestore, Storage)
- **React Navigation**
- **React Native Maps**
- **Expo Location & Image Picker**

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your mobile device ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

## Firebase Setup

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project"
   - Follow the setup wizard

2. **Enable Authentication**
   - In Firebase Console, go to Authentication > Sign-in method
   - Enable "Email/Password" provider

3. **Create Firestore Database**
   - Go to Firestore Database > Create database
   - Start in test mode (or production mode with security rules)
   - Choose a location close to Philippines (e.g., asia-southeast1)

4. **Enable Firebase Storage**
   - Go to Storage > Get Started
   - Start in test mode (or production mode with security rules)

5. **Get Firebase Configuration**
   - Go to Project Settings > General
   - Scroll to "Your apps" section
   - Click on web icon (</>)
   - Copy the firebaseConfig object

6. **Update Firebase Config**
   - Open `src/services/firebase.ts`
   - Replace the placeholder values with your Firebase config:
   ```typescript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

## Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd "Leysam Anglers"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase** (see Firebase Setup section above)

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on your device**
   - Open Expo Go app on your mobile device
   - Scan the QR code shown in the terminal or browser
   - The app will load on your device

## Running on Emulator/Simulator

### Android
```bash
npm run android
```
*Requires Android Studio and Android emulator setup*

### iOS (macOS only)
```bash
npm run ios
```
*Requires Xcode and iOS simulator*

## Project Structure

```
leysam-anglers/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── Button.tsx
│   │   └── Input.tsx
│   ├── constants/        # App constants and theme
│   │   └── theme.ts
│   ├── context/          # React Context providers
│   │   └── AuthContext.tsx
│   ├── navigation/       # Navigation configuration
│   │   └── AppNavigator.tsx
│   ├── screens/          # App screens
│   │   ├── LoginScreen.tsx
│   │   ├── SignupScreen.tsx
│   │   ├── MapScreen.tsx
│   │   ├── AddSpotScreen.tsx
│   │   ├── FeedScreen.tsx
│   │   ├── AddReportScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── services/         # External services
│   │   └── firebase.ts
│   └── types/            # TypeScript type definitions
│       └── index.ts
├── App.tsx               # Root component
├── app.json              # Expo configuration
└── package.json          # Dependencies
```

## Key Features Guide

### 1. Authentication
- Users can sign up with email and password
- Login with existing credentials
- Secure authentication via Firebase Auth

### 2. Map View
- Interactive map centered on Leyte and Samar
- Green markers indicate fishing spots
- Tap markers to view spot details
- Blue "+" button to add new spots

### 3. Adding Fishing Spots
- Capture current GPS location
- Add spot name, description, and fish types
- Specify best fishing times
- Upload multiple photos
- All spots visible to community

### 4. Catch Reports Feed
- Social media-style feed of catches
- Like and comment on reports
- View catch details (fish type, weight, length)
- Upload catch photos
- Red "+" button to create new report

### 5. Profile
- View account information
- Access personal spots and reports
- Logout functionality

## Firebase Security Rules (Recommended)

### Firestore Rules
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

### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Troubleshooting

### Issue: "Cannot connect to Metro bundler"
- Ensure your device and computer are on the same WiFi network
- Try running `npm start -- --tunnel`

### Issue: "Module not found"
- Clear cache: `npm start -- --clear`
- Reinstall dependencies: `rm -rf node_modules && npm install`

### Issue: Map not showing
- Ensure you have location permissions enabled
- Check that you're testing on a physical device (maps may not work well in simulators)

### Issue: Firebase errors
- Verify your Firebase config in `src/services/firebase.ts`
- Check Firebase Console for authentication and database rules
- Ensure billing is enabled for Firebase (required for some features)

## Development Tips

- Use Expo Go for rapid testing during development
- Test on both iOS and Android devices
- Check Firebase Console logs for backend issues
- Use React Native Debugger for debugging

## Building for Production

### Create Expo build
```bash
expo build:android
expo build:ios
```

Follow Expo's documentation for detailed build instructions.

## License

This project is open source and available for educational purposes.

## Support

For issues and questions:
- Check Firebase Console for backend errors
- Review Expo documentation: https://docs.expo.dev
- Check React Native Maps documentation: https://github.com/react-native-maps/react-native-maps

## Future Enhancements

- [ ] Weather integration for fishing forecasts
- [ ] Offline mode with local caching
- [ ] Advanced search and filters
- [ ] Friend system and private spots
- [ ] Fishing tournaments and leaderboards
- [ ] Push notifications
- [ ] Multi-language support (English, Tagalog, Waray)

---

**Happy Fishing! 🎣**
