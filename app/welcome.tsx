import { router } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, useReducedMotion } from "react-native-reanimated";
import { ArrowDownRight, ArrowRight } from "lucide-react-native";
import { ActionButton } from "@/components/ActionButton";
import { Brand } from "@/components/Brand";
import { Screen } from "@/components/Screen";
import { colors } from "@/lib/theme";

export default function WelcomeScreen() {
  const reducedMotion = useReducedMotion();
  const entering = reducedMotion ? undefined : FadeInDown.duration(550);

  return (
    <Screen contentStyle={styles.content}>
      <Image
        source={require("@/assets/images/welcome-background.png")}
        resizeMode="cover"
        accessible={false}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={["rgba(6,13,23,0.2)", "rgba(6,13,23,0.38)", "#060D17"]}
        locations={[0, 0.48, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.top}>
        <Brand />
        <Text style={styles.topLabel}>SEASON 2026</Text>
      </View>

      <View style={styles.visualSpace} />

      <View style={styles.copy}>
        <Animated.View entering={entering}>
          <Text style={styles.eyebrow}>YOUR NEXT MATCH STARTS HERE</Text>
          <Text style={styles.title}>THE GAME{"\n"}STARTS HERE</Text>
          <Text style={styles.subtitle}>Compete. Connect. Conquer.</Text>
          <Text style={styles.description}>Your table tennis community, all in one place.</Text>
        </Animated.View>
        <Animated.View entering={reducedMotion ? undefined : FadeInDown.delay(180).duration(550)} style={styles.actions}>
          <ActionButton title="GET STARTED" onPress={() => router.push("/sign-up")} />
          <Pressable
            accessibilityRole="button"
            style={styles.signIn}
            onPress={() => router.push("/sign-in")}
          >
            <Text style={styles.signInText}>ALREADY A PLAYER? <Text style={styles.signInAccent}>SIGN IN</Text></Text>
            <ArrowRight size={16} color={colors.accent} />
          </Pressable>
        </Animated.View>
      </View>
      <View style={styles.footer}>
        <ArrowDownRight size={14} color={colors.accent} />
        <Text style={styles.footerText}>BUILT FOR PLAYERS. POWERED BY PASSION.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 },
  top: { zIndex: 2, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  topLabel: { color: colors.textMuted, fontSize: 9, letterSpacing: 1.6, fontWeight: "700" },
  visualSpace: { flex: 1, minHeight: 280, maxHeight: 370 },
  copy: { gap: 26 },
  eyebrow: { color: colors.accent, fontSize: 10, fontWeight: "800", letterSpacing: 2 },
  title: { color: colors.text, fontSize: 40, fontWeight: "900", lineHeight: 45, letterSpacing: -1, marginTop: 10 },
  subtitle: { color: colors.text, fontSize: 17, fontWeight: "600", marginTop: 13 },
  description: { color: colors.textMuted, fontSize: 14, marginTop: 7 },
  actions: { gap: 10 },
  signIn: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  signInText: { color: colors.textMuted, fontSize: 10, letterSpacing: 1, fontWeight: "700" },
  signInAccent: { color: colors.accent },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, marginTop: 8 },
  footerText: { color: "#75899D", fontSize: 8, letterSpacing: 1.4 },
});
