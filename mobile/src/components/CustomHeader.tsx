import React, { ReactNode } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";
import { theme } from "../constants/theme";

export interface CustomHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightElement?: ReactNode;
}

export function CustomHeader({
  title,
  showBackButton = true,
  onBackPress,
  rightElement,
}: CustomHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
      {showBackButton ? (
        <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.7}>
          <ArrowLeft size={24} color={theme.colors.headerBlue} />
        </TouchableOpacity>
      ) : (
        <View style={styles.backButtonSpacer} />
      )}

      <Text style={styles.headerTitle}>{title}</Text>

      {rightElement ? (
        <View style={styles.rightElementContainer}>{rightElement}</View>
      ) : (
        <View style={styles.headerRightSpacer} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.cardBackground,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  backButtonSpacer: {
    width: 40,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: "700",
    color: theme.colors.headerBlue,
    fontFamily: theme.typography.fonts.bold,
  },
  headerRightSpacer: {
    width: 40,
  },
  rightElementContainer: {
    width: 40,
    alignItems: "flex-end",
    justifyContent: "center",
  },
});

