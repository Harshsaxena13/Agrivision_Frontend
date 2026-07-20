import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Language = "English" | "Hindi";
export type Units = "Metric (cm, kg)" | "Imperial (ft, lb)";
export type AutoBackup = "Daily" | "Weekly" | "Monthly" | "Off";

export interface AppSettings {
  language: Language;
  units: Units;
  darkMode: boolean;
  notifications: boolean;
  autoBackup: AutoBackup;
  syncWifiOnly: boolean;
  aiSuggestions: boolean;
  dataSaverMode: boolean;
}

interface SettingsState extends AppSettings {
  loaded: boolean;
  loadSettings: () => Promise<void>;
  updateSettings: (partial: Partial<AppSettings>) => void;
}

const STORAGE_KEY = "appSettings";

const DEFAULT_SETTINGS: AppSettings = {
  language: "English",
  units: "Metric (cm, kg)",
  darkMode: false,
  notifications: true,
  autoBackup: "Daily",
  syncWifiOnly: true,
  aiSuggestions: true,
  dataSaverMode: false,
};

async function persistSettings(settings: AppSettings) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn("[Settings] Failed to persist:", error);
  }
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...DEFAULT_SETTINGS,
  loaded: false,

  loadSettings: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AppSettings>;
        set({ ...DEFAULT_SETTINGS, ...parsed, loaded: true });
        return;
      }
    } catch (error) {
      console.warn("[Settings] Failed to load:", error);
    }
    set({ loaded: true });
  },

  updateSettings: (partial) => {
    set((state) => {
      const next = {
        language: state.language,
        units: state.units,
        darkMode: state.darkMode,
        notifications: state.notifications,
        autoBackup: state.autoBackup,
        syncWifiOnly: state.syncWifiOnly,
        aiSuggestions: state.aiSuggestions,
        dataSaverMode: state.dataSaverMode,
        ...partial,
      };
      persistSettings(next);
      return next;
    });
  },
}));
