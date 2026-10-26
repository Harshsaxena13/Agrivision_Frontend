import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import Markdown, { MarkdownIt } from "react-native-markdown-display";
import Check from "lucide-react-native/icons/check";
import Square from "lucide-react-native/icons/square";
import Volume1 from "lucide-react-native/icons/volume-1";
import { Theme } from "../../theme";
import { ChatAttachment } from "../../navigation/types";

export interface MessageTag {
  label: string; // e.g. "Likely: Early blight"
  note?: string; // e.g. "from your photo"
  tone?: "warning" | "success";
}

interface MessageBubbleProps {
  isBot: boolean;
  text?: string;
  timestamp?: string;
  attachments?: ChatAttachment[];
  tag?: MessageTag;
  speaking?: boolean;
  onListenPress?: () => void;
  saveStatus?: "idle" | "saving" | "saved";
  onSavePress?: () => void;
}

// One shared parser; Markdown would otherwise build a new one every render
const markdownParser = MarkdownIt({ typographer: true });

const formatFileMeta = (bytes?: number) => {
  if (bytes === undefined) return "PDF";
  const kb = bytes / 1024;
  return kb < 1024
    ? `PDF · ${Math.max(1, Math.round(kb))} KB`
    : `PDF · ${(kb / 1024).toFixed(1)} MB`;
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  isBot,
  text,
  timestamp,
  attachments = [],
  tag,
  speaking = false,
  onListenPress,
  saveStatus = "idle",
  onSavePress,
}) => {
  const success = tag?.tone === "success";

  return (
    <View style={[styles.group, isBot ? styles.groupBot : styles.groupUser]}>
      {attachments.map((a) =>
        a.kind === "image" ? (
          <Image
            key={a.id}
            source={{ uri: a.uri }}
            style={styles.image}
            accessibilityLabel={`Photo ${a.name}`}
          />
        ) : (
          <View key={a.id} style={styles.file}>
            <View style={styles.pdfBadge}>
              <Text style={styles.pdfBadgeText}>PDF</Text>
            </View>
            <View style={styles.fileInfo}>
              <Text
                style={styles.fileName}
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {a.name}
              </Text>
              <Text style={styles.fileMeta}>{formatFileMeta(a.size)}</Text>
            </View>
          </View>
        )
      )}

      {!!text && (
        <View
          style={[styles.bubble, isBot ? styles.bubbleBot : styles.bubbleUser]}
        >
          {tag && (
            <View style={styles.tagRow}>
              <View style={[styles.tag, success && styles.tagSuccess]}>
                <Text
                  style={[styles.tagText, success && styles.tagTextSuccess]}
                >
                  {tag.label}
                </Text>
              </View>
              {!!tag.note && <Text style={styles.tagNote}>{tag.note}</Text>}
            </View>
          )}

          {isBot ? (
            <Markdown style={markdownStyles} markdownit={markdownParser}>
              {text}
            </Markdown>
          ) : (
            <Text style={[styles.text, styles.textUser]}>{text}</Text>
          )}

          {!!timestamp && (
            <Text
              style={[
                styles.timestamp,
                isBot ? styles.metaBot : styles.metaUser,
              ]}
            >
              {timestamp}
            </Text>
          )}
        </View>
      )}

      {/* Attachment-only messages show the time under the attachments */}
      {!text && !!timestamp && (
        <Text style={[styles.timestamp, styles.metaBot]}>{timestamp}</Text>
      )}

      {isBot && (onListenPress || onSavePress) && (
        <View style={styles.actions}>
          {onListenPress && (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={onListenPress}
              hitSlop={{ top: 4, bottom: 4 }} // 36px button, 44px touch target
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={
                speaking ? "Stop reading aloud" : "Listen to this answer"
              }
            >
              {speaking ? (
                <Square size={14} color="#374151" />
              ) : (
                <Volume1 size={16} color="#374151" />
              )}
              <Text style={styles.actionText}>
                {speaking ? "Stop" : "Listen"}
              </Text>
            </TouchableOpacity>
          )}

          {onSavePress && (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={onSavePress}
              disabled={saveStatus !== "idle"}
              hitSlop={{ top: 4, bottom: 4 }}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityState={{
                disabled: saveStatus !== "idle",
                busy: saveStatus === "saving",
              }}
            >
              {saveStatus === "saving" && (
                <ActivityIndicator size="small" color="#374151" />
              )}
              {saveStatus === "saved" && (
                <Check size={16} color={Theme.colors.primary} />
              )}
              <Text
                style={[
                  styles.actionText,
                  saveStatus === "saved" && styles.actionTextSaved,
                ]}
              >
                {saveStatus === "saved"
                  ? "Saved to History"
                  : saveStatus === "saving"
                  ? "Saving…"
                  : "Save to History"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  group: {
    marginHorizontal: 16,
    marginVertical: 5,
    gap: 6,
  },
  groupBot: {
    maxWidth: "88%",
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },
  groupUser: {
    maxWidth: "80%",
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  image: {
    width: 200,
    height: 150,
    borderRadius: 16,
    backgroundColor: Theme.colors.primaryLight,
  },
  file: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    maxWidth: "100%",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  pdfBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },
  pdfBadgeText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 10,
    color: "#991B1B",
  },
  fileInfo: {
    flexShrink: 1,
  },
  fileName: {
    fontFamily: Theme.fonts.semiBold,
    fontSize: 14,
    color: Theme.colors.text,
  },
  fileMeta: {
    fontFamily: Theme.fonts.regular,
    fontSize: 12,
    color: Theme.colors.muted,
    marginTop: 1,
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    gap: 4,
  },
  bubbleBot: {
    paddingVertical: 12,
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderBottomLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: Theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: "#FEF3C7",
  },
  tagSuccess: {
    backgroundColor: "#DCFCE7",
  },
  tagText: {
    fontFamily: Theme.fonts.semiBold,
    fontSize: 12,
    color: "#92400E",
  },
  tagTextSuccess: {
    color: "#166534",
  },
  tagNote: {
    fontFamily: Theme.fonts.regular,
    fontSize: 12,
    color: Theme.colors.muted,
  },
  text: {
    fontFamily: Theme.fonts.regular,
    fontSize: 15,
    lineHeight: 22,
  },
  textBot: {
    color: Theme.colors.text,
  },
  textUser: {
    color: "#FFFFFF",
  },
  timestamp: {
    fontFamily: Theme.fonts.regular,
    fontSize: 11,
  },
  metaBot: {
    color: Theme.colors.muted,
  },
  metaUser: {
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "right",
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
  },
  actionText: {
    fontFamily: Theme.fonts.semiBold,
    fontSize: 13,
    color: "#374151",
  },
  actionTextSaved: {
    color: Theme.colors.primary,
  },
});

const monospace = Platform.select({ ios: "Menlo", default: "monospace" });

// Theme for AI replies. Text styles (font, size, color) set on a block also
// apply to the text inside it, so body sets the defaults for everything.
// Bold comes from the Inter bold file, not fontWeight, which Android ignores
// for custom fonts.
const markdownStyles = StyleSheet.create({
  body: {
    fontFamily: Theme.fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: Theme.colors.text,
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 6,
  },
  heading1: {
    fontFamily: Theme.fonts.bold,
    fontSize: 20,
    lineHeight: 28,
    marginTop: 4,
    marginBottom: 6,
  },
  heading2: {
    fontFamily: Theme.fonts.bold,
    fontSize: 18,
    lineHeight: 26,
    marginTop: 4,
    marginBottom: 6,
  },
  heading3: {
    fontFamily: Theme.fonts.semiBold,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 2,
    marginBottom: 4,
  },
  heading4: {
    fontFamily: Theme.fonts.semiBold,
    fontSize: 15,
    marginBottom: 4,
  },
  heading5: {
    fontFamily: Theme.fonts.semiBold,
    fontSize: 15,
    marginBottom: 4,
  },
  heading6: {
    fontFamily: Theme.fonts.semiBold,
    fontSize: 15,
    marginBottom: 4,
  },
  strong: {
    fontFamily: Theme.fonts.bold,
    fontWeight: "normal",
  },
  bullet_list: {
    marginBottom: 6,
  },
  ordered_list: {
    marginBottom: 6,
  },
  list_item: {
    marginBottom: 4,
    fontSize: 14,
    lineHeight: 21,
    color: "#374151",
  },
  bullet_list_icon: {
    marginLeft: 2,
    marginRight: 8,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.bold,
  },
  ordered_list_icon: {
    marginLeft: 2,
    marginRight: 8,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.semiBold,
  },
  code_inline: {
    fontFamily: monospace,
    fontSize: 13,
    paddingHorizontal: 4,
    paddingVertical: 0,
    borderWidth: 0,
    borderRadius: 4,
    backgroundColor: Theme.colors.primaryLight,
  },
  code_block: {
    fontFamily: monospace,
    fontSize: 13,
    padding: 10,
    marginBottom: 6,
    borderWidth: 0,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  fence: {
    fontFamily: monospace,
    fontSize: 13,
    padding: 10,
    marginBottom: 6,
    borderWidth: 0,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  blockquote: {
    marginLeft: 0,
    marginBottom: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderLeftWidth: 3,
    borderLeftColor: Theme.colors.primary,
    backgroundColor: Theme.colors.primaryLight,
  },
  hr: {
    height: 1,
    marginVertical: 8,
    backgroundColor: Theme.colors.border,
  },
  link: {
    color: Theme.colors.primary,
    textDecorationLine: "underline",
  },
  table: {
    marginBottom: 6,
    borderRadius: 6,
    borderColor: Theme.colors.border,
  },
  tr: {
    borderColor: Theme.colors.border,
  },
  th: {
    padding: 6,
    fontFamily: Theme.fonts.semiBold,
  },
  td: {
    padding: 6,
  },
});
