CREATE TABLE species (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(150) NOT NULL,
    scientific_name VARCHAR(200) NOT NULL UNIQUE,

    category VARCHAR(30) NOT NULL,
    rarity VARCHAR(20) NOT NULL DEFAULT 'Common',

    description TEXT,
    habitat TEXT,
    diet TEXT,

    conservation_status VARCHAR(100),

    image_url TEXT,

    base_xp INTEGER NOT NULL DEFAULT 10,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT species_category_check
        CHECK (
            category IN (
                'Bird',
                'Mammal',
                'Reptile',
                'Amphibian',
                'Insect',
                'Fish'
            )
        ),

    CONSTRAINT species_rarity_check
        CHECK (
            rarity IN (
                'Common',
                'Uncommon',
                'Rare',
                'Epic',
                'Legendary'
            )
        ),

    CONSTRAINT species_xp_check
        CHECK (base_xp >= 0)
);