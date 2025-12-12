import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { CatchReport } from '../types';
import { COLORS, SIZES } from '../constants/theme';
import { reportContent } from '../services/reportService';
import { formatSpeciesForDisplay } from '../services/speciesValidation';
import { getInputConstraints } from '../services/contentValidation';

const { width } = Dimensions.get('window');

export const FeedScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const [reports, setReports] = useState<CatchReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedReports, setExpandedReports] = useState<Set<string>>(new Set());
  
  // Report modal state
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportingItemId, setReportingItemId] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState<'spam' | 'inappropriate' | 'fake' | 'other'>('spam');
  const [reportDescription, setReportDescription] = useState('');
  
  // Image carousel state
  const [currentImageIndexes, setCurrentImageIndexes] = useState<Record<string, number>>({});
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'catchReports'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
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
        setReports(reportsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching reports:', error);
        Alert.alert('Error', 'Failed to load catch reports');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleLike = async (reportId: string, likes: string[]) => {
    if (!user) return;

    const reportRef = doc(db, 'catchReports', reportId);
    const isLiked = likes.includes(user.id);

    try {
      await updateDoc(reportRef, {
        likes: isLiked ? arrayRemove(user.id) : arrayUnion(user.id),
      });
    } catch (error) {
      console.error('Error updating likes:', error);
      Alert.alert('Error', 'Failed to update like');
    }
  };

  const handleReportPress = (reportId: string) => {
    setReportingItemId(reportId);
    setReportModalVisible(true);
    setSelectedReason('spam');
    setReportDescription('');
  };

  const handleSubmitReport = async () => {
    if (!user || !reportingItemId) return;

    // Validate description if provided (optional but max 200 chars if present)
    if (reportDescription.trim().length > 200) {
      Alert.alert('Invalid Description', 'Description cannot exceed 200 characters');
      return;
    }

    const result = await reportContent(
      user.id,
      user.displayName || user.email || 'Anonymous',
      'report',
      reportingItemId,
      selectedReason,
      reportDescription
    );

    setReportModalVisible(false);
    setReportingItemId(null);
    setReportDescription('');

    Alert.alert(
      result.success ? 'Success' : 'Error',
      result.message
    );
  };

  const toggleExpand = (reportId: string) => {
    setExpandedReports(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reportId)) {
        newSet.delete(reportId);
      } else {
        newSet.add(reportId);
      }
      return newSet;
    });
  };

  const handleImageScroll = (event: any, reportId: string) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    setCurrentImageIndexes(prev => ({
      ...prev,
      [reportId]: currentIndex,
    }));
  };

  const getTimeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return interval === 1 ? '1y ago' : `${interval}y ago`;
    
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return interval === 1 ? '1mo ago' : `${interval}mo ago`;
    
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return interval === 1 ? '1d ago' : `${interval}d ago`;
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return interval === 1 ? '1h ago' : `${interval}h ago`;
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return interval === 1 ? '1m ago' : `${interval}m ago`;
    
    return 'Just now';
  };

  const renderReport = ({ item }: { item: CatchReport }) => {
    const isLiked = user ? item.likes.includes(user.id) : false;
    const isExpanded = expandedReports.has(item.id);
    const descriptionLimit = 150;
    const needsExpansion = item.description.length > descriptionLimit;
    const timeAgo = getTimeAgo(item.createdAt);

    return (
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {item.userPhoto ? (
              <Image source={{ uri: item.userPhoto }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarText}>{item.userName.charAt(0).toUpperCase()}</Text>
              </View>
            )}
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item.userName}</Text>
              <View style={styles.metaRow}>
                <Ionicons name="time-outline" size={12} color={COLORS.textSecondary} />
                <Text style={styles.timestamp}>{timeAgo}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Image Gallery */}
        {item.images.length > 0 && (
          <View style={styles.imageContainer}>
            <FlatList
              data={item.images}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={(event) => handleImageScroll(event, item.id)}
              scrollEventThrottle={16}
              keyExtractor={(image, index) => `${item.id}-image-${index}`}
              renderItem={({ item: imageUri }) => (
                <TouchableOpacity 
                  style={styles.imageSlide}
                  onPress={() => setEnlargedImage(imageUri)}
                >
                  <Image 
                    source={{ uri: imageUri }} 
                    style={styles.mainImage} 
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              )}
            />
            {item.images.length > 1 && (
              <>
                <View style={styles.imageCountBadge}>
                  <Ionicons name="images" size={14} color={COLORS.surface} />
                  <Text style={styles.imageCountText}>{item.images.length}</Text>
                </View>
                <View style={styles.paginationDots}>
                  {item.images.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.dot,
                        (currentImageIndexes[item.id] || 0) === index && styles.activeDot,
                      ]}
                    />
                  ))}
                </View>
              </>
            )}
          </View>
        )}

        {/* Content */}
        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.title}>{item.title}</Text>

          {/* Fish Info Card */}
          <View style={styles.fishInfoCard}>
            <View style={styles.fishInfoItem}>
              <View style={styles.iconContainer}>
                <Ionicons name="fish" size={16} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fishLabel}>Species</Text>
                <View style={styles.speciesContainer}>
                  {formatSpeciesForDisplay(item.fishType).map((species, index) => (
                    <View key={index} style={styles.speciesBadge}>
                      <Text style={styles.speciesBadgeText}>{species}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* Location Tag */}
          {item.spotName && (
            <View style={styles.locationTag}>
              <Ionicons name="location" size={14} color={COLORS.primary} />
              <Text style={styles.locationText}>{item.spotName}</Text>
            </View>
          )}

          {/* Description */}
          <View>
            <Text style={styles.description}>
              {needsExpansion && !isExpanded 
                ? `${item.description.substring(0, descriptionLimit)}...` 
                : item.description}
            </Text>
            {needsExpansion && (
              <TouchableOpacity onPress={() => toggleExpand(item.id)}>
                <Text style={styles.seeMoreText}>
                  {isExpanded ? 'See less' : 'See more'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Actions */}
          <View style={styles.actionsBar}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleLike(item.id, item.likes)}
            >
              <Ionicons 
                name={isLiked ? "fish" : "fish-outline"} 
                size={24} 
                color={isLiked ? COLORS.primary : COLORS.textSecondary} 
              />
              <Text style={[styles.actionCount, isLiked && styles.likedCount]}>
                {item.likes.length}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleReportPress(item.id)}
            >
              <Ionicons 
                name="flag-outline" 
                size={24} 
                color={COLORS.textSecondary} 
              />
              <Text style={styles.actionText}>Report</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading catch reports...</Text>
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
        <View style={styles.imageModalContainer}>
          <TouchableOpacity
            style={styles.imageCloseButton}
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

      <FlatList
        data={reports}
        renderItem={renderReport}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No catch reports yet</Text>
            <Text style={styles.emptySubtext}>Be the first to share your catch!</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddReport')}
        activeOpacity={0.8}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      {/* Report Modal */}
      <Modal
        visible={reportModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setReportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Report Catch Report</Text>
              <TouchableOpacity onPress={() => setReportModalVisible(false)}>
                <Ionicons name="close" size={28} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.sectionLabel}>Reason for reporting:</Text>
              
              {(['spam', 'inappropriate', 'fake', 'other'] as const).map((reason) => (
                <TouchableOpacity
                  key={reason}
                  style={styles.reasonOption}
                  onPress={() => setSelectedReason(reason)}
                >
                  <View style={styles.radioButton}>
                    {selectedReason === reason && <View style={styles.radioButtonInner} />}
                  </View>
                  <Text style={styles.reasonText}>
                    {reason.charAt(0).toUpperCase() + reason.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}

              <Text style={[styles.sectionLabel, { marginTop: 20 }]}>
                Additional details (optional):
              </Text>
              <View style={styles.inputCounterRow}>
                <Text style={styles.helperText}>{reportDescription.length}/200</Text>
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="Describe the issue..."
                placeholderTextColor={COLORS.textSecondary}
                value={reportDescription}
                onChangeText={setReportDescription}
                maxLength={200}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setReportModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleSubmitReport}
              >
                <Text style={styles.submitButtonText}>Submit Report</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  list: {
    paddingVertical: SIZES.padding / 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SIZES.margin,
    fontSize: SIZES.base,
    color: COLORS.textSecondary,
  },
  card: {
    backgroundColor: COLORS.surface,
    marginBottom: SIZES.margin * 1.5,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding * 0.75,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: SIZES.margin,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  avatarPlaceholder: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#000000',
    fontSize: SIZES.lg + 2,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: SIZES.base + 1,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timestamp: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  imageContainer: {
    width: '100%',
    height: width * 0.75,
    backgroundColor: COLORS.backgroundLight,
    position: 'relative',
  },
  imageSlide: {
    width: width,
    height: width * 0.75,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  imageCountBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  imageCountText: {
    color: COLORS.surface,
    fontSize: SIZES.sm,
    fontWeight: '700',
  },
  paginationDots: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeDot: {
    backgroundColor: COLORS.primary,
    width: 24,
  },
  content: {
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding,
  },
  title: {
    fontSize: SIZES.lg + 4,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SIZES.margin * 1.2,
    lineHeight: 28,
    letterSpacing: 0.3,
  },
  fishInfoCard: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: SIZES.radius * 1.5,
    padding: SIZES.padding * 1.2,
    marginBottom: SIZES.margin,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  fishInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fishLabel: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  fishValue: {
    fontSize: SIZES.base,
    fontWeight: '700',
    color: COLORS.text,
  },
  locationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: SIZES.margin,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  locationText: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '700',
  },
  description: {
    fontSize: SIZES.base,
    color: COLORS.textSecondary,
    lineHeight: 24,
    marginBottom: SIZES.margin / 2,
  },
  seeMoreText: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '700',
    marginBottom: SIZES.margin,
  },
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: SIZES.padding,
    paddingBottom: SIZES.padding * 0.75,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: SIZES.margin,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    marginRight: 20,
  },
  actionCount: {
    fontSize: SIZES.base,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  actionText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  likedCount: {
    color: COLORS.error,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: SIZES.padding * 2,
  },
  emptyText: {
    fontSize: SIZES.xl,
    color: COLORS.textSecondary,
    fontWeight: '700',
    marginTop: SIZES.margin,
  },
  emptySubtext: {
    fontSize: SIZES.base,
    color: COLORS.textSecondary,
    marginTop: SIZES.margin / 2,
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  addButtonText: {
    fontSize: 32,
    color: '#000000',
    fontWeight: '800',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding * 1.5,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: SIZES.lg + 2,
    fontWeight: '700',
    color: COLORS.text,
  },
  modalBody: {
    padding: SIZES.padding * 1.5,
  },
  sectionLabel: {
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.margin,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.padding,
    gap: 12,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  reasonText: {
    fontSize: SIZES.base,
    color: COLORS.text,
    fontWeight: '500',
  },
  inputCounterRow: {
    alignItems: 'flex-end',
    marginBottom: SIZES.margin / 2,
  },
  helperText: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    fontSize: SIZES.base,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 100,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: SIZES.padding * 1.5,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  modalButton: {
    flex: 1,
    paddingVertical: SIZES.padding,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.backgroundLight,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelButtonText: {
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.text,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
  },
  submitButtonText: {
    fontSize: SIZES.base,
    fontWeight: '700',
    color: '#000000',
  },
  imageModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageCloseButton: {
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
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
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
