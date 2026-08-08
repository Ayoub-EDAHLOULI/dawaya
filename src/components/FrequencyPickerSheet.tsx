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
import { colors, radii, spacing } from "../constants/theme";

export type FrequencyUnit = "Hour" | "Day" | "Week" | "Month";

export type FrequencyValue = {
  interval: number; // 1-30
  unit: FrequencyUnit;
};

type FrequencyPickerSheetProps = {
  visible: boolean;
  initialValue?: FrequencyValue;
  onClose: () => void;
  onSave: (value: FrequencyValue) => void;
};

const INTERVALS = Array.from({ length: 30 }, (_, i) => i + 1);
const UNITS: FrequencyUnit[] = ["Hour", "Day", "Week", "Month"];

const ROW_HEIGHT = 40;
const VISIBLE_ROWS = 5;
const WHEEL_HEIGHT = ROW_HEIGHT * VISIBLE_ROWS;
const SPACER_HEIGHT = ROW_HEIGHT * Math.floor(VISIBLE_ROWS / 2);

function pluralize(unit: FrequencyUnit, interval: number) {
  return interval === 1 ? unit : `${unit}s`;
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

export function FrequencyPickerSheet({
  visible,
  initialValue,
  onClose,
  onSave,
}: FrequencyPickerSheetProps) {
  const toIndices = (value: FrequencyValue) => ({
    interval:
      INTERVALS.indexOf(value.interval) === -1
        ? 0
        : INTERVALS.indexOf(value.interval),
    unit: UNITS.indexOf(value.unit),
  });

  const initial = toIndices(initialValue ?? { interval: 1, unit: "Day" });

  const intervalIndexRef = useRef(initial.interval);
  const unitIndexRef = useRef(initial.unit);

  const [wheelKey, setWheelKey] = useState(0);
  // Mirrors intervalIndexRef, but as state, purely so the "Every" label's
  // singular/plural unit text can update live while scrolling.
  const [liveIntervalIndex, setLiveIntervalIndex] = useState(initial.interval);

  const intervalWheelRef = useRef<WheelHandle | null>(null);
  const unitWheelRef = useRef<WheelHandle | null>(null);

  useEffect(() => {
    if (!visible) return;
    const next = toIndices(initialValue ?? { interval: 1, unit: "Day" });
    intervalIndexRef.current = next.interval;
    unitIndexRef.current = next.unit;
    setLiveIntervalIndex(next.interval);
    setWheelKey((k) => k + 1);
  }, [visible, initialValue]);

  const handleSave = () => {
    onSave({
      interval: INTERVALS[intervalIndexRef.current],
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
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.grabHandle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Set frequency</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Wheels */}
          <View style={styles.wheelArea}>
            <View style={styles.selectionHighlight} pointerEvents="none" />

            <View style={styles.everyColumn}>
              <Text style={styles.everyLabel}>Every</Text>
            </View>

            <Wheel
              key={`interval-${wheelKey}`}
              wheelRef={intervalWheelRef}
              data={INTERVALS}
              initialIndex={intervalIndexRef.current}
              onSettle={(i) => {
                intervalIndexRef.current = i;
                setLiveIntervalIndex(i);
              }}
              renderLabel={(n) => n.toString()}
            />
            <Wheel
              key={`unit-${wheelKey}`}
              wheelRef={unitWheelRef}
              data={UNITS}
              initialIndex={unitIndexRef.current}
              onSettle={(i) => (unitIndexRef.current = i)}
              renderLabel={(u) => pluralize(u, INTERVALS[liveIntervalIndex])}
              align="flex-start"
            />
          </View>

          <Pressable style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
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
    paddingBottom: spacing.lg,
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
  everyColumn: {
    width: 70,
    height: ROW_HEIGHT,
    marginTop: SPACER_HEIGHT,
    justifyContent: "center",
  },
  everyLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
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
