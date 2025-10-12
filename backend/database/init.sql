-- AI Stylist Database Initialization Script
-- This script sets up the initial database structure and data

-- Create database if it doesn't exist
-- Note: This is handled by Docker Compose environment variables

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create indexes for better performance after Prisma migration
-- These will be created after the tables exist

-- Function to create indexes (will be called after migration)
CREATE OR REPLACE FUNCTION create_performance_indexes() RETURNS void AS $$
BEGIN
    -- User-related indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_google_id ON users("googleId") WHERE "googleId" IS NOT NULL;
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_apple_id ON users("appleId") WHERE "appleId" IS NOT NULL;
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_at ON users("createdAt");
    END IF;

    -- User profile indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profiles_user_id ON user_profiles("userId");
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profiles_body_type ON user_profiles("bodyType");
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profiles_face_shape ON user_profiles("faceShape");
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profiles_skin_tone ON user_profiles("skinTone");
    END IF;

    -- User photos indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_photos') THEN
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_photos_user_id ON user_photos("userId");
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_photos_type ON user_photos(type);
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_photos_active ON user_photos("isActive") WHERE "isActive" = true;
    END IF;

    -- Style suggestions indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'style_suggestions') THEN
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_style_suggestions_user_id ON style_suggestions("userId");
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_style_suggestions_occasion ON style_suggestions(occasion);
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_style_suggestions_body_type ON style_suggestions("bodyType");
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_style_suggestions_created_at ON style_suggestions("createdAt");
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_style_suggestions_user_created ON style_suggestions("userId", "createdAt");
    END IF;

    -- Product recommendations indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_recommendations') THEN
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_recommendations_suggestion_id ON product_recommendations("suggestionId");
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_recommendations_platform ON product_recommendations(platform);
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_recommendations_category ON product_recommendations(category);
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_recommendations_price ON product_recommendations(price);
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_recommendations_rating ON product_recommendations(rating) WHERE rating IS NOT NULL;
    END IF;

    -- Favorites indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'favorites') THEN
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_favorites_user_id ON favorites("userId");
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_favorites_platform ON favorites(platform);
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_favorites_created_at ON favorites("createdAt");
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_favorites_user_created ON favorites("userId", "createdAt");
    END IF;

    -- Feedback indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'feedback') THEN
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_feedback_user_id ON feedback("userId");
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_feedback_suggestion_id ON feedback("suggestionId") WHERE "suggestionId" IS NOT NULL;
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_feedback_rating ON feedback(rating);
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_feedback_liked ON feedback(liked);
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_feedback_created_at ON feedback("createdAt");
    END IF;

    -- User preferences indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_preferences') THEN
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_preferences_user_id ON user_preferences("userId");
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_preferences_key ON user_preferences(key);
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_preferences_user_key ON user_preferences("userId", key);
    END IF;

    -- Full-text search indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'style_suggestions') THEN
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_style_suggestions_outfit_search 
        ON style_suggestions USING gin(to_tsvector('english', "outfitDesc"));
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_recommendations') THEN
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_recommendations_name_search 
        ON product_recommendations USING gin(to_tsvector('english', name));
        
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_recommendations_brand_search 
        ON product_recommendations USING gin(to_tsvector('english', brand));
    END IF;

    RAISE NOTICE 'Performance indexes created successfully';
END;
$$ LANGUAGE plpgsql;

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create triggers (will be called after migration)
CREATE OR REPLACE FUNCTION create_update_triggers() RETURNS void AS $$
BEGIN
    -- User profiles trigger
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
        DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
        CREATE TRIGGER update_user_profiles_updated_at
            BEFORE UPDATE ON user_profiles
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- User preferences trigger
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_preferences') THEN
        DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
        CREATE TRIGGER update_user_preferences_updated_at
            BEFORE UPDATE ON user_preferences
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;

    RAISE NOTICE 'Update triggers created successfully';
