import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { COLORS } from '../constants/theme';
import { getBannerAdUnitId } from '../services/admob';

interface BannerAdComponentProps {
  style?: any;
  size?: BannerAdSize;
}

/**
 * Reusable Banner Ad Component
 * Place this at the bottom of screens to display banner ads
 * 
 * Usage:
 * <BannerAdComponent />
 * 
 * With custom size:
 * <BannerAdComponent size={BannerAdSize.LARGE_BANNER} />
 */
export const BannerAdComponent: React.FC<BannerAdComponentProps> = ({
  style,
  size = BannerAdSize.BANNER,
}) => {
  const [adLoaded, setAdLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (error) {
    return null; // Don't render anything if there's an error
  }

  return (
    <View style={[styles.container, style]}>
      <BannerAd
        unitId={getBannerAdUnitId()}
        size={size}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
        }}
        onAdLoaded={() => {
          setAdLoaded(true);
        }}
        onAdFailedToLoad={(error: any) => {
          console.log('Banner ad failed to load:', error);
          setError('Ad failed to load');
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});
