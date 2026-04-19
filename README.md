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

## Quick Start

**New to this project?** See [QUICKSTART.md](QUICKSTART.md) for a 5-minute setup guide!

**Need detailed instructions?** See [SETUP_GUIDE.md](SETUP_GUIDE.md) for complete setup walkthrough.

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo Go app on your mobile device ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

### Installation Steps

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Create Firestore Database (asia-southeast1)
   - Enable Firebase Storage
   - Update `src/services/firebase.ts` with your credentials
   
   👉 See [FIREBASE_CONFIG.md](FIREBASE_CONFIG.md) for detailed Firebase setup

3. **Start the app**
   ```bash
   npm start
   ```

4. **Open on your device**
   - Scan the QR code with Expo Go app

## Documentation

- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Complete setup walkthrough
- **[FIREBASE_CONFIG.md](FIREBASE_CONFIG.md)** - Firebase configuration help
- **[FIRESTORE_RULES.md](FIRESTORE_RULES.md)** - Security rules
- **[ADMOB_COMPLETE_GUIDE.md](ADMOB_COMPLETE_GUIDE.md)** - AdMob monetization setup
- **[EAS_BUILD_GUIDE.md](EAS_BUILD_GUIDE.md)** - Building for production
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Technical overview

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

## Resources

- **Expo Docs**: https://docs.expo.dev
- **Firebase Docs**: https://firebase.google.com/docs
- **React Native Maps**: https://github.com/react-native-maps/react-native-maps

---

**Happy Fishing! 🎣**
See [SETUP_GUIDE.md](SETUP_GUIDE.md#troubleshooting-common-issues) for common issues and solutions.

**Quick fixes:**
- Clear cache: `npm start -- --clear`
- Reinstall: `rm -rf node_modules && npm install`
- Check Firebase config in `src/services/firebase.ts`

## Building for Production

See [EAS_BUILD_GUIDE.md](EAS_BUILD_GUIDE.md) for building with EAS (Expo Application Services)