import { BodyType, Occasion, Gender } from '@prisma/client';
export interface OutfitSuggestionInput {
    bodyType: BodyType;
    occasion: Occasion;
    gender: Gender;
    budget?: string;
    season?: string;
    colorPreferences?: string[];
}
export interface OutfitItem {
    name: string;
    category: string;
    price_range: string;
    brand: string;
    google_link: string;
    fit_advice: string;
    styling_tip: string;
}
export interface OutfitSuggestion {
    title: string;
    description: string;
    items: OutfitItem[];
    colors: string[];
    tips: string[];
    confidence: number;
}
export declare class OutfitSuggestionService {
    private openaiApiKey;
    constructor();
    generateOutfitSuggestion(input: OutfitSuggestionInput): Promise<OutfitSuggestion>;
    private createOutfitPrompt;
    private parseAIResponse;
    private parseTextResponse;
    private mapToCategory;
    private extractColor;
    private extractStyle;
    private generateSearchTerms;
    private extractColors;
    private extractTips;
}
//# sourceMappingURL=outfitSuggestionService.d.ts.map