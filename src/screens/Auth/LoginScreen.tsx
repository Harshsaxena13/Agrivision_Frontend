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
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import { useAppStore } from "../../store/appStore";
import { useAuthStore } from "../../store/authStore";
import { login, forgotPassword } from "../../lib/auth";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Login">;
};

const GREEN_PRIMARY = "#00965E";
const TEXT_DARK = "#111827";
const TEXT_MUTED = "#6B7280";
const BG_COLOR = "#FFFFFF";
const BORDER_COLOR = "#E5E7EB";

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { setHasSeenOnboarding } = useAppStore();
  const setUser = useAuthStore((state) => state.setUser);

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      setErrorMsg("Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");

      const { user } = await login({
        email: identifier.trim(),
        password,
      });

      setUser(user);
      setHasSeenOnboarding(true);
    } catch (err: any) {
      setErrorMsg(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const email = identifier.trim();

    if (!email) {
      setErrorMsg("Enter your email address above to reset your password");
      return;
    }

    try {
      setResettingPassword(true);
      setErrorMsg("");

      await forgotPassword(email);

      Alert.alert("Password reset", "Password reset is not available yet.");
    } catch (err: any) {
      setErrorMsg(err?.message || "Unable to send reset email");
    } finally {
      setResettingPassword(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerArea}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>
              Enter your details to access your dashboard.
            </Text>
          </View>

          {errorMsg ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* Email */}
          <View style={styles.inputGroup}>
            <View style={styles.inputWrap}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={TEXT_MUTED}
                style={styles.iconLeft}
              />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor="#9CA3AF"
                value={identifier}
                onChangeText={setIdentifier}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <View style={styles.inputWrap}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={TEXT_MUTED}
                style={styles.iconLeft}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
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
          </View>

          {/* Remember Me */}
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={styles.checkboxWrap}
              activeOpacity={0.8}
              onPress={() => setRememberMe(!rememberMe)}
            >
              <View
                style={[styles.checkbox, rememberMe && styles.checkboxActive]}
              >
                {rememberMe && (
                  <Ionicons name="checkmark" size={14} color="#FFF" />
                )}
              </View>

              <Text style={styles.rememberText}>Remember me</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleForgotPassword}
              disabled={resettingPassword}
            >
              <Text style={styles.forgotText}>
                {resettingPassword ? "Sending..." : "Forgot Password?"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Sign In */}
          <TouchableOpacity
            style={[
              styles.primaryBtn,
              (!identifier || !password || loading) && {
                opacity: 0.7,
              },
            ]}
            activeOpacity={0.8}
            onPress={handleLogin}
            disabled={!identifier || !password || loading}
          >
            <View style={styles.btnContent}>
              <Text style={styles.primaryBtnText}>
                {loading ? "Signing in..." : "Sign In"}
              </Text>

              {!loading && (
                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color="#FFF"
                  style={styles.btnIcon}
                />
              )}
            </View>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Buttons */}
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn} activeOpacity={0.7}>
              <Ionicons
                name="logo-google"
                size={20}
                color="#EA4335"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.socialBtnText}>Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialBtn} activeOpacity={0.7}>
              <Ionicons
                name="logo-facebook"
                size={20}
                color="#1877F2"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.socialBtnText}>Facebook</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>New to AgriVision AI?</Text>

            <TouchableOpacity
              onPress={() => navigation.navigate("Signup" as never)}
            >
              <Text style={styles.signupLink}>Create an account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
    flexGrow: 1,
  },
  headerArea: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: TEXT_DARK,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: TEXT_MUTED,
    lineHeight: 24,
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
    marginBottom: 16,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 12,
    height: 56,
  },
  iconLeft: {
    paddingLeft: 16,
    paddingRight: 12,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: TEXT_DARK,
  },
  iconRight: {
    paddingHorizontal: 16,
    justifyContent: "center",
    height: "100%",
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 32,
  },
  checkboxWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: BORDER_COLOR,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxActive: {
    backgroundColor: GREEN_PRIMARY,
    borderColor: GREEN_PRIMARY,
  },
  rememberText: {
    fontSize: 14,
    color: TEXT_DARK,
    fontWeight: "500",
  },
  forgotText: {
    fontSize: 14,
    color: GREEN_PRIMARY,
    fontWeight: "600",
  },
  primaryBtn: {
    backgroundColor: GREEN_PRIMARY,
    borderRadius: 12,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  btnContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  primaryBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  btnIcon: {
    marginLeft: 8,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: BORDER_COLOR,
  },
  dividerText: {
    color: TEXT_MUTED,
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 16,
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  socialBtn: {
    flex: 1,
    height: 52,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginHorizontal: 6,
  },
  socialBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: TEXT_DARK,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: "auto",
  },
  footerText: {
    color: TEXT_MUTED,
    fontSize: 14,
  },
  signupLink: {
    color: GREEN_PRIMARY,
    fontWeight: "700",
    fontSize: 14,
  },
});
