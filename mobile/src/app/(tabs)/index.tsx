import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Animated,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { occurrencesService, OccurrenceResponse } from "../../services/api/occurrences.service";
import { theme } from "../../constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { User, Plus, CheckCircle, AlertTriangle } from "lucide-react-native";
import { ErrorState } from "../../components/ErrorState";
import { OccurrenceCard } from "../../components/OccurrenceCard";
import { Button } from "../../components/Button";

export default function HomeTab() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  const [occurrences, setOccurrences] = useState<OccurrenceResponse[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [hasError, setHasError] = useState(false);

  const [pulseAnim] = useState(() => new Animated.Value(1));


  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: Platform.OS !== "web",
        }),
      ])
    ).start();
  }, [pulseAnim]);

  useEffect(() => {
    async function fetchOccurrences() {
      try {
        setHasError(false);
        const data = await occurrencesService.findAll();
        const sorted = data.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setOccurrences(sorted);
      } catch (error) {
        console.error("Error fetching occurrences:", error);
        setHasError(true);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
    fetchOccurrences();
  }, [refreshTrigger]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshTrigger((prev) => prev + 1);
  };

  const last24hCount = occurrences.filter(
    (occ) => new Date().getTime() - new Date(occ.createdAt).getTime() < 24 * 60 * 60 * 1000
  ).length;

  let statusGradients: [string, string, ...string[]] = [theme.colors.primary, theme.colors.dark];
  let statusTitle = "Rede Estável";
  let statusDesc = "Nenhuma ocorrência na sua região!";
  let statusIconType = "check";

  if (last24hCount > 0 && last24hCount <= 5) {
    statusGradients = [theme.colors.status.warning, "#B45309"];
    statusTitle = "Rede sob Atenção";
    statusDesc = `${last24hCount} relato${last24hCount > 1 ? "s" : ""} de instabilidade nas últimas 24h.`;
    statusIconType = "alert";
  } else if (last24hCount > 5) {
    statusGradients = [theme.colors.status.danger, "#991B1B"];
    statusTitle = "Rede Instável";
    statusDesc = `${last24hCount} ocorrências graves registradas nas últimas 24h!`;
    statusIconType = "critical";
  }

  const getChartData = () => {
    const numBars = 18;
    const data = new Array(numBars).fill(0);
    const now = new Date().getTime();
    const timeWindow = 24 * 60 * 60 * 1000;

    occurrences.forEach((occ) => {
      const diff = now - new Date(occ.createdAt).getTime();
      if (diff >= 0 && diff < timeWindow) {
        const ratio = 1 - diff / timeWindow;
        const index = Math.floor(ratio * (numBars - 1));
        if (index >= 0 && index < numBars) {
          data[index] += 1;
        }
      }
    });

    const maxVal = Math.max(...data);
    if (maxVal === 0) {
      return [3, 5, 2, 4, 8, 12, 18, 10, 6, 4, 8, 14, 20, 15, 12, 17, 13, 22];
    }
    return data;
  };

  const chartData = getChartData();
  const maxVal = Math.max(...chartData, 1);

  const renderItem = ({ item }: { item: OccurrenceResponse }) => {
    return (
      <OccurrenceCard
        occurrence={item}
        onPress={() => router.push({ pathname: "/detalhes/[id]", params: { id: item.id } })}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require("@/assets/images/infoagua-logo.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        {isAuthLoading ? null : isAuthenticated ? (
          <Button
            title={user?.name?.split(" ")[0] || "Perfil"}
            onPress={() => router.push("/perfil")}
            variant="secondary"
            icon={<User size={18} color={theme.colors.primary} />}
            style={{ maxWidth: 140 }}
          />
        ) : (
          <Button
            title="Entrar"
            onPress={() => router.push("/(auth)/login")}
            variant="primary"
            style={{ height: 40, paddingHorizontal: 16, borderRadius: theme.borderRadius.button }}
          />
        )}
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : hasError ? (
        <ErrorState
          title="Falha ao carregar ocorrências"
          message="Não foi possível carregar as ocorrências. Verifique sua conexão ou tente novamente."
          onRetry={() => {
            setIsLoading(true);
            setRefreshTrigger((prev) => prev + 1);
          }}
        />
      ) : (
        <FlatList
          data={occurrences}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          ListHeaderComponent={
            <View style={styles.feedHeader}>
              {/* 1. Status Card with Gradient */}
              <LinearGradient
                colors={statusGradients}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statusCard}
              >
                <View style={styles.statusBadgeSquircle}>
                  {statusIconType === "check" ? (
                    <CheckCircle size={28} color={theme.colors.status.success} />
                  ) : statusIconType === "alert" ? (
                    <AlertTriangle size={28} color={theme.colors.status.warning} />
                  ) : (
                    <AlertTriangle size={28} color={theme.colors.status.danger} />
                  )}
                </View>

                <Text style={styles.statusTitle}>{statusTitle}</Text>
                <Text style={styles.statusDesc}>{statusDesc}</Text>

                <View style={styles.updatePill}>
                  <Animated.View style={[styles.pulseDot, { opacity: pulseAnim }]} />
                  <Text style={styles.updatePillText}>Última atualização: Agora</Text>
                </View>
              </LinearGradient>

              {/* 2. 24h Reports Chart Card */}
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Relatos nas últimas 24h</Text>
                <View style={styles.chartContainer}>
                  {chartData.map((val, idx) => {
                    const heightPct = (val / maxVal) * 100;
                    const finalHeight = Math.max(heightPct, 6);
                    const isLast = idx === chartData.length - 1;
                    const barColor = isLast ? "#1070D0" : "#93C5FD";

                    return (
                      <View key={idx} style={styles.chartBarWrapper}>
                        <View
                          style={[
                            styles.chartBar,
                            { height: `${finalHeight}%`, backgroundColor: barColor },
                          ]}
                        />
                      </View>
                    );
                  })}
                </View>
                <View style={styles.chartLabels}>
                  <Text style={styles.chartLabelText}>24 horas atrás</Text>
                  <Text style={styles.chartLabelText}>Agora</Text>
                </View>
              </View>

              {/* 3. Section Title */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Ocorrências Recentes</Text>
                <TouchableOpacity
                  onPress={() => router.push("/(tabs)/mapa")}
                  activeOpacity={0.7}
                >
                  <Text style={styles.sectionLink}>Ver Mapa</Text>
                </TouchableOpacity>
              </View>
            </View>
          }
          ListFooterComponent={
            occurrences.length > 0 ? (
              <View style={styles.ctaCard}>
                <Text style={styles.ctaTitle}>Viu algo errado?</Text>
                <Text style={styles.ctaSubtitle}>
                  Ajude a comunidade relatando problemas em sua rua.
                </Text>
                <Button
                  title="Relatar Ocorrência"
                  onPress={() => router.push("/(tabs)/relatar")}
                  variant="cta"
                  icon={<Plus size={18} color="#FFFFFF" strokeWidth={2.5} />}
                />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📭</Text>
              <Text style={styles.emptyTitle}>Nenhum relato encontrado</Text>
              <Text style={styles.emptyText}>
                Seja o primeiro a relatar um problema de abastecimento ou qualidade da água na sua região!
              </Text>
              {isAuthenticated && (
                <Button
                  title="Relatar Agora"
                  onPress={() => router.push("/(tabs)/relatar")}
                  variant="primary"
                  icon={<Plus size={18} color="#FFFFFF" />}
                  style={{ height: 44, paddingHorizontal: 20, borderRadius: 8 }}
                />
              )}
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const cardShadow = Platform.select({
  web: { boxShadow: "0px 4px 12px rgba(0,0,0,0.05)" } as any,
  default: {
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: theme.colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoImage: {
    width: 32,
    height: 32,
  },
  appName: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: "bold",
    fontFamily: theme.typography.fonts.bold,
    color: theme.colors.text.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
    paddingBottom: 110,
    gap: 12,
    flexGrow: 1,
  },
  feedHeader: {
    gap: 16,
    marginBottom: 4,
  },
  statusCard: {
    borderRadius: theme.borderRadius.sheet,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    ...cardShadow,
  },
  statusBadgeSquircle: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.squircle,
    backgroundColor: theme.colors.cardBackground,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statusTitle: {
    fontSize: theme.typography.sizes.display,
    fontWeight: "bold",
    fontFamily: theme.typography.fonts.bold,
    color: theme.colors.text.light,
    marginBottom: 6,
    textAlign: "center",
  },
  statusDesc: {
    fontSize: theme.typography.sizes.lg,
    fontFamily: theme.typography.fonts.regular,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 20,
    textAlign: "center",
  },
  updatePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.status.success,
    marginRight: 8,
  },
  updatePillText: {
    color: theme.colors.text.light,
    fontSize: theme.typography.sizes.sm,
    fontWeight: "600",
    fontFamily: theme.typography.fonts.semiBold,
  },
  chartCard: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.sheet,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...cardShadow,
  },
  chartTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: "bold",
    fontFamily: theme.typography.fonts.bold,
    color: theme.colors.text.primary,
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: "row",
    height: 90,
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  chartBarWrapper: {
    flex: 1,
    height: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
    marginHorizontal: 1.5,
  },
  chartBar: {
    width: "100%",
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  chartLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  chartLabelText: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
    fontWeight: "500",
    fontFamily: theme.typography.fonts.medium,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: "bold",
    fontFamily: theme.typography.fonts.bold,
    color: theme.colors.text.primary,
  },
  sectionLink: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: "600",
    fontFamily: theme.typography.fonts.semiBold,
    color: theme.colors.primary,
  },
  ctaCard: {
    backgroundColor: theme.colors.lightBg,
    borderRadius: theme.borderRadius.sheet,
    padding: 20,
    alignItems: "center",
    marginTop: 16,
  },
  ctaTitle: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: "bold",
    fontFamily: theme.typography.fonts.bold,
    color: theme.colors.dark,
    marginBottom: 6,
    textAlign: "center",
  },
  ctaSubtitle: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.secondary,
    fontFamily: theme.typography.fonts.regular,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: "bold",
    fontFamily: theme.typography.fonts.bold,
    color: theme.colors.text.primary,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text.secondary,
    fontFamily: theme.typography.fonts.regular,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
});


