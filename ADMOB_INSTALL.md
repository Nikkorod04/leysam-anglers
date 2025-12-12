# AdMob Installation Instructions

## Step 1: Install the Package

Run one of these commands in your project:

```bash
# Using npm
npm install react-native-google-mobile-ads

# Using expo
expo install react-native-google-mobile-ads

# Using yarn
yarn add react-native-google-mobile-ads
```

## Step 2: Update app.json

Add the plugin to your `app.json` file:

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

## Step 3: Get Your AdMob IDs

### Register Your App on AdMob:
1. Go to https://admob.google.com
2. Click "Get Started"
3. Select "Mobile app" and choose your platform (Android)
4. Fill in your app details:
   - App name: "Leysam Anglers"
   - Platform: Android
   - App store URL: (leave blank for now, can update later)

5. Click "Create app"

### Create Ad Units:

After creating the app, create these ad units:

1. **Banner Ad Unit** (for bottom of screens)
   - Select "Banner" as format
   - Name it something like "LeySam Anglers - Banner"
   - Get your Banner Ad Unit ID

2. **Interstitial Ad Unit** (for between screens)
   - Select "Interstitial" as format
   - Name it something like "LeySam Anglers - Interstitial"
   - Get your Interstitial Ad Unit ID

3. **Rewarded Ad Unit** (optional, for special features)
   - Select "Rewarded" as format
   - Get your Rewarded Ad Unit ID

## Step 4: Update Ad Unit IDs

Edit `src/services/admob.ts` and replace the test IDs with your production IDs:

```typescript
const AD_UNIT_IDS = {
  android: {
    banner: 'ca-app-pub-YOUR-ID-HERE', // Your Banner Ad Unit ID
    interstitial: 'ca-app-pub-YOUR-ID-HERE', // Your Interstitial Ad Unit ID
    rewarded: 'ca-app-pub-YOUR-ID-HERE', // Your Rewarded Ad Unit ID
  },
  ios: {
    banner: 'ca-app-pub-YOUR-ID-HERE',
    interstitial: 'ca-app-pub-YOUR-ID-HERE',
    rewarded: 'ca-app-pub-YOUR-ID-HERE',
  },
};
```

## Step 5: Initialize AdMob in Your App

Edit `src/App.tsx` and add this import and initialization:

```typescript
import { initializeAdMob } from './services/admob';

// In your App component, before the main return:
useEffect(() => {
  initializeAdMob();
}, []);
```

## Step 6: Add Banner Ads to Screens

### Example: Add to FeedScreen

```typescript
import { BannerAdComponent } from '../components/BannerAd';

// At the bottom of your FeedScreen component, before closing ScrollView:
<BannerAdComponent />
```

### Example: Add to MapScreen

```typescript
import { BannerAdComponent } from '../components/BannerAd';

// Add to the View at the bottom:
<BannerAdComponent />
```

## Step 7: Use Interstitial Ads (Optional)

Show full-screen ads when navigating:

```typescript
import { useInterstitialAd } from '../hooks/useInterstitialAd';

// In your component:
const { showAd } = useInterstitialAd();

// Show ad before navigation:
const handleNavigate = async () => {
  await showAd();
  navigation.navigate('SpotDetail', { spot });
};
```

## Testing

### Test Ad Unit IDs (Use These First):
```
Banner: ca-app-pub-3940256099942544/6300978111
Interstitial: ca-app-pub-3940256099942544/1033173712
Rewarded: ca-app-pub-3940256099942544/5224354917
```

### Important Testing Notes:
1. Always use test IDs when developing
2. Switch to production IDs only after thoroughly testing
3. Never click your own ads in production
4. Ads may take 24-48 hours to appear after creating new ad units
5. Google may disable your account if you artificially inflate ad impressions

## Recommended Ad Placement Strategy

### Banner Ads:
- Bottom of MapScreen (under the map)
- Bottom of FeedScreen (under the feed)
- Bottom of SpotDetailScreen (under spot info)
- Frequency: Every time

### Interstitial Ads:
- After opening a fishing spot details (every 2-3 spots)
- After posting a catch report (every 3 posts)
- Frequency: Every 3-5 minutes minimum

### Rewarded Ads:
- Before viewing premium features (optional)
- For removing ads temporarily (optional)

## Common Issues & Solutions

### Issue: "Cannot find module 'react-native-google-mobile-ads'"
**Solution:** Make sure you ran `npm install react-native-google-mobile-ads` and updated app.json with the plugin

### Issue: Ads not showing
**Solution:** 
- Verify you're using the correct ad unit IDs
- Check that you're in development mode with test IDs
- Wait 24-48 hours after creating new ad units
- Check your AdMob console for any warnings

### Issue: App crashes when loading ads
**Solution:**
- Make sure react-native-google-mobile-ads is installed
- Verify app.json has the correct plugin configuration
- Rebuild the app with `expo prebuild --clean`

## Next Steps

1. Install the package: `npm install react-native-google-mobile-ads`
2. Update app.json with the plugin
3. Get your AdMob IDs from admob.google.com
4. Update src/services/admob.ts with your IDs
5. Test with banner ads on a few screens first
6. Then add interstitial ads for navigation

Need help? Let me know!
