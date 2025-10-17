import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { suggestionsService } from '../../services/api';

const SuggestionsScreen = ({ navigation }: any) => {
  const [selectedOccasion, setSelectedOccasion] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Removed suggestion type selector to match web frontend

  const occasions = [
    { value: 'CASUAL', label: 'Casual', icon: 'shirt-outline', emoji: '👕' },
    { value: 'OFFICE', label: 'Office', icon: 'briefcase-outline', emoji: '💼' },
    { value: 'DATE', label: 'Date', icon: 'heart-outline', emoji: '💕' },
    { value: 'WEDDING', label: 'Wedding', icon: 'flower-outline', emoji: '💒' },
    { value: 'PARTY', label: 'Party', icon: 'musical-notes-outline', emoji: '🎉' },
    { value: 'WORKOUT', label: 'Workout', icon: 'fitness-outline', emoji: '💪' },
  ];

  useEffect(() => {
    loadSuggestionHistory();
  }, []);

  const loadSuggestionHistory = async () => {
    try {
      setLoading(true);
      const response = await suggestionsService.getHistory(1, 10);
      setSuggestions(response.data.data.suggestions || []);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSuggestion = async () => {
    if (!selectedOccasion) {
      Alert.alert('Error', 'Please select an occasion first');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await suggestionsService.generate({
        occasion: selectedOccasion
      });

      const newSuggestion = response.data.data.suggestion;
      const outfits = response.data.data.outfits;

      // Add outfits to the suggestion for display
      const suggestionWithOutfits = {
        ...newSuggestion,
        outfits: outfits || []
      };


      setSuggestions(prev => [suggestionWithOutfits, ...prev]);
      setSelectedOccasion('');

      Alert.alert('Success', 'Your AI outfit suggestion has been generated!', [
        { text: 'View Details', onPress: () => showSuggestionDetails(suggestionWithOutfits) },
        { text: 'OK' }
      ]);
    } catch (error: any) {
      console.error('Failed to generate suggestion:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to generate suggestion. Please try again.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const showSuggestionDetails = (suggestion: any) => {
    navigation.navigate('SuggestionDetails', { suggestion });
  };

  const submitFeedback = async (suggestionId: string, liked: boolean, rating: number) => {
    try {
      await suggestionsService.submitFeedback(suggestionId, { rating, liked });
      Alert.alert('Thank you!', 'Your feedback helps us improve our recommendations.');
      loadSuggestionHistory(); // Refresh to show updated feedback
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      Alert.alert('Error', 'Failed to submit feedback. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#ec4899', '#f472b6']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Ionicons name="flash" size={32} color="white" />
          <Text style={styles.headerTitle}>Style Suggestions</Text>
          <Text style={styles.headerSubtitle}>
            AI-powered recommendations just for you
          </Text>
        </View>
      </LinearGradient>



      {/* Generate New Suggestion */}
      <View style={styles.generateSection}>
        <Text style={styles.sectionTitle}>
          Generate Outfit from Your Profile
        </Text>
        <Text style={styles.sectionSubtitle}>
          We'll use your saved body type, style preferences, and measurements to create the perfect outfit for your occasion and budget.
        </Text>

        <View style={styles.formGrid}>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Occasion *</Text>
            <TouchableOpacity
              style={styles.formSelect}
              onPress={() => {
                Alert.alert(
                  'Select Occasion',
                  '',
                  [
                    ...occasions.map(occasion => ({
                      text: occasion.label,
                      onPress: () => setSelectedOccasion(occasion.value)
                    })),
                    { text: 'Cancel', style: 'cancel' as const }
                  ]
                );
              }}
            >
              <Text style={[styles.formSelectText, !selectedOccasion && { color: '#9ca3af' }]}>
                {occasions.find(o => o.value === selectedOccasion)?.label || 'Select Occasion'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.generateButton,
            (!selectedOccasion || isGenerating) && styles.generateButtonDisabled,
          ]}
          onPress={handleGenerateSuggestion}
          disabled={!selectedOccasion || isGenerating}
        >
          <Ionicons
            name={isGenerating ? 'hourglass-outline' : 'flash'}
            size={20}
            color="white"
          />
          <Text style={styles.generateButtonText}>
            {isGenerating
              ? 'Generating...'
              : 'Generate AI Suggestion'
            }
          </Text>
        </TouchableOpacity>
      </View>

      {/* Recent Suggestions */}
      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>Recent Suggestions</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ec4899" />
            <Text style={styles.loadingText}>Loading suggestions...</Text>
          </View>
        ) : suggestions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="flash-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyStateTitle}>No suggestions yet</Text>
            <Text style={styles.emptyStateSubtitle}>
              Generate your first style suggestion to get started!
            </Text>
          </View>
        ) : (
          <View style={styles.suggestionsContainer}>
            {suggestions.map((suggestion) => (
              <TouchableOpacity
                key={suggestion.id}
                style={styles.suggestionCard}
                onPress={() => showSuggestionDetails(suggestion)}
              >
                <View style={styles.suggestionHeader}>
                  <View style={styles.badgeContainer}>
                    <View style={styles.occasionBadge}>
                      <Text style={styles.occasionBadgeText}>
                        {suggestion.occasion}
                      </Text>
                    </View>
                    {suggestion.metadata && (() => {
                      try {
                        const metadata = JSON.parse(suggestion.metadata);
                        const suggestionType = metadata.suggestionType;
                        if (suggestionType) {
                          return (
                            <View style={[
                              styles.typeBadge,
                              suggestionType === 'seasonal' ? styles.seasonalBadge : styles.personalBadge
                            ]}>
                              <Ionicons
                                name={suggestionType === 'seasonal' ? 'leaf' : 'person'}
                                size={10}
                                color="white"
                              />
                              <Text style={styles.typeBadgeText}>
                                {suggestionType === 'seasonal' ? 'Seasonal' : 'Personal'}
                              </Text>
                            </View>
                          );
                        }
                      } catch {
                        // Ignore parsing errors
                      }
                      return null;
                    })()}
                  </View>
                  <Text style={styles.suggestionDate}>
                    {new Date(suggestion.createdAt).toLocaleDateString()}
                  </Text>
                </View>

                {suggestion.outfitImageUrl && (
                  <Image
                    source={{ uri: suggestion.outfitImageUrl }}
                    style={styles.suggestionImage}
                    resizeMode="cover"
                  />
                )}

                <View style={styles.suggestionContent}>
                  <Text style={styles.suggestionTitle} numberOfLines={2}>
                    {suggestion.outfitDesc}
                  </Text>

                  <View style={styles.suggestionMeta}>
                    <View style={styles.confidenceContainer}>
                      <Ionicons name="star" size={16} color="#fbbf24" />
                      <Text style={styles.confidenceText}>
                        {Math.round(suggestion.confidence * 100)}% match
                      </Text>
                    </View>

                    <View style={styles.productCount}>
                      <Ionicons name="shirt-outline" size={16} color="#6b7280" />
                      <Text style={styles.productCountText}>
                        {suggestion.outfits?.length || 0} outfits
                      </Text>
                    </View>
                  </View>

                  {!suggestion.feedback && (
                    <View style={styles.feedbackButtons}>
                      <TouchableOpacity
                        style={[styles.feedbackButton, styles.likeButton]}
                        onPress={() => submitFeedback(suggestion.id, true, 5)}
                      >
                        <Ionicons name="thumbs-up" size={16} color="white" />
                        <Text style={styles.feedbackButtonText}>Like</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.feedbackButton, styles.dislikeButton]}
                        onPress={() => submitFeedback(suggestion.id, false, 2)}
                      >
                        <Ionicons name="thumbs-down" size={16} color="white" />
                        <Text style={styles.feedbackButtonText}>Dislike</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
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
  typeSelector: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  typeButtonSelected: {
    backgroundColor: '#ec4899',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ec4899',
  },
  typeButtonTextSelected: {
    color: 'white',
  },
  generateSection: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  },
  occasionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  occasionCard: {
    width: '48%',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  occasionCardSelected: {
    backgroundColor: '#fce7f3',
    borderColor: '#ec4899',
  },
  occasionEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  occasionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  occasionLabelSelected: {
    color: '#ec4899',
  },
  generateButton: {
    backgroundColor: '#ec4899',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  generateButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  historySection: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
  },
  suggestionsContainer: {
    gap: 16,
  },
  suggestionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  occasionBadge: {
    backgroundColor: '#ec4899',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  occasionBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
  },
  seasonalBadge: {
    backgroundColor: '#10b981',
  },
  personalBadge: {
    backgroundColor: '#8b5cf6',
  },
  typeBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  suggestionDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  suggestionImage: {
    width: '100%',
    height: 200,
  },
  suggestionContent: {
    padding: 16,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
    lineHeight: 22,
  },
  suggestionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  productCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productCountText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  feedbackButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  likeButton: {
    backgroundColor: '#10b981',
  },
  dislikeButton: {
    backgroundColor: '#ef4444',
  },
  feedbackButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  formGrid: {
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  formSelect: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
  },
  formSelectText: {
    fontSize: 16,
    color: '#1f2937',
  },
});

export default SuggestionsScreen;