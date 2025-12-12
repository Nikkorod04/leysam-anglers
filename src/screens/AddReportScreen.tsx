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
import { compressImage } from '../services/imageCompression';
import { validateSpecies } from '../services/speciesValidation';
import { validateCatchReportContent } from '../services/contentValidation';

export const AddReportScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fishType, setFishType] = useState('');
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
    if (images.length >= 2) {
      Alert.alert('Limit Reached', 'You can only upload up to 2 images');
      return;
    }

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
      const remainingSlots = 2 - images.length;
      const imagesToAdd = newImages.slice(0, remainingSlots);
      
      if (newImages.length > remainingSlots) {
        Alert.alert('Limit Reached', `Only ${remainingSlots} image(s) can be added. Maximum is 2 images.`);
      }
      
      setImages([...images, ...imagesToAdd]);
    }
  };

  const uploadImages = async (images: string[]): Promise<string[]> => {
    const uploadPromises = images.map(async (imageUri) => {
      // Compress image before uploading to save storage and bandwidth
      const compressedBlob = await compressImage(imageUri);
      
      const filename = `catches/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
      const storageRef = ref(storage, filename);
      await uploadBytes(storageRef, compressedBlob);
      return await getDownloadURL(storageRef);
    });

    return await Promise.all(uploadPromises);
  };

  const handleSubmit = async () => {
    if (!title || !description || !fishType) {
      Alert.alert('Error', 'Please fill in required fields (title, description, fish type)');
      return;
    }

    // Validate title and description
    const contentValidation = validateCatchReportContent(title, description);
    if (!contentValidation.valid) {
      Alert.alert('Invalid Content', contentValidation.error);
      return;
    }

    // Validate species/fish type
    const speciesValidation = validateSpecies(fishType);
    if (!speciesValidation.valid) {
      Alert.alert('Invalid Species', speciesValidation.error);
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.iconCircle}>
            <Ionicons name="fish" size={32} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>Share Your Catch</Text>
          <Text style={styles.subtitle}>Tell the community about your fishing success!</Text>
        </View>

        {/* Form Sections */}
        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Ionicons name="create-outline" size={18} color={COLORS.primary} />
              <Text style={styles.inputLabel}>Title *</Text>
              <Text style={styles.charCount}>{title.length}/60</Text>
            </View>
            <Input
              placeholder="e.g., Dako nga tingag ha tulay"
              value={title}
              onChangeText={setTitle}
              maxLength={60}
              style={styles.input}
            />
            <Text style={styles.helperText}>5-60 characters</Text>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Ionicons name="document-text-outline" size={18} color={COLORS.primary} />
              <Text style={styles.inputLabel}>Description *</Text>
              <Text style={styles.charCount}>{description.length}/500</Text>
            </View>
            <Input
              placeholder="Tell us about your catch... What happened? What did you use?"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={5}
              maxLength={500}
              style={[styles.input, styles.textArea]}
            />
            <Text style={styles.helperText}>10-500 characters</Text>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Ionicons name="fish-outline" size={18} color={COLORS.primary} />
              <Text style={styles.inputLabel}>Fish Species *</Text>
            </View>
            <Input
              placeholder="e.g., Tingag, Bolinao, Barracuda"
              value={fishType}
              onChangeText={setFishType}
              style={styles.input}
            />
            <Text style={styles.helperNote}>Use comma to separate multiple species</Text>
          </View>
        </View>

        {/* Photos Section */}
        <View style={styles.photoSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.labelRow}>
              <Ionicons name="camera" size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Photos</Text>
            </View>
            <View style={styles.photoBadge}>
              <Text style={styles.photoBadgeText}>{images.length}/2</Text>
            </View>
          </View>
          
          {images.length === 0 ? (
            <TouchableOpacity style={styles.photoPlaceholder} onPress={pickImage}>
              <Ionicons name="image-outline" size={48} color={COLORS.textSecondary} />
              <Text style={styles.photoPlaceholderText}>Tap to add photos</Text>
              <Text style={styles.photoPlaceholderSubtext}>Up to 2 images</Text>
            </TouchableOpacity>
          ) : (
            <>
              <View style={styles.imageGrid}>
                {images.map((uri, index) => (
                  <View key={index} style={styles.imageContainer}>
                    <Image source={{ uri }} style={styles.image} />
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => setImages(images.filter((_, i) => i !== index))}
                    >
                      <Ionicons name="close-circle" size={28} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
              {images.length < 2 && (
                <Button 
                  title="Add Another Photo" 
                  onPress={pickImage} 
                  variant="outline" 
                  style={styles.addMoreButton}
                />
              )}
            </>
          )}
        </View>

        {/* Fishing Spot Section */}
        <View style={styles.spotSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.labelRow}>
              <Ionicons name="location" size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Fishing Spot</Text>
            </View>
            <Text style={styles.optionalBadge}>Optional</Text>
          </View>
          
          <TouchableOpacity
            style={[
              styles.spotSelector,
              selectedSpot && styles.spotSelectorSelected
            ]}
            onPress={openSpotPicker}
          >
            <View style={styles.spotIconContainer}>
              <Ionicons 
                name={selectedSpot ? "location" : "location-outline"} 
                size={24} 
                color={selectedSpot ? COLORS.primary : COLORS.textSecondary} 
              />
            </View>
            <View style={styles.spotTextContainer}>
              <Text style={[
                styles.spotSelectorText, 
                !selectedSpot && styles.spotSelectorPlaceholder
              ]}>
                {selectedSpot ? selectedSpot.name : 'Select a fishing spot'}
              </Text>
              {selectedSpot && (
                <Text style={styles.spotSelectorSubtext} numberOfLines={1}>
                  🐟 {selectedSpot.fishTypes.join(', ')}
                </Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
          
          {selectedSpot && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => setSelectedSpot(null)}
            >
              <Ionicons name="close-circle-outline" size={16} color={COLORS.error} />
              <Text style={styles.clearButtonText}>Clear selection</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Submit Button */}
        <Button
          title={loading ? 'Posting...' : 'Post Catch Report'}
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitButton}
        />
        
        {/* Helper Text */}
        <Text style={styles.helperText}>
          * Required fields must be filled to post your catch report
        </Text>
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
    padding: SIZES.padding * 1.5,
    paddingBottom: SIZES.padding * 3,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: SIZES.margin * 3,
    paddingTop: SIZES.padding,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.margin * 1.5,
    borderWidth: 2,
    borderColor: COLORS.primary + '30',
  },
  title: {
    fontSize: SIZES.title + 2,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SIZES.margin / 2,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: SIZES.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  formSection: {
    marginBottom: SIZES.margin * 2,
  },
  inputGroup: {
    marginBottom: SIZES.margin * 2,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SIZES.margin,
  },
  inputLabel: {
    fontSize: SIZES.base,
    fontWeight: '700',
    color: COLORS.text,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius * 1.5,
    paddingHorizontal: SIZES.padding * 1.5,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: SIZES.padding,
  },
  helperNote: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: SIZES.margin / 2,
    fontStyle: 'italic',
  },
  helperText: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: SIZES.margin / 2,
  },
  charCount: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  photoSection: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius * 2,
    padding: SIZES.padding * 1.5,
    marginBottom: SIZES.margin * 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.margin * 1.5,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  photoBadge: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
  },
  photoBadgeText: {
    fontSize: SIZES.sm,
    fontWeight: '700',
    color: COLORS.primary,
  },
  optionalBadge: {
    fontSize: SIZES.xs,
    fontWeight: '600',
    color: COLORS.textSecondary,
    backgroundColor: COLORS.backgroundLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.backgroundLight,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
    borderRadius: SIZES.radius * 1.5,
    paddingVertical: SIZES.padding * 3,
    marginBottom: SIZES.margin,
  },
  photoPlaceholderText: {
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: SIZES.margin,
  },
  photoPlaceholderSubtext: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.margin,
    marginBottom: SIZES.margin,
  },
  imageContainer: {
    position: 'relative',
    width: 140,
    height: 140,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: SIZES.radius * 1.5,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
  },
  addMoreButton: {
    marginTop: SIZES.margin / 2,
  },
  spotSection: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius * 2,
    padding: SIZES.padding * 1.5,
    marginBottom: SIZES.margin * 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  spotSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
    padding: SIZES.padding * 1.2,
    borderRadius: SIZES.radius * 1.5,
    borderWidth: 2,
    borderColor: COLORS.border,
    gap: 12,
  },
  spotSelectorSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '08',
  },
  spotIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spotTextContainer: {
    flex: 1,
  },
  spotSelectorText: {
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  spotSelectorPlaceholder: {
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  spotSelectorSubtext: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SIZES.margin,
    padding: SIZES.padding / 2,
    gap: 6,
  },
  clearButtonText: {
    color: COLORS.error,
    fontSize: SIZES.sm,
    fontWeight: '600',
  },
  submitButton: {
    marginTop: SIZES.margin,
    marginBottom: SIZES.margin,
    height: 56,
    borderRadius: SIZES.radius * 2,
  },
  helperText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
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
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  modalTitle: {
    fontSize: SIZES.lg + 2,
    fontWeight: '700',
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
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
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
    fontWeight: '700',
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
    fontWeight: '600',
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
    borderRadius: SIZES.radius * 1.5,
    borderWidth: 2,
    borderColor: COLORS.primary + '30',
    borderStyle: 'dashed',
  },
  instructionText: {
    flex: 1,
    fontSize: SIZES.base,
    color: COLORS.text,
    fontWeight: '500',
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
