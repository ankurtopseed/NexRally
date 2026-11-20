import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn, useReducedMotion } from "react-native-reanimated";
import { Brand } from "@/components/Brand";
import { useAuth } from "@/lib/auth";
import { colors } from "@/lib/theme";

export default function Index() {
  const { status } = useAuth();
  const [minimumSplashComplete, setMinimumSplashComplete] = useState(false);
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    if (status === "loading") return;
    const timer = setTimeout(() => setMinimumSplashComplete(true), reducedMotion ? 0 : 650);
    return () => clearTimeout(timer);
  }, [status, reducedMotion]);
  if (status === "loading" || !minimumSplashComplete) {
    return (
      <View style={styles.loading}>
        <LinearGradient colors={["#0B2639", "#060D17"]} style={StyleSheet.absoluteFill} />
        <Animated.View entering={reducedMotion ? undefined : FadeIn.duration(450)} style={styles.brand}>
          <Brand />
          <View style={styles.ball} />
          <Text style={styles.caption}>THE GAME STARTS HERE</Text>
        </Animated.View>
      </View>
    );
  }
  return <Redirect href={status === "signedIn" ? "/(tabs)/home" : "/welcome"} />;
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" },
  brand: { alignItems: "center", gap: 25 },
  ball: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent, shadowColor: colors.accent, shadowOpacity: 0.9, shadowRadius: 14 },
  caption: { color: colors.textMuted, fontSize: 9, letterSpacing: 2, fontWeight: "700" },
});
