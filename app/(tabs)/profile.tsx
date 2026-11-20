import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { Camera, LogOut, Pencil, Save, UserRound } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { ActionButton } from "@/components/ActionButton";
import { AppHeader } from "@/components/AppHeader";
import { Eyebrow, PageHeading, Panel } from "@/components/Panel";
import { Screen } from "@/components/Screen";
import { StateMessage } from "@/components/StateMessage";
import { useAuth } from "@/lib/auth";
import { authedRequest } from "@/lib/api";
import { usePlayer } from "@/lib/queries";
import { colors, radius } from "@/lib/theme";
import { Player } from "@/lib/types";

type ProfileDraft = {
  first_name?: string;
  last_name?: string;
  organization?: string;
  city?: string;
  state?: string;
};

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const queryClient = useQueryClient();
  const query = usePlayer();
  const player = query.data;
  const [editing, setEditing] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [draft, setDraft] = useState<ProfileDraft>({});

  useEffect(() => {
    if (player) {
      setDraft({
        first_name: player.first_name ?? "",
        last_name: player.last_name ?? "",
        organization: player.organization ?? "",
        city: player.city ?? "",
        state: player.state ?? "",
      });
    }
  }, [player]);

  const saveMutation = useMutation({
    mutationFn: (data: ProfileDraft) => authedRequest<Player>("/api/v1/players/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
    onSuccess: async (updated) => {
      queryClient.setQueryData(["player", "me"], updated);
      setEditing(false);
      setMessage("Profile updated.");
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (uri: string) => {
      const response = await fetch(uri);
      if (!response.ok) throw new Error("Unable to read the selected image.");
      const file = await response.blob();
      if (!file.type.startsWith("image/")) throw new Error("Choose a supported image file.");
      if (file.size > 5 * 1024 * 1024) throw new Error("Profile photos must be 5 MB or smaller.");
      const form = new FormData();
      form.append("file", file, "profile-photo.jpg");
      await authedRequest<void>("/api/v1/players/me/photo", { method: "POST", body: form });
      return uri;
    },
    onSuccess: async (uri) => {
      setPhoto(uri);
      setMessage("Profile photo updated.");
      await queryClient.invalidateQueries({ queryKey: ["player", "me"] });
    },
  });

  const selectPhoto = async (source: "camera" | "library") => {
    setMessage(null);
    const permission = source === "camera"
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setMessage(source === "camera"
        ? "Allow camera access in device settings to take a profile photo."
        : "Allow photo library access in device settings to choose a profile photo.");
      return;
    }
    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.82,
    };
    const result = source === "camera"
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);
    if (!result.canceled) uploadMutation.mutate(result.assets[0].uri);
  };

  const choosePhoto = () => Alert.alert("Profile photo", "Choose how to add a profile photo.", [
    { text: "Take a photo", onPress: () => { void selectPhoto("camera"); } },
    { text: "Choose from library", onPress: () => { void selectPhoto("library"); } },
    { text: "Cancel", style: "cancel" },
  ]);
  const confirmSignOut = () => Alert.alert("Sign out?", "You'll need to sign in again to access your league profile.", [
    { text: "Cancel", style: "cancel" },
    {
      text: "Sign out",
      style: "destructive",
      onPress: () => {
        void signOut().catch((reason: unknown) => {
          Alert.alert("Signed out", `Your session was cleared, but the server logout request failed: ${reason instanceof Error ? reason.message : "unknown error"}`);
        });
      },
    },
  ]);
  const fullName = [player?.first_name, player?.last_name].filter(Boolean).join(" ") || player?.name || "TTCL Player";

  return (
    <Screen scroll contentStyle={styles.content}>
      <AppHeader name={player?.first_name} />
      <PageHeading title="Your profile" subtitle="Your player identity, all in one place." />
      {query.isLoading ? <Panel><Text style={styles.muted}>Loading your player profile…</Text></Panel> :
        query.isError ? <Panel><StateMessage title="Profile unavailable" detail={query.error.message} onRetry={() => void query.refetch()} /></Panel> :
          player ? (
            <>
              <Panel style={styles.profileCard}>
                <View style={styles.avatarWrap}>
                  {photo || player.profile_photo_url ? (
                    <Image source={{ uri: photo || player.profile_photo_url! }} style={styles.avatar} contentFit="cover" />
                  ) : <View style={styles.avatarFallback}><UserRound size={30} color={colors.accent} /></View>}
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Change profile photo"
                    style={styles.camera}
                    onPress={choosePhoto}
                    disabled={uploadMutation.isPending}
                  >
                    <Camera size={14} color={colors.background} />
                  </Pressable>
                </View>
                <View style={styles.playerIdentity}>
                  <Eyebrow>{player.player_category?.toUpperCase() || "TTCL PLAYER"}</Eyebrow>
                  <Text style={styles.fullName}>{fullName}</Text>
                  <Text style={styles.email}>{player.email || "Email not available"}</Text>
                </View>
                <Pressable accessibilityRole="button" accessibilityLabel={editing ? "Save profile" : "Edit profile"} style={styles.editIcon} onPress={() => editing ? saveMutation.mutate(draft) : setEditing(true)}>
                  {editing ? <Save size={17} color={colors.accent} /> : <Pencil size={17} color={colors.accent} />}
                </Pressable>
              </Panel>
              {editing ? (
                <Panel style={styles.details}>
                  <Text style={styles.sectionTitle}>EDIT PLAYER DETAILS</Text>
                  {(["first_name", "last_name", "organization", "city", "state"] as const).map((field) => (
                    <View key={field} style={styles.field}>
                      <Text style={styles.fieldLabel}>{field.replace("_", " ").toUpperCase()}</Text>
                      <TextInput
                        value={draft[field] ?? ""}
                        onChangeText={(text) => setDraft((current) => ({ ...current, [field]: text }))}
                        autoCapitalize="words"
                        style={styles.input}
                        placeholder="Not provided"
                        placeholderTextColor="#71869B"
                      />
                    </View>
                  ))}
                  {saveMutation.error ? <Text style={styles.error}>{saveMutation.error.message}</Text> : null}
                  <ActionButton title="SAVE CHANGES" onPress={() => saveMutation.mutate(draft)} loading={saveMutation.isPending} />
                </Panel>
              ) : (
                <Panel style={styles.details}>
                  <Text style={styles.sectionTitle}>PLAYER DETAILS</Text>
                  <Detail label="ORGANIZATION" value={player.organization} />
                  <Detail label="LOCATION" value={[player.city, player.state].filter(Boolean).join(", ")} />
                  <Detail label="PLAYING HAND" value={player.playing_hand ? `${player.playing_hand} handed` : null} />
                  <Detail label="CATEGORY" value={player.player_category} last />
                </Panel>
              )}
            </>
          ) : <Panel><StateMessage title="Profile details not found" detail="Sign in again or contact the league administrator." /></Panel>}
      {message ? <Text style={message.startsWith("Profile") ? styles.success : styles.error}>{message}</Text> : null}
      {uploadMutation.error ? <Text style={styles.error}>{uploadMutation.error.message}</Text> : null}
      <Pressable style={styles.signOut} onPress={confirmSignOut} accessibilityRole="button">
        <LogOut size={17} color={colors.danger} />
        <Text style={styles.signOutText}>SIGN OUT</Text>
      </Pressable>
    </Screen>
  );
}

