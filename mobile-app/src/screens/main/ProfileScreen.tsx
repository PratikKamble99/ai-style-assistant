import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { userService, uploadService, aiService } from '../../services/api';
import * as ImagePicker from 'expo-image-picker';
import ConnectionTestScreen from '../ConnectionTestScreen';

interface UserPhoto {
  id: string;
  url: string;
  publicId: string;
  type: 'FACE' | 'BODY' | 'FULL_BODY';
  createdAt: string;
}

interface PhotoAnalysis {
  id: string;
  bodyType?: string;
  faceShape?: string;
  skinTone?: string;
  measurements?: any;
  confidence: number;
  createdAt: string;
}

const ProfileScreen = ({ navigation }: any) => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConnectionTest, setShowConnectionTest] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    height: '',
    weight: '',
    gender: 'PREFER_NOT_TO_SAY',
  });

  // Photo analysis state
  const [photos, setPhotos] = useState<UserPhoto[]>([]);
  const [photoAnalysis, setPhotoAnalysis] = useState<PhotoAnalysis | null>(null);
  const [analyzingPhotos, setAnalyzingPhotos] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      
      // Load profile data
      const profileResponse = await userService.getProfile();
      const userData = profileResponse.data.user;
      setProfile(userData);
      
      console.log('Profile loaded:', userData.name);
      console.log('Profile response structure:', Object.keys(profileResponse.data));
      
      // Try to load photos from profile first
      if (userData.photos && Array.isArray(userData.photos)) {
        const userPhotos: UserPhoto[] = userData.photos.map((photo: any) => ({
          id: photo.id,
          url: photo.url,
          publicId: photo.publicId,
          type: photo.type,
          createdAt: photo.createdAt
        }));
        setPhotos(userPhotos);
        console.log('✅ Loaded photos from profile:', userPhotos.length);
      } else {
        // Try separate photos endpoint
        console.log('📸 No photos in profile, trying separate endpoint...');
        try {
          const photosResponse = await userService.getPhotos();
          console.log('Photos response:', photosResponse.data);
          
          if (photosResponse.data && Array.isArray(photosResponse.data)) {
            const userPhotos: UserPhoto[] = photosResponse.data.map((photo: any) => ({
              id: photo.id,
              url: photo.url,
              publicId: photo.publicId,
              type: photo.type,
              createdAt: photo.createdAt
            }));
            setPhotos(userPhotos);
            console.log('✅ Loaded photos from separate endpoint:', userPhotos.length);
          } else {
            console.log('❌ No photos found');
            setPhotos([]);
          }
        } catch (photosError) {
          console.error('Failed to load photos:', photosError);
          setPhotos([]);
        }
      }
      
      // Initialize edit form with current data
      setEditForm({
        name: userData.name || '',
        height: userData.profile?.height?.toString() || '',
        weight: userData.profile?.weight?.toString() || '',
        gender: userData.profile?.gender || 'PREFER_NOT_TO_SAY',
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const profileData = {
        ...editForm,
        height: editForm.height ? parseFloat(editForm.height) : undefined,
        weight: editForm.weight ? parseFloat(editForm.weight) : undefined,
      };

      await userService.updateProfile(profileData);
      setShowEditModal(false);
      loadProfile(); // Refresh profile data
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleUploadPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uploadResponse = await uploadService.uploadImage(result.assets[0].uri);
        const { url, publicId } = uploadResponse.data;
        
        await userService.addPhoto(url, publicId, 'FACE');
        loadProfile(); // Refresh to show new photo
        Alert.alert('Success', 'Profile photo updated!');
      }
    } catch (error) {
      console.error('Failed to upload photo:', error);
      Alert.alert('Error', 'Failed to upload photo');
    }
  };

  // Photo Analysis Functions (like web version)
  const showPhotoOptions = (photoType: 'FACE' | 'FULL_BODY' = 'FACE') => {
    Alert.alert(
      'Add Photo',
      `Select how you want to add a ${photoType.toLowerCase()} photo for analysis:`,
      [
        { text: 'Camera', onPress: () => takePhoto(photoType) },
        { text: 'Gallery', onPress: () => selectFromGallery(photoType) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const takePhoto = async (photoType: 'FACE' | 'FULL_BODY') => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is required to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: photoType === 'FACE' ? [1, 1] : [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadAndAddPhoto(result.assets[0].uri, photoType);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const selectFromGallery = async (photoType: 'FACE' | 'FULL_BODY') => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Gallery permission is required to select photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: photoType === 'FACE' ? [1, 1] : [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadAndAddPhoto(result.assets[0].uri, photoType);
      }
    } catch (error) {
      console.error('Error selecting photo:', error);
      Alert.alert('Error', 'Failed to select photo. Please try again.');
    }
  };

  const uploadAndAddPhoto = async (uri: string, photoType: 'FACE' | 'FULL_BODY') => {
    try {
      setUploadingPhoto(true);

      const uploadResponse = await uploadService.uploadImage(uri, photoType);
      const { url, publicId } = uploadResponse.data;

      await userService.addPhoto(url, publicId, photoType);
      
      // Add to local photos state
      const newPhoto: UserPhoto = {
        id: Date.now().toString(), // Temporary ID
        url,
        publicId,
        type: photoType,
        createdAt: new Date().toISOString()
      };
      
      setPhotos(prev => [...prev, newPhoto]);
      loadProfile(); // Refresh profile

      Alert.alert('Success', `${photoType.toLowerCase()} photo added successfully!`);
    } catch (error) {
      console.error('Failed to upload photo:', error);
      Alert.alert('Error', 'Failed to upload photo. Please try again.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const removePhoto = async (photoId: string) => {
    try {
      await userService.removePhoto(photoId);
      setPhotos(prev => prev.filter(p => p.id !== photoId));
      Alert.alert('Success', 'Photo removed successfully!');
    } catch (error) {
      console.error('Failed to remove photo:', error);
      Alert.alert('Error', 'Failed to remove photo. Please try again.');
    }
  };

  const refreshPhotos = async () => {
    console.log('🔄 Refreshing photos...');
    await loadProfile();
  };

  const analyzeAllPhotos = async () => {
    if (photos.length === 0) {
      Alert.alert('No Photos', 'Please add some photos before analyzing.');
      return;
    }

    try {
      setAnalyzingPhotos(true);

      const facePhotos = photos.filter(p => p.type === 'FACE').map(p => p.url);
      const bodyPhotos = photos.filter(p => p.type === 'FULL_BODY').map(p => p.url);

      console.log('📊 Analyzing photos:', { 
        facePhotos: facePhotos.length, 
        bodyPhotos: bodyPhotos.length 
      });

      // Use the analyzePhotos API that takes multiple photos
      const response = await aiService.analyzePhotos(facePhotos, bodyPhotos, 
        editForm.height ? parseFloat(editForm.height) : undefined);
      
      setPhotoAnalysis(response.data);
      console.log('✅ Analysis complete:', response.data);

      Alert.alert(
        'Analysis Complete!',
        'Your photos have been analyzed successfully. Check the results below.',
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.error('Failed to analyze photos:', error);
      Alert.alert(
        'Analysis Failed',
        'Failed to analyze your photos. Please check your internet connection and try again.'
      );
    } finally {
      setAnalyzingPhotos(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  const profileOptions = [
    {
      title: 'Edit Profile',
      subtitle: 'Update your personal information',
      icon: 'person-outline',
      onPress: () => setShowEditModal(true),
    },
    {
      title: 'Upload Photos',
      subtitle: 'Add photos for AI analysis',
      icon: 'camera-outline',
      onPress: () => navigation.navigate('CameraModal'),
    },
    {
      title: 'View Favorites',
      subtitle: 'Your saved looks and items',
      icon: 'heart-outline',
      onPress: () => navigation.navigate('Favorites'),
    },
    {
      title: 'Suggestion History',
      subtitle: 'View past AI recommendations',
      icon: 'time-outline',
      onPress: () => navigation.navigate('Suggestions'),
    },
    {
      title: 'Connection Test',
      subtitle: 'Test backend connection',
      icon: 'wifi-outline',
      onPress: () => setShowConnectionTest(true),
    },
    {
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      icon: 'help-circle-outline',
      onPress: () => Alert.alert('Help', 'Contact support at support@aistylist.com'),
    },
  ];

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#ec4899" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.avatarContainer}
          onPress={handleUploadPhoto}
        >
          {profile?.photos?.find((p: any) => p.type === 'FACE')?.url ? (
            <Image
              source={{ uri: profile.photos.find((p: any) => p.type === 'FACE').url }}
              style={styles.avatarImage}
            />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          )}
          <View style={styles.cameraIcon}>
            <Ionicons name="camera" size={16} color="white" />
          </View>
        </TouchableOpacity>
        <Text style={styles.userName}>{profile?.name || user?.name || 'User'}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        
        {/* Profile Stats */}
        <View style={styles.profileStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile?.photos?.length || 0}</Text>
            <Text style={styles.statLabel}>Photos</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {profile?.profile?.bodyType || 'Not set'}
            </Text>
            <Text style={styles.statLabel}>Body Type</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {profile?.profile?.skinTone || 'Not set'}
            </Text>
            <Text style={styles.statLabel}>Skin Tone</Text>
          </View>
        </View>
      </View>

      {/* Photo Analysis Section - Like Web Version */}
      <View style={styles.photoAnalysisContainer}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Photo Analysis</Text>
            <Text style={styles.sectionSubtitle}>
              Upload photos to get AI-powered analysis and improve your style recommendations
            </Text>
          </View>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={refreshPhotos}
          >
            <Ionicons name="refresh" size={20} color="#ec4899" />
          </TouchableOpacity>
        </View>

        {/* Debug Info */}
        {__DEV__ && (
          <View style={styles.debugInfo}>
            <Text style={styles.debugText}>Debug: {photos.length} photos loaded</Text>
            <Text style={styles.debugText}>
              Face: {photos.filter(p => p.type === 'FACE').length}, 
              Body: {photos.filter(p => p.type === 'FULL_BODY').length}
            </Text>
          </View>
        )}

        {/* Face Photos Section */}
        <View style={styles.photoSection}>
          <View style={styles.photoSectionHeader}>
            <Text style={styles.photoSectionTitle}>Face Photos</Text>
            <Text style={styles.photoSectionDescription}>For face shape and skin tone analysis</Text>
          </View>
          
          <View style={styles.photoGrid}>
            {photos.filter(p => p.type === 'FACE').map((photo) => (
              <View key={photo.id} style={styles.photoItem}>
                <Image source={{ uri: photo.url }} style={styles.photoThumbnail} />
                <TouchableOpacity 
                  style={styles.removePhotoButton}
                  onPress={() => removePhoto(photo.id)}
                >
                  <Ionicons name="close" size={12} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
            
            {photos.filter(p => p.type === 'FACE').length < 3 && (
              <TouchableOpacity
                style={styles.addPhotoItem}
                onPress={() => showPhotoOptions('FACE')}
                disabled={uploadingPhoto}
              >
                {uploadingPhoto ? (
                  <ActivityIndicator size="small" color="#ec4899" />
                ) : (
                  <>
                    <Ionicons name="camera" size={20} color="#ec4899" />
                    <Text style={styles.addPhotoLabel}>Add Face Photo</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Full Body Photos Section */}
        <View style={styles.photoSection}>
          <View style={styles.photoSectionHeader}>
            <Text style={styles.photoSectionTitle}>Full Body Photos</Text>
            <Text style={styles.photoSectionDescription}>For body type and measurements analysis</Text>
          </View>
          
          <View style={styles.photoGrid}>
            {photos.filter(p => p.type === 'FULL_BODY').map((photo) => (
              <View key={photo.id} style={styles.photoItem}>
                <Image source={{ uri: photo.url }} style={styles.photoThumbnail} />
                <TouchableOpacity 
                  style={styles.removePhotoButton}
                  onPress={() => removePhoto(photo.id)}
                >
                  <Ionicons name="close" size={12} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
            
            {photos.filter(p => p.type === 'FULL_BODY').length < 6 && (
              <TouchableOpacity
                style={styles.addPhotoItem}
                onPress={() => showPhotoOptions('FULL_BODY')}
                disabled={uploadingPhoto}
              >
                {uploadingPhoto ? (
                  <ActivityIndicator size="small" color="#ec4899" />
                ) : (
                  <>
                    <Ionicons name="camera" size={20} color="#ec4899" />
                    <Text style={styles.addPhotoLabel}>Add Body Photo</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Analysis Button and Results */}
        {photos.length > 0 && (
          <View style={styles.analysisSection}>
            <TouchableOpacity
              style={[styles.analyzeButton, (analyzingPhotos || photos.length === 0) && styles.analyzeButtonDisabled]}
              onPress={analyzeAllPhotos}
              disabled={analyzingPhotos || photos.length === 0}
            >
              {analyzingPhotos ? (
                <>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.analyzeButtonText}>Analyzing...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="sparkles" size={20} color="#fff" />
                  <Text style={styles.analyzeButtonText}>Analyze Photos</Text>
                </>
              )}
            </TouchableOpacity>

            {photoAnalysis && (
              <View style={styles.analysisResults}>
                <Text style={styles.resultsTitle}>Analysis Results</Text>
                <View style={styles.resultGrid}>
                  <View style={styles.resultItem}>
                    <Text style={styles.resultLabel}>Body Type</Text>
                    <Text style={styles.resultValue}>{photoAnalysis.bodyType || 'Not detected'}</Text>
                  </View>
                  <View style={styles.resultItem}>
                    <Text style={styles.resultLabel}>Face Shape</Text>
                    <Text style={styles.resultValue}>{photoAnalysis.faceShape || 'Not detected'}</Text>
                  </View>
                  <View style={styles.resultItem}>
                    <Text style={styles.resultLabel}>Skin Tone</Text>
                    <Text style={styles.resultValue}>{photoAnalysis.skinTone || 'Not detected'}</Text>
                  </View>
                  <View style={styles.resultItem}>
                    <Text style={styles.resultLabel}>Confidence</Text>
                    <Text style={styles.resultValue}>{Math.round(photoAnalysis.confidence * 100)}%</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Profile Options */}
      <View style={styles.optionsContainer}>
        {profileOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.optionItem}
            onPress={option.onPress}
          >
            <View style={styles.optionIcon}>
              <Ionicons name={option.icon as any} size={24} color="#ec4899" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>{option.title}</Text>
              <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Button */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* App Info */}
      <View style={styles.appInfo}>
        <Text style={styles.appInfoText}>AI Stylist v1.0.0</Text>
        <Text style={styles.appInfoText}>Made with ❤️ for fashion enthusiasts</Text>
      </View>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={handleSaveProfile}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Name</Text>
              <TextInput
                style={styles.formInput}
                value={editForm.name}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, name: text }))}
                placeholder="Enter your name"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Height (cm)</Text>
              <TextInput
                style={styles.formInput}
                value={editForm.height}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, height: text }))}
                placeholder="Enter your height"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Weight (kg)</Text>
              <TextInput
                style={styles.formInput}
                value={editForm.weight}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, weight: text }))}
                placeholder="Enter your weight"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Gender</Text>
              <View style={styles.optionButtons}>
                {['MALE', 'FEMALE', 'PREFER_NOT_TO_SAY'].map((gender) => (
                  <TouchableOpacity
                    key={gender}
                    style={[
                      styles.optionButton,
                      editForm.gender === gender && styles.optionButtonSelected
                    ]}
                    onPress={() => setEditForm(prev => ({ ...prev, gender }))}
                  >
                    <Text style={[
                      styles.optionButtonText,
                      editForm.gender === gender && styles.optionButtonTextSelected
                    ]}>
                      {gender.replace('_', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>


          </ScrollView>
        </View>
      </Modal>

      {/* Connection Test Modal */}
      <Modal
        visible={showConnectionTest}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalHeader}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowConnectionTest(false)}
          >
            <Ionicons name="close" size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>
        <ConnectionTestScreen />
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: 'white',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ec4899',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#6b7280',
  },
  optionsContainer: {
    backgroundColor: 'white',
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fce7f3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  logoutContainer: {
    marginTop: 30,
    marginHorizontal: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
    marginLeft: 8,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  appInfoText: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ec4899',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalCancel: {
    fontSize: 16,
    color: '#6b7280',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalSave: {
    fontSize: 16,
    color: '#ec4899',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  optionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: 'white',
  },
  optionButtonSelected: {
    backgroundColor: '#ec4899',
    borderColor: '#ec4899',
  },
  optionButtonText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  optionButtonTextSelected: {
    color: 'white',
  },
  closeButton: {
    padding: 8,
  },
  // Photo Analysis Styles (like web version)
  photoAnalysisContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#fdf2f8',
  },
  debugInfo: {
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderRadius: 4,
    marginBottom: 16,
  },
  debugText: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'monospace',
  },
  photoSection: {
    marginBottom: 20,
  },
  photoSectionHeader: {
    marginBottom: 12,
  },
  photoSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  photoSectionDescription: {
    fontSize: 12,
    color: '#666',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoItem: {
    position: 'relative',
    width: 70,
    height: 70,
  },
  photoThumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoItem: {
    width: 70,
    height: 70,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ec4899',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fdf2f8',
  },
  addPhotoLabel: {
    fontSize: 9,
    color: '#ec4899',
    textAlign: 'center',
    marginTop: 2,
  },
  analysisSection: {
    marginTop: 16,
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ec4899',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 16,
  },
  analyzeButtonDisabled: {
    backgroundColor: '#ccc',
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  analysisResults: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  resultGrid: {
    gap: 8,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 6,
  },
  resultLabel: {
    fontSize: 14,
    color: '#666',
  },
  resultValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
});

export default ProfileScreen;