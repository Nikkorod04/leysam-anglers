import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { COLORS, SIZES } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { 
  canUserCreateSpot, 
  updateUserActivity, 
  validateSpotContent, 
  checkDuplicateSpot 
} from '../services/spamPrevention';
import { compressImage } from '../services/imageCompression';
import { validateFishingSpotContent, validateSpecies } from '../services/contentValidation';

const FISHING_TIME_OPTIONS = [
  'Aga la',
  'Kulop la',
  'Magkulop',
  'Gab e',
  'Anytime',
];

export const AddSpotScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [fishTypes, setFishTypes] = useState('');
  const [bestTime, setBestTime] = useState('');
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [tempMarker, setTempMarker] = useState<{ latitude: number; longitude: number } | null>(null);

  // Define boundaries for Leyte and Samar region
  const MAP_BOUNDARIES = {
    northLatitude: 13.0,   // Northern Samar
    southLatitude: 9.5,    // Southern Leyte
    westLongitude: 123.5,  // Western edge
    eastLongitude: 126.5,  // Eastern edge
  };

  // Default region for Leyte and Samar
  const defaultRegion = {
    latitude: 11.2500,
    longitude: 125.0000,
    latitudeDelta: 3.5,
    longitudeDelta: 3.5,
  };

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();

    return cameraStatus === 'granted' && mediaStatus === 'granted' && locationStatus === 'granted';
  };

  const pickImage = async () => {
    if (images.length >= 2) {
      Alert.alert('Limit Reached', 'You can only upload up to 2 images');
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Please grant camera and media library permissions');
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

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to use current location');
        return;
      }

      setLoading(true);
      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
      Alert.alert('Success', 'Current location captured!');
    } catch (error) {
      Alert.alert('Error', 'Failed to get current location');
    } finally {
      setLoading(false);
    }
  };

  const openMapPicker = () => {
    setTempMarker(location || defaultRegion);
    setShowMapPicker(true);
  };

  const confirmMapLocation = () => {
    if (tempMarker) {
      // Double-check boundaries before confirming
      if (
        tempMarker.latitude >= MAP_BOUNDARIES.southLatitude &&
        tempMarker.latitude <= MAP_BOUNDARIES.northLatitude &&
        tempMarker.longitude >= MAP_BOUNDARIES.westLongitude &&
        tempMarker.longitude <= MAP_BOUNDARIES.eastLongitude
      ) {
        setLocation(tempMarker);
        setShowMapPicker(false);
        Alert.alert('Success', 'Location selected from map!');
      } else {
        Alert.alert(
          'Invalid Location',
          'Selected location is outside Leyte and Samar boundaries.'
        );
      }
    }
  };

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    
    // Check if coordinates are within Leyte and Samar boundaries
    if (
      latitude >= MAP_BOUNDARIES.southLatitude &&
      latitude <= MAP_BOUNDARIES.northLatitude &&
      longitude >= MAP_BOUNDARIES.westLongitude &&
      longitude <= MAP_BOUNDARIES.eastLongitude
    ) {
      setTempMarker({ latitude, longitude });
    } else {
      Alert.alert(
        'Location Outside Boundaries',
        'Please select a location within Leyte and Samar region only.'
      );
    }
  };

  const uploadImages = async (images: string[]): Promise<string[]> => {
    const uploadPromises = images.map(async (imageUri) => {
      // Compress image before uploading to save storage and bandwidth
      const compressedBlob = await compressImage(imageUri);
      
      const filename = `spots/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
      const storageRef = ref(storage, filename);
      await uploadBytes(storageRef, compressedBlob);
      return await getDownloadURL(storageRef);
    });

    return await Promise.all(uploadPromises);
  };

  const handleSubmit = async () => {
    if (!name || !description || !fishTypes || !bestTime) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Validate name and description
    const contentValidation = validateFishingSpotContent(name, description);
    if (!contentValidation.valid) {
      Alert.alert('Invalid Content', contentValidation.error);
      return;
    }

    // Validate fish types/species
    const speciesValidation = validateSpecies(fishTypes);
    if (!speciesValidation.valid) {
      Alert.alert('Invalid Species', speciesValidation.error);
      return;
    }

    if (!location) {
      Alert.alert('Error', 'Please capture your location');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to add a spot');
      return;
    }

    setLoading(true);
    try {
      // Validate content with spam prevention
      const contentValidation2 = validateSpotContent(name, description, images);
      if (!contentValidation2.valid) {
        Alert.alert('Validation Error', contentValidation2.reason);
        setLoading(false);
        return;
      }

      // Check spam limits
      const spamCheck = await canUserCreateSpot(user.id, user.createdAt);
      if (!spamCheck.allowed) {
        Alert.alert('Limit Reached', spamCheck.reason);
        setLoading(false);
        return;
      }

      // Check for duplicates
      const duplicateCheck = await checkDuplicateSpot(
        user.id,
        name,
        location.latitude,
        location.longitude
      );
      if (duplicateCheck.isDuplicate) {
        Alert.alert('Duplicate Spot', duplicateCheck.reason);
        setLoading(false);
        return;
      }

      // Upload images to Firebase Storage
      const imageUrls = images.length > 0 ? await uploadImages(images) : [];

      // Add spot to Firestore
      await addDoc(collection(db, 'fishingSpots'), {
        userId: user.id,
        userName: user.displayName,
        userPhoto: user.photoURL || null,
        name,
        description,
        latitude: location.latitude,
        longitude: location.longitude,
        fishTypes: fishTypes.split(',').map((fish) => fish.trim()),
        bestTime,
        images: imageUrls,
        likes: [],
        isHidden: false,
        isFlagged: false,
        flagCount: 0,
        reportIds: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Update user activity
      await updateUserActivity(user.id);

      Alert.alert('Success', 'Fishing spot added successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      console.error('Error adding spot:', error);
      Alert.alert('Error', 'Failed to add fishing spot');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Add Fishing Spot</Text>

        <View style={styles.inputWrapper}>
          <View style={styles.labelWithCount}>
            <Text style={styles.label}>Spot Name</Text>
            <Text style={styles.charCount}>{name.length}/50</Text>
          </View>
          <Input
            placeholder="Ngaran it spot syempre"
            value={name}
            onChangeText={setName}
            maxLength={50}
          />
          <Text style={styles.helperText}>3-50 characters</Text>
        </View>

        <View style={styles.inputWrapper}>
          <View style={styles.labelWithCount}>
            <Text style={styles.label}>Description</Text>
            <Text style={styles.charCount}>{description.length}/300</Text>
          </View>
          <Input
            placeholder="Describe the fishing spot"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            maxLength={300}
            style={styles.textArea}
          />
          <Text style={styles.helperText}>10-300 characters</Text>
        </View>

        <Input
          label="Fish Types (comma-separated)"
          placeholder="Tingag, Barracuda, Bolinao kun ano la"
          value={fishTypes}
          onChangeText={setFishTypes}
        />

        <View style={styles.section}>
          <Text style={styles.label}>Best Fishing Time</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowTimeDropdown(!showTimeDropdown)}
          >
            <Text style={[styles.dropdownButtonText, !bestTime && styles.placeholder]}>
              {bestTime || 'Select a time'}
            </Text>
            <Ionicons
              name={showTimeDropdown ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={COLORS.primary}
            />
          </TouchableOpacity>
          {showTimeDropdown && (
            <View style={styles.dropdown}>
              {FISHING_TIME_OPTIONS.map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.dropdownItem,
                    bestTime === time && styles.dropdownItemActive,
                  ]}
                  onPress={() => {
                    setBestTime(time);
                    setShowTimeDropdown(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      bestTime === time && styles.dropdownItemActiveText,
                    ]}
                  >
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.locationButtons}>
            <Button
              title="Use Current Location"
              onPress={getCurrentLocation}
              variant="outline"
              style={styles.locationButton}
            />
            <Button
              title="Pick from Map"
              onPress={openMapPicker}
              variant="outline"
              style={styles.locationButton}
            />
          </View>
          {location && (
            <View style={styles.locationInfo}>
              <Ionicons name="location" size={20} color={COLORS.primary} />
              <Text style={styles.locationText}>
                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photos</Text>
          <Button title="Add Photos" onPress={pickImage} variant="outline" />
          <View style={styles.imageGrid}>
            {images.map((uri, index) => (
              <Image key={index} source={{ uri }} style={styles.image} />
            ))}
          </View>
        </View>

        <Button
          title={loading ? 'Adding Spot...' : 'Add Fishing Spot'}
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitButton}
        />
      </View>

      {/* Map Picker Modal */}
      <Modal
        visible={showMapPicker}
        animationType="slide"
        onRequestClose={() => setShowMapPicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Location on Map</Text>
            <TouchableOpacity onPress={() => setShowMapPicker(false)}>
              <Ionicons name="close" size={28} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          
          <MapView
            style={styles.modalMap}
            provider={PROVIDER_GOOGLE}
            initialRegion={tempMarker ? {
              latitude: tempMarker.latitude,
              longitude: tempMarker.longitude,
              latitudeDelta: 0.5,
              longitudeDelta: 0.5,
            } : defaultRegion}
            onPress={handleMapPress}
          >
            {tempMarker && (
              <Marker
                coordinate={tempMarker}
                pinColor={COLORS.secondary}
                title="Selected Location"
              />
            )}
          </MapView>

          <View style={styles.modalFooter}>
            {tempMarker && (
              <Text style={styles.coordinatesText}>
                Lat: {tempMarker.latitude.toFixed(6)}, Long: {tempMarker.longitude.toFixed(6)}
              </Text>
            )}
            <Button
              title="Confirm Location"
              onPress={confirmMapLocation}
              disabled={!tempMarker}
            />
          </View>
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
  inputWrapper: {
    marginBottom: SIZES.margin * 1.5,
  },
  labelWithCount: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.margin / 2,
  },
  label: {
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.text,
  },
  charCount: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  helperText: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: SIZES.margin / 2,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
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
  locationButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  locationButton: {
    flex: 1,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SIZES.margin,
    padding: SIZES.padding,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    gap: 8,
  },
  locationText: {
    fontSize: SIZES.sm,
    color: COLORS.text,
    flex: 1,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SIZES.margin,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: SIZES.radius,
    marginRight: SIZES.margin,
    marginBottom: SIZES.margin,
  },
  submitButton: {
    marginTop: SIZES.margin * 3,
    marginBottom: SIZES.margin * 2,
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
  modalFooter: {
    padding: SIZES.padding * 2,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  coordinatesText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SIZES.margin,
    textAlign: 'center',
  },
  label: {
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.margin / 2,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding * 0.75,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.surface,
    marginBottom: SIZES.margin,
  },
  dropdownButtonText: {
    fontSize: SIZES.base,
    color: COLORS.text,
  },
  placeholder: {
    color: COLORS.textSecondary,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.surface,
    marginBottom: SIZES.margin,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding * 0.75,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dropdownItemActive: {
    backgroundColor: COLORS.primary + '20',
  },
  dropdownItemText: {
    fontSize: SIZES.base,
    color: COLORS.text,
  },
  dropdownItemActiveText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
