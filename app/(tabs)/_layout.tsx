import { Tabs } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/lib/theme";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={({ state, descriptors, emitter, navigateToTab }) => (
        <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.items}>
            {state.routes.map((route, index) => {
              const selected = state.index === index;
              const label = descriptors[route.key].options.title ?? route.name;
              return (
                <Pressable key={route.key} accessibilityRole="tab" accessibilityState={{ selected }}
                  onPress={() => {
                    const event = emitter.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
                    if (!selected && !event.defaultPrevented) navigateToTab(route.key);
                  }}
                  style={[styles.item, selected && styles.selected]}>
                  <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}
    >
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="about" options={{ title: "About" }} />
      <Tabs.Screen name="tournaments" options={{ title: "Events" }} />
      <Tabs.Screen name="rankings" options={{ title: "Rankings" }} />
      <Tabs.Screen name="gallery" options={{ title: "Gallery" }} />
      <Tabs.Screen name="sponsors" options={{ title: "Sponsors" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: { backgroundColor: colors.backgroundAlt, borderTopColor: colors.border, borderTopWidth: 1, paddingTop: 8 },
  items: { paddingHorizontal: 10, gap: 5, alignItems: "center" },
  item: { paddingHorizontal: 14, paddingVertical: 11, borderRadius: 10 },
  selected: { backgroundColor: colors.surfaceRaised },
  label: { color: colors.textMuted, fontSize: 11, fontWeight: "700" },
  selectedLabel: { color: colors.accent },
});
