import { useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Platform,
  ScrollView,
  Keyboard,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Search, MapPin } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "../components/Button";
import { theme } from "../constants/theme";

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



interface AddressData {
  address: string;
  details: string;
  city: string;
  lat: number;
  lng: number;
}

const mockAddresses: AddressData[] = [
  {
    address: "Av. Boa Viagem, 1234",
    details: "Boa Viagem, Recife - PE, 51011-000",
    city: "Recife",
    lat: -8.1156,
    lng: -34.8924,
  },
  {
    address: "Rua do Hospício, 200",
    details: "Boa Vista, Recife - PE, 50060-080",
    city: "Recife",
    lat: -8.0585,
    lng: -34.8845,
  },
  {
    address: "Rua da Moeda, 50",
    details: "Bairro do Recife, Recife - PE, 50030-040",
    city: "Recife",
    lat: -8.0632,
    lng: -34.8711,
  },
  {
    address: "Av. Agamenon Magalhães, 2990",
    details: "Espinheiro, Recife - PE, 52020-000",
    city: "Recife",
    lat: -8.0495,
    lng: -34.8961,
  },
  {
    address: "Rua Amélia, 450",
    details: "Graças, Recife - PE, 52011-050",
    city: "Recife",
    lat: -8.0425,
    lng: -34.9015,
  },
  {
    address: "Estrada do Encanamento, 800",
    details: "Casa Forte, Recife - PE, 52070-000",
    city: "Recife",
    lat: -8.0315,
    lng: -34.9180,
  },
];

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
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#dcfce7" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#15803d" }],
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

