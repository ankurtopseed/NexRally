import { useState } from "react";
import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { colors, radius } from "@/lib/theme";

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  secure?: boolean;
  keyboardType?: TextInputProps["keyboardType"];
  autoCapitalize?: TextInputProps["autoCapitalize"];
  autoComplete?: TextInputProps["autoComplete"];
};

export function FormField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  secure = false,
  keyboardType,
  autoCapitalize = "none",
  autoComplete,
}: Props<T>) {
  const [visible, setVisible] = useState(false);
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <View style={styles.group}>
          <Text style={styles.label}>{label}</Text>
          <View style={[styles.inputFrame, error && styles.inputError]}>
            <TextInput
              value={typeof value === "string" ? value : ""}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder={placeholder}
              placeholderTextColor="#71869B"
              secureTextEntry={secure && !visible}
              keyboardType={keyboardType}
              autoCapitalize={autoCapitalize}
              autoComplete={autoComplete}
              style={styles.input}
              selectionColor={colors.accent}
              accessibilityLabel={label}
            />
            {secure ? (
              <Pressable
                onPress={() => setVisible((current) => !current)}
                accessibilityRole="button"
                accessibilityLabel={visible ? "Hide password" : "Show password"}
                hitSlop={10}
              >
                {visible ? <EyeOff size={19} color={colors.textMuted} /> : <Eye size={19} color={colors.textMuted} />}
              </Pressable>
            ) : null}
          </View>
          {error?.message ? <Text style={styles.error}>{error.message}</Text> : null}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  group: { gap: 8, marginBottom: 16 },
  label: { color: colors.text, fontSize: 12, fontWeight: "700" },
  inputFrame: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#0B1726",
    borderRadius: radius.medium,
    paddingHorizontal: 15,
  },
  inputError: { borderColor: colors.danger },
  input: { flex: 1, color: colors.text, fontSize: 14, paddingVertical: 12 },
  error: { color: colors.danger, fontSize: 11 },
});
