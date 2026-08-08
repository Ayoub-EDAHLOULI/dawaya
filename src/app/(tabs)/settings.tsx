import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../constants/theme";

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();

  const languages = [
    {
      code: "darija",
      label: "الدارجة (Darija)",
      icon: "volume-medium-outline",
    },
    { code: "fr", label: "Français", icon: "language-outline" },
    { code: "en", label: "English", icon: "language-outline" },
  ];

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>{t("settings.title", "Settings")}</Text>

      {/* Language Selection Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t("settings.language", "Language / اللغة")}
        </Text>

        {languages.map((lang) => {
          const isSelected = i18n.language === lang.code;
          return (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.languageOption,
                isSelected && styles.selectedOption,
              ]}
              onPress={() => changeLanguage(lang.code)}
            >
              <View style={styles.optionLeft}>
                <Ionicons
                  name={lang.icon as any}
                  size={24}
                  color={isSelected ? colors.primary : colors.textMuted}
                />
                <Text
                  style={[
                    styles.languageLabel,
                    isSelected && styles.selectedLabelText,
                  ]}
                >
                  {lang.label}
                </Text>
              </View>

              {isSelected && (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={colors.primary}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginVertical: 20,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textMuted,
    marginBottom: 12,
  },
  languageOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  selectedOption: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  languageLabel: {
    fontSize: 18,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  selectedLabelText: {
    fontWeight: "bold",
    color: colors.primary,
  },
});
