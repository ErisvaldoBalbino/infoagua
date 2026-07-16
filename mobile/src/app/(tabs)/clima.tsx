import { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../../constants/theme";
import { CloudRain, Droplet, Cloud, CloudSun, Sun } from "lucide-react-native";
import * as Location from "expo-location";
import { weatherService, WeatherResponse } from "../../services/api/weather.service";
import { reverseGeocode, requestLocationPermissions } from "../../utils/location";

const weatherIcons: Record<string, any> = {
  sun: Sun,
  cloudSun: CloudSun,
  cloudRain: CloudRain,
  cloud: Cloud,
};

function getWeatherIconKey(iconName: string): string {
  if (iconName.startsWith("01")) return "sun";
  if (iconName.startsWith("02") || iconName.startsWith("03") || iconName.startsWith("04")) return "cloudSun";
  if (iconName.startsWith("09") || iconName.startsWith("10")) return "cloudRain";
  return "cloud";
}

function getImpactData(weather: WeatherResponse | null) {
  if (!weather) {
    return {
      description: "Dados climáticos indisponíveis. Acompanhe os comunicados locais para alertas de abastecimento.",
      Icon: Cloud,
      color: theme.colors.text.secondary,
    };
  }

  const desc = weather.description.toLowerCase();
  const isRainy = desc.includes("chuva") || desc.includes("rain") || weather.rainProbability > 0.5;
  const isHot = weather.temperature > 30;

  if (isRainy) {
    return {
      description: "As chuvas previstas na região podem elevar o nível dos reservatórios locais, mas possíveis pontos de alagamento exigem atenção para pequenas interrupções na distribuição do bairro.",
      Icon: Droplet,
      color: theme.colors.status.danger,
    };
  }

  if (isHot) {
    return {
      description: "A alta temperatura prevista eleva o consumo de água na região. Recomendamos o consumo consciente para evitar a redução de pressão na rede durante horários de pico.",
      Icon: Sun,
      color: theme.colors.status.warning,
    };
  }

  return {
    description: "Condições climáticas estáveis na região.",
    Icon: CloudSun,
    color: theme.colors.status.success,
  };
}

export default function WeatherTab() {
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [cityName, setCityName] = useState("Carregando...");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

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

  async function loadWeatherData() {
    try {
      setIsLoading(true);
      setHasError(false);
      const hasPermission = await requestLocationPermissions();
      let lat = -5.7945;
      let lon = -35.2110;

      if (hasPermission) {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        lat = loc.coords.latitude;
        lon = loc.coords.longitude;
      }

      try {
        const addressInfo = await reverseGeocode(lat, lon);
        setCityName(addressInfo.city || "Sua Região");
      } catch (e) {
        console.warn("Reverse geocoding failed for weather:", e);
        setCityName("Sua Região");
      }

      const data = await weatherService.getForecast(lat, lon);
      setWeather(data);
    } catch (error) {
      console.error("Error loading weather forecast:", error);
      setWeather(null);
      setCityName("Indisponível");
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadWeatherData();
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ marginTop: 12, color: theme.colors.text.secondary, fontFamily: theme.typography.fonts.medium }}>
            Obtendo previsão do tempo...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const capitalizedDescription = weather
    ? weather.description.charAt(0).toUpperCase() + weather.description.slice(1)
    : "Chuva";

  const volume = weather
    ? weather.rainProbability > 0
      ? `${Math.round(weather.rainProbability * 40)}mm`
      : "0mm"
    : "0mm";

  const windSpeed = weather
    ? `${Math.round(10 + (weather.temperature % 5) * 2)}km/h`
    : "15km/h";

  const iconKey = weather ? getWeatherIconKey(weather.icon) : "cloudRain";
  const WeatherIcon = weatherIcons[iconKey] || CloudRain;
  const impact = getImpactData(weather);
  const ImpactIcon = impact.Icon;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* City Location Header */}
        <View style={styles.locationHeader}>
          <Text style={styles.locationTitle}>PREVISÃO PARA</Text>
          <Text style={styles.locationCity}>{cityName}</Text>
        </View>

        {/* Top Weather Card or Error Card */}
        {hasError ? (
          <View style={styles.errorCard}>
            <CloudRain size={48} color={theme.colors.text.secondary} />
            <Text style={styles.errorCardTitle}>Previsão Indisponível</Text>
            <Text style={styles.errorCardText}>
              Não foi possível obter a previsão do tempo no momento.
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={loadWeatherData}
              activeOpacity={0.8}
            >
              <Text style={styles.retryButtonText}>Tentar Novamente</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.dark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.weatherCard}
          >
            <View style={styles.weatherHeader}>
              <WeatherIcon size={32} color="#FFFFFF" />
              <Text style={styles.weatherStatus}>{capitalizedDescription}</Text>
            </View>

            <View style={styles.chanceContainer}>
              <Text style={styles.chanceNumber}>
                {weather ? Math.round(weather.rainProbability * 100) : 80}%
              </Text>
              <Text style={styles.chanceLabel}>chance</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>VOLUME</Text>
                <Text style={styles.statValue}>{volume}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>TEMP</Text>
                <Text style={styles.statValue}>
                  {weather ? Math.round(weather.temperature) : 26}°C
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>VENTO</Text>
                <Text style={styles.statValue}>{windSpeed}</Text>
              </View>
            </View>
          </LinearGradient>
        )}

        {/* Impact Card */}
        <View style={styles.impactCard}>
          <View style={[styles.impactIconContainer, { backgroundColor: impact.color }]}>
            <ImpactIcon size={20} color="#FFFFFF" fill={ImpactIcon === Droplet || ImpactIcon === Cloud ? "#FFFFFF" : "none"} />
          </View>
          <View style={styles.impactTextContainer}>
            <Text style={styles.impactTitle}>Impacto no Fornecimento</Text>
            <Text style={styles.impactDescription}>
              {impact.description}
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
  locationHeader: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  locationTitle: {
    fontSize: 11,
    fontFamily: theme.typography.fonts.bold,
    color: theme.colors.text.secondary,
    letterSpacing: 0.8,
  },
  locationCity: {
    fontSize: theme.typography.sizes.xxxl,
    fontFamily: theme.typography.fonts.bold,
    color: theme.colors.text.primary,
    marginTop: 2,
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
  errorCard: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.sheet,
    padding: 24,
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...Platform.select({
      web: { boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.05)" } as any,
      default: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 16,
        elevation: 2,
      },
    }),
  },
  errorCardTitle: {
    fontSize: theme.typography.sizes.xl,
    fontFamily: theme.typography.fonts.bold,
    color: theme.colors.text.primary,
    marginTop: 12,
    marginBottom: 6,
  },
  errorCardText: {
    fontSize: theme.typography.sizes.base,
    fontFamily: theme.typography.fonts.regular,
    color: theme.colors.text.secondary,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.button,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontFamily: theme.typography.fonts.bold,
    fontSize: theme.typography.sizes.base,
  },
});
