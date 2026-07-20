import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  CameraCapturedPicture,
  CameraType,
  CameraView,
  FlashMode,
  useCameraPermissions,
} from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { CompositeNavigationProp } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  analyzeWithDiseaseModel,
  warmDiseaseModel,
} from "../../api/diseaseModelApi";
import apiClient from "../../lib/apiClient";
import {
  MainTabParamList,
  RootStackParamList,
  ScanAnalysis,
} from "../../navigation/types";
import { useAppStore } from "../../store/appStore";

type Props = {
  navigation: CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList, "Scan">,
    NativeStackNavigationProp<RootStackParamList>
  >;
};

const GREEN_PRIMARY = "#0B7A3E";
const GREEN_DARK = "#065F2F";
const TEXT_DARK = "#111827";
const TEXT_MUTED = "#6B7280";
const LIGHT_BG = "#F9FAFB";
// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Component ────────────────────────────────────────────────────────────────

export const ScannerScreen: React.FC<Props> = ({ navigation }) => {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("back");
  const [flash, setFlash] = useState<FlashMode>("off");
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const addScan = useAppStore((state) => state.addScan);

  useEffect(() => {
    // Wake the sleeping Render model while the user frames their plant photo.
    warmDiseaseModel();
  }, []);

  /**
   * Upload the captured image to the Express backend via multipart/form-data.
   * Returns the imageUrl served by the backend.
   */
  const uploadScanImage = async (
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
  const saveDetailedScan = async (
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

  const processImage = async (uri: string, mimeType?: string) => {
    setSelectedImageUri(uri);
    setIsProcessing(true);

    try {
      const [uploadedUrl, result] = await Promise.all([
        uploadScanImage(uri, mimeType),
        analyzeWithDiseaseModel(uri, mimeType),
      ]);

      // Do not write a file:// URI to MongoDB. The upload route returns a
      // server URL only after the image has been accepted successfully.
      const imageUri = uploadedUrl;
      // Persist to both collections. `scans` holds normalized scan fields;
      // `crop-logs` powers the timeline and keeps the complete analysis data.
      await Promise.all([
        saveDetailedScan(imageUri, result),
        addScan({ imageUri, result }),
      ]);

      navigation.navigate("ScanResult", { result, imageUri });
    } catch (error) {
      console.warn("[Scanner] Failed to process scan:", error);
      Alert.alert(
        "Scan failed",
        error instanceof Error
          ? error.message
          : "We could not upload or analyze this image. Please try again.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCapture = async () => {
    if (!cameraRef.current || !isCameraReady || isProcessing) return;

    try {
      const photo: CameraCapturedPicture | undefined =
        await cameraRef.current.takePictureAsync({
          quality: 0.8,
          skipProcessing: false,
        });

      if (photo?.uri) {
        await processImage(photo.uri, "image/jpeg");
      }
    } catch (error) {
      console.warn("[Scanner] Camera capture failed:", error);
      Alert.alert(
        "Camera error",
        "We could not capture the image. Please try again.",
      );
    }
  };

  const handlePickImage = async () => {
    if (isProcessing) return;

    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Permission needed",
        "Allow photo access to choose a plant image.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      await processImage(asset.uri, asset.mimeType);
    }
  };

  const toggleFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const toggleFlash = () => {
    setFlash((current) => (current === "off" ? "on" : "off"));
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.centered} edges={["top", "bottom"]}>
        <ActivityIndicator color={GREEN_PRIMARY} />
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView
        style={styles.permissionContainer}
        edges={["top", "bottom"]}
      >
        <View style={styles.permissionIcon}>
          <Ionicons name="camera-outline" size={42} color={GREEN_PRIMARY} />
        </View>
        <Text style={styles.permissionTitle}>Camera access needed</Text>
        <Text style={styles.permissionText}>
          Allow camera access to capture plant images for disease scanning.
        </Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={requestPermission}
          activeOpacity={0.85}
        >
          <Ionicons name="camera" size={20} color="#FFF" />
          <Text style={styles.primaryButtonText}>Allow Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handlePickImage}
          activeOpacity={0.85}
        >
          <Ionicons name="image-outline" size={20} color={GREEN_PRIMARY} />
          <Text style={styles.secondaryButtonText}>Choose From Gallery</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.iconBtn}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan Plant</Text>
        <TouchableOpacity
          onPress={handlePickImage}
          style={styles.iconBtn}
          disabled={isProcessing}
        >
          <Ionicons name="image-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.cameraShell}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
          flash={flash}
          onCameraReady={() => setIsCameraReady(true)}
        />

        <LinearGradient
          colors={["rgba(0,0,0,0.45)", "transparent"]}
          style={styles.topShade}
        />
        <View style={styles.scanFrame}>
          <View style={[styles.corner, styles.cornerTopLeft]} />
          <View style={[styles.corner, styles.cornerTopRight]} />
          <View style={[styles.corner, styles.cornerBottomLeft]} />
          <View style={[styles.corner, styles.cornerBottomRight]} />
        </View>
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.55)"]}
          style={styles.bottomShade}
        />

        {selectedImageUri && isProcessing ? (
          <Image
            source={{ uri: selectedImageUri }}
            style={styles.previewImage}
          />
        ) : null}

        {isProcessing ? (
          <View style={styles.processingOverlay}>
            <ActivityIndicator size="large" color="#FFF" />
            <Text style={styles.processingTitle}>Analyzing scan</Text>
            <Text style={styles.processingText}>
              Running your disease model and saving the plant image...
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.hintPanel}>
        <Ionicons name="leaf-outline" size={22} color={GREEN_PRIMARY} />
        <Text style={styles.hintText}>
          Center the affected leaves inside the frame and keep the image steady.
        </Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.roundControl}
          onPress={toggleFlash}
          disabled={isProcessing}
        >
          <Ionicons
            name={flash === "on" ? "flash" : "flash-off"}
            size={24}
            color={TEXT_DARK}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.captureButton,
            (!isCameraReady || isProcessing) && styles.disabledButton,
          ]}
          onPress={handleCapture}
          disabled={!isCameraReady || isProcessing}
          activeOpacity={0.85}
        >
          <View style={styles.captureInner} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.roundControl}
          onPress={toggleFacing}
          disabled={isProcessing}
        >
          <Ionicons name="camera-reverse-outline" size={26} color={TEXT_DARK} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#061D11" },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: LIGHT_BG,
  },
  permissionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    backgroundColor: LIGHT_BG,
  },
  permissionIcon: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF5EC",
    marginBottom: 18,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: TEXT_DARK,
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 15,
    lineHeight: 22,
    color: TEXT_MUTED,
    textAlign: "center",
    marginBottom: 22,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    height: 52,
    borderRadius: 26,
    backgroundColor: GREEN_PRIMARY,
    marginBottom: 12,
  },
  primaryButtonText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "#CDE7D5",
    backgroundColor: "#FFF",
  },
  secondaryButtonText: {
    color: GREEN_PRIMARY,
    fontSize: 16,
    fontWeight: "700",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  iconBtn: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#FFF" },
  cameraShell: {
    flex: 1,
    marginHorizontal: 16,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  camera: { flex: 1 },
  topShade: { position: "absolute", top: 0, left: 0, right: 0, height: 130 },
  bottomShade: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  scanFrame: {
    position: "absolute",
    left: 32,
    right: 32,
    top: "22%",
    bottom: "22%",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    borderRadius: 26,
  },
  corner: {
    position: "absolute",
    width: 46,
    height: 46,
    borderColor: "#FFFFFF",
  },
  cornerTopLeft: {
    top: -2,
    left: -2,
    borderLeftWidth: 4,
    borderTopWidth: 4,
    borderTopLeftRadius: 26,
  },
  cornerTopRight: {
    top: -2,
    right: -2,
    borderRightWidth: 4,
    borderTopWidth: 4,
    borderTopRightRadius: 26,
  },
  cornerBottomLeft: {
    bottom: -2,
    left: -2,
    borderLeftWidth: 4,
    borderBottomWidth: 4,
    borderBottomLeftRadius: 26,
  },
  cornerBottomRight: {
    bottom: -2,
    right: -2,
    borderRightWidth: 4,
    borderBottomWidth: 4,
    borderBottomRightRadius: 26,
  },
  previewImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    backgroundColor: "rgba(6, 29, 17, 0.72)",
  },
  processingTitle: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "800",
    marginTop: 18,
    marginBottom: 6,
  },
  processingText: {
    color: "#DCEFE3",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  hintPanel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 20,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: "#F2FBF5",
  },
  hintText: {
    flex: 1,
    color: GREEN_DARK,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 48,
    paddingTop: 22,
    paddingBottom: 16,
  },
  roundControl: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
  },
  captureButton: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 5,
    borderColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: GREEN_PRIMARY,
  },
  disabledButton: { opacity: 0.6 },
});
