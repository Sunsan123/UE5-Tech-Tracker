import {
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography
} from "@mui/material";
import BilingualBlock from "./BilingualBlock";

interface ModuleUpdateCardProps {
  titleZh: string;
  titleEn: string;
  summaryZh: string;
  summaryEn: string;
  version: string;
  date: string;
  tags: string[];
  credibility: "high" | "low";
}

const ModuleUpdateCard = ({
  titleZh,
  titleEn,
  summaryZh,
  summaryEn,
  version,
  date,
  tags,
  credibility
}: ModuleUpdateCardProps) => {
  return (
    <Card>
      <CardContent>
        <Stack spacing={1.5}>
          <BilingualBlock zh={titleZh} en={titleEn} />
          <BilingualBlock zh={summaryZh} en={summaryEn} />
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
    </Card>
  );
};

export default ModuleUpdateCard;
