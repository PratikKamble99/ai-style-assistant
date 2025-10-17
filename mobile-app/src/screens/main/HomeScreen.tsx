import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { connectionService, aiService, userService } from '../../services/api';
import ConnectionTestScreen from '../ConnectionTestScreen';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [showConnectionTest, setShowConnectionTest] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      await connectionService.checkHealth();
      setConnectionStatus('connected');
    } catch (error) {
      console.error('Connection check failed:', error);
      setConnectionStatus('disconnected');
    }
  };

  const quickActions = [
    {
      title: 'Get Style Suggestions',
      subtitle: 'AI-powered recommendations',
      icon: 'flash',
      color: ['#ec4899', '#f472b6'],
      onPress: () => navigation.navigate('Suggestions'),
    },
    {
      title: 'Take Photo',
      subtitle: 'Analyze your style',
      icon: 'camera',
      color: ['#8b5cf6', '#a78bfa'],
      onPress: () => navigation.navigate('CameraModal'),
    },
    {
      title: 'View Favorites',
      subtitle: 'Your saved looks',
      icon: 'heart',
      color: ['#06b6d4', '#67e8f9'],
      onPress: () => navigation.navigate('Favorites'),
    },
  ];

  const [stats, setStats] = useState([
    { label: 'Suggestions', value: '0', icon: 'flash' },
    { label: 'Favorites', value: '0', icon: 'heart' },
    { label: 'Photos', value: '0', icon: 'camera' },
  ]);

  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    try {
      const [suggestionsRes, favoritesRes, profileRes] = await Promise.allSettled([
        aiService.getSuggestionHistory(1, 1),
        userService.getFavorites(),
        userService.getProfile(),
      ]);

      const suggestionsCount = suggestionsRes.status === 'fulfilled' 
        ? suggestionsRes.value.data.pagination?.total || 0 
        : 0;
      
      const favoritesCount = favoritesRes.status === 'fulfilled' 
        ? favoritesRes.value.data.favorites?.length || 0 
        : 0;
      
      const photosCount = profileRes.status === 'fulfilled' 
        ? profileRes.value.data.user?.photos?.length || 0 
        : 0;

      setStats([
        { label: 'Suggestions', value: suggestionsCount.toString(), icon: 'flash' },
        { label: 'Favorites', value: favoritesCount.toString(), icon: 'heart' },
        { label: 'Photos', value: photosCount.toString(), icon: 'camera' },
      ]);
    } catch (error) {
      console.error('Failed to load user stats:', error);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={['#ec4899', '#f472b6']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name}! ✨</Text>
          <Text style={styles.subtitle}>
            Ready to discover your perfect style?
          </Text>
        </View>
      </LinearGradient>

      {/* Stats */}
      <View style={styles.statsContainer}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name={stat.icon as any} size={24} color="#ec4899" />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        {quickActions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={styles.actionCard}
            onPress={action.onPress}
          >
            <LinearGradient
              colors={action.color}
              style={styles.actionGradient}
            >
              <View style={styles.actionContent}>
                <View style={styles.actionText}>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                </View>
                <Ionicons name={action.icon as any} size={28} color="white" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityCard}>
          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Ionicons name="flash" size={20} color="#ec4899" />
            </View>
            <View style={styles.activityText}>
              <Text style={styles.activityTitle}>Office Meeting Look</Text>
              <Text style={styles.activityTime}>2 hours ago</Text>
            </View>
            <View style={styles.activityRating}>
              <Ionicons name="star" size={16} color="#fbbf24" />
              <Text style={styles.ratingText}>4.8</Text>
            </View>
          </View>
          
          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Ionicons name="heart" size={20} color="#f472b6" />
            </View>
            <View style={styles.activityText}>
              <Text style={styles.activityTitle}>Added to Favorites</Text>
              <Text style={styles.activityTime}>1 day ago</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Connection Status */}
      <View style={styles.section}>
        <TouchableOpacity 
          style={[
            styles.connectionCard,
            connectionStatus === 'connected' ? styles.connectedCard : 
            connectionStatus === 'disconnected' ? styles.disconnectedCard : styles.checkingCard
          ]}
          onPress={() => setShowConnectionTest(true)}
        >
          <View style={styles.connectionIcon}>
            <Ionicons 
              name={
                connectionStatus === 'connected' ? 'wifi' :
                connectionStatus === 'disconnected' ? 'wifi-outline' : 'sync'
              } 
              size={24} 
              color={
                connectionStatus === 'connected' ? '#10b981' :
                connectionStatus === 'disconnected' ? '#ef4444' : '#f59e0b'
              } 
            />
          </View>
          <View style={styles.connectionText}>
            <Text style={styles.connectionTitle}>
              Backend Connection
            </Text>
            <Text style={styles.connectionSubtitle}>
              {connectionStatus === 'connected' ? 'Connected to backend' :
               connectionStatus === 'disconnected' ? 'Connection failed - Tap to test' :
               'Checking connection...'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      {/* Profile Completion */}
      {!user?.profile?.bodyType && (
        <View style={styles.section}>
          <View style={styles.completionCard}>
            <View style={styles.completionIcon}>
              <Ionicons name="camera" size={24} color="#f59e0b" />
            </View>
            <View style={styles.completionText}>
              <Text style={styles.completionTitle}>
                Complete Your Profile
              </Text>
              <Text style={styles.completionSubtitle}>
                Upload photos for better AI recommendations
              </Text>
            </View>
            <TouchableOpacity
              style={styles.completionButton}
              onPress={() => navigation.navigate('Profile')}
            >
              <Text style={styles.completionButtonText}>Complete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

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
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: 'center',
  },
  greeting: {
    fontSize: 18,
    color: 'white',
    opacity: 0.9,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginTop: -20,
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    minWidth: (width - 80) / 3,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fce7f3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  actionCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionGradient: {
    padding: 20,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  activityCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityText: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  activityTime: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  activityRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  completionCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  completionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fbbf24',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  completionText: {
    flex: 1,
  },
  completionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
  },
  completionSubtitle: {
    fontSize: 14,
    color: '#b45309',
    marginTop: 2,
  },
  completionButton: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  completionButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  connectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  connectedCard: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  disconnectedCard: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  checkingCard: {
    backgroundColor: '#fef3c7',
    borderColor: '#fde68a',
  },
  connectionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  connectionText: {
    flex: 1,
  },
  connectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  connectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    paddingTop: 60,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  closeButton: {
    padding: 8,
  },
});

export default HomeScreen;