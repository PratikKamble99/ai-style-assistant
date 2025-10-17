import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { userService } from '../../services/api';

// const { width: screenWidth } = Dimensions.get('window');

const SuggestionDetailsScreen = ({ route, navigation }: any) => {
  const { suggestion } = route.params;
  const [isFavorited, setIsFavorited] = useState(false);

  const handleAddToFavorites = async () => {
    try {
      await userService.addFavorite({
        type: 'SUGGESTION',
        itemId: suggestion.id,
        title: `${suggestion.occasion} Outfit`,
        description: suggestion.outfitDesc,
        imageUrl: suggestion.outfitImageUrl,
        metadata: JSON.stringify({
          occasion: suggestion.occasion,
          confidence: suggestion.confidence,
          colors: suggestion.colors,
        }),
      });
      
      setIsFavorited(true);
      Alert.alert('Success', 'Added to favorites!');
    } catch (error) {
      console.error('Failed to add to favorites:', error);
      Alert.alert('Error', 'Failed to add to favorites');
    }
  };

  const handleOutfitPress = async (outfit: any) => {
    if (outfit.google_link) {
      const supported = await Linking.canOpenURL(outfit.google_link);
      if (supported) {
        await Linking.openURL(outfit.google_link);
      } else {
        Alert.alert('Error', 'Cannot open shopping link');
      }
    }
  };

  // const formatPrice = (price: number, currency: string) => {
  //   if (currency === 'INR') {
  //     return `₹${price.toLocaleString()}`;
  //   }
  //   return `${currency} ${price}`;
  // };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={handleAddToFavorites}
        >
          <Ionicons 
            name={isFavorited ? "heart" : "heart-outline"} 
            size={24} 
            color="white" 
          />
        </TouchableOpacity>
      </View>

      {/* Outfit Image */}
      {suggestion.outfitImageUrl && (
        <Image
          source={{ uri: suggestion.outfitImageUrl }}
          style={styles.outfitImage}
          resizeMode="cover"
        />
      )}

      {/* Occasion Badge */}
      <View style={styles.occasionContainer}>
        <LinearGradient
          colors={['#ec4899', '#f472b6']}
          style={styles.occasionBadge}
        >
          <Text style={styles.occasionText}>{suggestion.occasion}</Text>
        </LinearGradient>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Suggestion Type Info */}
        {suggestion.metadata && (() => {
          try {
            const metadata = JSON.parse(suggestion.metadata);
            const suggestionType = metadata.suggestionType;
            if (suggestionType) {
              return (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Suggestion Type</Text>
                  <View style={styles.suggestionTypeContainer}>
                    <View style={[
                      styles.suggestionTypeBadge,
                      suggestionType === 'seasonal' ? styles.seasonalBadge : styles.personalBadge
                    ]}>
                      <Ionicons 
                        name={suggestionType === 'seasonal' ? 'leaf' : 'person'} 
                        size={16} 
                        color="white" 
                      />
                      <Text style={styles.suggestionTypeText}>
                        {suggestionType === 'seasonal' ? 'Seasonal Trends' : 'Personal Style'}
                      </Text>
                    </View>
                    <Text style={styles.suggestionTypeDescription}>
                      {suggestionType === 'seasonal' 
                        ? `Based on current ${metadata.season || 'seasonal'} trends and fashion movements`
                        : 'Personalized based on your style profile and preferences'
                      }
                    </Text>
                    {metadata.season && (
                      <Text style={styles.seasonInfo}>
                        🍃 {metadata.season} 2024 Collection
                      </Text>
                    )}
                  </View>
                </View>
              );
            }
          } catch {
            // Ignore parsing errors
          }
          return null;
        })()}

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Outfit Description</Text>
          <Text style={styles.description}>{suggestion.outfitDesc}</Text>
        </View>

        {/* Confidence Score */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Confidence</Text>
          <View style={styles.confidenceContainer}>
            <View style={styles.confidenceBar}>
              <View 
                style={[
                  styles.confidenceFill, 
                  { width: `${suggestion.confidence * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.confidenceText}>
              {Math.round(suggestion.confidence * 100)}% match
            </Text>
          </View>
        </View>

        {/* Color Palette */}
        {suggestion.colors && suggestion.colors.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Color Palette</Text>
            <View style={styles.colorPalette}>
              {suggestion.colors.map((color: string, index: number) => (
                <View
                  key={index}
                  style={[styles.colorSwatch, { backgroundColor: color }]}
                />
              ))}
            </View>
          </View>
        )}

        {/* Style Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Style Details</Text>
          
          {suggestion.hairstyle && (
            <View style={styles.detailItem}>
              <Ionicons name="cut-outline" size={20} color="#ec4899" />
              <View style={styles.detailContent}>
                <Text style={styles.detailTitle}>Hairstyle</Text>
                <Text style={styles.detailText}>{suggestion.hairstyle}</Text>
              </View>
            </View>
          )}
          
          {suggestion.accessories && (
            <View style={styles.detailItem}>
              <Ionicons name="diamond-outline" size={20} color="#ec4899" />
              <View style={styles.detailContent}>
                <Text style={styles.detailTitle}>Accessories</Text>
                <Text style={styles.detailText}>{suggestion.accessories}</Text>
              </View>
            </View>
          )}
          
          {suggestion.skincare && (
            <View style={styles.detailItem}>
              <Ionicons name="flower-outline" size={20} color="#ec4899" />
              <View style={styles.detailContent}>
                <Text style={styles.detailTitle}>Skincare & Makeup</Text>
                <Text style={styles.detailText}>{suggestion.skincare}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Outfits */}
        {suggestion.outfits && suggestion.outfits.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommended Outfits</Text>
            <View style={styles.outfitsContainer}>
              {suggestion.outfits.map((outfit: any, index: number) => (
                <TouchableOpacity
                  key={outfit.id || index}
                  style={styles.outfitCard}
                  onPress={() => handleOutfitPress(outfit)}
                >
                  <View style={styles.outfitHeader}>
                    <View style={styles.outfitTitleContainer}>
                      <Text style={styles.outfitName} numberOfLines={2}>
                        {outfit.name}
                      </Text>
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{outfit.category}</Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.outfitDetails}>
                    <View style={styles.outfitMeta}>
                      <Text style={styles.outfitBrand}>
                        <Ionicons name="storefront-outline" size={14} color="#6b7280" />
                        {' '}{outfit.brand}
                      </Text>
                      <Text style={styles.outfitPrice}>
                        {outfit.price_range}
                      </Text>
                    </View>

                    {outfit.fit_advice && (
                      <View style={styles.adviceContainer}>
                        <View style={styles.adviceHeader}>
                          <Ionicons name="bulb-outline" size={16} color="#ec4899" />
                          <Text style={styles.adviceLabel}>Fit Advice</Text>
                        </View>
                        <Text style={styles.adviceText}>{outfit.fit_advice}</Text>
                      </View>
                    )}

                    {outfit.styling_tip && (
                      <View style={styles.tipContainer}>
                        <View style={styles.tipHeader}>
                          <Ionicons name="sparkles-outline" size={16} color="#10b981" />
                          <Text style={styles.tipLabel}>Styling Tip</Text>
                        </View>
                        <Text style={styles.tipText}>{outfit.styling_tip}</Text>
                      </View>
                    )}

                    <TouchableOpacity
                      style={styles.shopButton}
                      onPress={() => handleOutfitPress(outfit)}
                    >
                      <Ionicons name="bag-outline" size={16} color="white" />
                      <Text style={styles.shopButtonText}>Shop Now</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Generated Date */}
        <View style={styles.section}>
          <Text style={styles.generatedDate}>
            Generated on {new Date(suggestion.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outfitImage: {
    width: '100%',
    height: 300,
  },
  occasionContainer: {
    position: 'absolute',
    top: 260,
    right: 20,
    zIndex: 5,
  },
  occasionBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  occasionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  confidenceBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  confidenceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  colorPalette: {
    flexDirection: 'row',
    gap: 12,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  outfitsContainer: {
    gap: 16,
  },
  outfitCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  outfitHeader: {
    marginBottom: 12,
  },
  outfitTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  outfitName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1976d2',
    textTransform: 'uppercase',
  },
  outfitDetails: {
    gap: 12,
  },
  outfitMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  outfitBrand: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  outfitPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ec4899',
  },
  adviceContainer: {
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ec4899',
  },
  adviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  adviceLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ec4899',
  },
  adviceText: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 18,
  },
  tipContainer: {
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  tipLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
  },
  tipText: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 18,
  },
  shopButton: {
    backgroundColor: '#ec4899',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  shopButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  generatedDate: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  suggestionTypeContainer: {
    gap: 12,
  },
  suggestionTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  seasonalBadge: {
    backgroundColor: '#10b981',
  },
  personalBadge: {
    backgroundColor: '#8b5cf6',
  },
  suggestionTypeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  suggestionTypeDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  seasonInfo: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
  },
});

export default SuggestionDetailsScreen;