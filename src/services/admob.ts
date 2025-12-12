// AdMob Test IDs (for development - replace with your production IDs)
// Get these from https://admob.google.com
const AD_UNIT_IDS = {
  android: {
    banner: 'ca-app-pub-4143696379274937/1528169277', // Test ID - Replace with your own
    interstitial: 'ca-app-pub-4143696379274937/2631042541', // Test ID - Replace with your own
    rewarded: 'ca-app-pub-4143696379274937/5224354917', // Test ID - Replace with your own
  },
  ios: {
    banner: 'ca-app-pub-4143696379274937/1528169277', // Test ID - Replace with your own
    interstitial: 'ca-app-pub-4143696379274937/2631042541', // Test ID - Replace with your own
    rewarded: 'ca-app-pub-4143696379274937/5224354917', // Test ID - Replace with your own
  },
};

// Export the ad unit IDs based on platform
export const getAdUnitIds = () => {
  // Detect platform (Android or iOS)
  // For Expo, we'll use Android IDs by default
  return AD_UNIT_IDS.android;
};

// Banner ad sizes
export const BANNER_AD_SIZE = {
  SMART_BANNER: 'smartBanner', // Automatically adjusts size
  BANNER: 'banner', // 320x50
  LARGE_BANNER: 'largeBanner', // 320x100
  MEDIUM_RECTANGLE: 'mediumRectangle', // 300x250
};

/**
 * Initialize AdMob
 * Call this once in your App.tsx or root component
 */
export const initializeAdMob = async () => {
  try {
    // This will be initialized when we import the mobile ads package
    console.log('AdMob initialized');
  } catch (error) {
    console.error('Failed to initialize AdMob:', error);
  }
};

/**
 * Get the appropriate ad unit ID for banner ads
 * @param platform 'android' or 'ios'
 * @returns Banner ad unit ID
 */
export const getBannerAdUnitId = (platform: 'android' | 'ios' = 'android') => {
  return AD_UNIT_IDS[platform].banner;
};

/**
 * Get the appropriate ad unit ID for interstitial ads
 * @param platform 'android' or 'ios'
 * @returns Interstitial ad unit ID
 */
export const getInterstitialAdUnitId = (platform: 'android' | 'ios' = 'android') => {
  return AD_UNIT_IDS[platform].interstitial;
};

/**
 * Get the appropriate ad unit ID for rewarded ads
 * @param platform 'android' or 'ios'
 * @returns Rewarded ad unit ID
 */
export const getRewardedAdUnitId = (platform: 'android' | 'ios' = 'android') => {
  return AD_UNIT_IDS[platform].rewarded;
};

/**
 * Load an interstitial ad (full-screen ad)
 * Usage in your code:
 * const interstitial = new InterstitialAd(getInterstitialAdUnitId());
 * interstitial.load();
 */

/**
 * Load a rewarded ad (video ad that gives user a reward)
 * Usage in your code:
 * const rewarded = new RewardedAd(getRewardedAdUnitId());
 * rewarded.load();
 */

/**
 * Note: To update with your production AdMob IDs:
 * 1. Go to https://admob.google.com
 * 2. Create an app and ad units
 * 3. Copy your ad unit IDs
 * 4. Replace the test IDs in AD_UNIT_IDS above with your production IDs
 * 5. Make sure to update both android and ios sections
 */
