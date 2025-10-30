import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Polygon } from 'react-native-maps';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../services/firebase';
import { FishingSpot } from '../types';
import { COLORS, SIZES } from '../constants/theme';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

// Coordinates for Leyte and Samar, Philippines
const LEYTE_SAMAR_REGION = {
  latitude: 11.2500,
  longitude: 125.0000,
  latitudeDelta: 3.5,
  longitudeDelta: 3.5,
};

// Define boundaries for Leyte and Samar region
// These coordinates form a rectangle around Leyte and Samar
const MAP_BOUNDARIES = {
  northLatitude: 13.0,   // Northern Samar
  southLatitude: 9.5,    // Southern Leyte
  westLongitude: 123.5,  // Western edge
  eastLongitude: 126.5,  // Eastern edge
};

// Min and max zoom levels
const MIN_ZOOM_DELTA = 0.01;  // Max zoom in (very close)
const MAX_ZOOM_DELTA = 4.0;   // Max zoom out

// Create overlay polygons to cover everything OUTSIDE Leyte and Samar
// Top polygon (north of Leyte/Samar)
const OVERLAY_NORTH = [
  { latitude: 20, longitude: 120 },
  { latitude: 20, longitude: 130 },
  { latitude: MAP_BOUNDARIES.northLatitude, longitude: 130 },
  { latitude: MAP_BOUNDARIES.northLatitude, longitude: 120 },
];

// Bottom polygon (south of Leyte/Samar)
const OVERLAY_SOUTH = [
  { latitude: MAP_BOUNDARIES.southLatitude, longitude: 120 },
  { latitude: MAP_BOUNDARIES.southLatitude, longitude: 130 },
  { latitude: 5, longitude: 130 },
  { latitude: 5, longitude: 120 },
];

// Left polygon (west of Leyte/Samar)
const OVERLAY_WEST = [
  { latitude: MAP_BOUNDARIES.northLatitude, longitude: 120 },
  { latitude: MAP_BOUNDARIES.northLatitude, longitude: MAP_BOUNDARIES.westLongitude },
  { latitude: MAP_BOUNDARIES.southLatitude, longitude: MAP_BOUNDARIES.westLongitude },
  { latitude: MAP_BOUNDARIES.southLatitude, longitude: 120 },
];

// Right polygon (east of Leyte/Samar)
const OVERLAY_EAST = [
  { latitude: MAP_BOUNDARIES.northLatitude, longitude: MAP_BOUNDARIES.eastLongitude },
  { latitude: MAP_BOUNDARIES.northLatitude, longitude: 130 },
  { latitude: MAP_BOUNDARIES.southLatitude, longitude: 130 },
  { latitude: MAP_BOUNDARIES.southLatitude, longitude: MAP_BOUNDARIES.eastLongitude },
];

