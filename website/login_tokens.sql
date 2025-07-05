-- Login tokens table for temporary authentication
CREATE TABLE login_tokens (
    id SERIAL PRIMARY KEY,
    player_uuid VARCHAR(36) NOT NULL,
    player_name VARCHAR(16) NOT NULL,
    token VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at BIGINT NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    UNIQUE(token)
);

-- Profiles table for user accounts
CREATE TABLE profiles (
    id SERIAL PRIMARY KEY,
    player_uuid VARCHAR(36) UNIQUE NOT NULL,
    player_name VARCHAR(16) NOT NULL,
    email VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Create indexes for better performance
CREATE INDEX idx_login_tokens_token ON login_tokens(token);
CREATE INDEX idx_login_tokens_player_uuid ON login_tokens(player_uuid);
CREATE INDEX idx_profiles_player_uuid ON profiles(player_uuid);
CREATE INDEX idx_profiles_player_name ON profiles(player_name);

-- Enable Row Level Security (RLS)
ALTER TABLE login_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for login_tokens (allow insert and select for authenticated users)
CREATE POLICY "Allow insert for authenticated users" ON login_tokens
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow select for authenticated users" ON login_tokens
    FOR SELECT USING (true);

CREATE POLICY "Allow update for authenticated users" ON login_tokens
    FOR UPDATE USING (true);

-- RLS Policies for profiles
CREATE POLICY "Allow users to view their own profile" ON profiles
    FOR SELECT USING (auth.uid()::text = player_uuid);

CREATE POLICY "Allow users to update their own profile" ON profiles
    FOR UPDATE USING (auth.uid()::text = player_uuid);

CREATE POLICY "Allow insert for authenticated users" ON profiles
    FOR INSERT WITH CHECK (true);