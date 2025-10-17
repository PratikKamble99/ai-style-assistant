/**
 * Safe Area utilities for handling device-specific spacing
 * Ensures content doesn't get hidden behind status bars, notches, or navigation bars
 */

import { Platform, StatusBar, Dimensions } from 'react-native';

export interface SafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

/**
 * Get safe area insets for the current device
 * This is a basic implementation - for production apps, consider using react-native-safe-area-context
 */
export const getSafeAreaInsets = (): SafeAreaInsets => {
  const { height } = Dimensions.get('window');
  
  // Basic safe area calculation
  let top = 0;
  let bottom = 0;
  
  if (Platform.OS === 'android') {
    // Android status bar height
    top = StatusBar.currentHeight || 0;
    
    // Android navigation bar (approximate)
    // This is a rough estimate - actual height varies by device
    if (height > 700) {
      bottom = 48; // Approximate navigation bar height for larger screens
    }
  } else if (Platform.OS === 'ios') {
    // iOS safe area (approximate values)
    // For production, use react-native-safe-area-context for accurate values
    
    // iPhone X and newer have notches/dynamic island
    if (height >= 812) {
      top = 44; // Status bar + notch area
      bottom = 34; // Home indicator area
    } else {
      top = 20; // Standard status bar
      bottom = 0;
    }
  }
  
  return {
    top,
    bottom,
    left: 0,
    right: 0,
  };
};

/**
 * Get status bar height for the current platform
 */
export const getStatusBarHeight = (): number => {
  if (Platform.OS === 'android') {
    return StatusBar.currentHeight || 0;
  } else if (Platform.OS === 'ios') {
    const { height } = Dimensions.get('window');
    // iPhone X and newer
    if (height >= 812) {
      return 44;
    }
    return 20;
  }
  return 0;
};

/**
 * Check if device has a notch or dynamic island
 */
export const hasNotch = (): boolean => {
  if (Platform.OS === 'ios') {
    const { height } = Dimensions.get('window');
    // iPhone X and newer have notches/dynamic island
    return height >= 812;
  }
  return false;
};

/**
 * Get appropriate padding for content to avoid system UI
 */
export const getContentPadding = () => {
  const insets = getSafeAreaInsets();
  
  return {
    paddingTop: insets.top,
    paddingBottom: insets.bottom,
    paddingLeft: insets.left,
    paddingRight: insets.right,
  };
};

/**
 * Safe area styles for common use cases
 */
export const safeAreaStyles = {
  // Full screen container with safe area
  safeContainer: {
    flex: 1,
    ...getContentPadding(),
  },
  
  // Header that respects status bar
  safeHeader: {
    paddingTop: getStatusBarHeight(),
  },
  
  // Content that avoids bottom safe area
  safeContent: {
    paddingBottom: getSafeAreaInsets().bottom,
  },
};

export default {
  getSafeAreaInsets,
  getStatusBarHeight,
  hasNotch,
  getContentPadding,
  safeAreaStyles,
};