import { ReactNode } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StyleProp,
  ViewStyle,
  TextStyle,
  View,
} from "react-native";
import { theme } from "../constants/theme";

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "cta" | "secondary" | "outline";
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  activeOpacity?: number;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
  activeOpacity = 0.8,
}: ButtonProps) {
  const isButtonDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.buttonBase,
        styles[variant],
        isButtonDisabled && styles[`${variant}Disabled`],
        style,
      ]}
      onPress={onPress}
      disabled={isButtonDisabled}
      activeOpacity={activeOpacity}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === "outline" ? theme.colors.primary : "#FFFFFF"} />
      ) : (
        <View style={styles.contentContainer}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text
            style={[
              styles.textBase,
              styles[`${variant}Text`],
              isButtonDisabled && styles[`${variant}TextDisabled`],
              textStyle,
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}



const styles = StyleSheet.create({
  buttonBase: {
    height: 54,
    borderRadius: theme.borderRadius.button,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    ...Platform.select({
      web: { boxShadow: "0px 4px 12px rgba(0,0,0,0.05)" } as any,
      default: {
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 3,
      },
    }),
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  textBase: {
    fontSize: theme.typography.sizes.lg,
    fontFamily: theme.typography.fonts.bold,
    fontWeight: "700",
  },
  primary: {
    backgroundColor: theme.colors.primary,
  },
  primaryDisabled: {
    backgroundColor: "#93C5FD",
  },
  primaryText: {
    color: theme.colors.text.light,
  },
  primaryTextDisabled: {
    color: theme.colors.lightBg,
  },
  cta: {
    backgroundColor: theme.colors.dark,
    height: 54,
    borderRadius: theme.borderRadius.button,
    paddingHorizontal: 22,
  },
  ctaDisabled: {
    backgroundColor: "#93C5FD",
  },
  ctaText: {
    color: theme.colors.text.light,
    fontSize: theme.typography.sizes.lg,
  },
  ctaTextDisabled: {
    color: theme.colors.lightBg,
  },
  secondary: {
    backgroundColor: theme.colors.lightBg,
    height: 44,
    borderRadius: theme.borderRadius.button,
    paddingHorizontal: 16,
  },
  secondaryDisabled: {
    backgroundColor: theme.colors.borderLight,
  },
  secondaryText: {
    color: theme.colors.primary,
    fontFamily: theme.typography.fonts.semiBold,
    fontWeight: "600",
    fontSize: theme.typography.sizes.base,
  },
  secondaryTextDisabled: {
    color: theme.colors.text.tertiary,
  },
  outline: {
    backgroundColor: theme.colors.cardBackground,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
  },
  outlineDisabled: {
    borderColor: "#93C5FD",
  },
  outlineText: {
    color: theme.colors.primary,
  },
  outlineTextDisabled: {
    color: "#93C5FD",
  },
});

