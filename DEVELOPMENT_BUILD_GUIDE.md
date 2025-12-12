# Development Build Setup for AdMob (Option 2)

## What We Just Did
✅ Added the react-native-google-mobile-ads plugin to app.json
✅ Re-enabled the BannerAdComponent in SpotDetailScreen
✅ Configured your AdMob App IDs

## Now You Need to Build the Development App

You have 2 ways to proceed:

### Method 1: Using EAS (Expo Application Services) - RECOMMENDED
This is the easiest way to build a development app with native modules.

**Requirements:**
- Expo account (free at https://expo.dev)
- EAS CLI installed

**Steps:**
```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to your Expo account
eas login

# Build for Android locally
eas build --platform android --local --profile preview

# Or build and preview on device
eas build --platform android --profile preview
```

### Method 2: Using Android Studio (Advanced)
If you prefer native Android development:

```bash
# Prebuild the native project
npx expo prebuild --clean

# Build with Android Studio or:
cd android
./gradlew assembleRelease
```

### Method 3: Quick Test with Expo Go
For now, you can still test with Expo Go (but AdMob ads won't work):

```bash
npm start
# Then open in Expo Go
```

## What to Do Next

1. **Choose your method above** (Method 1 is easiest)

2. **Build the app**

3. **Once built, the app will have:**
   - ✅ Native Google Mobile Ads SDK compiled
   - ✅ Banner ads on fishing spot details
   - ✅ Interstitial ad support
   - ✅ Rewarded ad support

4. **Test the ads** - They will show using the test Ad Unit IDs

5. **When ready for production:**
   - Update AdMob Ad Unit IDs in `src/services/admob.ts` with your real IDs
   - Rebuild the app

## Important Notes

- Development builds stay on your device (don't use Expo Go)
- You can iterate quickly with `npm start` after building
- The native modules won't work in Expo Go, only in development/release builds
- Test IDs in admob.ts are safe to click without getting flagged

## Need Help?

If you run into issues:
1. Make sure you have a Google Play Developer account
2. Install Java (for Android builds)
3. Install Android SDK
4. Try Method 1 with EAS (simplest option)

Let me know which method you'd like to use!
