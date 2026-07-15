import { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  TextInput,
  ScrollView,
  Image,
} from "react-native";
import { Alert } from "../../utils/alert";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import {
  Lock,
  LogIn,
  MapPin,
  Pencil,
  Droplet,
  Wrench,
  FlaskConical,
  CheckCircle,
  Camera,
} from "lucide-react-native";
import { occurrencesService, OccurrenceType } from "../../services/api/occurrences.service";
import { storageService } from "../../services/api/storage.service";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "../../components/Button";
import { theme } from "../../constants/theme";
import * as ImagePicker from "expo-image-picker";

export default function ReportTab() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { isAuthenticated, isLoading } = useAuth();
  const insets = useSafeAreaInsets();

  const isLocationSelected = !!params.latitude && !!params.longitude;

  const address = String(params.address || "Selecione uma localização");
  const details = String(params.details || "Toque no card para selecionar");
  const latitude = params.latitude ? Number(params.latitude) : 0;
  const longitude = params.longitude ? Number(params.longitude) : 0;
  const city = String(params.city || "");

  useEffect(() => {
    if (isAuthenticated && !isLocationSelected) {
      const timer = setTimeout(() => {
        router.replace("/localizacao");
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLocationSelected, router]);

  const [selectedCategory, setSelectedCategory] = useState<OccurrenceType>("shortage");
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { id: "shortage" as OccurrenceType, label: "Falta d'água", icon: Droplet },
    { id: "leak" as OccurrenceType, label: "Vazamento", icon: Wrench },
    { id: "quality" as OccurrenceType, label: "Qualidade", icon: FlaskConical },
    { id: "return" as OccurrenceType, label: "Retorno", icon: CheckCircle },
  ];

  const handleSelectLocation = () => {
    router.push({
      pathname: "/localizacao",
      params: {
        currentAddress: address,
        currentDetails: details,
        currentLat: latitude,
        currentLng: longitude,
        currentCity: city,
      },
    });
  };

  const handleSelectImage = async () => {
    Alert.alert(
      "Adicionar Evidência",
      "Escolha como deseja adicionar a foto:",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Tirar Foto",
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== "granted") {
              Alert.alert("Permissão necessária", "Precisamos de permissão para acessar sua câmera.");
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ["images"],
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.8,
            });
            if (!result.canceled && result.assets && result.assets.length > 0) {
              setImageUri(result.assets[0].uri);
            }
          },
        },
        {
          text: "Escolher da Galeria",
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
              Alert.alert("Permissão necessária", "Precisamos de permissão para acessar sua galeria.");
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ["images"],
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.8,
            });
            if (!result.canceled && result.assets && result.assets.length > 0) {
              setImageUri(result.assets[0].uri);
            }
          },
        },
      ]
    );
  };

  const handleSend = async () => {
    if (!isLocationSelected) return;
    setIsSubmitting(true);
    try {
      let photoUrl: string | undefined = undefined;

      if (imageUri) {
        photoUrl = await storageService.uploadFile(imageUri);
      }

      await occurrencesService.create({
        type: selectedCategory,
        latitude,
        longitude,
        city,
        description,
        photoUrl,
      });

      Alert.alert("Sucesso", "Ocorrência enviada com sucesso!");

      setDescription("");
      setImageUri(null);
      router.push("/(tabs)/mapa");
    } catch (error: any) {
      console.error("Erro ao enviar ocorrência:", error);
      const errorMsg = error?.response?.data?.message || "Não foi possível enviar a ocorrência no momento.";
      Alert.alert("Erro ao enviar", errorMsg);
    } finally {
      setIsSubmitting(false);
    }
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
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.authCard}>
          <View style={styles.iconWrapper}>
            <Lock size={32} color={theme.colors.primary} />
          </View>
          <Text style={styles.restrictedTitle}>Acesso Restrito</Text>
          <Text style={styles.restrictedSubtitle}>
            Para relatar uma ocorrência de falta de água, vazamento ou qualidade, você precisa estar conectado à sua conta.
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

  if (!isLocationSelected) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.scrollContainer, { paddingTop: Math.max(insets.top, 20) }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Current Location Card */}
      <TouchableOpacity
        style={styles.locationCard}
        activeOpacity={0.8}
        onPress={handleSelectLocation}
      >
        <View style={styles.locationIconContainer}>
          <MapPin size={24} color="#FFFFFF" />
        </View>
        <View style={styles.locationTextContainer}>
          <Text style={styles.locationTitle}>LOCALIZAÇÃO ATUAL</Text>
          <Text style={styles.locationName}>{address}</Text>
          <Text style={styles.locationAddress}>{details}</Text>
        </View>
        <TouchableOpacity
          style={styles.editButton}
          activeOpacity={0.7}
          onPress={handleSelectLocation}
        >
          <Pencil size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </TouchableOpacity>

      {/* 2. Category Carousel */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Selecione a Categoria</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContent}
        >
          {categories.map((cat) => {
            const IconComponent = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryCard,
                  isSelected && styles.categoryCardSelected,
                ]}
                activeOpacity={0.8}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <View style={styles.categoryIconContainer}>
                  <IconComponent
                    size={28}
                    color={isSelected ? "#1070D0" : "#64748B"}
                  />
                </View>
                <Text
                  style={[
                    styles.categoryLabel,
                    isSelected && styles.categoryLabelSelected,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 3. Description (Optional) */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Descrição (Opcional)</Text>
        <TextInput
          style={styles.descriptionInput}
          multiline
          numberOfLines={4}
          placeholder="Forneça mais detalhes sobre o problema..."
          placeholderTextColor="#94A3B8"
          value={description}
          onChangeText={setDescription}
        />
      </View>

      {/* 4. Evidence (Optional) */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Evidência (Opcional)</Text>
        {imageUri ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
            <TouchableOpacity
              style={styles.removeImageButton}
              activeOpacity={0.7}
              onPress={() => setImageUri(null)}
            >
              <Text style={styles.removeImageText}>Remover Foto</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.evidenceCard}
            activeOpacity={0.8}
            onPress={handleSelectImage}
          >
            <Camera size={32} color="#94A3B8" />
            <Text style={styles.evidenceText}>Toque para adicionar foto</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 5. Submit Button */}
      <Button
        title="Enviar"
        onPress={handleSend}
        variant="primary"
        loading={isSubmitting}
        disabled={!isLocationSelected}
      />
    </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.lightBg,
    padding: 24,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 110,
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
  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 24,
    ...cardShadow,
  },
  locationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 12,
    fontFamily: theme.typography.fonts.bold,
    color: theme.colors.text.secondary,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  locationName: {
    fontSize: theme.typography.sizes.xl,
    fontFamily: theme.typography.fonts.bold,
    color: theme.colors.text.primary,
  },
  locationAddress: {
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fonts.regular,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  editButton: {
    padding: 6,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.xl,
    fontFamily: theme.typography.fonts.bold,
    color: theme.colors.text.primary,
    marginBottom: 12,
  },
  carouselContent: {
    paddingRight: 20,
    gap: 12,
  },
  categoryCard: {
    width: 108,
    height: 108,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
  categoryCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.lightBg,
  },
  categoryIconContainer: {
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 14,
    fontFamily: theme.typography.fonts.semiBold,
    color: theme.colors.text.secondary,
    textAlign: "center",
  },
  categoryLabelSelected: {
    color: theme.colors.primary,
    fontFamily: theme.typography.fonts.bold,
  },
  descriptionInput: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    padding: 16,
    minHeight: 140,
    fontSize: theme.typography.sizes.lg,
    fontFamily: theme.typography.fonts.regular,
    color: theme.colors.text.primary,
    textAlignVertical: "top",
  },
  evidenceCard: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: theme.colors.border,
    height: 140,
    justifyContent: "center",
    alignItems: "center",
  },
  evidenceText: {
    fontSize: theme.typography.sizes.base,
    fontFamily: theme.typography.fonts.semiBold,
    color: theme.colors.text.secondary,
    marginTop: 8,
  },
  previewContainer: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    overflow: "hidden",
    alignItems: "center",
    padding: 12,
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 10,
  },
  removeImageButton: {
    backgroundColor: "#FEE2E2",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  removeImageText: {
    color: "#EF4444",
    fontFamily: theme.typography.fonts.bold,
    fontSize: 14,
  },
});

