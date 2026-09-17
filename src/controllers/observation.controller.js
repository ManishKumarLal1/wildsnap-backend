const pool = require("../config/database");

const {
  findSpeciesById,
  createObservation,
  findUserSpecies,
  createUserSpecies,
  incrementUserSpecies,
  updateUserProgress,
  findObservationsByUserId,
} = require("../models/observation.model");

const {
  deleteImage,
} = require("../services/cloudinary.service");

const {
  calculateLevel,
  calculateObservationXp,
  calculateNewStreak,
} = require("../utils/gamification");


async function addObservation(req, res) {
  const client = await pool.connect();

  try {
    const userId = req.user.id;

    const {
      speciesId,
      imageUrl,
      cloudinaryPublicId,
      confidence,
      latitude,
      longitude,
    } = req.body;

    // -----------------------------
    // 1. Validate required fields
    // -----------------------------

    if (!speciesId) {
      return res.status(400).json({
        message: "speciesId is required",
      });
    }

    if (!imageUrl) {
      return res.status(400).json({
        message: "imageUrl is required",
      });
    }

    if (!cloudinaryPublicId) {
      return res.status(400).json({
        message: "cloudinaryPublicId is required",
      });
    }

    /*const expectedFolder =
  `wildlife/observations/${userId}/`;

if (!cloudinaryPublicId.startsWith(expectedFolder)) {
  return res.status(403).json({
    message: "You can only use your own uploaded image",
  });
}*/
    // -----------------------------
    // 2. Validate confidence
    // -----------------------------

    const numericConfidence = Number(confidence);

    if (
      !Number.isFinite(numericConfidence) ||
      numericConfidence < 0 ||
      numericConfidence > 1
    ) {
      return res.status(400).json({
        message: "confidence must be a number between 0 and 1",
      });
    }

    // -----------------------------
    // 3. Start transaction
    // -----------------------------

    await client.query("BEGIN");

    // -----------------------------
    // 4. Verify species exists
    // -----------------------------

    const species = await findSpeciesById(
      client,
      speciesId
    );

    if (!species) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Species not found",
      });
    }

    // -----------------------------
// 5. Get user's current progress
// -----------------------------

const userResult = await client.query(
  `
  SELECT
    id,
    xp,
    level,
    streak,
    last_observation_date
  FROM users
  WHERE id = $1
  FOR UPDATE
  `,
  [userId]
);

if (userResult.rows.length === 0) {
  await client.query("ROLLBACK");

  return res.status(404).json({
    message: "User not found",
  });
}

const user = userResult.rows[0];

// -----------------------------
// 6. Handle collection
// -----------------------------

const existingUserSpecies =
  await findUserSpecies(
    client,
    userId,
    speciesId
  );

const firstDiscovery = !existingUserSpecies;

let userSpecies;

if (firstDiscovery) {
  userSpecies = await createUserSpecies(
    client,
    userId,
    speciesId
  );
} else {
  userSpecies = await incrementUserSpecies(
    client,
    userId,
    speciesId
  );
}

// -----------------------------
// 7. Calculate XP SERVER-SIDE
// -----------------------------

const xpEarned = calculateObservationXp(
  species.rarity,
  firstDiscovery
);

// -----------------------------
// 8. Calculate new XP
// -----------------------------

const newXp = user.xp + xpEarned;

const newLevel = calculateLevel(newXp);

    // -----------------------------
    // 9. Calculate streak
    // -----------------------------

    const streakResult = calculateNewStreak(
      user.last_observation_date
    );

    let newStreak = user.streak;

    if (streakResult === 1) {
      newStreak = 1;
    } else if (streakResult === "increment") {
      newStreak = user.streak + 1;
    }

    // -----------------------------
    // 10. Update user
    // -----------------------------

    const today = new Date()
      .toISOString()
      .split("T")[0];

    const updatedUser = await updateUserProgress(
      client,
      userId,
      newXp,
      newLevel,
      newStreak,
      today
    );

    // -----------------------------
    // 11. Create observation
    // -----------------------------

    const observation =
      await createObservation(client, {
        userId,
        speciesId,
        imageUrl,
        cloudinaryPublicId,
        confidence: numericConfidence,
        xpEarned,
        latitude,
        longitude,
      });

    // -----------------------------
    // 12. Commit everything
    // -----------------------------

    await client.query("COMMIT");

    return res.status(201).json({
      message: "Observation created successfully",

      observation: {
        ...observation,
        species: {
          id: species.id,
          name: species.name,
          scientificName:
            species.scientific_name,
          category: species.category,
          rarity: species.rarity,
        },
      },

      rewards: {
        xpEarned,
        totalXp: updatedUser.xp,
        level: updatedUser.level,
        streak: updatedUser.streak,
        firstDiscovery,
      },

      collection: {
        speciesId,
        discoveryCount:
          userSpecies.discovery_count,
      },
    });

  } catch (error) {

    await client.query("ROLLBACK");

    console.error(
      "Create observation error:",
      error
    );

    return res.status(500).json({
      message: "Failed to create observation",
    });

  } finally {
    client.release();
  }
}

async function getMyObservations(req, res) {
  try {
    const userId = req.user.id;

    const observations = await findObservationsByUserId(userId);

    return res.json({
      observations,
    });
  } catch (error) {
    console.error("Get observations error:", error);

    return res.status(500).json({
      message: "Failed to fetch observations",
    });
  }
}

async function getObservation(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const observation = await findObservationById(id, userId);

    if (!observation) {
      return res.status(404).json({
        message: "Observation not found",
      });
    }

    return res.json({
      observation,
    });
  } catch (error) {
    console.error("Get observation error:", error);

    return res.status(500).json({
      message: "Failed to fetch observation",
    });
  }
}

async function removeObservation(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    /*
     * PostgreSQL checks ownership here.
     * We only get a row back if this observation
     * actually belongs to the authenticated user.
     */
    const observation = await deleteObservation(id, userId);

    if (!observation) {
      return res.status(404).json({
        message: "Observation not found",
      });
    }

    /*
     * Delete the corresponding Cloudinary image.
     *
     * If the observation doesn't have an image,
     * there is nothing to delete.
     */
    if (observation.cloudinary_public_id) {
      try {
        await deleteImage(observation.cloudinary_public_id);
      } catch (cloudinaryError) {
        console.error(
          "Cloudinary deletion failed:",
          cloudinaryError
        );
      }
    }

    return res.json({
      message: "Observation deleted successfully",
    });
  } catch (error) {
    console.error("Delete observation error:", error);

    return res.status(500).json({
      message: "Failed to delete observation",
    });
  }
}

module.exports = {
  addObservation,
  getMyObservations,
  getObservation,
  removeObservation,
};