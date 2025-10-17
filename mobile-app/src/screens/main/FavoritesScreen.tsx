import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { userService } from '../../services/api';

// const { width: screenWidth } = Dimensions.get('window');

const FavoritesScreen = ({ navigation }: any) => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const response = await userService.getFavorites();
      setFavorites(response.data.favorites || []);
    } catch (error) {
      console.error('Failed to load favorites:', error);
      Alert.alert('Error', 'Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (favoriteId: string) => {
    Alert.alert(
      'Remove Favorite',
      'Are you sure you want to remove this item from favorites?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await userService.removeFavorite(favoriteId);
              setFavorites(prev => prev.filter(f => f.id !== favoriteId));
              Alert.alert('Success', 'Removed from favorites');
            } catch (error) {
              console.error('Failed to remove favorite:', error);
              Alert.alert('Error', 'Failed to remove favorite');
            }
          },
        },
      ]
    );
  };

  const renderFavoriteItem = (favorite: any) => {
    const metadata = favorite.metadata ? JSON.parse(favorite.metadata) : {};
    
    return (
      <TouchableOpacity
        key={favorite.id}
        style={styles.favoriteCard}
        onPress={() => {
          if (favorite.type === 'SUGGESTION') {
            // Navigate to suggestion details if available
            navigation.navigate('SuggestionDetails', { 
              suggestion: { 
                id: favorite.itemId,
                ...metadata,
                outfitDesc: favorite.description,
                outfitImageUrl: favorite.imageUrl,
              }
            });
          }
        }}
      >
        {favorite.imageUrl && (
          <Image
            source={{ uri: favorite.imageUrl }}
            style={styles.favoriteImage}
            resizeMode="cover"
          />
        )}
        
        <View style={styles.favoriteContent}>
          <View style={styles.favoriteHeader}>
            <Text style={styles.favoriteTitle} numberOfLines={2}>
              {favorite.title}
            </Text>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeFavorite(favorite.id)}
            >
              <Ionicons name="heart" size={20} color="#ec4899" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.favoriteDescription} numberOfLines={3}>
            {favorite.description}
          </Text>
          
          <View style={styles.favoriteMeta}>
            <View style={styles.favoriteType}>
              <Ionicons 
                name={favorite.type === 'SUGGESTION' ? 'flash' : 'shirt'} 
                size={14} 
                color="#6b7280" 
              />
              <Text style={styles.favoriteTypeText}>
                {favorite.type === 'SUGGESTION' ? 'Style Suggestion' : 'Product'}
              </Text>
            </View>
            
            <Text style={styles.favoriteDate}>
              {new Date(favorite.createdAt).toLocaleDateString()}
            </Text>
          </View>
          
          {metadata.occasion && (
            <View style={styles.occasionBadge}>
              <Text style={styles.occasionText}>{metadata.occasion}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#f472b6', '#ec4899']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Ionicons name="heart" size={32} color="white" />
          <Text style={styles.headerTitle}>Your Favorites</Text>
          <Text style={styles.headerSubtitle}>
            {loading ? 'Loading...' : `${favorites.length} items saved for later`}
          </Text>
        </View>
      </LinearGradient>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ec4899" />
          <Text style={styles.loadingText}>Loading favorites...</Text>
        </View>
      ) : favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={80} color="#d1d5db" />
            <Text style={styles.emptyStateTitle}>No favorites yet</Text>
            <Text style={styles.emptyStateSubtitle}>
              Start adding items to your favorites from style suggestions!
            </Text>
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => navigation.navigate('Suggestions')}
            >
              <Text style={styles.exploreButtonText}>Explore Suggestions</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.favoritesContainer}>
          {favorites.map(renderFavoriteItem)}
        </View>
      )}
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
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 12,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 20,
    marginBottom: 12,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
  },
  exploreButton: {
    backgroundColor: '#ec4899',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  exploreButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  favoritesContainer: {
    padding: 20,
    gap: 16,
  },
  favoriteCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  favoriteImage: {
    width: '100%',
    height: 200,
  },
  favoriteContent: {
    padding: 16,
  },
  favoriteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  favoriteTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginRight: 12,
  },
  removeButton: {
    padding: 4,
  },
  favoriteDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  favoriteMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  favoriteType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  favoriteTypeText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  favoriteDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  occasionBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#ec4899',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  occasionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default FavoritesScreen;