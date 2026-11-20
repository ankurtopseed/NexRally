import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { z } from "zod";
import { ActionButton } from "@/components/ActionButton";
import { Brand } from "@/components/Brand";
import { FormField } from "@/components/FormField";
import { Panel } from "@/components/Panel";
import { Screen } from "@/components/Screen";
import { colors } from "@/lib/theme";
import { useAuth } from "@/lib/auth";

const schema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});
type FormData = z.infer<typeof schema>;

export default function SignInScreen() {
  const { signIn } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const { control, handleSubmit, formState: { isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const submit = handleSubmit(async ({ email, password }) => {
    setServerError(null);
    try {
      await signIn(email.trim(), password);
      router.replace("/(tabs)/home");
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Unable to sign in.");
    }
  });

  return (
    <Screen scroll contentStyle={styles.content}>
      <Pressable style={styles.back} onPress={() => router.back()} accessibilityRole="button">
        <ArrowLeft size={18} color={colors.textMuted} />
        <Text style={styles.backText}>BACK</Text>
      </Pressable>
      <Brand />
      <View style={styles.intro}>
        <Text style={styles.eyebrow}>PLAYER ACCESS</Text>
        <Text style={styles.title}>WELCOME{"\n"}BACK.</Text>
        <Text style={styles.subtitle}>Sign in to continue your journey.</Text>
      </View>
      <Panel style={styles.form}>
        <FormField control={control} name="email" label="EMAIL ADDRESS" placeholder="you@company.com" keyboardType="email-address" autoComplete="email" />
        <FormField control={control} name="password" label="PASSWORD" placeholder="Enter your password" secure autoComplete="current-password" />
        <Pressable style={styles.forgot} onPress={() => router.push("/forgot-password")} accessibilityRole="button">
          <Text style={styles.forgotText}>Forgot password?</Text>
        </Pressable>
        {serverError ? <Text accessibilityRole="alert" style={styles.error}>{serverError}</Text> : null}
        <ActionButton title="SIGN IN" onPress={() => void submit()} loading={isSubmitting} style={styles.submit} />
      </Panel>
      <View style={styles.footer}>
        <Text style={styles.footerLabel}>NEW TO TTCL?</Text>
        <Pressable onPress={() => router.push("/sign-up")} accessibilityRole="button">
          <Text style={styles.create}>CREATE ACCOUNT <Text style={styles.arrow}>↗</Text></Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 12, paddingBottom: 40 },
  back: { flexDirection: "row", gap: 8, alignItems: "center", marginBottom: 26, paddingVertical: 8, alignSelf: "flex-start" },
  backText: { color: colors.textMuted, fontSize: 10, letterSpacing: 1.4, fontWeight: "800" },
  intro: { marginTop: 52, marginBottom: 26 },
  eyebrow: { color: colors.accent, fontSize: 10, fontWeight: "800", letterSpacing: 2 },
  title: { color: colors.text, fontSize: 40, lineHeight: 44, fontWeight: "900", marginTop: 11 },
  subtitle: { color: colors.textMuted, fontSize: 14, marginTop: 10 },
  form: { padding: 18 },
  forgot: { alignSelf: "flex-end", marginTop: -4, marginBottom: 15, paddingVertical: 8 },
  forgotText: { color: colors.accent, fontSize: 12, fontWeight: "700" },
  error: { color: colors.danger, fontSize: 12, lineHeight: 18, marginBottom: 12 },
  submit: { marginTop: 4 },
  footer: { alignItems: "center", marginTop: 30, gap: 8 },
  footerLabel: { color: colors.textMuted, fontSize: 9, letterSpacing: 1.8, fontWeight: "700" },
  create: { color: colors.text, fontSize: 12, fontWeight: "900", letterSpacing: 1.2 },
  arrow: { color: colors.accent },
});
