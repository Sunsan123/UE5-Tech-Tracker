const OPENAI_ENDPOINT = "https://api.openai.com/v1/chat/completions";
const DEEPSEEK_ENDPOINT = "https://api.deepseek.com/v1/chat/completions";

const callChatApi = async ({ url, apiKey, model, messages }) => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ model, messages })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`LLM request failed: ${response.status} ${body}`);
  }

  const json = await response.json();
  const content = json?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("LLM response missing content.");
  }
  return content;
};

export const generate = async ({ prompt, model = "gpt-4.1-mini" }) => {
  const messages = [{ role: "user", content: prompt }];
  const openaiKey = process.env.OPENAI_API_KEY;
  const deepseekKey = process.env.DEEPSEEK_API_KEY;

  if (openaiKey) {
    return callChatApi({ url: OPENAI_ENDPOINT, apiKey: openaiKey, model, messages });
  }

  if (deepseekKey) {
    return callChatApi({ url: DEEPSEEK_ENDPOINT, apiKey: deepseekKey, model, messages });
  }

  throw new Error("No LLM API key configured.");
};
