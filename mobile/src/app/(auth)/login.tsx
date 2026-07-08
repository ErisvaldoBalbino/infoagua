import { useState, useRef } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Eye, EyeOff, Lock, Mail, AlertCircle } from "lucide-react-native";
import { theme } from "../../constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { useAuth } from "../../context/AuthContext";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");

  const primaryButtonScale = useSharedValue(1);
  const guestButtonScale = useSharedValue(1);

  const primaryButtonScaleRef = useRef(primaryButtonScale);
  const guestButtonScaleRef = useRef(guestButtonScale);

  const animatedPrimaryButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: primaryButtonScale.value }],
  }));

  const animatedGuestButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: guestButtonScale.value }],
  }));

  async function handleLogin() {
    if (isLoading) return;

    setEmailError("");
    setPasswordError("");
    setGeneralError("");

    let hasError = false;

    if (!email.trim()) {
      setEmailError("O e-mail é obrigatório.");
      hasError = true;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setEmailError("Por favor, digite um e-mail válido.");
        hasError = true;
      }
    }

    if (!password.trim()) {
      setPasswordError("A senha é obrigatória.");
      hasError = true;
    }

    if (hasError) return;

    setIsLoading(true);
    try {
      await login({ email: email.trim(), password });
      router.replace("/(tabs)");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Verifique suas credenciais e tente novamente.";
      setGeneralError(message);
    } finally {
      setIsLoading(false);
    }
  }



  return (
    <View style={styles.root}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Top Wavy Header */}
          <LinearGradient
            colors={["#1A3F6F", "#1A6FBB"]}
            style={styles.headerGradient}
          >
            <View style={styles.logoWrapper}>
              <Image
                source={require("@/assets/images/infoagua-logo.png")}
                style={styles.logoImage}
                resizeMode="contain"
              />
              <Text style={styles.appName}>InfoÁgua</Text>
            </View>
          </LinearGradient>

          {/* SVG Wave Transition */}
          <View style={styles.waveContainer}>
            <Svg
              height="60"
              width="100%"
              viewBox="0 0 1440 320"
              preserveAspectRatio="none"
              style={styles.waveSvg}
            >
              <Path
                fill="#1A6FBB"
                d="M0,96L120,112C240,128,480,160,720,160C960,160,1200,128,1320,112L1440,96L1440,0L1320,0C1200,0,960,0,720,0C480,0,240,0,120,0L0,0Z"
              />
            </Svg>
          </View>

          {/* Form Content Area */}
          <View style={styles.formContainer}>
            <Text style={styles.screenTitle}>Entrar</Text>
            <Text style={styles.screenSubtitle}>Por favor, faça login para continuar</Text>

            {!!generalError && (
              <View style={styles.generalErrorContainer}>
                <AlertCircle size={20} color={theme.colors.status.danger} style={styles.generalErrorIcon} />
                <Text style={styles.generalErrorText}>{generalError}</Text>
              </View>
            )}

            {/* E-mail */}
            <Text style={styles.label}>E-mail</Text>
            <View style={[
              styles.inputWrapper,
              isEmailFocused && styles.inputWrapperFocused,
              !!emailError && styles.inputWrapperError,
              !!emailError && { marginBottom: 6 }
            ]}>
              <Mail
                size={18}
                color={emailError ? theme.colors.status.danger : (isEmailFocused ? "#208AEF" : "#9CA3AF")}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Digite seu e-mail"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailError) setEmailError("");
                  if (generalError) setGeneralError("");
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                onFocus={() => setIsEmailFocused(true)}
                onBlur={() => setIsEmailFocused(false)}
              />
            </View>
            {!!emailError && (
              <Text style={styles.errorText}>{emailError}</Text>
            )}

            {/* Senha */}
            <Text style={styles.label}>Senha</Text>
            <View style={[
              styles.inputWrapper,
              isPasswordFocused && styles.inputWrapperFocused,
              !!passwordError && styles.inputWrapperError,
              !!passwordError && { marginBottom: 6 }
            ]}>
              <Lock
                size={18}
                color={passwordError ? theme.colors.status.danger : (isPasswordFocused ? "#208AEF" : "#9CA3AF")}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, styles.inputPassword]}
                placeholder="Digite sua senha"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (passwordError) setPasswordError("");
                  if (generalError) setGeneralError("");
                }}
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((v) => !v)}
                style={styles.eyeButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                {showPassword ? (
                  <EyeOff size={18} color={passwordError ? theme.colors.status.danger : (isPasswordFocused ? "#208AEF" : "#9CA3AF")} />
                ) : (
                  <Eye size={18} color={passwordError ? theme.colors.status.danger : (isPasswordFocused ? "#208AEF" : "#9CA3AF")} />
                )}
              </TouchableOpacity>
            </View>
            {!!passwordError && (
              <Text style={styles.errorText}>{passwordError}</Text>
            )}

            {/* Botão entrar */}
            <Animated.View style={animatedPrimaryButtonStyle}>
              <TouchableOpacity
                style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}
                onPress={handleLogin}
                onPressIn={() => { primaryButtonScaleRef.current.value = withSpring(0.96); }}
                onPressOut={() => { primaryButtonScaleRef.current.value = withSpring(1); }}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>Entrar</Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Divisor */}
            <View style={styles.dividerWrapper}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Botão visitante */}
            <Animated.View style={animatedGuestButtonStyle}>
              <TouchableOpacity
                style={styles.ghostButton}
                onPress={() => router.replace("/(tabs)")}
                onPressIn={() => { guestButtonScaleRef.current.value = withSpring(0.96); }}
                onPressOut={() => { guestButtonScaleRef.current.value = withSpring(1); }}
                activeOpacity={0.75}
              >
                <Text style={styles.ghostButtonText}>Entrar como visitante</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Rodapé */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Não tem uma conta? </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/cadastro")}>
                <Text style={styles.footerLink}>Criar conta</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    backgroundColor: "#FFFFFF",
  },

  headerGradient: {
    width: "100%",
    paddingTop: Platform.OS === "ios" ? 70 : 50,
    paddingBottom: 10,
    alignItems: "center",
  },
  logoWrapper: {
    alignItems: "center",
  },
  logoImage: {
    width: 80,
    height: 80,
  },
  appName: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    marginTop: 10,
    letterSpacing: 0.5,
  },

  waveContainer: {
    width: "100%",
    height: 45,
    backgroundColor: "#FFFFFF",
    marginTop: -1,
  },
  waveSvg: {
    width: "100%",
    height: "100%",
  },

  formContainer: {
    flex: 1,
    paddingHorizontal: 28,
    paddingBottom: 40,
    backgroundColor: "#FFFFFF",
  },
  screenTitle: {
    fontSize: theme.typography.sizes.display,
    fontFamily: theme.typography.fonts.bold,
    color: theme.colors.text.primary,
    textAlign: "left",
    marginBottom: 6,
  },
  screenSubtitle: {
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fonts.regular,
    color: theme.colors.text.secondary,
    textAlign: "left",
    marginBottom: 28,
  },

  label: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fonts.semiBold,
    color: theme.colors.text.secondary,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.button,
    borderWidth: 1.5,
    borderColor: theme.colors.borderLight,
    paddingHorizontal: 16,
    marginBottom: 20,
    height: 54,
  },
  inputWrapperFocused: {
    borderColor: theme.colors.secondary,
    backgroundColor: theme.colors.cardBackground,
  },
  inputWrapperError: {
    borderColor: theme.colors.status.danger,
    backgroundColor: theme.colors.status.dangerBg,
  },
  errorText: {
    color: theme.colors.status.danger,
    fontSize: 12,
    fontFamily: theme.typography.fonts.regular,
    marginBottom: 14,
    marginLeft: 4,
  },
  generalErrorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.status.dangerBg,
    borderWidth: 1.5,
    borderColor: theme.colors.status.danger,
    borderRadius: theme.borderRadius.button,
    padding: 14,
    marginBottom: 20,
  },
  generalErrorIcon: {
    marginRight: 10,
  },
  generalErrorText: {
    flex: 1,
    color: theme.colors.status.danger,
    fontSize: 14,
    fontFamily: theme.typography.fonts.semiBold,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: theme.typography.fonts.regular,
    color: theme.colors.text.primary,
    height: "100%",
    ...Platform.select({
      web: {
        outlineStyle: "none",
      } as any,
    }),
  },
  inputPassword: {
    paddingRight: 4,
  },
  eyeButton: {
    padding: 4,
  },

  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.button,
    height: 54,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 24,
    ...Platform.select({
      web: { boxShadow: `0px 4px 12px ${theme.colors.primary}40` } as any,
      default: {
        shadowColor: theme.colors.primary,
        shadowOpacity: 0.25,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
      },
    }),
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: theme.colors.text.light,
    fontSize: theme.typography.sizes.lg,
    fontFamily: theme.typography.fonts.bold,
    letterSpacing: 0.5,
  },

  dividerWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.borderLight,
  },
  dividerText: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fonts.regular,
    color: theme.colors.text.tertiary,
    marginHorizontal: 16,
  },

  ghostButton: {
    backgroundColor: theme.colors.lightBg,
    borderRadius: theme.borderRadius.button,
    height: 54,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  ghostButtonText: {
    color: theme.colors.secondary,
    fontSize: 15,
    fontFamily: theme.typography.fonts.semiBold,
    letterSpacing: 0.2,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  footerText: {
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fonts.regular,
    color: theme.colors.text.secondary,
  },
  footerLink: {
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fonts.semiBold,
    color: theme.colors.secondary,
  },
});
