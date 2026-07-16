import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  Platform,
} from "react-native";
import { Search, MapPin } from "lucide-react-native";
import { geocode, GeocodeResult } from "../utils/location";
import { theme } from "../constants/theme";

interface AddressSearchBarProps {
  placeholder?: string;
  onSelectAddress: (address: GeocodeResult) => void;
  onFocus?: () => void;
}

export function AddressSearchBar({
  placeholder = "Buscar endereço...",
  onSelectAddress,
  onFocus,
}: AddressSearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<GeocodeResult[]>([]);
  const searchRequestCounter = useRef(0);

  useEffect(() => {
    if (searchQuery.trim().length < 3) {
      return;
    }
    const reqId = ++searchRequestCounter.current;
    const delay = setTimeout(async () => {
      try {
        const results = await geocode(searchQuery);
        if (reqId === searchRequestCounter.current) {
          setSuggestions(results);
          setShowSuggestions(results.length > 0);
        }
      } catch (e) {
        console.warn("Error fetching geocoding suggestions:", e);
      }
    }, 500);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  const handleSelectSuggestion = (addressItem: GeocodeResult) => {
    onSelectAddress(addressItem);
    setSearchQuery("");
    setShowSuggestions(false);
    Keyboard.dismiss();
  };

  const handleSubmit = () => {
    if (suggestions.length > 0) {
      handleSelectSuggestion(suggestions[0]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Search size={20} color="#94A3B8" style={styles.searchIcon} />
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            if (text.trim().length < 3) {
              setSuggestions([]);
              setShowSuggestions(false);
            }
          }}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true);
            if (onFocus) onFocus();
          }}
          onSubmitEditing={handleSubmit}
        />
      </View>

      {showSuggestions && (
        <View style={styles.suggestionsContainer}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            style={styles.suggestionsScroll}
          >
            {suggestions.length > 0 ? (
              suggestions.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionItem}
                  activeOpacity={0.7}
                  onPress={() => handleSelectSuggestion(item)}
                >
                  <MapPin size={16} color="#64748B" style={styles.suggestionIcon} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.suggestionTitle} numberOfLines={1}>
                      {item.address}
                    </Text>
                    <Text style={styles.suggestionSub} numberOfLines={1}>
                      {item.details}
                    </Text>
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
    width: "100%",
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
});
