import { create } from "zustand";
import {
  ScanAnalysis,
  UserProfile,
  Crop,
  CommunityPost,
  ChatMessage,
  Field,
} from "../navigation/types";
import { DISEASE_DATABASE } from "../api/geminiApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../lib/apiClient";

// ─── App Store ─────────────────────────────────────────────────────────────────
interface AppState {
  hasSeenOnboarding: boolean;
  currentUserId: string | null; // tracks the logged-in user for AsyncStorage key scoping
  user: UserProfile;
  scanHistory: {
    id: string;
    imageUri: string;
    result: ScanAnalysis;
    date: string;
  }[];
  crops: Crop[];
  fields: Field[];
  posts: CommunityPost[];
  chatHistory: ChatMessage[];
  activeConversationId: string | null;
  setHasSeenOnboarding: (val: boolean) => void;
  setUser: (user: Partial<UserProfile>) => void;
  setCurrentUserId: (userId: string | null) => void;
  addScan: (scan: { imageUri: string; result: ScanAnalysis }) => Promise<void>;
  addCrop: (crop: Crop) => void;
  removeCrop: (id: string) => void;
  toggleFieldStatus: (id: string) => void;
  removeField: (id: string) => void;
  togglePostLike: (id: string) => void;
  addChatMessage: (msg: ChatMessage) => void;
  setChatHistory: (msgs: ChatMessage[]) => void;
  setActiveConversationId: (id: string | null) => void;
  loadFromStorage: (userId?: string) => Promise<void>;
  fetchUserData: (userId: string) => Promise<void>;
}

const DEFAULT_CROPS: Crop[] = [
  {
    id: "c1",
    name: "Tomato",
    hindiName: "टमाटर",
    emoji: "🍅",
    sowingDate: "2026-03-15",
    harvestDate: "2026-06-20",
    growthStage: 72,
    stageName: "Fruiting Stage",
    nextAction: "Apply potassium fertilizer",
    color: "#E53E3E",
    area: "0.5 acres",
  },
  {
    id: "c2",
    name: "Wheat",
    hindiName: "गेहूँ",
    emoji: "🌾",
    sowingDate: "2025-11-10",
    harvestDate: "2026-04-05",
    growthStage: 95,
    stageName: "Harvesting Ready",
    nextAction: "Schedule harvest — crop is ready!",
    color: "#D69E2E",
    area: "2 acres",
  },
  {
    id: "c3",
    name: "Rice",
    hindiName: "धान",
    emoji: "🌾",
    sowingDate: "2026-06-01",
    harvestDate: "2026-09-30",
    growthStage: 15,
    stageName: "Seedling Stage",
    nextAction: "Maintain 5cm standing water",
    color: "#2B6CB0",
    area: "1.5 acres",
  },
];

const DEFAULT_FIELDS: Field[] = [
  {
    id: "f1",
    name: "North Field",
    status: "Active",
    area: "2.5 Acre",
    crop: "Maize",
    lastScan: "Today, 08:30 AM",
  },
  {
    id: "f2",
    name: "East Field",
    status: "Active",
    area: "1.8 Acre",
    crop: "Maize",
    lastScan: "Yesterday, 07:15 PM",
  },
  {
    id: "f3",
    name: "South Field",
    status: "Inactive",
    area: "3.2 Acre",
    crop: "Maize",
    lastScan: "5 Jun 2024",
  },
  {
    id: "f4",
    name: "West Field",
    status: "Active",
    area: "2.0 Acre",
    crop: "Wheat",
    lastScan: "3 Jun 2024",
  },
  {
    id: "f5",
    name: "River Side Plot",
    status: "Active",
    area: "1.2 Acre",
    crop: "Rice",
    lastScan: "1 Jun 2024",
  },
];

