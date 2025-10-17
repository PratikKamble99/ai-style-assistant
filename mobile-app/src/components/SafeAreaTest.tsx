/**
 * Test component to verify safe area implementation
 * Shows visual indicators for safe area boundaries
 */

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, Platform } from 'react-native';
import { getStatusBarHeight, getSafeAreaInsets } from '../utils/safeArea';

const SafeAreaTest: React.FC = () => {
  const statusBarHeight = getStatusBarHeight();
  const safeAreaInsets = getSafeAreaInsets();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f0f0" />
      
      {/* Status bar indicator */}
      <View style={[styles.indicator, styles.statusBarIndicator, { height: statusBarHeight }]}>
        <Text style={styles.indicatorText}>Status Bar ({statusBarHeight}px)</Text>
      </View>
      
      {/* Safe area info */}
      <View style={styles.infoContainer}>
        <Text style={styles.title}>Safe Area Debug Info</Text>
        <Text style={styles.info}>Platform: {Platform.OS}</Text>
        <Text style={styles.info}>Status Bar Height: {statusBarHeight}px</Text>
        <Text style={styles.info}>Top Inset: {safeAreaInsets.top}px</Text>
        <Text style={styles.info}>Bottom Inset: {safeAreaInsets.bottom}px</Text>
        <Text style={styles.info}>Left Inset: {safeAreaInsets.left}px</Text>
        <Text style={styles.info}>Right Inset: {safeAreaInsets.right}px</Text>
      </View>
      
      {/* Content area */}
      <View style={styles.contentArea}>
        <Text style={styles.contentText}>
          This content should be visible and not hidden behind system UI
        </Text>
      </View>
      
      {/* Bottom safe area indicator */}
      {safeAreaInsets.bottom > 0 && (
        <View style={[styles.indicator, styles.bottomIndicator, { height: safeAreaInsets.bottom }]}>
          <Text style={styles.indicatorText}>Bottom Safe Area ({safeAreaInsets.bottom}px)</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  indicator: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  statusBarIndicator: {
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    borderColor: 'red',
  },
  bottomIndicator: {
    backgroundColor: 'rgba(0, 255, 0, 0.2)',
    borderColor: 'green',
  },
  indicatorText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  infoContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  info: {
    fontSize: 14,
    marginBottom: 4,
    color: '#666',
  },
  contentArea: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contentText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
    lineHeight: 24,
  },
});

export default SafeAreaTest;