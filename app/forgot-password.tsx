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
import { apiRequest } from "@/lib/api";
import { colors } from "@/lib/theme";

const schema = z.object({ email: z.email("Enter a valid email address.") });
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordScreen() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { control, handleSubmit, formState: { isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });
  const submit = handleSubmit(async ({ email }) => {
    setError(null);
    setMessage(null);
    try {
      await apiRequest("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: email.trim() }),
      });
      setMessage("If an account exists for that email, password reset instructions are on the way.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to request a password reset.");
    }
  });
  return (
    <Screen scroll contentStyle={styles.content}>
      <Pressable style={styles.back} onPress={() => router.back()} accessibilityRole="button">
        <ArrowLeft size={18} color={colors.textMuted} /><Text style={styles.backText}>BACK</Text>
      </Pressable>
      <Brand />
      <View style={styles.intro}>
        <Text style={styles.eyebrow}>ACCOUNT RECOVERY</Text>
        <Text style={styles.title}>RESET YOUR{"\n"}PASSWORD.</Text>
        <Text style={styles.subtitle}>Enter your account email and we’ll send recovery instructions.</Text>
      </View>
      <Panel style={styles.form}>
        <FormField control={control} name="email" label="EMAIL ADDRESS" placeholder="you@company.com" keyboardType="email-address" autoComplete="email" />
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        {message ? <Text accessibilityRole="alert" style={styles.success}>{message}</Text> : null}
        <ActionButton title="SEND RESET LINK" onPress={() => void submit()} loading={isSubmitting} />
      </Panel>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 12, paddingBottom: 40 },
  back: { flexDirection: "row", gap: 8, alignItems: "center", marginBottom: 26, paddingVertical: 8, alignSelf: "flex-start" },
  backText: { color: colors.textMuted, fontSize: 10, letterSpacing: 1.4, fontWeight: "800" },
  intro: { marginTop: 55, marginBottom: 25 },
  eyebrow: { color: colors.accent, fontSize: 10, fontWeight: "800", letterSpacing: 2 },
  title: { color: colors.text, fontSize: 34, lineHeight: 39, fontWeight: "900", marginTop: 10 },
  subtitle: { color: colors.textMuted, fontSize: 14, lineHeight: 21, marginTop: 10 },
  form: { padding: 18 },
  error: { color: colors.danger, fontSize: 12, marginBottom: 13 },
  success: { color: colors.success, fontSize: 12, lineHeight: 18, marginBottom: 13 },
});
