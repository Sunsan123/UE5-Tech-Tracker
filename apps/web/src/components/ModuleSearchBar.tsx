import { InputAdornment, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

interface ModuleSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

const ModuleSearchBar = ({ value, onChange }: ModuleSearchBarProps) => {
  return (
    <TextField
      fullWidth
      placeholder="搜索标题、摘要或标签"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon color="action" />
          </InputAdornment>
        )
      }}
    />
  );
};

export default ModuleSearchBar;
