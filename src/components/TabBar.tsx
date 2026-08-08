import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radii } from "../constants/theme";

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  index: "home-outline",
  "my-meds": "medkit-outline",
  reports: "pie-chart-outline",
  settings: "settings-outline",
};

const ACTIVE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  index: "home",
  "my-meds": "medkit",
  reports: "pie-chart",
  settings: "settings",
};

function TabButton({
  routeName,
  label,
  isFocused,
  onPress,
}: {
  routeName: string;
  label: string;
  isFocused: boolean;
  onPress: () => void;
}) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: withSpring(isFocused ? -2 : 0, { damping: 14 }) },
    ],
  }));

  const dotStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isFocused ? 1 : 0, { duration: 150 }),
    transform: [{ scale: withSpring(isFocused ? 1 : 0.3, { damping: 14 }) }],
  }));

  const iconName = isFocused ? ACTIVE_ICONS[routeName] : ICONS[routeName];

  return (
    <Pressable
      onPress={onPress}
      style={styles.tabButton}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
    >
      <Animated.View style={[styles.tabButtonInner, animatedStyle]}>
        <Ionicons
          name={iconName}
          size={24}
          color={isFocused ? colors.primary : colors.textMuted}
        />
        <Text style={[styles.label, isFocused && styles.labelActive]}>
          {label}
        </Text>
        <Animated.View style={[styles.activeDot, dotStyle]} />
      </Animated.View>
    </Pressable>
  );
}

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const leftRoutes = state.routes.slice(0, 2);
  const rightRoutes = state.routes.slice(2);

  const renderTab = (route: (typeof state.routes)[number]) => {
    const index = state.routes.indexOf(route);
    const { options } = descriptors[route.key];
    const label = (options.title ?? route.name) as string;
    const isFocused = state.index === index;

    const onPress = () => {
      const event = navigation.emit({
        type: "tabPress",
        target: route.key,
        canPreventDefault: true,
      });
      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    };

    return (
      <TabButton
        key={route.key}
        routeName={route.name}
        label={label}
        isFocused={isFocused}
        onPress={onPress}
      />
    );
  };

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom }]}>
      <View style={styles.bar}>
        <View style={styles.side}>{leftRoutes.map(renderTab)}</View>

        {/* Spacer under the raised FAB, matches the notch width */}
        <View style={styles.fabSpacer} />

        <View style={styles.side}>{rightRoutes.map(renderTab)}</View>
      </View>

      <Pressable
        onPress={() => router.push("/add-alert")}
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        accessibilityRole="button"
        accessibilityLabel="Add alert"
      >
        <Ionicons name="add" size={30} color="#fff" />
      </Pressable>
    </View>
  );
}

const BAR_HEIGHT = 64;
const FAB_SIZE = 58;

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.surface,
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    height: BAR_HEIGHT,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  side: {
    flex: 1,
    flexDirection: "row",
  },
  fabSpacer: {
    width: FAB_SIZE + 16,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabButtonInner: {
    alignItems: "center",
    gap: 2,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textMuted,
  },
  labelActive: {
    color: colors.primary,
  },
  activeDot: {
    position: "absolute",
    bottom: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  fab: {
    position: "absolute",
    alignSelf: "center",
    top: -FAB_SIZE / 2,
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  fabPressed: {
    transform: [{ scale: 0.94 }],
  },
});
