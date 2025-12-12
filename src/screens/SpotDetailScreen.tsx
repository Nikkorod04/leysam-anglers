import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
  FlatList,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { doc, updateDoc, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { FishingSpot } from '../types';
import { COLORS, SIZES } from '../constants/theme';
import { reportContent } from '../services/reportService';
// import { BannerAdComponent } from '../components/BannerAd'; // Only works in EAS builds, not Expo Go

const { width, height } = Dimensions.get('window');

export const SpotDetailScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const { spot } = route.params as { spot: FishingSpot };
  const { user } = useAuth();
  const [localSpot, setLocalSpot] = useState(spot);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const isLiked = user ? localSpot.likes.includes(user.id) : false;
  const isAdmin = user?.role === 'admin' || user?.role === 'moderator';

  const handleLike = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to like fishing spots');
      return;
    }

    const spotRef = doc(db, 'fishingSpots', localSpot.id);
    const newLikes = isLiked
      ? localSpot.likes.filter((id) => id !== user.id)
      : [...localSpot.likes, user.id];

    try {
      await updateDoc(spotRef, {
        likes: isLiked ? arrayRemove(user.id) : arrayUnion(user.id),
      });
      setLocalSpot({ ...localSpot, likes: newLikes });
    } catch (error) {
      console.error('Error updating likes:', error);
      Alert.alert('Error', 'Failed to update like');
    }
  };

  const handleImageScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    setCurrentImageIndex(Math.round(index));
  };

  const handleReport = () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to report content');
      return;
    }

    // Don't allow users to report their own content
    if (user.id === localSpot.userId) {
      Alert.alert('Cannot Report', 'You cannot report your own content');
      return;
    }

    Alert.alert(
      'Report Fishing Spot',
      'Why are you reporting this spot?',
      [
        {
          text: 'Spam',
          onPress: () => submitReport('spam'),
        },
        {
          text: 'Inappropriate Content',
          onPress: () => submitReport('inappropriate'),
        },
        {
          text: 'Fake Information',
          onPress: () => submitReport('fake'),
        },
        {
          text: 'Other',
          onPress: () => showCustomReportDialog(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const showCustomReportDialog = () => {
    Alert.prompt(
      'Report Details',
      'Please provide more information:',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Submit',
          onPress: (description?: string) => submitReport('other', description || ''),
        },
      ],
      'plain-text'
    );
  };

  const submitReport = async (
    reason: 'spam' | 'inappropriate' | 'fake' | 'other',
    description: string = ''
  ) => {
    if (!user) return;

    const result = await reportContent(
      user.id,
      user.displayName,
      'spot',
      localSpot.id,
      reason,
      description
    );

    Alert.alert(
      result.success ? 'Report Submitted' : 'Error',
      result.message
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Fishing Spot',
      'Are you sure you want to permanently delete this fishing spot? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const spotRef = doc(db, 'fishingSpots', localSpot.id);
              await deleteDoc(spotRef);
              
              Alert.alert('Success', 'Fishing spot deleted successfully', [
                {
                  text: 'OK',
                  onPress: () => navigation.goBack(),
                },
              ]);
            } catch (error) {
              console.error('Error deleting spot:', error);
              Alert.alert('Error', 'Failed to delete fishing spot');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image Gallery */}
        {localSpot.images.length > 0 && (
          <View style={styles.heroContainer}>
            <FlatList
              data={localSpot.images}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleImageScroll}
              scrollEventThrottle={16}
              keyExtractor={(item, index) => `image-${index}`}
              renderItem={({ item }) => (
                <View style={styles.imageSlide}>
                  <Image source={{ uri: item }} style={styles.heroImage} />
                  <View style={styles.imageOverlay} />
                </View>
              )}
            />
            {localSpot.images.length > 1 && (
              <View style={styles.paginationContainer}>
                {localSpot.images.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.paginationDot,
                      index === currentImageIndex && styles.paginationDotActive,
                    ]}
                  />
                ))}
              </View>
            )}
            
            {/* Image Counter Badge */}
            {localSpot.images.length > 1 && (
              <View style={styles.imageCountBadge}>
                <Ionicons name="images" size={16} color={COLORS.surface} />
                <Text style={styles.imageCountText}>
                  {currentImageIndex + 1}/{localSpot.images.length}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Main Content */}
        <View style={styles.contentContainer}>
          {/* Spot Title Card */}
          <View style={styles.titleCard}>
            <View style={styles.titleHeader}>
              <View style={styles.titleIconContainer}>
                <Ionicons name="location" size={28} color={COLORS.primary} />
              </View>
              <View style={styles.titleTextContainer}>
                <Text style={styles.spotName}>{localSpot.name}</Text>
                <View style={styles.metaRow}>
                  <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
                  <Text style={styles.dateText}>
                    Added {localSpot.createdAt.toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </Text>
                </View>
              </View>
            </View>

            {/* Action Buttons Row */}
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity 
                style={[styles.actionButtonPrimary, isLiked && styles.actionButtonLiked]} 
                onPress={handleLike}
              >
                <Ionicons
                  name={isLiked ? "fish" : "fish-outline"} 
                  size={22} 
                  color={isLiked ? COLORS.surface : COLORS.primary} 
                />
                <Text style={[styles.actionButtonText, isLiked && styles.actionButtonTextLiked]}>
                  {localSpot.likes.length}
                </Text>
              </TouchableOpacity>

              {user && user.id !== localSpot.userId && (
                <TouchableOpacity 
                  style={styles.actionButtonSecondary} 
                  onPress={handleReport}
                >
                  <Ionicons name="flag-outline" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              )}

              {isAdmin && (
                <TouchableOpacity 
                  style={styles.actionButtonDanger} 
                  onPress={handleDelete}
                >
                  <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Posted By Card */}
          <View style={styles.infoCard}>
            <Text style={styles.cardLabel}>POSTED BY</Text>
            <View style={styles.userRow}>
              {localSpot.userPhoto ? (
                <Image source={{ uri: localSpot.userPhoto }} style={styles.userAvatar} />
              ) : (
                <View style={[styles.userAvatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarText}>
                    {localSpot.userName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <Text style={styles.userName}>{localSpot.userName}</Text>
            </View>
          </View>

          {/* Description Card */}
          {localSpot.description && (
            <View style={styles.infoCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="document-text" size={22} color={COLORS.primary} />
                <Text style={styles.cardTitle}>Description</Text>
              </View>
              <Text style={styles.descriptionText}>{localSpot.description}</Text>
            </View>
          )}

          {/* Fish Types Card */}
          <View style={styles.infoCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="fish" size={22} color={COLORS.primary} />
              <Text style={styles.cardTitle}>Fish Species</Text>
            </View>
            <View style={styles.fishTypesGrid}>
              {localSpot.fishTypes.map((fish, index) => (
                <View key={index} style={styles.fishChip}>
                  <Ionicons name="fish-outline" size={16} color={COLORS.primary} />
                  <Text style={styles.fishChipText}>{fish}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Best Time Card */}
          <View style={styles.infoCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="time" size={22} color={COLORS.primary} />
              <Text style={styles.cardTitle}>Best Fishing Time</Text>
            </View>
            <View style={styles.bestTimeContainer}>
              <View style={styles.bestTimeChip}>
                <Ionicons name="sunny" size={18} color="#FDB022" />
                <Text style={styles.bestTimeText}>{localSpot.bestTime}</Text>
              </View>
            </View>
          </View>

          {/* Location Card */}
          <View style={styles.infoCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="map" size={22} color={COLORS.primary} />
              <Text style={styles.cardTitle}>Coordinates</Text>
            </View>
            <View style={styles.coordinatesContainer}>
              <View style={styles.coordinateRow}>
                <View style={styles.coordinateIcon}>
                  <Text style={styles.coordinateIconText}>LAT</Text>
                </View>
                <Text style={styles.coordinateValue}>
                  {localSpot.latitude.toFixed(6)}°
                </Text>
              </View>
              <View style={styles.coordinateDivider} />
              <View style={styles.coordinateRow}>
                <View style={styles.coordinateIcon}>
                  <Text style={styles.coordinateIconText}>LNG</Text>
                </View>
                <Text style={styles.coordinateValue}>
                  {localSpot.longitude.toFixed(6)}°
                </Text>
              </View>
            </View>
          </View>

          {/* Stats Card */}
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Ionicons name="fish" size={24} color={COLORS.primary} />
              <Text style={styles.statNumber}>{localSpot.likes.length}</Text>
              <Text style={styles.statLabel}>Likes</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="images" size={24} color={COLORS.primary} />
              <Text style={styles.statNumber}>{localSpot.images.length}</Text>
              <Text style={styles.statLabel}>Photos</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="fish" size={24} color="#4CAF50" />
              <Text style={styles.statNumber}>{localSpot.fishTypes.length}</Text>
              <Text style={styles.statLabel}>Species</Text>
            </View>
          </View>
        </View>
      </ScrollView>
      
      {/* Banner Ad - Only works in EAS builds, disabled for Expo Go */}
      {/* <BannerAdComponent /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  heroContainer: {
    width: width,
    height: width * 0.85,
    backgroundColor: COLORS.backgroundLight,
  },
  imageSlide: {
    width: width,
    height: width * 0.85,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  paginationDotActive: {
    backgroundColor: COLORS.primary,
    width: 24,
  },
  imageCountBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  imageCountText: {
    color: COLORS.surface,
    fontSize: SIZES.sm,
    fontWeight: '700',
  },
  contentContainer: {
    padding: SIZES.padding * 1.5,
    gap: SIZES.margin * 1.5,
  },
  titleCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius * 2,
    padding: SIZES.padding * 1.5,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  titleHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SIZES.margin * 1.5,
  },
  titleIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.margin,
  },
  titleTextContainer: {
    flex: 1,
  },
  spotName: {
    fontSize: SIZES.xl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 6,
    lineHeight: 28,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButtonPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: SIZES.radius * 1.5,
    paddingVertical: 14,
    gap: 8,
  },
  actionButtonLiked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  actionButtonText: {
    fontSize: SIZES.base + 2,
    fontWeight: '700',
    color: COLORS.primary,
  },
  actionButtonTextLiked: {
    color: COLORS.surface,
  },
  actionButtonSecondary: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonDanger: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius * 2,
    padding: SIZES.padding * 1.5,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardLabel: {
    fontSize: SIZES.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 1,
    marginBottom: SIZES.margin,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.margin * 1.2,
    gap: 10,
  },
  cardTitle: {
    fontSize: SIZES.base + 2,
    fontWeight: '700',
    color: COLORS.text,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: COLORS.primary + '30',
  },
  avatarPlaceholder: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: COLORS.surface,
    fontSize: SIZES.lg,
    fontWeight: '800',
  },
  userName: {
    fontSize: SIZES.base + 2,
    fontWeight: '700',
    color: COLORS.text,
  },
  descriptionText: {
    fontSize: SIZES.base,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  fishTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  fishChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '15',
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 8,
  },
  fishChipText: {
    fontSize: SIZES.sm + 1,
    fontWeight: '600',
    color: COLORS.text,
  },
  bestTimeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  bestTimeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bestTimeText: {
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.text,
  },
  coordinatesContainer: {
    flexDirection: 'row',
    gap: SIZES.margin,
  },
  coordinateRow: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: SIZES.radius * 1.5,
    padding: SIZES.padding,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  coordinateIcon: {
    backgroundColor: COLORS.primary + '20',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  coordinateIconText: {
    fontSize: SIZES.xs,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  coordinateValue: {
    fontSize: SIZES.sm + 1,
    fontWeight: '700',
    color: COLORS.text,
  },
  coordinateDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  statsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius * 2,
    padding: SIZES.padding * 1.5,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: SIZES.margin,
  },
  statItem: {
    alignItems: 'center',
    gap: 8,
  },
  statNumber: {
    fontSize: SIZES.xl,
    fontWeight: '800',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 60,
    backgroundColor: COLORS.border,
  },
});
