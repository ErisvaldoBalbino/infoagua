import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function LocationScreen() {
  const router = useRouter();

  const cities = ["Fortaleza", "Recife", "Natal"];

  const handleSelectCity = (city: string) => {
    router.navigate({
      pathname: "/(tabs)/relatar",
      params: { cidade: city }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selecionar Cidade</Text>
      
      {cities.map((city) => (
        <TouchableOpacity 
          key={city}
          style={styles.button}
          onPress={() => handleSelectCity(city)}
        >
          <Text style={styles.buttonText}>{city}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#FFFFFF",
    width: "80%",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  buttonText: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "500",
  },
});
