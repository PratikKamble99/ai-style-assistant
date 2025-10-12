import axios from 'axios';

export interface AnalysisResult {
  detected: string;
  confidence: number;
  alternatives?: string[];
}

export interface StyleSuggestionInput {
  occasion: string;
  bodyType?: string;
  faceShape?: string;
  skinTone?: string;
  gender: string;
  styleType?: string[];
  preferences?: any;
}

export interface StyleSuggestionOutput {
  outfit: string;
  hairstyle?: string;
  accessories?: string;
  skincare?: string;
  colors: string[];
  imageUrl?: string;
}

export interface VirtualTryOnInput {
  userPhotoUrl: string;
  outfitDescription: string;
  stylePrompt?: string;
}

export class AIService {
  private openaiApiKey: string;
  private replicateApiToken: string;

  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY!;
    this.replicateApiToken = process.env.REPLICATE_API_TOKEN!;
  }

  async analyzeBodyType(photoUrl: string): Promise<AnalysisResult> {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4-vision-preview',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Analyze this full-body photo and determine the body type. 
                  Respond with one of: ECTOMORPH, MESOMORPH, ENDOMORPH, PEAR, APPLE, HOURGLASS, RECTANGLE, INVERTED_TRIANGLE.
                  Also provide confidence level (0-1) and brief reasoning.
                  Format: {"bodyType": "TYPE", "confidence": 0.85, "reasoning": "explanation"}`
                },
                {
                  type: 'image_url',
                  image_url: { url: photoUrl }
                }
              ]
            }
          ],
          max_tokens: 300
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = JSON.parse(response.data.choices[0].message.content);
      return {
        detected: result.bodyType,
        confidence: result.confidence
      };
    } catch (error) {
      console.error('Body type analysis error:', error);
      throw new Error('Failed to analyze body type');
    }
  }

  async analyzeFaceShape(photoUrl: string): Promise<AnalysisResult> {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4-vision-preview',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Analyze this face photo and determine the face shape.
                  Respond with one of: OVAL, ROUND, SQUARE, HEART, DIAMOND, OBLONG.
                  Also provide confidence level (0-1) and brief reasoning.
                  Format: {"faceShape": "SHAPE", "confidence": 0.85, "reasoning": "explanation"}`
                },
                {
                  type: 'image_url',
                  image_url: { url: photoUrl }
                }
              ]
            }
          ],
          max_tokens: 300
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = JSON.parse(response.data.choices[0].message.content);
      return {
        detected: result.faceShape,
        confidence: result.confidence
      };
    } catch (error) {
      console.error('Face shape analysis error:', error);
      throw new Error('Failed to analyze face shape');
    }
  }

  async analyzeSkinTone(photoUrl: string): Promise<AnalysisResult> {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4-vision-preview',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Analyze this photo and determine the skin tone.
                  Respond with one of: VERY_FAIR, FAIR, LIGHT, MEDIUM, OLIVE, TAN, DARK, VERY_DARK.
                  Also provide confidence level (0-1) and brief reasoning.
                  Format: {"skinTone": "TONE", "confidence": 0.85, "reasoning": "explanation"}`
                },
                {
                  type: 'image_url',
                  image_url: { url: photoUrl }
                }
              ]
            }
          ],
          max_tokens: 300
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = JSON.parse(response.data.choices[0].message.content);
      return {
        detected: result.skinTone,
        confidence: result.confidence
      };
    } catch (error) {
      console.error('Skin tone analysis error:', error);
      throw new Error('Failed to analyze skin tone');
    }
  }

  async generateStyleSuggestions(input: StyleSuggestionInput): Promise<StyleSuggestionOutput> {
    try {
      const prompt = `
        Generate personalized style suggestions for:
        - Occasion: ${input.occasion}
        - Body Type: ${input.bodyType}
        - Face Shape: ${input.faceShape}
        - Skin Tone: ${input.skinTone}
        - Gender: ${input.gender}
        - Style Preferences: ${input.styleType?.join(', ')}
        
        Provide detailed recommendations for:
        1. Outfit description (specific clothing items, fits, styles)
        2. Hairstyle suggestions
        3. Accessories recommendations
        4. Skincare tips
        5. Best color palette (5-7 colors)
        
        Format as JSON:
        {
          "outfit": "detailed outfit description",
          "hairstyle": "hairstyle suggestions",
          "accessories": "accessory recommendations",
          "skincare": "skincare tips",
          "colors": ["color1", "color2", "color3", "color4", "color5"]
        }
      `;

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a professional fashion stylist and grooming expert. Provide detailed, personalized style advice.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = JSON.parse(response.data.choices[0].message.content);
      
      // Optionally generate an AI image of the suggested outfit
      let imageUrl;
      try {
        imageUrl = await this.generateOutfitImage(result.outfit, input);
      } catch (imageError) {
        console.warn('Failed to generate outfit image:', imageError);
      }

      return {
        ...result,
        imageUrl
      };
    } catch (error) {
      console.error('Style suggestion error:', error);
      throw new Error('Failed to generate style suggestions');
    }
  }

  async generateOutfitImage(outfitDescription: string, userProfile: StyleSuggestionInput): Promise<string> {
    try {
      const prompt = `
        Fashion illustration of ${outfitDescription} 
        for ${userProfile.gender} with ${userProfile.bodyType} body type,
        ${userProfile.occasion} occasion, professional fashion sketch style,
        clean background, high quality, detailed
      `;

      const response = await axios.post(
        'https://api.replicate.com/v1/predictions',
        {
          version: 'stability-ai/stable-diffusion:27b93a2413e7f36cd83da926f3656280b2931564ff050bf9575f1fdf9bcd7478',
          input: {
            prompt,
            negative_prompt: 'blurry, low quality, distorted, inappropriate',
            width: 512,
            height: 768,
            num_inference_steps: 20,
            guidance_scale: 7.5
          }
        },
        {
          headers: {
            'Authorization': `Token ${this.replicateApiToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Poll for completion
      const predictionId = response.data.id;
      let result = response.data;
      
      while (result.status === 'starting' || result.status === 'processing') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const statusResponse = await axios.get(
          `https://api.replicate.com/v1/predictions/${predictionId}`,
          {
            headers: {
              'Authorization': `Token ${this.replicateApiToken}`
            }
          }
        );
        result = statusResponse.data;
      }

      if (result.status === 'succeeded') {
        return result.output[0];
      } else {
        throw new Error('Image generation failed');
      }
    } catch (error) {
      console.error('Outfit image generation error:', error);
      throw new Error('Failed to generate outfit image');
    }
  }

  async generateVirtualTryOn(input: VirtualTryOnInput): Promise<{ imageUrl: string }> {
    try {
      // This would use a virtual try-on model like TryOnDiffusion
      // For now, we'll use a placeholder implementation
      const prompt = `
        Virtual try-on: person wearing ${input.outfitDescription}
        ${input.stylePrompt || ''}, realistic, high quality, fashion photography
      `;

      // Similar implementation to generateOutfitImage but with try-on specific model
      // This is a simplified version - real implementation would use specialized try-on models
      
      return {
        imageUrl: 'https://placeholder-image-url.com/virtual-tryon.jpg'
      };
    } catch (error) {
      console.error('Virtual try-on error:', error);
      throw new Error('Failed to generate virtual try-on');
    }
  }
}