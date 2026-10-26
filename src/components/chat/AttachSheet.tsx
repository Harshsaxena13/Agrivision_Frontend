import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Modal,
  Animated,
  Easing,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import type { DocumentPickerAsset } from "expo-document-picker";
import Camera from "lucide-react-native/icons/camera";
import File from "lucide-react-native/icons/file";
import ImageIcon from "lucide-react-native/icons/image";
import Info from "lucide-react-native/icons/info";
import ScanLine from "lucide-react-native/icons/scan-line";
import X from "lucide-react-native/icons/x";
import { Theme } from "../../theme";
import { ChatAttachment } from "../../navigation/types";
import { AttachmentTray } from "./AttachmentTray";

export const MAX_ATTACHMENTS = 4;
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const DOCUMENT_TYPES = ["application/pdf", "image/jpeg", "image/png"];

const OPTIONS = [
  {
    key: "camera",
    label: "Camera",
    Icon: Camera,
    bg: "#DCFCE7",
    fg: Theme.colors.primary,
  },
  {
    key: "gallery",
    label: "Gallery",
    Icon: ImageIcon,
    bg: "#E0E7FF",
    fg: "#3730A3",
  },
  {
    key: "document",
    label: "Document",
    Icon: File,
    bg: "#FEF3C7",
    fg: "#92400E",
  },
  {
    key: "pastScan",
    label: "Past scan",
    Icon: ScanLine,
    bg: "#CCFBF1",
    fg: "#115E59",
  },
] as const;

type OptionKey = (typeof OPTIONS)[number]["key"];

interface AttachSheetProps {
  visible: boolean;
  existingCount: number; // attachments already waiting above the input bar
  onClose: () => void;
  onAdd: (attachments: ChatAttachment[]) => void;
  onPastScanPress: () => void;
}

let nextId = 0;
const makeId = () => `att-${Date.now()}-${nextId++}`;

const fromImageAsset = (
  asset: ImagePicker.ImagePickerAsset
): ChatAttachment => ({
  id: makeId(),
  kind: "image",
  uri: asset.uri,
  name: asset.fileName ?? asset.uri.split("/").pop() ?? "photo.jpg",
  mimeType: asset.mimeType ?? "image/jpeg",
  size: asset.fileSize,
});

const fromDocumentAsset = (asset: DocumentPickerAsset): ChatAttachment => {
  const isPdf =
    asset.mimeType === "application/pdf" ||
    asset.name.toLowerCase().endsWith(".pdf");
  return {
    id: makeId(),
    kind: isPdf ? "pdf" : "image",
    uri: asset.uri,
    name: asset.name,
    mimeType: asset.mimeType ?? (isPdf ? "application/pdf" : "image/jpeg"),
    size: asset.size,
  };
};

const addLabel = (files: ChatAttachment[]) => {
  const n = files.length;
  if (n === 0) return "Add";
  const noun = files.every((f) => f.kind === "image") ? "photo" : "file";
  return `Add ${n} ${noun}${n > 1 ? "s" : ""}`;
};

