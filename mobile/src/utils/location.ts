import * as Location from "expo-location";
import { Platform } from "react-native";

export interface AddressInfo {
  address: string;
  details: string;
  city: string;
}

export async function requestLocationPermissions(): Promise<boolean> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === "granted";
  } catch (error) {
    console.warn("Failed to request location permissions:", error);
    return false;
  }
}

export async function reverseGeocode(latitude: number, longitude: number): Promise<AddressInfo> {
  if (Platform.OS === "web") {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            "User-Agent": "InfoAguaApp",
          },
        }
      );
      const data = await response.json();
      if (data && data.address) {
        const addr = data.address;
        const street = addr.road || addr.pedestrian || addr.suburb || "";
        const houseNumber = addr.house_number || "";
        const neighborhood = addr.neighbourhood || addr.suburb || addr.city_district || "";
        const city = addr.city || addr.town || addr.village || addr.municipality || "";
        const state = addr.state || "";
        const postcode = addr.postcode || "";

        const mainAddress = street ? `${street}${houseNumber ? `, ${houseNumber}` : ""}` : "Local sem nome";
        const detailsParts = [neighborhood, city, state ? `${state}` : "", postcode].filter(Boolean);
        const details = detailsParts.join(" - ");

        return {
          address: mainAddress,
          details: details,
          city: city || "Recife",
        };
      }
    } catch (e) {
      console.warn("Web Nominatim reverse geocode failed, fallback to lat/lon:", e);
    }
    return {
      address: `Ponto próximo a: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      details: "Localização",
      city: "Recife",
    };
  }

  try {
    const hasPermission = await requestLocationPermissions();
    if (!hasPermission) {
      throw new Error("Location permission not granted");
    }
    const results = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (results && results.length > 0) {
      const item = results[0];
      const street = item.street || "";
      const houseNumber = item.streetNumber || "";
      const neighborhood = item.district || item.subregion || "";
      const city = item.city || item.subregion || "";
      const state = item.region || "";
      const postcode = item.postalCode || "";

      const mainAddress = street ? `${street}${houseNumber ? `, ${houseNumber}` : ""}` : "Local sem nome";
      const detailsParts = [neighborhood, city, state ? `${state}` : "", postcode].filter(Boolean);
      const details = detailsParts.join(" - ");

      return {
        address: mainAddress,
        details: details,
        city: city || "Recife",
      };
    }
  } catch (e) {
    console.warn("Native reverse geocode failed, fallback:", e);
  }

  return {
    address: `Ponto próximo a: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
    details: "Localização",
    city: "Recife",
  };
}

export interface GeocodeResult {
  address: string;
  details: string;
  city: string;
  lat: number;
  lng: number;
}

export async function geocode(query: string): Promise<GeocodeResult[]> {
  if (Platform.OS === "web") {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
        {
          headers: {
            "User-Agent": "InfoAguaApp",
          },
        }
      );
      const data = await response.json();
      if (Array.isArray(data)) {
        return data.map((item: any) => {
          const addr = item.address;
          const street = addr.road || addr.pedestrian || addr.suburb || "";
          const houseNumber = addr.house_number || "";
          const neighborhood = addr.neighbourhood || addr.suburb || addr.city_district || "";
          const city = addr.city || addr.town || addr.village || addr.municipality || "";
          const state = addr.state || "";
          const postcode = addr.postcode || "";

          const mainAddress = item.display_name.split(",")[0] || street || "Local sem nome";
          const detailsParts = [neighborhood, city, state ? `${state}` : "", postcode].filter(Boolean);
          const details = detailsParts.join(" - ");

          return {
            address: mainAddress,
            details: details,
            city: city || "Recife",
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
          };
        });
      }
    } catch (e) {
      console.warn("Web Nominatim geocode failed:", e);
    }
    return [];
  }

  try {
    const hasPermission = await requestLocationPermissions();
    if (!hasPermission) {
      throw new Error("Location permission not granted");
    }
    const results = await Location.geocodeAsync(query);
    if (results && results.length > 0) {
      const parsedResults = await Promise.all(
        results.slice(0, 5).map(async (loc) => {
          try {
            const info = await reverseGeocode(loc.latitude, loc.longitude);
            return {
              ...info,
              lat: loc.latitude,
              lng: loc.longitude,
            };
          } catch {
            return {
              address: query,
              details: `Lat: ${loc.latitude.toFixed(4)}, Lng: ${loc.longitude.toFixed(4)}`,
              city: "Recife",
              lat: loc.latitude,
              lng: loc.longitude,
            };
          }
        })
      );
      return parsedResults;
    }
  } catch (e) {
    console.warn("Native geocode failed:", e);
  }

  return [];
}
