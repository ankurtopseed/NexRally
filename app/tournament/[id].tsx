import { useLocalSearchParams, router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, MapPin, Wallet } from "lucide-react-native";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppHeader } from "@/components/AppHeader";
import { Eyebrow, PageHeading, Panel } from "@/components/Panel";
import { Screen } from "@/components/Screen";
import { StateMessage } from "@/components/StateMessage";
import { fetchTournaments } from "@/lib/queries";
import { colors } from "@/lib/theme";

function dateLabel(date?: string | null) {
  if (!date) return "To be announced";
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? "To be announced" : parsed.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

export default function TournamentDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useQuery({
    queryKey: ["tournaments", id],
    queryFn: async () => (await fetchTournaments()).find((event) => String(event.id) === id),
    enabled: Boolean(id),
  });
  const item = query.data;
  return (
    <Screen scroll contentStyle={styles.content}>
      <AppHeader />
      <Pressable style={styles.back} onPress={() => router.back()} accessibilityRole="button">
        <ArrowLeft size={17} color={colors.accent} /><Text style={styles.backText}>ALL TOURNAMENTS</Text>
      </Pressable>
      {query.isLoading ? <Panel><Text style={styles.muted}>Loading tournament details…</Text></Panel> :
        query.isError ? <Panel><StateMessage title="Tournament details unavailable" detail={query.error.message} onRetry={() => void query.refetch()} /></Panel> :
          item ? (
            <>
              {item.image_url ? <Image source={{ uri: item.image_url }} contentFit="cover" style={styles.heroImage} /> : null}
              <PageHeading title={item.title} subtitle={item.description || "Tournament information from the TTCL league service."} />
              <Panel style={styles.details}>
                <Info icon={<CalendarDays size={16} color={colors.accent} />} label="EVENT DATES" value={`${dateLabel(item.start_date)}${item.end_date ? ` – ${dateLabel(item.end_date)}` : ""}`} />
                <Info icon={<MapPin size={16} color={colors.accent} />} label="VENUE" value={item.venue || item.location || "To be announced"} />
                <Info icon={<CalendarDays size={16} color={colors.accent} />} label="REGISTRATION DEADLINE" value={dateLabel(item.registration_deadline)} />
                <Info icon={<Wallet size={16} color={colors.accent} />} label="REGISTRATION FEE" value={item.registration_fee != null ? String(item.registration_fee) : "To be announced"} last />
              </Panel>
              {item.event_categories?.length ? <Panel style={styles.section}><Eyebrow>EVENT CATEGORIES</Eyebrow><Text style={styles.body}>{item.event_categories.join("  ·  ")}</Text></Panel> : null}
              {item.eligibility ? <Panel style={styles.section}><Eyebrow>PLAYER ELIGIBILITY</Eyebrow><Text style={styles.body}>{item.eligibility}</Text></Panel> : null}
              {item.rules ? <Panel style={styles.section}><Eyebrow>TOURNAMENT RULES</Eyebrow><Text style={styles.body}>{item.rules}</Text></Panel> : null}
              <View style={styles.status}><Text style={styles.statusLabel}>EVENT STATUS</Text><Text style={styles.statusValue}>{item.registration_status?.replaceAll("_", " ").toUpperCase() || "CHECK WITH ORGANIZER"}</Text></View>
            </>
          ) : <Panel><StateMessage title="Tournament not found" detail="It may have been unpublished or moved." /></Panel>}
    </Screen>
  );
}

function Info({ icon, label, value, last = false }: { icon: React.ReactNode; label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.infoRow, !last && styles.infoBorder]}>
      {icon}<View style={styles.infoCopy}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{value}</Text></View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 12, paddingBottom: 35 },
  back: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 17, minHeight: 35 },
  backText: { color: colors.accent, fontSize: 9, fontWeight: "900", letterSpacing: 1.3 },
  heroImage: { width: "100%", height: 190, borderRadius: 20, marginBottom: 22, backgroundColor: colors.surface },
  details: { paddingVertical: 5, paddingHorizontal: 15 },
  infoRow: { minHeight: 65, flexDirection: "row", alignItems: "center", gap: 12 },
  infoBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  infoCopy: { flex: 1, gap: 4 },
  infoLabel: { color: colors.textMuted, fontSize: 8, letterSpacing: 1.1, fontWeight: "800" },
  infoValue: { color: colors.text, fontSize: 12, lineHeight: 17, fontWeight: "600" },
  section: { marginTop: 12, gap: 9 },
  body: { color: colors.textMuted, fontSize: 12, lineHeight: 19 },
  status: { marginTop: 14, padding: 15, borderRadius: 16, backgroundColor: "#00BFFF12", borderWidth: 1, borderColor: "#00BFFF35" },
  statusLabel: { color: colors.textMuted, fontSize: 8, letterSpacing: 1.1, fontWeight: "800" },
  statusValue: { color: colors.accentBright, fontSize: 12, fontWeight: "900", marginTop: 5, letterSpacing: 0.8 },
  muted: { color: colors.textMuted, fontSize: 12 },
});
