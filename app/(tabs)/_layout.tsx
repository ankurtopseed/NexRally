import { Redirect, Tabs } from "expo-router";
import { ChartNoAxesCombined, House, Images, Trophy, UserRound } from "lucide-react-native";
import { colors } from "@/lib/theme";
import { useAuth } from "@/lib/auth";

const icons = {
  home: House,
  tournaments: Trophy,
  rankings: ChartNoAxesCombined,
  gallery: Images,
  profile: UserRound,
} as const;

export default function TabLayout() {
  const { status } = useAuth();
  if (status === "signedOut") return <Redirect href="/welcome" />;
  return (
    <Tabs
      screenOptions={({ route }) => {
        const Icon = icons[route.name as keyof typeof icons] ?? House;
        return {
          headerShown: false,
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: "#73879B",
          tabBarStyle: {
            backgroundColor: colors.backgroundAlt,
            borderTopColor: colors.border,
            height: 66,
            paddingTop: 8,
            paddingBottom: 8,
          },
          tabBarLabelStyle: { fontSize: 9, fontWeight: "700", letterSpacing: 0.4 },
          tabBarIcon: ({ color, size }) => <Icon color={color} size={size} strokeWidth={2} />,
        };
      }}
    >
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="tournaments" options={{ title: "Tournaments" }} />
      <Tabs.Screen name="rankings" options={{ title: "Rankings" }} />
      <Tabs.Screen name="gallery" options={{ title: "Gallery" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
