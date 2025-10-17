"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutfitSuggestionService = void 0;
const axios_1 = __importDefault(require("axios"));
class OutfitSuggestionService {
    constructor() {
        this.openaiApiKey = process.env.OPENAI_API_KEY || '';
    }
    async generateOutfitSuggestion(input) {
        try {
            console.log('Generating AI outfit suggestion for:', input);
            // Create detailed prompt for AI
            const prompt = this.createOutfitPrompt(input);
            // Call OpenAI API
            const response = await axios_1.default.post('https://api.openai.com/v1/chat/completions', {
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: `
              You are a professional fashion stylist with expertise in body types, color theory, occasions, and current fashion trends. 
              Your job is to recommend detailed, practical outfit suggestions tailored to the user's request.

              You must return the response STRICTLY in JSON format with the following structure:

              {
                "outfit_name": string,
                "occasion": string,
                "body_type_suitability": [string],
                "style_description": string,
                "items": [
                  {
                    "name": string,
                    "category": string,
                    "price_range": string,
                    "brand": string,
                    "google_link": string,
                    "fit_advice": string,
                    "styling_tip": string
                  }
                ],
                "styling_overview": {
                  "color_palette": [string],
                  "seasonal_fit": string,
                  "how_to_wear": string,
                  "accessory_tip": string
                }
              }

              🧾 Rules:
              - Include at least 5 fashion items (e.g., top, bottom/dress, outerwear, shoes, and accessory).
              - Each item must have a valid **Google Shopping search link** (use 'site:hm.com' for H&M products).
              - Do NOT return affiliate or tracking links — only clean Google search URLs.
              - Use results relevant to the user’s region (for India: 'site:hm.com/en_in').
              - Ensure the JSON is valid and parseable (no markdown, no commentary, no extra text).
              - Output pure JSON only — no natural language outside the JSON object.
              - Provide realistic product prices and categories available on Google Shopping.
              `
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 1500,
                temperature: 0.7
            }, {
                headers: {
                    'Authorization': `Bearer ${this.openaiApiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            const aiResponse = response.data.choices[0].message.content;
            // Parse AI response into structured format
            const suggestion = this.parseAIResponse(aiResponse, input);
            return suggestion;
        }
        catch (error) {
            console.error('AI outfit suggestion error:', error.message);
            throw new Error('AI outfit suggestion service unavailable');
        }
    }
    createOutfitPrompt(input) {
        const { bodyType, occasion, gender, budget, season, colorPreferences } = input;
        return `
Create a detailed outfit suggestion for:
- Body Type: ${bodyType}
- Occasion: ${occasion}
- Gender: ${gender}
- Budget: ${budget || 'Mid-range'}
- Season: ${season || 'Current season'}
- Color Preferences: ${colorPreferences?.join(', ') || 'Any'}

Please provide a JSON response with the following structure:
{
  "title": "Outfit name/title",
  "description": "Brief description of the overall look",
  "items": [
    {
      "category": "tops/bottoms/footwear/accessories",
      "description": "Specific item description",
      "color": "Primary color",
      "style": "Style details",
      "searchTerms": ["keyword1", "keyword2", "keyword3"]
    }
  ],
  "colors": ["color1", "color2", "color3"],
  "tips": ["styling tip 1", "styling tip 2", "styling tip 3"],
  "confidence": 0.85
}

Focus on:
1. Flattering the ${bodyType} body type
2. Appropriate for ${occasion} occasions
3. Current fashion trends
4. Practical and achievable looks
5. Specific enough for product searches
6. Include 4-6 clothing items (tops, bottoms, footwear, accessories)
`;
    }
    parseAIResponse(aiResponse, input) {
        try {
            // Try to extract JSON from the response
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    title: parsed.title || `${input.occasion} Outfit`,
                    description: parsed.description || 'AI-generated outfit suggestion',
                    items: parsed.items || [],
                    colors: parsed.colors || ['navy', 'white', 'beige'],
                    tips: parsed.tips || ['Choose well-fitted pieces'],
                    confidence: parsed.confidence || 0.8
                };
            }
            // If JSON parsing fails, create structured response from text
            return this.parseTextResponse(aiResponse, input);
        }
        catch (error) {
            console.error('Error parsing AI response:', error);
            throw new Error('Failed to parse AI response');
        }
    }
    parseTextResponse(text, input) {
        // Extract outfit items from text response
        const items = [];
        // Look for clothing categories in the text
        const categories = ['top', 'shirt', 'blouse', 'dress', 'pants', 'jeans', 'skirt', 'shoes', 'jacket', 'blazer'];
        categories.forEach(category => {
            const regex = new RegExp(`(${category}[^.]*?)(?=\\.|$)`, 'gi');
            const matches = text.match(regex);
            if (matches) {
                matches.forEach(match => {
                    // items.push({
                    //   category: this.mapToCategory(category),
                    //   description: match.trim(),
                    //   color: this.extractColor(match) || 'neutral',
                    //   style: this.extractStyle(match) || 'classic',
                    //   searchTerms: this.generateSearchTerms(match, category)
                    // });
                    console.log(match);
                });
            }
        });
        return {
            title: `${input.occasion} Outfit for ${input.bodyType}`,
            description: 'AI-curated outfit suggestion tailored to your body type and occasion',
            items: items.slice(0, 6), // Limit to 6 items
            colors: this.extractColors(text),
            tips: this.extractTips(text),
            confidence: 0.75
        };
    }
    mapToCategory(item) {
        const categoryMap = {
            'top': 'tops',
            'shirt': 'tops',
            'blouse': 'tops',
            'dress': 'dresses',
            'pants': 'bottoms',
            'jeans': 'bottoms',
            'skirt': 'bottoms',
            'shoes': 'footwear',
            'jacket': 'outerwear',
            'blazer': 'outerwear'
        };
        return categoryMap[item.toLowerCase()] || 'accessories';
    }
    extractColor(text) {
        const colors = ['black', 'white', 'navy', 'blue', 'red', 'green', 'yellow', 'pink', 'purple', 'brown', 'gray', 'beige', 'cream'];
        for (const color of colors) {
            if (text.toLowerCase().includes(color)) {
                return color;
            }
        }
        return null;
    }
    extractStyle(text) {
        const styles = ['casual', 'formal', 'business', 'trendy', 'classic', 'bohemian', 'minimalist', 'sporty'];
        for (const style of styles) {
            if (text.toLowerCase().includes(style)) {
                return style;
            }
        }
        return null;
    }
    generateSearchTerms(description, category) {
        const words = description.toLowerCase().split(' ');
        const searchTerms = [category];
        // Add relevant descriptive words
        const relevantWords = words.filter(word => word.length > 3 &&
            !['the', 'and', 'with', 'for', 'that', 'this'].includes(word));
        searchTerms.push(...relevantWords.slice(0, 3));
        return searchTerms;
    }
    extractColors(text) {
        const colors = ['black', 'white', 'navy', 'blue', 'red', 'green', 'yellow', 'pink', 'purple', 'brown', 'gray', 'beige', 'cream'];
        const foundColors = [];
        colors.forEach(color => {
            if (text.toLowerCase().includes(color) && !foundColors.includes(color)) {
                foundColors.push(color);
            }
        });
        return foundColors.length > 0 ? foundColors : ['navy', 'white', 'beige'];
    }
    extractTips(text) {
        const tips = [];
        // Look for sentences that contain styling advice
        const sentences = text.split(/[.!?]+/);
        sentences.forEach(sentence => {
            const lowerSentence = sentence.toLowerCase();
            if (lowerSentence.includes('tip') ||
                lowerSentence.includes('style') ||
                lowerSentence.includes('wear') ||
                lowerSentence.includes('choose') ||
                lowerSentence.includes('pair')) {
                tips.push(sentence.trim());
            }
        });
        return tips.slice(0, 3);
    }
}
exports.OutfitSuggestionService = OutfitSuggestionService;
//# sourceMappingURL=outfitSuggestionService.js.map