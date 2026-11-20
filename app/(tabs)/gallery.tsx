import { Image } from "expo-image";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { AppHeader } from "@/components/AppHeader";
import { PageHeading, Panel } from "@/components/Panel";
import { Screen } from "@/components/Screen";
import { StateMessage } from "@/components/StateMessage";
import { useGallery } from "@/lib/queries";
import { colors } from "@/lib/theme";

const gap = 10;
const tileWidth = (Dimensions.get("window").width - 44 - gap) / 2;

export default function GalleryScreen() {
  const query = useGallery();
  return (
    <Screen scroll contentStyle={styles.content}>
      <AppHeader />
      <PageHeading title="Gallery" subtitle="Moments from the league, on and off the table." />
      {query.isLoading ? <Panel><Text style={styles.muted}>Loading league moments…</Text></Panel> :
        query.isError ? <Panel><StateMessage title="Gallery unavailable" detail={query.error.message} onRetry={() => void query.refetch()} /></Panel> :
          query.data?.length ? (
            <View style={styles.grid}>
              {query.data.map((item, index) => (
                <View key={item.id} style={[styles.tile, index % 3 === 0 && styles.tall]}>
                  <Image source={{ uri: item.image_url }} contentFit="cover" style={styles.image} transition={180} />
                  {item.title || item.caption ? (
                    <View style={styles.caption}><Text numberOfLines={2} style={styles.captionText}>{item.title || item.caption}</Text></View>
                  ) : null}
                </View>
              ))}
            </View>
          ) : <Panel><StateMessage title="No gallery moments yet" detail="League photos will appear here when they're shared." /></Panel>}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 12, paddingBottom: 35 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap },
  tile: { width: tileWidth, height: 165, borderRadius: 17, overflow: "hidden", backgroundColor: colors.surface },
  tall: { height: 210 },
  image: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, width: "100%", height: "100%" },
  caption: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: 10, paddingVertical: 9, backgroundColor: "#060D17CC" },
  captionText: { color: colors.text, fontSize: 10, fontWeight: "700" },
  muted: { color: colors.textMuted, fontSize: 12 },
});
