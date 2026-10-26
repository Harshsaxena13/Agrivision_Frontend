import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import X from "lucide-react-native/icons/x";
import { Theme } from "../../theme";
import { ChatAttachment } from "../../navigation/types";

interface AttachmentTrayProps {
  attachments: ChatAttachment[];
  onRemove: (id: string) => void;
}

export const AttachmentTray: React.FC<AttachmentTrayProps> = ({
  attachments,
  onRemove,
}) => {
  if (attachments.length === 0) {
    return null;
  }

  return (
    <View style={styles.tray}>
      {attachments.map((a) =>
        a.kind === "image" ? (
          <View key={a.id} style={styles.thumb}>
            <Image source={{ uri: a.uri }} style={styles.thumbImage} />
            <TouchableOpacity
              style={styles.thumbRemove}
              onPress={() => onRemove(a.id)}
              hitSlop={11} // 22px button, 44px touch target
              accessibilityRole="button"
              accessibilityLabel={`Remove photo ${a.name}`}
            >
              <X size={12} color="#FFFFFF" strokeWidth={3} />
            </TouchableOpacity>
          </View>
        ) : (
          <View key={a.id} style={styles.file}>
            <View style={styles.pdfBadge}>
              <Text style={styles.pdfBadgeText}>PDF</Text>
            </View>
            <Text
              style={styles.fileName}
              numberOfLines={1}
              ellipsizeMode="middle"
            >
              {a.name}
            </Text>
            <TouchableOpacity
              style={styles.fileRemove}
              onPress={() => onRemove(a.id)}
              hitSlop={8} // 28px button, 44px touch target
              accessibilityRole="button"
              accessibilityLabel={`Remove file ${a.name}`}
            >
              <X size={14} color={Theme.colors.muted} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Top/right padding leaves room for the overhanging remove buttons
  tray: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 10,
    paddingTop: 6,
    paddingRight: 6,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: Theme.colors.primaryLight,
  },
  thumbImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  thumbRemove: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    backgroundColor: "#374151",
    alignItems: "center",
    justifyContent: "center",
  },
  file: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 56,
    maxWidth: 220,
    paddingLeft: 12,
    paddingRight: 6,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
  },
  pdfBadge: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },
  pdfBadgeText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 9,
    color: "#991B1B",
  },
  fileName: {
    flexShrink: 1,
    fontFamily: Theme.fonts.medium,
    fontSize: 13,
    color: Theme.colors.text,
  },
  fileRemove: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});
