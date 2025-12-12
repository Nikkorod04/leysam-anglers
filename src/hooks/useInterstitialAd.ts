import { useEffect, useState } from 'react';
import { InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';
import { getInterstitialAdUnitId } from '../services/admob';

/**
 * Hook for managing interstitial ads
 * 
 * Usage:
 * const { showAd } = useInterstitialAd();
 * 
 * // Show ad before navigation
 * const handleNavigate = async () => {
 *   await showAd();
 *   navigation.navigate('SpotDetail', { spot });
 * };
 */
export const useInterstitialAd = () => {
  const [interstitial, setInterstitial] = useState<InterstitialAd | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Create interstitial ad
  useEffect(() => {
    const newInterstitial = InterstitialAd.createForAdRequest(
      getInterstitialAdUnitId(),
      {
        requestNonPersonalizedAdsOnly: false,
      }
    );

    const unsubscribeLoaded = newInterstitial.addAdEventListener(
      AdEventType.LOADED,
      () => {
        setIsLoaded(true);
        setIsLoading(false);
      }
    );

    const unsubscribeClosed = newInterstitial.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        setIsLoaded(false);
        loadAd();
      }
    );

    const unsubscribeError = newInterstitial.addAdEventListener(
      AdEventType.ERROR,
      (error: any) => {
        console.log('Interstitial ad error:', error);
        setIsLoading(false);
      }
    );

    setInterstitial(newInterstitial);

    // Load the first ad
    loadAd();

    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
      unsubscribeError();
    };
  }, []);

  const loadAd = () => {
    if (isLoading || !interstitial) return;
    
    setIsLoading(true);
    interstitial.load();
  };

  const showAd = async () => {
    if (isLoaded && interstitial) {
      try {
        await interstitial.show();
      } catch (error) {
        console.log('Failed to show interstitial ad:', error);
      }
    }
  };

  return { showAd, isLoaded, isLoading };
};
