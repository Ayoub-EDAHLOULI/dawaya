import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import { TabBar } from "../../components/TabBar";

export default function TabsLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <Tabs.Screen name="home" options={{ title: t("nav.home") }} />
      <Tabs.Screen name="my-meds" options={{ title: t("nav.myMeds") }} />
      <Tabs.Screen name="reports" options={{ title: t("nav.reports") }} />
      <Tabs.Screen name="profile" options={{ title: t("nav.profile") }} />
    </Tabs>
  );
}
