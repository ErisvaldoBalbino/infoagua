import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  ScrollView,
  Platform,
  Image,
} from "react-native";
import { Alert } from "../../utils/alert";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";

import { useAuth } from "../../context/AuthContext";
import { occurrencesService, OccurrenceResponse } from "../../services/api/occurrences.service";
import {
  MapPin,
  MessageSquare,
  ThumbsUp,
  Map,
  AlertTriangle,
} from "lucide-react-native";
import { ErrorState } from "../../components/ErrorState";
import { CustomHeader } from "../../components/CustomHeader";
import { ActionButton } from "../../components/ActionButton";
import { theme } from "../../constants/theme";
import {
  typeBadgeBgs,
  typeColors,
  typeLabels,
  typeIcons,
  formatTimeAgo,
} from "../../utils/occurrence-utils";
import { reverseGeocode } from "../../utils/location";

let WebLocationMap: any = null;
if (Platform.OS === "web") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  WebLocationMap = require("@/components/WebMapView").WebLocationMap;
}

let MapView: any;
let Marker: any;
let PROVIDER_GOOGLE: any;

if (Platform.OS !== "web") {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Maps = require("react-native-maps");
    MapView = Maps.default;
    Marker = Maps.Marker;
    PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
  } catch (e) {
    console.warn("Failed to load react-native-maps. Running in Web fallback mode.", e);
  }
}

