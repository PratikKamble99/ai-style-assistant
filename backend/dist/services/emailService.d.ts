export interface EmailOptions {
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
    attachments?: any[];
}
export interface WelcomeEmailData {
    name: string;
    email: string;
}
export interface StyleSuggestionEmailData {
    name: string;
    occasion: string;
    outfitDescription: string;
    imageUrl?: string;
    productLinks: Array<{
        name: string;
        url: string;
        price: string;
    }>;
}
export declare class EmailService {
    private transporter;
    private isConfigured;
    constructor();
    private setupTransporter;
    /**
     * Send a generic email
     */
    sendEmail(options: EmailOptions): Promise<boolean>;
    /**
     * Send welcome email to new users
     */
    sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean>;
    /**
     * Send style suggestion email
     */
    sendStyleSuggestionEmail(email: string, data: StyleSuggestionEmailData): Promise<boolean>;
    /**
     * Send password reset email
     */
    sendPasswordResetEmail(email: string, name: string, resetToken: string): Promise<boolean>;
    /**
     * Send feedback thank you email
     */
    sendFeedbackThankYouEmail(email: string, name: string): Promise<boolean>;
    /**
     * Test email configuration
     */
    testConnection(): Promise<boolean>;
}
export declare const emailService: EmailService;
//# sourceMappingURL=emailService.d.ts.map