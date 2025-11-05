-- Create database tables for Brain Trial

-- Participants table
CREATE TABLE IF NOT EXISTS participants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transcripts table
CREATE TABLE IF NOT EXISTS transcripts (
    id SERIAL PRIMARY KEY,
    transcript_id VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    occurred_at TIMESTAMP NOT NULL,
    duration_minutes INTEGER NOT NULL,
    transcript_text TEXT NOT NULL,
    metadata JSONB,
    sentiment VARCHAR(50),
    summary TEXT,
    key_insights TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Topics table
CREATE TABLE IF NOT EXISTS topics (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transcript-Participant relationship (many-to-many)
CREATE TABLE IF NOT EXISTS transcript_participants (
    transcript_id INTEGER REFERENCES transcripts(id) ON DELETE CASCADE,
    participant_id INTEGER REFERENCES participants(id) ON DELETE CASCADE,
    role VARCHAR(50),
    PRIMARY KEY (transcript_id, participant_id)
);

-- Transcript-Topic relationship (many-to-many)
CREATE TABLE IF NOT EXISTS transcript_topics (
    transcript_id INTEGER REFERENCES transcripts(id) ON DELETE CASCADE,
    topic_id INTEGER REFERENCES topics(id) ON DELETE CASCADE,
    PRIMARY KEY (transcript_id, topic_id)
);

-- Action Items table
CREATE TABLE IF NOT EXISTS action_items (
    id SERIAL PRIMARY KEY,
    transcript_id INTEGER REFERENCES transcripts(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Decisions table
CREATE TABLE IF NOT EXISTS decisions (
    id SERIAL PRIMARY KEY,
    transcript_id INTEGER REFERENCES transcripts(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_transcripts_occurred_at ON transcripts(occurred_at);
CREATE INDEX IF NOT EXISTS idx_transcripts_transcript_id ON transcripts(transcript_id);
CREATE INDEX IF NOT EXISTS idx_participants_email ON participants(email);
CREATE INDEX IF NOT EXISTS idx_topics_name ON topics(name);
CREATE INDEX IF NOT EXISTS idx_action_items_transcript ON action_items(transcript_id);
CREATE INDEX IF NOT EXISTS idx_decisions_transcript ON decisions(transcript_id);

