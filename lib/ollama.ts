// Ollama Cloud connection helper.
// Connection pattern mirrored EXACTLY from d:\app-scode\ai-chat-embedded\lib\ollama.ts
// Endpoint: POST {OLLAMA_BASE_URL}/api/chat  with  Authorization: Bearer <key>

// Read lazily (at call time) so values reflect dotenv.config() having run,
// regardless of ES module import hoisting order.
const env = () => ({
  baseUrl: process.env.OLLAMA_BASE_URL || "https://ollama.com",
  apiKey: process.env.OLLAMA_API_KEY || "",
  model: process.env.OLLAMA_MODEL || "glm-5.2:cloud",
});

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export interface ChatOptions {
  temperature?: number;
  max_tokens?: number;
  model?: string;
}

/**
 * Send a multi-turn chat to Ollama Cloud and return the assistant text.
 */
export async function chatCompletion(
  messages: ChatMessage[],
  opts?: ChatOptions
): Promise<string> {
  const { baseUrl, apiKey, model } = env();
  if (!apiKey) {
    throw new Error("OLLAMA_API_KEY is not configured on the server.");
  }

  const res = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: opts?.model || model,
      messages,
      stream: false,
      options: {
        temperature: opts?.temperature ?? 0.7,
        top_p: 0.9,
        num_predict: opts?.max_tokens ?? 2048,
      },
    }),
  });

  if (!res.ok) {
    // Log the upstream detail server-side only; throw a generic message so no
    // backend/infra detail can leak to the client.
    const t = await res.text().catch(() => "");
    console.error(`Ollama upstream error ${res.status}: ${t}`);
    throw new Error(`Ollama request failed (${res.status})`);
  }

  const data = await res.json();
  return data.message?.content ?? "";
}
