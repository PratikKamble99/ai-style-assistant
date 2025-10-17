import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Main Screens
import HomeScreen from '../screens/main/HomeScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
// import SuggestionsScreen from '../screens/main/SuggestionsScreen';
import AISuggestionsScreen from '../screens/main/AISuggestionsScreen';
import FavoritesScreen from '../screens/main/FavoritesScreen';
import CameraScreen from '../screens/main/CameraScreen';
import CameraTabScreen from '../screens/main/CameraTabScreen';
import ImagePickerScreen from '../screens/main/ImagePickerScreen';
import SimpleCameraScreen from '../screens/main/SimpleCameraScreen';
import SuggestionDetailsScreen from '../screens/main/SuggestionDetailsScreen';
import ErrorBoundary from '../components/ErrorBoundary';

// Loading
import LoadingScreen from '../screens/LoadingScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Suggestions') {
            iconName = focused ? 'flash' : 'flash-outline';
          } else if (route.name === 'Camera') {
            iconName = focused ? 'camera' : 'camera-outline';
          } else if (route.name === 'Favorites') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'home-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#ec4899',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Suggestions" component={AISuggestionsScreen} />
      <Tab.Screen name="Camera" component={CameraTabScreen} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen 
            name="CameraModal" 
            options={{
              presentation: 'modal',
              gestureEnabled: true,
            }}
          >
            {(props) => (
              <ErrorBoundary>
                <CameraScreen {...props} />
              </ErrorBoundary>
            )}
          </Stack.Screen>
          <Stack.Screen 
            name="ImagePickerModal" 
            component={ImagePickerScreen}
            options={{
              presentation: 'modal',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen 
            name="SimpleCameraModal" 
            component={SimpleCameraScreen}
            options={{
              presentation: 'modal',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen 
            name="SuggestionDetails" 
            component={SuggestionDetailsScreen}
            options={{
              presentation: 'card',
              gestureEnabled: true,
            }}
          />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;