export default function LocationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<any>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<AddressData>(() => {
    if (params.currentAddress) {
      const found = mockAddresses.find(
        (a) => a.address === params.currentAddress
      );
      if (found) {
        return found;
      } else {
        return {
          address: String(params.currentAddress),
          details: params.currentDetails ? String(params.currentDetails) : "",
          city: params.currentCity ? String(params.currentCity) : "Recife",
          lat: params.currentLat ? Number(params.currentLat) : -8.1156,
          lng: params.currentLng ? Number(params.currentLng) : -34.8924,
        };
      }
    }
    return mockAddresses[0];
  });

  const filteredSuggestions = mockAddresses.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.address.toLowerCase().includes(q) ||
      item.details.toLowerCase().includes(q)
    );
  });

  const handleSelectSuggestion = (addressItem: AddressData) => {
    setSelectedAddress(addressItem);
    setSearchQuery("");
    setShowSuggestions(false);
    Keyboard.dismiss();

    if (Platform.OS !== "web" && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: addressItem.lat,
          longitude: addressItem.lng,
          latitudeDelta: 0.008,
          longitudeDelta: 0.008,
        },
        500
      );
    }
  };

  const handleConfirmLocation = () => {
    router.navigate({
      pathname: "/(tabs)/relatar",
      params: {
        address: selectedAddress.address,
        details: selectedAddress.details,
        latitude: selectedAddress.lat,
        longitude: selectedAddress.lng,
        city: selectedAddress.city,
      },
    });
  };



  return (
    <View style={styles.container}>
      {/* 1. Header Navigation */}
      <View style={[styles.headerContainer, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#0056C6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Localização</Text>
        <View style={styles.headerRightSpacer} />
      </View>

      {/* 2. Map Background */}
      <View style={styles.mapContainer}>
        {Platform.OS === "web" ? (
          WebLocationMap && (
            <WebLocationMap
              lat={selectedAddress.lat}
              lng={selectedAddress.lng}
              centerLat={selectedAddress.lat}
              centerLng={selectedAddress.lng}
              onMapPress={(lat: number, lng: number) => {
                let closest = mockAddresses[0];
                let minDistance = Infinity;
                mockAddresses.forEach((addr) => {
                  const d = Math.pow(addr.lat - lat, 2) + Math.pow(addr.lng - lng, 2);
                  if (d < minDistance) {
                    minDistance = d;
                    closest = addr;
                  }
                });
                setSelectedAddress(closest);
              }}
            />
          )
        ) : (
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
              latitude: selectedAddress.lat,
              longitude: selectedAddress.lng,
              latitudeDelta: 0.008,
              longitudeDelta: 0.008,
            }}
            customMapStyle={mapStyle}
            onPress={(e: any) => {
              const { latitude, longitude } = e.nativeEvent.coordinate;
              let closest = mockAddresses[0];
              let minDistance = Infinity;
              mockAddresses.forEach((addr) => {
                const d = Math.pow(addr.lat - latitude, 2) + Math.pow(addr.lng - longitude, 2);
                if (d < minDistance) {
                  minDistance = d;
                  closest = addr;
                }
              });
              setSelectedAddress(closest);
            }}
          >
            <Marker
              coordinate={{
                latitude: selectedAddress.lat,
                longitude: selectedAddress.lng,
              }}
            >
              <View style={styles.nativeMarkerContainer}>
                <View style={styles.markerPin}>
                  <MapPin size={28} color="#FFFFFF" fill="#1070D0" />
                </View>
              </View>
            </Marker>
          </MapView>
        )}

        {/* 3. Floating Search Bar overlay */}
        <View style={styles.searchOverlayContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color="#94A3B8" style={styles.searchIcon} />
            <TextInput
              placeholder="Digite seu endereço ou CEP"
              placeholderTextColor="#94A3B8"
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                setShowSuggestions(text.trim().length > 0);
              }}
              onFocus={() => {
                if (searchQuery.trim().length > 0) setShowSuggestions(true);
              }}
            />
          </View>

          {/* Autocomplete Suggestions */}
          {showSuggestions && (
            <View style={styles.suggestionsContainer}>
              <ScrollView
                keyboardShouldPersistTaps="handled"
                style={styles.suggestionsScroll}
              >
                {filteredSuggestions.length > 0 ? (
                  filteredSuggestions.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.suggestionItem}
                      activeOpacity={0.7}
                      onPress={() => handleSelectSuggestion(item)}
                    >
                      <MapPin size={16} color="#64748B" style={styles.suggestionIcon} />
                      <View>
                        <Text style={styles.suggestionTitle}>{item.address}</Text>
                        <Text style={styles.suggestionSub}>{item.details}</Text>
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.noSuggestionItem}>
                    <Text style={styles.noSuggestionText}>Nenhum endereço encontrado</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      {/* 4. Confirmation Bottom Sheet */}
      <View style={[styles.bottomSheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.dragIndicator} />

        <View style={styles.sheetLabelContainer}>
          <MapPin size={16} color="#C2410C" fill="#FDBA74" style={styles.labelIcon} />
          <Text style={styles.sheetLabelText}>Selecione o endereço</Text>
        </View>

        <View style={styles.addressCard}>
          <Text style={styles.addressTitle}>{selectedAddress.address}</Text>
          <Text style={styles.addressSubtitle}>{selectedAddress.details}</Text>
        </View>

        <Button
          title="Confirmar Localização"
          onPress={handleConfirmLocation}
          variant="primary"
        />
      </View>
    </View>
  );
}

const cardShadow = Platform.select({
  web: { boxShadow: "0px 8px 24px rgba(0,0,0,0.08)" } as any,
  default: {
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0056C6",
    fontFamily: "Inter_700Bold",
  },
  headerRightSpacer: {
    width: 40,
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  map: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  webMap: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#E2E8F0",
    overflow: "hidden",
  },

  webStreet: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    opacity: 0.85,
  },
  webStreetThin: {
    position: "absolute",
    borderStyle: "solid",
    borderWidth: 0.5,
    borderColor: "#FFFFFF",
    opacity: 0.6,
  },
  webPark: {
    position: "absolute",
    left: "15%",
    top: "35%",
    width: 120,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#DCFCE7",
    opacity: 0.7,
  },
  webWater: {
    position: "absolute",
    right: -20,
    top: 0,
    bottom: 0,
    width: "25%",
    backgroundColor: "#E0F2FE",
    opacity: 0.85,
    borderTopLeftRadius: 100,
    borderBottomLeftRadius: 100,
  },
  webMarker: {
    position: "absolute",
    width: 36,
    height: 36,
    marginLeft: -18,
    marginTop: -36,
    alignItems: "center",
    justifyContent: "center",
  },
  nativeMarkerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  markerPin: {
    backgroundColor: theme.colors.primary,
    padding: 6,
    borderRadius: 20,
    ...cardShadow,
  },
  markerPulse: {
    position: "absolute",
    bottom: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    opacity: 0.4,
  },
  searchOverlayContainer: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 54,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...cardShadow,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: theme.typography.sizes.lg,
    fontFamily: theme.typography.fonts.regular,
    color: theme.colors.text.primary,
  },
  suggestionsContainer: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 12,
    marginTop: 6,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    overflow: "hidden",
    ...cardShadow,
  },
  suggestionsScroll: {
    flexGrow: 0,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  suggestionIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  suggestionTitle: {
    fontSize: 15,
    fontFamily: theme.typography.fonts.bold,
    color: theme.colors.text.primary,
  },
  suggestionSub: {
    fontSize: 13,
    fontFamily: theme.typography.fonts.regular,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  noSuggestionItem: {
    padding: 16,
    alignItems: "center",
  },
  noSuggestionText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  bottomSheet: {
    backgroundColor: theme.colors.cardBackground,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 8,
    ...cardShadow,
  },
  dragIndicator: {
    width: 48,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: theme.colors.border,
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  sheetLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  labelIcon: {
    marginRight: 6,
  },
  sheetLabelText: {
    fontSize: 13,
    fontFamily: theme.typography.fonts.bold,
    color: theme.colors.status.warning,
    letterSpacing: 0.6,
  },
  addressCard: {
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    marginBottom: 20,
  },
  addressTitle: {
    fontSize: theme.typography.sizes.xl,
    fontFamily: theme.typography.fonts.bold,
    color: theme.colors.text.primary,
  },
  addressSubtitle: {
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fonts.regular,
    color: theme.colors.text.secondary,
    marginTop: 4,
  },
  // Confirm button styles have been extracted to Button component
  manualButton: {
    alignItems: "center",
    paddingVertical: 8,
    marginBottom: 8,
  },
  manualButtonText: {
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.lg,
    fontFamily: theme.typography.fonts.semiBold,
  },
});
