import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { FishingSpot, Report } from '../types';
import { COLORS, SIZES } from '../constants/theme';

export const AdminScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const [flaggedSpots, setFlaggedSpots] = useState<FishingSpot[]>([]);
  const [pendingReports, setPendingReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'spots' | 'reports'>('spots');

  // Check if user is admin
  const isAdmin = user?.role === 'admin' || user?.role === 'moderator';

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'spots') {
        await loadFlaggedSpots();
      } else {
        await loadPendingReports();
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFlaggedSpots = async () => {
    const q = query(collection(db, 'fishingSpots'), where('isFlagged', '==', true));
    const snapshot = await getDocs(q);
    const spots: FishingSpot[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      spots.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as FishingSpot);
    });
    setFlaggedSpots(spots);
  };

  const loadPendingReports = async () => {
    const q = query(collection(db, 'reports'), where('status', '==', 'pending'));
    const snapshot = await getDocs(q);
    const reports: Report[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      reports.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as Report);
    });
    setPendingReports(reports);
  };

  const handleHideSpot = async (spotId: string) => {
    Alert.alert(
      'Hide Spot',
      'Are you sure you want to hide this fishing spot? It will no longer be visible to users.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Hide',
          style: 'destructive',
          onPress: async () => {
            try {
              await updateDoc(doc(db, 'fishingSpots', spotId), {
                isHidden: true,
              });
              Alert.alert('Success', 'Spot has been hidden');
              loadData();
            } catch (error) {
              Alert.alert('Error', 'Failed to hide spot');
            }
          },
        },
      ]
    );
  };

  const handleDeleteSpot = async (spotId: string) => {
    Alert.alert(
      'Delete Spot',
      'Are you sure you want to permanently delete this fishing spot? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'fishingSpots', spotId));
              Alert.alert('Success', 'Spot has been deleted');
              loadData();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete spot');
            }
          },
        },
      ]
    );
  };

  const handleUnflagSpot = async (spotId: string) => {
    try {
      await updateDoc(doc(db, 'fishingSpots', spotId), {
        isFlagged: false,
        flagCount: 0,
      });
      Alert.alert('Success', 'Spot has been unflagged');
      loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to unflag spot');
    }
  };

  const handleReviewReport = async (reportId: string, action: 'resolved' | 'dismissed') => {
    try {
      await updateDoc(doc(db, 'reports', reportId), {
        status: action,
        reviewedBy: user?.id,
        reviewedAt: new Date(),
      });
      Alert.alert('Success', `Report has been ${action}`);
      loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to update report');
    }
  };

  if (!isAdmin) {
    return (
      <View style={styles.container}>
        <View style={styles.accessDenied}>
          <Ionicons name="shield-outline" size={64} color={COLORS.textSecondary} />
          <Text style={styles.accessDeniedText}>Access Denied</Text>
          <Text style={styles.accessDeniedSubtext}>
            You need admin privileges to access this page
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <Text style={styles.headerSubtitle}>Content Moderation</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'spots' && styles.activeTab]}
          onPress={() => setActiveTab('spots')}
        >
          <Text style={[styles.tabText, activeTab === 'spots' && styles.activeTabText]}>
            Flagged Spots ({flaggedSpots.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'reports' && styles.activeTab]}
          onPress={() => setActiveTab('reports')}
        >
          <Text style={[styles.tabText, activeTab === 'reports' && styles.activeTabText]}>
            Reports ({pendingReports.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}
      >
        {activeTab === 'spots' ? (
          <>
            {flaggedSpots.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="checkmark-circle-outline" size={64} color={COLORS.success} />
                <Text style={styles.emptyText}>No flagged spots</Text>
                <Text style={styles.emptySubtext}>All content looks good!</Text>
              </View>
            ) : (
              flaggedSpots.map((spot) => (
                <View key={spot.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View>
                      <Text style={styles.cardTitle}>{spot.name}</Text>
                      <Text style={styles.cardSubtitle}>By {spot.userName}</Text>
                      <Text style={styles.flagCount}>
                        🚩 {spot.flagCount} {spot.flagCount === 1 ? 'report' : 'reports'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.cardDescription} numberOfLines={2}>
                    {spot.description}
                  </Text>
                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.successButton]}
                      onPress={() => handleUnflagSpot(spot.id)}
                    >
                      <Ionicons name="checkmark" size={20} color="#fff" />
                      <Text style={styles.actionButtonText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.warningButton]}
                      onPress={() => handleHideSpot(spot.id)}
                    >
                      <Ionicons name="eye-off" size={20} color="#fff" />
                      <Text style={styles.actionButtonText}>Hide</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.dangerButton]}
                      onPress={() => handleDeleteSpot(spot.id)}
                    >
                      <Ionicons name="trash" size={20} color="#fff" />
                      <Text style={styles.actionButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </>
        ) : (
          <>
            {pendingReports.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="checkmark-circle-outline" size={64} color={COLORS.success} />
                <Text style={styles.emptyText}>No pending reports</Text>
                <Text style={styles.emptySubtext}>All caught up!</Text>
              </View>
            ) : (
              pendingReports.map((report) => (
                <View key={report.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View>
                      <Text style={styles.cardTitle}>
                        {report.reason.charAt(0).toUpperCase() + report.reason.slice(1)} Report
                      </Text>
                      <Text style={styles.cardSubtitle}>
                        Reported by {report.reporterName}
                      </Text>
                      <Text style={styles.reportType}>
                        Type: {report.targetType}
                      </Text>
                    </View>
                  </View>
                  {report.description && (
                    <Text style={styles.cardDescription}>{report.description}</Text>
                  )}
                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.successButton]}
                      onPress={() => handleReviewReport(report.id, 'resolved')}
                    >
                      <Ionicons name="checkmark" size={20} color="#fff" />
                      <Text style={styles.actionButtonText}>Resolve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.dismissButton]}
                      onPress={() => handleReviewReport(report.id, 'dismissed')}
                    >
                      <Ionicons name="close" size={20} color="#fff" />
                      <Text style={styles.actionButtonText}>Dismiss</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.surface,
    padding: SIZES.padding * 1.5,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: SIZES.title,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: SIZES.base,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: SIZES.padding,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: SIZES.base,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: SIZES.padding,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SIZES.padding,
    marginBottom: SIZES.margin,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.margin,
  },
  cardTitle: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  cardSubtitle: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  flagCount: {
    fontSize: SIZES.sm,
    color: COLORS.error,
    marginTop: 4,
    fontWeight: '600',
  },
  reportType: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  cardDescription: {
    fontSize: SIZES.base,
    color: COLORS.text,
    marginBottom: SIZES.margin,
    lineHeight: 20,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  successButton: {
    backgroundColor: COLORS.success,
  },
  warningButton: {
    backgroundColor: COLORS.warning,
  },
  dangerButton: {
    backgroundColor: COLORS.error,
  },
  dismissButton: {
    backgroundColor: COLORS.textSecondary,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: SIZES.sm,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.padding * 4,
  },
  emptyText: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SIZES.margin,
  },
  emptySubtext: {
    fontSize: SIZES.base,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  accessDenied: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.padding * 2,
  },
  accessDeniedText: {
    fontSize: SIZES.title,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SIZES.margin * 2,
  },
  accessDeniedSubtext: {
    fontSize: SIZES.base,
    color: COLORS.textSecondary,
    marginTop: SIZES.margin,
    textAlign: 'center',
  },
});
