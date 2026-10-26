import apiClient from "../lib/apiClient";
import { ScanAnalysis } from "../navigation/types";

const getImageMeta = (uri: string, fallbackMimeType = "image/jpeg") => {
  const cleanUri = uri.split("?")[0] ?? uri;
  const extension = cleanUri.split(".").pop()?.toLowerCase();

  if (extension === "png")
    return { extension: "png", contentType: "image/png" };
  if (extension === "webp")
    return { extension: "webp", contentType: "image/webp" };

  return {
    extension: extension === "jpeg" ? "jpeg" : "jpg",
    contentType: fallbackMimeType,
  };
};

/**
 * Upload a scan image to the Express backend via multipart/form-data.
 * Returns the imageUrl served by the backend.
 */
export const uploadScanImage = async (
  uri: string,
  mimeType?: string,
): Promise<string> => {
  const { contentType, extension } = getImageMeta(uri, mimeType);

  const formData = new FormData();
  // React Native's FormData accepts { uri, name, type }
  formData.append("image", {
    uri,
    name: `scan_${Date.now()}.${extension}`,
    type: contentType,
  } as any);

  const { data } = await apiClient.post<{ imageUrl: string }>(
    "/uploads",
    formData,
    {
      // Override the client's JSON default. Axios/React Native adds the
      // multipart boundary for the FormData payload.
      headers: { "Content-Type": "multipart/form-data" },
    },
  );

  return data.imageUrl;
};

/**
 * Store the normalized scan record in the dedicated `scans` collection.
 * Crop logs are maintained separately for the history timeline.
 */
export const saveDetailedScan = async (
  imageUrl: string,
  result: ScanAnalysis,
): Promise<void> => {
  await apiClient.post("/scans", {
    imageUrl,
    diseaseName: result.disease?.name ?? null,
    confidence: result.disease?.confidence ?? null,
    severity: result.disease?.severity ?? null,
    healthScore: result.overallScore,
    aiRecommendation: result.tips.join("\n"),
  });
};