export const AttachSheet: React.FC<AttachSheetProps> = ({
  visible,
  existingCount,
  onClose,
  onAdd,
  onPastScanPress,
}) => {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<ChatAttachment[]>([]);
  const translateY = useRef(new Animated.Value(400)).current;

  const remaining = MAX_ATTACHMENTS - existingCount - selected.length;

  // Slide the sheet up while the Modal fades in the backdrop
  useEffect(() => {
    if (visible) {
      translateY.setValue(400);
      Animated.timing(translateY, {
        toValue: 0,
        duration: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      setSelected([]);
    }
  }, [visible, translateY]);

  const addFiles = (files: ChatAttachment[]) => {
    const tooBig = files.filter(
      (f) => f.size !== undefined && f.size > MAX_FILE_SIZE
    );
    const fits = files.filter((f) => !tooBig.includes(f));
    const accepted = fits.slice(0, Math.max(remaining, 0));

    const problems: string[] = [];
    if (tooBig.length > 0) {
      const names = tooBig.map((f) => f.name).join(", ");
      problems.push(
        `${names} ${tooBig.length === 1 ? "is" : "are"} over 10 MB.`
      );
    }
    if (accepted.length < fits.length) {
      problems.push(
        `You can attach up to ${MAX_ATTACHMENTS} files per message.`
      );
    }
    if (problems.length > 0) {
      Alert.alert("Some files weren't added", problems.join("\n"));
    }
    if (accepted.length > 0) {
      setSelected((prev) => [...prev, ...accepted]);
    }
  };

  const handleOption = async (key: OptionKey) => {
    if (key === "pastScan") {
      // Keep anything already picked before leaving the sheet
      if (selected.length > 0) onAdd(selected);
      onClose();
      onPastScanPress();
      return;
    }

    if (remaining <= 0) {
      Alert.alert(
        "Attachment limit reached",
        `You can attach up to ${MAX_ATTACHMENTS} files per message.`
      );
      return;
    }

    try {
      if (key === "camera") {
        const { granted } = await ImagePicker.requestCameraPermissionsAsync();
        if (!granted) {
          Alert.alert(
            "Camera access needed",
            "Allow camera access in Settings to take a photo."
          );
          return;
        }
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          quality: 0.8,
        });
        if (!result.canceled) addFiles(result.assets.map(fromImageAsset));
      } else if (key === "gallery") {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          quality: 0.8,
          allowsMultipleSelection: true,
          selectionLimit: remaining,
        });
        if (!result.canceled) addFiles(result.assets.map(fromImageAsset));
      } else {
        // Loaded on first use: the module throws on import in a build that
        // lacks its native code, which would otherwise crash the whole app
        const DocumentPicker = await import("expo-document-picker");
        const result = await DocumentPicker.getDocumentAsync({
          type: DOCUMENT_TYPES,
          multiple: true,
          copyToCacheDirectory: true,
        });
        if (!result.canceled) addFiles(result.assets.map(fromDocumentAsset));
      }
    } catch (err) {
      console.warn("[AttachSheet] Picker failed:", err);
      Alert.alert("Couldn't open picker", "Please try again.");
    }
  };

  const handleAdd = () => {
    onAdd(selected);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable
          style={[StyleSheet.absoluteFill, styles.backdrop]}
          onPress={onClose}
          accessible={false}
          importantForAccessibility="no"
        />

        <Animated.View
          style={[
            styles.sheet,
            { paddingBottom: 28 + insets.bottom, transform: [{ translateY }] },
          ]}
          accessibilityViewIsModal
        >
          <View style={styles.handle} />

          <View style={styles.headerRow}>
            <Text style={styles.title} accessibilityRole="header">
              Add to your question
            </Text>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <X size={20} color="#374151" />
            </TouchableOpacity>
          </View>

          <View style={styles.grid}>
            {OPTIONS.map(({ key, label, Icon, bg, fg }) => (
              <TouchableOpacity
                key={key}
                style={styles.option}
                onPress={() => handleOption(key)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={label}
              >
                <View style={[styles.optionIcon, { backgroundColor: bg }]}>
                  <Icon size={26} color={fg} />
                </View>
                <Text style={styles.optionLabel}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <AttachmentTray
            attachments={selected}
            onRemove={(id) =>
              setSelected((prev) => prev.filter((a) => a.id !== id))
            }
          />

          <View style={styles.tip}>
            <Info size={18} color="#166534" style={styles.tipIcon} />
            <Text style={styles.tipText}>
              Tip: take photos in daylight, close to the affected leaf. Up to 4
              photos and PDF, JPG or PNG files (max 10 MB).
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.addBtn,
              selected.length === 0 && styles.addBtnDisabled,
            ]}
            onPress={handleAdd}
            disabled={selected.length === 0}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityState={{ disabled: selected.length === 0 }}
          >
            <Text style={styles.addText}>{addLabel(selected)}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    backgroundColor: "rgba(17, 24, 39, 0.45)",
  },
  sheet: {
    gap: 18,
    paddingTop: 10,
    paddingHorizontal: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: "#FFFFFF",
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#D1D5DB",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontFamily: Theme.fonts.bold,
    fontSize: 18,
    color: Theme.colors.text,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  grid: {
    flexDirection: "row",
    gap: 10,
  },
  option: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  optionIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  optionLabel: {
    fontFamily: Theme.fonts.medium,
    fontSize: 12,
    color: Theme.colors.text,
  },
  tip: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: Theme.colors.primaryLight,
  },
  tipIcon: {
    marginTop: 1,
  },
  tipText: {
    flex: 1,
    fontFamily: Theme.fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: "#166534",
  },
  addBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: Theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnDisabled: {
    opacity: 0.5,
  },
  addText: {
    fontFamily: Theme.fonts.semiBold,
    fontSize: 16,
    color: "#FFFFFF",
  },
});
