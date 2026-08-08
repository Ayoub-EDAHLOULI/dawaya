import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radii, spacing } from "../constants/theme";

export type DosageValue = {
  amount: number; // 1-99
  unit: "Drops" | "Pills";
};

type DosagePickerSheetProps = {
  visible: boolean;
  initialValue?: DosageValue;
  onClose: () => void;
  onSave: (value: DosageValue) => void;
};

const AMOUNTS = Array.from({ length: 99 }, (_, i) => i + 1);
const UNITS: DosageValue["unit"][] = ["Drops", "Pills"];

const ROW_HEIGHT = 40;
const VISIBLE_ROWS = 5;
const WHEEL_HEIGHT = ROW_HEIGHT * VISIBLE_ROWS;
const SPACER_HEIGHT = ROW_HEIGHT * Math.floor(VISIBLE_ROWS / 2);

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

type WheelHandle = {
  scrollToIndex: (index: number) => void;
};

function Wheel<T>({
  data,
  initialIndex,
  onSettle,
  renderLabel,
  align = "center",
  wheelRef,
}: {
  data: T[];
  initialIndex: number;
  onSettle: (index: number) => void;
  renderLabel: (item: T) => string;
  align?: "center" | "flex-start";
  wheelRef: React.RefObject<WheelHandle | null>;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const [centeredIndex, setCenteredIndex] = useState(initialIndex);

  wheelRef.current = {
    scrollToIndex: (index: number) => {
      scrollRef.current?.scrollTo({ y: index * ROW_HEIGHT, animated: false });
      setCenteredIndex(index);
      onSettle(index);
    },
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.y / ROW_HEIGHT);
    const clamped = Math.max(0, Math.min(data.length - 1, index));

    setCenteredIndex(clamped);
    onSettle(clamped);
  };

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.wheel}
      showsVerticalScrollIndicator={false}
      snapToInterval={ROW_HEIGHT}
      decelerationRate="fast"
      scrollEventThrottle={16}
      contentContainerStyle={{
        paddingVertical: SPACER_HEIGHT,
      }}
      contentOffset={{ x: 0, y: initialIndex * ROW_HEIGHT }}
      onScroll={handleScroll}
    >
      {data.map((item, i) => {
        const distance = Math.abs(i - centeredIndex);
        return (
          <View
            key={i}
            style={[
              styles.wheelRow,
              { justifyContent: align === "center" ? "center" : "flex-start" },
            ]}
          >
            <Text
              style={[
                styles.wheelText,
                distance === 0 && styles.wheelTextSelected,
                distance === 1 && styles.wheelTextNear,
                distance >= 2 && styles.wheelTextFar,
              ]}
            >
              {renderLabel(item)}
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

export function DosagePickerSheet({
  visible,
  initialValue,
  onClose,
  onSave,
}: DosagePickerSheetProps) {
  const insets = useSafeAreaInsets();
  const toIndices = (value: DosageValue) => ({
    amount:
      AMOUNTS.indexOf(value.amount) === -1 ? 0 : AMOUNTS.indexOf(value.amount),
    unit: UNITS.indexOf(value.unit),
  });

  const initial = toIndices(initialValue ?? { amount: 1, unit: "Drops" });

  const amountIndexRef = useRef(initial.amount);
  const unitIndexRef = useRef(initial.unit);

  const [wheelKey, setWheelKey] = useState(0);

  const amountWheelRef = useRef<WheelHandle | null>(null);
  const unitWheelRef = useRef<WheelHandle | null>(null);

  useEffect(() => {
    if (!visible) return;
    const next = toIndices(initialValue ?? { amount: 1, unit: "Drops" });
    amountIndexRef.current = next.amount;
    unitIndexRef.current = next.unit;
    setWheelKey((k) => k + 1);
  }, [visible, initialValue]);

  const handleSave = () => {
    onSave({
      amount: AMOUNTS[amountIndexRef.current],
      unit: UNITS[unitIndexRef.current],
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { paddingBottom: spacing.lg + insets.bottom }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.grabHandle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Select dosage</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Wheels */}
          <View style={styles.wheelArea}>
            <View style={styles.selectionHighlight} pointerEvents="none" />

            <Wheel
              key={`amount-${wheelKey}`}
              wheelRef={amountWheelRef}
              data={AMOUNTS}
              initialIndex={amountIndexRef.current}
              onSettle={(i) => (amountIndexRef.current = i)}
              renderLabel={(n) => pad(n)}
            />
            <Wheel
              key={`unit-${wheelKey}`}
              wheelRef={unitWheelRef}
              data={UNITS}
              initialIndex={unitIndexRef.current}
              onSettle={(i) => (unitIndexRef.current = i)}
              renderLabel={(u) => u}
              align="flex-start"
            />
          </View>

          <Pressable style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Dosage</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(17, 24, 39, 0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radii.lg + 4,
    borderTopRightRadius: radii.lg + 4,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  grabHandle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  wheelArea: {
    flexDirection: "row",
    height: WHEEL_HEIGHT,
    paddingHorizontal: spacing.lg,
  },
  selectionHighlight: {
    position: "absolute",
    top: SPACER_HEIGHT,
    left: 0,
    right: 0,
    height: ROW_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  wheel: {
    width: 90,
  },
  wheelRow: {
    height: ROW_HEIGHT,
    alignItems: "center",
  },
  wheelText: {
    fontSize: 17,
    color: colors.textMuted,
  },
  wheelTextSelected: {
    fontSize: 19,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  wheelTextNear: {
    color: colors.textMuted,
    opacity: 0.7,
  },
  wheelTextFar: {
    color: colors.textMuted,
    opacity: 0.35,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
});
