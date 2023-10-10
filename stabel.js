

// // Fungsi untuk menghasilkan gambar dari Stable Diffusion
// async function generateStableDiffusionImage(text) {
//   const apiKey = "hVBeyrikyYruPpJIW0pFKYJ2UDkULWFAk9zvw6WgA7MtEERVALvHa9XhO2d9";

//   const requestOptions = {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       key: apiKey,
//       prompt: text,
//       negative_prompt: null,
//       width: "512",
//       height: "512",
//       samples: "1",
//       num_inference_steps: "20",
//       seed: null,
//       guidance_scale: 7.5,
//       safety_checker: "yes",
//       multi_lingual: "no",
//       panorama: "no",
//       self_attention: "no",
//       upscale: "no",
//       embeddings_model: null,
//       webhook: null,
//       track_id: null,
//     }),
//   };

//   try {
//     const response = await fetch("https://stablediffusionapi.com/api/v3/text2img", requestOptions);
//     const result = await response.json();

//     if (result && result.data && result.data[0] && result.data[0].url) {
//       return { url: result.data[0].url };
//     } else {
//       throw new Error("Gagal menghasilkan gambar dari Stable Diffusion");
//     }
//   } catch (error) {
//     console.error('Error:', error);
//     throw error;
//   }
// }

// module.exports = {
//   generateStableDiffusionImage,
// };
