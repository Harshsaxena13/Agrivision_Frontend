import type { NavigatorScreenParams } from "@react-navigation/native";

export type RootStackParamList = {
  Signup: undefined;
  Login: undefined;
  Onboarding: undefined;
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  Weather: undefined;
  Community: undefined;
  DiseaseDetail: { disease: DiseaseResult };
  ScanResult: { result: ScanAnalysis; imageUri?: string };
  CropDetail: { cropId: string };
  PostDetail: { postId: string };
  AllDiseases: undefined;
  AllCrops: undefined;
  CompareGrowth: undefined;
  PlantProfile: undefined;
  EditProfile: undefined;
  Settings: undefined;
  MyFields: undefined;
  Achievements: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Scan: undefined;
  History: undefined;
  AIAssistant: NavigatorScreenParams<AIAssistantStackParamList> | undefined;
  Profile: undefined;
};

export type AIAssistantStackParamList = {
  AIChat: undefined;
  AIChatHistory: undefined;
};

export interface DiseaseResult {
  id: string;
  name: string;
  scientificName: string;
  plantType: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  confidence: number;
  symptoms: string[];
  affectedParts: string[];
  organicTreatment: string[];
  chemicalTreatment: { product: string; dosage: string }[];
  prevention: string[];
  emoji: string;
  color: string;
}

export interface ScanAnalysis {
  plantName: string;
  healthStatus: "Healthy" | "Diseased" | "At Risk";
  disease: DiseaseResult | null;
  overallScore: number;
  tips: string[];
  /** False only when no prediction was received from the disease model. */
  modelAvailable?: boolean;
}

export interface WeatherData {
  location: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
  forecast: ForecastDay[];
  uvIndex: number;
  visibility: number;
}

export interface ForecastDay {
  day: string;
  high: number;
  low: number;
  icon: string;
  description: string;
  rainChance: number;
}

export interface Crop {
  id: string;
  name: string;
  hindiName: string;
  emoji: string;
  sowingDate?: string;
  harvestDate?: string;
  growthStage: number; // 0-100
  stageName: string;
  nextAction: string;
  color: string;
  area?: string;
}

export interface CommunityPost {
  id: string;
  author: string;
  avatar: string;
  location: string;
  timeAgo: string;
  content: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  tags: string[];
  isExpertAnswered: boolean;
  liked: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  landArea: string;
  farmingExperience: string;
  cropType: string;
  avatarUri?: string;
  crops: string[];
  language: "en" | "hi";
  totalScans: number;
  diseasesDetected: number;
  joinedDate: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: string;
}

export interface Field {
  id: string;
  name: string;
  status: "Active" | "Inactive";
  area: string;
  crop: string;
  lastScan: string;
}
