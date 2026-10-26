import { Inter_400Regular } from "@expo-google-fonts/inter/400Regular";
import { Inter_500Medium } from "@expo-google-fonts/inter/500Medium";
import { Inter_600SemiBold } from "@expo-google-fonts/inter/600SemiBold";
import { Inter_700Bold } from "@expo-google-fonts/inter/700Bold";
import { Inter_800ExtraBold } from "@expo-google-fonts/inter/800ExtraBold";

// This file takes precedence over the ./theme folder for `from "../theme"`
// imports, so re-export the existing tokens to keep those imports working.
export * from "./theme/index";

export const Theme = {
  colors: {
    primary: "#15803D",
    primaryLight: "#F0FDF4",
    border: "#BBF7D0",
    background: "#F7F9F7",
    text: "#111827",
    muted: "#4B5563",
  },

  // Font families (loaded at startup in App.tsx)
  fonts: {
    regular: "Inter_400Regular",
    medium: "Inter_500Medium",
    semiBold: "Inter_600SemiBold",
    bold: "Inter_700Bold",
    extraBold: "Inter_800ExtraBold",
  },
};

// Font files to load; keys must match the family names in Theme.fonts.
export const InterFonts = {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
};
