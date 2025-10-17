import React, { useState, useEffect } from 'react';
import { suggestionsService } from '../services/api';
import './SuggestionsPage.css';

interface OutfitItem {
  category: string;
  description: string;
  color: string;
  style: string;
  searchTerms: string[];
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

const SuggestionsPage: React.FC = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [trendingSuggestions, setTrendingSuggestions] = useState<Suggestion[]>([]);
  const [generating, setGenerating] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'generate' | 'history' | 'trending'>('generate');

  // Form state - simplified to only occasion and budget
  const [occasion, setOccasion] = useState('');
  const [budget, setBudget] = useState('');
  const [season, setSeason] = useState('');

  // Modal state
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState<number>(0);
  const [feedbackComment, setFeedbackComment] = useState('');

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
    fetchSuggestionHistory();
    fetchTrendingSuggestions();
  }, []);

  const fetchSuggestionHistory = async () => {
    try {
      setFetchingHistory(true);
      const response = await suggestionsService.getHistory();
      setSuggestions(response.data.data.suggestions || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setError('Failed to load suggestions');
    } finally {
      setFetchingHistory(false);
    }
  };

  const fetchTrendingSuggestions = async () => {
    try {
      const response = await suggestionsService.getTrending();
      setTrendingSuggestions(response.data.data.suggestions || []);
    } catch (error) {
      console.error('Error fetching trending suggestions:', error);
    }
  };

  const generateSuggestion = async () => {
    if (!occasion) {
      setError('Please select an occasion');
      return;
    }

    try {
      setGenerating(true);
      setError(null);

      const response = await suggestionsService.generate({
        occasion,
        budget: budget || undefined,
        season: season || undefined
      });

      const newSuggestion = response.data.data.suggestion;
      const outfits = response.data.data.outfits;

      // Add outfits to the suggestion
      const suggestionWithOutfits = {
        ...newSuggestion,
        outfits: outfits || []
      };

      setSuggestions(prev => [suggestionWithOutfits, ...prev]);

      // Switch to history tab
      setActiveTab('history');
    } catch (error) {
      console.error('Error generating suggestion:', error);
      setError('Failed to generate suggestion. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const viewSuggestionDetails = async (suggestion: Suggestion) => {
    setSelectedSuggestion(suggestion);
    setDetailsModalOpen(true);

    // Fetch outfits for this suggestion if not already loaded
    if (!suggestion.outfits || suggestion.outfits.length === 0) {
      try {
        const response = await suggestionsService.getDetails(suggestion.id);
        const updatedSuggestion = response.data.data.suggestion;
        
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
        console.error('Error fetching suggestion details:', error);
      }
    }
  };

  const toggleLike = async (suggestionId: string) => {
    try {
      const suggestion = suggestions.find(s => s.id === suggestionId);
      const newLikedState = !suggestion?.liked;

      await suggestionsService.submitFeedback(suggestionId, {
        liked: newLikedState,
        rating: newLikedState ? 5 : 3
      });

      setSuggestions(prev =>
        prev.map(s =>
          s.id === suggestionId
            ? { ...s, liked: newLikedState }
            : s
        )
      );
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  const submitFeedback = async () => {
    if (!selectedSuggestion || !feedbackRating) return;

    try {
      await suggestionsService.submitFeedback(selectedSuggestion.id, {
        rating: feedbackRating,
        liked: feedbackRating >= 4,
        comment: feedbackComment
      });

      setFeedbackModalOpen(false);
      setFeedbackRating(0);
      setFeedbackComment('');
      fetchSuggestionHistory();
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const renderSuggestionCard = (suggestion: Suggestion) => (
    <div key={suggestion.id} className="suggestion-card">
      <img
        src={suggestion.imageUrl || '/placeholder-outfit.jpg'}
        alt={suggestion.title}
        className="suggestion-image"
      />

      <div className="suggestion-content">
        <h3 className="suggestion-title">{suggestion.title}</h3>

        <p className="suggestion-description">
          {suggestion.description}
        </p>

        <div className="chip-container">
          <span className="chip">{suggestion.occasion.replace('_', ' ')}</span>
          <span className="chip chip-outlined">{suggestion.bodyType.replace('_', ' ')}</span>
          <span className="chip chip-success">
            {Math.round(suggestion.confidence * 100)}% confidence
          </span>
        </div>

        <div className="color-container">
          {suggestion.colors.slice(0, 5).map((color, index) => (
            <div
              key={index}
              className="color-dot"
              style={{ backgroundColor: color.toLowerCase() }}
            />
          ))}
        </div>

        {suggestion.outfits && suggestion.outfits.length > 0 && (
          <div className="outfit-count">
            🛍️ {suggestion.outfits.length} outfit{suggestion.outfits.length !== 1 ? 's' : ''} recommended
          </div>
        )}

        <div className="action-container">
          <button
            className={`action-button ${suggestion.liked ? 'liked' : ''}`}
            onClick={() => toggleLike(suggestion.id)}
          >
            ❤️ {suggestion.liked ? 'Liked' : 'Like'}
          </button>

          <button
            className="action-button primary"
            onClick={() => viewSuggestionDetails(suggestion)}
          >
            👁️ View Details
          </button>
        </div>
      </div>
    </div>
  );

  const renderStarRating = () => (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          className={`star ${star <= feedbackRating ? 'active' : ''}`}
          onClick={() => setFeedbackRating(star)}
        >
          ⭐
        </button>
      ))}
    </div>
  );

  return (
    <div className="suggestions-page">
      <div className="container">
        <h1>AI Style Suggestions</h1>

        {/* Tab Navigation */}
        <div className="tab-container">
          <button
            className={`tab ${activeTab === 'generate' ? 'active' : ''}`}
            onClick={() => setActiveTab('generate')}
          >
            ✨ Generate New
          </button>
          <button
            className={`tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            📚 My Suggestions
          </button>
          <button
            className={`tab ${activeTab === 'trending' ? 'active' : ''}`}
            onClick={() => setActiveTab('trending')}
          >
            📈 Trending
          </button>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {/* Generate Tab */}
        {activeTab === 'generate' && (
          <div className="form-container">
            <h2>Generate Outfit from Your Profile</h2>
            <p className="form-description">
              We'll use your saved body type, style preferences, and measurements to create the perfect outfit for your occasion and budget.
            </p>

            <div className="form-grid">
              <div className="form-group">
                <label>Occasion *</label>
                <select
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  className="form-select"
                >
                  {occasions.map(occ => (
                    <option key={occ.value} value={occ.value}>
                      {occ.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Season/Weather</label>
                <select
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  className="form-select"
                >
                  {seasons.map(seasonOption => (
                    <option key={seasonOption.value} value={seasonOption.value}>
                      {seasonOption.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Budget Range</label>
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="form-select"
                >
                  {budgetRanges.map(range => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              className={`generate-button ${(!occasion || generating) ? 'disabled' : ''}`}
              onClick={generateSuggestion}
              disabled={!occasion || generating}
            >
              {generating ? '⏳ Generating...' : '✨ Generate AI Suggestion'}
            </button>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="suggestions-grid">
            {fetchingHistory ? (
              <div className="loading-state">
                <div className="loading-spinner">⏳</div>
                <p>Loading your suggestions...</p>
              </div>
            ) : suggestions.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">👗</div>
                <p>No suggestions yet. Generate your first AI-powered outfit suggestion!</p>
              </div>
            ) : (
              suggestions.map(renderSuggestionCard)
            )}
          </div>
        )}

        {/* Trending Tab */}
        {activeTab === 'trending' && (
          <div className="suggestions-grid">
            {trendingSuggestions.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📈</div>
                <p>No trending suggestions available at the moment.</p>
              </div>
            ) : (
              trendingSuggestions.map(renderSuggestionCard)
            )}
          </div>
        )}

        {/* Details Modal */}
        {detailsModalOpen && selectedSuggestion && (
          <div className="modal-overlay" onClick={() => setDetailsModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{selectedSuggestion.title}</h2>
                <button
                  className="close-button"
                  onClick={() => setDetailsModalOpen(false)}
                >
                  ✕
                </button>
              </div>

              <div className="modal-body">
                <p>{selectedSuggestion.description}</p>

                {/* Outfit Items */}
                <h3>Outfit Items</h3>
                {selectedSuggestion.items?.map((item, index) => (
                  <div key={index} className="outfit-item">
                    <h4>{item.category.toUpperCase()}: {item.description}</h4>
                    <p>Color: {item.color} | Style: {item.style}</p>
                  </div>
                ))}

                {/* Styling Tips */}
                {selectedSuggestion.tips && selectedSuggestion.tips.length > 0 && (
                  <>
                    <h3>Styling Tips</h3>
                    <ul>
                      {selectedSuggestion.tips.map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </>
                )}

                {/* Outfits */}
                {selectedSuggestion.outfits && selectedSuggestion.outfits.length > 0 && (
                  <>
                    <h3>Recommended Outfits</h3>
                    <div className="outfits-grid">
                      {selectedSuggestion.outfits.map((outfit) => (
                        <div key={outfit.id} className="outfit-card">
                          <div className="outfit-info">
                            <div className="outfit-header">
                              <h4 className="outfit-name">{outfit.name}</h4>
                              <span className="outfit-category">{outfit.category}</span>
                            </div>
                            
                            <div className="outfit-details">
                              <p className="outfit-brand">
                                <strong>Brand:</strong> {outfit.brand}
                              </p>
                              <p className="outfit-price">
                                <strong>Price Range:</strong> {outfit.price_range}
                              </p>
                            </div>

                            {outfit.fit_advice && (
                              <div className="outfit-advice">
                                <p className="advice-label">💡 Fit Advice:</p>
                                <p className="advice-text">{outfit.fit_advice}</p>
                              </div>
                            )}

                            {outfit.styling_tip && (
                              <div className="outfit-tip">
                                <p className="tip-label">✨ Styling Tip:</p>
                                <p className="tip-text">{outfit.styling_tip}</p>
                              </div>
                            )}

                            <button
                              className="outfit-buy-button"
                              onClick={() => window.open(outfit.google_link, '_blank')}
                            >
                              🛒 Shop Now
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="modal-footer">
                <button
                  className="feedback-button"
                  onClick={() => {
                    setDetailsModalOpen(false);
                    setFeedbackModalOpen(true);
                  }}
                >
                  ⭐ Rate This Suggestion
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Modal */}
        {feedbackModalOpen && (
          <div className="modal-overlay" onClick={() => setFeedbackModalOpen(false)}>
            <div className="modal-content feedback-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Rate This Suggestion</h2>
                <button
                  className="close-button"
                  onClick={() => setFeedbackModalOpen(false)}
                >
                  ✕
                </button>
              </div>

              <div className="modal-body">
                <p>How would you rate this suggestion?</p>
                {renderStarRating()}

                <textarea
                  className="feedback-textarea"
                  placeholder="Comments (optional)"
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="modal-footer">
                <button
                  className="cancel-button"
                  onClick={() => setFeedbackModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className={`submit-button ${!feedbackRating ? 'disabled' : ''}`}
                  onClick={submitFeedback}
                  disabled={!feedbackRating}
                >
                  Submit Feedback
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuggestionsPage;