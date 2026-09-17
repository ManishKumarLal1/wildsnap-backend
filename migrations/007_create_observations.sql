CREATE TABLE observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,
    species_id UUID NOT NULL,

    image_url TEXT,

    confidence DECIMAL(5,4) NOT NULL,

    xp_earned INTEGER NOT NULL DEFAULT 0,

    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_observation_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_observation_species
        FOREIGN KEY (species_id)
        REFERENCES species(id)
        ON DELETE CASCADE,

    CONSTRAINT confidence_range
        CHECK (confidence >= 0 AND confidence <= 1),

    CONSTRAINT observation_xp_check
        CHECK (xp_earned >= 0)
);