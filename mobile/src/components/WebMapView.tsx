import React, { useCallback } from "react";
import { View, StyleSheet } from "react-native";
import {
  GoogleMap,
  useJsApiLoader,
  OverlayView,
} from "@react-google-maps/api";

const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "";

const mapStyle = [
  { elementType: "geometry", stylers: [{ color: "#f1f5f9" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#64748b" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f1f5f9" }] },
  { featureType: "poi", elementType: "all", stylers: [{ visibility: "off" }] },
  { featureType: "transit", elementType: "all", stylers: [{ visibility: "off" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#dcfce7" }, { visibility: "on" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#15803d" }, { visibility: "on" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#e2e8f0" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#e0f2fe" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#0284c7" }] },
];

export interface WebMarkerData {
  id: string;
  latitude: number;
  longitude: number;
  color: string;
  icon: React.ReactNode;
}

interface WebMapViewProps {
  initialLat: number;
  initialLng: number;
  initialZoom?: number;
  markers?: WebMarkerData[];
  onMarkerPress?: (id: string) => void;
  onMapPress?: (lat: number, lng: number) => void;
  children?: React.ReactNode;
  centerLat?: number;
  centerLng?: number;
}

export default function WebMapView({
  initialLat,
  initialLng,
  initialZoom = 14,
  markers = [],
  onMarkerPress,
  onMapPress,
  centerLat,
  centerLng,
}: WebMapViewProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: API_KEY,
  });

  const [map, setMap] = React.useState<google.maps.Map | null>(null);

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  React.useEffect(() => {
    if (map && centerLat !== undefined && centerLng !== undefined) {
      map.panTo({ lat: centerLat, lng: centerLng });
    }
  }, [map, centerLat, centerLng]);

  if (loadError) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorBox} />
      </View>
    );
  }

  if (!isLoaded) {
    return <View style={styles.loadingContainer} />;
  }

  return (
    <GoogleMap
      mapContainerStyle={{ width: "100%", height: "100%" }}
      center={{ lat: initialLat, lng: initialLng }}
      zoom={initialZoom}
      options={{
        styles: mapStyle,
        disableDefaultUI: true,
        zoomControl: false,
        gestureHandling: "greedy",
      }}
      onLoad={onLoad}
      onUnmount={onUnmount}
      onClick={(e) => {
        if (onMapPress && e.latLng) {
          onMapPress(e.latLng.lat(), e.latLng.lng());
        }
      }}
    >
      {markers.map((marker) => (
        <OverlayView
          key={marker.id}
          position={{ lat: marker.latitude, lng: marker.longitude }}
          mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
        >
          <div
            onClick={(e) => {
              e.stopPropagation();
              e.nativeEvent?.stopPropagation();
              onMarkerPress?.(marker.id);
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              e.nativeEvent?.stopPropagation();
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              e.nativeEvent?.stopPropagation();
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
              e.nativeEvent?.stopPropagation();
            }}
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              backgroundColor: marker.color,
              border: "2.5px solid white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              transform: "translate(-50%, -50%)",
            }}
          >
            {marker.icon}
          </div>
        </OverlayView>
      ))}
    </GoogleMap>
  );
}

interface WebLocationMapProps {
  lat: number;
  lng: number;
  onMapPress?: (lat: number, lng: number) => void;
  centerLat?: number;
  centerLng?: number;
}

export function WebLocationMap({ lat, lng, onMapPress, centerLat, centerLng }: WebLocationMapProps) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: API_KEY,
  });

  const [map, setMap] = React.useState<google.maps.Map | null>(null);

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  React.useEffect(() => {
    if (map && centerLat !== undefined && centerLng !== undefined) {
      map.panTo({ lat: centerLat, lng: centerLng });
    }
  }, [map, centerLat, centerLng]);

  if (!isLoaded) return <View style={styles.loadingContainer} />;

  return (
    <GoogleMap
      mapContainerStyle={{ width: "100%", height: "100%" }}
      center={{ lat, lng }}
      zoom={15}
      options={{
        styles: mapStyle,
        disableDefaultUI: true,
        zoomControl: true,
        gestureHandling: "greedy",
      }}
      onLoad={onLoad}
      onClick={(e) => {
        if (onMapPress && e.latLng) {
          onMapPress(e.latLng.lat(), e.latLng.lng());
        }
      }}
    >
      <OverlayView
        position={{ lat, lng }}
        mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            backgroundColor: "#1070D0",
            border: "3px solid white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 12px rgba(16,112,208,0.4)",
            transform: "translate(-50%, -50%)",
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: "white",
            }}
          />
        </div>
      </OverlayView>
    </GoogleMap>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },
  errorContainer: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },
  errorBox: {
    flex: 1,
  },
});
