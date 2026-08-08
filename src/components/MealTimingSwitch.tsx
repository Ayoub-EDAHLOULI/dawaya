import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "../constants/theme";

export type MealTiming = "before" | "after";

type MealTimingSwitchProps = {
  value: MealTiming;
  onChange: (value: MealTiming) => void;
};

const OPTIONS: { key: MealTiming; label: string }[] = [
  { key: "before", label: "Before Meal" },
  { key: "after", label: "After Meal" },
];

export function MealTimingSwitch({ value, onChange }: MealTimingSwitchProps) {
  return (
    <View style={styles.row}>
      {OPTIONS.map((option) => {
        const isSelected = option.key === value;
        return (
          <Pressable
            key={option.key}
            style={[styles.pill, isSelected && styles.pillSelected]}
            onPress={() => onChange(option.key)}
          >
            <Text
              style={[styles.pillText, isSelected && styles.pillTextSelected]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.sm,
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
    fontWeight: "700",
    color: "#ffffff",
  },
});
