import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const SuggestionsScreen = () => {
  const [selectedOccasion, setSelectedOccasion] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const occasions = [
    { value: 'CASUAL', label: 'Casual', icon: 'shirt-outline', emoji: '👕' },
    { value: 'OFFICE', label: 'Office', icon: 'briefcase-outline', emoji: '💼' },
    { value: 'DATE', label: 'Date', icon: 'heart-outline', emoji: '💕' },
    { value: 'WEDDING', label: 'Wedding', icon: 'flower-outline', emoji: '💒' },
    { value: 'PARTY', label: 'Party', icon: 'musical-notes-outline', emoji: '🎉' },
    { value: 'WORKOUT', label: 'Workout', icon: 'fitness-outline', emoji: '💪' },
  ];

  const handleGenerateSuggestion = async () => {
    if (!selectedOccasion) {
      Alert.alert('Error', 'Please select an occasion first');
      return;
    }

    setIsGenerating(true);
    // Simulate API call
    setTimeout(() => {
      setIsGenerating(false);
      Alert.alert('Success', 'Style suggestion generated!');
      setSelectedOccasion('');
    }, 2000);
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
        <Text style={styles.sectionTitle}>Generate New Suggestion</Text>
        <Text style={styles.sectionSubtitle}>
          Select an occasion to get personalized style recommendations
        </Text>

        <View style={styles.occasionsGrid}>
          {occasions.map((occasion) => (
            <TouchableOpacity
              key={occasion.value}
              style={[
                styles.occasionCard,
                selectedOccasion === occasion.value && styles.occasionCardSelected,
              ]}
              onPress={() => setSelectedOccasion(occasion.value)}
            >
              <Text style={styles.occasionEmoji}>{occasion.emoji}</Text>
              <Text
                style={[
                  styles.occasionLabel,
                  selectedOccasion === occasion.value && styles.occasionLabelSelected,
                ]}
              >
                {occasion.label}
              </Text>
            </TouchableOpacity>
          ))}
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
            {isGenerating ? 'Generating...' : 'Generate Style Suggestion'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Recent Suggestions */}
      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>Recent Suggestions</Text>
        
        <View style={styles.emptyState}>
          <Ionicons name="camera-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyStateTitle}>No suggestions yet</Text>
          <Text style={styles.emptyStateSubtitle}>
            Generate your first style suggestion to get started!
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
  generateSection: {
    backgroundColor: 'white',
    margin: 20,
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
});

export default SuggestionsScreen;