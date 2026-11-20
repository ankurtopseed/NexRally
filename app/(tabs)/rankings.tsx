import { Image } from "expo-image";
import { Medal } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { AppHeader } from "@/components/AppHeader";
import { Eyebrow, PageHeading, Panel } from "@/components/Panel";
import { Screen } from "@/components/Screen";
import { StateMessage } from "@/components/StateMessage";
import { useRankings } from "@/lib/queries";
import { colors } from "@/lib/theme";

export default function RankingsScreen() {
  const query = useRankings();
  return (
    <Screen scroll contentStyle={styles.content}>
      <AppHeader />
      <PageHeading title="Rankings" subtitle="Every point tells a story. See where the league stands." />
      <View style={styles.header}>
        <Eyebrow>LEAGUE LEADERS</Eyebrow>
        {query.data ? <Text style={styles.count}>{query.data.length} PLAYERS</Text> : null}
      </View>
      {query.isLoading ? <Panel><Text style={styles.muted}>Loading player rankings…</Text></Panel> :
        query.isError ? <Panel><StateMessage title="Rankings unavailable" detail={query.error.message} onRetry={() => void query.refetch()} /></Panel> :
          query.data?.length ? (
            <Panel style={styles.list}>
              <View style={styles.columnHead}><Text style={styles.columnLabel}>RANK / PLAYER</Text><Text style={styles.columnLabel}>POINTS</Text></View>
              {query.data.map((entry, index) => (
                <View key={`${entry.player_id ?? entry.rank}-${index}`} style={[styles.row, index > 0 && styles.rowBorder]}>
                  <Text style={[styles.rank, entry.rank <= 3 && styles.topRank]}>{String(entry.rank).padStart(2, "0")}</Text>
                  {entry.profile_photo_url ? (
                    <Image source={{ uri: entry.profile_photo_url }} style={styles.avatar} contentFit="cover" />
                  ) : (
                    <View style={styles.avatarFallback}><Text style={styles.avatarText}>{entry.player_name.trim().charAt(0).toUpperCase()}</Text></View>
                  )}
                  <Text numberOfLines={1} style={styles.player}>{entry.player_name}</Text>
                  {entry.rank <= 3 ? <Medal size={15} color={entry.rank === 1 ? "#D5B768" : "#95A9B6"} /> : null}
                  <Text style={styles.points}>{entry.points.toLocaleString()}</Text>
                </View>
              ))}
            </Panel>
          ) : <Panel><StateMessage title="No rankings published" detail="Player standings will show here after results are available." /></Panel>}
      <Text style={styles.footnote}>Rankings reflect data supplied by the TTCL league service.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 12, paddingBottom: 35 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  count: { color: colors.textMuted, fontSize: 9, letterSpacing: 1.2, fontWeight: "700" },
  list: { paddingHorizontal: 13, paddingVertical: 6 },
  columnHead: { height: 38, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  columnLabel: { color: colors.textMuted, fontSize: 8, letterSpacing: 1.2, fontWeight: "800" },
  row: { minHeight: 59, flexDirection: "row", alignItems: "center", gap: 9 },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  rank: { width: 24, color: colors.textMuted, fontSize: 11, fontWeight: "900" },
  topRank: { color: colors.accent },
  avatar: { width: 31, height: 31, borderRadius: 16, backgroundColor: colors.backgroundAlt },
  avatarFallback: { width: 31, height: 31, borderRadius: 16, backgroundColor: colors.surfaceRaised, alignItems: "center", justifyContent: "center" },
  avatarText: { color: colors.accent, fontWeight: "800", fontSize: 12 },
  player: { flex: 1, color: colors.text, fontSize: 11, fontWeight: "700" },
  points: { color: colors.text, fontSize: 11, fontWeight: "900", minWidth: 42, textAlign: "right" },
  muted: { color: colors.textMuted, fontSize: 12 },
  footnote: { color: colors.textMuted, fontSize: 10, lineHeight: 16, marginTop: 14, textAlign: "center" },
});
