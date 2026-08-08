import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
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
import { UploadImageSheet } from "../components/UploadImageSheet";
import { colors, radii, spacing } from "../constants/theme";
import { db } from "../db";
import { doses as dosesTable, medications } from "../db/schema";

function formatDate(date: Date, monthLabels: string[]) {
  return `${date.getDate()} ${monthLabels[date.getMonth()]} ${date.getFullYear()}`;
}

function formatTime(value: TimeValue) {
  return `${value.hour.toString().padStart(2, "0")}:${value.minute
    .toString()
    .padStart(2, "0")} ${value.meridiem}`;
}

function formatDosage(value: DosageValue, t: (key: string) => string) {
  const unitLabel =
    value.unit === "Drops" ? t("dosagePicker.drops") : t("dosagePicker.pills");
  return `${value.amount} ${unitLabel}`;
}

const FREQUENCY_UNIT_KEYS: Record<FrequencyValue["unit"], string> = {
  Hour: "hour",
  Day: "day",
  Week: "week",
  Month: "month",
};

const FREQUENCY_UNIT_DB_VALUES: Record<
  FrequencyValue["unit"],
  "hour" | "day" | "week" | "month"
> = {
  Hour: "hour",
  Day: "day",
  Week: "week",
  Month: "month",
};

function to24HourTime(value: TimeValue): string {
  let hour24 = value.hour % 12;
  if (value.meridiem === "PM") hour24 += 12;
  return `${hour24.toString().padStart(2, "0")}:${value.minute
    .toString()
    .padStart(2, "0")}`;
}

