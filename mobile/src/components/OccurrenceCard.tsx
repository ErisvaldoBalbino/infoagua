import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import { MapPin, ThumbsUp, MessageSquare, AlertTriangle } from "lucide-react-native";
import { OccurrenceResponse } from "../services/api/occurrences.service";
import {
  typeBadgeBgs,
  typeColors,
  typeLabels,
  typeIcons,
  formatTimeAgo,
} from "../utils/occurrence-utils";
import { theme } from "../constants/theme";

export interface OccurrenceCardProps {
  occurrence: OccurrenceResponse;
  onPress: () => void;
  showImage?: boolean;
  showLocationRow?: boolean;
  showLeftIcon?: boolean;
  verboseStats?: boolean;
}

export function OccurrenceCard({
  occurrence,
  onPress,
  showImage = false,
  showLocationRow = true,
  showLeftIcon = true,
  verboseStats = false,
}: OccurrenceCardProps) {
  const timeAgo = formatTimeAgo(occurrence.createdAt);
  const badgeBg = typeBadgeBgs[occurrence.type] || "#F3F4F6";
  const badgeColor = typeColors[occurrence.type] || "#6B7280";
  const badgeLabel = typeLabels[occurrence.type] || occurrence.type;
  const IconComponent = typeIcons[occurrence.type] || AlertTriangle;

  return (
    <TouchableOpacity
      style={styles.occurrenceCard}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={styles.cardLayout}>
        {showLeftIcon && (
          <View style={[styles.occurrenceIconSquircle, { backgroundColor: badgeBg }]}>
            <IconComponent size={20} color={badgeColor} />
          </View>
        )}

        <View style={styles.occurrenceContent}>
          <View style={styles.occurrenceHeader}>
            <View style={[styles.occurrenceTag, { backgroundColor: badgeBg }]}>
              {/* If left icon is disabled, we show the small icon inside the tag */}
              {!showLeftIcon && (
                <IconComponent size={12} color={badgeColor} style={styles.tagIcon} />
              )}
              <Text style={[styles.occurrenceTagText, { color: badgeColor }]} numberOfLines={1}>
                {badgeLabel}
              </Text>
            </View>
            <Text style={styles.occurrenceTime}>{timeAgo}</Text>
          </View>

          {showLocationRow && (
            <View style={styles.locationRow}>
              <MapPin size={12} color={theme.colors.text.secondary} />
              <Text style={styles.locationText}>{occurrence.city}</Text>
            </View>
          )}

          <Text style={styles.occurrenceDesc} numberOfLines={showImage ? 3 : 2}>
            {occurrence.description || "Nenhuma descrição fornecida."}
          </Text>

          {/* Verbose Footer (History style) */}
          {verboseStats ? (
            <View style={styles.occurrenceFooterLeft}>
              <View style={styles.occurrenceStats}>
                <View style={styles.occurrenceStatItem}>
                  <ThumbsUp size={14} color={theme.colors.text.secondary} />
                  <Text style={styles.occurrenceStatText}>
                    {occurrence.likesCount} {occurrence.likesCount === 1 ? "Confirmação" : "Confirmações"}
                  </Text>
                </View>
                <View style={styles.occurrenceStatItem}>
                  <MessageSquare size={14} color={theme.colors.text.secondary} />
                  <Text style={styles.occurrenceStatText}>
                    {occurrence.commentsCount} {occurrence.commentsCount === 1 ? "Comentário" : "Comentários"}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            /* Compact Footer (Feed style) */
            <View style={styles.occurrenceFooterRight}>
              <View style={styles.occurrenceStats}>
                <View style={styles.occurrenceStatItem}>
                  <ThumbsUp size={13} color={theme.colors.text.tertiary} />
                  <Text style={styles.occurrenceStatTextCompact}>{occurrence.likesCount}</Text>
                </View>
                <View style={styles.occurrenceStatItem}>
                  <MessageSquare size={13} color={theme.colors.text.tertiary} />
                  <Text style={styles.occurrenceStatTextCompact}>{occurrence.commentsCount}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Inline Image Attachment (History style) */}
          {showImage && occurrence.photoUrl && (
            <Image
              source={{ uri: occurrence.photoUrl }}
              style={styles.occurrenceImage}
              resizeMode="cover"
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
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
  occurrenceCard: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.card,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...cardShadow,
  },
  cardLayout: {
    flexDirection: "row",
    gap: 14,
  },
  occurrenceIconSquircle: {
    width: 46,
    height: 46,
    borderRadius: theme.borderRadius.squircle,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  occurrenceContent: {
    flex: 1,
  },
  occurrenceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  occurrenceTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.sm,
    alignSelf: "flex-start",
  },
  tagIcon: {
    marginRight: 4,
  },
  occurrenceTagText: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: theme.typography.fonts.semiBold,
  },
  occurrenceTime: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.tertiary,
    fontWeight: "500",
    fontFamily: theme.typography.fonts.medium,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
    marginBottom: 6,
  },
  locationText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    fontFamily: theme.typography.fonts.medium,
    fontWeight: "500",
  },
  occurrenceDesc: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.secondary,
    fontFamily: theme.typography.fonts.regular,
    lineHeight: 20,
  },
  occurrenceFooterRight: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  occurrenceFooterLeft: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 10,
    marginBottom: 6,
  },
  occurrenceStats: {
    flexDirection: "row",
    gap: 12,
  },
  occurrenceStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  occurrenceStatText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    fontWeight: "600",
    fontFamily: theme.typography.fonts.semiBold,
  },
  occurrenceStatTextCompact: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.tertiary,
    fontWeight: "600",
    fontFamily: theme.typography.fonts.semiBold,
  },
  occurrenceImage: {
    width: "100%",
    height: 160,
    borderRadius: theme.borderRadius.card,
    backgroundColor: theme.colors.borderLight,
    marginTop: 12,
  },
});

