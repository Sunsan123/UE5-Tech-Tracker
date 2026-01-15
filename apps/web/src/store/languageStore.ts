import { create } from "zustand";
import { persist } from "zustand/middleware";

export type LanguageMode = "zh" | "en" | "both";

interface LanguageState {
  mode: LanguageMode;
  setMode: (mode: LanguageMode) => void;
}

const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      mode: "both",
      setMode: (mode) => set({ mode })
    }),
    {
      name: "ue5-tech-tracker-language"
    }
  )
);

export default useLanguageStore;
