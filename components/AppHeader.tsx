import { Bell } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Brand } from "@/components/Brand";
import { colors } from "@/lib/theme";

export function AppHeader({ name }: { name?: string }) {
  const initial = name?.trim().charAt(0).toUpperCase() || "P";
  return (
    <View style={styles.row}>
      <Brand compact />
      <View style={styles.actions}>
        <Pressable accessibilityRole="button" accessibilityLabel="Notifications" style={styles.bell}>
          <Bell size={18} color={colors.textMuted} />
          <View style={styles.dot} />
        </Pressable>
        <View style={styles.avatar}><Text style={styles.initial}>{initial}</Text></View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 22 },
  actions: { flexDirection: "row", alignItems: "center", gap: 14 },
  bell: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  dot: { position: "absolute", right: 7, top: 7, width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent },
  avatar: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: colors.accent, backgroundColor: colors.surfaceRaised, alignItems: "center", justifyContent: "center" },
  initial: { color: colors.accentBright, fontSize: 14, fontWeight: "800" },
});
