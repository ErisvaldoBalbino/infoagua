import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import { X, ChevronRight, ThumbsUp, MessageSquare, AlertTriangle } from "lucide-react-native";
import { typeBadgeBgs, typeColors, typeIcons } from "../utils/occurrence-utils";
import { OccurrenceType } from "../services/api/occurrences.service";
import { Button } from "./Button";
import { theme } from "../constants/theme";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export interface OccurrenceBottomSheetProps {
  occurrence: {
    id: string;
    type: string;
    title: string;
    description: string;
    address: string;
    likesCount: number;
    commentsCount: number;
    timeAgo: string;
  } | null;
  visible: boolean;
  onClose: () => void;
  onViewDetails: () => void;
}

export function OccurrenceBottomSheet({
  occurrence,
  visible,
  onClose,
  onViewDetails,
}: OccurrenceBottomSheetProps) {
  const [bottomSheetAnim] = useState(() => new Animated.Value(SCREEN_HEIGHT));

  useEffect(() => {
    if (visible) {
      Animated.spring(bottomSheetAnim, {
        toValue: 0,
        useNativeDriver: Platform.OS !== "web",
        tension: 50,
        friction: 8,
      }).start();
    } else {
      Animated.timing(bottomSheetAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: Platform.OS !== "web",
      }).start();
    }
  }, [visible, bottomSheetAnim]);

  if (!occurrence) return null;

  const badgeBg = typeBadgeBgs[occurrence.type as OccurrenceType] || "#F3F4F6";
  const badgeColor = typeColors[occurrence.type as OccurrenceType] || "#6B7280";
  const IconComponent = typeIcons[occurrence.type as OccurrenceType] || AlertTriangle;

  return (
    <Animated.View
      style={[
        styles.bottomSheetContainer,
        { transform: [{ translateY: bottomSheetAnim }] },
      ]}
    >
      <View style={styles.bottomSheetCard}>
        {/* Header info */}
        <View style={styles.sheetHeader}>
          <View style={styles.sheetHeaderLeft}>
            <View style={[styles.sheetIconSquircle, { backgroundColor: badgeBg }]}>
              <IconComponent size={22} color={badgeColor} />
            </View>
            <View>
              <Text style={styles.sheetTitle}>{occurrence.title}</Text>
              <Text style={styles.sheetTime}>{occurrence.timeAgo}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.sheetCloseButton}
            activeOpacity={0.7}
            onPress={onClose}
          >
            <X size={18} color={theme.colors.text.tertiary} />
          </TouchableOpacity>
        </View>

        {/* Body */}
        <Text style={styles.sheetAddress}>{occurrence.address}</Text>
        <Text style={styles.sheetDescription} numberOfLines={3}>
          {occurrence.description}
        </Text>

        {/* Footer Stats & CTA */}
        <View style={styles.sheetFooter}>
          <View style={styles.sheetStats}>
            <View style={styles.sheetStatItem}>
              <ThumbsUp size={14} color={theme.colors.text.tertiary} />
              <Text style={styles.sheetStatText}>{occurrence.likesCount}</Text>
            </View>
            <View style={styles.sheetStatItem}>
              <MessageSquare size={14} color={theme.colors.text.tertiary} />
              <Text style={styles.sheetStatText}>{occurrence.commentsCount}</Text>
            </View>
          </View>

          <Button
            title="Ver Detalhes"
            onPress={onViewDetails}
            variant="primary"
            icon={<ChevronRight size={16} color="#FFFFFF" strokeWidth={2.5} />}
            style={{ height: 40, borderRadius: theme.borderRadius.button, paddingHorizontal: 16 }}
            textStyle={{ fontSize: theme.typography.sizes.md, fontFamily: theme.typography.fonts.bold }}
          />
        </View>
      </View>
    </Animated.View>
  );
}

const viewShadow = Platform.select({
  web: { boxShadow: "0px 4px 16px rgba(0, 0, 0, 0.08)" } as any,
  default: {
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
});

const styles = StyleSheet.create({
  bottomSheetContainer: {
    position: "absolute",
    bottom: 80,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 16,
    zIndex: 1000, // Ensure it sits on top of map controls
  },
  bottomSheetCard: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.sheet,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...viewShadow,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  sheetHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sheetIconSquircle: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.squircle,
    justifyContent: "center",
    alignItems: "center",
  },
  sheetTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: "bold",
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fonts.bold,
  },
  sheetTime: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.tertiary,
    marginTop: 2,
    fontFamily: theme.typography.fonts.medium,
  },
  sheetCloseButton: {
    backgroundColor: theme.colors.borderLight,
    padding: 6,
    borderRadius: 15,
  },
  sheetAddress: {
    fontSize: theme.typography.sizes.base,
    fontWeight: "600",
    color: theme.colors.text.secondary,
    marginBottom: 8,
    fontFamily: theme.typography.fonts.semiBold,
  },
  sheetDescription: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.secondary,
    lineHeight: 20,
    marginBottom: 18,
    fontFamily: theme.typography.fonts.regular,
  },
  sheetFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sheetStats: {
    flexDirection: "row",
    gap: 14,
  },
  sheetStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  sheetStatText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.tertiary,
    fontWeight: "600",
    fontFamily: theme.typography.fonts.semiBold,
  },
});

