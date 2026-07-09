import { useState } from "react";
import {
  ActivityIndicator,
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
import Animated from "react-native-reanimated";
import { useAuth } from "../../context/AuthContext";
import { AuthHeader } from "../../components/AuthHeader";
import { useButtonScale } from "../../hooks/useButtonScale";

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

  const primaryButton = useButtonScale();
  const guestButton = useButtonScale();

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
          <AuthHeader />

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
                color={emailError ? theme.colors.status.danger : (isEmailFocused ? theme.colors.secondary : theme.colors.text.tertiary)}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Digite seu e-mail"
                placeholderTextColor={theme.colors.text.tertiary}
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
                color={passwordError ? theme.colors.status.danger : (isPasswordFocused ? theme.colors.secondary : theme.colors.text.tertiary)}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, styles.inputPassword]}
                placeholder="Digite sua senha"
                placeholderTextColor={theme.colors.text.tertiary}
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
                  <EyeOff size={18} color={passwordError ? theme.colors.status.danger : (isPasswordFocused ? theme.colors.secondary : theme.colors.text.tertiary)} />
                ) : (
                  <Eye size={18} color={passwordError ? theme.colors.status.danger : (isPasswordFocused ? theme.colors.secondary : theme.colors.text.tertiary)} />
                )}
              </TouchableOpacity>
            </View>
            {!!passwordError && (
              <Text style={styles.errorText}>{passwordError}</Text>
            )}

            {/* Botão entrar */}
            <Animated.View style={primaryButton.animatedStyle}>
              <TouchableOpacity
                style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}
                onPress={handleLogin}
                onPressIn={primaryButton.onPressIn}
                onPressOut={primaryButton.onPressOut}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <ActivityIndicator color={theme.colors.text.light} />
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
            <Animated.View style={guestButton.animatedStyle}>
              <TouchableOpacity
                style={styles.ghostButton}
                onPress={() => router.replace("/(tabs)")}
                onPressIn={guestButton.onPressIn}
                onPressOut={guestButton.onPressOut}
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
    backgroundColor: theme.colors.cardBackground,
  },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    backgroundColor: theme.colors.cardBackground,
  },

  formContainer: {
    flex: 1,
    paddingHorizontal: 28,
    paddingBottom: 40,
    backgroundColor: theme.colors.cardBackground,
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
