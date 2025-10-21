-- UGC Bounty Database Schema
-- This file contains the SQL statements to set up the database schema for the UGC bounty platform

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create social_accounts table
CREATE TABLE IF NOT EXISTS public.social_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('tiktok', 'instagram', 'twitter', 'youtube')),
    handle TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, platform)
);

-- Enable Row Level Security on both tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles table
CREATE POLICY "Users can view their own profile"
    ON public.profiles
    FOR SELECT
    USING ((auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles
    FOR INSERT
    WITH CHECK ((auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles
    FOR UPDATE
    USING ((auth.jwt() ->> 'sub') = user_id)
    WITH CHECK ((auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "Users can delete their own profile"
    ON public.profiles
    FOR DELETE
    USING ((auth.jwt() ->> 'sub') = user_id);

-- Create RLS policies for social_accounts table
CREATE POLICY "Users can view their own social accounts"
    ON public.social_accounts
    FOR SELECT
    USING ((auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "Users can insert their own social accounts"
    ON public.social_accounts
    FOR INSERT
    WITH CHECK ((auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "Users can update their own social accounts"
    ON public.social_accounts
    FOR UPDATE
    USING ((auth.jwt() ->> 'sub') = user_id)
    WITH CHECK ((auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "Users can delete their own social accounts"
    ON public.social_accounts
    FOR DELETE
    USING ((auth.jwt() ->> 'sub') = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_social_accounts_user_id ON public.social_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_accounts_platform ON public.social_accounts(platform);

-- Create a function to automatically create a profile when a user signs up
-- This would typically be triggered by a Clerk webhook
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, username)
    VALUES (NEW.id, COALESCE(NEW.first_name || ' ' || NEW.last_name, 'User'));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
