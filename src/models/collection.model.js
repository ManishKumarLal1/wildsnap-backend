const pool = require("../config/database");

async function findCollectionByUserId(userId) {
  const result = await pool.query(
    `
    SELECT
      s.id,
      s.name,
      s.scientific_name,
      s.category,
      s.rarity,
      s.description,
      s.habitat,
      s.diet,
      s.conservation_status,
      s.image_url,
      s.cloudinary_public_id,
      s.base_xp,
      us.discovery_count
    FROM user_species us
    JOIN species s
      ON s.id = us.species_id
    WHERE us.user_id = $1
    ORDER BY s.name ASC
    `,
    [userId]
  );

  return result.rows;
}

module.exports = {
  findCollectionByUserId,
};