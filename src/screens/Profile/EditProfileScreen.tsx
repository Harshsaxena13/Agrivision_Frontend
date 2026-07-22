import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Modal,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import { useAppStore } from "../../store/appStore";
import { useAuthStore } from "../../store/authStore";
import apiClient from "../../lib/apiClient";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "EditProfile">;
};

const GREEN = "#0B7A3E";
const BG = "#FFFFFF";
const TEXT_DARK = "#111827";
const TEXT_MUTED = "#6B7280";
const BORDER = "#E5E7EB";
const INPUT_BG = "#FFFFFF";

const FARMING_EXPERIENCE_OPTIONS = [
  "Less than 1 year",
  "1-3 years",
  "3-5 years",
  "5-10 years",
  "10+ years",
];

const CROP_TYPE_OPTIONS = [
  "Maize",
  "Wheat",
  "Rice",
  "Tomato",
  "Cotton",
  "Sugarcane",
  "Soybean",
  "Potato",
  "Grapes",
  "Other",
];

type SelectFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  options: string[];
  onSelect: (value: string) => void;
};

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  placeholder,
  options,
  onSelect,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.selectWrap}
        activeOpacity={0.8}
        onPress={() => setOpen(true)}
      >
        <Text style={[styles.selectText, !value && styles.placeholderText]}>
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={TEXT_MUTED} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setOpen(false)}>
          <Pressable
            style={styles.modalSheet}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.modalTitle}>{label}</Text>
            <ScrollView style={styles.modalList} bounces={false}>
              {options.map((option) => {
                const selected = option === value;
                return (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.modalOption,
                      selected && styles.modalOptionSelected,
                    ]}
                    onPress={() => {
                      onSelect(option);
                      setOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.modalOptionText,
                        selected && styles.modalOptionTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                    {selected && (
                      <Ionicons name="checkmark" size={18} color={GREEN} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, setUser } = useAppStore();
  const authUser = useAuthStore((state) => state.user);
  const setAuthUser = useAuthStore((state) => state.setUser);

  const [fullName, setFullName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [email, setEmail] = useState(user.email || authUser?.email || "");
  const [location, setLocation] = useState(user.location);
  const [farmingExperience, setFarmingExperience] = useState(
    user.farmingExperience,
  );
  const [cropType, setCropType] = useState(user.cropType);
  const [avatarUri, setAvatarUri] = useState(user.avatarUri);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFullName(user.name);
    setPhone(user.phone);
    setEmail(user.email || authUser?.email || "");
    setLocation(user.location);
    setFarmingExperience(user.farmingExperience);
    setCropType(user.cropType);
    setAvatarUri(user.avatarUri);
  }, [user, authUser?.email]);

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please allow photo library access to update your profile picture.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert("Missing name", "Please enter your full name.");
      return;
    }

    try {
      setSaving(true);

      const profileUpdate = {
        name: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        location: location.trim(),
        farmingExperience,
        cropType,
        avatarUri,
        crops: cropType ? [cropType] : user.crops,
      };

      // Update local Zustand state immediately
      setUser(profileUpdate);

      // Persist to MongoDB via PUT /profile/me
      const { data: updatedUser } = await apiClient.put("/profile/me", {
        fullName: fullName.trim(),
        phone: phone.trim(),
        location: location.trim(),
        farmingExperience,
        cropType,
        avatarUri,
      });

      // Update auth store with fresh data from server
      if (updatedUser && authUser) {
        setAuthUser({ ...authUser, ...updatedUser });
      }

      navigation.goBack();
    } catch (err: any) {
      Alert.alert("Save failed", err?.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={24} color={TEXT_DARK} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Edit Profile</Text>

        <TouchableOpacity
          style={styles.headerBtn}
          onPress={handleSave}
          disabled={saving}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {saving ? (
            <ActivityIndicator size="small" color={GREEN} />
          ) : (
            <Text style={styles.saveText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrap}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarEmoji}>👨‍🌾</Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.cameraBtn}
                onPress={handlePickAvatar}
                activeOpacity={0.85}
              >
                <Ionicons name="camera" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your full name"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="+91 98765 43210"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={false} // Email changes require re-authentication
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Location</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={[styles.input, styles.inputWithIcon]}
                value={location}
                onChangeText={setLocation}
                placeholder="North Field, Punjab, India"
                placeholderTextColor="#9CA3AF"
              />
              <Ionicons
                name="location-outline"
                size={20}
                color={TEXT_MUTED}
                style={styles.locationIcon}
              />
            </View>
          </View>

          <SelectField
            label="Farming Experience"
            value={farmingExperience}
            placeholder="Select experience"
            options={FARMING_EXPERIENCE_OPTIONS}
            onSelect={setFarmingExperience}
          />

          <SelectField
            label="Crop Type"
            value={cropType}
            placeholder="Select crop type"
            options={CROP_TYPE_OPTIONS}
            onSelect={setCropType}
          />

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  flex: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerBtn: {
    minWidth: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_DARK,
  },
  saveText: {
    fontSize: 16,
    fontWeight: "700",
    color: GREEN,
  },

  avatarSection: {
    alignItems: "center",
    paddingVertical: 28,
  },
  avatarWrap: {
    position: "relative",
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F3F4F6",
  },
  avatarFallback: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarEmoji: { fontSize: 56 },
  cameraBtn: {
    position: "absolute",
    right: 4,
    bottom: 4,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFF",
  },

  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT_DARK,
    marginBottom: 10,
  },
  inputWrap: {
    position: "relative",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    backgroundColor: INPUT_BG,
    minHeight: 54,
    justifyContent: "center",
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: TEXT_DARK,
  },
  inputWithIcon: {
    paddingRight: 44,
  },
  locationIcon: {
    position: "absolute",
    right: 16,
  },
  selectWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    backgroundColor: INPUT_BG,
    minHeight: 54,
    paddingHorizontal: 16,
  },
  selectText: {
    fontSize: 16,
    color: TEXT_DARK,
    flex: 1,
  },
  placeholderText: {
    color: "#9CA3AF",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: BG,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "55%",
    paddingTop: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: TEXT_DARK,
    textAlign: "center",
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  modalList: {
    paddingHorizontal: 12,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  modalOptionSelected: {
    backgroundColor: "#ECFDF5",
  },
  modalOptionText: {
    fontSize: 16,
    color: TEXT_DARK,
  },
  modalOptionTextSelected: {
    color: GREEN,
    fontWeight: "600",
  },
});
