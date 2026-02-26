-- =====================================================
-- Social Leaf Database Schema
-- Run this in Supabase SQL Editor
-- =====================================================

-- Enable UUID extension (usually enabled by default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PLATFORMS TABLE
-- Stores connected social media accounts
-- =====================================================
CREATE TABLE IF NOT EXISTS platforms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    platform_name TEXT NOT NULL CHECK (platform_name IN ('instagram', 'youtube', 'twitter', 'linkedin', 'facebook')),
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_synced_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    
    -- Unique constraint: one connection per platform per user
    UNIQUE(user_id, platform_name)
);

-- =====================================================
-- POSTS TABLE
-- Stores social media posts from all platforms
-- =====================================================
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('instagram', 'youtube', 'twitter', 'linkedin', 'facebook')),
    platform_post_id TEXT NOT NULL, -- Original post ID from platform
    content_type TEXT CHECK (content_type IN ('image', 'video', 'reel', 'carousel', 'story', 'short', 'post', 'thread')),
    title TEXT,
    description TEXT,
    media_url TEXT,
    permalink TEXT,
    posted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    
    -- Unique constraint: avoid duplicate posts
    UNIQUE(user_id, platform, platform_post_id)
);

-- =====================================================
-- METRICS TABLE
-- Stores engagement metrics for posts (time-series)
-- =====================================================
CREATE TABLE IF NOT EXISTS metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    reach INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5, 2) DEFAULT 0,
    watch_time_seconds INTEGER, -- For video content
    views INTEGER DEFAULT 0,
    collected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- =====================================================
-- INSIGHTS TABLE
-- Stores AI-generated insights
-- =====================================================
CREATE TABLE IF NOT EXISTS insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    insight_type TEXT DEFAULT 'general',
    summary TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- RECOMMENDATIONS TABLE
-- Stores AI-generated content recommendations
-- =====================================================
CREATE TABLE IF NOT EXISTS recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('content', 'timing', 'format', 'hashtag', 'strategy')),
    content TEXT NOT NULL,
    priority INTEGER DEFAULT 0,
    is_read BOOLEAN DEFAULT FALSE,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Platforms indexes
CREATE INDEX IF NOT EXISTS idx_platforms_user_id ON platforms(user_id);
CREATE INDEX IF NOT EXISTS idx_platforms_platform ON platforms(platform_name);

-- Posts indexes
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_platform ON posts(platform);
CREATE INDEX IF NOT EXISTS idx_posts_posted_at ON posts(posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_content_type ON posts(content_type);

-- Metrics indexes
CREATE INDEX IF NOT EXISTS idx_metrics_post_id ON metrics(post_id);
CREATE INDEX IF NOT EXISTS idx_metrics_collected_at ON metrics(collected_at DESC);

-- Insights indexes
CREATE INDEX IF NOT EXISTS idx_insights_user_id ON insights(user_id);
CREATE INDEX IF NOT EXISTS idx_insights_generated_at ON insights(generated_at DESC);

-- Recommendations indexes
CREATE INDEX IF NOT EXISTS idx_recommendations_user_id ON recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_type ON recommendations(recommendation_type);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

-- Platforms policies
CREATE POLICY "Users can view their own platforms" ON platforms
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own platforms" ON platforms
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own platforms" ON platforms
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own platforms" ON platforms
    FOR DELETE USING (auth.uid() = user_id);

-- Posts policies
CREATE POLICY "Users can view their own posts" ON posts
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own posts" ON posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own posts" ON posts
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own posts" ON posts
    FOR DELETE USING (auth.uid() = user_id);

-- Metrics policies (through post ownership)
CREATE POLICY "Users can view metrics for their posts" ON metrics
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM posts WHERE posts.id = metrics.post_id AND posts.user_id = auth.uid())
    );
CREATE POLICY "Users can insert metrics for their posts" ON metrics
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM posts WHERE posts.id = metrics.post_id AND posts.user_id = auth.uid())
    );

-- Insights policies
CREATE POLICY "Users can view their own insights" ON insights
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own insights" ON insights
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Recommendations policies
CREATE POLICY "Users can view their own recommendations" ON recommendations
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own recommendations" ON recommendations
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own recommendations" ON recommendations
    FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- SAMPLE DATA (for testing)
-- Note: Replace 'YOUR_USER_ID' with actual auth.users id
-- =====================================================

-- Uncomment below to insert sample data after creating a user:
/*
INSERT INTO posts (user_id, platform, platform_post_id, content_type, title, posted_at)
VALUES 
    ('YOUR_USER_ID', 'instagram', 'ig_123', 'reel', 'Product Launch Reel', NOW() - INTERVAL '7 days'),
    ('YOUR_USER_ID', 'instagram', 'ig_124', 'carousel', 'Tips Carousel', NOW() - INTERVAL '5 days'),
    ('YOUR_USER_ID', 'youtube', 'yt_123', 'video', 'Tutorial Video', NOW() - INTERVAL '3 days');
*/
