import { Image } from "expo-image";
import { useState } from "react";
import { Linking, StyleSheet, Text, View } from "react-native";
import { ActionButton } from "@/components/ActionButton";
import { AppHeader } from "@/components/AppHeader";
import { Eyebrow, PageHeading, Panel } from "@/components/Panel";
import { Screen } from "@/components/Screen";
import { StateMessage } from "@/components/StateMessage";
import { useSiteSettings, useSponsors } from "@/lib/queries";
import { colors } from "@/lib/theme";
import { Sponsor } from "@/lib/types";

export default function SponsorsScreen() {
  const sponsors = useSponsors();
  const settings = useSiteSettings();
  const [linkError, setLinkError] = useState<string | null>(null);
  const openLink = async (url: string) => {
    setLinkError(null);
    try {
      await Linking.openURL(url);
    } catch (error) {
      setLinkError(error instanceof Error ? error.message : "Unable to open the link.");
    }
  };
  const partners = sponsors.data?.filter((item) => item.kind === "sponsor") ?? [];
  const products = sponsors.data?.filter((item) => item.kind === "product") ?? [];

  return (
    <Screen scroll contentStyle={styles.content}>
      <AppHeader />
      <PageHeading title="Sponsors" subtitle="The partners and promotions supporting the TTCL community." />
      {sponsors.isLoading ? <Panel><Text style={styles.body}>Loading partners…</Text></Panel> :
        sponsors.isError ? <Panel><StateMessage title="Sponsors unavailable" detail={sponsors.error.message} onRetry={() => void sponsors.refetch()} /></Panel> :
          <>
            <Eyebrow>OUR SPONSORS</Eyebrow>
            {partners.length ? partners.map((item) => <SponsorCard key={item.id} item={item} onOpen={openLink} />) :
              <Panel style={styles.card}><Text style={styles.body}>Sponsors will be announced soon.</Text></Panel>}
            {products.length ? <View style={styles.products}><Eyebrow>PARTNER PROMOTIONS</Eyebrow>
              {products.map((item) => <SponsorCard key={item.id} item={item} onOpen={openLink} />)}
            </View> : null}
          </>}
      <Panel style={styles.contact}>
        <Eyebrow>GET INVOLVED</Eyebrow>
        <Text style={styles.title}>Become a sponsor</Text>
        <Text style={styles.body}>Connect with the TTCL table tennis community.</Text>
        {settings.isError ? <StateMessage title="Contact details unavailable" detail={settings.error.message} onRetry={() => void settings.refetch()} /> :
          settings.data?.contact_email ? <ActionButton title="GET IN TOUCH" onPress={() => void openLink(`mailto:${settings.data!.contact_email}?subject=TTCL%20sponsorship`)} /> : null}
      </Panel>
      {linkError ? <Text accessibilityRole="alert" style={styles.error}>{linkError}</Text> : null}
    </Screen>
  );
}

function SponsorCard({ item, onOpen }: { item: Sponsor; onOpen: (url: string) => Promise<void> }) {
  return (
    <Panel style={styles.card}>
      {item.image_url ? <Image source={{ uri: item.image_url }} contentFit="contain" style={styles.image} /> : null}
      {item.featured ? <Eyebrow>FEATURED</Eyebrow> : null}
      {item.sponsor_name ? <Text style={styles.body}>{item.sponsor_name}</Text> : null}
      <Text style={styles.title}>{item.name}</Text>
      {item.description ? <Text style={styles.body}>{item.description}</Text> : null}
      {item.link_url ? <ActionButton title={item.kind === "sponsor" ? "VISIT PARTNER" : "LEARN MORE"} onPress={() => void onOpen(item.link_url!)} /> : null}
    </Panel>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 12, paddingBottom: 35 },
  card: { marginTop: 12, gap: 10 },
  products: { marginTop: 22 },
  contact: { marginTop: 22, gap: 10 },
  image: { width: "100%", height: 150, borderRadius: 12, backgroundColor: colors.backgroundAlt },
  title: { color: colors.text, fontSize: 18, fontWeight: "800" },
  body: { color: colors.textMuted, fontSize: 13, lineHeight: 20 },
  error: { color: colors.danger, marginTop: 10 },
});
