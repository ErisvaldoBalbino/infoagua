import { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  ScrollView,
  RefreshControl,
  Modal,
  TextInput,
} from "react-native";
import { Alert } from "../utils/alert";
import { useRouter, Stack } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { occurrencesService } from "../services/api/occurrences.service";
import { usersService } from "../services/api/users.service";
import { Button } from "../components/Button";
import { theme } from "../constants/theme";
import { CustomHeader } from "../components/CustomHeader";
import {
  User,
  LogOut,
  LogIn,
  AlertTriangle,
  ThumbsUp,
  ChevronRight,
  Pencil,
  X,
} from "lucide-react-native";

function formatMemberSince(dateString?: string) {
  if (!dateString) return "Membro desde --";
  try {
    const date = new Date(dateString);
    const months = [
      "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
      "Jul", "Ago", "Set", "Out", "Nov", "Dez"
    ];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `Membro desde ${month} ${year}`;
  } catch {
    return "Membro desde --";
  }
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout, isLoading, updateUser } = useAuth();
  
  const [stats, setStats] = useState({ reports: 0, confirmations: 0 });
  const [isStatsLoading, setIsStatsLoading] = useState(!isAuthenticated || !user ? false : true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [newName, setNewName] = useState(user?.name || "");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleOpenEditModal = () => {
    setNewName(user?.name || "");
    setIsEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    if (newName.trim().length < 2) {
      Alert.alert("Nome Inválido", "O nome deve ter pelo menos 2 caracteres.");
      return;
    }
    try {
      setIsUpdating(true);
      const updatedUser = await usersService.updateMe({ name: newName.trim() });
      updateUser({ name: updatedUser.name });
      Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
      setIsEditModalVisible(false);
    } catch (err: any) {
      console.error("Error updating profile:", err);
      const msg = err?.response?.data?.message || "Não foi possível atualizar o perfil.";
      Alert.alert("Erro", msg);
    } finally {
      setIsUpdating(false);
    }
  };

  const fetchStats = useCallback(async () => {
    if (!isAuthenticated || !user) {
      return;
    }
    try {
      const statsData = await occurrencesService.getUserStats();
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching profile stats:", error);
    } finally {
      setIsStatsLoading(false);
      setIsRefreshing(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (isAuthenticated && user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchStats();
    }
  }, [fetchStats, isAuthenticated, user]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchStats();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <CustomHeader title="Perfil" />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", width: "100%" }}>
          <View style={styles.authCard}>
            <View style={styles.authIconWrapper}>
              <User size={32} color={theme.colors.primary} />
            </View>
            <Text style={styles.restrictedTitle}>Você não está conectado</Text>
            <Text style={styles.restrictedSubtitle}>
              Conecte-se para gerenciar suas ocorrências e ver seus dados de perfil.
            </Text>
            <Button
              title="Entrar / Criar Conta"
              onPress={() => router.push("/(auth)/login")}
              variant="primary"
              icon={<LogIn size={18} color="#FFFFFF" />}
              style={{ width: "100%" }}
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <CustomHeader title="Perfil" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Profile Info Section */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarRing}>
            <View style={styles.avatarInner}>
              <User size={54} color="#94A3B8" strokeWidth={1.5} />
            </View>
          </View>
          <Text style={styles.nameText}>{user?.name || "Usuário"}</Text>
          <Text style={styles.memberText}>{formatMemberSince(user?.createdAt)}</Text>
        </View>

        {/* Minha Atividade Section */}
        <Text style={styles.sectionTitle}>MINHA ATIVIDADE</Text>
        <View style={styles.statsRow}>
          {/* Card: Relatos feitos */}
          <View style={styles.statCard}>
            <View style={[styles.iconWrapper, { backgroundColor: theme.colors.lightBg }]}>
              <AlertTriangle size={22} color={theme.colors.dark} strokeWidth={2} />
            </View>
            {isStatsLoading ? (
              <ActivityIndicator size="small" color={theme.colors.dark} style={styles.statLoader} />
            ) : (
              <Text style={[styles.statValue, { color: theme.colors.dark }]}>{stats.reports}</Text>
            )}
            <Text style={styles.statLabel}>Relatos feitos</Text>
          </View>

          {/* Card: Confirmações */}
          <View style={styles.statCard}>
            <View style={[styles.iconWrapper, { backgroundColor: theme.colors.status.successBg }]}>
              <ThumbsUp size={22} color={theme.colors.status.success} strokeWidth={2} />
            </View>
            {isStatsLoading ? (
              <ActivityIndicator size="small" color={theme.colors.status.success} style={styles.statLoader} />
            ) : (
              <Text style={[styles.statValue, { color: theme.colors.status.success }]}>{stats.confirmations}</Text>
            )}
            <Text style={styles.statLabel}>Confirmações</Text>
          </View>
        </View>

        {/* Configurações Section */}
        <Text style={styles.sectionTitle}>CONFIGURAÇÕES</Text>
        
        {/* Option: Editar Perfil */}
        <TouchableOpacity
          style={styles.settingCard}
          activeOpacity={0.7}
          onPress={handleOpenEditModal}
        >
          <View style={styles.settingLeft}>
            <View style={styles.editIconContainer}>
              <User size={20} color="#475569" strokeWidth={2} />
              <View style={styles.pencilOverlay}>
                <Pencil size={8} color="#FFFFFF" strokeWidth={3} />
              </View>
            </View>
            <Text style={styles.settingText}>Editar Perfil</Text>
          </View>
          <ChevronRight size={20} color="#94A3B8" />
        </TouchableOpacity>

        {/* Option: Sair */}
        <TouchableOpacity
          style={styles.logoutRow}
          activeOpacity={0.7}
          onPress={async () => {
            Alert.alert(
              "Sair da Conta",
              "Deseja realmente sair da sua conta?",
              [
                { text: "Cancelar", style: "cancel" },
                {
                  text: "Sair",
                  style: "destructive",
                  onPress: async () => {
                    try {
                      await logout();
                    } catch {
                      Alert.alert("Aviso", "Ocorreu um erro ao sair, mas você será redirecionado.");
                    } finally {
                      router.replace("/(auth)/login");
                    }
                  }
                }
              ]
            );
          }}
        >
          <LogOut size={22} color="#DC2626" strokeWidth={2} />
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={isEditModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Perfil</Text>
              <TouchableOpacity
                onPress={() => setIsEditModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <X size={20} color="#475569" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Nome completo</Text>
            <TextInput
              style={styles.modalInput}
              value={newName}
              onChangeText={setNewName}
              placeholder="Digite seu nome"
              placeholderTextColor="#94A3B8"
              autoFocus
            />

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsEditModalVisible(false)}
                disabled={isUpdating}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveProfile}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const cardShadow = Platform.select({
  web: { boxShadow: "0px 4px 12px rgba(0,0,0,0.03)" } as any,
  default: {
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    alignItems: "center",
  },
  headerLeftButton: {
    paddingRight: 16,
    paddingVertical: 8,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 28,
    width: "100%",
  },
  avatarRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: theme.colors.border,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: theme.colors.cardBackground,
  },
  avatarInner: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.colors.borderLight,
    justifyContent: "center",
    alignItems: "center",
  },
  nameText: {
    fontSize: theme.typography.sizes.xxl,
    fontFamily: theme.typography.fonts.bold,
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  memberText: {
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fonts.medium,
    color: theme.colors.text.tertiary,
  },
  sectionTitle: {
    alignSelf: "flex-start",
    fontSize: 12,
    fontFamily: theme.typography.fonts.bold,
    color: theme.colors.text.secondary,
    letterSpacing: 1,
    marginTop: 16,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    width: "100%",
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    alignItems: "flex-start",
    ...cardShadow,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  statValue: {
    fontSize: theme.typography.sizes.display,
    fontFamily: theme.typography.fonts.bold,
    marginBottom: 6,
  },
  statLoader: {
    marginVertical: 6,
  },
  statLabel: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fonts.semiBold,
    color: theme.colors.text.secondary,
  },
  settingCard: {
    width: "100%",
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    ...cardShadow,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  editIconContainer: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  pencilOverlay: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: theme.colors.text.secondary,
    borderRadius: 6,
    width: 12,
    height: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: theme.colors.cardBackground,
  },
  settingText: {
    fontSize: theme.typography.sizes.base,
    fontFamily: theme.typography.fonts.semiBold,
    color: theme.colors.text.primary,
  },
  logoutRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginTop: 8,
  },
  logoutText: {
    fontSize: theme.typography.sizes.lg,
    fontFamily: theme.typography.fonts.semiBold,
    color: theme.colors.status.danger,
  },
  authCard: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.sheet,
    paddingHorizontal: 24,
    paddingVertical: 36,
    width: "100%",
    maxWidth: 380,
    alignItems: "center",
    alignSelf: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...cardShadow,
  },
  authIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.lightBg,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  restrictedTitle: {
    fontSize: theme.typography.sizes.xxl,
    fontFamily: theme.typography.fonts.bold,
    color: theme.colors.text.primary,
    marginBottom: 12,
    textAlign: "center",
  },
  restrictedSubtitle: {
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fonts.regular,
    color: theme.colors.text.tertiary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContainer: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.sheet,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...cardShadow,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: theme.typography.sizes.xxl,
    fontFamily: theme.typography.fonts.bold,
    color: theme.colors.text.primary,
  },
  modalCloseButton: {
    padding: 4,
  },
  inputLabel: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fonts.semiBold,
    color: theme.colors.text.secondary,
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: theme.colors.lightBg,
    borderRadius: theme.borderRadius.button,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    padding: 12,
    fontSize: theme.typography.sizes.base,
    fontFamily: theme.typography.fonts.regular,
    color: theme.colors.text.primary,
    marginBottom: 24,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: theme.borderRadius.button,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 100,
  },
  cancelButton: {
    backgroundColor: theme.colors.lightBg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cancelButtonText: {
    color: theme.colors.text.secondary,
    fontFamily: theme.typography.fonts.semiBold,
    fontSize: theme.typography.sizes.base,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontFamily: theme.typography.fonts.bold,
    fontSize: theme.typography.sizes.base,
  },
});
