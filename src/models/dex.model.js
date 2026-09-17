const pool = require("../config/database");

async function getDexForUser(userId) {
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
      s.silhouette_url,

      CASE
        WHEN us.user_id IS NOT NULL THEN true
        ELSE false
      END AS discovered,

      COALESCE(us.discovery_count, 0) AS discovery_count,

      us.first_discovered_at,
      us.last_discovered_at

    FROM species s

    LEFT JOIN user_species us
      ON s.id = us.species_id
      AND us.user_id = $1

    ORDER BY s.name ASC
    `,
    [userId]
  );

  return result.rows;
}

module.exports = {
  getDexForUser,
};