import { router } from "expo-router";
import { Image } from "expo-image";
import { ArrowRight, CalendarDays, MapPin, Trophy } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ActionButton } from "@/components/ActionButton";
import { AppHeader } from "@/components/AppHeader";
import { Eyebrow, PageHeading, Panel } from "@/components/Panel";
import { Screen } from "@/components/Screen";
import { StateMessage } from "@/components/StateMessage";
import { useLeagueStats, usePlayer, useRankings, useTournaments } from "@/lib/queries";
import { useAuth } from "@/lib/auth";
import { colors, radius } from "@/lib/theme";
import { formatDateLabel } from "@/lib/format";
import { Tournament } from "@/lib/types";

export default function HomeScreen() {
  const { status } = useAuth();
  const playerQuery = usePlayer(status === "signedIn");
  const leagueStats = useLeagueStats();
  const tournamentsQuery = useTournaments();
  const rankingsQuery = useRankings();
  const player = playerQuery.data;
  const displayName = player?.first_name ?? player?.name?.split(" ")[0];
  const firstTournament = tournamentsQuery.data
    ?.filter((item) => item.registration_status === "upcoming" && item.start_date && new Date(item.start_date).getTime() > Date.now())
    .sort((a, b) => new Date(a.start_date!).getTime() - new Date(b.start_date!).getTime())[0];
  const topRanked = rankingsQuery.data?.slice(0, 3) ?? [];

  return (
    <Screen scroll contentStyle={styles.content}>
      <AppHeader name={displayName} />
      <View style={styles.greeting}>
        <Text style={styles.greetingText}>{displayName ? "GOOD TO SEE YOU," : "WELCOME TO"}</Text>
        <Text style={styles.name}>{displayName?.toUpperCase() ?? "TTCL"}<Text style={styles.period}>.</Text></Text>
      </View>
      <HeroCard onPress={() => router.push("/(tabs)/tournaments")} />

      <View style={styles.sectionHeader}>
        <View><Eyebrow>THE LEAGUE, SO FAR</Eyebrow><Text style={styles.sectionTitle}>At a glance</Text></View>
      </View>
      {leagueStats.isError ? <Panel><StateMessage title="League stats unavailable" detail={leagueStats.error.message} onRetry={() => void leagueStats.refetch()} /></Panel> :
        <View style={styles.statsGrid}>
          <Stat label="EVENTS CONDUCTED" value={leagueStats.data?.events_conducted} icon="trophy" />
          <Stat label="REGISTERED PLAYERS" value={leagueStats.data?.registered_players} />
          <Stat label="ORGANISATIONS" value={leagueStats.data?.organisations} />
          <Stat label="TOURNAMENTS COMPLETED" value={leagueStats.data?.tournaments_completed} />
        </View>}

      <View style={styles.sectionHeader}>
        <View><Eyebrow>ON THE CALENDAR</Eyebrow><Text style={styles.sectionTitle}>Upcoming tournaments</Text></View>
        <Pressable onPress={() => router.push("/(tabs)/tournaments")} accessibilityRole="button">
          <Text style={styles.seeAll}>SEE ALL <ArrowRight size={12} color={colors.accent} /></Text>
        </Pressable>
      </View>
      {tournamentsQuery.isLoading ? <Panel><Text style={styles.muted}>Loading tournaments…</Text></Panel> :
        tournamentsQuery.isError ? <Panel><StateMessage title="Tournaments unavailable" detail={tournamentsQuery.error.message} onRetry={() => void tournamentsQuery.refetch()} /></Panel> :
          firstTournament ? <TournamentCard item={firstTournament} onPress={() => router.push(`/tournament/${firstTournament.id}`)} /> :
            <Panel><Text style={styles.muted}>No upcoming tournaments right now. Check back soon.</Text></Panel>}

      <View style={styles.sectionHeader}>
        <View><Eyebrow>THE LEAGUE</Eyebrow><Text style={styles.sectionTitle}>Top players</Text></View>
        <Pressable onPress={() => router.push("/(tabs)/rankings")} accessibilityRole="button">
          <Text style={styles.seeAll}>RANKINGS <ArrowRight size={12} color={colors.accent} /></Text>
        </Pressable>
      </View>
      <Panel style={styles.leaderboard}>
        {rankingsQuery.isLoading ? <Text style={styles.muted}>Loading rankings…</Text> :
          rankingsQuery.isError ? <StateMessage title="Rankings unavailable" detail={rankingsQuery.error.message} onRetry={() => void rankingsQuery.refetch()} /> :
            topRanked.length > 0 ? topRanked.map((entry, index) => (
              <View key={`${entry.player_id ?? entry.rank}-${index}`} style={[styles.rankRow, index > 0 && styles.rowBorder]}>
                <Text style={styles.rankNumber}>{String(entry.rank).padStart(2, "0")}</Text>
                <Text numberOfLines={1} style={styles.rankName}>{entry.player_name}</Text>
                <Text style={styles.points}>{entry.points.toLocaleString()} <Text style={styles.pointsUnit}>PTS</Text></Text>
              </View>
            )) : <Text style={styles.muted}>Rankings will appear here once results are published.</Text>}
      </Panel>
    </Screen>
  );
}

