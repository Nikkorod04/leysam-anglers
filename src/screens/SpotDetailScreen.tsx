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
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { doc, updateDoc, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { FishingSpot } from '../types';
import { COLORS, SIZES } from '../constants/theme';
import { reportContent } from '../services/reportService';

const { width } = Dimensions.get('window');

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
    <ScrollView style={styles.container}>
      {/* Image Gallery */}
      {localSpot.images.length > 0 && (
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleImageScroll}
            scrollEventThrottle={16}
          >
            {localSpot.images.map((imageUri, index) => (
              <Image key={index} source={{ uri: imageUri }} style={styles.image} />
            ))}
          </ScrollView>
          {localSpot.images.length > 1 && (
            <View style={styles.pagination}>
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
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {localSpot.userPhoto ? (
              <Image source={{ uri: localSpot.userPhoto }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarText}>
                  {localSpot.userName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{localSpot.userName}</Text>
              <Text style={styles.date}>
                {localSpot.createdAt.toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Spot Name */}
        <Text style={styles.spotName}>{localSpot.name}</Text>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Description</Text>
          <Text style={styles.description}>{localSpot.description}</Text>
        </View>

        {/* Fish Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🐟 Fish Types</Text>
          <View style={styles.fishContainer}>
            {localSpot.fishTypes.map((fish, index) => (
              <View key={index} style={styles.fishTag}>
                <Text style={styles.fishTagText}>{fish}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Best Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⏰ Best Fishing Time</Text>
          <Text style={styles.bestTime}>{localSpot.bestTime}</Text>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Location</Text>
          <Text style={styles.coordinates}>
            Latitude: {localSpot.latitude.toFixed(6)}
          </Text>
          <Text style={styles.coordinates}>
            Longitude: {localSpot.longitude.toFixed(6)}
          </Text>
        </View>

        {/* Like Button */}
        <TouchableOpacity style={styles.likeButton} onPress={handleLike}>
          <Text style={styles.likeIcon}>{isLiked ? '❤️' : '🤍'}</Text>
          <Text style={styles.likeText}>
            {localSpot.likes.length} {localSpot.likes.length === 1 ? 'Like' : 'Likes'}
          </Text>
        </TouchableOpacity>

        {/* Report Button */}
        {user && user.id !== localSpot.userId && (
          <TouchableOpacity style={styles.reportButton} onPress={handleReport}>
            <Ionicons name="flag-outline" size={20} color={COLORS.error} />
            <Text style={styles.reportText}>Report this spot</Text>
          </TouchableOpacity>
        )}

        {/* Admin Delete Button */}
        {isAdmin && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color={COLORS.surface} />
            <Text style={styles.deleteText}>Delete Spot (Admin)</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  imageContainer: {
    width: width,
    height: 300,
    backgroundColor: COLORS.border,
  },
  image: {
    width: width,
    height: 300,
    resizeMode: 'cover',
  },
  pagination: {
    position: 'absolute',
    bottom: 10,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.surface,
    marginHorizontal: 4,
    opacity: 0.5,
  },
  paginationDotActive: {
    opacity: 1,
    backgroundColor: COLORS.primary,
  },
  content: {
    padding: SIZES.padding * 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.margin * 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: SIZES.margin,
  },
  avatarPlaceholder: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: COLORS.surface,
    fontSize: SIZES.lg,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.text,
  },
  date: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  spotName: {
    fontSize: SIZES.title,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SIZES.margin * 2,
  },
  section: {
    marginBottom: SIZES.margin * 2,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.margin,
  },
  description: {
    fontSize: SIZES.base,
    color: COLORS.text,
    lineHeight: 24,
  },
  fishContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  fishTag: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: SIZES.margin,
    marginBottom: SIZES.margin,
  },
  fishTagText: {
    color: COLORS.surface,
    fontSize: SIZES.base,
    fontWeight: '600',
  },
  bestTime: {
    fontSize: SIZES.base,
    color: COLORS.text,
    lineHeight: 24,
  },
  coordinates: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: SIZES.radius,
    paddingVertical: SIZES.padding,
    marginTop: SIZES.margin,
  },
  likeIcon: {
    fontSize: 24,
    marginRight: SIZES.margin,
  },
  likeText: {
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.primary,
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    paddingVertical: 12,
    marginTop: SIZES.margin,
  },
  reportText: {
    fontSize: SIZES.sm,
    color: COLORS.error,
    marginLeft: 8,
    fontWeight: '500',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.error,
    borderRadius: SIZES.radius,
    paddingVertical: 14,
    marginTop: SIZES.margin,
  },
  deleteText: {
    fontSize: SIZES.base,
    color: COLORS.surface,
    marginLeft: 8,
    fontWeight: '600',
  },
});
