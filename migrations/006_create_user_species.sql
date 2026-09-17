CREATE TABLE user_species (
    user_id UUID NOT NULL,
    species_id UUID NOT NULL,

    discovery_count INTEGER NOT NULL DEFAULT 1,
    first_discovered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_discovered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (user_id, species_id),

    CONSTRAINT fk_user_species_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_user_species_species
        FOREIGN KEY (species_id)
        REFERENCES species(id)
        ON DELETE CASCADE,

    CONSTRAINT discovery_count_positive
        CHECK (discovery_count >= 1)
);