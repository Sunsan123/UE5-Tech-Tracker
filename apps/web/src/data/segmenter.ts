const segmenter = new Intl.Segmenter("zh", { granularity: "word" });

export const segmentText = (text: string) =>
  Array.from(segmenter.segment(text))
    .map((entry) => entry.segment.trim())
    .filter(Boolean);
