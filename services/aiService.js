const axios = require("axios");
require("dotenv").config();
async function generateExplanation(categoryName, groupName) {
  try {
    const prompt = `
    A user frequently votes in ${groupName} award categories.
    Generate one short professional sentence recommending ${categoryName}.
    Keep it engaging and under 25 words.
    `;

    const response = await axios.post(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`
        }
      }
    );

    return response.data[0].generated_text.trim();

  } catch (error) {
    console.error("HF Error:", error.message);

    // Fallback (VERY IMPORTANT FOR DEMO)
    return `Based on your activity in ${groupName}, we recommend exploring ${categoryName}.`;
  }
}

module.exports = { generateExplanation };