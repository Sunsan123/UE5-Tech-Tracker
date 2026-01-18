import { create } from "zustand";

type FavoriteEntry = {
  id: string;
  ts: number;
};

type FavoritesState = {
  items: FavoriteEntry[];
  isFavorite: (id: string) => boolean;
  addFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  toggleFavorite: (id: string) => void;
};

const STORAGE_KEY = "ue5-tech-tracker:favorites";

const loadFavorites = (): FavoriteEntry[] => {
  if (typeof window === "undefined") {
    return [];
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .filter((entry) => entry && typeof entry.id === "string")
      .map((entry) => ({
        id: entry.id,
        ts: typeof entry.ts === "number" ? entry.ts : Date.now(),
      }));
  } catch (error) {
    console.warn("Failed to parse favorites from storage.", error);
    return [];
  }
};

const persistFavorites = (items: FavoriteEntry[]) => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  items: loadFavorites(),
  isFavorite: (id) => get().items.some((entry) => entry.id === id),
  addFavorite: (id) => {
    const items = get().items;
    if (items.some((entry) => entry.id === id)) {
      return;
    }
    const next = [{ id, ts: Date.now() }, ...items];
    persistFavorites(next);
    set({ items: next });
  },
  removeFavorite: (id) => {
    const next = get().items.filter((entry) => entry.id !== id);
    persistFavorites(next);
    set({ items: next });
  },
  toggleFavorite: (id) => {
    if (get().items.some((entry) => entry.id === id)) {
      get().removeFavorite(id);
    } else {
      get().addFavorite(id);
    }
  },
}));

export type { FavoriteEntry };
