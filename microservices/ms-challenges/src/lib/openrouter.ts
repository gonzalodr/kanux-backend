import axios from "axios";

const apiKey = process.env.OPENROUTER_API_KEY || "";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content:
    | string
    | Array<
        | { type: "text"; text: string }
        | { type: "image_url"; image_url: { url: string } }
        | { type: "video_url"; video_url: { url: string } }
      >;
};

export async function sendChat(
  messages: ChatMessage[],
  options?: { model?: string; stream?: boolean },
) {
  const model =
    options?.model || process.env.OPENROUTER_MODEL || "allenai/molmo-2-8b:free";
  const resp = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model,
      messages,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.APP_URL || "http://localhost",
        "X-Title": process.env.APP_NAME || "Kanux Challenges",
      },
    },
  );
  return resp.data;
}
