import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const fetchBuffer = async (url, timeoutMs = 10000) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }
    return response.arrayBuffer();
  } finally {
    clearTimeout(timeout);
  }
};

export const extractOgImages = (html) => {
  const matches = html.match(/<meta[^>]+property="(?:og:image|twitter:image)"[^>]+>/gi) ?? [];
  const urls = matches
    .map((tag) => tag.match(/content="([^"]+)"/i)?.[1])
    .filter(Boolean);
  return Array.from(new Set(urls));
};

export const writeThumbnail = async ({ buffer, outputPath, maxSize = 512, maxKb = 200 }) => {
  const image = sharp(buffer).resize({ width: maxSize, height: maxSize, fit: "inside" });
  let quality = 80;
  let outputBuffer = await image.jpeg({ quality }).toBuffer();

  while (outputBuffer.byteLength / 1024 > maxKb && quality > 30) {
    quality -= 10;
    outputBuffer = await image.jpeg({ quality }).toBuffer();
  }

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, outputBuffer);
  return outputPath;
};

export const buildThumbnails = async ({ itemId, imageUrls, outputDir }) => {
  const outputs = [];
  const limited = imageUrls.slice(0, 3);

  for (let index = 0; index < limited.length; index += 1) {
    const url = limited[index];
    const buffer = await fetchBuffer(url);
    const outputPath = path.join(outputDir, `${itemId}_${index + 1}.jpg`);
    await writeThumbnail({ buffer, outputPath });
    outputs.push(outputPath);
  }

  return outputs;
};
