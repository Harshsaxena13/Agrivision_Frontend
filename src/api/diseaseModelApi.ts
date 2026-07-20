import { Platform } from "react-native";
import { DISEASE_DATABASE } from "./geminiApi";
import { DiseaseResult, ScanAnalysis } from "../navigation/types";

type ModelResponse = Record<string, unknown>;

const DEFAULT_API_URL = Platform.select({
  android: "http://10.0.2.2:8000",
  default: "http://127.0.0.1:8000",
});

const DISEASE_API_URL =
  (process.env.EXPO_PUBLIC_DISEASE_API_URL ?? DEFAULT_API_URL).replace(/\/+$/, "");
const DISEASE_API_ENDPOINT =
  process.env.EXPO_PUBLIC_DISEASE_API_ENDPOINT ?? "/predict";
const DISEASE_API_TIMEOUT_MS = 120000;
const MODEL_WARMUP_TIMEOUT_MS = 30000;
const MODEL_REQUEST_ATTEMPTS = 2;

let warmupPromise: Promise<void> | null = null;

const normalizeLabel = (value: string) =>
  value
    .replace(/\.[a-z0-9]+$/i, "")   // strip file extensions
    .replace(/^wheat[_\s]*/i, "")    // strip leading "Wheat_" / "wheat " prefix
    .replace(/[_-]+/g, " ")          // underscores/hyphens → spaces
    .replace(/\s+/g, " ")
    .trim();

const readString = (data: ModelResponse, keys: string[]) => {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
};

const readNumber = (data: ModelResponse, keys: string[]) => {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value <= 1 ? Math.round(value * 100) : Math.round(value);
    }
    if (typeof value === "string") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed <= 1 ? Math.round(parsed * 100) : Math.round(parsed);
      }
    }
  }
  return 85;
};

const findDisease = (label: string): DiseaseResult | null => {
  const normalizedLabel = normalizeLabel(label).toLowerCase();

  if (!normalizedLabel || normalizedLabel.includes("healthy")) {
    return null;
  }

  return (
    DISEASE_DATABASE.find((disease) => {
      const diseaseName = disease.name.toLowerCase();
      const plantType = disease.plantType.toLowerCase();
      return (
        normalizedLabel.includes(diseaseName) ||
        diseaseName.includes(normalizedLabel) ||
        normalizedLabel.includes(plantType)
      );
    }) ?? null
  );
};

const createFallbackDisease = (
  label: string,
  plantName: string,
  confidence: number,
): DiseaseResult => ({
  id:
    normalizeLabel(label).toLowerCase().replace(/\s+/g, "-") || "model-disease",
  name: normalizeLabel(label) || "Detected Disease",
  scientificName: "Unknown",
  plantType: plantName || "Plant",
  severity: confidence >= 90 ? "High" : confidence >= 70 ? "Medium" : "Low",
  confidence,
  symptoms: ["Model detected visual disease symptoms in the scanned image"],
  affectedParts: ["Leaves"],
  organicTreatment: [
    "Remove heavily affected leaves",
    "Improve airflow around the plant",
    "Avoid overhead watering until symptoms reduce",
  ],
  chemicalTreatment: [],
  prevention: [
    "Monitor nearby plants",
    "Keep field tools clean",
    "Scan again after treatment to track progress",
  ],
  emoji: "leaf",
  color: "#D69E2E",
});

const createModelUnavailableAnalysis = (message: string): ScanAnalysis => ({
  plantName: "Wheat",
  healthStatus: "At Risk",
  disease: null,
  overallScore: 50,
  modelAvailable: false,
  tips: [
    message,
    "The wheat disease detection service may be starting up — please wait a moment and try again.",
    "Ensure your image clearly shows the wheat plant leaves or spike for best results.",
  ],
});

