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
} from 'react-native';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { CatchReport } from '../types';
import { COLORS, SIZES } from '../constants/theme';

export const FeedScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const [reports, setReports] = useState<CatchReport[]>([]);
  const [loading, setLoading] = useState(true);

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

  const renderReport = ({ item }: { item: CatchReport }) => {
    const isLiked = user ? item.likes.includes(user.id) : false;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('ReportDetail', { report: item })}
        activeOpacity={0.9}
      >
        <View style={styles.header}>
          {item.userPhoto ? (
            <Image source={{ uri: item.userPhoto }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>{item.userName.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.userName}</Text>
            <Text style={styles.timestamp}>
              {item.createdAt.toLocaleDateString()} {item.createdAt.toLocaleTimeString()}
            </Text>
          </View>
        </View>

        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description} numberOfLines={3}>
          {item.description}
        </Text>

        {item.spotName && (
          <View style={styles.spotTag}>
            <Text style={styles.spotTagIcon}>📍</Text>
            <Text style={styles.spotTagText}>{item.spotName}</Text>
          </View>
        )}

        <View style={styles.fishInfo}>
          <Text style={styles.fishType}>🐟 {item.fishType}</Text>
          {item.weight && <Text style={styles.detail}>Weight: {item.weight}</Text>}
          {item.length && <Text style={styles.detail}>Length: {item.length}</Text>}
        </View>

        {item.images.length > 0 && (
          <Image source={{ uri: item.images[0] }} style={styles.image} />
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleLike(item.id, item.likes)}
          >
            <Text style={[styles.actionText, isLiked && styles.liked]}>
              {isLiked ? '❤️' : '🤍'} {item.likes.length}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('ReportDetail', { report: item })}
          >
            <Text style={styles.actionText}>💬 {item.comments.length}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  list: {
    padding: SIZES.padding,
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
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.margin,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.margin,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  timestamp: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  title: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.margin / 2,
  },
  description: {
    fontSize: SIZES.base,
    color: COLORS.text,
    marginBottom: SIZES.margin,
  },
  spotTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: SIZES.radius / 2,
    marginBottom: SIZES.margin,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  spotTagIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  spotTagText: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  fishInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SIZES.margin,
  },
  fishType: {
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.secondary,
    marginRight: SIZES.margin,
  },
  detail: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginRight: SIZES.margin,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.margin,
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SIZES.margin,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SIZES.margin * 2,
  },
  actionText: {
    fontSize: SIZES.base,
    color: COLORS.textSecondary,
  },
  liked: {
    color: COLORS.error,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: SIZES.lg,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: SIZES.base,
    color: COLORS.textSecondary,
    marginTop: SIZES.margin / 2,
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  addButtonText: {
    fontSize: 36,
    color: COLORS.surface,
    fontWeight: 'bold',
  },
});
