import { ReactNode } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Platform, StyleProp, ViewStyle } from "react-native";
import { theme } from "../constants/theme";

export interface ActionButtonProps {
  icon: ReactNode;
  count: number;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  activeOpacity?: number;
}

export function ActionButton({
  icon,
  count,
  label,
  onPress,
  disabled = false,
  style,
  activeOpacity = 0.8,
}: ActionButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.actionButton, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={activeOpacity}
    >
      <View style={styles.iconContainer}>{icon}</View>
      <View style={styles.actionButtonTextCol}>
        <Text style={styles.actionButtonCount}>{count}</Text>
        <Text style={styles.actionButtonLabel}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 28,
    backgroundColor: theme.colors.cardBackground,
    gap: 10,
    paddingHorizontal: 12,
    ...Platform.select({
      web: { boxShadow: "0px 2px 4px rgba(0,0,0,0.02)" } as any,
      default: {
        shadowColor: "#000",
        shadowOpacity: 0.02,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
        elevation: 1,
      },
    }),
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonTextCol: {
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonCount: {
    fontSize: theme.typography.sizes.base,
    fontWeight: "700",
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fonts.bold,
  },
  actionButtonLabel: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: "500",
    color: theme.colors.text.secondary,
    fontFamily: theme.typography.fonts.medium,
    marginTop: 1,
  },
});
