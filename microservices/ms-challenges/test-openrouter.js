// Script de prueba para validar la conexión con OpenRouter
const axios = require("axios");
require("dotenv").config();

const apiKey = process.env.OPENROUTER_API_KEY;

console.log("=== OpenRouter Test ===");
console.log("API Key length:", apiKey?.length || 0);
console.log("API Key prefix:", apiKey?.substring(0, 15) || "NOT SET");
console.log("");

if (!apiKey) {
  console.error("ERROR: OPENROUTER_API_KEY no está configurada en .env");
  process.exit(1);
}

async function testOpenRouter() {
  try {
    console.log("Probando con modelo: allenai/molmo-2-8b:free");
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "allenai/molmo-2-8b:free",
        messages: [
          {
            role: "user",
            content: 'Say "test successful" if you can read this.',
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost",
          "X-Title": "Kanux Test",
        },
      },
    );

    console.log("✅ SUCCESS!");
    console.log("Response:", response.data.choices[0].message.content);
  } catch (error) {
    console.error("❌ ERROR:", error.response?.status || error.message);
    if (error.response?.data) {
      console.error(
        "OpenRouter Error Details:",
        JSON.stringify(error.response.data, null, 2),
      );
    }

    // Intentar con otro modelo
    if (error.response?.status === 401) {
      console.log(
        "\n🔄 Probando con modelo alternativo: google/gemini-2.0-flash-exp:free",
      );
      try {
        const response2 = await axios.post(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            model: "google/gemini-2.0-flash-exp:free",
            messages: [
              {
                role: "user",
                content: 'Say "test successful" if you can read this.',
              },
            ],
          },
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
              "HTTP-Referer": "http://localhost",
              "X-Title": "Kanux Test",
            },
          },
        );

        console.log("✅ SUCCESS with alternative model!");
        console.log("Response:", response2.data.choices[0].message.content);
        console.log(
          "\n💡 SOLUCIÓN: Actualiza OPENROUTER_MODEL=google/gemini-2.0-flash-exp:free en tu .env",
        );
      } catch (error2) {
        console.error(
          "❌ Alternative model also failed:",
          error2.response?.status || error2.message,
        );
        if (error2.response?.data) {
          console.error(
            "Details:",
            JSON.stringify(error2.response.data, null, 2),
          );
        }
      }
    }
  }
}

testOpenRouter();
