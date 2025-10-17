import axios from 'axios';

export interface AnalysisResult {
  detected: string;
  confidence: number;
  alternatives?: string[];
}

export interface BodyMeasurements {
  height?: number; // in cm
  chest?: number; // in cm
  waist?: number; // in cm
  hips?: number; // in cm
  shoulders?: number; // in cm
  inseam?: number; // in cm
  armLength?: number; // in cm
  neckCircumference?: number; // in cm
  thighCircumference?: number; // in cm
  confidence: number;
  keyPoints?: Array<{
    name: string;
    x: number;
    y: number;
    confidence: number;
  }>;
}

export interface DetailedAnalysisResult extends AnalysisResult {
  measurements?: BodyMeasurements;
  reasoning?: string;
  recommendations?: string[];
  keyPoints?: Array<{
    name: string;
    x: number;
    y: number;
    confidence: number;
  }>;
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
  products?: Array<{
    name: string;
    category: string;
    price: string;
    store: string;
    purchase_link: string;
    fit_advice?: string;
    styling_tip?: string;
  }>;
}

export interface VirtualTryOnInput {
  userPhotoUrl: string;
  outfitDescription: string;
  stylePrompt?: string;
}

export class AIService {
  private openaiApiKey: string;
  private replicateApiToken: string;
  private huggingFaceApiKey: string;

  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY || '';
    this.replicateApiToken = process.env.REPLICATE_API_TOKEN || '';
    this.huggingFaceApiKey = process.env.HUGGING_FACE_API_KEY || '';
  }

  /**
   * Comprehensive body analysis using multiple AI models
   */
  async analyzeBodyMeasurements(photoUrls: string[], userHeight?: number): Promise<DetailedAnalysisResult> {
    try {
      // Use Python AI service for analysis
      const results = await Promise.allSettled([
        this.analyzeBodyWithPythonAI(photoUrls, userHeight)
      ]);


      // Combine results from different models
      // const poseResult = results[0].status === 'fulfilled' ? results[0].value : null;
      const openaiResult = results[0].status === 'fulfilled' ? results[0].value : null;
      // const proportionResult = results[2].status === 'fulfilled' ? results[2].value : null;

      // Merge and validate results
      const combinedMeasurements = this.combineMeasurements([
        // poseResult?.measurements,
        openaiResult?.measurements,
        // proportionResult?.measurements
      ].filter(Boolean));

      // const averageConfidence = [poseResult, openaiResult, proportionResult]
      const averageConfidence = [openaiResult]
        .filter(r => r?.confidence)
        .reduce((sum, r) => sum + r!.confidence, 0) / 3;

      return {
        detected: this.determineBodyType(combinedMeasurements),
        confidence: averageConfidence || 0.75,
        measurements: combinedMeasurements,
        reasoning: this.generateMeasurementReasoning(combinedMeasurements),
        recommendations: this.generateFitRecommendations(combinedMeasurements)
      };
    } catch (error) {
      // console.error('Body measurements analysis error:', error);

      throw new Error('Failed to analyze body measurements');
    }
  }

  /**
   * Use Python AI service for detailed body analysis
   */
  private async analyzeBodyWithPythonAI(photoUrls: string[], userHeight?: number): Promise<DetailedAnalysisResult> {
    try {
      console.log('Using Python AI service for body analysis');
      
      // Call Python AI service
      const response = await axios.post('http://localhost:8000/analyze/body', {
        image_urls: photoUrls,
        user_height: userHeight
      }, {
        timeout: 30000, // 30 second timeout for AI processing
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const aiResult = response.data;

      console.log(aiResult)
      
      return {
        detected: aiResult.body_type || 'RECTANGLE',
        confidence: aiResult.confidence || 0.75,
        measurements: {
          chest: aiResult.measurements?.chest || 90,
          waist: aiResult.measurements?.waist || 70,
          hips: aiResult.measurements?.hips || 94,
          shoulders: aiResult.measurements?.shoulders || 40,
          confidence: aiResult.confidence || 0.75,
          keyPoints: aiResult.keypoints || []
        },
        reasoning: aiResult.analysis_details || 'AI analysis completed using computer vision',
        recommendations: aiResult.recommendations || ['Choose well-fitted clothing']
      };
    } catch (error: any) {
      console.error('Python AI service error:', error.message);
      throw new Error('AI body analysis service unavailable');
    }
  }

  /**
   * Use pose estimation model for body keypoint detection
   */
  private async analyzePoseEstimation(photoUrl: string): Promise<DetailedAnalysisResult> {
    try {
      // Using MediaPipe Pose or similar model via Hugging Face
      const response = await axios.post(
        'https://api-inference.huggingface.co/models/google/movenet-singlepose-lightning',
        { inputs: photoUrl },
        {
          headers: {
            'Authorization': `Bearer ${this.huggingFaceApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const keypoints = response.data;
      const measurements = this.calculateMeasurementsFromKeypoints(keypoints);

      return {
        detected: this.determineBodyType(measurements),
        confidence: 0.8,
        measurements,
        keyPoints: keypoints
      };
    } catch (error) {
      console.error('Pose estimation error:', error);
      throw new Error('Pose estimation service unavailable');
    }
  }

  /**
   * Use OpenAI Vision for detailed body analysis
   */
  private async analyzeBodyWithOpenAI(photoUrls: string[], userHeight?: number): Promise<DetailedAnalysisResult> {
    try {
      const heightContext = userHeight ? `The person's height is ${userHeight}cm. ` : '';
      
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              // content: [
              //   {
              //     type: 'text',
              //     text: `${heightContext}Analyze these full-body photos and provide detailed body measurements and proportions. 
                  
              //     Please estimate:
              //     1. Body type (ECTOMORPH, MESOMORPH, ENDOMORPH, PEAR, APPLE, HOURGLASS, RECTANGLE, INVERTED_TRIANGLE)
              //     2. Approximate measurements in cm (chest, waist, hips, shoulders)
              //     3. Body proportions and ratios
              //     4. Fit recommendations for clothing
                  
              //     Consider multiple angles if provided. Be as accurate as possible.
                  
              //     Format response as JSON:
              //     {
              //       "bodyType": "TYPE",
              //       "measurements": {
              //         "chest": 90,
              //         "waist": 75,
              //         "hips": 95,
              //         "shoulders": 42,
              //         "confidence": 0.85
              //       },
              //       "proportions": {
              //         "waistToHipRatio": 0.79,
              //         "shoulderToWaistRatio": 1.4,
              //         "bustToWaistRatio": 1.2
              //       },
              //       "confidence": 0.85,
              //       "reasoning": "detailed explanation",
              //       "recommendations": ["fit tip 1", "fit tip 2"]
              //     }`
              //   },
              //   ...photoUrls.map(url => ({
              //     type: 'image_url' as const,
              //     image_url: { url }
              //   }))
              // ]
              content: [
                { type: "text", text: "Estimate the person’s body proportions (shoulder, chest, waist, hip ratios) from this image for clothing fit assistance." },
                ...photoUrls.map(url => ({
                  type: 'image_url' as const,
                  image_url: { url }
                }))
              ]
            }
          ],
          max_tokens: 800
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(response.data.choices[0].message)

      const result = JSON.parse(response.data.choices[0].message.content);
      
      return {
        detected: result.bodyType,
        confidence: result.confidence,
        measurements: result.measurements,
        reasoning: result.reasoning,
        recommendations: result.recommendations
      };
    } catch (error) {
      console.error('OpenAI body analysis error:', error);
      throw new Error(`OpenAI body analysis error: ${error}`

      )
      // return this.getMockOpenAIAnalysis();
    }
  }

  /**
   * Analyze body proportions using computer vision
   */
  private async analyzeBodyProportions(photoUrls: string[]): Promise<DetailedAnalysisResult> {
    try {
      // This would use a specialized body analysis model
      // For now, implementing with Replicate's body analysis models
      
      const response = await axios.post(
        'https://api.replicate.com/v1/predictions',
        {
          version: 'anthropics/claude-3-vision:latest', // Placeholder - would use actual body analysis model
          input: {
            image: photoUrls[0],
            prompt: 'Analyze body proportions and measurements from this photo'
          }
        },
        {
          headers: {
            'Authorization': `Token ${this.replicateApiToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Poll for completion (simplified)
      const result = await this.pollReplicateResult(response.data.id);
      
      return this.parseProportionAnalysis(result);
    } catch (error) {
      console.error('Body proportion analysis error:', error);
      throw new Error('Body proportion analysis service unavailable');
    }
  }

  /**
   * Calculate measurements from pose keypoints
   */
  private calculateMeasurementsFromKeypoints(keypoints: any[]): BodyMeasurements {
    // This is a simplified calculation - real implementation would be more complex
    const measurements: BodyMeasurements = {
      confidence: 0.75
    };

    try {
      // Find key body points
      const leftShoulder = keypoints.find(kp => kp.name === 'left_shoulder');
      const rightShoulder = keypoints.find(kp => kp.name === 'right_shoulder');
      const leftHip = keypoints.find(kp => kp.name === 'left_hip');
      const rightHip = keypoints.find(kp => kp.name === 'right_hip');

      if (leftShoulder && rightShoulder) {
        // Calculate shoulder width (this is simplified - would need calibration)
        const shoulderDistance = Math.sqrt(
          Math.pow(rightShoulder.x - leftShoulder.x, 2) + 
          Math.pow(rightShoulder.y - leftShoulder.y, 2)
        );
        measurements.shoulders = Math.round(shoulderDistance * 0.4); // Rough conversion
      }

      if (leftHip && rightHip) {
        // Calculate hip width
        const hipDistance = Math.sqrt(
          Math.pow(rightHip.x - leftHip.x, 2) + 
          Math.pow(rightHip.y - leftHip.y, 2)
        );
        measurements.hips = Math.round(hipDistance * 0.5); // Rough conversion
      }

      // Estimate other measurements based on proportions
      if (measurements.shoulders && measurements.hips) {
        measurements.chest = Math.round(measurements.shoulders * 2.1);
        measurements.waist = Math.round(measurements.hips * 0.8);
      }

    } catch (error) {
      console.error('Keypoint calculation error:', error);
    }

    return measurements;
  }

  /**
   * Combine measurements from multiple sources
   */
  private combineMeasurements(measurementsList: (BodyMeasurements | undefined)[]): BodyMeasurements {
    const validMeasurements = measurementsList.filter(Boolean) as BodyMeasurements[];
    
    if (validMeasurements.length === 0) {
      return { confidence: 0.5 };
    }

    const combined: BodyMeasurements = {
      confidence: validMeasurements.reduce((sum, m) => sum + m.confidence, 0) / validMeasurements.length
    };

    // Average measurements where available
    const fields = ['chest', 'waist', 'hips', 'shoulders', 'inseam', 'armLength', 'neckCircumference', 'thighCircumference'] as const;
    
    fields.forEach(field => {
      const values = validMeasurements
        .map(m => m[field])
        .filter(v => v !== undefined) as number[];
      
      if (values.length > 0) {
        combined[field] = Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
      }
    });

    return combined;
  }

  /**
   * Determine body type from measurements
   */
  private determineBodyType(measurements: BodyMeasurements): string {
    if (!measurements.chest || !measurements.waist || !measurements.hips) {
      return 'RECTANGLE'; // Default
    }

    const waistToHipRatio = measurements.waist / measurements.hips;
    const chestToWaistRatio = measurements.chest / measurements.waist;
    const shoulderToHipRatio = measurements.shoulders ? measurements.shoulders / measurements.hips : 1;

    // Body type classification logic
    if (waistToHipRatio <= 0.75 && chestToWaistRatio >= 1.3) {
      return 'HOURGLASS';
    } else if (waistToHipRatio > 0.85 && shoulderToHipRatio >= 1.05) {
      return 'INVERTED_TRIANGLE';
    } else if (waistToHipRatio <= 0.75 && shoulderToHipRatio <= 0.95) {
      return 'PEAR';
    } else if (waistToHipRatio > 0.85 && chestToWaistRatio <= 1.1) {
      return 'APPLE';
    } else if (Math.abs(measurements.chest - measurements.hips) <= 5 && 
               Math.abs(measurements.waist - measurements.chest) <= 10) {
      return 'RECTANGLE';
    } else {
      // Default classification based on overall build
      const avgMeasurement = (measurements.chest + measurements.waist + measurements.hips) / 3;
      if (avgMeasurement < 80) return 'ECTOMORPH';
      if (avgMeasurement > 100) return 'ENDOMORPH';
      return 'MESOMORPH';
    }
  }

  /**
   * Generate reasoning for measurements
   */
  private generateMeasurementReasoning(measurements: BodyMeasurements): string {
    const parts = [];
    
    if (measurements.chest && measurements.waist && measurements.hips) {
      const waistToHipRatio = measurements.waist / measurements.hips;
      const chestToWaistRatio = measurements.chest / measurements.waist;
      
      parts.push(`Waist-to-hip ratio: ${waistToHipRatio.toFixed(2)}`);
      parts.push(`Chest-to-waist ratio: ${chestToWaistRatio.toFixed(2)}`);
    }
    
    if (measurements.shoulders && measurements.hips) {
      const shoulderToHipRatio = measurements.shoulders / measurements.hips;
      parts.push(`Shoulder-to-hip ratio: ${shoulderToHipRatio.toFixed(2)}`);
    }
    
    parts.push(`Analysis confidence: ${Math.round(measurements.confidence * 100)}%`);
    
    return parts.join('. ');
  }

  /**
   * Generate fit recommendations
   */
  private generateFitRecommendations(measurements: BodyMeasurements): string[] {
    const recommendations = [];
    
    if (!measurements.chest || !measurements.waist || !measurements.hips) {
      return ['Complete body measurements needed for detailed recommendations'];
    }

    const bodyType = this.determineBodyType(measurements);
    
    switch (bodyType) {
      case 'HOURGLASS':
        recommendations.push('Emphasize your waist with fitted styles');
        recommendations.push('Choose tops and bottoms that balance your proportions');
        recommendations.push('Avoid boxy or oversized clothing that hides your shape');
        break;
      case 'PEAR':
        recommendations.push('Balance your silhouette with structured shoulders');
        recommendations.push('Choose A-line or straight-leg bottoms');
        recommendations.push('Highlight your upper body with interesting necklines');
        break;
      case 'INVERTED_TRIANGLE':
        recommendations.push('Add volume to your lower half');
        recommendations.push('Choose softer shoulder lines');
        recommendations.push('Opt for wider leg pants or A-line skirts');
        break;
      case 'APPLE':
        recommendations.push('Create a defined waistline');
        recommendations.push('Choose V-necks to elongate your torso');
        recommendations.push('Avoid tight-fitting clothes around the midsection');
        break;
      case 'RECTANGLE':
        recommendations.push('Create curves with strategic layering');
        recommendations.push('Add definition to your waist with belts');
        recommendations.push('Choose clothes with interesting textures and patterns');
        break;
      default:
        recommendations.push('Focus on well-fitted clothing that flatters your unique proportions');
    }
    
    return recommendations;
  }

  async analyzeBodyType(photoUrl: string): Promise<AnalysisResult> {
    try {
      console.log('Analyzing body type with Python AI service');
      
      const response = await axios.post('http://localhost:8000/analyze/body-type', {
        image_url: photoUrl
      }, {
        timeout: 15000,
        headers: { 'Content-Type': 'application/json' }
      });

      const result = response.data;
      
      return {
        detected: result.body_type || 'RECTANGLE',
        confidence: result.confidence || 0.75,
        alternatives: result.alternatives || []
      };
    } catch (error: any) {
      console.error('Python AI body type analysis error:', error.message);
      return {
        detected: 'RECTANGLE',
        confidence: 0.75
      };
    }
  }

  async analyzeFaceShape(photoUrl: string): Promise<AnalysisResult> {
    try {
      console.log('Analyzing face shape with Python AI service');
      
      const response = await axios.post('http://localhost:8000/analyze/face-shape', {
        image_url: photoUrl
      }, {
        timeout: 15000,
        headers: { 'Content-Type': 'application/json' }
      });

      const result = response.data;

      
      return {
        detected: result.face_shape || 'OVAL',
        confidence: result.confidence || 0.75,
        alternatives: result.alternatives || []
      };
    } catch (error: any) {
      console.error('Python AI face shape analysis error:', error.message);
      throw new Error('Face shape analysis service unavailable');
    }
  }

  async analyzeSkinTone(photoUrl: string): Promise<AnalysisResult> {
    try {
      console.log('Analyzing skin tone with Python AI service');
      
      const response = await axios.post('http://localhost:8000/analyze/skin-tone', {
        image_url: photoUrl
      }, {
        timeout: 15000,
        headers: { 'Content-Type': 'application/json' }
      });

      const result = response.data;
      
      
      return {
        detected: result.skin_tone || 'MEDIUM',
        confidence: result.confidence || 0.75,
        alternatives: result.alternatives || []
      };
    } catch (error: any) {
      console.error('Python AI skin tone analysis error:', error.message);
      throw new Error('Skin tone analysis service unavailable');
    }
  }

  async generateStyleSuggestions(input: StyleSuggestionInput): Promise<StyleSuggestionOutput> {
    try {
      console.log('🎨 Generating AI style suggestions with OpenAI...');
      
      const prompt = `
        As a professional fashion stylist, create a detailed, personalized outfit recommendation for:
        
        **Client Profile:**
        - Occasion: ${input.occasion}
        - Body Type: ${input.bodyType || 'Not specified'}
        - Face Shape: ${input.faceShape || 'Not specified'}
        - Skin Tone: ${input.skinTone || 'Not specified'}
        - Gender: ${input.gender}
        - Style Preferences: ${input.styleType?.join(', ') || 'Versatile'}
        - Budget: ${input.preferences?.budget || 'Medium'}
        - Season: ${this.getCurrentSeason()}
        
        **Requirements:**
        1. Create a specific, detailed outfit description mentioning exact clothing items (e.g., "navy blue blazer", "white cotton shirt", "dark wash jeans")
        2. Include colors, fabrics, and fits that flatter the body type
        3. Suggest complementary hairstyle
        4. Recommend specific accessories
        5. Provide skincare/makeup tips
        6. Choose a cohesive color palette
        7. **IMPORTANT**: Include specific product recommendations with actual shopping links from popular Indian e-commerce sites (Myntra, Amazon India, Flipkart, Ajio)
        
        **Product Link Format:** For each clothing item mentioned, provide actual shopping links in this format:
        - "For the navy blazer, check out: https://www.myntra.com/blazers/[specific-product-link]"
        - "Find similar white shirts at: https://www.amazon.in/dp/[product-id]"
        - Include 2-3 product links per major clothing item (top, bottom, shoes, accessories)
        
        Respond in JSON format:
        {
          "outfit": "Detailed outfit description with specific items, colors, and styling details",
          "hairstyle": "Specific hairstyle recommendation with styling tips",
          "accessories": "Detailed accessory recommendations including jewelry, bags, shoes",
          "skincare": "Skincare and makeup tips for the occasion and skin tone",
          "colors": ["#HEX1", "#HEX2", "#HEX3", "#HEX4", "#HEX5"],
          "products": [
            {
              "name": "Slim Fit Denim Shirt",
              "category": "top",
              "price": "₹1,999",
              "store": "Myntra",
              "purchase_link": "https://www.myntra.com/shirts/levis/slim-fit-denim-shirt/p/12345678",
              "fit_advice": "Choose your usual size to achieve a fitted look.",
              "styling_tip": "Roll up the sleeves for a relaxed look."
            },
            {
              "name": "High-Waisted Black Trousers",
              "category": "bottom",
              "price": "₹2,499",
              "store": "H&M",
              "purchase_link": "https://www2.hm.com/en_in/productpage.0987654321.html",
              "fit_advice": "Size up for a more comfortable fit around the waist.",
              "styling_tip": "Tuck in your top to emphasize the high waist."
            },
            {
              "name": "Classic Black Pumps",
              "category": "shoes",
              "price": "₹3,999",
              "store": "Amazon",
              "purchase_link": "https://www.amazon.in/dp/B08ABCD1234",
              "fit_advice": "Go half a size up for all-day comfort.",
              "styling_tip": "Perfect for both office and evening looks."
            }
          ]
        }
      `;

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are an expert fashion stylist with 15+ years of experience. You understand body types, color theory, current trends, and how to create flattering, occasion-appropriate outfits. Always provide specific, actionable advice that clients can easily follow and shop for.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1200,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const aiContent = response.data.choices[0].message.content;
      console.log('✅ Received AI response');
      
      // Parse the JSON response
      let result;
      try {
        // Extract JSON from the response (in case there's extra text)
        const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.warn('⚠️ Failed to parse AI JSON, creating structured response...');
        result = this.parseTextToStructuredResponse(aiContent, input);
      }
      
      // Validate and enhance the result
      result = this.validateAndEnhanceResult(result, input);
      
      // Optionally generate an AI image of the suggested outfit
      let imageUrl;
      try {
        console.log('🖼️ Generating outfit visualization...');
        imageUrl = await this.generateOutfitImage(result.outfit, input);
        console.log('✅ Outfit image generated successfully');
      } catch (imageError) {
        console.warn('⚠️ Failed to generate outfit image:', imageError);
      }

      return {
        ...result,
        imageUrl
      };
    } catch (error: any) {
      console.error('❌ Style suggestion error:', error.message);
      
      throw new Error('Style suggestion service unavailable');
    }
  }

  private getCurrentSeason(): string {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return 'Spring';
    if (month >= 6 && month <= 8) return 'Summer';
    if (month >= 9 && month <= 11) return 'Fall';
    return 'Winter';
  }

  private parseTextToStructuredResponse(text: string, input: StyleSuggestionInput): StyleSuggestionOutput {
    // Extract outfit description (usually the longest paragraph)
    const paragraphs = text.split('\n').filter(p => p.trim().length > 50);
    const outfit = paragraphs[0] || `A stylish ${input.occasion.toLowerCase()} outfit perfect for your ${input.bodyType || 'body type'}`;
    
    // Extract colors mentioned in text
    const colorRegex = /#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}|\b(navy|black|white|blue|red|green|beige|gray|brown|pink|purple|yellow|orange)\b/gi;
    const foundColors = text.match(colorRegex) || [];
    const colors = foundColors.slice(0, 5);
    
    // If no colors found, use defaults based on occasion
    if (colors.length === 0) {
      colors.push(...this.getDefaultColorsForOccasion(input.occasion));
    }

    return {
      outfit,
      hairstyle: this.extractSection(text, 'hair') || `A ${input.faceShape || 'flattering'} hairstyle that complements your face shape`,
      accessories: this.extractSection(text, 'accessor') || 'Complementary accessories to complete the look',
      skincare: this.extractSection(text, 'skin|makeup') || `Skincare and makeup tips for ${input.skinTone || 'your skin tone'}`,
      colors: colors.slice(0, 5)
    };
  }

  private extractSection(text: string, keyword: string): string | null {
    const regex = new RegExp(`[^.]*${keyword}[^.]*\\.`, 'gi');
    const matches = text.match(regex);
    return matches ? matches[0].trim() : null;
  }

  private validateAndEnhanceResult(result: any, input: StyleSuggestionInput): StyleSuggestionOutput {
    // Ensure all required fields exist
    const validated: StyleSuggestionOutput = {
      outfit: result.outfit || `A carefully curated ${input.occasion.toLowerCase()} outfit`,
      hairstyle: result.hairstyle || 'A hairstyle that complements your features',
      accessories: result.accessories || 'Thoughtfully selected accessories',
      skincare: result.skincare || 'Skincare tips for a polished look',
      colors: Array.isArray(result.colors) ? result.colors.slice(0, 5) : this.getDefaultColorsForOccasion(input.occasion)
    };

    // Enhance outfit description if it's too generic
    if (validated.outfit.length < 100) {
      validated.outfit = this.enhanceOutfitDescription(validated.outfit, input);
    }

    return validated;
  }

  private enhanceOutfitDescription(outfit: string, input: StyleSuggestionInput): string {
    const enhancements = [];
    
    if (input.bodyType) {
      enhancements.push(`tailored to flatter your ${input.bodyType.toLowerCase()} body type`);
    }
    
    if (input.skinTone) {
      enhancements.push(`in colors that complement your ${input.skinTone.toLowerCase()} skin tone`);
    }
    
    const season = this.getCurrentSeason();
    enhancements.push(`perfect for ${season.toLowerCase()} weather`);
    
    return `${outfit}. This look is ${enhancements.join(', ')}, ensuring you look and feel confident for your ${input.occasion.toLowerCase()} occasion.`;
  }

  private getDefaultColorsForOccasion(occasion: string): string[] {
    const colorMap: { [key: string]: string[] } = {
      CASUAL: ['#4A90E2', '#FFFFFF', '#8E8E93', '#34C759', '#FF9500'],
      OFFICE: ['#1D1D1F', '#FFFFFF', '#007AFF', '#8E8E93', '#AF52DE'],
      DATE: ['#FF2D92', '#1D1D1F', '#FFFFFF', '#FF9500', '#AF52DE'],
      WEDDING: ['#AF52DE', '#FF9500', '#34C759', '#FFFFFF', '#8E8E93'],
      PARTY: ['#FF2D92', '#1D1D1F', '#FFD60A', '#AF52DE', '#FFFFFF'],
      FORMAL_EVENT: ['#1D1D1F', '#FFFFFF', '#007AFF', '#8E8E93', '#AF52DE'],
      VACATION: ['#34C759', '#FF9500', '#007AFF', '#FFFFFF', '#FFD60A'],
      WORKOUT: ['#1D1D1F', '#8E8E93', '#34C759', '#FF9500', '#007AFF'],
      INTERVIEW: ['#1D1D1F', '#FFFFFF', '#007AFF', '#8E8E93', '#34C759']
    };
    
    return colorMap[occasion] || colorMap.CASUAL;
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

  /**
   * Helper method to poll Replicate results
   */
  private async pollReplicateResult(predictionId: string): Promise<any> {
    let attempts = 0;
    const maxAttempts = 30;
    
    while (attempts < maxAttempts) {
      try {
        const response = await axios.get(
          `https://api.replicate.com/v1/predictions/${predictionId}`,
          {
            headers: {
              'Authorization': `Token ${this.replicateApiToken}`
            }
          }
        );
        
        const result = response.data;
        
        if (result.status === 'succeeded') {
          return result.output;
        } else if (result.status === 'failed') {
          throw new Error('Replicate prediction failed');
        }
        
        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, 2000));
        attempts++;
      } catch (error) {
        console.error('Polling error:', error);
        attempts++;
      }
    }
    
    throw new Error('Replicate prediction timed out');
  }

  /**
   * Parse proportion analysis results
   */
  private parseProportionAnalysis(result: any): DetailedAnalysisResult {
    // Parse the actual model output
    return {
      detected: result.bodyType || 'UNKNOWN',
      confidence: result.confidence || 0,
      measurements: result.measurements || { confidence: 0 },
      reasoning: result.reasoning || 'Analysis completed'
    };
  }
}