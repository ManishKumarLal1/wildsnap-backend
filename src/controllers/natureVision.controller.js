const {
  identifyWithNatureVision,
} = require("../services/natureVision.service");

async function identifyWithNatureVisionController(
  req,
  res
) {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        message: "imageUrl is required",
      });
    }

    const result =
      await identifyWithNatureVision(imageUrl);

    return res.status(200).json({
      success: true,
      provider: "nature-vision",
      result,
    });
  } catch (error) {
    console.error(
      "Nature Vision identification error:",
      error
    );

    return res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "Nature Vision identification failed",
    });
  }
}

module.exports = {
  identifyWithNatureVisionController,
};