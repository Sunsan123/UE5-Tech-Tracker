import { Stack, Typography } from "@mui/material";
import useLanguageStore from "../store/languageStore";

interface BilingualBlockProps {
  zh: string;
  en: string;
}

const BilingualBlock = ({ zh, en }: BilingualBlockProps) => {
  const mode = useLanguageStore((state) => state.mode);

  return (
    <Stack spacing={0.5}>
      {(mode === "zh" || mode === "both") && (
        <Typography variant="body1" color="text.primary">
          {zh}
        </Typography>
      )}
      {(mode === "en" || mode === "both") && (
        <Typography variant="body2" color="text.secondary">
          {en}
        </Typography>
      )}
    </Stack>
  );
};

export default BilingualBlock;
