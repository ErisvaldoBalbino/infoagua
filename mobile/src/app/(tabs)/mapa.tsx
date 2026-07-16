import { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Compass,
  Droplet,
  Wrench,
  AlertTriangle,
  CheckCircle,
} from "lucide-react-native";
import { OccurrenceBottomSheet } from "../../components/OccurrenceBottomSheet";
import { theme } from "../../constants/theme";
import { occurrencesService, OccurrenceMapPin } from "../../services/api/occurrences.service";
import { reverseGeocode, GeocodeResult } from "../../utils/location";
import { AddressSearchBar } from "../../components/AddressSearchBar";
import { formatTimeAgo } from "../../utils/occurrence-utils";
import { Alert } from "../../utils/alert";

let WebMapView: any = null;
if (Platform.OS === "web") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  WebMapView = require("@/components/WebMapView").default;
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

interface OccurrenceDetail {
  id: string;
  type: "shortage" | "leak" | "quality" | "return";
  title: string;
  description: string;
  address: string;
  city: string;
  timeAgo: string;
  likesCount: number;
  commentsCount: number;
  latitude: number;
  longitude: number;
}

const mapStyle = [
  {
    elementType: "geometry",
    stylers: [{ color: "#f1f5f9" }],
  },
  {
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }],
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
    featureType: "poi",
    elementType: "all",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    elementType: "all",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#dcfce7" }, { visibility: "on" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#15803d" }, { visibility: "on" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#e2e8f0" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#e0f2fe" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#0284c7" }],
  },
];

