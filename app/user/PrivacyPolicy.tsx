import React from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Platform,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";

export default function PrivacyPolicy() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();
  const styles = createStyles(colorScheme, fonts);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, fonts.spiritualLargeTitleFont]}>Privacy Policy</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          
          <Text style={[styles.lastUpdated, fonts.captionFont]}>
            Last updated: January 15, 2025
          </Text>

          <Text style={[styles.intro, fonts.spiritualBodyFont]}>
            At Circle, we believe your privacy is fundamental to creating meaningful connections. 
            This Privacy Policy explains how we collect, use, and protect your information when you use our app.
          </Text>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, fonts.spiritualLargeTitleFont]}>Information We Collect</Text>
            
            <Text style={[styles.subsectionTitle, fonts.buttonFont]}>Account Information</Text>
            <Text style={[styles.bodyText, fonts.spiritualBodyFont]}>
              • Name, email address, and phone number{'\n'}
              • Profile photos and bio information{'\n'}
              • Date of birth and location{'\n'}
              • Gender and preferences
            </Text>

            <Text style={[styles.subsectionTitle, fonts.buttonFont]}>Usage Information</Text>
            <Text style={[styles.bodyText, fonts.spiritualBodyFont]}>
              • How you interact with our app{'\n'}
              • Messages and matches{'\n'}
              • Device information and IP address{'\n'}
              • Location data (with your permission)
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, fonts.spiritualLargeTitleFont]}>How We Use Your Information</Text>
            <Text style={[styles.bodyText, fonts.spiritualBodyFont]}>
              We use your information to:{'\n\n'}
              • Provide and improve our matching service{'\n'}
              • Facilitate connections between users{'\n'}
              • Ensure safety and prevent fraud{'\n'}
              • Send important updates and notifications{'\n'}
              • Analyze app usage to enhance user experience
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, fonts.spiritualLargeTitleFont]}>Information Sharing</Text>
            <Text style={[styles.bodyText, fonts.spiritualBodyFont]}>
              We respect your privacy and do not sell your personal information. We may share information only:{'\n\n'}
              • With other users as part of the matching process{'\n'}
              • When required by law or to protect safety{'\n'}
              • With service providers who help operate our app{'\n'}
              • If our company is acquired or merged
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, fonts.spiritualLargeTitleFont]}>Data Security</Text>
            <Text style={[styles.bodyText, fonts.spiritualBodyFont]}>
              We implement industry-standard security measures to protect your data, including:{'\n\n'}
              • Encryption of sensitive information{'\n'}
              • Secure data transmission{'\n'}
              • Regular security audits{'\n'}
              • Limited access to personal data
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, fonts.spiritualLargeTitleFont]}>Your Rights</Text>
            <Text style={[styles.bodyText, fonts.spiritualBodyFont]}>
              You have the right to:{'\n\n'}
              • Access your personal information{'\n'}
              • Correct or update your data{'\n'}
              • Delete your account and data{'\n'}
              • Control privacy settings{'\n'}
              • Opt out of certain communications
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, fonts.spiritualLargeTitleFont]}>Data Retention</Text>
            <Text style={[styles.bodyText, fonts.spiritualBodyFont]}>
              We retain your information only as long as necessary to provide our services. 
              When you delete your account, we remove your personal information within 30 days, 
              except where required by law or for safety purposes.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, fonts.spiritualLargeTitleFont]}>Children's Privacy</Text>
            <Text style={[styles.bodyText, fonts.spiritualBodyFont]}>
              Circle is not intended for users under 18. We do not knowingly collect 
              information from children under 18. If we learn we have collected such information, 
              we will delete it immediately.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, fonts.spiritualLargeTitleFont]}>Changes to This Policy</Text>
            <Text style={[styles.bodyText, fonts.spiritualBodyFont]}>
              We may update this Privacy Policy from time to time. We will notify you of any 
              significant changes through the app or by email. Your continued use of Circle 
              after changes indicates your acceptance of the updated policy.
            </Text>
          </View>

          <View style={styles.contactSection}>
            <Text style={[styles.sectionTitle, fonts.spiritualLargeTitleFont]}>Contact Us</Text>
            <Text style={[styles.bodyText, fonts.spiritualBodyFont]}>
              If you have questions about this Privacy Policy or your data, please contact us:
            </Text>
            <Text style={[styles.contactText, fonts.buttonFont]}>
              Email: privacy@fullcircle.app{'\n'}
              Address: 123 Connection Ave, Berkeley, CA 94705
            </Text>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colorScheme: 'light' | 'dark', fonts: ReturnType<typeof useFont>) => {
  const colors = Colors[colorScheme];
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: Spacing.lg,
      // paddingTop: Platform.OS === 'ios' ? 60 : 40,
      padding: Spacing.lg,
      paddingBottom: Spacing.lg,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      padding: Spacing.xs,
      borderRadius: BorderRadius.full,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    headerTitle: {
      fontSize: Typography.sizes.xl,
      fontWeight: Typography.weights.bold,
      color: colors.textDark,
      letterSpacing: 0.5,
    },
    headerRight: {
      width: 24,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: Spacing.lg,
    },
    lastUpdated: {
      fontSize: Typography.sizes.sm,
      color: colors.textMuted,
      marginBottom: Spacing.xl,
      textAlign: 'center',
    },
    intro: {
      fontSize: Typography.sizes.base,
      color: colors.textLight,
      lineHeight: 24,
      marginBottom: Spacing.xl,
      textAlign: 'center',
    },
    section: {
      marginBottom: Spacing.xl,
    },
    sectionTitle: {
      fontSize: Typography.sizes.lg,
      fontWeight: Typography.weights.bold,
      color: colors.textDark,
      marginBottom: Spacing.md,
      letterSpacing: 0.3,
    },
    subsectionTitle: {
      fontSize: Typography.sizes.base,
      fontWeight: Typography.weights.semibold,
      color: '#8B4513',
      marginTop: Spacing.md,
      marginBottom: Spacing.sm,
    },
    bodyText: {
      fontSize: Typography.sizes.base,
      color: colors.textLight,
      lineHeight: 22,
      marginBottom: Spacing.sm,
    },
    contactSection: {
      marginTop: Spacing.xl,
      padding: Spacing.lg,
      backgroundColor: colors.card,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    contactText: {
      fontSize: Typography.sizes.base,
      color: '#8B4513',
      marginTop: Spacing.md,
      fontWeight: Typography.weights.medium,
    },
  });
};