export const MapScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [spots, setSpots] = useState<FishingSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const mapRef = React.useRef<MapView>(null);
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  
  // Map display settings
  const [showPOI, setShowPOI] = useState(true); // Points of Interest (landmarks, shops)
  const [showLabels, setShowLabels] = useState(true); // Street names and labels
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownHeight] = useState(new Animated.Value(0));

  // Generate custom map style based on settings
  const getCustomMapStyle = () => {
    const style: any[] = [];

    // Hide POI (landmarks, shops, etc.) if disabled
    if (!showPOI) {
      style.push({
        featureType: 'poi',
        elementType: 'all',
        stylers: [{ visibility: 'off' }],
      });
    }

    // Hide labels (street names, place names) if disabled
    if (!showLabels) {
      style.push({
        featureType: 'all',
        elementType: 'labels.text',
        stylers: [{ visibility: 'off' }],
      });
    }

    return style;
  };

  // Toggle dropdown menu
  const toggleDropdown = () => {
    const toValue = isDropdownOpen ? 0 : 1;
    setIsDropdownOpen(!isDropdownOpen);
    
    Animated.spring(dropdownHeight, {
      toValue,
      friction: 8,
      tension: 40,
      useNativeDriver: false,
    }).start();
  };

  // Function to check if coordinates are within boundaries
  const isWithinBounds = (latitude: number, longitude: number) => {
    return (
      latitude >= MAP_BOUNDARIES.southLatitude &&
      latitude <= MAP_BOUNDARIES.northLatitude &&
      longitude >= MAP_BOUNDARIES.westLongitude &&
      longitude <= MAP_BOUNDARIES.eastLongitude
    );
  };

  // Function to constrain region within boundaries
  const constrainRegion = (region: any) => {
    let { latitude, longitude, latitudeDelta, longitudeDelta } = region;

    // Constrain zoom levels
    latitudeDelta = Math.max(MIN_ZOOM_DELTA, Math.min(MAX_ZOOM_DELTA, latitudeDelta));
    longitudeDelta = Math.max(MIN_ZOOM_DELTA, Math.min(MAX_ZOOM_DELTA, longitudeDelta));

    // Calculate the extent of the visible region
    const halfLatDelta = latitudeDelta / 2;
    const halfLonDelta = longitudeDelta / 2;

    // Constrain latitude
    if (latitude - halfLatDelta < MAP_BOUNDARIES.southLatitude) {
      latitude = MAP_BOUNDARIES.southLatitude + halfLatDelta;
    }
    if (latitude + halfLatDelta > MAP_BOUNDARIES.northLatitude) {
      latitude = MAP_BOUNDARIES.northLatitude - halfLatDelta;
    }

    // Constrain longitude
    if (longitude - halfLonDelta < MAP_BOUNDARIES.westLongitude) {
      longitude = MAP_BOUNDARIES.westLongitude + halfLonDelta;
    }
    if (longitude + halfLonDelta > MAP_BOUNDARIES.eastLongitude) {
      longitude = MAP_BOUNDARIES.eastLongitude - halfLonDelta;
    }

    return { latitude, longitude, latitudeDelta, longitudeDelta };
  };

  // Handle region change
  const onRegionChangeComplete = (region: any) => {
    const constrainedRegion = constrainRegion(region);
    
    // Check if we need to adjust the region
    if (
      Math.abs(region.latitude - constrainedRegion.latitude) > 0.01 ||
      Math.abs(region.longitude - constrainedRegion.longitude) > 0.01 ||
      Math.abs(region.latitudeDelta - constrainedRegion.latitudeDelta) > 0.01 ||
      Math.abs(region.longitudeDelta - constrainedRegion.longitudeDelta) > 0.01
    ) {
      // Animate back to constrained region
      mapRef.current?.animateToRegion(constrainedRegion, 300);
    }
  };

  useEffect(() => {
    // Request location permission
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation(location);
      }
    })();

    // Subscribe to fishing spots
    const q = query(collection(db, 'fishingSpots'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const spotsData: FishingSpot[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          // Filter out hidden spots (unless user is admin)
          if (!data.isHidden) {
            spotsData.push({
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date(),
              isHidden: data.isHidden || false,
              isFlagged: data.isFlagged || false,
              flagCount: data.flagCount || 0,
              reportIds: data.reportIds || [],
            } as FishingSpot);
          }
        });
        setSpots(spotsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching spots:', error);
        Alert.alert('Error', 'Failed to load fishing spots');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleMarkerPress = (spot: FishingSpot) => {
    // Navigate to details when callout is pressed (second click)
    navigation.navigate('SpotDetail', { spot });
    setSelectedSpotId(null); // Reset selection after navigation
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading fishing spots...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={LEYTE_SAMAR_REGION}
        onRegionChangeComplete={onRegionChangeComplete}
        minZoomLevel={7}
        maxZoomLevel={20}
        showsUserLocation
        showsMyLocationButton
        customMapStyle={getCustomMapStyle()}
      >
        {/* Overlay polygons to dim areas OUTSIDE Leyte and Samar */}
        {/* North overlay */}
        <Polygon
          coordinates={OVERLAY_NORTH}
          fillColor="rgba(0, 0, 0, 0.5)"
          strokeColor="transparent"
        />
        {/* South overlay */}
        <Polygon
          coordinates={OVERLAY_SOUTH}
          fillColor="rgba(0, 0, 0, 0.5)"
          strokeColor="transparent"
        />
        {/* West overlay */}
        <Polygon
          coordinates={OVERLAY_WEST}
          fillColor="rgba(0, 0, 0, 0.5)"
          strokeColor="transparent"
        />
        {/* East overlay */}
        <Polygon
          coordinates={OVERLAY_EAST}
          fillColor="rgba(0, 0, 0, 0.5)"
          strokeColor="transparent"
        />

        {/* Fishing spot markers */}
        {spots.map((spot) => (
          <Marker
            key={spot.id}
            coordinate={{
              latitude: spot.latitude,
              longitude: spot.longitude,
            }}
            title={spot.name}
            description={`🐟 ${spot.fishTypes.join(', ')}`}
            onPress={() => {
              setSelectedSpotId(spot.id);
            }}
            onCalloutPress={() => handleMarkerPress(spot)}
            pinColor={COLORS.secondary}
          />
        ))}
      </MapView>

      {/* Map Controls */}
      <View style={styles.controls}>
        {/* Dropdown Trigger Button */}
        <TouchableOpacity
          style={styles.dropdownTrigger}
          onPress={toggleDropdown}
          activeOpacity={0.8}
        >
          <Ionicons name="settings-outline" size={20} color={COLORS.text} />
          <Text style={styles.dropdownTriggerText}>Map Display</Text>
          <Ionicons 
            name={isDropdownOpen ? "chevron-up" : "chevron-down"} 
            size={20} 
            color={COLORS.text} 
          />
        </TouchableOpacity>

        {/* Dropdown Menu */}
        <Animated.View 
          style={[
            styles.dropdownMenu,
            {
              maxHeight: dropdownHeight.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 120],
              }),
              opacity: dropdownHeight,
            }
          ]}
        >
          {/* Show Landmarks Option */}
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => setShowPOI(!showPOI)}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={showPOI ? "checkmark-circle" : "ellipse-outline"} 
              size={24} 
              color={showPOI ? COLORS.primary : COLORS.textSecondary} 
            />
            <Text style={[styles.dropdownItemText, !showPOI && styles.dropdownItemTextInactive]}>
              Show Landmarks
            </Text>
          </TouchableOpacity>

          {/* Show Labels Option */}
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => setShowLabels(!showLabels)}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={showLabels ? "checkmark-circle" : "ellipse-outline"} 
              size={24} 
              color={showLabels ? COLORS.primary : COLORS.textSecondary} 
            />
            <Text style={[styles.dropdownItemText, !showLabels && styles.dropdownItemTextInactive]}>
              Show Labels
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Add Spot Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddSpot')}
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
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
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
  controls: {
    position: 'absolute',
    top: 5,
    left: 55,
  },
  dropdownTrigger: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: SIZES.radius,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  dropdownTriggerText: {
    fontSize: SIZES.sm,
    color: COLORS.text,
    fontWeight: '600',
    flex: 1,
  },
  dropdownMenu: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    marginTop: 8,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dropdownItemText: {
    fontSize: SIZES.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
  dropdownItemTextInactive: {
    color: COLORS.textSecondary,
  },
  addButton: {
    position: 'absolute',
    bottom: 65,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.secondary,
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
