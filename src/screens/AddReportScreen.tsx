import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  TouchableOpacity,
  Modal,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc, serverTimestamp, query, getDocs, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { COLORS, SIZES } from '../constants/theme';
import { FishingSpot } from '../types';
import { Ionicons } from '@expo/vector-icons';

export const AddReportScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fishType, setFishType] = useState('');
  const [weight, setWeight] = useState('');
  const [length, setLength] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [spots, setSpots] = useState<FishingSpot[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<FishingSpot | null>(null);
  const [showSpotPicker, setShowSpotPicker] = useState(false);
  const [tempSelectedSpot, setTempSelectedSpot] = useState<FishingSpot | null>(null);

  // Default region for Leyte and Samar
  const defaultRegion = {
    latitude: 11.2500,
    longitude: 125.0000,
    latitudeDelta: 3.5,
    longitudeDelta: 3.5,
  };

  useEffect(() => {
    loadSpots();
  }, []);

  const loadSpots = async () => {
    try {
      const spotsQuery = query(
        collection(db, 'fishingSpots'),
        where('isHidden', '==', false)
      );
      const snapshot = await getDocs(spotsQuery);
      const spotsData: FishingSpot[] = [];
      
      snapshot.forEach((doc) => {
        spotsData.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        } as FishingSpot);
      });

      setSpots(spotsData);
    } catch (error) {
      console.error('Error loading spots:', error);
    }
  };

  const openSpotPicker = () => {
    setTempSelectedSpot(selectedSpot);
    setShowSpotPicker(true);
  };

  const confirmSpotSelection = () => {
    if (tempSelectedSpot) {
      setSelectedSpot(tempSelectedSpot);
      setShowSpotPicker(false);
    }
  };

  const handleMarkerPress = (spot: FishingSpot) => {
    setTempSelectedSpot(spot);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant media library permissions');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newImages = result.assets.map((asset) => asset.uri);
      setImages([...images, ...newImages]);
    }
  };

  const uploadImages = async (images: string[]): Promise<string[]> => {
    const uploadPromises = images.map(async (imageUri) => {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const filename = `catches/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
      const storageRef = ref(storage, filename);
      await uploadBytes(storageRef, blob);
      return await getDownloadURL(storageRef);
    });

    return await Promise.all(uploadPromises);
  };

  const handleSubmit = async () => {
    if (!title || !description || !fishType) {
      Alert.alert('Error', 'Please fill in required fields (title, description, fish type)');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to post a catch report');
      return;
    }

    setLoading(true);
    try {
      // Upload images to Firebase Storage
      const imageUrls = images.length > 0 ? await uploadImages(images) : [];

      // Add catch report to Firestore
      await addDoc(collection(db, 'catchReports'), {
        userId: user.id,
        userName: user.displayName,
        userPhoto: user.photoURL || null,
        spotId: selectedSpot?.id || null,
        spotName: selectedSpot?.name || null,
        title,
        description,
        fishType,
        weight: weight || null,
        length: length || null,
        images: imageUrls,
        likes: [],
        comments: [],
        isHidden: false,
        isFlagged: false,
        flagCount: 0,
        reportIds: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      Alert.alert('Success', 'Catch report posted successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      console.error('Error adding report:', error);
      Alert.alert('Error', 'Failed to post catch report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Share Your Catch</Text>

        <Input
          label="Title *"
          placeholder="e.g., Big Tuna Catch at Tacloban Bay"
          value={title}
          onChangeText={setTitle}
        />

        <Input
          label="Description *"
          placeholder="Tell us about your catch..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          style={styles.textArea}
        />

        <Input
          label="Fish Type *"
          placeholder="e.g., Yellowfin Tuna"
          value={fishType}
          onChangeText={setFishType}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fishing Spot (Optional)</Text>
          <TouchableOpacity
            style={styles.spotSelector}
            onPress={openSpotPicker}
          >
            <Ionicons 
              name="location" 
              size={24} 
              color={selectedSpot ? COLORS.primary : COLORS.textSecondary} 
            />
            <Text style={[styles.spotSelectorText, !selectedSpot && styles.spotSelectorPlaceholder]}>
              {selectedSpot ? selectedSpot.name : 'Select a fishing spot'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
          {selectedSpot && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => setSelectedSpot(null)}
            >
              <Text style={styles.clearButtonText}>Clear Selection</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Input
              label="Weight (optional)"
              placeholder="e.g., 15kg"
              value={weight}
              onChangeText={setWeight}
            />
          </View>
          <View style={styles.halfInput}>
            <Input
              label="Length (optional)"
              placeholder="e.g., 80cm"
              value={length}
              onChangeText={setLength}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photos</Text>
          <Button title="Add Photos" onPress={pickImage} variant="outline" />
          <View style={styles.imageGrid}>
            {images.map((uri, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri }} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => setImages(images.filter((_, i) => i !== index))}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <Button
          title={loading ? 'Posting...' : 'Post Catch Report'}
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitButton}
        />
      </View>

      {/* Spot Picker Modal */}
      <Modal
        visible={showSpotPicker}
        animationType="slide"
        onRequestClose={() => setShowSpotPicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Fishing Spot</Text>
            <TouchableOpacity onPress={() => setShowSpotPicker(false)}>
              <Ionicons name="close" size={28} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          {spots.length > 0 ? (
            <>
              <MapView
                style={styles.modalMap}
                provider={PROVIDER_GOOGLE}
                initialRegion={
                  selectedSpot
                    ? {
                        latitude: selectedSpot.latitude,
                        longitude: selectedSpot.longitude,
                        latitudeDelta: 0.5,
                        longitudeDelta: 0.5,
                      }
                    : defaultRegion
                }
              >
                {spots.map((spot) => (
                  <Marker
                    key={spot.id}
                    coordinate={{
                      latitude: spot.latitude,
                      longitude: spot.longitude,
                    }}
                    title={spot.name}
                    description={spot.fishTypes.join(', ')}
                    onPress={() => handleMarkerPress(spot)}
                    pinColor={
                      tempSelectedSpot?.id === spot.id
                        ? COLORS.primary
                        : COLORS.secondary
                    }
                  />
                ))}
              </MapView>

              {/* Selected Spot Info */}
              {tempSelectedSpot && (
                <View style={styles.selectedSpotCard}>
                  <View style={styles.selectedSpotInfo}>
                    <Ionicons name="location" size={28} color={COLORS.primary} />
                    <View style={styles.selectedSpotDetails}>
                      <Text style={styles.selectedSpotName}>
                        {tempSelectedSpot.name}
                      </Text>
                      <Text style={styles.selectedSpotDescription} numberOfLines={2}>
                        {tempSelectedSpot.description}
                      </Text>
                      <Text style={styles.selectedSpotFish}>
                        🐟 {tempSelectedSpot.fishTypes.join(', ')}
                      </Text>
                    </View>
                  </View>
                  <Button
                    title="Select This Spot"
                    onPress={confirmSpotSelection}
                    style={styles.confirmButton}
                  />
                </View>
              )}

              {!tempSelectedSpot && (
                <View style={styles.instructionCard}>
                  <Ionicons name="information-circle" size={24} color={COLORS.primary} />
                  <Text style={styles.instructionText}>
                    Tap on a marker to select a fishing spot
                  </Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="fish-outline" size={64} color={COLORS.textSecondary} />
              <Text style={styles.emptyText}>No fishing spots available</Text>
              <Text style={styles.emptySubtext}>
                Add a fishing spot first from the Map tab
              </Text>
            </View>
          )}
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SIZES.padding * 2,
  },
  title: {
    fontSize: SIZES.title,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SIZES.margin * 2,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 1,
    marginRight: SIZES.margin,
  },
  section: {
    marginTop: SIZES.margin * 2,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.margin,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SIZES.margin,
  },
  imageContainer: {
    position: 'relative',
    marginRight: SIZES.margin,
    marginBottom: SIZES.margin,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: SIZES.radius,
  },
  removeButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: COLORS.surface,
    fontSize: 18,
    fontWeight: 'bold',
  },
  submitButton: {
    marginTop: SIZES.margin * 3,
    marginBottom: SIZES.margin * 2,
  },
  spotSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  spotSelectorText: {
    flex: 1,
    fontSize: SIZES.base,
    color: COLORS.text,
  },
  spotSelectorPlaceholder: {
    color: COLORS.textSecondary,
  },
  clearButton: {
    marginTop: SIZES.margin,
    padding: SIZES.padding / 2,
    alignItems: 'center',
  },
  clearButtonText: {
    color: COLORS.error,
    fontSize: SIZES.sm,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding * 2,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  modalMap: {
    flex: 1,
  },
  selectedSpotCard: {
    backgroundColor: COLORS.surface,
    padding: SIZES.padding * 2,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  selectedSpotInfo: {
    flexDirection: 'row',
    gap: SIZES.margin,
    marginBottom: SIZES.margin * 1.5,
  },
  selectedSpotDetails: {
    flex: 1,
  },
  selectedSpotName: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.margin / 2,
  },
  selectedSpotDescription: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SIZES.margin / 2,
    lineHeight: 20,
  },
  selectedSpotFish: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  confirmButton: {
    marginTop: 0,
  },
  instructionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.margin,
    backgroundColor: COLORS.surface,
    padding: SIZES.padding * 2,
    margin: SIZES.margin * 2,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  instructionText: {
    flex: 1,
    fontSize: SIZES.base,
    color: COLORS.text,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding * 4,
    marginTop: 60,
  },
  emptyText: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: SIZES.margin * 2,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SIZES.margin,
    textAlign: 'center',
  },
});
