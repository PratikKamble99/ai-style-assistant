import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
export declare const validate: (schema: {
    body?: z.ZodSchema;
    query?: z.ZodSchema;
    params?: z.ZodSchema;
}) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const commonSchemas: {
    email: z.ZodString;
    password: z.ZodString;
    name: z.ZodString;
    uuid: z.ZodString;
    url: z.ZodString;
    positiveNumber: z.ZodNumber;
    rating: z.ZodNumber;
    page: z.ZodPipeline<z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>, z.ZodNumber>;
    limit: z.ZodPipeline<z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>, z.ZodNumber>;
};
export declare const authSchemas: {
    register: {
        body: z.ZodObject<{
            email: z.ZodString;
            password: z.ZodString;
            name: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            email: string;
            password: string;
            name: string;
        }, {
            email: string;
            password: string;
            name: string;
        }>;
    };
    login: {
        body: z.ZodObject<{
            email: z.ZodString;
            password: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            email: string;
            password: string;
        }, {
            email: string;
            password: string;
        }>;
    };
    googleLogin: {
        body: z.ZodObject<{
            idToken: z.ZodString;
            accessToken: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            idToken: string;
            accessToken?: string | undefined;
        }, {
            idToken: string;
            accessToken?: string | undefined;
        }>;
    };
};
export declare const profileSchemas: {
    update: {
        body: z.ZodObject<{
            name: z.ZodOptional<z.ZodString>;
            gender: z.ZodOptional<z.ZodEnum<["MALE", "FEMALE", "NON_BINARY", "PREFER_NOT_TO_SAY"]>>;
            height: z.ZodOptional<z.ZodNumber>;
            weight: z.ZodOptional<z.ZodNumber>;
            bodyType: z.ZodOptional<z.ZodEnum<["ECTOMORPH", "MESOMORPH", "ENDOMORPH", "PEAR", "APPLE", "HOURGLASS", "RECTANGLE", "INVERTED_TRIANGLE"]>>;
            faceShape: z.ZodOptional<z.ZodEnum<["OVAL", "ROUND", "SQUARE", "HEART", "DIAMOND", "OBLONG"]>>;
            skinTone: z.ZodOptional<z.ZodEnum<["VERY_FAIR", "FAIR", "LIGHT", "MEDIUM", "OLIVE", "TAN", "DARK", "VERY_DARK"]>>;
        }, "strip", z.ZodTypeAny, {
            name?: string | undefined;
            gender?: "MALE" | "FEMALE" | "NON_BINARY" | "PREFER_NOT_TO_SAY" | undefined;
            height?: number | undefined;
            weight?: number | undefined;
            bodyType?: "ECTOMORPH" | "MESOMORPH" | "ENDOMORPH" | "PEAR" | "APPLE" | "HOURGLASS" | "RECTANGLE" | "INVERTED_TRIANGLE" | undefined;
            faceShape?: "OVAL" | "ROUND" | "SQUARE" | "HEART" | "DIAMOND" | "OBLONG" | undefined;
            skinTone?: "VERY_FAIR" | "FAIR" | "LIGHT" | "MEDIUM" | "OLIVE" | "TAN" | "DARK" | "VERY_DARK" | undefined;
        }, {
            name?: string | undefined;
            gender?: "MALE" | "FEMALE" | "NON_BINARY" | "PREFER_NOT_TO_SAY" | undefined;
            height?: number | undefined;
            weight?: number | undefined;
            bodyType?: "ECTOMORPH" | "MESOMORPH" | "ENDOMORPH" | "PEAR" | "APPLE" | "HOURGLASS" | "RECTANGLE" | "INVERTED_TRIANGLE" | undefined;
            faceShape?: "OVAL" | "ROUND" | "SQUARE" | "HEART" | "DIAMOND" | "OBLONG" | undefined;
            skinTone?: "VERY_FAIR" | "FAIR" | "LIGHT" | "MEDIUM" | "OLIVE" | "TAN" | "DARK" | "VERY_DARK" | undefined;
        }>;
    };
};
export declare const photoSchemas: {
    add: {
        body: z.ZodObject<{
            url: z.ZodEffects<z.ZodString, string, string>;
            type: z.ZodEnum<["FACE", "FULL_BODY", "OUTFIT"]>;
        }, "strip", z.ZodTypeAny, {
            url: string;
            type: "FACE" | "FULL_BODY" | "OUTFIT";
        }, {
            url: string;
            type: "FACE" | "FULL_BODY" | "OUTFIT";
        }>;
    };
};
export declare const aiSchemas: {
    analyzePhoto: {
        body: z.ZodObject<{
            photoUrl: z.ZodString;
            analysisType: z.ZodEnum<["BODY_TYPE", "FACE_SHAPE", "SKIN_TONE"]>;
        }, "strip", z.ZodTypeAny, {
            photoUrl: string;
            analysisType: "BODY_TYPE" | "FACE_SHAPE" | "SKIN_TONE";
        }, {
            photoUrl: string;
            analysisType: "BODY_TYPE" | "FACE_SHAPE" | "SKIN_TONE";
        }>;
    };
    getSuggestions: {
        body: z.ZodObject<{
            occasion: z.ZodEnum<["CASUAL", "OFFICE", "DATE", "WEDDING", "PARTY", "FORMAL_EVENT", "VACATION", "WORKOUT", "INTERVIEW"]>;
            preferences: z.ZodOptional<z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>>;
        }, "strip", z.ZodTypeAny, {
            occasion: "CASUAL" | "OFFICE" | "DATE" | "WEDDING" | "PARTY" | "FORMAL_EVENT" | "VACATION" | "WORKOUT" | "INTERVIEW";
            preferences?: {} | undefined;
        }, {
            occasion: "CASUAL" | "OFFICE" | "DATE" | "WEDDING" | "PARTY" | "FORMAL_EVENT" | "VACATION" | "WORKOUT" | "INTERVIEW";
            preferences?: {} | undefined;
        }>;
    };
    virtualTryOn: {
        body: z.ZodObject<{
            userPhotoUrl: z.ZodString;
            outfitDescription: z.ZodString;
            stylePrompt: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            userPhotoUrl: string;
            outfitDescription: string;
            stylePrompt?: string | undefined;
        }, {
            userPhotoUrl: string;
            outfitDescription: string;
            stylePrompt?: string | undefined;
        }>;
    };
    feedback: {
        body: z.ZodObject<{
            suggestionId: z.ZodString;
            rating: z.ZodNumber;
            liked: z.ZodBoolean;
            comment: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            suggestionId: string;
            rating: number;
            liked: boolean;
            comment?: string | undefined;
        }, {
            suggestionId: string;
            rating: number;
            liked: boolean;
            comment?: string | undefined;
        }>;
    };
    suggestionHistory: {
        query: z.ZodObject<{
            page: z.ZodPipeline<z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>, z.ZodNumber>;
            limit: z.ZodPipeline<z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>, z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            page: number;
            limit: number;
        }, {
            page?: string | undefined;
            limit?: string | undefined;
        }>;
    };
};
export declare const productSchemas: {
    search: {
        query: z.ZodEffects<z.ZodObject<{
            query: z.ZodString;
            category: z.ZodOptional<z.ZodEnum<["CLOTHING", "FOOTWEAR", "ACCESSORIES", "SKINCARE", "HAIRCARE", "MAKEUP"]>>;
            platform: z.ZodOptional<z.ZodEnum<["MYNTRA", "AMAZON", "HM", "AJIO", "NYKAA"]>>;
            minPrice: z.ZodPipeline<z.ZodEffects<z.ZodOptional<z.ZodString>, number | undefined, string | undefined>, z.ZodOptional<z.ZodNumber>>;
            maxPrice: z.ZodPipeline<z.ZodEffects<z.ZodOptional<z.ZodString>, number | undefined, string | undefined>, z.ZodOptional<z.ZodNumber>>;
            page: z.ZodPipeline<z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>, z.ZodNumber>;
            limit: z.ZodPipeline<z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>, z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            query: string;
            page: number;
            limit: number;
            category?: "CLOTHING" | "FOOTWEAR" | "ACCESSORIES" | "SKINCARE" | "HAIRCARE" | "MAKEUP" | undefined;
            platform?: "MYNTRA" | "AMAZON" | "HM" | "AJIO" | "NYKAA" | undefined;
            minPrice?: number | undefined;
            maxPrice?: number | undefined;
        }, {
            query: string;
            page?: string | undefined;
            limit?: string | undefined;
            category?: "CLOTHING" | "FOOTWEAR" | "ACCESSORIES" | "SKINCARE" | "HAIRCARE" | "MAKEUP" | undefined;
            platform?: "MYNTRA" | "AMAZON" | "HM" | "AJIO" | "NYKAA" | undefined;
            minPrice?: string | undefined;
            maxPrice?: string | undefined;
        }>, {
            query: string;
            page: number;
            limit: number;
            category?: "CLOTHING" | "FOOTWEAR" | "ACCESSORIES" | "SKINCARE" | "HAIRCARE" | "MAKEUP" | undefined;
            platform?: "MYNTRA" | "AMAZON" | "HM" | "AJIO" | "NYKAA" | undefined;
            minPrice?: number | undefined;
            maxPrice?: number | undefined;
        }, {
            query: string;
            page?: string | undefined;
            limit?: string | undefined;
            category?: "CLOTHING" | "FOOTWEAR" | "ACCESSORIES" | "SKINCARE" | "HAIRCARE" | "MAKEUP" | undefined;
            platform?: "MYNTRA" | "AMAZON" | "HM" | "AJIO" | "NYKAA" | undefined;
            minPrice?: string | undefined;
            maxPrice?: string | undefined;
        }>;
    };
    details: {
        params: z.ZodObject<{
            platform: z.ZodEnum<["MYNTRA", "AMAZON", "HM", "AJIO", "NYKAA"]>;
            productId: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            platform: "MYNTRA" | "AMAZON" | "HM" | "AJIO" | "NYKAA";
            productId: string;
        }, {
            platform: "MYNTRA" | "AMAZON" | "HM" | "AJIO" | "NYKAA";
            productId: string;
        }>;
    };
    trending: {
        query: z.ZodObject<{
            category: z.ZodOptional<z.ZodEnum<["CLOTHING", "FOOTWEAR", "ACCESSORIES", "SKINCARE", "HAIRCARE", "MAKEUP"]>>;
            gender: z.ZodOptional<z.ZodEnum<["MALE", "FEMALE", "NON_BINARY"]>>;
            limit: z.ZodPipeline<z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>, z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            limit: number;
            gender?: "MALE" | "FEMALE" | "NON_BINARY" | undefined;
            category?: "CLOTHING" | "FOOTWEAR" | "ACCESSORIES" | "SKINCARE" | "HAIRCARE" | "MAKEUP" | undefined;
        }, {
            gender?: "MALE" | "FEMALE" | "NON_BINARY" | undefined;
            limit?: string | undefined;
            category?: "CLOTHING" | "FOOTWEAR" | "ACCESSORIES" | "SKINCARE" | "HAIRCARE" | "MAKEUP" | undefined;
        }>;
    };
    similar: {
        params: z.ZodObject<{
            platform: z.ZodEnum<["MYNTRA", "AMAZON", "HM", "AJIO", "NYKAA"]>;
            productId: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            platform: "MYNTRA" | "AMAZON" | "HM" | "AJIO" | "NYKAA";
            productId: string;
        }, {
            platform: "MYNTRA" | "AMAZON" | "HM" | "AJIO" | "NYKAA";
            productId: string;
        }>;
        query: z.ZodObject<{
            limit: z.ZodPipeline<z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>, z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            limit: number;
        }, {
            limit?: string | undefined;
        }>;
    };
    trackView: {
        body: z.ZodObject<{
            productId: z.ZodString;
            platform: z.ZodEnum<["MYNTRA", "AMAZON", "HM", "AJIO", "NYKAA"]>;
            suggestionId: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            platform: "MYNTRA" | "AMAZON" | "HM" | "AJIO" | "NYKAA";
            productId: string;
            suggestionId?: string | undefined;
        }, {
            platform: "MYNTRA" | "AMAZON" | "HM" | "AJIO" | "NYKAA";
            productId: string;
            suggestionId?: string | undefined;
        }>;
    };
};
export declare const favoriteSchemas: {
    add: {
        body: z.ZodObject<{
            type: z.ZodEnum<["PRODUCT", "SUGGESTION"]>;
            itemId: z.ZodString;
            title: z.ZodString;
            description: z.ZodString;
            imageUrl: z.ZodString;
            metadata: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type: "PRODUCT" | "SUGGESTION";
            itemId: string;
            title: string;
            description: string;
            imageUrl: string;
            metadata?: string | undefined;
        }, {
            type: "PRODUCT" | "SUGGESTION";
            itemId: string;
            title: string;
            description: string;
            imageUrl: string;
            metadata?: string | undefined;
        }>;
    };
    remove: {
        params: z.ZodObject<{
            id: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
        }, {
            id: string;
        }>;
    };
};
export declare const uploadSchemas: {
    transform: {
        body: z.ZodObject<{
            publicId: z.ZodString;
            transformations: z.ZodOptional<z.ZodArray<z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>, "many">>;
        }, "strip", z.ZodTypeAny, {
            publicId: string;
            transformations?: {}[] | undefined;
        }, {
            publicId: string;
            transformations?: {}[] | undefined;
        }>;
    };
    signature: {
        body: z.ZodObject<{
            folder: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            folder?: string | undefined;
        }, {
            folder?: string | undefined;
        }>;
    };
    deleteImage: {
        params: z.ZodObject<{
            id: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
        }, {
            id: string;
        }>;
    };
};
//# sourceMappingURL=validation.d.ts.map