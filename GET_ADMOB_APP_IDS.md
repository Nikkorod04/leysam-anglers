# Getting Your AdMob App IDs

## Step 1: Get Your Android App ID

1. Go to https://admob.google.com
2. Sign in with your Google account
3. Click on **"Apps"** in the left sidebar
4. Click **"Add app"**
5. Select **"Android"**
6. Fill in your app details:
   - App name: "LeySam Anglers"
   - Select "Play Store" if your app is published, or "I'm not publishing..." if it's still in development
7. Click **"Create"**
8. Your **Android App ID** will be displayed (looks like: `ca-app-pub-xxxxxxxxxxxxxxxx`)
9. Copy this ID

## Step 2: Get Your iOS App ID (Optional for now)

1. Same process, but select **"iOS"** instead of Android
2. Fill in your app details
3. Copy your **iOS App ID**

## Step 3: Update app.json

Replace the placeholder IDs in your `app.json`:

```json
"plugins": [
  [
    "react-native-google-mobile-ads",
    {
      "androidAppId": "ca-app-pub-YOUR-ANDROID-ID-HERE",
      "iosAppId": "ca-app-pub-YOUR-IOS-ID-HERE",
      "android": {
        "nativeVersion": "20.6.0"
      }
    }
  ]
]
```

## Step 4: Rebuild Your App

After updating app.json with your real App IDs, run:

```bash
npx expo prebuild --clean
npm start
```

## Alternative: Using Test App IDs (for development)

If you don't have AdMob IDs yet, you can temporarily use:
- Android: `ca-app-pub-3940256099942544~3347511713`
- iOS: `ca-app-pub-3940256099942544~1458002511`

These are Google's official test IDs and won't get your account flagged.

## Important Notes

- Your real App IDs are different from Ad Unit IDs (which go in src/services/admob.ts)
- App IDs are for the entire application
- Ad Unit IDs are for individual ads (banners, interstitials, etc.)
- You need BOTH App IDs and Ad Unit IDs for ads to work

## Troubleshooting

If you still get "RNGoogleMobileAdsModule not found" after updating:

1. Delete the `node_modules` folder:
   ```bash
   rm -r node_modules
   ```

2. Delete the Android build folder:
   ```bash
   rm -rf android
   ```

3. Reinstall and rebuild:
   ```bash
   npm install
   npx expo prebuild --clean
   npm start
   ```
