-- === UTILISATEURS ===
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- === CONCOURS (ex: Eurovision 2025) ===
CREATE TABLE contests (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    submission_deadline TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- === CHANSONS (liées à un concours) ===
CREATE TABLE entries (
    id SERIAL PRIMARY KEY,
    contest_id INTEGER REFERENCES contests(id) ON DELETE CASCADE,
    country_code CHAR(3) NOT NULL,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    UNIQUE (contest_id, country_code)
);

-- === RÉSULTATS OFFICIELS ===
CREATE TABLE results (
    id SERIAL PRIMARY KEY,
    entry_id INTEGER REFERENCES entries(id) ON DELETE CASCADE,
    position INTEGER NOT NULL CHECK (position > 0),
    UNIQUE (entry_id)
);

-- === PRONOSTICS UTILISATEURS ===
CREATE TABLE predictions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    contest_id INTEGER REFERENCES contests(id) ON DELETE CASCADE,
    ranking JSONB NOT NULL, -- exemple : ["FRA", "SWE", "UK", ...]
    submitted_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (user_id, contest_id)
);

-- === GROUPES (pour jouer entre amis) ===
CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL, -- code partageable pour rejoindre
    owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    contest_id INTEGER REFERENCES contests(id) ON DELETE CASCADE
);

-- === MEMBRES DE GROUPES ===
CREATE TABLE group_members (
    group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (group_id, user_id)
);
