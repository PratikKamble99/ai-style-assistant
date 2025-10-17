import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { trendingService } from '../../services/api';

interface TrendingOutfit {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  occasion: string;
  season: string;
  trendingScore: number;
  viewCount: number;
  likeCount: number;
  shareCount: number;
  tags: string[];
  colors: string[];
  priceRange: string;
  isFeatured: boolean;
  items: TrendingOutfitItem[];
}

interface TrendingOutfitItem {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  imageUrl: string;
  productUrl: string;
  description?: string;
  fitAdvice?: string;
  stylingTip?: string;
}

const TrendingScreen: React.FC = ({ navigation }: any) => {
  const [trendingOutfits, setTrendingOutfits] = useState<TrendingOutfit[]>([]);
  const [featuredOutfits, setFeaturedOutfits] = useState<TrendingOutfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [likedOutfits, setLikedOutfits] = useState<Set<string>>(new Set());

  const categories = [
    { id: 'all', label: 'All', icon: 'grid-outline' },
    { id: 'Streetwear', label: 'Street', icon: 'walk-outline' },
    { id: 'Business Casual', label: 'Work', icon: 'briefcase-outline' },
    { id: 'Evening Wear', label: 'Party', icon: 'wine-outline' },
    { id: 'Athleisure', label: 'Sport', icon: 'fitness-outline' },
    { id: 'Minimalist', label: 'Minimal', icon: 'remove-outline' },
  ];

  useEffect(() => {
    loadTrendingOutfits();
  }, [selectedCategory]);

  const loadTrendingOutfits = async () => {
    try {
      setLoading(true);

      // Load featured outfits (only for 'all' category)
      if (selectedCategory === 'all') {
        const featuredResponse = await trendingService.getFeatured(5);
        setFeaturedOutfits(featuredResponse.data.data.outfits);
      }

      // Load trending outfits
      let trendingResponse;
      if (selectedCategory === 'all') {
        trendingResponse = await trendingService.getTrending(20, 0);
      } else {
        trendingResponse = await trendingService.getByCategory(selectedCategory, 20, 0);
      }

      setTrendingOutfits(trendingResponse.data.data.outfits);
    } catch (error) {
      console.error('❌ Failed to load trending outfits:', error);
      Alert.alert('Error', 'Failed to load trending outfits. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTrendingOutfits();
    setRefreshing(false);
  };

  const handleLikeOutfit = async (outfitId: string) => {
    try {
      await trendingService.toggleLike(outfitId);
      
      // Update local state
      const newLikedOutfits = new Set(likedOutfits);
      if (likedOutfits.has(outfitId)) {
        newLikedOutfits.delete(outfitId);
      } else {
        newLikedOutfits.add(outfitId);
      }
      setLikedOutfits(newLikedOutfits);

      // Update outfit like count
      setTrendingOutfits(prev => 
        prev.map(outfit => 
          outfit.id === outfitId 
            ? { 
                ...outfit, 
                likeCount: likedOutfits.has(outfitId) 
                  ? outfit.likeCount - 1 
                  : outfit.likeCount + 1 
              }
            : outfit
        )
      );
    } catch (error) {
      console.error('❌ Failed to like outfit:', error);
      Alert.alert('Error', 'Failed to update like. Please try again.');
    }
  };

  const handleShareOutfit = async (outfit: TrendingOutfit) => {
    try {
      await trendingService.share(outfit.id);
      
      // Update share count
      setTrendingOutfits(prev => 
        prev.map(o => 
          o.id === outfit.id 
            ? { ...o, shareCount: o.shareCount + 1 }
            : o
        )
      );

      Alert.alert('Shared!', 'Outfit shared successfully');
    } catch (error) {
      console.error('❌ Failed to share outfit:', error);
      Alert.alert('Error', 'Failed to share outfit. Please try again.');
    }
  };

  const viewOutfitDetails = (outfit: TrendingOutfit) => {
    navigation.navigate('TrendingOutfitDetails', { outfit });
  };

  const renderFeaturedOutfit = (outfit: TrendingOutfit) => (
    <TouchableOpacity
      key={outfit.id}
      style={styles.featuredCard}
      onPress={() => viewOutfitDetails(outfit)}
    >
      <Image source={{ uri: outfit.imageUrl }} style={styles.featuredImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.featuredGradient}
      >
        <View style={styles.featuredBadge}>
          <Ionicons name="star" size={12} color="#FFD700" />
          <Text style={styles.featuredBadgeText}>Featured</Text>
        </View>
        <Text style={styles.featuredTitle}>{outfit.title}</Text>
        <Text style={styles.featuredCategory}>{outfit.category}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderTrendingOutfit = (outfit: TrendingOutfit) => (
    <View key={outfit.id} style={styles.outfitCard}>
      <TouchableOpacity onPress={() => viewOutfitDetails(outfit)}>
        <Image source={{ uri: outfit.imageUrl }} style={styles.outfitImage} />
      </TouchableOpacity>

      <View style={styles.outfitContent}>
        <View style={styles.outfitHeader}>
          <Text style={styles.outfitTitle}>{outfit.title}</Text>
          <View style={styles.trendingScore}>
            <Ionicons name="trending-up" size={14} color="#ec4899" />
            <Text style={styles.trendingScoreText}>
              {Math.round(outfit.trendingScore)}
            </Text>
          </View>
        </View>

        <Text style={styles.outfitDescription} numberOfLines={2}>
          {outfit.description}
        </Text>

        <View style={styles.outfitTags}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{outfit.category}</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{outfit.occasion.toLowerCase()}</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{outfit.priceRange.toLowerCase().replace('_', ' ')}</Text>
          </View>
        </View>

        <View style={styles.outfitStats}>
          <View style={styles.stat}>
            <Ionicons name="eye-outline" size={16} color="#666" />
            <Text style={styles.statText}>{outfit.viewCount}</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="heart-outline" size={16} color="#666" />
            <Text style={styles.statText}>{outfit.likeCount}</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="share-outline" size={16} color="#666" />
            <Text style={styles.statText}>{outfit.shareCount}</Text>
          </View>
        </View>

        <View style={styles.outfitActions}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              likedOutfits.has(outfit.id) && styles.actionButtonLiked
            ]}
            onPress={() => handleLikeOutfit(outfit.id)}
          >
            <Ionicons
              name={likedOutfits.has(outfit.id) ? 'heart' : 'heart-outline'}
              size={18}
              color={likedOutfits.has(outfit.id) ? '#fff' : '#ec4899'}
            />
            <Text style={[
              styles.actionButtonText,
              likedOutfits.has(outfit.id) && styles.actionButtonTextLiked
            ]}>
              {likedOutfits.has(outfit.id) ? 'Liked' : 'Like'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleShareOutfit(outfit)}
          >
            <Ionicons name="share-outline" size={18} color="#666" />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.primaryActionButton]}
            onPress={() => viewOutfitDetails(outfit)}
          >
            <Ionicons name="eye-outline" size={18} color="#fff" />
            <Text style={[styles.actionButtonText, styles.primaryActionButtonText]}>
              View
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ec4899" />
          <Text style={styles.loadingText}>Loading trending outfits...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔥 Trending Outfits</Text>
        <Text style={styles.headerSubtitle}>Discover what's hot right now</Text>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryFilter}
        contentContainerStyle={styles.categoryFilterContent}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Ionicons
              name={category.icon as any}
              size={18}
              color={selectedCategory === category.id ? '#fff' : '#666'}
            />
            <Text style={[
              styles.categoryButtonText,
              selectedCategory === category.id && styles.categoryButtonTextActive
            ]}>
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Featured Section */}
        {selectedCategory === 'all' && featuredOutfits.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✨ Featured</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.featuredContainer}
            >
              {featuredOutfits.map(renderFeaturedOutfit)}
            </ScrollView>
          </View>
        )}

        {/* Trending Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            🔥 Trending {selectedCategory !== 'all' ? selectedCategory : ''}
          </Text>
          {trendingOutfits.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="shirt-outline" size={64} color="#ccc" />
              <Text style={styles.emptyStateText}>
                No trending outfits found for this category
              </Text>
            </View>
          ) : (
            trendingOutfits.map(renderTrendingOutfit)
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  categoryFilter: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryFilterContent: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  categoryButtonActive: {
    backgroundColor: '#ec4899',
  },
  categoryButtonText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  featuredContainer: {
    paddingLeft: 20,
  },
  featuredCard: {
    width: 200,
    height: 280,
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    justifyContent: 'flex-end',
    padding: 16,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 215, 0, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  featuredBadgeText: {
    marginLeft: 4,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  featuredCategory: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
  },
  outfitCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  outfitImage: {
    width: '100%',
    height: 200,
  },
  outfitContent: {
    padding: 16,
  },
  outfitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  outfitTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  trendingScore: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendingScoreText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ec4899',
  },
  outfitDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  outfitTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
  outfitStats: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
  outfitActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ec4899',
    backgroundColor: '#fff',
  },
  actionButtonLiked: {
    backgroundColor: '#ec4899',
    borderColor: '#ec4899',
  },
  actionButtonText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#ec4899',
    fontWeight: '500',
  },
  actionButtonTextLiked: {
    color: '#fff',
  },
  primaryActionButton: {
    backgroundColor: '#ec4899',
    borderColor: '#ec4899',
  },
  primaryActionButtonText: {
    color: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default TrendingScreen;