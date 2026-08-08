import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
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

export type TimeValue = {
  hour: number; // 1-12
  minute: number; // 0-59
  meridiem: "AM" | "PM";
};

type TimePickerSheetProps = {
  visible: boolean;
  initialValue?: TimeValue;
  onClose: () => void;
  onSave: (value: TimeValue) => void;
};

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const MERIDIEMS: TimeValue["meridiem"][] = ["AM", "PM"];

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
  wheelRef,
}: {
  data: T[];
  initialIndex: number;
  onSettle: (index: number) => void;
  renderLabel: (item: T) => string;
  wheelRef: React.RefObject<WheelHandle | null>;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const [centeredIndex, setCenteredIndex] = useState(initialIndex);

  wheelRef.current = {
    scrollToIndex: (index: number) => {
      scrollRef.current?.scrollTo({ y: index * ROW_HEIGHT, animated: false });
      setCenteredIndex(index);
      onSettle(index); // Ensure imperative scrolls also sync the parent ref
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
          <View key={i} style={styles.wheelRow}>
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
export function TimePickerSheet({
  visible,
  initialValue,
  onClose,
  onSave,
}: TimePickerSheetProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const toIndices = (value: TimeValue) => ({
    hour: HOURS.indexOf(value.hour) === -1 ? 0 : HOURS.indexOf(value.hour),
    minute: value.minute,
    meridiem: MERIDIEMS.indexOf(value.meridiem),
  });

  const initial = toIndices(
    initialValue ?? { hour: 1, minute: 0, meridiem: "AM" },
  );

  // The values that will actually be saved — kept as refs (not state)
  // because they're written from scroll-settle callbacks and only ever
  // read on Save, so they don't need to trigger re-renders themselves.
  const hourIndexRef = useRef(initial.hour);
  const minuteIndexRef = useRef(initial.minute);
  const meridiemIndexRef = useRef(initial.meridiem);

  const [wheelKey, setWheelKey] = useState(0);

  const hourWheelRef = useRef<WheelHandle | null>(null);
  const minuteWheelRef = useRef<WheelHandle | null>(null);
  const meridiemWheelRef = useRef<WheelHandle | null>(null);

  // Re-sync whenever the sheet opens with a (possibly new) starting value.
  // Remounting the wheels via `key` is simpler and more reliable here than
  // imperatively fighting each ScrollView's own scroll/snap state.
  useEffect(() => {
    if (!visible) return;
    const next = toIndices(
      initialValue ?? { hour: 1, minute: 0, meridiem: "AM" },
    );
    hourIndexRef.current = next.hour;
    minuteIndexRef.current = next.minute;
    meridiemIndexRef.current = next.meridiem;
    setWheelKey((k) => k + 1);
  }, [visible, initialValue]);

  const handleSave = () => {
    onSave({
      hour: HOURS[hourIndexRef.current],
      minute: MINUTES[minuteIndexRef.current],
      meridiem: MERIDIEMS[meridiemIndexRef.current],
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
      <View style={styles.backdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />

        <View
          style={[styles.sheet, { paddingBottom: spacing.lg + insets.bottom }]}
        >
          <View style={styles.grabHandle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{t("timePicker.title")}</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Wheels */}
          <View style={styles.wheelArea}>
            <View style={styles.selectionHighlight} pointerEvents="none" />

            <Wheel
              key={`hour-${wheelKey}`}
              wheelRef={hourWheelRef}
              data={HOURS}
              initialIndex={hourIndexRef.current}
              onSettle={(i) => (hourIndexRef.current = i)}
              renderLabel={(h) => pad(h)}
            />
            <Wheel
              key={`minute-${wheelKey}`}
              wheelRef={minuteWheelRef}
              data={MINUTES}
              initialIndex={minuteIndexRef.current}
              onSettle={(i) => (minuteIndexRef.current = i)}
              renderLabel={(m) => pad(m)}
            />
            <Wheel
              key={`meridiem-${wheelKey}`}
              wheelRef={meridiemWheelRef}
              data={MERIDIEMS}
              initialIndex={meridiemIndexRef.current}
              onSettle={(i) => (meridiemIndexRef.current = i)}
              renderLabel={(m) => m}
            />
          </View>

          <Pressable style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>{t("timePicker.save")}</Text>
          </Pressable>
        </View>
      </View>
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
    justifyContent: "center",
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
    justifyContent: "center",
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
