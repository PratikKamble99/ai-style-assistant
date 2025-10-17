export interface AnalysisResult {
    detected: string;
    confidence: number;
    alternatives?: string[];
}
export interface BodyMeasurements {
    height?: number;
    chest?: number;
    waist?: number;
    hips?: number;
    shoulders?: number;
    inseam?: number;
    armLength?: number;
    neckCircumference?: number;
    thighCircumference?: number;
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
export declare class AIService {
    private openaiApiKey;
    private replicateApiToken;
    private huggingFaceApiKey;
    constructor();
    /**
     * Comprehensive body analysis using multiple AI models
     */
    analyzeBodyMeasurements(photoUrls: string[], userHeight?: number): Promise<DetailedAnalysisResult>;
    /**
     * Use Python AI service for detailed body analysis
     */
    private analyzeBodyWithPythonAI;
    /**
     * Use pose estimation model for body keypoint detection
     */
    private analyzePoseEstimation;
    /**
     * Use OpenAI Vision for detailed body analysis
     */
    private analyzeBodyWithOpenAI;
    /**
     * Analyze body proportions using computer vision
     */
    private analyzeBodyProportions;
    /**
     * Calculate measurements from pose keypoints
     */
    private calculateMeasurementsFromKeypoints;
    /**
     * Combine measurements from multiple sources
     */
    private combineMeasurements;
    /**
     * Determine body type from measurements
     */
    private determineBodyType;
    /**
     * Generate reasoning for measurements
     */
    private generateMeasurementReasoning;
    /**
     * Generate fit recommendations
     */
    private generateFitRecommendations;
    analyzeBodyType(photoUrl: string): Promise<AnalysisResult>;
    analyzeFaceShape(photoUrl: string): Promise<AnalysisResult>;
    analyzeSkinTone(photoUrl: string): Promise<AnalysisResult>;
    generateStyleSuggestions(input: StyleSuggestionInput): Promise<StyleSuggestionOutput>;
    private getCurrentSeason;
    private parseTextToStructuredResponse;
    private extractSection;
    private validateAndEnhanceResult;
    private enhanceOutfitDescription;
    private getDefaultColorsForOccasion;
    generateOutfitImage(outfitDescription: string, userProfile: StyleSuggestionInput): Promise<string>;
    generateVirtualTryOn(input: VirtualTryOnInput): Promise<{
        imageUrl: string;
    }>;
    /**
     * Helper method to poll Replicate results
     */
    private pollReplicateResult;
    /**
     * Parse proportion analysis results
     */
    private parseProportionAnalysis;
}
//# sourceMappingURL=aiService.d.ts.map