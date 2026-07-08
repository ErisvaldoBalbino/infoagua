import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { occurrencesService, OccurrenceResponse } from "../../services/api/occurrences.service";
import { User, MessageSquare, ThumbsUp, MapPin, Plus } from "lucide-react-native";

const typeLabels: Record<string, string> = {
  shortage: "Falta de Água",
  return: "Abastecimento Retornado",
  quality: "Qualidade da Água",
  leak: "Vazamento",
};

const typeColors: Record<string, string> = {
  shortage: "#EF4444",
  return: "#10B981",
  quality: "#F59E0B",
  leak: "#3B82F6",
};

export default function HomeTab() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  const [occurrences, setOccurrences] = useState<OccurrenceResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    async function fetchOccurrences() {
      try {
        setHasError(false);
        const data = await occurrencesService.findAll();
        // Sort by newest first
        const sorted = data.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setOccurrences(sorted);
      } catch (error) {
        console.error("Error fetching occurrences:", error);
        setHasError(true);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
    fetchOccurrences();
  }, [refreshTrigger]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshTrigger((prev) => prev + 1);
  };

  const renderItem = ({ item }: { item: OccurrenceResponse }) => {
    const formattedDate = new Date(item.createdAt).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const badgeColor = typeColors[item.type] || "#6B7280";
    const badgeLabel = typeLabels[item.type] || item.type;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => router.push({ pathname: "/detalhes/[id]", params: { id: item.id } })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.authorBadge}>
            <View style={styles.authorAvatar}>
              <Text style={styles.authorAvatarText}>
                {item.user.name ? item.user.name.charAt(0).toUpperCase() : "U"}
              </Text>
            </View>
            <View>
              <Text style={styles.authorName}>{item.user.name}</Text>
              <Text style={styles.dateText}>{formattedDate}</Text>
            </View>
          </View>
          <View style={[styles.typeBadge, { backgroundColor: badgeColor + "15" }]}>
            <Text style={[styles.typeBadgeText, { color: badgeColor }]}>{badgeLabel}</Text>
          </View>
        </View>

        {item.description && (
          <Text style={styles.descriptionText} numberOfLines={3}>
            {item.description}
          </Text>
        )}

        <View style={styles.cardFooter}>
          <View style={styles.locationContainer}>
            <MapPin size={16} color="#6B7280" />
            <Text style={styles.locationText}>{item.city}</Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <ThumbsUp size={16} color="#6B7280" />
              <Text style={styles.statText}>{item.likesCount}</Text>
            </View>
            <View style={styles.statItem}>
              <MessageSquare size={16} color="#6B7280" />
              <Text style={styles.statText}>{item.commentsCount}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        {isAuthLoading ? null : isAuthenticated ? (
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push("/perfil")}
            activeOpacity={0.8}
          >
            <User size={20} color="#208AEF" />
            <Text style={styles.profileButtonText} numberOfLines={1}>
              {user?.name?.split(" ")[0]}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push("/(auth)/login")}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>Entrar</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#208AEF" />
        </View>
      ) : hasError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorTitle}>Falha ao carregar ocorrências</Text>
          <Text style={styles.errorText}>
            Não foi possível carregar as ocorrências. Verifique sua conexão ou tente novamente.
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setIsLoading(true);
              setRefreshTrigger((prev) => prev + 1);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={occurrences}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={["#208AEF"]}
              tintColor="#208AEF"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📭</Text>
              <Text style={styles.emptyTitle}>Nenhum relato encontrado</Text>
              <Text style={styles.emptyText}>
                Seja o primeiro a relatar um problema de abastecimento ou qualidade da água na sua região!
              </Text>
              {isAuthenticated && (
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={() => router.push("/(tabs)/relatar")}
                >
                  <Plus size={18} color="#FFFFFF" />
                  <Text style={styles.emptyButtonText}>Relatar Agora</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const cardShadow = Platform.select({
  web: { boxShadow: "0px 4px 12px rgba(0,0,0,0.05)" } as any,
  default: {
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoEmoji: {
    fontSize: 24,
  },
  appName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  profileButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
    maxWidth: 140,
  },
  profileButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#208AEF",
  },
  loginButton: {
    backgroundColor: "#208AEF",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  loginButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
    gap: 16,
    flexGrow: 1,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    ...cardShadow,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  authorBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  authorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  authorAvatarText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4B5563",
  },
  authorName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  dateText: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  typeBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  descriptionText: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 12,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#208AEF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  emptyButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#EF4444",
    marginBottom: 8,
    textAlign: "center",
  },
  errorText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#208AEF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
