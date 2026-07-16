import React from "react";
import {
  StyleSheet,
  Text,
  View,
  StyleProp,
  ViewStyle,
} from "react-native";
import { AlertCircle, RefreshCw } from "lucide-react-native";
import { Button } from "./Button";
import { theme } from "../constants/theme";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function ErrorState({
  title = "Falha ao carregar",
  message = "Não foi possível carregar as informações. Por favor, verifique sua conexão e tente novamente.",
  onRetry,
  style,
}: ErrorStateProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <AlertCircle size={40} color={theme.colors.status.danger} />
      </View>
      
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      
      {onRetry && (
        <Button
          title="Tentar Novamente"
          onPress={onRetry}
          variant="primary"
          icon={<RefreshCw size={16} color="#FFFFFF" />}
          style={{ minWidth: 200, height: 48, borderRadius: theme.borderRadius.button }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.status.dangerBg,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: "700",
    color: theme.colors.text.primary,
    textAlign: "center",
    fontFamily: theme.typography.fonts.bold,
    marginBottom: 8,
  },
  message: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    textAlign: "center",
    fontFamily: theme.typography.fonts.regular,
    lineHeight: 20,
    marginBottom: 24,
  },
});

