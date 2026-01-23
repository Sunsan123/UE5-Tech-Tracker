import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  Divider,
  Stack,
  Typography
} from "@mui/material";
import { Link } from "react-router-dom";
import BilingualBlock from "./BilingualBlock";

interface ModuleUpdateCardProps {
  id: string;
  titleZh: string;
  titleEn: string;
  summaryZh: string;
  summaryEn: string;
  version: string;
  date: string;
  tags: readonly string[];
  credibility: "high" | "low";
  thumbnailUrl?: string | null;
  highlightSnippet?: string | null;
}

const ModuleUpdateCard = ({
  id,
  titleZh,
  titleEn,
  summaryZh,
  summaryEn,
  version,
  date,
  tags,
  credibility,
  thumbnailUrl,
  highlightSnippet
}: ModuleUpdateCardProps) => {
  return (
    <Card>
      <CardActionArea component={Link} to={`/item/${id}`}>
        <Stack direction={{ xs: "column", sm: "row" }}>
          <CardMedia
            component="img"
            sx={{ width: { xs: "100%", sm: 160 }, height: { xs: 160, sm: "auto" } }}
            image={thumbnailUrl ?? "/assets/thumbnail-placeholder.svg"}
            alt={titleEn}
          />
          <CardContent sx={{ flex: 1 }}>
            <Stack spacing={1.5}>
              <BilingualBlock zh={titleZh} en={titleEn} />
              <BilingualBlock zh={summaryZh} en={summaryEn} />
              {highlightSnippet ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  dangerouslySetInnerHTML={{ __html: highlightSnippet }}
                />
              ) : null}
              <Divider />
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip label={`版本 ${version}`} size="small" />
                <Chip label={date} size="small" variant="outlined" />
                <Chip
                  label={credibility === "high" ? "高可信" : "低可信"}
                  size="small"
                  color={credibility === "high" ? "success" : "warning"}
                />
              </Stack>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {tags.map((tag) => (
                  <Chip key={tag} label={tag} size="small" variant="outlined" />
                ))}
              </Stack>
            </Stack>
          </CardContent>
        </Stack>
      </CardActionArea>
    </Card>
  );
};

export default ModuleUpdateCard;
