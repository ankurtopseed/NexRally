import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { ArrowLeft, Check } from "lucide-react-native";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { z } from "zod";
import { ActionButton } from "@/components/ActionButton";
import { Brand } from "@/components/Brand";
import { FormField } from "@/components/FormField";
import { Panel } from "@/components/Panel";
import { Screen } from "@/components/Screen";
import { useAuth } from "@/lib/auth";
import { colors } from "@/lib/theme";

const schema = z.object({
  first_name: z.string().trim().min(1, "First name is required."),
  last_name: z.string().trim().min(1, "Last name is required."),
  email: z.email("Enter a valid email address."),
  mobile_number: z.string().trim().regex(/^\+?[0-9][0-9\s()-]{6,18}[0-9]$/, "Enter a valid mobile number."),
  password: z.string()
    .min(10, "Use at least 10 characters.")
    .regex(/[a-z]/, "Include a lowercase letter.")
    .regex(/[A-Z]/, "Include an uppercase letter.")
    .regex(/[0-9]/, "Include a number.")
    .regex(/[^A-Za-z0-9]/, "Include a symbol."),
  confirm_password: z.string(),
  organization: z.string().trim().min(1, "Organization is required."),
  city: z.string().trim().min(1, "City is required."),
  state: z.string().trim().min(1, "State is required."),
  accepted_terms: z.boolean().refine(Boolean, "Please accept the terms and privacy policy."),
}).refine((value) => value.password === value.confirm_password, {
  path: ["confirm_password"],
  message: "Passwords do not match.",
});
type FormData = z.infer<typeof schema>;

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [registrationMessage, setRegistrationMessage] = useState<string | null>(null);
  const { control, handleSubmit, setValue, watch, formState: { isSubmitting, errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      first_name: "", last_name: "", email: "", mobile_number: "", password: "",
      confirm_password: "", organization: "", city: "", state: "", accepted_terms: false,
    },
  });
  const accepted = watch("accepted_terms");

  const submit = handleSubmit(async (values) => {
    setServerError(null);
    setRegistrationMessage(null);
    const { accepted_terms, organization, ...payload } = values;
    try {
      const message = await signUp({
        ...Object.fromEntries(Object.entries(payload).map(([key, value]) => [
          key, key === "password" || key === "confirm_password" ? value : value.trim(),
        ])),
        organisation_name: organization.trim(),
        accept_terms: String(accepted_terms),
      });
      setRegistrationMessage(message);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Unable to create your account.");
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
        <Text style={styles.eyebrow}>JOIN THE LEAGUE</Text>
        <Text style={styles.title}>CREATE YOUR{"\n"}PLAYER PROFILE.</Text>
        <Text style={styles.subtitle}>A few details and you're in the game.</Text>
      </View>
      <Panel style={styles.form}>
        <View style={styles.row}>
          <View style={styles.half}><FormField control={control} name="first_name" label="FIRST NAME" placeholder="First name" autoCapitalize="words" autoComplete="given-name" /></View>
          <View style={styles.half}><FormField control={control} name="last_name" label="LAST NAME" placeholder="Last name" autoCapitalize="words" autoComplete="family-name" /></View>
        </View>
        <FormField control={control} name="email" label="EMAIL ADDRESS" placeholder="you@company.com" keyboardType="email-address" autoComplete="email" />
        <FormField control={control} name="mobile_number" label="MOBILE NUMBER" placeholder="+1 555 000 0000" keyboardType="phone-pad" autoComplete="tel" />
        <FormField control={control} name="password" label="PASSWORD" placeholder="At least 10 characters" secure autoComplete="new-password" />
        <FormField control={control} name="confirm_password" label="CONFIRM PASSWORD" placeholder="Re-enter your password" secure autoComplete="new-password" />
        <FormField control={control} name="organization" label="ORGANIZATION / COMPANY" placeholder="Organization" autoCapitalize="words" />
        <View style={styles.row}>
          <View style={styles.half}><FormField control={control} name="city" label="CITY" placeholder="City" autoCapitalize="words" /></View>
          <View style={styles.half}><FormField control={control} name="state" label="STATE" placeholder="State" autoCapitalize="words" /></View>
        </View>
        <Pressable
          style={styles.terms}
          onPress={() => setValue("accepted_terms", !accepted, { shouldValidate: true })}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: accepted }}
        >
          <View style={[styles.checkbox, accepted && styles.checkboxActive]}>{accepted ? <Check size={13} color={colors.background} /> : null}</View>
          <Text style={styles.termsText}>I agree to the <Text style={styles.link}>Terms of Service</Text> and <Text style={styles.link}>Privacy Policy</Text>.</Text>
        </Pressable>
        {errors.accepted_terms?.message ? <Text style={styles.error}>{errors.accepted_terms.message}</Text> : null}
        {serverError ? <Text accessibilityRole="alert" style={styles.error}>{serverError}</Text> : null}
        {registrationMessage ? <Text accessibilityRole="alert" style={styles.success}>{registrationMessage}</Text> : null}
        <ActionButton title="CREATE ACCOUNT" onPress={() => void submit()} loading={isSubmitting} style={styles.submit} />
      </Panel>
      <Pressable style={styles.footer} onPress={() => router.push("/sign-in")} accessibilityRole="button">
        <Text style={styles.footerText}>ALREADY REGISTERED? <Text style={styles.link}>SIGN IN</Text></Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 12, paddingBottom: 40 },
  back: { flexDirection: "row", gap: 8, alignItems: "center", marginBottom: 26, paddingVertical: 8, alignSelf: "flex-start" },
  backText: { color: colors.textMuted, fontSize: 10, letterSpacing: 1.4, fontWeight: "800" },
  intro: { marginTop: 32, marginBottom: 22 },
  eyebrow: { color: colors.accent, fontSize: 10, fontWeight: "800", letterSpacing: 2 },
  title: { color: colors.text, fontSize: 30, lineHeight: 35, fontWeight: "900", marginTop: 10 },
  subtitle: { color: colors.textMuted, fontSize: 13, marginTop: 9 },
  form: { padding: 16 },
  row: { flexDirection: "row", gap: 10 },
  half: { flex: 1 },
  fieldLabel: { color: colors.text, fontSize: 11, letterSpacing: 0.6, fontWeight: "800", marginTop: 2, marginBottom: 10 },
  choiceRow: { flexDirection: "row", gap: 9, marginBottom: 17 },
  categories: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 18 },
  choice: { minHeight: 40, justifyContent: "center", paddingHorizontal: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 13, backgroundColor: "#0B1726" },
  choiceSelected: { borderColor: colors.accent, backgroundColor: "#00BFFF1A" },
  choiceText: { color: colors.textMuted, fontSize: 9, fontWeight: "800", letterSpacing: 0.7 },
  choiceTextSelected: { color: colors.accentBright },
  terms: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  checkbox: { width: 21, height: 21, borderRadius: 6, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  checkboxActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  termsText: { flex: 1, color: colors.textMuted, fontSize: 11, lineHeight: 17 },
  link: { color: colors.accent, fontWeight: "800" },
  error: { color: colors.danger, fontSize: 12, lineHeight: 18, marginBottom: 12 },
  success: { color: colors.success, fontSize: 12, lineHeight: 18, marginBottom: 12 },
  submit: { marginTop: 5 },
  footer: { alignItems: "center", marginTop: 25, paddingVertical: 12 },
  footerText: { color: colors.textMuted, fontSize: 10, letterSpacing: 1, fontWeight: "700" },
});
