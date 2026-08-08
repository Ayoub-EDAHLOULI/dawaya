import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DatePickerSheet } from "../components/DatePickerSheet";
import {
  DosagePickerSheet,
  DosageValue,
} from "../components/DosagePickerSheet";
import {
  FrequencyPickerSheet,
  FrequencyValue,
} from "../components/FrequencyPickerSheet";
import { MealTiming, MealTimingSwitch } from "../components/MealTimingSwitch";
import { TimePickerSheet, TimeValue } from "../components/TimePickerSheet";
import {
  UploadImageOption,
  UploadImageSheet,
} from "../components/UploadImageSheet";
import { colors, radii, spacing } from "../constants/theme";

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatDate(date: Date) {
  return `${date.getDate()} ${MONTH_LABELS[date.getMonth()]} ${date.getFullYear()}`;
}

function formatTime(value: TimeValue) {
  return `${value.hour.toString().padStart(2, "0")}:${value.minute
    .toString()
    .padStart(2, "0")} ${value.meridiem}`;
}

function formatDosage(value: DosageValue) {
  return `${value.amount} ${value.unit}`;
}

function formatFrequency(value: FrequencyValue) {
  const unit = value.interval === 1 ? value.unit : `${value.unit}s`;
  return `Every ${value.interval} ${unit}`;
}

type DoseEntry = {
  id: string;
  dosage: DosageValue | null;
  time: TimeValue | null;
  mealTiming: MealTiming;
};

let nextDoseId = 1;
function createDoseEntry(): DoseEntry {
  return {
    id: `dose-${nextDoseId++}`,
    dosage: null,
    time: null,
    mealTiming: "after",
  };
}

export default function AddAlertScreen() {
  const router = useRouter();
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [isFrequencyPickerVisible, setFrequencyPickerVisible] = useState(false);
  const [frequency, setFrequency] = useState<FrequencyValue | null>(null);
  const [isUploadSheetVisible, setUploadSheetVisible] = useState(false);
  const [imageSource, setImageSource] = useState<UploadImageOption | null>(
    null,
  );

  const [doses, setDoses] = useState<DoseEntry[]>([createDoseEntry()]);
  const [activeDoseId, setActiveDoseId] = useState<string | null>(null);
  const [isDosagePickerVisible, setDosagePickerVisible] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);

  const activeDose = doses.find((d) => d.id === activeDoseId) ?? null;

  const updateDose = (id: string, patch: Partial<DoseEntry>) => {
    setDoses((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  };

  const addDose = () => setDoses((prev) => [...prev, createDoseEntry()]);

  const removeDose = (id: string) =>
    setDoses((prev) => prev.filter((d) => d.id !== id));

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

        <Pressable
          style={styles.uploadBox}
          onPress={() => setUploadSheetVisible(true)}
        >
          <Ionicons
            name={imageSource ? "checkmark-circle" : "image-outline"}
            size={28}
            color={imageSource ? colors.primary : colors.textMuted}
          />
          {imageSource ? (
            <Text style={styles.uploadText}>
              {imageSource === "camera"
                ? "Photo ready to capture"
                : "Image selected from device"}
            </Text>
          ) : (
            <Text style={styles.uploadText}>
              <Text style={styles.uploadTextLink}>Take a photo</Text> or upload
              from device
            </Text>
          )}
          <Text style={styles.uploadHint}>JPG, JPEG, PNG less than 1MB</Text>
        </Pressable>

        {/* Schedule */}
        <Text style={styles.sectionLabel}>Schedule</Text>

        <View style={styles.row}>
          <Pressable
            style={[styles.pickerField, styles.rowItem]}
            onPress={() => setDatePickerVisible(true)}
          >
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
              <Text
                style={
                  startDate ? styles.pickerValue : styles.pickerPlaceholder
                }
              >
                {startDate ? formatDate(startDate) : "Select date"}
              </Text>
            </View>
          </Pressable>

          <Pressable
            style={[styles.pickerField, styles.rowItem]}
            onPress={() => setFrequencyPickerVisible(true)}
          >
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
              <Text
                style={
                  frequency ? styles.pickerValue : styles.pickerPlaceholder
                }
              >
                {frequency ? formatFrequency(frequency) : "Select frequency"}
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Dose */}
        {doses.map((dose, index) => (
          <View key={dose.id}>
            <View style={styles.doseSectionHeader}>
              <Text style={styles.sectionLabel}>Dose {index + 1}</Text>
              {doses.length > 1 && (
                <Pressable onPress={() => removeDose(dose.id)} hitSlop={8}>
                  <Text style={styles.removeText}>Remove</Text>
                </Pressable>
              )}
            </View>

            <View style={styles.row}>
              <Pressable
                style={[styles.pickerField, styles.rowItem]}
                onPress={() => {
                  setActiveDoseId(dose.id);
                  setDosagePickerVisible(true);
                }}
              >
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
                  <Text
                    style={
                      dose.dosage
                        ? styles.pickerValue
                        : styles.pickerPlaceholder
                    }
                  >
                    {dose.dosage ? formatDosage(dose.dosage) : "Select dosage"}
                  </Text>
                </View>
              </Pressable>

              <Pressable
                style={[styles.pickerField, styles.rowItem]}
                onPress={() => {
                  setActiveDoseId(dose.id);
                  setTimePickerVisible(true);
                }}
              >
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
                  <Text
                    style={
                      dose.time ? styles.pickerValue : styles.pickerPlaceholder
                    }
                  >
                    {dose.time ? formatTime(dose.time) : "Select time"}
                  </Text>
                </View>
              </Pressable>
            </View>

            <View style={styles.mealTimingRow}>
              <MealTimingSwitch
                value={dose.mealTiming}
                onChange={(value) => updateDose(dose.id, { mealTiming: value })}
              />
            </View>
          </View>
        ))}

        <Pressable style={styles.addDosageRow} onPress={addDose}>
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

      <DatePickerSheet
        visible={isDatePickerVisible}
        initialDate={startDate ?? undefined}
        onClose={() => setDatePickerVisible(false)}
        onSave={setStartDate}
      />

      <TimePickerSheet
        visible={isTimePickerVisible}
        initialValue={activeDose?.time ?? undefined}
        onClose={() => setTimePickerVisible(false)}
        onSave={(value) => {
          if (activeDoseId) updateDose(activeDoseId, { time: value });
        }}
      />

      <DosagePickerSheet
        visible={isDosagePickerVisible}
        initialValue={activeDose?.dosage ?? undefined}
        onClose={() => setDosagePickerVisible(false)}
        onSave={(value) => {
          if (activeDoseId) updateDose(activeDoseId, { dosage: value });
        }}
      />

      <FrequencyPickerSheet
        visible={isFrequencyPickerVisible}
        initialValue={frequency ?? undefined}
        onClose={() => setFrequencyPickerVisible(false)}
        onSave={setFrequency}
      />

      <UploadImageSheet
        visible={isUploadSheetVisible}
        onClose={() => setUploadSheetVisible(false)}
        onSelect={setImageSource}
      />
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
  doseSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  removeText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.danger,
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
  pickerValue: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  mealTimingRow: {
    marginTop: spacing.md,
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