const DEFAULT_POSTS: CommunityPost[] = [
  {
    id: "p1",
    author: "Ramesh Patel",
    avatar: "👨‍🌾",
    location: "Anand, Gujarat",
    timeAgo: "2h ago",
    content:
      "My tomato plants are showing yellow spots on leaves. I applied neem oil last week. Any suggestions? The spots are spreading from bottom leaves upward.",
    likes: 34,
    comments: 12,
    tags: ["Tomato", "Disease", "Help"],
    isExpertAnswered: true,
    liked: false,
  },
  {
    id: "p2",
    author: "Sunita Devi",
    avatar: "👩‍🌾",
    location: "Sitapur, UP",
    timeAgo: "5h ago",
    content:
      "Got excellent wheat yield this season using the irrigation schedule from this app! 4.2 tonnes/acre 🎉 Thank you AgriVisionAI!",
    likes: 128,
    comments: 45,
    tags: ["Wheat", "Success", "Irrigation"],
    isExpertAnswered: false,
    liked: true,
  },
  {
    id: "p3",
    author: "Dr. Suresh Kumar",
    avatar: "👨‍🔬",
    location: "IARI, Delhi",
    timeAgo: "1d ago",
    content:
      "⚠️ Alert for North India farmers: Early Blight disease spreading in tomato fields. Watch for brown circular lesions. Apply Mancozeb 75% WP @ 2.5g/L water immediately if you spot symptoms.",
    likes: 256,
    comments: 89,
    tags: ["Alert", "Tomato", "Blight"],
    isExpertAnswered: false,
    liked: false,
  },
  {
    id: "p4",
    author: "Mahesh Sharma",
    avatar: "👨‍🌾",
    location: "Nashik, Maharashtra",
    timeAgo: "2d ago",
    content:
      "Used AgriVisionAI scanner on my grape vines and it detected Downy Mildew at early stage. Treated immediately and saved 80% of my crop! This app is a game changer for us farmers. 🙏",
    likes: 198,
    comments: 67,
    tags: ["Grapes", "Mildew", "Scanner"],
    isExpertAnswered: true,
    liked: false,
  },
];

