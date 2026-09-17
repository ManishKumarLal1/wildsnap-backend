const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const PRIMARY_MODEL = "qwen/qwen3.6-27b";
const FALLBACK_MODEL = "qwen/qwen3.8-27b";

async function identifyWithModel(model, imageUrl) {
  const response = await groq.chat.completions.create({
    model,

    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `
Identify the animal in this image.

Return ONLY a JSON object.
Do not write any explanation.
Do not use markdown.

The JSON must have exactly these fields:

{
  "isAnimal": true,
  "species": "House Sparrow",
  "scientificName": "Passer domesticus",
  "confidence": 0.95
}

Rules:
- isAnimal must be true or false.
- species must be the common English species name.
- scientificName must be the scientific name.
- confidence must be a number between 0 and 1.
- If there is no animal in the image, return:

{
  "isAnimal": false,
  "species": null,
  "scientificName": null,
  "confidence": 0
}
`,
          },
          {
            type: "image_url",
            image_url: {
              url: imageUrl,
            },
          },
        ],
      },
    ],

    temperature: 0,
    reasoning_effort: "none",
    max_completion_tokens: 300,

    response_format: {
      type: "json_object",
    },
  });

  const content = response.choices[0]?.message?.content;

  console.log(`AI RAW RESPONSE (${model}):`, content);

  if (!content) {
    throw new Error("AI returned an empty response");
  }

  try {
    return JSON.parse(content);
  } catch (error) {
    console.error("Invalid AI JSON:", content);
    throw new Error("AI returned invalid JSON");
  }
}

async function identifySpecies(imageUrl) {
  try {
    console.log(`Trying primary AI model: ${PRIMARY_MODEL}`);

    const result = await identifyWithModel(
      PRIMARY_MODEL,
      imageUrl
    );

    console.log("Primary model succeeded");

    return result;
  } catch (error) {
    console.error(
      `Primary model failed (${error.status || "unknown"}):`,
      error.message
    );

    // Only use the fallback for temporary
    // rate-limit or capacity problems.
    if (
      error.status !== 429 &&
      error.status !== 503
    ) {
      throw error;
    }

    console.log(
      `Trying fallback AI model: ${FALLBACK_MODEL}`
    );

    const result = await identifyWithModel(
      FALLBACK_MODEL,
      imageUrl
    );

    console.log("Fallback model succeeded");

    return result;
  }
}

module.exports = {
  identifySpecies,
};