import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Easing,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import Camera from "lucide-react-native/icons/camera";
import Check from "lucide-react-native/icons/check";
import ChevronDown from "lucide-react-native/icons/chevron-down";
import Keyboard from "lucide-react-native/icons/keyboard";
import Mic from "lucide-react-native/icons/mic";
import X from "lucide-react-native/icons/x";
import { Theme } from "../../theme";
import { ChatLanguage } from "../../components/chat/ChatHeader";

const RECORDING_OPTIONS = {
  ...RecordingPresets.HIGH_QUALITY,
  isMeteringEnabled: true,
};

const LANGUAGES: { value: ChatLanguage; label: string }[] = [
  { value: "en", label: "English" },
  { value: "hi", label: "हिन्दी" },
];

const PROMPTS: Record<ChatLanguage, string> = {
  en: "Ask your question…",
  hi: "अपना सवाल पूछिए…",
};

// Resting bar heights from the design, as a fraction of the 40px maximum
const BARS = [
  { shape: 0.3, color: "#86EFAC" },
  { shape: 0.6, color: "#86EFAC" },
  { shape: 0.9, color: "#4ADE80" },
  { shape: 0.5, color: "#86EFAC" },
  { shape: 0.75, color: "#4ADE80" },
  { shape: 1, color: "#4ADE80" },
  { shape: 0.65, color: "#86EFAC" },
  { shape: 0.4, color: "#86EFAC" },
  { shape: 0.8, color: "#4ADE80" },
  { shape: 0.45, color: "#86EFAC" },
  { shape: 0.25, color: "#86EFAC" },
];

