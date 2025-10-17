import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { uploadService, aiService } from '../../services/api';

const CameraScreen = ({ navigation, route }: any) => {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [isLoading, setIsLoading] = useState(true);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [photoType, setPhotoType] = useState<'FACE' | 'BODY'>('BODY');
  const cameraRef = useRef<CameraView>(null);

  // Get photo type from route params
  useEffect(() => {
    if (route?.params?.photoType) {
      setPhotoType(route.params.photoType);
    }
  }, [route?.params]);

  const checkPermissions = useCallback(async () => {
    try {
      setIsLoading(true);
      setPermissionError(null);
      setHasError(false);

      // Check if we already have permission
      if (permission?.granted) {
        setIsLoading(false);
        return;
      }

      // If permission is null, wait a bit and check again
      if (!permission) {
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
        return;
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Permission check error:', error);
      setPermissionError('Failed to check camera permissions');
      setHasError(true);
      setIsLoading(false);
    }
  }, [permission]);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  const handleRequestPermission = async () => {
    try {
      setIsLoading(true);
      setPermissionError(null);

      const result = await requestPermission();

      if (!result.granted) {
        setPermissionError('Camera permission was denied. Please enable it in your device settings.');
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Permission request error:', error);
      setPermissionError('Failed to request camera permission');
      setIsLoading(false);
    }
  };

  // Error state
  if (hasError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="warning-outline" size={80} color="#ef4444" />
          <Text style={styles.permissionTitle}>Camera Error</Text>
          <Text style={styles.permissionText}>
            There was an error accessing the camera. Please try the photo gallery instead.
          </Text>

          <TouchableOpacity
            style={styles.permissionButton}
            onPress={() => navigation.navigate('ImagePickerModal')}
          >
            <Text style={styles.permissionButtonText}>Use Photo Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <ActivityIndicator size="large" color="#ec4899" />
          <Text style={styles.permissionTitle}>Loading Camera...</Text>
          <Text style={styles.permissionText}>
            Checking camera permissions
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Permission not granted
  if (!permission?.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={80} color="#d1d5db" />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            We need access to your camera to take photos for style analysis
          </Text>

          {permissionError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{permissionError}</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.permissionButton}
            onPress={handleRequestPermission}
            disabled={isLoading}
          >
            <Text style={styles.permissionButtonText}>
              {isLoading ? 'Requesting...' : 'Grant Permission'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current && !isUploading) {
      try {
        setIsUploading(true);
        
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        
        if (photo?.uri) {
          console.log('Photo taken:', photo.uri);
          
          // Upload the photo
          const uploadResponse = await uploadService.uploadImage(photo.uri, photoType);
          const { url } = uploadResponse.data;
          
          console.log('Photo uploaded:', url);
          
          // If this is a body photo, trigger AI analysis
          if (photoType === 'BODY') {
            Alert.alert(
              'Photo Uploaded!',
              'Would you like to analyze this photo for style recommendations?',
              [
                { text: 'Not Now', onPress: () => navigation.goBack() },
                {
                  text: 'Analyze',
                  onPress: async () => {
                    try {
                      // Trigger AI analysis
                      const analysisResponse = await aiService.analyzePhotos([url], [url]);
                      
                      Alert.alert(
                        'Analysis Complete!',
                        `Body type detected: ${analysisResponse.data.results.bodyType}`,
                        [
                          { text: 'OK', onPress: () => navigation.goBack() },
                          {
                            text: 'Get Suggestions',
                            onPress: () => {
                              navigation.goBack();
                              navigation.navigate('Suggestions');
                            },
                          },
                        ]
                      );
                    } catch (analysisError) {
                      console.error('Analysis failed:', analysisError);
                      Alert.alert(
                        'Analysis Failed',
                        'Photo uploaded successfully, but analysis failed. You can try again later.',
                        [{ text: 'OK', onPress: () => navigation.goBack() }]
                      );
                    }
                  },
                },
              ]
            );
          } else {
            Alert.alert(
              'Success!',
              'Profile photo uploaded successfully!',
              [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
          }
        } else {
          Alert.alert('Error', 'Failed to capture photo');
        }
      } catch (error) {
        console.error('Error taking/uploading picture:', error);
        Alert.alert(
          'Error',
          'Failed to take or upload photo. Please try again.',
          [{ text: 'OK' }]
        );
      } finally {
        setIsUploading(false);
      }
    }
  };

  const toggleCameraType = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  // Render camera with error boundary
  try {
    return (
      <SafeAreaView style={styles.container}>
        <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
          <View style={styles.overlay}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Take Photo</Text>
              <TouchableOpacity style={styles.headerButton} onPress={toggleCameraType}>
                <Ionicons name="camera-reverse" size={24} color="white" />
              </TouchableOpacity>
            </View>

            {/* Instructions */}
            <View style={styles.instructions}>
              <Text style={styles.instructionText}>
                {photoType === 'FACE' 
                  ? 'Position your face in the frame for profile photo'
                  : 'Position your full body in the frame for style analysis'
                }
              </Text>
              <View style={styles.photoTypeBadge}>
                <Text style={styles.photoTypeText}>
                  {photoType === 'FACE' ? 'Face Photo' : 'Body Photo'}
                </Text>
              </View>
            </View>

            {/* Controls */}
            <View style={styles.controls}>
              {isUploading ? (
                <View style={styles.uploadingContainer}>
                  <ActivityIndicator size="large" color="white" />
                  <Text style={styles.uploadingText}>Uploading...</Text>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.captureButton} 
                  onPress={takePicture}
                  disabled={isUploading}
                >
                  <View style={styles.captureButtonInner} />
                </TouchableOpacity>
              )}
              
              {/* Photo type toggle */}
              <TouchableOpacity
                style={styles.photoTypeButton}
                onPress={() => setPhotoType(prev => prev === 'FACE' ? 'BODY' : 'FACE')}
                disabled={isUploading}
              >
                <Ionicons 
                  name={photoType === 'FACE' ? 'person' : 'body'} 
                  size={20} 
                  color="white" 
                />
                <Text style={styles.photoTypeButtonText}>
                  Switch to {photoType === 'FACE' ? 'Body' : 'Face'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      </SafeAreaView>
    );
  } catch (error) {
    console.error('Camera render error:', error);
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="warning-outline" size={80} color="#ef4444" />
          <Text style={styles.permissionTitle}>Camera Unavailable</Text>
          <Text style={styles.permissionText}>
            The camera is currently unavailable. Please try using the photo gallery instead.
          </Text>

          <TouchableOpacity
            style={styles.permissionButton}
            onPress={() => navigation.navigate('ImagePickerModal')}
          >
            <Text style={styles.permissionButtonText}>Use Photo Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  instructions: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  instructionText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  controls: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: '#f9fafb',
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 20,
    marginBottom: 12,
  },
  permissionText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  permissionButton: {
    backgroundColor: '#ec4899',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  photoTypeBadge: {
    backgroundColor: 'rgba(236, 72, 153, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8,
  },
  photoTypeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  uploadingContainer: {
    alignItems: 'center',
    gap: 12,
  },
  uploadingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  photoTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
    gap: 8,
  },
  photoTypeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default CameraScreen;