function HeroCard({ onPress }: { onPress: () => void }) {
  return (
    <View style={styles.heroWrap}>
      <LinearGradient colors={["#10344A", "#102237", "#0A1725"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.heroGlow} />
        <View style={styles.heroContent}>
          <Eyebrow>TABLE TENNIS. YOUR WAY.</Eyebrow>
          <Text style={styles.heroTitle}>YOUR ARENA{"\n"}AWAITS.</Text>
          <Text style={styles.heroCopy}>Find your next challenge on the table.</Text>
          <ActionButton title="EXPLORE TOURNAMENTS" onPress={onPress} style={styles.heroButton} />
        </View>
        <View style={styles.orbit}>
          <View style={styles.orbitBall} />
          <View style={styles.orbitLine} />
        </View>
        <View style={styles.heroIndex}><Text style={styles.heroIndexText}>01 / COMPETE</Text></View>
      </LinearGradient>
    </View>
  );
}

function Stat({ label, value, icon }: { label: string; value?: string | number; icon?: string }) {
  return (
    <Panel style={styles.stat}>
      {icon === "trophy" ? <Trophy size={15} color={colors.accent} /> : <View style={styles.statLine} />}
      <Text style={styles.statValue}>{value ?? "—"}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Panel>
  );
}

function TournamentCard({ item, onPress }: { item: Tournament; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      <Panel style={styles.tournamentCard}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.tournamentImage} contentFit="cover" />
        ) : (
          <View style={styles.tournamentImageFallback}><Trophy size={23} color={colors.accent} /></View>
        )}
        <View style={styles.tournamentInfo}>
          <Text style={styles.tournamentTitle} numberOfLines={2}>{item.title}</Text>
          <View style={styles.meta}><MapPin size={12} color={colors.accent} /><Text style={styles.metaText} numberOfLines={1}>{item.venue || item.location || "Venue to be announced"}</Text></View>
          <View style={styles.meta}><CalendarDays size={12} color={colors.accent} /><Text style={styles.metaText}>{formatDateLabel(item.start_date)}</Text></View>
        </View>
        <ArrowRight size={18} color={colors.accent} />
      </Panel>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 12, paddingBottom: 35 },
  greeting: { marginBottom: 17 },
  greetingText: { color: colors.textMuted, fontSize: 9, letterSpacing: 2, fontWeight: "800" },
  name: { color: colors.text, fontSize: 26, letterSpacing: 0.4, fontWeight: "900", marginTop: 4 },
  period: { color: colors.accent },
  heroWrap: { borderRadius: radius.large, overflow: "hidden", marginBottom: 27 },
  hero: { minHeight: 225, borderRadius: radius.large, borderWidth: 1, borderColor: "#286078", padding: 20, justifyContent: "center" },
  heroContent: { zIndex: 2, maxWidth: "76%" },
  heroGlow: { position: "absolute", width: 210, height: 210, borderRadius: 105, right: -25, top: 4, backgroundColor: "#00BFFF10" },
  heroTitle: { color: colors.text, fontSize: 28, lineHeight: 30, fontWeight: "900", marginTop: 11 },
  heroCopy: { color: colors.textMuted, fontSize: 11, marginTop: 8, marginBottom: 15 },
  heroButton: { minHeight: 43, alignSelf: "flex-start", paddingHorizontal: 13 },
  orbit: { position: "absolute", width: 134, height: 134, borderRadius: 67, borderWidth: 1, borderColor: "#75E6FF33", right: -9, top: 34, justifyContent: "center", alignItems: "center", transform: [{ rotate: "-30deg" }] },
  orbitBall: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#F4FAFF", position: "absolute", top: 7, right: 26, shadowColor: colors.accent, shadowRadius: 10, shadowOpacity: 0.8 },
  orbitLine: { width: 1, height: 108, backgroundColor: "#00BFFF38", transform: [{ rotate: "42deg" }] },
  heroIndex: { position: "absolute", right: 15, bottom: 13 },
  heroIndexText: { color: "#77DFFF", fontSize: 8, letterSpacing: 1.4 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 13, marginTop: 2 },
  sectionTitle: { color: colors.text, fontSize: 19, fontWeight: "800", marginTop: 5 },
  seeAll: { color: colors.accent, fontSize: 9, fontWeight: "900", letterSpacing: 0.8, flexDirection: "row", alignItems: "center" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 25 },
  stat: { width: "48.5%", minHeight: 105, padding: 14, justifyContent: "space-between" },
  statLine: { height: 2, width: 15, backgroundColor: colors.accent },
  statValue: { color: colors.text, fontSize: 25, fontWeight: "900", marginTop: 8 },
  statLabel: { color: colors.textMuted, fontSize: 8, letterSpacing: 1.2, fontWeight: "800" },
  muted: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },
  tournamentCard: { flexDirection: "row", alignItems: "center", gap: 13, padding: 13, marginBottom: 25 },
  tournamentImage: { width: 58, height: 64, borderRadius: 14, backgroundColor: colors.backgroundAlt },
  tournamentImageFallback: { width: 58, height: 64, borderRadius: 14, backgroundColor: "#00BFFF12", alignItems: "center", justifyContent: "center" },
  tournamentInfo: { flex: 1, gap: 6 },
  tournamentTitle: { color: colors.text, fontSize: 13, fontWeight: "800" },
  meta: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { color: colors.textMuted, fontSize: 10, flexShrink: 1 },
  leaderboard: { paddingVertical: 5 },
  rankRow: { minHeight: 54, flexDirection: "row", alignItems: "center", gap: 13 },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  rankNumber: { color: colors.accent, fontSize: 12, fontWeight: "900", width: 23 },
  rankName: { flex: 1, color: colors.text, fontSize: 12, fontWeight: "700" },
  points: { color: colors.text, fontSize: 12, fontWeight: "800" },
  pointsUnit: { color: colors.textMuted, fontSize: 8 },
});
