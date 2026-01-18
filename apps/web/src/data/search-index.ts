import FlexSearch from "flexsearch";
import { indexItems } from "./index-base";
import { segmentText } from "./segmenter";

export const createSearchIndex = () => {
  const index = new FlexSearch.Index({
    tokenize: "forward",
    cache: true,
    context: true,
    encode: "icase"
  });

  indexItems.forEach((item) => {
    const fields = [
      item.title_zh,
      item.title_en,
      item.summary_zh,
      item.summary_en,
      item.tags.join(" ")
    ].filter(Boolean);

    const text = fields
      .flatMap((field, idx) => {
        const boost = idx < 2 ? 3 : idx < 4 ? 2 : 1;
        return Array.from({ length: boost }, () => field);
      })
      .join(" ");

    const segmented = segmentText(text).join(" ");
    index.add(item.id, `${text} ${segmented}`);
  });

  return index;
};
