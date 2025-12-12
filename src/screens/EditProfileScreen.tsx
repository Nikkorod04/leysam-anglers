import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { COLORS, SIZES } from '../constants/theme';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, storage } from '../services/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { compressImage } from '../services/imageCompression';
import { validateDisplayName } from '../services/contentValidation';

export const EditProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const [canUpdate, setCanUpdate] = useState(true);
  const [daysUntilNextUpdate, setDaysUntilNextUpdate] = useState(0);

  // Check when user last updated their profile
  useEffect(() => {
    checkProfileUpdateTime();
  }, [user?.id]);

  const checkProfileUpdateTime = async () => {
    try {
      if (!user?.id) return;

      const userRef = doc(db, 'users', user.id);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists() && userDoc.data().lastProfileUpdateTime) {
        const lastUpdate = userDoc.data().lastProfileUpdateTime.toDate();
        setLastUpdateTime(lastUpdate);

        // Check if 30 days have passed
        const now = new Date();
        const diffTime = now.getTime() - lastUpdate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const daysUntilNextAllowed = 30 - diffDays;

        if (daysUntilNextAllowed > 0) {
          setCanUpdate(false);
          setDaysUntilNextUpdate(daysUntilNextAllowed);
        } else {
          setCanUpdate(true);
        }
      } else {
        // First time updating
        setCanUpdate(true);
      }
    } catch (error) {
      console.error('Error checking update time:', error);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to change your profile photo.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0]) {
        setUploadingPhoto(true);
        const imageUri = result.assets[0].uri;
        await uploadProfilePhoto(imageUri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const uploadProfilePhoto = async (uri: string) => {
    try {
      // Compress profile photo before uploading
      const compressedBlob = await compressImage(uri);
      
      const filename = `profile_${user?.id}_${Date.now()}.jpg`;
      const storageRef = ref(storage, `profilePhotos/${filename}`);
      
      await uploadBytes(storageRef, compressedBlob);
      const downloadURL = await getDownloadURL(storageRef);
      
      setPhotoURL(downloadURL);
      Alert.alert('Success', 'Profile photo uploaded successfully');
    } catch (error) {
      console.error('Error uploading photo:', error);
      Alert.alert('Error', 'Failed to upload profile photo');
    }
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Display name cannot be empty');
      return;
    }

    // Validate display name
    const nameValidation = validateDisplayName(displayName);
    if (!nameValidation.valid) {
      Alert.alert('Invalid Display Name', nameValidation.error);
      return;
    }

    // Check if user can update
    if (!canUpdate) {
      Alert.alert(
        'Update Limit Reached',
        `You can change your profile once every 30 days. Please try again in ${daysUntilNextUpdate} day${daysUntilNextUpdate !== 1 ? 's' : ''}.`,
        [{ text: 'OK' }]
      );
      return;
    }

    setLoading(true);
    try {
      if (!user?.id) {
        throw new Error('User not found');
      }

      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        displayName: displayName.trim(),
        photoURL: photoURL || null,
        lastProfileUpdateTime: new Date(),
      });

      Alert.alert('Success', 'Profile updated successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Update Restriction Notice */}
          {!canUpdate && (
            <View style={styles.warningNotice}>
              <View style={styles.warningHeader}>
                <Ionicons name="information-circle" size={24} color={COLORS.error} />
                <Text style={styles.warningTitle}>Profile Update Limited</Text>
              </View>
              <Text style={styles.warningText}>
                You can change your profile photo and display name once every 30 days.
              </Text>
              <Text style={styles.warningDays}>
                You can update again in {daysUntilNextUpdate} day{daysUntilNextUpdate !== 1 ? 's' : ''}
              </Text>
              {lastUpdateTime && (
                <Text style={styles.warningDate}>
                  Last updated: {lastUpdateTime.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
              )}
            </View>
          )}

          {/* Profile Photo Section */}
          <View style={styles.photoSection}>
            <Text style={styles.sectionTitle}>Profile Photo</Text>
            <View style={styles.photoContainer}>
              {photoURL ? (
                <Image 
                  source={{ uri: photoURL }} 
                  style={styles.avatar}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarText}>
                    {displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </View>
              )}
              <TouchableOpacity
                style={[styles.changePhotoButton, !canUpdate && styles.changePhotoButtonDisabled]}
                onPress={pickImage}
                disabled={uploadingPhoto || !canUpdate}
              >
                <Ionicons name="camera" size={20} color={COLORS.surface} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={pickImage} disabled={uploadingPhoto || !canUpdate}>
              <Text style={[styles.changePhotoText, !canUpdate && styles.changePhotoTextDisabled]}>
                {uploadingPhoto ? 'Uploading...' : !canUpdate ? 'Update Locked' : 'Change Profile Photo'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Account Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Information</Text>
            
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <View style={styles.labelWithIcon}>
                  <Ionicons name="person-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.inputLabel}>Display Name</Text>
                </View>
                <Text style={styles.charCount}>{displayName.length}/30</Text>
              </View>
              <Input
                placeholder="Enter your display name"
                value={displayName}
                onChangeText={setDisplayName}
                maxLength={30}
                style={[styles.input, !canUpdate && styles.inputDisabled]}
                editable={canUpdate}
              />
              {!canUpdate && (
                <Text style={styles.helperText}>Display name is locked until profile updates are allowed</Text>
              )}
              {canUpdate && (
                <Text style={styles.helperText}>3-30 characters</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Ionicons name="mail-outline" size={20} color={COLORS.primary} />
                <Text style={styles.inputLabel}>Email</Text>
              </View>
              <View style={styles.disabledInput}>
                <Text style={styles.disabledInputText}>{user?.email}</Text>
              </View>
              <Text style={styles.helperText}>Email cannot be changed</Text>
            </View>
          </View>

          {/* Account Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Details</Text>
            
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Ionicons name="shield-checkmark-outline" size={24} color={COLORS.primary} />
                <Text style={styles.statLabel}>Role</Text>
                <Text style={styles.statValue}>{user?.role || 'user'}</Text>
              </View>
              
              <View style={styles.statItem}>
                <Ionicons 
                  name={user?.isVerified ? "checkmark-circle" : "close-circle"} 
                  size={24} 
                  color={user?.isVerified ? COLORS.success : COLORS.error} 
                />
                <Text style={styles.statLabel}>Status</Text>
                <Text style={styles.statValue}>
                  {user?.isVerified ? 'Verified' : 'Not Verified'}
                </Text>
              </View>
            </View>
          </View>

          {/* Save Button */}
          <Button
            title={canUpdate ? "Save Changes" : "Profile Update Locked"}
            onPress={handleSave}
            loading={loading}
            disabled={!canUpdate}
            style={[styles.saveButton, !canUpdate && styles.saveButtonDisabled]}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: SIZES.padding * 2,
  },
  warningNotice: {
    backgroundColor: COLORS.error + '15',
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: SIZES.radius * 2,
    padding: SIZES.padding * 1.5,
    marginBottom: SIZES.margin * 2,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.margin,
    marginBottom: SIZES.margin,
  },
  warningTitle: {
    fontSize: SIZES.base,
    fontWeight: '700',
    color: COLORS.error,
    flex: 1,
  },
  warningText: {
    fontSize: SIZES.sm,
    color: COLORS.error,
    lineHeight: 20,
    marginBottom: SIZES.margin,
  },
  warningDays: {
    fontSize: SIZES.base,
    fontWeight: '700',
    color: COLORS.error,
    marginBottom: SIZES.margin / 2,
  },
  warningDate: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: SIZES.margin * 3,
    paddingVertical: SIZES.padding * 2,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius * 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SIZES.margin * 2,
  },
  photoContainer: {
    position: 'relative',
    marginBottom: SIZES.margin,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.border,
  },
  avatarPlaceholder: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: COLORS.surface,
    fontSize: 48,
    fontWeight: 'bold',
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.surface,
  },
  changePhotoButtonDisabled: {
    backgroundColor: COLORS.textSecondary,
    opacity: 0.5,
  },
  changePhotoText: {
    fontSize: SIZES.base,
    color: COLORS.primary,
    fontWeight: '600',
  },
  changePhotoTextDisabled: {
    color: COLORS.textSecondary,
  },
  section: {
    marginBottom: SIZES.margin * 3,
  },
  inputGroup: {
    marginBottom: SIZES.margin * 2,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SIZES.margin,
  },
  labelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputLabel: {
    fontSize: SIZES.base,
    fontWeight: '700',
    color: COLORS.text,
  },
  charCount: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius * 1.5,
  },
  inputDisabled: {
    backgroundColor: COLORS.backgroundLight,
    borderColor: COLORS.textSecondary,
    opacity: 0.6,
  },
  disabledInput: {
    backgroundColor: COLORS.backgroundLight,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius * 1.5,
    padding: SIZES.padding * 1.5,
  },
  disabledInputText: {
    fontSize: SIZES.base,
    color: COLORS.textSecondary,
  },
  helperText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SIZES.margin / 2,
    fontStyle: 'italic',
  },
  statRow: {
    flexDirection: 'row',
    gap: SIZES.margin * 2,
  },
  statItem: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SIZES.padding * 2,
    borderRadius: SIZES.radius * 1.5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statLabel: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SIZES.margin / 2,
    fontWeight: '600',
  },
  statValue: {
    fontSize: SIZES.base,
    color: COLORS.text,
    fontWeight: '700',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  saveButton: {
    marginTop: SIZES.margin * 2,
    height: 56,
    borderRadius: SIZES.radius * 2,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
});
