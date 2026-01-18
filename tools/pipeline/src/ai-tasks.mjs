import { generate } from "./ai-client.mjs";

const parseJson = (text) => {
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`Failed to parse AI JSON: ${error.message}`);
  }
};

export const classifyItem = async ({ title, summary, excerpts, filePaths, moduleCodes }) => {
  const prompt = `You are a UE5 release analyst. Return JSON only.\n\nInput:\nTitle: ${title}\nSummary: ${summary}\nExcerpts: ${excerpts.join("\n")}\nFile Paths: ${filePaths.join(", ")}\nModule Codes: ${moduleCodes.join(", ")}\n\nOutput JSON schema:\n{\"module_system\": string[], \"tags\": string[], \"confidence\": number}\n`;
  const raw = await generate({ prompt });
  return parseJson(raw);
};

export const generateBenefits = async ({ title, summary }) => {
  const prompt = `Generate benefits in Chinese, JSON only.\nTitle: ${title}\nSummary: ${summary}\nOutput: {\"summary\": string, \"performance\": string, \"quality\": string, \"workflow\": string}`;
  const raw = await generate({ prompt });
  return parseJson(raw);
};

export const generateRisks = async ({ title, summary }) => {
  const prompt = `Generate risks in Chinese (<=5 items), JSON only.\nTitle: ${title}\nSummary: ${summary}\nOutput: {\"risks\": string[]}`;
  const raw = await generate({ prompt });
  return parseJson(raw);
};

export const translateExcerpt = async ({ excerpt }) => {
  const prompt = `Translate to Chinese, preserving terms, class names, code, paths, and abbreviations.\nOutput JSON: {\"translation\": string}`;
  const raw = await generate({ prompt: `${prompt}\nExcerpt:\n${excerpt}` });
  return parseJson(raw);
};
