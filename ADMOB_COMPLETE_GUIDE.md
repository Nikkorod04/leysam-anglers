# AdMob Complete Setup Guide for LeySam Anglers

This comprehensive guide covers everything you need to set up AdMob in your app, from installation to testing.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Step 1: Install the Package](#step-1-install-the-package)
3. [Step 2: Get Your AdMob IDs](#step-2-get-your-admob-ids)
4. [Step 3: Configure app.json](#step-3-configure-appjson)
5. [Step 4: Update Ad Unit IDs](#step-4-update-ad-unit-ids)
6. [Step 5: Build Your App](#step-5-build-your-app)
7. [Step 6: Add Ads to Your Screens](#step-6-add-ads-to-your-screens)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, you need:
- ✅ Google AdSense Account (linked to Google Play)
- ✅ Google Play Developer Account (optional for testing)
- ✅ Expo account (free at https://expo.dev)
- ✅ React Native app with Expo

---

## Step 1: Install the Package

Run this command in your project directory:

```bash
npm install react-native-google-mobile-ads
```

Or with Expo:

```bash
expo install react-native-google-mobile-ads
```

---

## Step 2: Get Your AdMob IDs

### 2.1 Get Your App IDs

1. Go to https://admob.google.com
2. Sign in with your Google account
3. Click on **"Apps"** in the left sidebar
4. Click **"Add app"**

#### For Android:
5. Select **"Android"**
6. Fill in your app details:
   - App name: "LeySam Anglers"
   - Select "Play Store" if published, or "I'm not publishing yet..." if in development
7. Click **"Create"**
8. Copy your **Android App ID** (looks like: `ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy`)

#### For iOS (Optional):
9. Repeat steps 5-8 but select **"iOS"** instead
10. Copy your **iOS App ID**

### 2.2 Create Ad Units

After creating your app, create these ad units:

#### Banner Ad Unit (for bottom of screens):
1. Select your app in AdMob console
2. Click "Ad units" → "Create ad unit"
3. Select **"Banner"** as format
4. Name it: "LeySam Anglers - Banner"
5. Click "Create ad unit"
6. Copy your **Banner Ad Unit ID** (looks like: `ca-app-pub-xxxxxxxxxxxxxxxx/zzzzzzzzzz`)

#### Interstitial Ad Unit (for between screens):
1. Click "Create ad unit" again
2. Select **"Interstitial"** as format
3. Name it: "LeySam Anglers - Interstitial"
4. Copy your **Interstitial Ad Unit ID**

#### Rewarded Ad Unit (optional):
1. Click "Create ad unit" again
2. Select **"Rewarded"** as format
3. Name it: "LeySam Anglers - Rewarded"
4. Copy your **Rewarded Ad Unit ID**

---

## Step 3: Configure app.json

Open `app.json` and add/update the AdMob plugin in the `plugins` array:

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": "ca-app-pub-YOUR-ANDROID-APP-ID",
          "iosAppId": "ca-app-pub-YOUR-IOS-APP-ID",
          "android": {
            "nativeVersion": "20.6.0"
          }
        }
      ]
    ]
  }
}
```

**Important**: 
- Replace `ca-app-pub-YOUR-ANDROID-APP-ID` with your actual Android App ID from Step 2.1
- Replace `ca-app-pub-YOUR-IOS-APP-ID` with your actual iOS App ID from Step 2.1
- These are **App IDs**, not Ad Unit IDs (those go in the next step)

---

## Step 4: Update Ad Unit IDs

Edit `src/services/admob.ts` and replace the IDs with your Ad Unit IDs from Step 2.2:

```typescript
const AD_UNIT_IDS = {
  android: {
    banner: 'ca-app-pub-YOUR-ID/YOUR-BANNER-UNIT-ID',       // Your Banner Ad Unit ID
    interstitial: 'ca-app-pub-YOUR-ID/YOUR-INTERSTITIAL-ID', // Your Interstitial Ad Unit ID
    rewarded: 'ca-app-pub-YOUR-ID/YOUR-REWARDED-ID',        // Your Rewarded Ad Unit ID (optional)
  },
  ios: {
    banner: 'ca-app-pub-YOUR-ID/YOUR-IOS-BANNER-ID',
    interstitial: 'ca-app-pub-YOUR-ID/YOUR-IOS-INTERSTITIAL-ID',
    rewarded: 'ca-app-pub-YOUR-ID/YOUR-IOS-REWARDED-ID',
  },
};
```

---

## Step 5: Build Your App

AdMob requires a development or production build (won't work with Expo Go).

### Method 1: Using EAS Build (RECOMMENDED)

**Why EAS?**
- ✅ No Android SDK installation needed
- ✅ No local dependencies to manage
- ✅ Builds in the cloud
- ✅ Works from any computer

**Steps:**

1. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo:**
   ```bash
   eas login
   ```

3. **Build for Android:**
   ```bash
   eas build --platform android --profile preview
   ```

   You'll be asked:
   - "Use managed keystore?" → Say **yes**
   - Wait 5-15 minutes for build

4. **Download and install the APK** on your device when complete

### Method 2: Using Local Development Build

If you prefer building locally:

```bash
# Prebuild the native project
npx expo prebuild --clean

# Run on Android
npx expo run:android
```

**Requirements:**
- Android Studio installed
- Android SDK configured
- Java Development Kit (JDK) installed

---

## Step 6: Add Ads to Your Screens

### 6.1 Initialize AdMob

The app already initializes AdMob automatically via the admob service.

### 6.2 Add Banner Ads

Banner ads are already implemented in `src/components/BannerAd.tsx`.

**To add to a screen:**

```typescript
import { BannerAdComponent } from '../components/BannerAd';

// At the bottom of your screen component:
<BannerAdComponent />
```

**Recommended placements:**
- Bottom of MapScreen
- Bottom of FeedScreen
- Bottom of SpotDetailScreen

### 6.3 Add Interstitial Ads

Use the `useInterstitialAd` hook (already implemented):

```typescript
import { useInterstitialAd } from '../hooks/useInterstitialAd';

function YourScreen() {
  const { showAd } = useInterstitialAd();

  const handleNavigate = async () => {
    await showAd(); // Show ad before navigation
    navigation.navigate('SpotDetail', { spot });
  };

  return (
    <Button onPress={handleNavigate}>View Spot</Button>
  );
}
```

**Best practices:**
- Show every 3-5 minutes (not on every action)
- Show after user completes an action (post created, spot viewed)
- Don't interrupt active tasks

---

## Testing

### Test Ad Unit IDs

**For development, use Google's official test IDs:**

```typescript
// Android Test IDs
Banner:       ca-app-pub-3940256099942544/6300978111
Interstitial: ca-app-pub-3940256099942544/1033173712
Rewarded:     ca-app-pub-3940256099942544/5224354917

// iOS Test IDs
Banner:       ca-app-pub-3940256099942544/2934735716
Interstitial: ca-app-pub-3940256099942544/4411468910
Rewarded:     ca-app-pub-3940256099942544/1712485313
```

### Testing Checklist

- [ ] Banner ad displays at bottom of screen
- [ ] Banner ad loads without errors
- [ ] Interstitial ad shows and closes properly
- [ ] Ads don't interfere with app functionality
- [ ] Test on both Android and iOS (if applicable)

### Important Testing Notes

1. ✅ **Always use test IDs during development**
2. ❌ **Never click your own production ads** (Google may ban your account)
3. ⏱️ **Ads may take 24-48 hours** to appear after creating new ad units
4. 🔄 **Replace test IDs with production IDs** only when ready to publish
5. 📊 **Monitor AdMob console** for ad performance and issues

---

## Troubleshooting

### Issue: "RNGoogleMobileAdsModule not found"

**Cause:** Native module not compiled

**Solution:**
1. Ensure `react-native-google-mobile-ads` is installed
2. Verify plugin is in `app.json`
3. Build with EAS or `npx expo run:android`
4. **Don't use Expo Go** (use development build instead)

### Issue: Ads not showing

**Possible causes:**
- Using wrong ad unit IDs
- New ad units (wait 24-48 hours)
- Network issues
- AdMob account not fully set up

**Solution:**
1. Verify ad unit IDs in `src/services/admob.ts`
2. Use test IDs to confirm ads work
3. Check AdMob console for warnings
4. Ensure you're testing on a development build, not Expo Go

### Issue: App crashes when loading ads

**Solution:**
1. Verify app.json has correct plugin configuration
2. Rebuild app: `npx expo prebuild --clean`
3. Check that App IDs (not Ad Unit IDs) are in app.json
4. Ensure you're using compatible AdMob SDK version

### Issue: "Module not found" errors

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npx expo prebuild --clean
```

### Issue: Different App IDs for Android and iOS

**This is normal!** Each platform should have its own App ID from AdMob console. Don't use the same ID for both platforms in production.

---

## Recommended Ad Placement Strategy

### Banner Ads (320x50 at bottom of screen)
- **Where**: MapScreen, FeedScreen, SpotDetailScreen
- **Frequency**: Persistent (always visible)
- **Best for**: Consistent ad impressions

### Interstitial Ads (full-screen)
- **Where**: Between screens (after viewing spot details, after posting report)
- **Frequency**: Every 3-5 minutes minimum
- **Best for**: Higher revenue per impression

### Rewarded Ads (video ads with reward)
- **Where**: Optional features (remove ads temporarily, unlock premium content)
- **Frequency**: User-initiated only
- **Best for**: User engagement and premium features

---

## Summary

**You've completed AdMob setup when:**
- ✅ Package installed
- ✅ App IDs in app.json
- ✅ Ad Unit IDs in admob.ts
- ✅ App built with EAS or local build
- ✅ Ads displaying correctly in development build
- ✅ Tested with test IDs successfully

**Before publishing:**
- ✅ Replace test IDs with production IDs
- ✅ Test thoroughly on production build
- ✅ Verify AdMob console shows app correctly
- ✅ Ensure app complies with AdMob policies

---

## Next Steps

1. Test your app with test IDs
2. Monitor AdMob console for impressions
3. Optimize ad placements based on user experience
4. When ready to publish:
   - Switch to production ad unit IDs
   - Build release version
   - Submit to app stores

---

**Need more help?** 
- AdMob Help Center: https://support.google.com/admob
- Expo AdMob Guide: https://docs.expo.dev/versions/latest/sdk/admob/
- React Native Google Mobile Ads: https://docs.page/invertase/react-native-google-mobile-ads

---

**Happy Monetizing! 💰**