const mapStyle = [
  {
    elementType: "geometry",
    stylers: [{ color: "#f1f5f9" }],
  },
  {
    elementType: "labels.icon",
    stylers: [{ visibility: "on" }, { opacity: 0.35 }],
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#64748b" }],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#f1f5f9" }],
  },
  {
    featureType: "administrative.land_parcel",
    elementType: "labels.text.fill",
    stylers: [{ color: "#bdbdbd" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#eeeeee" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#757575" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#e2e8f0" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9e9e9e" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "road.arterial",
    elementType: "labels.text.fill",
    stylers: [{ color: "#757575" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#dadada" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#616161" }],
  },
  {
    featureType: "road.local",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9e9e9e" }],
  },
  {
    featureType: "transit.line",
    elementType: "geometry",
    stylers: [{ color: "#e5e5e5" }],
  },
  {
    featureType: "transit.station",
    elementType: "geometry",
    stylers: [{ color: "#eeeeee" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#c9e2ff" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9e9e9e" }],
  },
];

export default function DetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { isAuthenticated } = useAuth();

  const [occurrence, setOccurrence] = useState<OccurrenceResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLiked, setHasLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [retryTrigger, setRetryTrigger] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [addressInfo, setAddressInfo] = useState<{ address: string; details: string }>({
    address: "Carregando endereço...",
    details: "",
  });

  useEffect(() => {
    async function loadDetails() {
      try {
        setHasError(false);
        if (typeof id === "string") {
          const data = await occurrencesService.findById(id);
          setOccurrence(data);
          setLikesCount(data.likesCount);

          try {
            const resolved = await reverseGeocode(Number(data.latitude), Number(data.longitude));
            setAddressInfo({
              address: resolved.address,
              details: resolved.details,
            });
          } catch (e) {
            console.warn("Reverse geocoding failed in details screen:", e);
            setAddressInfo({
              address: `Ponto próximo a lat/lng: ${Number(data.latitude).toFixed(4)}, ${Number(data.longitude).toFixed(4)}`,
              details: data.city,
            });
          }
        }
      } catch (error) {
        console.error("Error loading occurrence details:", error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    }
    loadDetails();
  }, [id, retryTrigger]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      Alert.alert(
        "Acesso Restrito",
        "Para curtir relatos de ocorrências, você precisa estar conectado à sua conta.",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Fazer Login",
            onPress: () => router.push("/(auth)/login"),
          },
        ]
      );
      return;
    }

    if (!occurrence) return;
    if (isLiking) return;

    const newHasLiked = !hasLiked;
    setIsLiking(true);
    setHasLiked(newHasLiked);
    setLikesCount((prev) => (newHasLiked ? prev + 1 : prev - 1));

    try {
      const result = await occurrencesService.toggleLike(occurrence.id);
      setHasLiked(result.liked);
    } catch (error) {
      console.error("Error liking occurrence:", error);
      setHasLiked(!newHasLiked);
      setLikesCount((prev) => (newHasLiked ? prev - 1 : prev + 1));
      Alert.alert("Erro", "Não foi possível curtir o relato.");
    } finally {
      setIsLiking(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (hasError) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <CustomHeader title="Detalhes" />
        <ErrorState
          title="Falha ao carregar detalhes"
          message="Não foi possível carregar os detalhes do relato."
          onRetry={() => {
            setIsLoading(true);
            setRetryTrigger((prev) => prev + 1);
          }}
        />
      </View>
    );
  }

  if (!occurrence) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <CustomHeader title="Detalhes" />
        <View style={styles.notFoundContainer}>
          <Text style={styles.errorText}>Ocorrência não encontrada.</Text>
        </View>
      </View>
    );
  }

  const badgeBg = typeBadgeBgs[occurrence.type] || "#F3F4F6";
  const badgeColor = typeColors[occurrence.type] || "#6B7280";
  const badgeLabel = typeLabels[occurrence.type] || occurrence.type;
  const IconComponent = typeIcons[occurrence.type] || AlertTriangle;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <CustomHeader title="Detalhes" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Category and Time Row */}
        <View style={styles.categoryTimeRow}>
          <View style={styles.badgeContainer}>
            <IconComponent size={18} color={badgeColor} style={styles.badgeIcon} />
            <View style={[styles.badgePill, { backgroundColor: badgeBg }]}>
              <Text style={[styles.badgeText, { color: badgeColor }]}>
                {badgeLabel.toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={styles.timeAgoText}>{formatTimeAgo(occurrence.createdAt)}</Text>
        </View>

        {/* Map Card */}
        <View style={styles.mapCard}>
          {Platform.OS === "web" ? (
            <View style={styles.map}>
              {WebLocationMap && (
                <WebLocationMap
                  lat={Number(occurrence.latitude)}
                  lng={Number(occurrence.longitude)}
                />
              )}
            </View>
          ) : !MapView ? (
            <View style={styles.map} />
          ) : (
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              initialRegion={{
                latitude: Number(occurrence.latitude),
                longitude: Number(occurrence.longitude),
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
              customMapStyle={mapStyle}
              scrollEnabled={false}
              zoomEnabled={false}
              pitchEnabled={false}
              rotateEnabled={false}
            >
              <Marker
                coordinate={{
                  latitude: Number(occurrence.latitude),
                  longitude: Number(occurrence.longitude),
                }}
              >
                <View style={styles.markerWrapper}>
                  <MapPin size={32} color="#0056C6" fill="#0056C6" />
                </View>
              </Marker>
            </MapView>
          )}

          {/* Address Information */}
          <View style={styles.addressSection}>
            <View style={styles.addressIconContainer}>
              <Map size={20} color="#0056C6" />
            </View>
            <View style={styles.addressTextContainer}>
              <Text style={styles.addressTitle} numberOfLines={1}>
                {addressInfo.address}
              </Text>
              <Text style={styles.addressSubtitle} numberOfLines={1}>
                {addressInfo.details}
              </Text>
            </View>
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionHeader}>DESCRIÇÃO</Text>
        </View>
        <View style={styles.descriptionBox}>
          <Text style={styles.descriptionText}>
            {occurrence.description || "Nenhuma descrição detalhada fornecida."}
          </Text>
        </View>

        {/* Evidence Section (Conditional) */}
        {occurrence.photoUrl ? (
          <View style={styles.evidenceSection}>
            <View style={styles.sectionHeaderContainer}>
              <Text style={styles.sectionHeader}>EVIDÊNCIAS</Text>
            </View>
            <Image
              source={{ uri: occurrence.photoUrl }}
              style={styles.evidenceImage}
              resizeMode="cover"
            />
          </View>
        ) : null}

        <View style={styles.actionsRow}>
          <ActionButton
            icon={<ThumbsUp size={20} color={hasLiked ? "#0056C6" : "#475569"} fill={hasLiked ? "#E2E8F0" : "none"} />}
            count={likesCount}
            label={likesCount === 1 ? "Confirmação" : "Confirmações"}
            onPress={handleLike}
            disabled={isLiking}
          />

          <ActionButton
            icon={<MessageSquare size={20} color="#475569" />}
            count={occurrence.commentsCount}
            label={occurrence.commentsCount === 1 ? "Comentário" : "Comentários"}
            onPress={() => router.push({ pathname: "/comentarios/[id]", params: { id: occurrence.id } })}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  categoryTimeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  badgeIcon: {
    marginRight: 6,
  },
  badgePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.squircle,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: theme.typography.fonts.bold,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  timeAgoText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    fontFamily: theme.typography.fonts.medium,
    fontWeight: "500",
  },
  mapCard: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
    marginBottom: 20,
    ...Platform.select({
      web: { boxShadow: "0px 4px 12px rgba(0,0,0,0.05)" } as any,
      default: {
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 2,
      },
    }),
  },
  map: {
    width: "100%",
    height: 180,
  },
  markerWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  webMapContainer: {
    width: "100%",
    height: 180,
    backgroundColor: theme.colors.borderLight,
    position: "relative",
    overflow: "hidden",
  },
  webStreet: {
    position: "absolute",
    backgroundColor: theme.colors.cardBackground,
  },
  webPark: {
    position: "absolute",
    top: 20,
    left: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E6F4EA",
  },
  webWater: {
    position: "absolute",
    bottom: -10,
    right: -10,
    width: 100,
    height: 80,
    borderTopLeftRadius: 60,
    backgroundColor: theme.colors.lightBg,
  },
  webMarkerContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -16,
    marginTop: -32,
    alignItems: "center",
    justifyContent: "center",
  },
  addressSection: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
    backgroundColor: theme.colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  addressIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: theme.colors.lightBg,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  addressTextContainer: {
    flex: 1,
  },
  addressTitle: {
    fontSize: theme.typography.sizes.base,
    fontWeight: "600",
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fonts.semiBold,
  },
  addressSubtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    fontFamily: theme.typography.fonts.regular,
    marginTop: 2,
  },
  sectionHeaderContainer: {
    marginTop: 20,
    marginBottom: 8,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.text.secondary,
    fontFamily: theme.typography.fonts.semiBold,
    letterSpacing: 1,
  },
  descriptionBox: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fonts.regular,
    lineHeight: 22,
  },
  evidenceSection: {
    marginBottom: 8,
  },
  evidenceImage: {
    width: "100%",
    height: 220,
    borderRadius: 12,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 24,
    marginBottom: 20,
  },
  errorText: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text.secondary,
    textAlign: "center",
    fontFamily: theme.typography.fonts.regular,
  },
});
