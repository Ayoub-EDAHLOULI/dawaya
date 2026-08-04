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

export default function TodayTimelineScreen() {
  const { t, i18n } = useTranslation();

  // Temporary mock data to test our layout before wiring up the Drizzle database
  const mockDoses = [
    {
      id: 1,
      timeOfDay: "08:00",
      period: "morning", // Used for color coding
      name: "Tension",
      dosage: "1 pill",
      // We will use local URIs later, testing with a static placeholder color for now
      backgroundColor: "#FEF3C7", // Light yellow for morning
      icon: "sunny",
      iconColor: "#D97706",
    },
    {
      id: 2,
      timeOfDay: "20:00",
      period: "night",
      name: "Sukar",
      dosage: "2 pills",
      backgroundColor: "#DBEAFE", // Light blue for night
      icon: "moon",
      iconColor: "#1D4ED8",
    },
  ];

  // A quick way for you to test the translations in the emulator
  const toggleLanguage = () => {
    const nextLang =
      i18n.language === "darija"
        ? "fr"
        : i18n.language === "fr"
          ? "en"
          : "darija";
    i18n.changeLanguage(nextLang);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t("home.title")}</Text>
        <TouchableOpacity onPress={toggleLanguage} style={styles.langButton}>
          <Text style={styles.langText}>{i18n.language.toUpperCase()}</Text>
        </TouchableOpacity>
      </View>

      {/* Timeline Scroll */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {mockDoses.map((dose) => (
          <View key={dose.id} style={styles.cardContainer}>
            {/* Left Timeline Indicator */}
            <View style={styles.timelineIndicator}>
              <Text style={styles.timeText}>{dose.timeOfDay}</Text>
              <Ionicons
                name={dose.icon as any}
                size={28}
                color={dose.iconColor}
              />
            </View>

            {/* Main Medication Card */}
            <View
              style={[styles.card, { backgroundColor: dose.backgroundColor }]}
            >
              <View style={styles.cardHeader}>
                {/* 
                  Massive image placeholder. 
                  In production, this will be the photo taken by the caregiver. 
                */}
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="camera-outline" size={40} color="#9CA3AF" />
                </View>

                {/* Audio Assistance Button */}
                <TouchableOpacity style={styles.audioButton}>
                  <Ionicons name="volume-high" size={32} color="#ffffff" />
                </TouchableOpacity>
              </View>

              {/* Action Buttons (Massive Tap Targets) */}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.skipButton]}
                >
                  <Ionicons name="close-outline" size={48} color="#EF4444" />
                  {/* Text is secondary, icon is primary */}
                  <Text style={styles.skipText}>{t("actions.skipped")}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.takeButton]}
                >
                  <Ionicons
                    name="checkmark-outline"
                    size={48}
                    color="#10B981"
                  />
                  <Text style={styles.takeText}>{t("actions.taken")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  langButton: {
    padding: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
  },
  langText: {
    fontWeight: "bold",
    color: "#374151",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  cardContainer: {
    flexDirection: "row",
    marginBottom: 24,
  },
  timelineIndicator: {
    width: 60,
    alignItems: "center",
    paddingTop: 10,
  },
  timeText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4B5563",
    marginBottom: 8,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
  },
  audioButton: {
    backgroundColor: "#3B82F6",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "column",
    backgroundColor: "#ffffff",
    borderWidth: 2,
  },
  skipButton: {
    borderColor: "#FCA5A5",
  },
  takeButton: {
    borderColor: "#6EE7B7",
  },
  skipText: {
    color: "#EF4444",
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 4,
  },
  takeText: {
    color: "#10B981",
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 4,
  },
});
