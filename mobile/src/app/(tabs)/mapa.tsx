import { useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Search,
  Compass,
  Droplet,
  Wrench,
  AlertTriangle,
} from "lucide-react-native";
import { OccurrenceBottomSheet } from "../../components/OccurrenceBottomSheet";
import { theme } from "../../constants/theme";

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

// Dimensions and Animated are now handled inside the components.

interface Occurrence {
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
  webX: number;
  webY: number;
}

const mockOccurrences: Occurrence[] = [
  {
    id: "1",
    type: "shortage",
    title: "Falta D'Água",
    description: "Sem água desde ontem de manhã na rua inteira.",
    address: "Rua Marquês de Abrantes, Flamengo",
    city: "Rio de Janeiro",
    timeAgo: "Há 45 min",
    likesCount: 15,
    commentsCount: 6,
    latitude: -22.9284,
    longitude: -43.1780,
    webX: 62,
    webY: 22,
  },
  {
    id: "2",
    type: "shortage",
    title: "Falta D'Água",
    description: "Pressão fraca e depois cortou por completo.",
    address: "Rua Senador Vergueiro, Flamengo",
    city: "Rio de Janeiro",
    timeAgo: "Há 2 h",
    likesCount: 8,
    commentsCount: 2,
    latitude: -22.9340,
    longitude: -43.1790,
    webX: 22,
    webY: 33,
  },
  {
    id: "3",
    type: "shortage",
    title: "Falta D'Água",
    description: "Abastecimento suspenso para manutenção programada.",
    address: "Avenida Rui Barbosa, Flamengo",
    city: "Rio de Janeiro",
    timeAgo: "Há 4 h",
    likesCount: 11,
    commentsCount: 3,
    latitude: -22.9375,
    longitude: -43.1730,
    webX: 72,
    webY: 41,
  },
  {
    id: "4",
    type: "leak",
    title: "Vazamento",
    description: "Cano estourado na calçada, jorrando muita água limpa.",
    address: "Avenida Oswaldo Cruz, Botafogo",
    city: "Rio de Janeiro",
    timeAgo: "Há 1 h",
    likesCount: 24,
    commentsCount: 9,
    latitude: -22.9435,
    longitude: -43.1785,
    webX: 38,
    webY: 49,
  },
  {
    id: "5",
    type: "quality",
    title: "Qualidade da Água",
    description: "Água saindo muito turva e com cheiro forte de barro.",
    address: "Rua Voluntários da Pátria, Botafogo",
    city: "Rio de Janeiro",
    timeAgo: "Há 3 h",
    likesCount: 12,
    commentsCount: 4,
    latitude: -22.9515,
    longitude: -43.1850,
    webX: 48,
    webY: 62,
  },
  {
    id: "6",
    type: "quality",
    title: "Qualidade da Água",
    description: "Água com coloração escura/marrom direto da torneira.",
    address: "Rua Nelson Mandela, Botafogo",
    city: "Rio de Janeiro",
    timeAgo: "Há 5 h",
    likesCount: 19,
    commentsCount: 7,
    latitude: -22.9500,
    longitude: -43.1810,
    webX: 82,
    webY: 68,
  },
  {
    id: "7",
    type: "leak",
    title: "Vazamento",
    description: "Vazamento oculto no asfalto criando buraco na via.",
    address: "Rua São Clemente, Botafogo",
    city: "Rio de Janeiro",
    timeAgo: "Há 8 h",
    likesCount: 5,
    commentsCount: 1,
    latitude: -22.9560,
    longitude: -43.1910,
    webX: 25,
    webY: 79,
  },
];

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
  latitude: -22.9410,
  longitude: -43.1810,
  latitudeDelta: 0.038,
  longitudeDelta: 0.038,
};

export default function MapTab() {
  const router = useRouter();
  const mapRef = useRef<any>(null);
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [selectedOccurrence, setSelectedOccurrence] = useState<Occurrence | null>(null);

  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const justSelectedMarker = useRef(false);
  const closeTimeoutRef = useRef<any>(null);

  const categories = [
    { type: "shortage", label: "Falta d'água", color: theme.colors.status.danger, bg: theme.colors.status.dangerBg, Icon: Droplet },
    { type: "leak", label: "Vazamento", color: theme.colors.status.warning, bg: theme.colors.status.warningBg, Icon: Wrench },
    { type: "quality", label: "Qualidade", color: theme.colors.status.success, bg: theme.colors.status.successBg, Icon: AlertTriangle },
  ];

  const filteredOccurrences = mockOccurrences.filter((occ) => {
    if (selectedFilter && occ.type !== selectedFilter) return false;
    if (searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase();
      return (
        occ.address.toLowerCase().includes(query) ||
        occ.description.toLowerCase().includes(query) ||
        occ.city.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const handleSelectOccurrence = (occurrence: Occurrence) => {
    justSelectedMarker.current = true;
    setTimeout(() => {
      justSelectedMarker.current = false;
    }, 600);

    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    setSelectedOccurrence(occurrence);
    setIsBottomSheetVisible(true);

    if (Platform.OS !== "web" && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: occurrence.latitude,
          longitude: occurrence.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        },
        500
      );
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
              markers={filteredOccurrences.map((occ) => ({
                id: occ.id,
                latitude: occ.latitude,
                longitude: occ.longitude,
                color: getCategoryDetails(occ.type).color,
                icon: renderIcon(occ.type, "#FFFFFF", 16),
              }))}
              onMarkerPress={(id: string) => {
                const occ = filteredOccurrences.find((o) => o.id === id);
                if (occ) handleSelectOccurrence(occ);
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
        >
          {filteredOccurrences.map((occ) => {
            const config = getCategoryDetails(occ.type);
            return (
              <Marker
                key={occ.id}
                coordinate={{ latitude: occ.latitude, longitude: occ.longitude }}
                onPress={(e: any) => {
                  e.stopPropagation();
                  handleSelectOccurrence(occ);
                }}
              >
                <View style={[styles.markerCircle, { backgroundColor: config.color }]}>
                  {renderIcon(occ.type, "#FFFFFF", 18)}
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
        <View style={styles.searchBarContainer}>
          <Search size={20} color="#94A3B8" style={styles.searchIcon} />
          <TextInput
            placeholder="Buscar cidade, bairro ou rua..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              if (selectedOccurrence) handleCloseDetails();
            }}
          />
        </View>

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
