import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  FlatList,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { FishingSpot } from '../types';
import { COLORS, SIZES } from '../constants/theme';

const { width } = Dimensions.get('window');

export const MyFishingSpotsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const [spots, setSpots] = useState<FishingSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUserSpots();
  }, [user?.id]);

  const loadUserSpots = async () => {
    try {
      if (!user?.id) return;

      setLoading(true);
      const q = query(
        collection(db, 'fishingSpots'),
        where('userId', '==', user.id)
      );
      const snapshot = await getDocs(q);
      const spotsData: FishingSpot[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        spotsData.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as FishingSpot);
      });

      // Sort by newest first
      spotsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      setSpots(spotsData);
    } catch (error) {
      console.error('Error loading user spots:', error);
      Alert.alert('Error', 'Failed to load your fishing spots');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadUserSpots();
  };

  const handleDeleteSpot = (spotId: string, spotName: string) => {
    Alert.alert(
      'Delete Spot',
      `Are you sure you want to delete "${spotName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'fishingSpots', spotId));
              setSpots(spots.filter((s) => s.id !== spotId));
              Alert.alert('Success', 'Spot deleted successfully');
            } catch (error) {
              console.error('Error deleting spot:', error);
              Alert.alert('Error', 'Failed to delete spot');
            }
          },
        },
      ]
    );
  };

  const renderSpotCard = ({ item: spot }: { item: FishingSpot }) => (
    <TouchableOpacity
      style={styles.spotCard}
      onPress={() => navigation.navigate('SpotDetail', { spot })}
    >
      {/* Spot Image */}
      {spot.images && spot.images.length > 0 ? (
        <Image
          source={{ uri: spot.images[0] }}
          style={styles.spotImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.spotImage, styles.noImage]}>
          <Ionicons name="image-outline" size={40} color={COLORS.textSecondary} />
        </View>
      )}

      {/* Spot Info */}
      <View style={styles.spotInfo}>
        <View style={styles.spotHeader}>
          <View style={styles.spotTitleContainer}>
            <Text style={styles.spotName} numberOfLines={1}>
              {spot.name}
            </Text>
            <Text style={styles.spotDate}>
              {spot.createdAt.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteSpot(spot.id, spot.name)}
          >
            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
          </TouchableOpacity>
        </View>

        {/* Fish Types */}
        <View style={styles.fishTypes}>
          <Ionicons name="fish" size={16} color={COLORS.primary} />
          <Text style={styles.fishTypesText} numberOfLines={1}>
            {spot.fishTypes.join(', ')}
          </Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Ionicons name="fish" size={14} color={COLORS.primary} />
            <Text style={styles.statText}>{spot.likes.length}</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="images" size={14} color={COLORS.primary} />
            <Text style={styles.statText}>{spot.images?.length || 0}</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="flag" size={14} color={COLORS.textSecondary} />
            <Text style={styles.statText}>{spot.reportIds?.length || 0}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading your spots...</Text>
      </View>
    );
  }

  if (spots.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="location-outline" size={64} color={COLORS.textSecondary} />
        <Text style={styles.emptyTitle}>No Fishing Spots Yet</Text>
        <Text style={styles.emptyText}>
          You haven't added any fishing spots. Start by sharing your favorite locations!
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('Map')}
        >
          <Ionicons name="add" size={24} color={COLORS.surface} />
          <Text style={styles.addButtonText}>Add a Spot</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={spots}
        renderItem={renderSpotCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContainer: {
    padding: SIZES.padding * 1.5,
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SIZES.margin,
    fontSize: SIZES.base,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SIZES.padding * 2,
  },
  emptyTitle: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SIZES.margin * 2,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: SIZES.base,
    color: COLORS.textSecondary,
    marginTop: SIZES.margin,
    textAlign: 'center',
    lineHeight: 22,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.margin,
    marginTop: SIZES.margin * 3,
    paddingHorizontal: SIZES.padding * 2,
    paddingVertical: SIZES.padding,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius * 2,
  },
  addButtonText: {
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.surface,
  },
  spotCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius * 2,
    overflow: 'hidden',
    marginBottom: SIZES.margin * 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  spotImage: {
    width: '100%',
    height: 180,
    backgroundColor: COLORS.backgroundLight,
  },
  noImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  spotInfo: {
    padding: SIZES.padding * 1.5,
  },
  spotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.margin,
  },
  spotTitleContainer: {
    flex: 1,
  },
  spotName: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  spotDate: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  deleteButton: {
    padding: SIZES.padding / 2,
    marginLeft: SIZES.margin,
  },
  fishTypes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.margin / 2,
    marginBottom: SIZES.margin,
  },
  fishTypesText: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SIZES.margin * 2,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
});
