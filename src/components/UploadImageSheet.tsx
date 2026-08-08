import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radii, spacing } from "../constants/theme";

export type UploadImageOption = "camera" | "device";

type UploadImageSheetProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (option: UploadImageOption) => void;
};

const OPTIONS: {
  key: UploadImageOption;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: "camera", label: "Take a photo", icon: "camera-outline" },
  { key: "device", label: "Upload from device", icon: "cloud-upload-outline" },
];

export function UploadImageSheet({
  visible,
  onClose,
  onSelect,
}: UploadImageSheetProps) {
  const insets = useSafeAreaInsets();
  const handleSelect = (option: UploadImageOption) => {
    onSelect(option);
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
          style={[styles.sheet, { paddingBottom: spacing.xl + insets.bottom }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.grabHandle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Upload image</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Options */}
          <View style={styles.optionList}>
            {OPTIONS.map((option, i) => (
              <Pressable
                key={option.key}
                style={[
                  styles.optionRow,
                  i < OPTIONS.length - 1 && styles.optionRowDivider,
                ]}
                onPress={() => handleSelect(option.key)}
              >
                <Ionicons name={option.icon} size={22} color={colors.primary} />
                <Text style={styles.optionLabel}>{option.label}</Text>
              </Pressable>
            ))}
          </View>
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
    backgroundColor: colors.surface,
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
    marginBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  optionList: {
    marginTop: spacing.xs,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm + 4,
    paddingVertical: spacing.md,
  },
  optionRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
});
