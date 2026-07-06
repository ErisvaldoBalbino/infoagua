import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function ReportTab() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const selectedCity = params.cidade ? String(params.cidade) : null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Relatar Ocorrência</Text>
      
      <Text style={styles.cityText}>
        Cidade Selecionada: {selectedCity ? selectedCity : "Nenhuma"}
      </Text>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => router.push("/localizacao")}
      >
        <Text style={styles.buttonText}>Selecionar Cidade</Text>
      </TouchableOpacity>
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
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 10,
  },
  cityText: {
    fontSize: 16,
    color: "#4B5563",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#208AEF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
