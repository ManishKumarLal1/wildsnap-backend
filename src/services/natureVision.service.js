const NATURE_VISION_ENDPOINT =
  "https://api.nature-vision.top/api/v1/mcp/vision";

async function identifyWithNatureVision(imageUrl) {
  if (!process.env.NATURE_VISION_API_KEY) {
    throw new Error(
      "NATURE_VISION_API_KEY is not configured"
    );
  }

  const controller = new AbortController();

  // Don't let Nature Vision hang our entire AI request.
  const timeout = setTimeout(() => {
    controller.abort();
  }, 10000);

  try {
    const response = await fetch(
      NATURE_VISION_ENDPOINT,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NATURE_VISION_API_KEY}`,
        },

        body: JSON.stringify({
          image_url: imageUrl,
          image_data: null,

          // Let Nature Vision determine the
          // biological category itself.
          category: null,

          top_k: 5,
        }),

        signal: controller.signal,
      }
    );

    const responseText = await response.text();

    console.log(
      "Nature Vision HTTP status:",
      response.status
    );

    console.log(
      "Nature Vision RAW RESPONSE:",
      responseText
    );

    if (!response.ok) {
      const error = new Error(
        `Nature Vision API failed with status ${response.status}`
      );

      error.status = response.status;

      throw error;
    }

    let data;

    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error(
        "Nature Vision returned invalid JSON"
      );
    }

    const topResult = data.results?.[0];

    if (!topResult) {
      throw new Error(
        "Nature Vision returned no species results"
      );
    }

    return {
      scientificName: topResult.latin_name,

      confidence: Number(
        topResult.confidence
      ),

      provider: "nature-vision",

      predictions: (data.results || []).map(
        (item) => ({
          scientificName: item.latin_name,
          confidence: Number(
            item.confidence
          ),
        })
      ),
    };
  } catch (error) {
    if (error.name === "AbortError") {
      const timeoutError = new Error(
        "Nature Vision request timed out"
      );

      timeoutError.status = 408;

      throw timeoutError;
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = {
  identifyWithNatureVision,
};