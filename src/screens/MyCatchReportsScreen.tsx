import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  FlatList,
  Dimensions,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { CatchReport } from '../types';
import { COLORS, SIZES } from '../constants/theme';
import { formatSpeciesForDisplay } from '../services/speciesValidation';

const { width } = Dimensions.get('window');

export const MyCatchReportsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const [reports, setReports] = useState<CatchReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

  useEffect(() => {
    loadUserReports();
  }, [user?.id]);

  const loadUserReports = async () => {
    try {
      if (!user?.id) return;

      setLoading(true);
      const q = query(
        collection(db, 'catchReports'),
        where('userId', '==', user.id)
      );
      const snapshot = await getDocs(q);
      const reportsData: CatchReport[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        reportsData.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as CatchReport);
      });

      // Sort by newest first
      reportsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      setReports(reportsData);
    } catch (error) {
      console.error('Error loading user reports:', error);
      Alert.alert('Error', 'Failed to load your catch reports');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadUserReports();
  };

  const handleDeleteReport = (reportId: string, reportTitle: string) => {
    Alert.alert(
      'Delete Report',
      `Are you sure you want to delete "${reportTitle}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'catchReports', reportId));
              setReports(reports.filter((r) => r.id !== reportId));
              Alert.alert('Success', 'Catch report deleted');
            } catch (error) {
              console.error('Error deleting report:', error);
              Alert.alert('Error', 'Failed to delete catch report');
            }
          },
        },
      ]
    );
  };

  const renderReportCard = ({ item }: { item: CatchReport }) => (
    <View 
      style={styles.reportCard}
    >
      {/* Image */}
      {item.images && item.images.length > 0 && (
        <TouchableOpacity
          onPress={() => setEnlargedImage(item.images[0])}
        >
          <Image
            source={{ uri: item.images[0] }}
            style={styles.reportImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}

      {/* Content */}
      <View style={styles.reportContent}>
        <Text style={styles.reportTitle}>{item.title}</Text>
        
        <View style={styles.speciesContainer}>
          <Ionicons name="fish" size={14} color={COLORS.primary} />
          <View style={styles.speciesBadgesRow}>
            {formatSpeciesForDisplay(item.fishType).map((species, index) => (
              <View key={index} style={styles.speciesBadge}>
                <Text style={styles.speciesBadgeText}>{species}</Text>
              </View>
            ))}
          </View>
        </View>

        {item.description && (
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Ionicons name="image" size={14} color={COLORS.primary} />
            <Text style={styles.statText}>{item.images?.length || 0}</Text>
          </View>
          <Text style={styles.dateText}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {/* Delete Button */}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteReport(item.id, item.title)}
      >
        <Ionicons name="trash" size={20} color="#FF6B6B" />
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-outline" size={80} color={COLORS.border} />
      <Text style={styles.emptyTitle}>No Catch Reports Yet</Text>
      <Text style={styles.emptyText}>
        Start sharing your catches to build your fishing journal
      </Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddReport')}
      >
        <Ionicons name="add-circle" size={24} color={COLORS.surface} />
        <Text style={styles.addButtonText}>Add Your First Report</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Enlarged Image Modal */}
      <Modal
        visible={!!enlargedImage}
        transparent
        animationType="fade"
        onRequestClose={() => setEnlargedImage(null)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setEnlargedImage(null)}
          >
            <Ionicons name="close" size={28} color={COLORS.surface} />
          </TouchableOpacity>
          
          {enlargedImage && (
            <Image
              source={{ uri: enlargedImage }}
              style={styles.enlargedImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>

      {reports.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={reports}
          renderItem={renderReportCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  listContent: {
    padding: SIZES.padding,
    paddingBottom: SIZES.padding * 2,
  },
  reportCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.margin * 1.5,
    overflow: 'hidden',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  reportImage: {
    width: '100%',
    height: 200,
    backgroundColor: COLORS.border,
  },
  reportContent: {
    padding: SIZES.padding,
  },
  reportTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  fishType: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    marginBottom: 8,
    fontWeight: '600',
  },
  description: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 12,
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  dateText: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
  },
  deleteButton: {
    position: 'absolute',
    top: SIZES.padding,
    right: SIZES.padding,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding * 2,
  },
  emptyTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SIZES.margin * 2,
    marginBottom: SIZES.margin,
  },
  emptyText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.margin * 3,
    lineHeight: 20,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding * 2,
    paddingVertical: SIZES.padding * 1.2,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    gap: SIZES.margin,
  },
  addButtonText: {
    color: COLORS.surface,
    fontSize: SIZES.sm,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: SIZES.padding * 2,
    right: SIZES.padding * 2,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  enlargedImage: {
    width: width,
    height: '100%',
  },
  speciesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: SIZES.margin,
    marginTop: 4,
  },
  speciesBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
  },
  speciesBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding * 0.75,
    paddingVertical: SIZES.padding * 0.35,
    borderRadius: SIZES.radius,
  },
  speciesBadgeText: {
    color: COLORS.surface,
    fontSize: SIZES.xs,
    fontWeight: '600',
  },
});
