import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  TextInput,
  Linking,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';
// import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { suggestionsService } from '../../services/api';
import { getStatusBarHeight } from '../../utils/safeArea';

// Enhanced logging utility for mobile app
const logger = {
  info: (message: string, data?: any) => {
    console.log(`[AISuggestions] ℹ️ ${message}`, data ? JSON.stringify(data, null, 2) : '');
  },
  success: (message: string, data?: any) => {
    console.log(`[AISuggestions] ✅ ${message}`, data ? JSON.stringify(data, null, 2) : '');
  },
  error: (message: string, error?: any) => {
    console.error(`[AISuggestions] ❌ ${message}`, error);
    if (error?.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
  },
  warn: (message: string, data?: any) => {
    console.warn(`[AISuggestions] ⚠️ ${message}`, data ? JSON.stringify(data, null, 2) : '');
  },
  debug: (message: string, data?: any) => {
    if (__DEV__) {
      console.log(`[AISuggestions] 🐛 ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
  },
  performance: (action: string, startTime: number) => {
    const duration = Date.now() - startTime;
    console.log(`[AISuggestions] ⏱️ ${action} completed in ${duration}ms`);
  }
};

const { width } = Dimensions.get('window');

interface OutfitItem {
  category: string;
  description: string;
  color: string;
  style: string;
  searchTerms: string[];
}

interface Suggestion {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  occasion: string;
  bodyType: string;
  colors: string[];
  confidence: number;
  liked?: boolean;
  items: OutfitItem[];
  tips: string[];
  createdAt: string;
  outfits?: Outfit[];
}

interface Outfit {
  id: string;
  name: string;
  category: string;
  price_range: string;
  brand: string;
  google_link: string;
  fit_advice: string;
  styling_tip: string;
  suggestionId: string;
  userId: string;
}



const AISuggestionsScreen: React.FC = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [trendingSuggestions, setTrendingSuggestions] = useState<Suggestion[]>([]);
  // Removed products state - now using outfits directly from suggestions
  const [generating, setGenerating] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'generate' | 'history' | 'trending'>('generate');

  // Form state - simplified to only occasion, budget, and season
  const [occasion, setOccasion] = useState('');
  const [budget, setBudget] = useState('');
  const [season, setSeason] = useState('');

  // Modal state
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  
  // Picker modal state
  const [pickerModalVisible, setPickerModalVisible] = useState(false);
  const [pickerType, setPickerType] = useState<'occasion' | 'season' | 'budget'>('occasion');
  const [pickerOptions, setPickerOptions] = useState<{label: string, value: string}[]>([]);



  const occasions = [
    { label: 'Select Occasion', value: '' },
    { label: 'Casual', value: 'CASUAL' },
    { label: 'Office', value: 'OFFICE' },
    { label: 'Date', value: 'DATE' },
    { label: 'Wedding', value: 'WEDDING' },
    { label: 'Party', value: 'PARTY' },
    { label: 'Formal Event', value: 'FORMAL_EVENT' },
    { label: 'Vacation', value: 'VACATION' },
    { label: 'Workout', value: 'WORKOUT' },
    { label: 'Interview', value: 'INTERVIEW' }
  ];

  const seasons = [
    { label: 'Any Season', value: '' },
    { label: 'Spring', value: 'SPRING' },
    { label: 'Summer', value: 'SUMMER' },
    { label: 'Autumn/Fall', value: 'AUTUMN' },
    { label: 'Winter', value: 'WINTER' }
  ];

  const budgetRanges = [
    { label: 'Any Budget', value: '' },
    { label: 'Budget Friendly (Under ₹2000)', value: 'BUDGET_FRIENDLY' },
    { label: 'Mid Range (₹2000-₹8000)', value: 'MID_RANGE' },
    { label: 'Premium (₹8000-₹20000)', value: 'PREMIUM' },
    { label: 'Luxury (Above ₹20000)', value: 'LUXURY' }
  ];

  useEffect(() => {
    logger.info('Component mounted, initializing data fetch');
    logger.debug('Initial state', {
      occasion,
      budget,
      season,
      activeTab
    });

    fetchSuggestionHistory();
    fetchTrendingSuggestions();
  }, [activeTab, budget, occasion, season]);



  const fetchSuggestionHistory = async () => {
    const startTime = Date.now();
    logger.info('Fetching suggestion history...');

    try {
      setFetchingHistory(true);
      const response = await suggestionsService.getHistory();

      logger.performance('Fetch suggestion history', startTime);
      logger.success('Suggestion history fetched successfully', {
        count: response.data.data.suggestions?.length || 0,
        responseSize: JSON.stringify(response.data).length
      });

      setSuggestions(response.data.data.suggestions || []);

      // Log individual suggestions for debugging
      response.data.data.suggestions?.forEach((suggestion: Suggestion, index: number) => {
        logger.debug(`Suggestion ${index + 1}`, {
          id: suggestion.id,
          title: suggestion.title,
          occasion: suggestion.occasion,
          confidence: suggestion.confidence
        });
      });

    } catch (error) {
      logger.error('Failed to fetch suggestion history', error);

      // Show user-friendly error
      Alert.alert(
        'Connection Error',
        'Unable to load your suggestions. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setFetchingHistory(false);
    }
  };

  const fetchTrendingSuggestions = async () => {
    const startTime = Date.now();
    logger.info('Fetching trending suggestions...');

    try {
      const response = await suggestionsService.getTrending();

      logger.performance('Fetch trending suggestions', startTime);
      logger.success('Trending suggestions fetched successfully', {
        count: response.data.data.suggestions?.length || 0
      });

      setTrendingSuggestions(response.data.data.suggestions || []);

    } catch (error) {
      logger.error('Failed to fetch trending suggestions', error);

      // Don't show alert for trending as it's not critical
      logger.warn('Trending suggestions unavailable, continuing without them');
    }
  };

  const generateSuggestion = async () => {
    const startTime = Date.now();

    // Validation logging
    logger.info('Generate suggestion button pressed');
    logger.debug('Form validation', { occasion, budget, season });

    if (!occasion) {
      logger.warn('Form validation failed - missing required field', {
        occasion: !!occasion
      });
      Alert.alert('Missing Information', 'Please select an occasion');
      return;
    }

    const requestData = {
      occasion,
      budget: budget || undefined,
      season: season || undefined
    };

    logger.info('Starting suggestion generation...', requestData);

    try {
      setGenerating(true);

      const response = await suggestionsService.generate(requestData);

      logger.performance('Generate suggestion', startTime);

      const newSuggestion = response.data.data.suggestion;
      const outfits = response.data.data.outfits;

      // Add outfits to the suggestion
      const suggestionWithOutfits = {
        ...newSuggestion,
        outfits: outfits || []
      };

      logger.success('Suggestion generated successfully', {
        suggestionId: newSuggestion.id,
        title: newSuggestion.title,
        confidence: newSuggestion.confidence,
        itemsCount: newSuggestion.items?.length || 0,
        outfitsCount: outfits?.length || 0
      });

      setSuggestions(prev => {
        logger.debug('Updating suggestions state', {
          previousCount: prev.length,
          newSuggestionId: newSuggestion.id
        });
        return [suggestionWithOutfits, ...prev];
      });

      // Switch to history tab to show the new suggestion
      logger.info('Switching to history tab to show new suggestion');
      setActiveTab('history');

      Alert.alert('Success!', 'Your AI outfit suggestion has been generated!');

    } catch (error) {
      logger.error('Failed to generate suggestion', error);

      // Provide more specific error messages based on error type
      let errorMessage = 'Failed to generate suggestion. Please try again.';

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        if (axiosError.response?.status === 401) {
          errorMessage = 'Please log in again to generate suggestions.';
        } else if (axiosError.response?.status === 429) {
          errorMessage = 'Too many requests. Please wait a moment and try again.';
        } else if (axiosError.response?.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (!axiosError.response) {
          errorMessage = 'Network error. Please check your internet connection.';
        }
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setGenerating(false);
      logger.debug('Generate suggestion process completed');
    }
  };

  const viewSuggestionDetails = async (suggestion: Suggestion) => {
    const startTime = Date.now();

    logger.info('Opening suggestion details modal', {
      suggestionId: suggestion.id,
      title: suggestion.title
    });

    setSelectedSuggestion(suggestion);
    setDetailsModalVisible(true);

    // Fetch outfits for this suggestion if not already loaded
    if (!suggestion.outfits || suggestion.outfits.length === 0) {
      logger.info('Fetching outfits for suggestion details', {
        suggestionId: suggestion.id
      });

      try {
        const response = await suggestionsService.getDetails(suggestion.id);

        logger.performance('Fetch suggestion details', startTime);

        const updatedSuggestion = response.data.data.suggestion;

        logger.success('Suggestion details fetched with outfits', {
          suggestionId: suggestion.id,
          outfitsCount: updatedSuggestion.outfits?.length || 0
        });

        // Update the suggestion with outfits
        setSuggestions(prev =>
          prev.map(s =>
            s.id === suggestion.id
              ? { ...s, outfits: updatedSuggestion.outfits || [] }
              : s
          )
        );

        setSelectedSuggestion({
          ...suggestion,
          outfits: updatedSuggestion.outfits || []
        });

      } catch (error) {
        logger.error('Failed to fetch suggestion details', error);

        Alert.alert(
          'Error',
          'Unable to load outfit recommendations. The suggestion details are still available.',
          [{ text: 'OK' }]
        );
      }
    } else {
      logger.debug('Outfits already available for suggestion', {
        suggestionId: suggestion.id,
        outfitsCount: suggestion.outfits.length
      });
    }
  };

  const toggleLike = async (suggestionId: string) => {
    const startTime = Date.now();

    try {
      const suggestion = suggestions.find(s => s.id === suggestionId);
      const newLikedState = !suggestion?.liked;

      logger.info('Toggling like status', {
        suggestionId,
        currentState: suggestion?.liked,
        newState: newLikedState,
        suggestionTitle: suggestion?.title
      });

      await suggestionsService.submitFeedback(suggestionId, {
        liked: newLikedState,
        rating: newLikedState ? 5 : 3
      });

      logger.performance('Toggle like', startTime);
      logger.success('Like status updated successfully', {
        suggestionId,
        liked: newLikedState
      });

      setSuggestions(prev =>
        prev.map(s =>
          s.id === suggestionId
            ? { ...s, liked: newLikedState }
            : s
        )
      );

    } catch (error) {
      logger.error('Failed to update like status', error);

      Alert.alert(
        'Error',
        'Unable to update your preference. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const submitFeedback = async () => {
    if (!selectedSuggestion || !feedbackRating) {
      logger.warn('Feedback submission attempted with missing data', {
        hasSelectedSuggestion: !!selectedSuggestion,
        feedbackRating
      });
      return;
    }

    const startTime = Date.now();
    const feedbackData = {
      rating: feedbackRating,
      liked: feedbackRating >= 4,
      comment: feedbackComment
    };

    logger.info('Submitting feedback', {
      suggestionId: selectedSuggestion.id,
      suggestionTitle: selectedSuggestion.title,
      ...feedbackData
    });

    try {
      await suggestionsService.submitFeedback(selectedSuggestion.id, feedbackData);

      logger.performance('Submit feedback', startTime);
      logger.success('Feedback submitted successfully', {
        suggestionId: selectedSuggestion.id,
        rating: feedbackRating,
        hasComment: !!feedbackComment
      });

      setFeedbackModalVisible(false);
      setFeedbackRating(0);
      setFeedbackComment('');

      Alert.alert('Thank you!', 'Your feedback has been submitted.');

      // Refresh suggestions to get updated data
      logger.info('Refreshing suggestions after feedback submission');
      fetchSuggestionHistory();

    } catch (error) {
      logger.error('Failed to submit feedback', error);

      Alert.alert(
        'Error',
        'Failed to submit feedback. Your rating is important to us, please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const openOutfitLink = (url: string, outfitName?: string) => {
    logger.info('Opening outfit link', {
      url,
      outfitName: outfitName || 'Unknown outfit'
    });

    Linking.openURL(url).catch(err => {
      logger.error('Failed to open outfit link', {
        url,
        outfitName,
        error: err
      });

      Alert.alert(
        'Error',
        'Could not open shopping link. Please check if you have a browser app installed.',
        [{ text: 'OK' }]
      );
    });
  };

  const onRefresh = async () => {
    const startTime = Date.now();
    logger.info('Pull-to-refresh triggered');

    setRefreshing(true);

    try {
      await Promise.all([
        fetchSuggestionHistory(),
        fetchTrendingSuggestions()
      ]);

      logger.performance('Pull-to-refresh', startTime);
      logger.success('Data refreshed successfully');

    } catch (error) {
      logger.error('Error during refresh', error);
    } finally {
      setRefreshing(false);
    }
  };

  const showPicker = (type: 'occasion' | 'season' | 'budget') => {
    let options: {label: string, value: string}[] = [];
    
    switch (type) {
      case 'occasion':
        options = occasions;
        break;
      case 'season':
        options = seasons;
        break;
      case 'budget':
        options = budgetRanges;
        break;
    }
    
    setPickerType(type);
    setPickerOptions(options);
    setPickerModalVisible(true);
  };

  const selectPickerOption = (value: string) => {
    switch (pickerType) {
      case 'occasion':
        setOccasion(value);
        break;
      case 'season':
        setSeason(value);
        break;
      case 'budget':
        setBudget(value);
        break;
    }
    setPickerModalVisible(false);
  };



  const renderSuggestionCard = (suggestion: Suggestion) => (
    <View key={suggestion.id} style={styles.suggestionCard}>
      <Image
        source={{ uri: suggestion.imageUrl || 'https://via.placeholder.com/300x200' }}
        style={styles.suggestionImage}
      />

      <View style={styles.suggestionContent}>
        <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
        <Text style={styles.suggestionDescription} numberOfLines={2}>
          {suggestion.description}
        </Text>

        <View style={styles.chipContainer}>
          <View style={styles.chip}>
            <Text style={styles.chipText}>{suggestion.occasion.replace('_', ' ')}</Text>
          </View>
          <View style={[styles.chip, styles.chipOutlined]}>
            <Text style={styles.chipTextOutlined}>{suggestion.bodyType.replace('_', ' ')}</Text>
          </View>
          <View style={[styles.chip, styles.chipSuccess]}>
            <Text style={styles.chipTextSuccess}>
              {Math.round(suggestion.confidence * 100)}% confidence
            </Text>
          </View>
        </View>

        <View style={styles.colorContainer}>
          {suggestion.colors.slice(0, 5).map((color, index) => (
            <View
              key={index}
              style={[
                styles.colorDot,
                { backgroundColor: color.toLowerCase() }
              ]}
            />
          ))}
        </View>

        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => toggleLike(suggestion.id)}
          >
            <Ionicons
              name={suggestion.liked ? 'heart' : 'heart-outline'}
              size={20}
              color={suggestion.liked ? '#e91e63' : '#666'}
            />
            <Text style={styles.actionText}>
              {suggestion.liked ? 'Liked' : 'Like'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={() => viewSuggestionDetails(suggestion)}
          >
            <Ionicons name="eye-outline" size={20} color="#fff" />
            <Text style={[styles.actionText, styles.primaryButtonText]}>
              View Details
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderStarRating = () => (
    <View style={styles.starContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => {
            logger.info('Star rating selected', {
              rating: star,
              previousRating: feedbackRating
            });
            setFeedbackRating(star);
          }}
        >
          <Ionicons
            name={star <= feedbackRating ? 'star' : 'star-outline'}
            size={30}
            color="#ffc107"
            style={styles.star}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#f5f5f5"
        translucent={false}
        animated={true}
      />
      <View style={styles.container}>
        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'generate' && styles.activeTab]}
            onPress={() => {
              logger.info('Tab changed to Generate');
              setActiveTab('generate');
            }}
          >
            <Ionicons name="sparkles-outline" size={20} color={activeTab === 'generate' ? '#2196f3' : '#666'} />
            <Text style={[styles.tabText, activeTab === 'generate' && styles.activeTabText]}>
              Generate
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'history' && styles.activeTab]}
            onPress={() => {
              logger.info('Tab changed to History', {
                suggestionsCount: suggestions.length
              });
              setActiveTab('history');
            }}
          >
            <Ionicons name="time-outline" size={20} color={activeTab === 'history' ? '#2196f3' : '#666'} />
            <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
              My Suggestions
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'trending' && styles.activeTab]}
            onPress={() => {
              logger.info('Tab changed to Trending', {
                trendingSuggestionsCount: trendingSuggestions.length
              });
              setActiveTab('trending');
            }}
          >
            <Ionicons name="trending-up-outline" size={20} color={activeTab === 'trending' ? '#2196f3' : '#666'} />
            <Text style={[styles.tabText, activeTab === 'trending' && styles.activeTabText]}>
              Trending
            </Text>
          </TouchableOpacity>




        </View>

        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {activeTab === 'generate' && (
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>Generate Outfit from Your Profile</Text>
              <Text style={styles.formSubtitle}>
                We'll use your saved body type, style preferences, and measurements to create the perfect outfit for your occasion and budget.
              </Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Occasion *</Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => showPicker('occasion')}
                >
                  <Text style={[styles.pickerButtonText, !occasion && styles.pickerPlaceholder]}>
                    {occasions.find(o => o.value === occasion)?.label || 'Select Occasion'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Season/Weather</Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => showPicker('season')}
                >
                  <Text style={[styles.pickerButtonText, !season && styles.pickerPlaceholder]}>
                    {seasons.find(s => s.value === season)?.label || 'Any Season'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Budget Range</Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => showPicker('budget')}
                >
                  <Text style={[styles.pickerButtonText, !budget && styles.pickerPlaceholder]}>
                    {budgetRanges.find(r => r.value === budget)?.label || 'Any Budget'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[
                  styles.generateButton,
                  (!occasion || generating) && styles.generateButtonDisabled
                ]}
                onPress={generateSuggestion}
                disabled={!occasion || generating}
              >
                {generating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="sparkles" size={20} color="#fff" />
                    <Text style={styles.generateButtonText}>Generate AI Suggestion</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {activeTab === 'history' && (
            <View style={styles.suggestionsContainer}>
              {fetchingHistory ? (
                <View style={styles.loadingState}>
                  <ActivityIndicator size="large" color="#2196f3" />
                  <Text style={styles.loadingText}>Loading your suggestions...</Text>
                </View>
              ) : suggestions.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="shirt-outline" size={64} color="#ccc" />
                  <Text style={styles.emptyStateText}>
                    No suggestions yet. Generate your first AI-powered outfit suggestion!
                  </Text>
                </View>
              ) : (
                suggestions.map(renderSuggestionCard)
              )}
            </View>
          )}

          {activeTab === 'trending' && (
            <View style={styles.suggestionsContainer}>
              {trendingSuggestions.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="trending-up-outline" size={64} color="#ccc" />
                  <Text style={styles.emptyStateText}>
                    No trending suggestions available at the moment.
                  </Text>
                </View>
              ) : (
                trendingSuggestions.map(renderSuggestionCard)
              )}
            </View>
          )}


        </ScrollView>

        {/* Suggestion Details Modal */}
        <Modal
          visible={detailsModalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedSuggestion?.title}</Text>
              <TouchableOpacity
                onPress={() => {
                  logger.info('Details modal closed');
                  setDetailsModalVisible(false);
                }}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {selectedSuggestion && (
                <>
                  <Text style={styles.modalDescription}>
                    {selectedSuggestion.description}
                  </Text>

                  {/* Outfit Items */}
                  <Text style={styles.sectionTitle}>Outfit Items</Text>
                  {selectedSuggestion.items?.map((item, index) => (
                    <View key={index} style={styles.outfitItem}>
                      <Text style={styles.outfitItemTitle}>
                        {item.category.toUpperCase()}: {item.description}
                      </Text>
                      <Text style={styles.outfitItemDetails}>
                        Color: {item.color} | Style: {item.style}
                      </Text>
                    </View>
                  ))}

                  {/* Styling Tips */}
                  {selectedSuggestion.tips && selectedSuggestion.tips.length > 0 && (
                    <>
                      <Text style={styles.sectionTitle}>Styling Tips</Text>
                      {selectedSuggestion.tips.map((tip, index) => (
                        <Text key={index} style={styles.tip}>
                          • {tip}
                        </Text>
                      ))}
                    </>
                  )}

                  {/* Outfits */}
                  {selectedSuggestion.outfits && selectedSuggestion.outfits.length > 0 && (
                    <>
                      <Text style={styles.sectionTitle}>Recommended Outfits</Text>
                      {selectedSuggestion.outfits.map((outfit, index) => (
                        <View key={outfit.id || index} style={styles.outfitItem}>
                          <View style={styles.outfitItemTitle}>
                            <Text style={styles.modalDescription}>{outfit.name}</Text>
                            <View style={styles.chip}>
                              <Text style={styles.chipText}>{outfit.category}</Text>
                            </View>
                          </View>
                          
                          <Text style={styles.tip}>
                            Brand: {outfit.brand}
                          </Text>
                          <Text style={styles.modalDescription}>
                            Price: {outfit.price_range}
                          </Text>
                          
                          {outfit.fit_advice && (
                            <View style={styles.outfitItem}>
                              <Text style={styles.outfitItemTitle}>💡 Fit Advice:</Text>
                              <Text style={styles.outfitItemDetails}>{outfit.fit_advice}</Text>
                            </View>
                          )}
                          
                          {outfit.styling_tip && (
                            <View style={styles.outfitItem}>
                              <Text style={styles.outfitItemTitle}>✨ Styling Tip:</Text>
                              <Text style={styles.outfitItemDetails}>{outfit.styling_tip}</Text>
                            </View>
                          )}
                          
                          <TouchableOpacity
                            style={styles.feedbackButton}
                            onPress={() => openOutfitLink(outfit.google_link, outfit.name)}
                          >
                            <Ionicons name="bag-outline" size={16} color="white" />
                            <Text style={styles.feedbackButtonText}>Shop Now</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </>
                  )}
                </>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.feedbackButton}
                onPress={() => {
                  logger.info('Opening feedback modal from details', {
                    suggestionId: selectedSuggestion?.id
                  });
                  setDetailsModalVisible(false);
                  setFeedbackModalVisible(true);
                }}
              >
                <Text style={styles.feedbackButtonText}>Rate This Suggestion</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Feedback Modal */}
        <Modal
          visible={feedbackModalVisible}
          animationType="slide"
          transparent
        >
          <View style={styles.feedbackModalOverlay}>
            <View style={styles.feedbackModalContainer}>
              <Text style={styles.feedbackModalTitle}>Rate This Suggestion</Text>

              <Text style={styles.feedbackLabel}>How would you rate this suggestion?</Text>
              {renderStarRating()}

              <TextInput
                style={styles.feedbackInput}
                placeholder="Comments (optional)"
                value={feedbackComment}
                onChangeText={setFeedbackComment}
                multiline
                numberOfLines={3}
              />

              <View style={styles.feedbackActions}>
                <TouchableOpacity
                  style={styles.feedbackCancelButton}
                  onPress={() => {
                    logger.info('Feedback modal cancelled');
                    setFeedbackModalVisible(false);
                  }}
                >
                  <Text style={styles.feedbackCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.feedbackSubmitButton,
                    !feedbackRating && styles.feedbackSubmitButtonDisabled
                  ]}
                  onPress={submitFeedback}
                  disabled={!feedbackRating}
                >
                  <Text style={styles.feedbackSubmitText}>Submit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Picker Modal */}
        <Modal
          visible={pickerModalVisible}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.feedbackModalOverlay}>
            <View style={styles.feedbackModalContainer}>
              <Text style={styles.feedbackModalTitle}>
                Select {pickerType === 'occasion' ? 'Occasion' : pickerType === 'season' ? 'Season' : 'Budget'}
              </Text>
              
              <ScrollView style={{ maxHeight: 300 }}>
                {pickerOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={styles.pickerOption}
                    onPress={() => selectPickerOption(option.value)}
                  >
                    <Text style={styles.pickerOptionText}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              
              <TouchableOpacity
                style={styles.feedbackCancelButton}
                onPress={() => setPickerModalVisible(false)}
              >
                <Text style={styles.feedbackCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    // Ensure content doesn't go under status bar using our utility
    paddingTop: getStatusBarHeight(),
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    zIndex: 1,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2196f3',
  },
  tabText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#2196f3',
  },
  content: {
    flex: 1,
  },
  formContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  formSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#333',
  },
  generateButton: {
    backgroundColor: '#2196f3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  generateButtonDisabled: {
    backgroundColor: '#ccc',
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  suggestionsContainer: {
    padding: 16,
  },
  suggestionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  suggestionImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  suggestionContent: {
    padding: 16,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  suggestionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  chip: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  chipOutlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2196f3',
  },
  chipSuccess: {
    backgroundColor: '#e8f5e8',
  },
  chipText: {
    fontSize: 12,
    color: '#1976d2',
  },
  chipTextOutlined: {
    fontSize: 12,
    color: '#2196f3',
  },
  chipTextSuccess: {
    fontSize: 12,
    color: '#2e7d32',
  },
  colorContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  colorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  primaryButton: {
    backgroundColor: '#2196f3',
  },
  actionText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  primaryButtonText: {
    color: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 40,
  },
  loadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalDescription: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 12,
  },
  outfitItem: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  outfitItemTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  outfitItemDetails: {
    fontSize: 12,
    color: '#666',
  },
  tip: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
  productCategory: {
    marginBottom: 20,
  },
  productCategoryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  productCard: {
    width: 120,
    marginRight: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 8,
  },
  productImage: {
    width: '100%',
    height: 80,
    borderRadius: 6,
    marginBottom: 8,
  },
  productBrand: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },
  productName: {
    fontSize: 12,
    color: '#333',
    marginBottom: 4,
    height: 32,
  },
  productPrice: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2196f3',
    marginBottom: 4,
  },
  productPlatform: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  productPlatformText: {
    fontSize: 10,
    color: '#666',
  },
  modalActions: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  feedbackButton: {
    backgroundColor: '#2196f3',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  feedbackButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  feedbackModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedbackModalContainer: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    width: width - 40,
  },
  feedbackModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  feedbackLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
  },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  star: {
    marginHorizontal: 4,
  },
  feedbackInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  feedbackActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  feedbackCancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  feedbackCancelText: {
    fontSize: 16,
    color: '#666',
  },
  feedbackSubmitButton: {
    flex: 1,
    backgroundColor: '#2196f3',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  feedbackSubmitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  feedbackSubmitText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  pickerPlaceholder: {
    color: '#999',
  },
  pickerOption: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  pickerOptionText: {
    fontSize: 16,
    color: '#333',
  },
});

export default AISuggestionsScreen;
