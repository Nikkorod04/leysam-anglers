# AdMob Setup Guide for Leysam Anglers

## Prerequisites
1. Google AdSense Account (linked to Google Play)
2. Google Play Developer Account
3. React Native app with Expo

## Step 1: Get Your AdMob IDs

### For Android:
1. Go to [Google AdMob Console](https://admob.google.com)
2. Sign in with your Google account
3. Click "Get started" if it's your first time
4. Create an app: Select "Mobile app" → Choose "Android"
5. Fill in your app details
6. After creating the app, create ad units:
   - **Banner Ad Unit ID**: For banner ads (typically at bottom of screens)
   - **Interstitial Ad Unit ID**: For full-screen ads (between screens)
   - **Reward Ad Unit ID**: For rewarded video ads (optional)

7. Save these IDs - you'll need them in your code

### For iOS (Optional):
1. Repeat the above steps but select "iOS" instead of "Android"
2. Get your iOS App ID and ad unit IDs

## Step 2: Install Required Package

Run this command in your project directory:

```bash
npm install react-native-google-mobile-ads
```

Or with Expo:

```bash
expo install react-native-google-mobile-ads
```

## Step 3: Configure app.json

Add these settings to your `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-google-mobile-ads",
        {
          "android": {
            "nativeVersion": "20.6.0"
          }
        }
      ]
    ]
  }
}
```

## Step 4: Initialize AdMob

We'll create an AdMob service file that initializes the ads with your IDs.

## Step 5: Ad Unit IDs to Use

Replace these with your actual AdMob IDs:

### Android Test IDs (for development):
```
Banner: ca-app-pub-3940256099942544/6300978111
Interstitial: ca-app-pub-3940256099942544/1033173712
Rewarded: ca-app-pub-3940256099942544/5224354917
```

### Your Production IDs (once you get them from AdMob):
```
Banner: ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxxxxxxxx
Interstitial: ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxxxxxxxx
Rewarded: ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxxxxxxxx
```

## Step 6: Recommended Ad Placement

1. **Banner Ads**: Bottom of MapScreen, FeedScreen
2. **Interstitial Ads**: Between screens (when navigating to spot details)
3. **Rewarded Ads**: For special features like liking spots without ads

## Important Notes

- Always test with test IDs first before deploying
- Google will disable your account if you click your own ads
- Ads appear after 24-48 hours for new ad units
- Banner ads: 320x50 (standard), 320x100 (large), 300x250 (medium rectangle)
- Interstitial ads: Full screen (recommended frequency: 1 every 3-5 minutes)

## Next Steps

1. Get your AdMob IDs from Google AdMob Console
2. I'll create the AdMob service file with your IDs
3. I'll add banner ads to key screens
4. Test with test IDs first, then switch to production IDs

Let me know your AdMob IDs when you have them!
