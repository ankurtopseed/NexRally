import { RefreshCw, WifiOff } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/lib/theme";

export function StateMessage({
  title,
  detail,
  onRetry,
  offline = false,
}: {
  title: string;
  detail?: string;
  onRetry?: () => void;
  offline?: boolean;
}) {
  const Icon = offline ? WifiOff : RefreshCw;
  return (
    <View style={styles.container}>
      <View style={styles.icon}><Icon size={20} color={colors.accent} /></View>
      <Text style={styles.title}>{title}</Text>
      {detail ? <Text style={styles.detail}>{detail}</Text> : null}
      {onRetry ? (
        <Pressable onPress={onRetry} accessibilityRole="button" style={styles.retry}>
          <Text style={styles.retryText}>TRY AGAIN</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", paddingVertical: 28, paddingHorizontal: 18 },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#00BFFF18",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 13,
  },
  title: { color: colors.text, fontSize: 15, fontWeight: "700", textAlign: "center" },
  detail: { color: colors.textMuted, fontSize: 13, lineHeight: 19, textAlign: "center", marginTop: 6 },
  retry: { paddingVertical: 12, paddingHorizontal: 16, marginTop: 4 },
  retryText: { color: colors.accent, fontSize: 11, fontWeight: "900", letterSpacing: 1.4 },
});
