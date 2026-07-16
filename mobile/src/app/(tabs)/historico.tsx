import { useEffect, useState, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { occurrencesService, OccurrenceResponse, OccurrenceType } from "../../services/api/occurrences.service";
import { theme } from "../../constants/theme";
import {
  Lock,
  LogIn,
  Plus,
  Filter,
} from "lucide-react-native";
import { ErrorState } from "../../components/ErrorState";
import { OccurrenceCard } from "../../components/OccurrenceCard";
import { typeLabels } from "../../utils/occurrence-utils";
import { Button } from "../../components/Button";

export default function HistoryTab() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  
  const [occurrences, setOccurrences] = useState<OccurrenceResponse[]>([]);
  const [selectedType, setSelectedType] = useState<OccurrenceType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [hasError, setHasError] = useState(false);


  useEffect(() => {
    async function fetchMyOccurrences() {
      if (!isAuthenticated || !user) {
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      try {
        setHasError(false);
        const data = await occurrencesService.findAll();
        const userOccurrences = data.filter((occ) => occ.user.id === user.id);
        const sorted = userOccurrences.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setOccurrences(sorted);
      } catch (error) {
        console.error("Error fetching user occurrences:", error);
        setHasError(true);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
    fetchMyOccurrences();
  }, [refreshTrigger, isAuthenticated, user]);

  const filteredOccurrences = useMemo(() => {
    if (selectedType === null) {
      return occurrences;
    }
    return occurrences.filter((occ) => occ.type === selectedType);
  }, [selectedType, occurrences]);

  if (isAuthLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshTrigger((prev) => prev + 1);
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.authContainer}>
        <View style={styles.authCard}>
          <View style={styles.iconWrapper}>
            <Lock size={32} color={theme.colors.primary} />
          </View>
          <Text style={styles.restrictedTitle}>Acesso Restrito</Text>
          <Text style={styles.restrictedSubtitle}>
            Para visualizar o histórico de ocorrências relatadas por você, é necessário estar conectado à sua conta.
          </Text>
          <Button
            title="Fazer Login / Criar Conta"
            onPress={() => router.push("/(auth)/login")}
            variant="primary"
            icon={<LogIn size={18} color="#FFFFFF" />}
            style={{ width: "100%" }}
          />
        </View>
      </View>
    );
  }

  const renderItem = ({ item }: { item: OccurrenceResponse }) => {
    return (
      <OccurrenceCard
        occurrence={item}
        onPress={() => router.push({ pathname: "/detalhes/[id]", params: { id: item.id } })}
        showImage={true}
        verboseStats={true}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Horizontal Scroll Filter Bar */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          {/* Todas as Regiões Filter */}
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedType === null && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedType(null)}
            activeOpacity={0.8}
          >
            <Filter
              size={15}
              color={selectedType === null ? "#FFFFFF" : "#475569"}
              style={styles.filterIcon}
            />
            <Text
              style={[
                styles.filterButtonText,
                selectedType === null && styles.filterButtonTextActive,
              ]}
            >
              Todas as Regiões
            </Text>
          </TouchableOpacity>

          {/* Type Filters */}
          {(Object.keys(typeLabels) as OccurrenceType[]).map((type) => {
            const isActive = selectedType === type;
            return (
              <TouchableOpacity
                key={type}
                style={[
                  styles.filterButton,
                  isActive && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedType(type)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    isActive && styles.filterButtonTextActive,
                  ]}
                >
                  {typeLabels[type]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Content Feed */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1070D0" />
        </View>
      ) : hasError ? (
        <ErrorState
          title="Falha ao carregar histórico"
          message="Não foi possível carregar seu histórico de relatos. Verifique sua conexão e tente novamente."
          onRetry={() => {
            setIsLoading(true);
            setRefreshTrigger((prev) => prev + 1);
          }}
        />
      ) : (
        <FlatList
          data={filteredOccurrences}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={["#1070D0"]}
              tintColor="#1070D0"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📭</Text>
              <Text style={styles.emptyTitle}>Nenhum relato encontrado</Text>
              <Text style={styles.emptyText}>
                {selectedType === null
                  ? "Você ainda não enviou nenhum relato sobre problemas de água."
                  : `Você não enviou nenhum relato do tipo "${typeLabels[selectedType]}" ainda.`}
              </Text>
              {selectedType === null && (
                 <Button
                   title="Relatar Ocorrência"
                   onPress={() => router.push("/(tabs)/relatar")}
                   variant="primary"
                   icon={<Plus size={18} color="#FFFFFF" />}
                   style={{ height: 44, paddingHorizontal: 20, borderRadius: 8 }}
                 />
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
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
    backgroundColor: theme.colors.cardBackground,
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerIcon: {
    marginRight: 2,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: "bold",
    fontFamily: theme.typography.fonts.bold,
    color: theme.colors.text.primary,
  },
  filterContainer: {
    backgroundColor: theme.colors.cardBackground,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  filterScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.borderLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterIcon: {
    marginRight: 6,
  },
  filterButtonText: {
    fontSize: 14,
    fontFamily: theme.typography.fonts.semiBold,
    color: theme.colors.text.secondary,
  },
  filterButtonTextActive: {
    color: theme.colors.text.light,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  listContent: {
    padding: 16,
    paddingBottom: 110,
    gap: 16,
  },
  // occurrenceCard styles have been extracted to OccurrenceCard component
  authContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.lightBg,
    padding: 24,
  },
  authCard: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.sheet,
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
    backgroundColor: theme.colors.lightBg,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  restrictedTitle: {
    fontSize: theme.typography.sizes.xxxl,
    fontFamily: theme.typography.fonts.bold,
    color: theme.colors.text.primary,
    marginBottom: 12,
    textAlign: "center",
  },
  restrictedSubtitle: {
    fontSize: theme.typography.sizes.base,
    fontFamily: theme.typography.fonts.regular,
    color: theme.colors.text.secondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  // Login button styles have been extracted to Button component
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
    fontSize: theme.typography.sizes.xxl,
    fontWeight: "bold",
    fontFamily: theme.typography.fonts.bold,
    color: theme.colors.text.primary,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text.secondary,
    fontFamily: theme.typography.fonts.regular,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  // Empty button styles have been extracted to Button component
});
