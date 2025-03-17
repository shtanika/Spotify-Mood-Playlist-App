CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    spotify_id TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    display_name TEXT,
    profile_image TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    mood TEXT NOT NULL,
    additional_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE playlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    prompt_id UUID UNIQUE NOT NULL REFERENCES prompts(id) ON DELETE CASCADE, 
    spotify_playlist_id TEXT UNIQUE NOT NULL,
    playlist_name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE playlist_tracks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
    spotify_track_id TEXT NOT NULL,
    track_name TEXT NOT NULL,
    artist_name TEXT NOT NULL
);
