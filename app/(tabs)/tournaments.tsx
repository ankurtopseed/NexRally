import { router } from "expo-router";
import { Image } from "expo-image";
import { CalendarDays, MapPin, Trophy } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppHeader } from "@/components/AppHeader";
import { Eyebrow, PageHeading, Panel } from "@/components/Panel";
import { Screen } from "@/components/Screen";
import { StateMessage } from "@/components/StateMessage";
import { useTournaments } from "@/lib/queries";
import { colors, radius } from "@/lib/theme";
import { formatDateLabel } from "@/lib/format";
import { Tournament } from "@/lib/types";

export default function TournamentsScreen() {
  const query = useTournaments();
  return (
    <Screen scroll contentStyle={styles.content}>
      <AppHeader />
      <PageHeading title="Tournaments" subtitle="Find your next match and take your place at the table." />
      <View style={styles.kicker}><Eyebrow>THE COMPETITION</Eyebrow><Text style={styles.count}>{query.data?.length ?? 0} EVENTS</Text></View>
      {query.isLoading ? <Panel><Text style={styles.muted}>Loading published tournaments…</Text></Panel> :
        query.isError ? <Panel><StateMessage title="Couldn't load tournaments" detail={query.error.message} onRetry={() => void query.refetch()} /></Panel> :
          query.data?.length ? query.data.map((item) => <TournamentItem key={item.id} item={item} />) :
            <Panel><StateMessage title="No tournaments yet" detail="Published tournaments will appear here as soon as they're available." /></Panel>}
    </Screen>
  );
}

function TournamentItem({ item }: { item: Tournament }) {
  const status = item.registration_status?.replaceAll("_", " ").toUpperCase() || "DETAILS";
  return (
    <Pressable onPress={() => router.push(`/tournament/${item.id}`)} accessibilityRole="button">
      <Panel style={styles.card}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} contentFit="cover" style={styles.image} />
        ) : (
          <View style={styles.imageFallback}><Trophy size={25} color={colors.accent} /></View>
        )}
        <View style={styles.cardBody}>
          <View style={styles.status}><View style={styles.statusDot} /><Text style={styles.statusText}>{status}</Text></View>
          <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
          <View style={styles.meta}><CalendarDays size={13} color={colors.accent} /><Text style={styles.metaText}>{formatDateLabel(item.start_date)}</Text></View>
          <View style={styles.meta}><MapPin size={13} color={colors.accent} /><Text style={styles.metaText} numberOfLines={1}>{item.venue || item.location || "Venue to be announced"}</Text></View>
        </View>
      </Panel>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 12, paddingBottom: 35 },
  kicker: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  count: { color: colors.textMuted, fontSize: 9, letterSpacing: 1.4, fontWeight: "800" },
  card: { padding: 13, marginBottom: 12, borderRadius: radius.medium },
  image: { height: 150, width: "100%", borderRadius: 14, marginBottom: 14, backgroundColor: colors.backgroundAlt },
  imageFallback: { height: 120, width: "100%", borderRadius: 14, marginBottom: 14, backgroundColor: "#00BFFF12", justifyContent: "center", alignItems: "center" },
  cardBody: { gap: 9 },
  status: { flexDirection: "row", gap: 6, alignItems: "center" },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success },
  statusText: { color: colors.accent, fontSize: 8, letterSpacing: 1.2, fontWeight: "900" },
  title: { color: colors.text, fontSize: 17, fontWeight: "800", lineHeight: 22 },
  meta: { flexDirection: "row", alignItems: "center", gap: 8 },
  metaText: { color: colors.textMuted, fontSize: 11 },
  muted: { color: colors.textMuted, fontSize: 12 },
});
