const {
  getDexForUser,
} = require("../models/dex.model");

async function getMyDex(req, res) {
  try {
    const userId = req.user.id;

    const species = await getDexForUser(userId);

    return res.status(200).json({
      success: true,
      totalSpecies: species.length,
      discoveredSpecies: species.filter(
        (item) => item.discovered
      ).length,
      species,
    });
  } catch (error) {
    console.error(
      "Get Wild Dex error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch Wild Dex",
    });
  }
}

module.exports = {
  getMyDex,
};