const INITIAL_REGION = {
  latitude: -5.7945,
  longitude: -35.2110,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

export default function MapTab() {
  const router = useRouter();
  const mapRef = useRef<any>(null);
  const insets = useSafeAreaInsets();

  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [selectedOccurrence, setSelectedOccurrence] = useState<OccurrenceDetail | null>(null);
  const [pins, setPins] = useState<OccurrenceMapPin[]>([]);
  const [webMapCenter, setWebMapCenter] = useState<{ lat: number; lng: number } | undefined>(undefined);

  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const justSelectedMarker = useRef(false);
  const closeTimeoutRef = useRef<any>(null);
  const latestRequestId = useRef(0);
  const selectedPinIdRef = useRef<string | null>(null);

  const categories = [
    { type: "shortage", label: "Falta d'água", color: theme.colors.status.danger, bg: theme.colors.status.dangerBg, Icon: Droplet },
    { type: "leak", label: "Vazamento", color: theme.colors.status.warning, bg: theme.colors.status.warningBg, Icon: Wrench },
    { type: "quality", label: "Qualidade", color: theme.colors.status.success, bg: theme.colors.status.successBg, Icon: AlertTriangle },
    { type: "return", label: "Retorno", color: theme.colors.primary, bg: theme.colors.lightBg, Icon: CheckCircle },
  ];

  const fetchPins = async (params?: any) => {
    const requestId = ++latestRequestId.current;
    try {
      const data = await occurrencesService.findForMap(params);
      if (requestId === latestRequestId.current) {
        setPins(data);
      }
    } catch (error) {
      if (params) {
        console.error("Error updating pins on region change:", error);
      } else {
        console.error("Error loading map pins:", error);
      }
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPins();
  }, []);

  const handleRegionChangeComplete = async (region: any) => {
    if (Platform.OS === "web") return;
    const minLat = region.latitude - region.latitudeDelta / 2;
    const maxLat = region.latitude + region.latitudeDelta / 2;
    const minLng = region.longitude - region.longitudeDelta / 2;
    const maxLng = region.longitude + region.longitudeDelta / 2;
    
    fetchPins({
      minLat,
      maxLat,
      minLng,
      maxLng,
      limit: 100
    });
  };

  const handleSelectSuggestion = (addressItem: GeocodeResult) => {
    if (selectedOccurrence) handleCloseDetails();
    if (Platform.OS !== "web" && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: addressItem.lat,
          longitude: addressItem.lng,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        },
        600
      );
    } else if (Platform.OS === "web") {
      setWebMapCenter({ lat: addressItem.lat, lng: addressItem.lng });
    }
  };

  const filteredPins = pins.filter((pin) => {
    if (selectedFilter && pin.type !== selectedFilter) return false;
    return true;
  });

  const handleSelectOccurrence = async (pin: OccurrenceMapPin) => {
    selectedPinIdRef.current = pin.id;
    justSelectedMarker.current = true;
    setTimeout(() => {
      justSelectedMarker.current = false;
    }, 600);

    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    setSelectedOccurrence({
      id: pin.id,
      type: pin.type as any,
      title: getCategoryDetails(pin.type).label,
      description: "Carregando descrição...",
      address: "Carregando endereço...",
      city: "",
      timeAgo: "Carregando...",
      likesCount: 0,
      commentsCount: 0,
      latitude: pin.latitude,
      longitude: pin.longitude,
    });
    setIsBottomSheetVisible(true);

    try {
      const data = await occurrencesService.findById(pin.id);
      if (selectedPinIdRef.current !== pin.id) return;
      
      let addressStr = "Endereço indisponível";
      try {
        const resolved = await reverseGeocode(Number(data.latitude), Number(data.longitude));
        addressStr = resolved.address;
      } catch (err) {
        console.warn("Reverse geocode failed for map pin:", err);
      }

      if (selectedPinIdRef.current !== pin.id) return;

      setSelectedOccurrence({
        id: data.id,
        type: data.type,
        title: getCategoryDetails(data.type).label,
        description: data.description || "Nenhuma descrição fornecida.",
        address: addressStr,
        city: data.city,
        timeAgo: formatTimeAgo(data.createdAt),
        likesCount: data.likesCount,
        commentsCount: data.commentsCount,
        latitude: Number(data.latitude),
        longitude: Number(data.longitude),
      });
    } catch (error) {
      if (selectedPinIdRef.current !== pin.id) return;
      console.error("Error loading pin details:", error);
      Alert.alert("Erro", "Não foi possível carregar os detalhes do relato.");
      setIsBottomSheetVisible(false);
    }

    if (Platform.OS !== "web" && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: pin.latitude,
          longitude: pin.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        },
        500
      );
    } else if (Platform.OS === "web") {
      setWebMapCenter({ lat: pin.latitude, lng: pin.longitude });
    }
  };

  const handleCloseDetails = () => {
    if (justSelectedMarker.current) {
      return;
    }
    setIsBottomSheetVisible(false);
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      setSelectedOccurrence(null);
      closeTimeoutRef.current = null;
    }, 250);
  };

  const handleRecenter = () => {
    if (Platform.OS !== "web" && mapRef.current) {
      mapRef.current.animateToRegion(INITIAL_REGION, 600);
    } else if (Platform.OS === "web") {
      setWebMapCenter({ lat: INITIAL_REGION.latitude, lng: INITIAL_REGION.longitude });
    }
  };

  const getCategoryDetails = (type: string) => {
    return categories.find((c) => c.type === type) || categories[0];
  };

  const renderIcon = (type: string, color: string, size = 18) => {
    switch (type) {
      case "shortage":
        return <Droplet size={size} color={color} />;
      case "leak":
        return <Wrench size={size} color={color} />;
      case "quality":
        return <AlertTriangle size={size} color={color} />;
      case "return":
        return <CheckCircle size={size} color={color} />;
      default:
        return <AlertTriangle size={size} color={color} />;
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. Map Component */}
      {Platform.OS === "web" ? (
        <View style={styles.map}>
          {WebMapView && (
            <WebMapView
              initialLat={INITIAL_REGION.latitude}
              initialLng={INITIAL_REGION.longitude}
              initialZoom={14}
              centerLat={webMapCenter?.lat}
              centerLng={webMapCenter?.lng}
              markers={filteredPins.map((pin) => ({
                id: pin.id,
                latitude: pin.latitude,
                longitude: pin.longitude,
                color: getCategoryDetails(pin.type).color,
                icon: renderIcon(pin.type, "#FFFFFF", 16),
              }))}
              onMarkerPress={(id: string) => {
                const pin = filteredPins.find((p) => p.id === id);
                if (pin) handleSelectOccurrence(pin);
              }}
              onMapPress={handleCloseDetails}
            />
          )}
        </View>
      ) : !MapView ? null : (
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={INITIAL_REGION}
          customMapStyle={mapStyle}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsZoomControls={false}
          showsCompass={false}
          toolbarEnabled={false}
          onPress={handleCloseDetails}
          onRegionChangeComplete={handleRegionChangeComplete}
        >
          {filteredPins.map((pin) => {
            const config = getCategoryDetails(pin.type);
            return (
              <Marker
                key={pin.id}
                coordinate={{ latitude: pin.latitude, longitude: pin.longitude }}
                onPress={(e: any) => {
                  e.stopPropagation();
                  handleSelectOccurrence(pin);
                }}
              >
                <View style={[styles.markerCircle, { backgroundColor: config.color }]}>
                  {renderIcon(pin.type, "#FFFFFF", 18)}
                </View>
              </Marker>
            );
          })}
        </MapView>
      )}

      {/* 2. Top Header Overlays (Search Bar & Filters) */}
      <View
        style={[
          styles.topOverlayContainer,
          { paddingTop: Math.max(insets.top, 20) },
          Platform.OS === "web" && { pointerEvents: "box-none" } as any
        ]}
        pointerEvents={Platform.OS === "web" ? undefined : "box-none"}
      >
        {/* Search Bar */}
        <AddressSearchBar
          placeholder="Buscar cidade, bairro ou rua..."
          onSelectAddress={handleSelectSuggestion}
        />

        {/* Scrollable Filter Pills */}
        <View
          style={[
            styles.filtersContainer,
            Platform.OS === "web" && { pointerEvents: "box-none" } as any
          ]}
          pointerEvents={Platform.OS === "web" ? undefined : "box-none"}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersScrollContent}
          >

            {/* Category filters */}
            {categories.map((cat) => {
              const isSelected = selectedFilter === cat.type;
              const IconComp = cat.Icon;
              return (
                <TouchableOpacity
                  key={cat.type}
                  style={[
                    styles.filterPill,
                    { borderColor: cat.color },
                    isSelected && { backgroundColor: cat.color },
                  ]}
                  activeOpacity={0.8}
                  onPress={() => {
                    setSelectedFilter(isSelected ? null : cat.type);
                    if (selectedOccurrence) handleCloseDetails();
                  }}
                >
                  <IconComp size={15} color={isSelected ? "#FFFFFF" : cat.color} />
                  <Text
                    style={[
                      styles.filterPillText,
                      { color: isSelected ? "#FFFFFF" : "#1E293B" },
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>

      {/* 3. Floating Action Buttons (GPS & Add Occurrence) */}
      <View style={styles.fabsContainer}>
        {Platform.OS !== "web" && (
          <TouchableOpacity
            style={styles.fabGps}
            activeOpacity={0.8}
            onPress={handleRecenter}
          >
            <Compass size={22} color="#1E293B" />
          </TouchableOpacity>
        )}
      </View>

      {/* 4. Slide-up Details Bottom Sheet */}
      <OccurrenceBottomSheet
        occurrence={
          selectedOccurrence
            ? {
                id: selectedOccurrence.id,
                type: selectedOccurrence.type,
                title: selectedOccurrence.title,
                description: selectedOccurrence.description,
                address: selectedOccurrence.address,
                likesCount: selectedOccurrence.likesCount,
                commentsCount: selectedOccurrence.commentsCount,
                timeAgo: selectedOccurrence.timeAgo,
              }
            : null
        }
        visible={isBottomSheetVisible}
        onClose={handleCloseDetails}
        onViewDetails={() => {
          if (selectedOccurrence) {
            handleCloseDetails();
            router.push({
              pathname: "/detalhes/[id]",
              params: { id: selectedOccurrence.id },
            });
          }
        }}
      />
    </View>
  );
}

const viewShadow = Platform.select({
  web: { boxShadow: "0px 4px 16px rgba(0, 0, 0, 0.08)" } as any,
  default: {
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  map: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  webMapContainer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#F1F5F9",
    overflow: "hidden",
  },
  webStreet: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    opacity: 0.9,
  },
  webPark: {
    position: "absolute",
    right: 30,
    top: "22%",
    width: 150,
    height: 180,
    borderRadius: 75,
    backgroundColor: "#DCFCE7",
    opacity: 0.8,
  },
  webWater: {
    position: "absolute",
    right: -40,
    bottom: -40,
    width: 220,
    height: 250,
    borderTopLeftRadius: 140,
    backgroundColor: "#E0F2FE",
    opacity: 0.9,
  },
  webMarker: {
    position: "absolute",
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2.5,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    cursor: "pointer",
  },
  webMarkerSelected: {
    transform: [{ scale: 1.15 }],
    borderWidth: 3,
    borderColor: "#1E293B",
  },
  markerCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2.5,
    borderColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  topOverlayContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    gap: 12,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 54,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...viewShadow,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fonts.regular,
  },
  voiceButton: {
    padding: 6,
  },
  filtersContainer: {
    width: "100%",
  },
  filtersScrollContent: {
    gap: 8,
    paddingRight: 20,
  },
  filterPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.cardBackground,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    gap: 6,
    height: 38,
  },
  filterPillActiveAll: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterPillText: {
    fontSize: theme.typography.sizes.md,
    fontWeight: "600",
    color: theme.colors.text.secondary,
    fontFamily: theme.typography.fonts.semiBold,
  },
  filterPillTextActive: {
    color: theme.colors.text.light,
  },
  fabsContainer: {
    position: "absolute",
    right: 16,
    bottom: 104,
    alignItems: "center",
    gap: 12,
  },
  fabGps: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.cardBackground,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...viewShadow,
  },
  fabAdd: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    ...viewShadow,
  },
});
