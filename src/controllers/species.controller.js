const {
  findAllSpecies,
  findSpeciesById,
  findSpeciesByName
} = require("../models/species.model");

async function getAllSpecies(req, res) {
  try {
    const species = await findAllSpecies();

    return res.status(200).json({
      species,
    });
  } catch (error) {
    console.error("Get species error:", error);

    return res.status(500).json({
      message: "Failed to fetch species",
    });
  }
}

async function getSpecies(req, res) {
  try {
    const { id } = req.params;

    const species = await findSpeciesById(id);

    if (!species) {
      return res.status(404).json({
        message: "Species not found",
      });
    }

    return res.status(200).json({
      species,
    });
  } catch (error) {
    console.error("Get species by ID error:", error);

    return res.status(500).json({
      message: "Failed to fetch species",
    });
  }
}

async function getSpeciesByName(req, res) {
  try {
    const { name } = req.params;

    const species = await findSpeciesByName(name);

    if (!species) {
      return res.status(404).json({
        message: "Species not found",
      });
    }

    return res.status(200).json({
      species,
    });
  } catch (error) {
    console.error(
      "Get species by name error:",
      error
    );

    return res.status(500).json({
      message: "Failed to fetch species",
    });
  }
}

module.exports = {
  getAllSpecies,
  getSpecies,
  getSpeciesByName,
};
