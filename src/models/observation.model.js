const pool = require("../config/database");

async function findSpeciesById(client, speciesId) {
  const result = await client.query(
    `
    SELECT
      id,
      name,
      scientific_name,
      category,
      rarity,
      base_xp
    FROM species
    WHERE id = $1
    `,
    [speciesId]
  );

  return result.rows[0] || null;
}

async function createObservation(
  client,
  {
    userId,
    speciesId,
    imageUrl,
    cloudinaryPublicId,
    confidence,
    xpEarned,
    latitude,
    longitude,
  }
) {
  const result = await client.query(
    `
    INSERT INTO observations (
      user_id,
      species_id,
      image_url,
      cloudinary_public_id,
      confidence,
      xp_earned,
      latitude,
      longitude
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING
      id,
      user_id,
      species_id,
      image_url,
      cloudinary_public_id,
      confidence,
      xp_earned,
      latitude,
      longitude,
      created_at
    `,
    [
      userId,
      speciesId,
      imageUrl,
      cloudinaryPublicId,
      confidence,
      xpEarned,
      latitude ?? null,
      longitude ?? null,
    ]
  );

  return result.rows[0];
}

async function findUserSpecies(client, userId, speciesId) {
  const result = await client.query(
    `
    SELECT
      user_id,
      species_id,
      discovery_count,
      first_discovered_at,
      last_discovered_at
    FROM user_species
    WHERE user_id = $1
      AND species_id = $2
    FOR UPDATE
    `,
    [userId, speciesId]
  );

  return result.rows[0] || null;
}

async function createUserSpecies(client, userId, speciesId) {
  const result = await client.query(
    `
    INSERT INTO user_species (
      user_id,
      species_id
    )
    VALUES ($1, $2)
    RETURNING
      user_id,
      species_id,
      discovery_count,
      first_discovered_at,
      last_discovered_at
    `,
    [userId, speciesId]
  );

  return result.rows[0];
}

async function incrementUserSpecies(
  client,
  userId,
  speciesId
) {
  const result = await client.query(
    `
    UPDATE user_species
    SET
      discovery_count = discovery_count + 1,
      last_discovered_at = CURRENT_TIMESTAMP
    WHERE user_id = $1
      AND species_id = $2
    RETURNING
      user_id,
      species_id,
      discovery_count,
      first_discovered_at,
      last_discovered_at
    `,
    [userId, speciesId]
  );

  return result.rows[0];
}

async function updateUserProgress(
  client,
  userId,
  xp,
  level,
  streak,
  lastObservationDate
) {
  const result = await client.query(
    `
    UPDATE users
    SET
      xp = $1,
      level = $2,
      streak = $3,
      last_observation_date = $4,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $5
    RETURNING
      id,
      username,
      xp,
      level,
      streak,
      last_observation_date
    `,
    [
      xp,
      level,
      streak,
      lastObservationDate,
      userId,
    ]
  );

  return result.rows[0];
}

async function findObservationsByUserId(userId) {
  const result = await pool.query(
    `
    SELECT
      o.id,
      o.user_id,
      o.species_id,
      s.name AS species_name,
      s.scientific_name,
      s.category,
      s.rarity,
      s.image_url AS species_image_url,
      o.image_url,
      o.confidence,
      o.xp_earned,
      o.latitude,
      o.longitude,
      o.created_at
    FROM observations o
    JOIN species s
      ON s.id = o.species_id
    WHERE o.user_id = $1
    ORDER BY o.created_at DESC
    `,
    [userId]
  );

  return result.rows;
}

async function findSpeciesByScientificName(
  client,
  scientificName
) {
  const result = await client.query(
    `
    SELECT
      id,
      name,
      scientific_name,
      category,
      rarity,
      description,
      habitat,
      diet,
      conservation_status,
      image_url,
      base_xp
    FROM species
    WHERE LOWER(scientific_name) = LOWER($1)
    LIMIT 1
    `,
    [scientificName]
  );

  return result.rows[0] || null;
}

module.exports = {
  findSpeciesById,
  createObservation,
  findUserSpecies,
  createUserSpecies,
  incrementUserSpecies,
  updateUserProgress,
  findObservationsByUserId,
  findSpeciesByScientificName,
};