function formatFrequency(
  value: FrequencyValue,
  t: (key: string, options?: Record<string, unknown>) => string,
) {
  const unitLabel = t(`frequencyPicker.${FREQUENCY_UNIT_KEYS[value.unit]}`, {
    count: value.interval,
  });
  return t("addAlert.everyInterval", {
    interval: value.interval,
    unit: unitLabel,
  });
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

type FormErrors = {
  medicineName?: string;
  startDate?: string;
  frequency?: string;
  doses?: Record<string, { dosage?: string; time?: string }>;
};

export default function AddAlertScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const monthLabels = t("months.short", {
    returnObjects: true,
  }) as string[];
  const [medicineName, setMedicineName] = useState("");
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [isFrequencyPickerVisible, setFrequencyPickerVisible] = useState(false);
  const [frequency, setFrequency] = useState<FrequencyValue | null>(null);
  const [isUploadSheetVisible, setUploadSheetVisible] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const [doses, setDoses] = useState<DoseEntry[]>([createDoseEntry()]);
  const [activeDoseId, setActiveDoseId] = useState<string | null>(null);
  const [isDosagePickerVisible, setDosagePickerVisible] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const activeDose = doses.find((d) => d.id === activeDoseId) ?? null;

  const updateDose = (id: string, patch: Partial<DoseEntry>) => {
    setDoses((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  };

  const addDose = () => setDoses((prev) => [...prev, createDoseEntry()]);

  const removeDose = (id: string) => {
    setDoses((prev) => prev.filter((d) => d.id !== id));
    setErrors((prev) => {
      if (!prev.doses) return prev;
      const { [id]: _removed, ...rest } = prev.doses;
      return { ...prev, doses: rest };
    });
  };

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};

    if (!medicineName.trim()) {
      nextErrors.medicineName = t("addAlert.errors.medicineNameRequired");
    }
    if (!startDate) {
      nextErrors.startDate = t("addAlert.errors.startDateRequired");
    }
    if (!frequency) {
      nextErrors.frequency = t("addAlert.errors.frequencyRequired");
    }

    const doseErrors: Record<string, { dosage?: string; time?: string }> = {};
    for (const dose of doses) {
      const entryErrors: { dosage?: string; time?: string } = {};
      if (!dose.dosage)
        entryErrors.dosage = t("addAlert.errors.doseAmountRequired");
      if (!dose.time) entryErrors.time = t("addAlert.errors.timeRequired");
      if (entryErrors.dosage || entryErrors.time) {
        doseErrors[dose.id] = entryErrors;
      }
    }
    if (Object.keys(doseErrors).length > 0) {
      nextErrors.doses = doseErrors;
    }

    setErrors(nextErrors);
    return (
      !nextErrors.medicineName &&
      !nextErrors.startDate &&
      !nextErrors.frequency &&
      !nextErrors.doses
    );
  };

  const handleCreate = async () => {
    if (!validate()) return;

    if (!db) {
      // No database on web (expo-sqlite has no reliable web backend yet).
      router.back();
      return;
    }

    setSaving(true);
    setSaveError(null);
    try {
      const [medication] = await db
        .insert(medications)
        .values({
          name: medicineName.trim(),
          imageUri: imageUri ?? undefined,
          startDate: startDate as Date,
          frequencyInterval: (frequency as FrequencyValue).interval,
          frequencyUnit:
            FREQUENCY_UNIT_DB_VALUES[(frequency as FrequencyValue).unit],
          createdAt: new Date(),
        })
        .returning();

      await db.insert(dosesTable).values(
        doses.map((dose) => ({
          medicationId: medication.id,
          amount: (dose.dosage as DosageValue).amount,
          unit: (dose.dosage as DosageValue).unit,
          timeOfDay: to24HourTime(dose.time as TimeValue),
          mealTiming: dose.mealTiming,
          createdAt: new Date(),
        })),
      );

      router.back();
    } catch (err) {
      console.error("Failed to save reminder:", err);
      setSaveError(t("addAlert.errors.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>{t("addAlert.title")}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Medicine Info */}
        <Text style={styles.sectionLabel}>{t("addAlert.medicineInfo")}</Text>

        <TextInput
          style={[styles.textInput, errors.medicineName && styles.fieldError]}
          placeholder={t("addAlert.medicineNamePlaceholder")}
          placeholderTextColor={colors.textMuted}
          value={medicineName}
          onChangeText={(text) => {
            setMedicineName(text);
            if (errors.medicineName) {
              setErrors((prev) => ({ ...prev, medicineName: undefined }));
            }
          }}
        />
        {errors.medicineName && (
          <Text style={styles.errorText}>{errors.medicineName}</Text>
        )}

        {imageUri ? (
          <View style={styles.imagePreviewWrap}>
            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
            <Pressable
              style={styles.imageRemoveButton}
              onPress={() => setImageUri(null)}
              hitSlop={8}
            >
              <Ionicons name="close" size={16} color="#ffffff" />
            </Pressable>
          </View>
        ) : (
          <Pressable
            style={styles.uploadBox}
            onPress={() => setUploadSheetVisible(true)}
          >
            <Ionicons name="image-outline" size={28} color={colors.textMuted} />
            <Text style={styles.uploadText}>
              <Text style={styles.uploadTextLink}>
                {t("addAlert.takePhoto")}
              </Text>{" "}
              {t("addAlert.uploadFromDevice")}
            </Text>
            <Text style={styles.uploadHint}>{t("addAlert.imageHint")}</Text>
          </Pressable>
        )}

        {/* Schedule */}
        <Text style={styles.sectionLabel}>{t("addAlert.schedule")}</Text>

        <View style={styles.row}>
          <View style={styles.rowItem}>
            <Pressable
              style={[
                styles.pickerField,
                errors.startDate && styles.fieldError,
              ]}
              onPress={() => setDatePickerVisible(true)}
            >
              <View style={styles.pickerFieldHeader}>
                <Text style={styles.pickerLabel}>
                  {t("addAlert.startDate")}
                </Text>
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
                  {startDate
                    ? formatDate(startDate, monthLabels)
                    : t("addAlert.selectDate")}
                </Text>
              </View>
            </Pressable>
            {errors.startDate && (
              <Text style={styles.errorText}>{errors.startDate}</Text>
            )}
          </View>

          <View style={styles.rowItem}>
            <Pressable
              style={[
                styles.pickerField,
                errors.frequency && styles.fieldError,
              ]}
              onPress={() => setFrequencyPickerVisible(true)}
            >
              <View style={styles.pickerFieldHeader}>
                <Text style={styles.pickerLabel}>
                  {t("addAlert.frequency")}
                </Text>
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
                  {frequency
                    ? formatFrequency(frequency, t)
                    : t("addAlert.selectFrequency")}
                </Text>
              </View>
            </Pressable>
            {errors.frequency && (
              <Text style={styles.errorText}>{errors.frequency}</Text>
            )}
          </View>
        </View>

        {/* Dose */}
        {doses.map((dose, index) => (
          <View key={dose.id}>
            <View style={styles.doseSectionHeader}>
              <Text style={styles.sectionLabel}>
                {t("addAlert.dose", { number: index + 1 })}
              </Text>
              {doses.length > 1 && (
                <Pressable onPress={() => removeDose(dose.id)} hitSlop={8}>
                  <Text style={styles.removeText}>{t("addAlert.remove")}</Text>
                </Pressable>
              )}
            </View>

            <View style={styles.row}>
              <View style={styles.rowItem}>
                <Pressable
                  style={[
                    styles.pickerField,
                    errors.doses?.[dose.id]?.dosage && styles.fieldError,
                  ]}
                  onPress={() => {
                    setActiveDoseId(dose.id);
                    setDosagePickerVisible(true);
                  }}
                >
                  <View style={styles.pickerFieldHeader}>
                    <Text style={styles.pickerLabel}>
                      {t("addAlert.doseAmount")}
                    </Text>
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
                      {dose.dosage
                        ? formatDosage(dose.dosage, t)
                        : t("addAlert.selectDosage")}
                    </Text>
                  </View>
                </Pressable>
                {errors.doses?.[dose.id]?.dosage && (
                  <Text style={styles.errorText}>
                    {errors.doses[dose.id].dosage}
                  </Text>
                )}
              </View>

              <View style={styles.rowItem}>
                <Pressable
                  style={[
                    styles.pickerField,
                    errors.doses?.[dose.id]?.time && styles.fieldError,
                  ]}
                  onPress={() => {
                    setActiveDoseId(dose.id);
                    setTimePickerVisible(true);
                  }}
                >
                  <View style={styles.pickerFieldHeader}>
                    <Text style={styles.pickerLabel}>{t("addAlert.time")}</Text>
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
                        dose.time
                          ? styles.pickerValue
                          : styles.pickerPlaceholder
                      }
                    >
                      {dose.time
                        ? formatTime(dose.time)
                        : t("addAlert.selectTime")}
                    </Text>
                  </View>
                </Pressable>
                {errors.doses?.[dose.id]?.time && (
                  <Text style={styles.errorText}>
                    {errors.doses[dose.id].time}
                  </Text>
                )}
              </View>
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
          <Text style={styles.addDosageText}>
            {t("addAlert.addAnotherDosage")}
          </Text>
        </Pressable>
      </ScrollView>

      {/* CTA */}
      <View style={styles.footer}>
        {saveError && <Text style={styles.saveErrorText}>{saveError}</Text>}
        <Pressable
          style={[styles.cta, isSaving && styles.ctaDisabled]}
          onPress={handleCreate}
          disabled={isSaving}
        >
          <Text style={styles.ctaText}>
            {isSaving ? t("addAlert.creating") : t("addAlert.createReminder")}
          </Text>
        </Pressable>
      </View>

      <DatePickerSheet
        visible={isDatePickerVisible}
        initialDate={startDate ?? undefined}
        onClose={() => setDatePickerVisible(false)}
        onSave={(value) => {
          setStartDate(value);
          setErrors((prev) => ({ ...prev, startDate: undefined }));
        }}
      />

      <TimePickerSheet
        visible={isTimePickerVisible}
        initialValue={activeDose?.time ?? undefined}
        onClose={() => setTimePickerVisible(false)}
        onSave={(value) => {
          if (!activeDoseId) return;
          updateDose(activeDoseId, { time: value });
          setErrors((prev) =>
            prev.doses?.[activeDoseId]
              ? {
                  ...prev,
                  doses: {
                    ...prev.doses,
                    [activeDoseId]: {
                      ...prev.doses[activeDoseId],
                      time: undefined,
                    },
                  },
                }
              : prev,
          );
        }}
      />

      <DosagePickerSheet
        visible={isDosagePickerVisible}
        initialValue={activeDose?.dosage ?? undefined}
        onClose={() => setDosagePickerVisible(false)}
        onSave={(value) => {
          if (!activeDoseId) return;
          updateDose(activeDoseId, { dosage: value });
          setErrors((prev) =>
            prev.doses?.[activeDoseId]
              ? {
                  ...prev,
                  doses: {
                    ...prev.doses,
                    [activeDoseId]: {
                      ...prev.doses[activeDoseId],
                      dosage: undefined,
                    },
                  },
                }
              : prev,
          );
        }}
      />

      <FrequencyPickerSheet
        visible={isFrequencyPickerVisible}
        initialValue={frequency ?? undefined}
        onClose={() => setFrequencyPickerVisible(false)}
        onSave={(value) => {
          setFrequency(value);
          setErrors((prev) => ({ ...prev, frequency: undefined }));
        }}
      />

      <UploadImageSheet
        visible={isUploadSheetVisible}
        onClose={() => setUploadSheetVisible(false)}
        onPicked={setImageUri}
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
    borderWidth: 1.5,
    borderColor: "transparent",
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
  imagePreviewWrap: {
    alignSelf: "flex-start",
  },
  imagePreview: {
    width: 96,
    height: 96,
    borderRadius: radii.md,
    backgroundColor: colors.background,
  },
  imageRemoveButton: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: radii.pill,
    backgroundColor: colors.danger,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.surface,
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
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  fieldError: {
    borderColor: colors.danger,
  },
  errorText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.danger,
    marginTop: spacing.xs,
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
  ctaDisabled: {
    opacity: 0.6,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  saveErrorText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.danger,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
});
