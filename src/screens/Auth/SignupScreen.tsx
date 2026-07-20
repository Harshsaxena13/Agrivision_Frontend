import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import { signup } from "../../lib/auth";
import { useAppStore } from "../../store/appStore";
import { useAuthStore } from "../../store/authStore";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Signup">;
};

const GREEN_PRIMARY = "#0B7A3E";
const LIGHT_GREEN = "#F0FDF4";
const TEXT_DARK = "#111827";
const TEXT_MUTED = "#6B7280";
const BG_COLOR = "#FFFFFF";
const BORDER_COLOR = "#E5E7EB";

export const SignupScreen: React.FC<Props> = ({ navigation }) => {
  const setUser = useAuthStore((state) => state.setUser);
  const setHasSeenOnboarding = useAppStore((state) => state.setHasSeenOnboarding);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState<"farmer" | "researcher">("farmer");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleRegister = async () => {
    if (!fullName || !agreed || !email || !password) return;

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");

      const { user } = await signup({
        fullName,
        email: email.trim(),
        password,
        phone,
        location,
        role,
      });

      setUser(user);
      setHasSeenOnboarding(true);
    } catch (err: any) {
      setErrorMsg(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.iconBtn}
        >
          <Ionicons name="arrow-back" size={24} color={TEXT_DARK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Register</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="leaf-outline" size={24} color={GREEN_PRIMARY} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Security Banner ── */}
          <View style={styles.securityBanner}>
            <View style={styles.shieldIconWrap}>
              <Ionicons
                name="shield-checkmark-outline"
                size={24}
                color={GREEN_PRIMARY}
              />
            </View>
            <View style={styles.securityTextWrap}>
              <Text style={styles.securityTitle}>
                Your data is safe with us.
              </Text>
              <Text style={styles.securitySubtitle}>
                We never share your information with anyone.
              </Text>
            </View>
          </View>

          {/* ── Form Inputs ── */}

          {errorMsg ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputWrap}>
              <Ionicons
                name="person-outline"
                size={20}
                color={TEXT_MUTED}
                style={styles.iconLeft}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#9CA3AF"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputWrap}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={TEXT_MUTED}
                style={styles.iconLeft}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your email address"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputWrap}>
              <TouchableOpacity style={styles.countryCodeWrap}>
                <Text style={styles.countryCodeText}>+91</Text>
                <Ionicons
                  name="chevron-down"
                  size={14}
                  color={TEXT_DARK}
                  style={{ marginLeft: 4 }}
                />
              </TouchableOpacity>
              <View style={styles.verticalDivider} />
              <TextInput
                style={[styles.input, { paddingLeft: 12 }]}
                placeholder="Enter your phone number"
                placeholderTextColor="#9CA3AF"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Ionicons
                name="location-outline"
                size={16}
                color={GREEN_PRIMARY}
                style={{ marginRight: 4 }}
              />
              <Text style={styles.label}>
                Farm Location{" "}
                <Text style={{ color: TEXT_MUTED, fontWeight: "500" }}>
                  (Optional)
                </Text>
              </Text>
            </View>
            <View style={styles.inputWrap}>
              <TextInput
                style={[styles.input, { paddingLeft: 16 }]}
                placeholder="Enter your village / city"
                placeholderTextColor="#9CA3AF"
                value={location}
                onChangeText={setLocation}
              />
            </View>
            <Text style={styles.helperText}>
              Helps us provide location-based insights
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={[styles.input, { paddingLeft: 16 }]}
                placeholder="Create a strong password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.iconRight}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={TEXT_MUTED}
                />
              </TouchableOpacity>
            </View>
            {/* Password Strength Indicator */}
            {password.length > 0 && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBarRow}>
                  <View
                    style={[
                      styles.strengthBarSegment,
                      { backgroundColor: GREEN_PRIMARY },
                    ]}
                  />
                  <View
                    style={[
                      styles.strengthBarSegment,
                      { backgroundColor: GREEN_PRIMARY },
                    ]}
                  />
                  <View
                    style={[
                      styles.strengthBarSegment,
                      { backgroundColor: BORDER_COLOR },
                    ]}
                  />
                </View>
                <Text style={styles.strengthText}>
                  Password strength:{" "}
                  <Text style={{ color: GREEN_PRIMARY, fontWeight: "700" }}>
                    Strong
                  </Text>
                </Text>
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={[styles.input, { paddingLeft: 16 }]}
                placeholder="Confirm your password"
                placeholderTextColor="#9CA3AF"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.iconRight}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={TEXT_MUTED}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Role Selection ── */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>I am a...</Text>
            <View style={styles.roleRow}>
              <TouchableOpacity
                style={[
                  styles.roleCard,
                  role === "farmer" && styles.roleCardActive,
                ]}
                activeOpacity={0.8}
                onPress={() => setRole("farmer")}
              >
                <Text style={styles.roleEmoji}>👨‍🌾</Text>
                <Text
                  style={[
                    styles.roleText,
                    role === "farmer" && styles.roleTextActive,
                  ]}
                >
                  Farmer
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleCard,
                  role === "researcher" && styles.roleCardActive,
                ]}
                activeOpacity={0.8}
                onPress={() => setRole("researcher")}
              >
                <Text style={styles.roleEmoji}>🔬</Text>
                <Text
                  style={[
                    styles.roleText,
                    role === "researcher" && styles.roleTextActive,
                  ]}
                >
                  Researcher / Advisor
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Terms Checkbox ── */}
          <View style={styles.termsRow}>
            <TouchableOpacity
              style={styles.checkboxWrap}
              activeOpacity={0.8}
              onPress={() => setAgreed(!agreed)}
            >
              <View style={[styles.checkbox, agreed && styles.checkboxActive]}>
                {agreed && <Ionicons name="checkmark" size={14} color="#FFF" />}
              </View>
            </TouchableOpacity>
            <Text style={styles.termsText}>
              I agree to the{" "}
              <Text style={styles.termsLink}>Terms & Conditions</Text> and{" "}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>

          {/* ── Register Button ── */}
          <TouchableOpacity
            style={[
              styles.primaryBtn,
              (!fullName || !agreed || loading) && { opacity: 0.6 },
            ]}
            activeOpacity={0.8}
            onPress={handleRegister}
            disabled={!fullName || !agreed || loading}
          >
            <Text style={styles.primaryBtnText}>
              {loading ? "Registering..." : "Register"}
            </Text>
          </TouchableOpacity>

          {/* ── Footer Link ── */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Login" as any)}
            >
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_COLOR },
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "800", color: TEXT_DARK },

  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 40,
    flexGrow: 1,
  },

  securityBanner: {
    flexDirection: "row",
    backgroundColor: LIGHT_GREEN,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: "center",
  },
  shieldIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  securityTextWrap: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: GREEN_PRIMARY,
    marginBottom: 4,
  },
  securitySubtitle: {
    fontSize: 12,
    color: TEXT_MUTED,
    lineHeight: 18,
  },

  errorBanner: {
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
    textAlign: "center",
  },

  inputGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT_DARK,
    marginBottom: 8,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 12,
    height: 52,
  },
  iconLeft: {
    paddingLeft: 16,
    paddingRight: 12,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    color: TEXT_DARK,
  },
  iconRight: {
    paddingHorizontal: 16,
    height: "100%",
    justifyContent: "center",
  },

  countryCodeWrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 16,
    paddingRight: 12,
    height: "100%",
  },
  countryCodeText: {
    fontSize: 15,
    fontWeight: "500",
    color: TEXT_DARK,
  },
  verticalDivider: {
    width: 1,
    height: 24,
    backgroundColor: BORDER_COLOR,
  },

  helperText: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 6,
  },

  strengthContainer: {
    marginTop: 8,
  },
  strengthBarRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  strengthBarSegment: {
    height: 4,
    flex: 1,
    borderRadius: 2,
    marginHorizontal: 2,
  },
  strengthText: {
    fontSize: 12,
    color: TEXT_MUTED,
  },

  roleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  roleCard: {
    flex: 1,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginHorizontal: 4,
  },
  roleCardActive: {
    backgroundColor: LIGHT_GREEN,
    borderColor: GREEN_PRIMARY,
  },
  roleEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  roleText: {
    fontSize: 13,
    fontWeight: "600",
    color: TEXT_MUTED,
  },
  roleTextActive: {
    color: GREEN_PRIMARY,
  },

  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    marginTop: 8,
  },
  checkboxWrap: {
    paddingRight: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: BORDER_COLOR,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: {
    backgroundColor: GREEN_PRIMARY,
    borderColor: GREEN_PRIMARY,
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    color: TEXT_MUTED,
    lineHeight: 18,
  },
  termsLink: {
    color: GREEN_PRIMARY,
    fontWeight: "600",
  },

  primaryBtn: {
    backgroundColor: GREEN_PRIMARY,
    borderRadius: 12,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  primaryBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },

  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: TEXT_MUTED,
  },
  loginLink: {
    fontSize: 14,
    color: GREEN_PRIMARY,
    fontWeight: "700",
  },
});
