import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radii, spacing } from "../../constants/theme";

const LANGUAGES = [
  { code: "darija", label: "الدارجة", subLabel: "Darija", badge: "د" },
  { code: "fr", label: "Français", subLabel: "French", badge: "FR" },
  { code: "en", label: "English", subLabel: "English", badge: "EN" },
];

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIconBadge}>
            <Ionicons name="settings" size={28} color="#ffffff" />
          </View>
          <Text style={styles.headerTitle}>
            {t("settings.title", "Settings")}
          </Text>
          <Text style={styles.headerSubtitle}>
            Manage how the app looks and speaks to you
          </Text>
        </View>

        {/* Language Selection Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconWrap}>
              <Ionicons
                name="language-outline"
                size={18}
                color={colors.primary}
              />
            </View>
            <Text style={styles.sectionTitle}>
              {t("settings.language", "Language")}
            </Text>
          </View>

          {LANGUAGES.map((lang) => {
            const isSelected = i18n.language === lang.code;
            return (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageOption,
                  isSelected && styles.selectedOption,
                ]}
                onPress={() => changeLanguage(lang.code)}
                activeOpacity={0.7}
              >
                <View style={styles.optionLeft}>
                  <View
                    style={[
                      styles.langBadge,
                      isSelected && styles.langBadgeSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.langBadgeText,
                        isSelected && styles.langBadgeTextSelected,
                      ]}
                    >
                      {lang.badge}
                    </Text>
                  </View>
                  <View>
                    <Text
                      style={[
                        styles.languageLabel,
                        isSelected && styles.selectedLabelText,
                      ]}
                    >
                      {lang.label}
                    </Text>
                    <Text style={styles.languageSubLabel}>{lang.subLabel}</Text>
                  </View>
                </View>

                {isSelected ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={26}
                    color={colors.primary}
                  />
                ) : (
                  <View style={styles.unselectedCircle} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    alignItems: "center",
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  headerIconBadge: {
    width: 64,
    height: 64,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionIconWrap: {
    width: 28,
    height: 28,
    borderRadius: radii.sm,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  languageOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.md,
    marginBottom: spacing.sm,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  selectedOption: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm + 4,
  },
  langBadge: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  langBadgeSelected: {
    backgroundColor: colors.primary,
  },
  langBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textMuted,
  },
  langBadgeTextSelected: {
    color: "#ffffff",
  },
  languageLabel: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  languageSubLabel: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 1,
  },
  selectedLabelText: {
    color: colors.primaryDark,
  },
  unselectedCircle: {
    width: 22,
    height: 22,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
});
