const pool = require("../config/database");

const {
  identifyWithNatureVision,
} = require("../services/natureVision.service");

const {
  identifySpecies,
} = require("../services/ai.service");

const {
  findSpeciesByScientificName,
} = require("../models/observation.model");


async function identifyAnimal(req, res) {
  const client = await pool.connect();

  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        message: "imageUrl is required",
      });
    }


    // ==========================================
    // 1. TRY NATURE VISION
    // ==========================================

    try {
      console.log(
        "Trying Nature Vision..."
      );

      const natureResult =
        await identifyWithNatureVision(imageUrl);

      console.log(
        "Nature Vision prediction:",
        natureResult
      );


      const species =
        await findSpeciesByScientificName(
          client,
          natureResult.scientificName
        );


      if (species) {
        console.log(
          "Nature Vision species matched:",
          species.name
        );

        return res.status(200).json({
          success: true,

          provider: "nature-vision",

          result: {
            isAnimal: true,

            species: species.name,

            scientificName:
              species.scientific_name,

            confidence:
              natureResult.confidence,

            category:
              species.category,

            predictions:
              natureResult.predictions,
          },
        });
      }


      console.log(
        "Nature Vision prediction not found in database:",
        natureResult.scientificName
      );

    } catch (error) {

      console.error(
        "Nature Vision failed:",
        error.message
      );
    }


    // ==========================================
    // 2. FALLBACK TO GROQ
    // ==========================================

    console.log(
      "Falling back to Groq..."
    );


    const groqResult =
      await identifySpecies(imageUrl);


    if (!groqResult.isAnimal) {
      return res.status(200).json({
        success: true,

        provider: "groq",

        result: groqResult,
      });
    }


    const species =
      await findSpeciesByScientificName(
        client,
        groqResult.scientificName
      );


    if (!species) {
      return res.status(404).json({
        success: false,

        message:
          "AI identified a species that is not available in our database.",

        provider: "groq",

        result: groqResult,
      });
    }


    return res.status(200).json({
      success: true,

      provider: "groq",

      result: {
        isAnimal: true,

        species: species.name,

        scientificName:
          species.scientific_name,

        confidence:
          groqResult.confidence,

        category:
          species.category,

        predictions: [
          {
            scientificName:
              species.scientific_name,

            confidence:
              groqResult.confidence,
          },
        ],
      },
    });

  } catch (error) {

    console.error(
      "AI identification error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to identify image",
    });

  } finally {
    client.release();
  }
}


module.exports = {
  identifyAnimal,
};