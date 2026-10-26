import React from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Mic from "lucide-react-native/icons/mic";
import Plus from "lucide-react-native/icons/plus";
import SendHorizontal from "lucide-react-native/icons/send-horizontal";
import { Theme } from "../../theme";
import { ChatAttachment } from "../../navigation/types";
import { AttachmentTray } from "./AttachmentTray";

interface ChatInputBarProps {
  value: string;
  onChangeText: (text: string) => void;
  attachments: ChatAttachment[];
  onRemoveAttachment: (id: string) => void;
  onAttachPress: () => void;
  onSend: () => void;
  onMicPress: () => void;
  placeholder?: string;
  loading?: boolean;
}

export const ChatInputBar: React.FC<ChatInputBarProps> = ({
  value,
  onChangeText,
  attachments,
  onRemoveAttachment,
  onAttachPress,
  onSend,
  onMicPress,
  placeholder = "Ask me anything about farming...",
  loading = false,
}) => {
  // The mic button becomes a send button once there is something to send
  const canSend = value.trim().length > 0 || attachments.length > 0;

  return (
    <View style={styles.bar}>
      <AttachmentTray attachments={attachments} onRemove={onRemoveAttachment} />

      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.iconBtn, styles.attachBtn]}
          onPress={onAttachPress}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Add photo or file"
        >
          <Plus size={22} color={Theme.colors.primary} />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          multiline
          maxLength={500}
        />

        <TouchableOpacity
          style={[styles.iconBtn, canSend ? styles.sendBtn : styles.micBtn]}
          onPress={canSend ? onSend : onMicPress}
          disabled={loading}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={canSend ? "Send message" : "Voice input"}
          accessibilityState={{ disabled: loading, busy: loading }}
        >
          {loading ? (
            <ActivityIndicator
              size="small"
              color={canSend ? "#FFFFFF" : Theme.colors.primary}
            />
          ) : canSend ? (
            <SendHorizontal size={20} color="#FFFFFF" />
          ) : (
            <Mic size={22} color={Theme.colors.primary} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  attachBtn: {
    backgroundColor: Theme.colors.primaryLight,
  },
  micBtn: {
    backgroundColor: Theme.colors.primaryLight,
  },
  sendBtn: {
    backgroundColor: Theme.colors.primary,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.background,
    fontFamily: Theme.fonts.regular,
    fontSize: 15,
    lineHeight: 20,
    color: Theme.colors.text,
    textAlignVertical: "center",
  },
});
