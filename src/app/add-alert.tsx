import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radii, spacing } from "../constants/theme";

export default function AddAlertScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Create Alert</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Medicine Info */}
        <Text style={styles.sectionLabel}>Medicine Info</Text>

        <TextInput
          style={styles.textInput}
          placeholder="Enter medicine name"
          placeholderTextColor={colors.textMuted}
        />

        <Pressable style={styles.uploadBox}>
          <Ionicons name="image-outline" size={28} color={colors.textMuted} />
          <Text style={styles.uploadText}>
            <Text style={styles.uploadTextLink}>Take a photo</Text> or upload
            from device
          </Text>
          <Text style={styles.uploadHint}>JPG, JPEG, PNG less than 1MB</Text>
        </Pressable>

        {/* Schedule */}
        <Text style={styles.sectionLabel}>Schedule</Text>

        <View style={styles.row}>
          <Pressable style={[styles.pickerField, styles.rowItem]}>
            <View style={styles.pickerFieldHeader}>
              <Text style={styles.pickerLabel}>Start date</Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={colors.textMuted}
              />
            </View>
            <View style={styles.pickerValueRow}>
              <Ionicons
                name="calendar-outline"
                size={16}
                color={colors.textMuted}
              />
              <Text style={styles.pickerPlaceholder}>Select date</Text>
            </View>
          </Pressable>

          <Pressable style={[styles.pickerField, styles.rowItem]}>
            <View style={styles.pickerFieldHeader}>
              <Text style={styles.pickerLabel}>Frequency</Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={colors.textMuted}
              />
            </View>
            <View style={styles.pickerValueRow}>
              <Ionicons
                name="time-outline"
                size={16}
                color={colors.textMuted}
              />
              <Text style={styles.pickerPlaceholder}>Select frequency</Text>
            </View>
          </Pressable>
        </View>

        {/* Dose */}
        <Text style={styles.sectionLabel}>Dose</Text>

        <View style={styles.row}>
          <Pressable style={[styles.pickerField, styles.rowItem]}>
            <View style={styles.pickerFieldHeader}>
              <Text style={styles.pickerLabel}>Dose amount</Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={colors.textMuted}
              />
            </View>
            <View style={styles.pickerValueRow}>
              <Ionicons
                name="medical-outline"
                size={16}
                color={colors.textMuted}
              />
              <Text style={styles.pickerPlaceholder}>Select dosage</Text>
            </View>
          </Pressable>

          <Pressable style={[styles.pickerField, styles.rowItem]}>
            <View style={styles.pickerFieldHeader}>
              <Text style={styles.pickerLabel}>Time</Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={colors.textMuted}
              />
            </View>
            <View style={styles.pickerValueRow}>
              <Ionicons
                name="time-outline"
                size={16}
                color={colors.textMuted}
              />
              <Text style={styles.pickerPlaceholder}>Select time</Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.pillRow}>
          <Pressable style={styles.pill}>
            <Text style={styles.pillText}>Before Meal</Text>
          </Pressable>
          <Pressable style={[styles.pill, styles.pillSelected]}>
            <Text style={styles.pillTextSelected}>After Meal</Text>
          </Pressable>
        </View>

        <Pressable style={styles.addDosageRow}>
          <Ionicons name="add" size={18} color={colors.primary} />
          <Text style={styles.addDosageText}>Add another dosage</Text>
        </Pressable>
      </ScrollView>

      {/* CTA */}
      <View style={styles.footer}>
        <Pressable style={styles.cta}>
          <Text style={styles.ctaText}>Create Reminder</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  headerSpacer: {
    width: 26,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  textInput: {
    backgroundColor: colors.background,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  uploadBox: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: "dashed",
    borderRadius: radii.md,
    paddingVertical: spacing.lg,
    alignItems: "center",
    gap: 6,
  },
  uploadText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  uploadTextLink: {
    color: colors.primary,
    fontWeight: "700",
  },
  uploadHint: {
    fontSize: 12,
    color: colors.textMuted,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  rowItem: {
    flex: 1,
  },
  pickerField: {
    backgroundColor: colors.background,
    borderRadius: radii.md,
    padding: spacing.sm + 4,
    gap: spacing.sm,
  },
  pickerFieldHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pickerLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  pickerValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pickerPlaceholder: {
    fontSize: 13,
    color: colors.textMuted,
  },
  pillRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.background,
  },
  pillSelected: {
    backgroundColor: colors.primary,
  },
  pillText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  pillTextSelected: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
  addDosageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: spacing.lg,
  },
  addDosageText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  cta: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
});
