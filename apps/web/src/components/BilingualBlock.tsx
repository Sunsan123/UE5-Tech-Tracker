import { Stack, Typography, type TypographyProps } from "@mui/material";
import useLanguageStore from "../store/languageStore";

interface BilingualBlockProps {
  zh: string;
  en: string;
  zhVariant?: TypographyProps["variant"];
  enVariant?: TypographyProps["variant"];
}

const BilingualBlock = ({
  zh,
  en,
  zhVariant = "body1",
  enVariant = "body2"
}: BilingualBlockProps) => {
  const mode = useLanguageStore((state) => state.mode);

  return (
    <Stack spacing={0.5}>
      {(mode === "zh" || mode === "both") && (
        <Typography variant={zhVariant} color="text.primary">
          {zh}
        </Typography>
      )}
      {(mode === "en" || mode === "both") && (
        <Typography variant={enVariant} color="text.secondary">
          {en}
        </Typography>
      )}
    </Stack>
  );
};

export default BilingualBlock;
