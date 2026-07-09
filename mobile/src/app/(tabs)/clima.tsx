import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../../constants/theme";
import { CloudRain, Droplet, Cloud, CloudSun, Sun } from "lucide-react-native";

export default function WeatherTab() {


  const forecastData = [
    {
      day: "Amanhã",
      icon: Cloud,
      probability: "40%",
      high: "28°",
      low: "22°",
      color: "#2563EB",
    },
    {
      day: "Qua",
      icon: CloudRain,
      probability: "90%",
      high: "25°",
      low: "20°",
      color: "#2563EB",
    },
    {
      day: "Qui",
      icon: CloudRain,
      probability: "100%",
      high: "24°",
      low: "19°",
      color: "#2563EB",
    },
    {
      day: "Sex",
      icon: CloudSun,
      probability: "20%",
      high: "29°",
      low: "21°",
      color: "#4B5563",
    },
    {
      day: "Sáb",
      icon: Sun,
      probability: "0%",
      high: "31°",
      low: "23°",
      color: "#F97316",
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Top Weather Card */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.dark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.weatherCard}
        >
          <View style={styles.weatherHeader}>
            <CloudRain size={32} color="#FFFFFF" />
            <Text style={styles.weatherStatus}>Chuva Forte</Text>
          </View>

          <View style={styles.chanceContainer}>
            <Text style={styles.chanceNumber}>80%</Text>
            <Text style={styles.chanceLabel}>chance</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>VOLUME</Text>
              <Text style={styles.statValue}>45mm</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>TEMP</Text>
              <Text style={styles.statValue}>26°C</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>VENTO</Text>
              <Text style={styles.statValue}>15km/h</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Impact Card */}
        <View style={styles.impactCard}>
          <View style={styles.impactIconContainer}>
            <Droplet size={20} color="#FFFFFF" fill="#FFFFFF" />
          </View>
          <View style={styles.impactTextContainer}>
            <Text style={styles.impactTitle}>Impacto no Fornecimento</Text>
            <Text style={styles.impactDescription}>
              As fortes chuvas esperadas para esta noite podem aumentar
              temporariamente os níveis dos reservatórios, mas inundações
              localizadas podem causar pequenas interrupções nas linhas de
              distribuição do bairro.
            </Text>
          </View>
        </View>

        {/* 5-Day Forecast Section */}
        <Text style={styles.sectionTitle}>Previsão de 5 Dias</Text>

        <View style={styles.forecastList}>
          {forecastData.map((item, index) => {
            const Icon = item.icon;
            return (
              <View key={index} style={styles.forecastRow}>
                <Text style={styles.forecastDay}>{item.day}</Text>
                
                <View style={styles.forecastProbContainer}>
                  <Icon size={20} color={item.color} />
                  <Text style={[styles.forecastProbText, { color: item.color }]}>
                    {item.probability}
                  </Text>
                </View>

                <View style={styles.forecastTempContainer}>
                  <Text style={styles.forecastHigh}>{item.high}</Text>
                  <Text style={styles.forecastLow}>{item.low}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 110,
  },
  weatherCard: {
    borderRadius: theme.borderRadius.sheet,
    padding: 24,
    marginBottom: 16,
    ...Platform.select({
      web: { boxShadow: "0px 8px 16px rgba(16, 112, 208, 0.15)" } as any,
      default: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 6,
      },
    }),
  },
  weatherHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  weatherStatus: {
    color: theme.colors.text.light,
    fontSize: theme.typography.sizes.hero,
    fontFamily: theme.typography.fonts.bold,
    marginLeft: 10,
  },
  chanceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    marginBottom: 16,
  },
  chanceNumber: {
    color: theme.colors.text.light,
    fontSize: theme.typography.sizes.giant,
    fontFamily: theme.typography.fonts.bold,
  },
  chanceLabel: {
    color: "#E0F2FE",
    fontSize: theme.typography.sizes.xl,
    fontFamily: theme.typography.fonts.regular,
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginVertical: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    color: "#A5CFFF",
    fontSize: 11,
    fontFamily: theme.typography.fonts.semiBold,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    color: theme.colors.text.light,
    fontSize: theme.typography.sizes.lg,
    fontFamily: theme.typography.fonts.bold,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  impactCard: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    marginBottom: 24,
    ...Platform.select({
      web: { boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.03)" } as any,
      default: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 12,
        elevation: 2,
      },
    }),
  },
  impactIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.status.danger,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  impactTextContainer: {
    flex: 1,
  },
  impactTitle: {
    fontSize: theme.typography.sizes.lg,
    fontFamily: theme.typography.fonts.bold,
    color: theme.colors.text.primary,
    marginBottom: 6,
  },
  impactDescription: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fonts.regular,
    color: theme.colors.text.secondary,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.xxl,
    fontFamily: theme.typography.fonts.bold,
    color: theme.colors.text.primary,
    marginBottom: 16,
  },
  forecastList: {
    gap: 8,
  },
  forecastRow: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...Platform.select({
      web: { boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.02)" } as any,
      default: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 8,
        elevation: 1,
      },
    }),
  },
  forecastDay: {
    fontSize: theme.typography.sizes.base,
    fontFamily: theme.typography.fonts.semiBold,
    color: theme.colors.text.primary,
    width: 80,
  },
  forecastProbContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  forecastProbText: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fonts.semiBold,
    marginLeft: 6,
    width: 40,
  },
  forecastTempContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    width: 70,
  },
  forecastHigh: {
    fontSize: theme.typography.sizes.base,
    fontFamily: theme.typography.fonts.semiBold,
    color: theme.colors.text.primary,
    marginRight: 10,
  },
  forecastLow: {
    fontSize: theme.typography.sizes.base,
    fontFamily: theme.typography.fonts.regular,
    color: theme.colors.text.tertiary,
  },
});