END;
$$ LANGUAGE plpgsql;

-- Create analytics views
CREATE OR REPLACE VIEW user_analytics AS
SELECT 
    u.id,
    u.name,
    u.email,
    u."createdAt" as user_created_at,
    up.gender,
    up."bodyType",
    up."faceShape",
    up."skinTone",
    COUNT(DISTINCT ss.id) as total_suggestions,
    COUNT(DISTINCT f.id) as total_favorites,
    COUNT(DISTINCT fb.id) as total_feedback,
    AVG(fb.rating) as avg_rating,
    MAX(ss."createdAt") as last_suggestion_date,
    MAX(f."createdAt") as last_favorite_date
FROM users u
LEFT JOIN user_profiles up ON u.id = up."userId"
LEFT JOIN style_suggestions ss ON u.id = ss."userId"
LEFT JOIN favorites f ON u.id = f."userId"
LEFT JOIN feedback fb ON u.id = fb."userId"
GROUP BY u.id, u.name, u.email, u."createdAt", up.gender, up."bodyType", up."faceShape", up."skinTone";

-- Create popular styles view
CREATE OR REPLACE VIEW popular_styles AS
SELECT 
    occasion,
    "bodyType",
    COUNT(*) as suggestion_count,
    AVG(COALESCE(fb.rating, 0)) as avg_rating,
    COUNT(DISTINCT ss."userId") as unique_users
FROM style_suggestions ss
LEFT JOIN feedback fb ON ss.id = fb."suggestionId"
WHERE ss."createdAt" >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY occasion, "bodyType"
ORDER BY suggestion_count DESC, avg_rating DESC;

-- Create product performance view
CREATE OR REPLACE VIEW product_performance AS
SELECT 
    pr.platform,
    pr.category,
    pr.brand,
    COUNT(*) as recommendation_count,
    COUNT(DISTINCT f.id) as favorite_count,
    AVG(pr.price) as avg_price,
    AVG(pr.rating) as avg_rating
FROM product_recommendations pr
LEFT JOIN favorites f ON pr."productId" = f."productId" AND pr.platform = f.platform
GROUP BY pr.platform, pr.category, pr.brand
ORDER BY recommendation_count DESC;

-- Insert sample data (optional - for development)
-- This will only run if we're in development mode
DO $$
BEGIN
    -- Check if we should insert sample data
    IF current_setting('app.environment', true) = 'development' THEN
        RAISE NOTICE 'Development environment detected - sample data insertion would go here';
        -- Sample data insertion would go here
        -- For now, we'll let the application handle data creation
    END IF;
END $$;

-- Create a function to clean up old data
CREATE OR REPLACE FUNCTION cleanup_old_data() RETURNS void AS $$
BEGIN
    -- Delete old style suggestions (older than 1 year) for inactive users
    DELETE FROM style_suggestions 
    WHERE "createdAt" < CURRENT_DATE - INTERVAL '1 year'
    AND "userId" IN (
        SELECT id FROM users 
        WHERE "updatedAt" < CURRENT_DATE - INTERVAL '6 months'
    );

    -- Delete orphaned product recommendations
    DELETE FROM product_recommendations 
    WHERE "suggestionId" NOT IN (SELECT id FROM style_suggestions);

    -- Delete old feedback (older than 2 years)
    DELETE FROM feedback 
    WHERE "createdAt" < CURRENT_DATE - INTERVAL '2 years';

    RAISE NOTICE 'Old data cleanup completed';
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job function (requires pg_cron extension)
-- This is optional and would need to be set up separately
/*
SELECT cron.schedule('cleanup-old-data', '0 2 * * 0', 'SELECT cleanup_old_data();');
*/

RAISE NOTICE 'Database initialization script completed successfully';
RAISE NOTICE 'Run create_performance_indexes() after Prisma migration';
RAISE NOTICE 'Run create_update_triggers() after Prisma migration';