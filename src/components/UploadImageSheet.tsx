import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Alert, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radii, spacing } from "../constants/theme";

type UploadImageSheetProps = {
  visible: boolean;
  onClose: () => void;
  onPicked: (uri: string) => void;
};

const IMAGE_PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ["images"],
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.7,
};

async function pickFromCamera(): Promise<string | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    Alert.alert(
      "Camera access needed",
      "Enable camera access in your device settings to take a photo of the medication.",
    );
    return null;
  }

  const result = await ImagePicker.launchCameraAsync(IMAGE_PICKER_OPTIONS);
  if (result.canceled || !result.assets?.[0]) return null;
  return result.assets[0].uri;
}

async function pickFromLibrary(): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    Alert.alert(
      "Photo access needed",
      "Enable photo library access in your device settings to attach a picture of the medication.",
    );
    return null;
  }

  const result =
    await ImagePicker.launchImageLibraryAsync(IMAGE_PICKER_OPTIONS);
  if (result.canceled || !result.assets?.[0]) return null;
  return result.assets[0].uri;
}

const OPTIONS: {
  key: "camera" | "device";
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  pick: () => Promise<string | null>;
}[] = [
  {
    key: "camera",
    label: "Take a photo",
    icon: "camera-outline",
    pick: pickFromCamera,
  },
  {
    key: "device",
    label: "Upload from device",
    icon: "cloud-upload-outline",
    pick: pickFromLibrary,
  },
];

export function UploadImageSheet({
  visible,
  onClose,
  onPicked,
}: UploadImageSheetProps) {
  const insets = useSafeAreaInsets();

  const handleSelect = async (option: (typeof OPTIONS)[number]) => {
    onClose();
    const uri = await option.pick();
    if (uri) onPicked(uri);
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
          style={[
            styles.sheet,
            { paddingBottom: spacing.xl + insets.bottom },
          ]}
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
                onPress={() => handleSelect(option)}
              >
                <Ionicons name={option.icon} size={22} color={colors.primary} />
                <Text style={styles.optionLabel}>{option.label}</Text>
              </Pressable>
            ))}
          </View>
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
