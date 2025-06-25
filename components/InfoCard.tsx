import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";
import { UserDataType } from "@/context/UserContext";

type InfoCardProps = {
  title: string;
  content: string;
  icon?: string; // Ionicon name for the card type
  pillsData?: string[]; // For arrays like practices, modalities, etc.
};

const InfoCard: React.FC<InfoCardProps> = ({
  title,
  content,
  icon = "information-circle",
  pillsData = [],
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const styles = createStyles(colors, fonts);

  // Check if content needs truncation
  const shouldTruncate = pillsData.length > 4 || content.length > 120;
  const canExpand = shouldTruncate;

  const renderContent = () => {
    // If we have pills data (for practices, modalities, etc.), render as pills
    if (pillsData.length > 0) {
      const displayItems = isExpanded ? pillsData : pillsData.slice(0, 4);
      const hasMore = pillsData.length > 4;
      
      return (
        <View style={styles.pillsContainer}>
          {displayItems.map((item, index) => (
            <View key={index} style={styles.pill}>
              <Text style={styles.pillText}>{item}</Text>
            </View>
          ))}
          {hasMore && !isExpanded && (
            <TouchableOpacity 
              style={[styles.pill, styles.expandPill]}
              onPress={() => setIsExpanded(true)}
              activeOpacity={0.7}
            >
              <Text style={[styles.pillText, styles.expandPillText]}>
                +{pillsData.length - 4} more
              </Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    // Otherwise render as regular text
    const displayText = isExpanded ? content : content;
    const shouldTruncateText = content.length > 120 && !isExpanded;
    
    return (
      <Text 
        style={styles.infoContent} 
        numberOfLines={shouldTruncateText ? 3 : undefined} 
        ellipsizeMode="tail"
      >
        {displayText}
      </Text>
    );
  };

  return (
    <TouchableOpacity 
      style={styles.infoCard}
      onPress={() => canExpand && setIsExpanded(!isExpanded)}
      activeOpacity={canExpand ? 0.95 : 1}
      disabled={!canExpand}
    >
      {/* Header with icon and title */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons 
            name={icon as any} 
            size={20} 
            color={colors.primary} 
            style={styles.titleIcon}
          />
          <Text style={styles.infoTitle}>{title}</Text>
        </View>
        
        {/* Expand/Collapse indicator */}
        {canExpand && (
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={16}
            color={colors.textMuted}
            style={styles.expandIcon}
          />
        )}
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        {renderContent()}
      </View>

      {/* Expand hint for text content */}
      {canExpand && !isExpanded && pillsData.length === 0 && (
        <TouchableOpacity 
          style={styles.expandHint}
          onPress={() => setIsExpanded(true)}
          activeOpacity={0.7}
        >
          <Text style={[styles.expandHintText, fonts.spiritualBodyFont, { color: colors.primary }]}>
            Tap to read more
          </Text>
        </TouchableOpacity>
      )}

      {/* Collapse hint when expanded */}
      {isExpanded && (
        <TouchableOpacity 
          style={styles.collapseHint}
          onPress={() => setIsExpanded(false)}
          activeOpacity={0.7}
        >
          <Text style={[styles.collapseHintText, fonts.spiritualBodyFont, { color: colors.textMuted }]}>
            Tap to show less
          </Text>
        </TouchableOpacity>
      )}

      {/* Subtle divider for visual separation */}
      <View style={styles.bottomDivider} />
    </TouchableOpacity>
  );
};

const createStyles = (colors: any, fonts: any) => StyleSheet.create({
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginVertical: Spacing.md,
    width: "100%",
    shadowColor: colors.textDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  
  expandIcon: {
    marginLeft: Spacing.sm,
    opacity: 0.6,
  },
  
  titleIcon: {
    marginRight: Spacing.sm,
  },
  
  infoTitle: {
    ...fonts.spiritualBodyFont,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  
  contentContainer: {
    minHeight: 40, // Ensures consistent card height
  },
  
  infoContent: {
    ...fonts.spiritualBodyFont,
    fontSize: Typography.sizes.base,
    lineHeight: Typography.sizes.base * 1.4,
    color: colors.textLight,
    textAlign: "left",
  },
  
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  
  pill: {
    backgroundColor: colors.primary + '20',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  
  expandPill: {
    backgroundColor: colors.accent + '15',
    borderColor: colors.accent + '30',
  },
  
  expandPillText: {
    color: colors.accent,
    fontStyle: 'italic',
  },
  
  pillText: {
    ...fonts.spiritualBodyFont,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: colors.primary,
  },
  
  morePill: {
    backgroundColor: colors.accent + '20',
    borderColor: colors.accent + '40',
  },
  
  morePillText: {
    color: colors.accent,
    fontStyle: 'italic',
  },
  
  expandHint: {
    alignSelf: 'center',
    marginTop: Spacing.sm,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  
  expandHintText: {
    fontSize: Typography.sizes.xs,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  
  collapseHint: {
    alignSelf: 'center',
    marginTop: Spacing.sm,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  
  collapseHintText: {
    fontSize: Typography.sizes.xs,
    fontStyle: 'italic',
    textAlign: 'center',
    opacity: 0.7,
  },
  
  bottomDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginTop: Spacing.lg,
    width: '100%',
    opacity: 0.5,
  },
});

export default InfoCard;