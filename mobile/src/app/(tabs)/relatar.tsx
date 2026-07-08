import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Platform } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { Lock, LogIn } from "lucide-react-native";

export default function ReportTab() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { isAuthenticated, isLoading } = useAuth();
  const selectedCity = params.cidade ? String(params.cidade) : null;

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#208AEF" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.iconWrapper}>
            <Lock size={32} color="#208AEF" />
          </View>
          <Text style={styles.restrictedTitle}>Acesso Restrito</Text>
          <Text style={styles.restrictedSubtitle}>
            Para relatar uma ocorrência de falta de água, vazamento ou qualidade, você precisa estar conectado à sua conta.
          </Text>
          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={() => router.push("/(auth)/login")}
            activeOpacity={0.85}
          >
            <LogIn size={18} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.loginButtonText}>Fazer Login / Criar Conta</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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

const cardShadow = Platform.select({
  web: { boxShadow: "0px 8px 20px rgba(0,0,0,0.06)" } as any,
  default: {
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EBF3FC",
    padding: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 36,
    width: "100%",
    maxWidth: 380,
    alignItems: "center",
    ...cardShadow,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  restrictedTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
    textAlign: "center",
  },
  restrictedSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  loginButton: {
    flexDirection: "row",
    backgroundColor: "#208AEF",
    borderRadius: 50,
    height: 50,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  buttonIcon: {
    marginRight: 2,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
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
