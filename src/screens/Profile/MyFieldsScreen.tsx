import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList, Field } from "../../navigation/types";
import { useAppStore } from "../../store/appStore";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "MyFields">;
};

const GREEN = "#0B7A3E";
const GREEN_LIGHT = "#ECFDF5";
const GREEN_TEXT = "#15803D";
const BG = "#FFFFFF";
const TEXT_DARK = "#111827";
const TEXT_MUTED = "#6B7280";
const BORDER = "#E5E7EB";
const INACTIVE_BG = "#F3F4F6";
const INACTIVE_TEXT = "#6B7280";

const FIELD_IMAGE = require("../../../assets/maize.jpg");

type FieldCardProps = {
  field: Field;
  onMenuPress: (field: Field) => void;
};

const FieldCard: React.FC<FieldCardProps> = ({ field, onMenuPress }) => {
  const isActive = field.status === "Active";

  return (
    <View style={styles.card}>
      <Image source={FIELD_IMAGE} style={styles.thumbnail} resizeMode="cover" />

      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <Text style={styles.fieldName} numberOfLines={1}>
            {field.name}
          </Text>

          <View style={styles.headerActions}>
            <View
              style={[
                styles.statusBadge,
                isActive ? styles.statusActive : styles.statusInactive,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  isActive
                    ? styles.statusTextActive
                    : styles.statusTextInactive,
                ]}
              >
                {field.status}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.menuBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={() => onMenuPress(field)}
            >
              <Ionicons name="ellipsis-vertical" size={18} color={TEXT_MUTED} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Area:</Text>
          <Text style={styles.detailValue}>{field.area}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Crop:</Text>
          <Text style={styles.detailValue}>{field.crop}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Last Scan:</Text>
          <Text style={styles.detailValue}>{field.lastScan}</Text>
        </View>
      </View>
    </View>
  );
};

export const MyFieldsScreen: React.FC<Props> = ({ navigation }) => {
  const fields = useAppStore((s) => s.fields);
  const toggleFieldStatus = useAppStore((s) => s.toggleFieldStatus);
  const removeField = useAppStore((s) => s.removeField);

  const handleFieldMenu = (field: Field) => {
    Alert.alert(field.name, "Choose an action", [
      {
        text: field.status === "Active" ? "Mark Inactive" : "Mark Active",
        onPress: () => toggleFieldStatus(field.id),
      },
      {
        text: "Delete Field",
        style: "destructive",
        onPress: () => {
          Alert.alert(
            "Delete Field",
            `Are you sure you want to delete ${field.name}?`,
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Delete",
                style: "destructive",
                onPress: () => removeField(field.id),
              },
            ],
          );
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
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

        <Text style={styles.headerTitle}>My Fields</Text>

        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() =>
            Alert.alert(
              "Coming Soon",
              "Add field feature is under development.",
            )
          }
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="add" size={28} color={TEXT_DARK} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={fields}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FieldCard field={item} onMenuPress={handleFieldMenu} />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },

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
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_DARK,
  },

  listContent: {
    paddingBottom: 32,
  },
  separator: {
    height: 1,
    backgroundColor: BORDER,
    marginLeft: 16,
  },

  card: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: BG,
  },
  thumbnail: {
    width: 88,
    height: 88,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  cardBody: {
    flex: 1,
    marginLeft: 14,
    justifyContent: "center",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  fieldName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_DARK,
    marginRight: 8,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusActive: {
    backgroundColor: GREEN_LIGHT,
  },
  statusInactive: {
    backgroundColor: INACTIVE_BG,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  statusTextActive: {
    color: GREEN_TEXT,
  },
  statusTextInactive: {
    color: INACTIVE_TEXT,
  },
  menuBtn: {
    padding: 2,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  detailLabel: {
    fontSize: 13,
    color: TEXT_MUTED,
    width: 72,
  },
  detailValue: {
    flex: 1,
    fontSize: 13,
    color: TEXT_DARK,
    fontWeight: "500",
  },
});