const formatDuration = (ms: number) => {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

interface VoiceModeScreenProps {
  visible: boolean;
  language: ChatLanguage;
  onLanguageChange: (language: ChatLanguage) => void;
  onSend: (uri: string) => void; // recorded audio file
  onClose: () => void;
  onSwitchToKeyboard: () => void;
  onAddPhoto: () => void;
  onDismiss?: () => void; // iOS: called once the modal has fully closed
  transcript?: string;
}

export const VoiceModeScreen: React.FC<VoiceModeScreenProps> = ({
  visible,
  language,
  onLanguageChange,
  onSend,
  onClose,
  onSwitchToKeyboard,
  onAddPhoto,
  onDismiss,
  transcript,
}) => {
  const insets = useSafeAreaInsets();
  const recorder = useAudioRecorder(RECORDING_OPTIONS);
  const recorderState = useAudioRecorderState(recorder, 100);
  const [menuOpen, setMenuOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const pulse = useRef(new Animated.Value(0)).current;
  const bars = useRef(
    BARS.map((b) => new Animated.Value(b.shape * 0.3)),
  ).current;

  const listening = recorderState.isRecording;

  // Start recording each time voice mode opens
  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    setMenuOpen(false);

    const start = async () => {
      try {
        const { granted } = await requestRecordingPermissionsAsync();
        if (!granted) {
          Alert.alert(
            "Microphone access needed",
            "Allow microphone access in Settings to ask by voice.",
            [{ text: "OK", onPress: onClose }],
          );
          return;
        }
        await setAudioModeAsync({
          allowsRecording: true,
          playsInSilentMode: true,
        });
        await recorder.prepareToRecordAsync();
        if (!cancelled) recorder.record();
      } catch (error) {
        console.warn("[VoiceMode] Could not start recording:", error);
        Alert.alert("Couldn't start recording", "Please try again.", [
          { text: "OK", onPress: onClose },
        ]);
      }
    };
    start();

    return () => {
      cancelled = true;
      if (recorder.isRecording) recorder.stop().catch(() => {});
      setAudioModeAsync({ allowsRecording: false }).catch(() => {});
    };
  }, [visible]);

  // Pulse the rings around the mic while listening
  useEffect(() => {
    if (!listening) {
      pulse.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [listening, pulse]);

  // Bars follow the microphone level; metering is in dBFS (about -50 to 0)
  useEffect(() => {
    const { metering } = recorderState;
    const level = !listening
      ? 0
      : metering != null
        ? Math.min(1, Math.max(0, (metering + 50) / 50))
        : 0.5;
    Animated.parallel(
      bars.map((bar, i) =>
        Animated.timing(bar, {
          toValue: Math.min(
            1,
            Math.max(
              0.15,
              BARS[i].shape * (0.3 + 0.7 * level) * (0.8 + Math.random() * 0.4),
            ),
          ),
          duration: 120,
          useNativeDriver: true,
        }),
      ),
    ).start();
  }, [listening, recorderState.metering, recorderState.durationMillis, bars]);

  const stopRecording = async () => {
    const recordedMs = recorder.getStatus().durationMillis;
    if (recorder.isRecording) await recorder.stop();
    await setAudioModeAsync({ allowsRecording: false });
    return recordedMs > 300 ? recorder.uri : null;
  };

  const handleSend = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const uri = await stopRecording();
      if (uri) {
        onSend(uri);
      } else {
        Alert.alert("Nothing recorded", "Please try again.", [
          { text: "OK", onPress: onClose },
        ]);
      }
    } catch (error) {
      console.warn("[VoiceMode] Could not stop recording:", error);
      Alert.alert("Couldn't save the recording", "Please try again.", [
        { text: "OK", onPress: onClose },
      ]);
    } finally {
      setBusy(false);
    }
  };

  // Closing, switching to the keyboard and adding a photo discard the audio
  const discardThen = (next: () => void) => async () => {
    await stopRecording().catch(() => null);
    next();
  };

  const ringScale = (from: number, to: number) => ({
    transform: [
      {
        scale: pulse.interpolate({
          inputRange: [0, 1],
          outputRange: [from, to],
        }),
      },
    ],
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={discardThen(onClose)}
      onDismiss={onDismiss}
    >
      <View
        style={[
          styles.screen,
          { paddingTop: 20 + insets.top, paddingBottom: 40 + insets.bottom },
        ]}
      >
        <View style={styles.topRow}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={discardThen(onClose)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Close voice mode"
          >
            <X size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <View>
            <TouchableOpacity
              style={styles.langBtn}
              onPress={() => setMenuOpen((open) => !open)}
              hitSlop={{ top: 2, bottom: 2 }} // 40px pill, 44px touch target
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Change language"
              accessibilityState={{ expanded: menuOpen }}
            >
              <Text style={styles.langText}>
                {LANGUAGES.find((l) => l.value === language)?.label}
              </Text>
              <ChevronDown size={14} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>

            {menuOpen && (
              <View style={styles.menu}>
                {LANGUAGES.map((l) => (
                  <TouchableOpacity
                    key={l.value}
                    style={styles.menuItem}
                    onPress={() => {
                      onLanguageChange(l.value);
                      setMenuOpen(false);
                    }}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: l.value === language }}
                  >
                    <Text style={styles.menuText}>{l.label}</Text>
                    {l.value === language && (
                      <Check size={16} color={Theme.colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        <View style={styles.center}>
          <Text style={styles.status} accessibilityLiveRegion="polite">
            {listening ? "Listening…" : "Starting…"}
          </Text>

          <View style={styles.micArea}>
            <Animated.View style={[styles.ringOuter, ringScale(0.92, 1.06)]} />
            <Animated.View style={[styles.ringInner, ringScale(0.96, 1.04)]} />
            <View style={styles.micCircle}>
              <Mic size={44} color="#FFFFFF" />
            </View>
          </View>

          <View
            style={styles.wave}
            importantForAccessibility="no-hide-descendants"
          >
            {BARS.map((b, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.bar,
                  {
                    backgroundColor: b.color,
                    transform: [{ scaleY: bars[i] }],
                  },
                ]}
              />
            ))}
          </View>

          <View style={styles.transcriptBox}>
            <Text
              style={[styles.transcript, !transcript && styles.transcriptEmpty]}
            >
              {transcript || PROMPTS[language]}
            </Text>
            <Text style={styles.hint}>
              {listening
                ? `${formatDuration(recorderState.durationMillis)} · tap the red button when you're done`
                : "Getting the microphone ready…"}
            </Text>
          </View>
        </View>

        <View style={styles.bottomRow}>
          <TouchableOpacity
            style={styles.sideBtn}
            onPress={discardThen(onSwitchToKeyboard)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Switch to typing"
          >
            <Keyboard size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.stopBtn}
            onPress={handleSend}
            disabled={busy}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Stop and send"
            accessibilityState={{ disabled: busy, busy }}
          >
            <View style={styles.stopSquare} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sideBtn}
            onPress={discardThen(onAddPhoto)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Add a photo"
          >
            <Camera size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: "#052E16",
  },
  topRow: {
    zIndex: 1, // keeps the language menu above the content below
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  langBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  langText: {
    fontFamily: Theme.fonts.semiBold,
    fontSize: 14,
    color: "#FFFFFF",
  },
  menu: {
    position: "absolute",
    top: 48,
    right: 0,
    minWidth: 160,
    padding: 4,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  menuText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 15,
    color: Theme.colors.text,
  },
  center: {
    flex: 1,
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
    gap: 36,
  },
  status: {
    fontFamily: Theme.fonts.semiBold,
    fontSize: 14,
    letterSpacing: 1.1,
    textTransform: "uppercase",
    color: "#86EFAC",
  },
  micArea: {
    width: 220,
    height: 220,
    alignItems: "center",
    justifyContent: "center",
  },
  ringOuter: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(34, 197, 94, 0.12)",
  },
  ringInner: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(34, 197, 94, 0.22)",
  },
  micCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#16A34A",
  },
  wave: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    height: 40,
  },
  bar: {
    width: 5,
    height: 40,
    borderRadius: 3,
  },
  transcriptBox: {
    alignItems: "center",
    gap: 8,
  },
  transcript: {
    fontFamily: Theme.fonts.semiBold,
    fontSize: 22,
    lineHeight: 31,
    color: "#FFFFFF",
    textAlign: "center",
  },
  transcriptEmpty: {
    opacity: 0.7,
  },
  hint: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: "#A7F3D0",
    textAlign: "center",
  },
  bottomRow: {
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sideBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  stopBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "rgba(255, 255, 255, 0.25)",
    backgroundColor: "#FFFFFF",
  },
  stopSquare: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: "#DC2626",
  },
});
