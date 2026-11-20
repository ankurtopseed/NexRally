import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/lib/theme";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <View style={styles.row}>
      <View style={styles.mark}>
        <View style={styles.ball} />
      </View>
      <View>
        <Text style={[styles.name, compact && styles.compact]}>TTCL</Text>
        {!compact && <Text style={styles.caption}>TABLE TENNIS CORPORATE LEAGUE</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  mark: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0B2437",
  },
  ball: {
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: colors.accentBright,
    shadowColor: colors.accent,
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  name: { color: colors.text, fontSize: 21, fontWeight: "900", letterSpacing: 2 },
  compact: { fontSize: 18 },
  caption: { color: colors.textMuted, fontSize: 7, letterSpacing: 1.15, marginTop: 1 },
});
