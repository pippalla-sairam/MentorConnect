// services/embeddingService.js
const axios = require("axios");

async function getEmbedding(text) {
  try {
    const res = await axios.post("http://localhost:8000/embedding", { texts: [text] });
    return res.data.embeddings[0]; // first embedding
  } catch (err) {
    console.error("Error fetching embedding:", err.message);
    throw err;
  }
}

module.exports = { getEmbedding };