const fetchWithTimeout = async (
  url: string,
  options: RequestInit,
  timeoutMs: number,
) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error(`Timeout of ${timeoutMs}ms exceeded`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

/**
 * Start a Render instance before a user submits an image. Any HTTP response
 * (including 404) proves the service is awake, so it is intentionally ignored.
 */
export const warmDiseaseModel = (): Promise<void> => {
  if (!warmupPromise) {
    warmupPromise = fetchWithTimeout(
      DISEASE_API_URL,
      { method: "GET" },
      MODEL_WARMUP_TIMEOUT_MS,
    )
      .then(() => undefined)
      .catch((error) => {
        // Prediction will provide the user-facing error if the service is
        // still unavailable. Do not prevent the scanner from opening.
        console.warn("[DiseaseModel] Warm-up request failed:", error);
      });
  }

  return warmupPromise;
};

const toScanAnalysis = (data: ModelResponse): ScanAnalysis => {
  const rawLabel = readString(data, [
    "label",
    "class",
    "class_name",
    "predicted_class",
    "prediction",
    "disease",
    "disease_name",
    "result",
  ]);

  if (!rawLabel) {
    return createModelUnavailableAnalysis(
      "The disease model responded, but did not include a prediction label.",
    );
  }

  const plantName =
    readString(data, ["plant", "plant_name", "crop", "crop_name"]) || "Plant";
  const confidence = readNumber(data, [
    "confidence",
    "probability",
    "score",
    "accuracy",
  ]);
  const disease =
    findDisease(rawLabel) ??
    createFallbackDisease(rawLabel, plantName, confidence);
  const isHealthy =
    rawLabel.toLowerCase().includes("healthy") ||
    rawLabel.toLowerCase().includes("normal") ||
    data.is_healthy === true;

  if (isHealthy) {
    return {
      plantName,
      healthStatus: "Healthy",
      disease: null,
      overallScore: Math.max(80, confidence),
      modelAvailable: true,
      tips: [
        "Your plant looks healthy based on the model prediction",
        "Keep monitoring leaves weekly",
        "Maintain consistent watering and soil nutrition",
      ],
    };
  }

  return {
    plantName: disease.plantType || plantName,
    healthStatus: confidence >= 55 ? "Diseased" : "At Risk",
    disease: { ...disease, confidence },
    overallScore: Math.max(10, 100 - confidence),
    modelAvailable: true,
    tips: [
      "Review the detected disease and start treatment early",
      "Remove infected leaves where practical",
      "Scan again after a few days to compare progress",
    ],
  };
};

export const analyzeWithDiseaseModel = async (
  imageUri: string,
  mimeType = "image/jpeg",
): Promise<ScanAnalysis> => {
  // If the screen's non-blocking warm-up is still in progress, let it finish
  // before sending the image so the prediction does not pay the cold-start cost.
  await warmDiseaseModel();

  const endpoint = `${DISEASE_API_URL}${DISEASE_API_ENDPOINT}`;
  const fileName = imageUri.split("/").pop() || "plant-scan.jpg";
  const formData = new FormData();

  formData.append("file", {
    uri: imageUri,
    name: fileName,
    type: mimeType,
  } as unknown as Blob);

  let response: Response | undefined;
  let lastError = "Unknown error";

  // Prediction is read-only, so one retry is safe. It also lets a Render
  // instance finish waking up after the first request reaches it.
  for (let attempt = 1; attempt <= MODEL_REQUEST_ATTEMPTS; attempt += 1) {
    try {
      const candidate = await fetchWithTimeout(
        endpoint,
        { method: "POST", body: formData },
        DISEASE_API_TIMEOUT_MS,
      );

      if (candidate.ok) {
        response = candidate;
        break;
      }

      const errorText = await candidate.text();
      lastError = `Request failed (${candidate.status}): ${errorText || candidate.statusText}`;
      // Client-side errors will not become valid by retrying the same image.
      if (candidate.status < 500) break;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }

    if (attempt < MODEL_REQUEST_ATTEMPTS) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  if (!response) {
    console.warn("[DiseaseModel] Request failed:", lastError);
    return createModelUnavailableAnalysis(
      "The disease model is unavailable right now. No diagnosis was produced.",
    );
  }

  try {
    const data = (await response.json()) as ModelResponse;
    return toScanAnalysis(data);
  } catch (error) {
    console.warn("[DiseaseModel] Invalid JSON response:", error);
    return createModelUnavailableAnalysis(
      "The disease model returned an invalid response.",
    );
  }
};
