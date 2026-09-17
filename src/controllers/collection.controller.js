const {
  findCollectionByUserId,
} = require("../models/collection.model");

async function getMyCollection(req, res) {
  try {
    const userId = req.user.id;

    const collection =
      await findCollectionByUserId(userId);

    return res.status(200).json({
      collection,
    });
  } catch (error) {
    console.error(
      "Get collection error:",
      error
    );

    return res.status(500).json({
      message: "Failed to fetch collection",
    });
  }
}

module.exports = {
  getMyCollection,
};