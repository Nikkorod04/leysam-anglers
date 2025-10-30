import { collection, query, where, getDocs, doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { UserActivity } from '../types';

const SPAM_LIMITS = {
  SPOTS_PER_DAY: 5,
  SPOTS_PER_WEEK: 20,
  MIN_SPOT_INTERVAL_MINUTES: 5,
  MIN_DESCRIPTION_LENGTH: 10,
  MIN_ACCOUNT_AGE_HOURS: 0, // Set to 24 for production
  AUTO_FLAG_THRESHOLD: 3, // Number of reports before auto-flagging
};

export const canUserCreateSpot = async (userId: string, userCreatedAt: Date): Promise<{ allowed: boolean; reason?: string }> => {
  try {
    // Check account age
    const accountAgeHours = (Date.now() - userCreatedAt.getTime()) / (1000 * 60 * 60);
    if (accountAgeHours < SPAM_LIMITS.MIN_ACCOUNT_AGE_HOURS) {
      return {
        allowed: false,
        reason: `Account must be at least ${SPAM_LIMITS.MIN_ACCOUNT_AGE_HOURS} hours old to create spots`,
      };
    }

    // Get user activity
    const activityRef = doc(db, 'userActivity', userId);
    const activityDoc = await getDoc(activityRef);
    
    if (activityDoc.exists()) {
      const activity = activityDoc.data() as UserActivity;
      
      // Check daily limit
      if (activity.spotsCreatedToday >= SPAM_LIMITS.SPOTS_PER_DAY) {
        return {
          allowed: false,
          reason: `Daily limit reached. You can create ${SPAM_LIMITS.SPOTS_PER_DAY} spots per day`,
        };
      }

      // Check weekly limit
      if (activity.spotsCreatedThisWeek >= SPAM_LIMITS.SPOTS_PER_WEEK) {
        return {
          allowed: false,
          reason: `Weekly limit reached. You can create ${SPAM_LIMITS.SPOTS_PER_WEEK} spots per week`,
        };
      }

      // Check time interval
      if (activity.lastSpotCreated) {
        const lastSpotDate = activity.lastSpotCreated instanceof Timestamp 
          ? activity.lastSpotCreated.toDate() 
          : new Date(activity.lastSpotCreated);
        const minutesSinceLastSpot = (Date.now() - lastSpotDate.getTime()) / (1000 * 60);
        if (minutesSinceLastSpot < SPAM_LIMITS.MIN_SPOT_INTERVAL_MINUTES) {
          const waitTime = Math.ceil(SPAM_LIMITS.MIN_SPOT_INTERVAL_MINUTES - minutesSinceLastSpot);
          return {
            allowed: false,
            reason: `Please wait ${waitTime} more minute(s) before creating another spot`,
          };
        }
      }
    }

    return { allowed: true };
  } catch (error) {
    console.error('Error checking spam limits:', error);
    return { allowed: true }; // Allow on error to not block users
  }
};

export const updateUserActivity = async (userId: string) => {
  try {
    const activityRef = doc(db, 'userActivity', userId);
    const activityDoc = await getDoc(activityRef);
    
    const now = new Date();
    const today = now.toDateString();
    const thisWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    if (activityDoc.exists()) {
      const activity = activityDoc.data() as UserActivity;
      const lastSpotDate = activity.lastSpotCreated instanceof Timestamp 
        ? activity.lastSpotCreated.toDate() 
        : activity.lastSpotCreated 
        ? new Date(activity.lastSpotCreated)
        : null;

      const lastSpotToday = lastSpotDate && lastSpotDate.toDateString() === today;
      const lastSpotThisWeek = lastSpotDate && lastSpotDate >= thisWeekStart;

      await setDoc(activityRef, {
        userId,
        lastSpotCreated: now,
        spotsCreatedToday: lastSpotToday ? activity.spotsCreatedToday + 1 : 1,
        spotsCreatedThisWeek: lastSpotThisWeek ? activity.spotsCreatedThisWeek + 1 : 1,
        totalReports: activity.totalReports || 0,
      });
    } else {
      await setDoc(activityRef, {
        userId,
        lastSpotCreated: now,
        spotsCreatedToday: 1,
        spotsCreatedThisWeek: 1,
        totalReports: 0,
      });
    }
  } catch (error) {
    console.error('Error updating user activity:', error);
  }
};

export const validateSpotContent = (
  name: string,
  description: string,
  images: string[]
): { valid: boolean; reason?: string } => {
  if (!name || name.trim().length < 3) {
    return { valid: false, reason: 'Spot name must be at least 3 characters' };
  }

  if (!description || description.trim().length < SPAM_LIMITS.MIN_DESCRIPTION_LENGTH) {
    return {
      valid: false,
      reason: `Description must be at least ${SPAM_LIMITS.MIN_DESCRIPTION_LENGTH} characters`,
    };
  }

  if (images.length === 0) {
    return { valid: false, reason: 'At least one photo is required' };
  }

  return { valid: true };
};

export const checkDuplicateSpot = async (
  userId: string,
  name: string,
  latitude: number,
  longitude: number
): Promise<{ isDuplicate: boolean; reason?: string }> => {
  try {
    // Check for spots with same name by this user
    const nameQuery = query(
      collection(db, 'fishingSpots'),
      where('userId', '==', userId),
      where('name', '==', name)
    );
    const nameSnapshot = await getDocs(nameQuery);
    
    if (!nameSnapshot.empty) {
      return {
        isDuplicate: true,
        reason: 'You already have a spot with this name',
      };
    }

    // Check for spots at very similar location (within ~100 meters)
    const spotsQuery = query(
      collection(db, 'fishingSpots'),
      where('userId', '==', userId)
    );
    const spotsSnapshot = await getDocs(spotsQuery);
    
    for (const doc of spotsSnapshot.docs) {
      const spot = doc.data();
      const distance = calculateDistance(
        latitude,
        longitude,
        spot.latitude,
        spot.longitude
      );
      
      if (distance < 0.1) { // Less than 100 meters
        return {
          isDuplicate: true,
          reason: 'You already have a spot at this location',
        };
      }
    }

    return { isDuplicate: false };
  } catch (error) {
    console.error('Error checking duplicate spot:', error);
    return { isDuplicate: false }; // Allow on error
  }
};

// Calculate distance between two coordinates in kilometers
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};
