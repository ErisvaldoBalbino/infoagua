import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Platform,
  Alert,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { occurrencesService, OccurrenceResponse } from "../../services/api/occurrences.service";
import { MapPin, User, MessageSquare, ThumbsUp, ChevronRight } from "lucide-react-native";

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

export default function DetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { isAuthenticated } = useAuth();

  const [occurrence, setOccurrence] = useState<OccurrenceResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLiked, setHasLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [retryTrigger, setRetryTrigger] = useState(0);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    async function loadDetails() {
      try {
        setHasError(false);
        if (typeof id === "string") {
          const data = await occurrencesService.findById(id);
          setOccurrence(data);
          setLikesCount(data.likesCount);
        }
      } catch (error) {
        console.error("Error loading occurrence details:", error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    }
    loadDetails();
  }, [id, retryTrigger]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      Alert.alert(
        "Acesso Restrito",
        "Para curtir relatos de ocorrências, você precisa estar conectado à sua conta.",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Fazer Login",
            onPress: () => router.push("/(auth)/login"),
          },
        ]
      );
      return;
    }

    if (!occurrence) return;

    if (isLiking) return;

    const newHasLiked = !hasLiked;
    setIsLiking(true);
    setHasLiked(newHasLiked);
    setLikesCount((prev) => (newHasLiked ? prev + 1 : prev - 1));

    try {
      const result = await occurrencesService.toggleLike(occurrence.id);
      setHasLiked(result.liked);
    } catch (error) {
      console.error("Error liking occurrence:", error);
      setHasLiked(!newHasLiked);
      setLikesCount((prev) => (newHasLiked ? prev - 1 : prev + 1));
      Alert.alert("Erro", "Não foi possível curtir o relato.");
    } finally {
      setIsLiking(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#208AEF" />
      </View>
    );
  }

  if (hasError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorTitle}>Falha ao carregar detalhes</Text>
        <Text style={styles.errorText}>
          Não foi possível carregar os detalhes do relato.
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setIsLoading(true);
            setRetryTrigger((prev) => prev + 1);
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!occurrence) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Ocorrência não encontrada.</Text>
      </View>
    );
  }

  const formattedDate = new Date(occurrence.createdAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const badgeColor = typeColors[occurrence.type] || "#6B7280";
  const badgeLabel = typeLabels[occurrence.type] || occurrence.type;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.card}>
        {/* Header: Author and Badge */}
        <View style={styles.header}>
          <View style={styles.authorBadge}>
            <View style={styles.authorAvatar}>
              <User size={24} color="#4B5563" />
            </View>
            <View>
              <Text style={styles.authorName}>{occurrence.user.name}</Text>
              <Text style={styles.dateText}>{formattedDate}</Text>
            </View>
          </View>
          <View style={[styles.typeBadge, { backgroundColor: badgeColor + "15" }]}>
            <Text style={[styles.typeBadgeText, { color: badgeColor }]}>{badgeLabel}</Text>
          </View>
        </View>

        {/* Location */}
        <View style={styles.locationContainer}>
          <MapPin size={18} color="#208AEF" />
          <Text style={styles.locationText}>{occurrence.city}</Text>
          <Text style={styles.coordinatesText}>
            ({occurrence.latitude.toFixed(4)}, {occurrence.longitude.toFixed(4)})
          </Text>
        </View>

        {/* Image (Optional) */}
        {occurrence.photoUrl && (
          <Image
            source={{ uri: occurrence.photoUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        )}

        {/* Description */}
        <View style={styles.descriptionSection}>
          <Text style={styles.descriptionTitle}>Descrição do Relato</Text>
          <Text style={styles.descriptionText}>
            {occurrence.description || "Nenhuma descrição detalhada fornecida."}
          </Text>
        </View>

        {/* Interactive Stats Info */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <ThumbsUp size={16} color="#6B7280" />
            <Text style={styles.statLabel}>{likesCount} curtidas</Text>
          </View>
          <View style={styles.statItem}>
            <MessageSquare size={16} color="#6B7280" />
            <Text style={styles.statLabel}>{occurrence.commentsCount} comentários</Text>
          </View>
        </View>

        {/* Actions Button */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, hasLiked && styles.actionButtonActive]}
            onPress={handleLike}
            activeOpacity={0.8}
            disabled={isLiking}
          >
            <ThumbsUp size={20} color={hasLiked ? "#FFFFFF" : "#4B5563"} />
            <Text style={[styles.actionButtonText, hasLiked && styles.actionButtonTextActive]}>
              {hasLiked ? "Curtido" : "Curtir"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push({ pathname: "/comentarios/[id]", params: { id: occurrence.id } })}
            activeOpacity={0.8}
          >
            <MessageSquare size={20} color="#4B5563" />
            <Text style={styles.actionButtonText}>Comentários</Text>
            <ChevronRight size={16} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const cardShadow = Platform.select({
  web: { boxShadow: "0px 8px 24px rgba(0,0,0,0.06)" } as any,
  default: {
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
});

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    ...cardShadow,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingBottom: 16,
  },
  authorBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  authorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  authorName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
  },
  dateText: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  typeBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 50,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 20,
    backgroundColor: "#EFF6FF",
    padding: 12,
    borderRadius: 12,
  },
  locationText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E40AF",
  },
  coordinatesText: {
    fontSize: 13,
    color: "#4B5563",
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    marginBottom: 20,
  },
  descriptionSection: {
    marginBottom: 24,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 15,
    color: "#4B5563",
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingBottom: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statLabel: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    height: 48,
    gap: 8,
  },
  actionButtonActive: {
    backgroundColor: "#208AEF",
    borderColor: "#208AEF",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
  },
  actionButtonTextActive: {
    color: "#FFFFFF",
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
    textAlign: "center",
    marginTop: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
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
