const pool = require("../config/database");

async function findAllSpecies() {
  const result = await pool.query(
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
      cloudinary_public_id,
      base_xp,
      created_at
    FROM species
    ORDER BY name ASC
    `
  );

  return result.rows;
}

async function findSpeciesById(id) {
  const result = await pool.query(
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
      cloudinary_public_id,
      base_xp,
      created_at
    FROM species
    WHERE id = $1
    `,
    [id]
  );

  return result.rows[0] || null;
}
async function findSpeciesByName(name) {
  const result = await pool.query(
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
      cloudinary_public_id,
      base_xp,
      created_at
    FROM species
    WHERE LOWER(name) = LOWER($1)
    `,
    [name]
  );

  return result.rows[0] || null;
}

module.exports = {
  findAllSpecies,
  findSpeciesById,
  findSpeciesByName,
};