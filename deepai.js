const deepai = require('deepai');

function setApiKey(apiKey) {
  deepai.setApiKey(apiKey);
}

/**
 * Generate an image using DeepAI's text2img API.
 * @param {string} text - The text to generate an image from.
 * @returns {Promise<{ output_url: string }>} - An object containing the URL of the generated image.
 */
async function generateDeepAIImage(text) {
  try {
    const resp = await deepai.callStandardApi("text2img", {
      text: `${text}`,
    });

    return resp;
  } catch (error) {
    console.error('Error:', error);
    return 'Maaf, terjadi kesalahan dalam melakukan permintaan.';
  }
}

module.exports = {
  setApiKey,
  generateDeepAIImage
};
