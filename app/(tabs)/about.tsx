import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { ActionButton } from "@/components/ActionButton";
import { AppHeader } from "@/components/AppHeader";
import { Eyebrow, PageHeading, Panel } from "@/components/Panel";
import { Screen } from "@/components/Screen";
import { StateMessage } from "@/components/StateMessage";
import { useAuth } from "@/lib/auth";
import { useSiteSettings } from "@/lib/queries";
import { colors } from "@/lib/theme";

export default function AboutScreen() {
  const query = useSiteSettings();
  const { status } = useAuth();
  return (
    <Screen scroll contentStyle={styles.content}>
      <AppHeader />
      <Eyebrow>A LEAGUE OF OUR OWN</Eyebrow>
      <View style={styles.heading}><PageHeading title="About TTCL" subtitle="Bringing the corporate community together through table tennis." /></View>
      {query.isLoading ? <Panel><Text style={styles.body}>Loading league information…</Text></Panel> :
        query.isError ? <Panel><StateMessage title="League information unavailable" detail={query.error.message} onRetry={() => void query.refetch()} /></Panel> :
          query.data?.about_text ? <Panel><Text style={styles.body}>{query.data.about_text}</Text></Panel> : null}
      <Panel style={styles.section}>
        <Eyebrow>THE GAME</Eyebrow><Text style={styles.title}>A place to play</Text>
        <Text style={styles.body}>Players from across the corporate community come together to compete, connect and enjoy the game.</Text>
      </Panel>
      {status !== "signedIn" ? <ActionButton title="JOIN TTCL" onPress={() => router.push("/sign-up")} style={styles.join} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 12, paddingBottom: 35 },
  heading: { marginTop: 10 },
  section: { marginTop: 12, gap: 10 },
  title: { color: colors.text, fontSize: 18, fontWeight: "800" },
  body: { color: colors.textMuted, fontSize: 13, lineHeight: 21 },
  join: { marginTop: 18 },
});
