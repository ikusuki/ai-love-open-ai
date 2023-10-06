import { Hono } from "hono";
import OpenAI from "openai";
import { cors } from "hono/cors";

const NUMBER_OF_IMAGES_TO_GENERATE = 1;
const IMAGE_SIZE = "512x512";

const openAI = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = new Hono();

// Very simple cors configuration for allowing access from localhost:3000 react app
app.use(
  "/api/*",
  cors({
    origin: "http://localhost:3000",
    allowMethods: ["POST"],
  })
);

// Handle a POST request to /api/open-ai/image-generator
// Expected body: { prompt: string }
// The prompt will be a text with descriptions on how to generate images
app.post("/api/open-ai/image-generator", async (c) => {
  const body = await c.req.json();
  const { prompt } = body;

  if (!openAI.apiKey) {
    return c.json({ error: "OpenAI API key not set" }, { status: 500 });
  }

  if (!prompt) {
    return c.json({ error: "Prompt not provided" }, { status: 400 });
  }

  // https://platform.openai.com/docs/api-reference/images/object
  const openAIResponse = await openAI.images.generate({
    prompt, // ユーザーのプロンプト
    n: NUMBER_OF_IMAGES_TO_GENERATE, // 生成する画像の数
    size: IMAGE_SIZE, // 画像サイズ
  });

  if (
    !openAIResponse.data ||
    !openAIResponse.data[0] ||
    !openAIResponse.data[0].url
  ) {
    return c.json({ error: "OpenAI API response invalid" }, { status: 500 });
  }

  return c.json({ url: openAIResponse.data[0].url });
});

export default app;
