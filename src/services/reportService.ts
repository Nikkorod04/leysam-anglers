import { collection, addDoc, doc, updateDoc, increment, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { Report } from '../types';

const AUTO_FLAG_THRESHOLD = 3;

export const reportContent = async (
  reporterId: string,
  reporterName: string,
  targetType: 'spot' | 'report' | 'user',
  targetId: string,
  reason: 'spam' | 'inappropriate' | 'fake' | 'other',
  description: string
): Promise<{ success: boolean; message: string }> => {
  try {
    // Create report document
    const reportData = {
      reporterId,
      reporterName,
      targetType,
      targetId,
      reason,
      description,
      status: 'pending',
      createdAt: serverTimestamp(),
    };

    const reportRef = await addDoc(collection(db, 'reports'), reportData);

    // Update target with report
    if (targetType === 'spot') {
      const spotRef = doc(db, 'fishingSpots', targetId);
      const spotDoc = await getDoc(spotRef);
      
      if (spotDoc.exists()) {
        const currentReportIds = spotDoc.data().reportIds || [];
        const newFlagCount = currentReportIds.length + 1;
        
        await updateDoc(spotRef, {
          reportIds: [...currentReportIds, reportRef.id],
          flagCount: increment(1),
          isFlagged: newFlagCount >= AUTO_FLAG_THRESHOLD,
        });

        if (newFlagCount >= AUTO_FLAG_THRESHOLD) {
          return {
            success: true,
            message: 'Report submitted. Content has been flagged for review.',
          };
        }
      }
    } else if (targetType === 'report') {
      const reportDocRef = doc(db, 'catchReports', targetId);
      const reportDoc = await getDoc(reportDocRef);
      
      if (reportDoc.exists()) {
        const currentReportIds = reportDoc.data().reportIds || [];
        const newFlagCount = currentReportIds.length + 1;
        
        await updateDoc(reportDocRef, {
          reportIds: [...currentReportIds, reportRef.id],
          flagCount: increment(1),
          isFlagged: newFlagCount >= AUTO_FLAG_THRESHOLD,
        });
      }
    } else if (targetType === 'user') {
      const userActivityRef = doc(db, 'userActivity', targetId);
      await updateDoc(userActivityRef, {
        totalReports: increment(1),
      });
    }

    return {
      success: true,
      message: 'Report submitted successfully. Our team will review it.',
    };
  } catch (error) {
    console.error('Error submitting report:', error);
    return {
      success: false,
      message: 'Failed to submit report. Please try again.',
    };
  }
};

export const checkIfUserReported = async (
  userId: string,
  targetId: string
): Promise<boolean> => {
  try {
    const reportsSnapshot = await collection(db, 'reports');
    // In a real app, you'd query for this user's reports on this target
    // For now, we'll return false to allow reporting
    return false;
  } catch (error) {
    console.error('Error checking report status:', error);
    return false;
  }
};