export const useAppStore = create<AppState>((set, get) => ({
  hasSeenOnboarding: false,
  currentUserId: null,
  user: {
    name: "Kisan Ji",
    email: "",
    phone: "",
    location: "Maharashtra, India",
    landArea: "3.5 acres",
    farmingExperience: "5-10 years",
    cropType: "Maize",
    crops: ["Tomato", "Wheat", "Rice"],
    language: "en",
    totalScans: 0,
    diseasesDetected: 0,
    joinedDate: new Date().toISOString(),
  },
  scanHistory: [],
  crops: DEFAULT_CROPS,
  fields: DEFAULT_FIELDS,
  posts: DEFAULT_POSTS,
  activeConversationId: null,
  chatHistory: [],

  setHasSeenOnboarding: (val) => {
    set({ hasSeenOnboarding: val });
    AsyncStorage.setItem("hasSeenOnboarding", val ? "true" : "false").catch(
      (error) => {
        console.warn("[App] Failed to save onboarding flag:", error);
      }
    );
  },

  setUser: (partial) => {
    set((state) => ({ user: { ...state.user, ...partial } }));
  },

  setCurrentUserId: (userId) => {
    set({ currentUserId: userId });
  },

  addScan: async (scan) => {
    // Crop logs are the single source of truth for scan history. Previously
    // this POST ran in the background while ScannerScreen posted the same scan
    // to a different /scans collection, so the UI could report a failure even
    // when the history used a different record.
    const { data: savedLog } = await apiClient.post("/crop-logs", {
      cropName: scan.result.plantName,
      imageUrl: scan.imageUri,
      healthStatus: scan.result.healthStatus,
      analysisReport: scan.result,
    });

    const entry = {
      id: savedLog._id,
      imageUri: scan.imageUri,
      result: scan.result,
      date: new Date().toLocaleDateString("en-IN"),
    };
    set((state) => ({
      scanHistory: [entry, ...state.scanHistory.slice(0, 19)],
      user: {
        ...state.user,
        totalScans: state.user.totalScans + 1,
        diseasesDetected:
          state.user.diseasesDetected + (scan.result.disease ? 1 : 0),
      },
    }));

  },

  addCrop: async (crop) => {
    set((state) => ({ crops: [...state.crops, crop] }));

    apiClient
      .post("/plants", {
        plantName: crop.name,
        cropType: crop.name,
        fieldName: `${crop.name} Field`,
        sowingDate: crop.sowingDate || new Date().toISOString(),
        location: crop.area || "N/A",
      })
      .then(() => {
        // Re-fetch to get the real MongoDB _id back
        const { user } = get();
        // userId comes from authStore; we don't have it here, so fetchUserData
        // is called from the screen after addCrop resolves.
      })
      .catch((err) => console.warn("[App] addCrop failed:", err));
  },

  removeCrop: async (id) => {
    set((state) => ({ crops: state.crops.filter((c) => c.id !== id) }));
    // Only delete from server if it's a real MongoDB ObjectId (not a default "c1" id)
    if (!id.startsWith("c")) {
      apiClient
        .delete(`/plants/${id}`)
        .catch((err) => console.warn("[App] removeCrop failed:", err));
    }
  },

  toggleFieldStatus: (id) =>
    set((state) => ({
      fields: state.fields.map((field) =>
        field.id === id
          ? {
              ...field,
              status: field.status === "Active" ? "Inactive" : "Active",
            }
          : field
      ),
    })),

  removeField: async (id) => {
    set((state) => ({
      fields: state.fields.filter((field) => field.id !== id),
    }));
    if (!id.startsWith("f")) {
      apiClient
        .delete(`/plants/${id}`)
        .catch((err) => console.warn("[App] removeField failed:", err));
    }
  },

  togglePostLike: (id) =>
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === id
          ? {
              ...p,
              liked: !p.liked,
              likes: p.liked ? p.likes - 1 : p.likes + 1,
            }
          : p
      ),
    })),

  addChatMessage: (msg) =>
    set((state) => ({ chatHistory: [...state.chatHistory, msg] })),
  setChatHistory: (msgs) => set({ chatHistory: msgs }),
  setActiveConversationId: (id) => {
    set({ activeConversationId: id });
    // Scope the AsyncStorage key by the current user's ID so conversation IDs
    // never bleed across different accounts on the same device.
    const userId = get().currentUserId;
    const storageKey = userId
      ? `activeConversationId_${userId}`
      : "activeConversationId_guest";
    if (id) {
      AsyncStorage.setItem(storageKey, id).catch((err) =>
        console.warn("[App] Failed to save conversationId:", err)
      );
    } else {
      AsyncStorage.removeItem(storageKey).catch((err) =>
        console.warn("[App] Failed to remove conversationId:", err)
      );
    }
  },

  loadFromStorage: async (userId?: string) => {
    try {
      const hasSeenOnboarding = await AsyncStorage.getItem("hasSeenOnboarding");
      if (hasSeenOnboarding === "true") set({ hasSeenOnboarding: true });

      // Only restore the conversation ID for this specific user.
      // Using a user-scoped key prevents one user's session from appearing
      // in another user's AI chat.
      if (userId) {
        set({ currentUserId: userId });
        const storageKey = `activeConversationId_${userId}`;
        const activeConvId = await AsyncStorage.getItem(storageKey);
        if (activeConvId) set({ activeConversationId: activeConvId });
      }
      // If no userId is provided (not yet authenticated), do NOT restore any
      // conversation ID — it will be loaded after the user identity is confirmed.
    } catch (error) {
      console.warn("[App] Failed to load from storage:", error);
    }
  },

  fetchUserData: async (_userId: string) => {
    try {
      // Fetch plants
      const { data: plantsData } = await apiClient.get("/plants");

      if (plantsData) {
        const loadedFields: Field[] = plantsData.map((p: any) => ({
          id: p._id,
          name: p.fieldName || "Unknown Field",
          status: "Active",
          area: p.location || "N/A",
          crop: p.cropType || "Unknown",
          lastScan: new Date(p.createdAt).toLocaleDateString("en-IN"),
        }));

        const loadedCrops: Crop[] = plantsData.map((p: any) => ({
          id: p._id,
          name: p.plantName || p.cropType || "Unknown Crop",
          hindiName: "",
          emoji: "🌱",
          sowingDate: p.sowingDate,
          harvestDate: undefined,
          growthStage: 50,
          stageName: "Growing",
          nextAction: "Monitor crop",
          color: "#0B7A3E",
          area: p.location || "N/A",
        }));

        set({ fields: loadedFields, crops: loadedCrops });
      }

      // Fetch crop logs (scan history)
      const { data: logsData } = await apiClient.get("/crop-logs");

      if (logsData) {
        const loadedScans = logsData.map((log: any) => ({
          id: log._id,
          imageUri: log.imageUrl,
          result: {
            plantName: log.cropName || "Unknown",
            healthStatus: log.healthStatus,
            overallScore: log.analysisReport?.overallScore || 0,
            disease: log.analysisReport?.disease || null,
            tips: log.analysisReport?.tips || [],
          },
          date: new Date(log.createdAt).toLocaleDateString("en-IN"),
        }));

        set({ scanHistory: loadedScans });
      }
    } catch (err) {
      console.warn("[App] Failed to fetch user data:", err);
    }
  },
}));
