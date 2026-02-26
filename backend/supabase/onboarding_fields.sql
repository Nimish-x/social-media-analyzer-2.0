-- Add onboarding fields to profiles table
-- Run this SQL in Supabase SQL Editor after the initial profiles.sql

-- Add onboarding preference columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_type TEXT CHECK (user_type IN ('creator', 'business', 'agency'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS primary_platforms TEXT[]; -- Array of platforms
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS content_formats TEXT[]; -- Array of content types
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS primary_goals TEXT[]; -- Array of goals (max 2)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS posting_frequency TEXT CHECK (posting_frequency IN ('daily', '3-5_week', 'weekly'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- Index for faster onboarding status lookups
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed ON profiles(onboarding_completed);
