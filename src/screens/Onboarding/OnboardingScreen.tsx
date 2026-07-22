import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppStore } from "../../store/appStore";
import { RootStackParamList } from "../../navigation/types";

const { width } = Dimensions.get("window");

const GREEN_PRIMARY = "#0B7A3E";
const LIGHT_GREEN = "#EAF5EC";
const TEXT_DARK = "#111827";
const TEXT_MUTED = "#6B7280";
const BG_COLOR = "#F9FAFB";
const CARD_BG = "#FFFFFF";
const BORDER_COLOR = "#E5E7EB";

interface Slide {
  emoji: string;
  title: string;
  subtitle: string;
  description: string;
}

const SLIDES: Slide[] = [
  {
    emoji: "🌱",
    title: "AgriVisionAI",
    subtitle: "Smart Farming Assistant",
    description:
      "Protect your crops with AI-powered disease detection. Scan any plant and get instant diagnosis & treatment.",
  },
  {
    emoji: "🔬",
    title: "Scan & Detect",
    subtitle: "AI Disease Scanner",
    description:
      "Simply point your camera at any plant. Our AI analyzes instantly and provides organic & chemical treatment guides.",
  },
  {
    emoji: "🌦️",
    title: "Smart Advisory",
    subtitle: "Weather + Crop Intelligence",
    description:
      "Get personalized crop advice based on real-time weather. Maximize your yield with data-driven decisions.",
  },
];

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Onboarding">;
};

export const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { setHasSeenOnboarding } = useAppStore();

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const emojiScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(emojiScale, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [currentSlide]);

  const nextSlide = () => {
    if (currentSlide < SLIDES.length - 1) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
      emojiScale.setValue(0);
      setTimeout(() => setCurrentSlide((c) => c + 1), 200);
    } else {
      setHasSeenOnboarding(true);
      navigation.replace("Login" as any); // cast as any to bypass temporary type error before updating types
    }
  };

  const slide = SLIDES[currentSlide];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <Animated.View style={[styles.slideContent, { opacity: fadeAnim }]}>
          {/* Decorative Background Element */}
          <View style={styles.bgCircle} />

          <View style={styles.emojiCircle}>
            <Animated.Text
              style={[
                styles.slideEmoji,
                { transform: [{ scale: emojiScale }] },
              ]}
            >
              {slide.emoji}
            </Animated.Text>
          </View>

          <Text style={styles.slideTitle}>{slide.title}</Text>
          <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>
          <Text style={styles.slideDesc}>{slide.description}</Text>

          <View style={styles.bottomSection}>
            {/* Dots */}
            <View style={styles.dots}>
              {SLIDES.map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, i === currentSlide && styles.dotActive]}
                />
              ))}
            </View>

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={nextSlide}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryBtnText}>
                {currentSlide < SLIDES.length - 1 ? "Next →" : "Get Started"}
              </Text>
            </TouchableOpacity>

            {currentSlide < SLIDES.length - 1 ? (
              <TouchableOpacity
                onPress={() => {
                  setHasSeenOnboarding(true);
                  navigation.replace("Login" as any);
                }}
                style={styles.skipBtn}
              >
                <Text style={styles.skipText}>Skip Onboarding</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.skipBtn} />
            )}
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_COLOR },
  safe: { flex: 1 },
  flex: { flex: 1 },
  slideContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  bgCircle: {
    position: "absolute",
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width * 0.6,
    backgroundColor: LIGHT_GREEN,
    top: -width * 0.4,
    opacity: 0.5,
  },
  emojiCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: CARD_BG,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
  },
  slideEmoji: { fontSize: 72 },
  slideTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: TEXT_DARK,
    textAlign: "center",
    marginBottom: 8,
  },
  slideSubtitle: {
    fontSize: 18,
    color: GREEN_PRIMARY,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
  },
  slideDesc: {
    fontSize: 15,
    color: TEXT_MUTED,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 12,
  },
  bottomSection: {
    position: "absolute",
    bottom: 40,
    left: 24,
    right: 24,
    alignItems: "center",
  },
  dots: {
    flexDirection: "row",
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D1D5DB",
    marginHorizontal: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: GREEN_PRIMARY,
  },
  primaryBtn: {
    width: "100%",
    backgroundColor: GREEN_PRIMARY,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryBtnDisabled: {
    backgroundColor: "#9CA3AF",
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  skipBtn: {
    marginTop: 16,
    alignItems: "center",
    paddingVertical: 8,
    minHeight: 40,
  },
  skipText: {
    color: TEXT_MUTED,
    fontSize: 15,
    fontWeight: "600",
  },
});