function Detail({ label, value, last = false }: { label: string; value?: string | null; last?: boolean }) {
  return (
    <View style={[styles.detailRow, !last && styles.detailBorder]}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || "Not provided"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 12, paddingBottom: 35 },
  profileCard: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, marginBottom: 12 },
  avatarWrap: { position: "relative" },
  avatar: { width: 65, height: 65, borderRadius: 33, backgroundColor: colors.backgroundAlt },
  avatarFallback: { width: 65, height: 65, borderRadius: 33, backgroundColor: "#00BFFF12", alignItems: "center", justifyContent: "center" },
  camera: { position: "absolute", bottom: -2, right: -3, width: 25, height: 25, borderRadius: 13, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: colors.surface },
  playerIdentity: { flex: 1, gap: 4 },
  fullName: { color: colors.text, fontSize: 16, fontWeight: "800" },
  email: { color: colors.textMuted, fontSize: 10 },
  editIcon: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  details: { paddingHorizontal: 16, paddingVertical: 16 },
  sectionTitle: { color: colors.text, fontSize: 10, fontWeight: "900", letterSpacing: 1.4, marginBottom: 5 },
  detailRow: { minHeight: 49, flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
  detailBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  detailLabel: { color: colors.textMuted, fontSize: 9, letterSpacing: 0.8, fontWeight: "800" },
  detailValue: { color: colors.text, fontSize: 11, fontWeight: "600", flexShrink: 1, textAlign: "right" },
  field: { marginVertical: 7 },
  fieldLabel: { color: colors.textMuted, fontSize: 9, fontWeight: "800", letterSpacing: 0.8, marginBottom: 5 },
  input: { minHeight: 42, borderRadius: 12, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, color: colors.text, backgroundColor: colors.backgroundAlt },
  error: { color: colors.danger, fontSize: 12, lineHeight: 18, marginVertical: 9 },
  success: { color: colors.success, fontSize: 12, marginTop: 12 },
  signOut: { marginTop: 22, minHeight: 50, borderRadius: radius.medium, borderWidth: 1, borderColor: "#FF777733", backgroundColor: "#FF77770A", alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 9 },
  signOutText: { color: colors.danger, fontSize: 10, letterSpacing: 1.5, fontWeight: "900" },
  muted: { color: colors.textMuted, fontSize: 12 },
});
