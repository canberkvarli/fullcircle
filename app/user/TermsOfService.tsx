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

export default function TermsOfService() {
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
        <Text style={[styles.headerTitle, fonts.spiritualLargeTitleFont]}>Terms of Service</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          
          <Text style={[styles.lastUpdated, fonts.captionFont]}>
            Last updated: January 15, 2025
          </Text>

          <Text style={[styles.intro, fonts.spiritualBodyFont]}>
            Welcome to Circle. By using our app, you agree to these Terms of Service. 
            Please read them carefully as they govern your use of our platform.
          </Text>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, fonts.spiritualLargeTitleFont]}>Acceptance of Terms</Text>
            <Text style={[styles.bodyText, fonts.spiritualBodyFont]}>
              By creating an account or using Circle, you agree to be bound by these Terms of Service 
              and our Privacy Policy. If you do not agree to these terms, please do not use our app.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, fonts.spiritualLargeTitleFont]}>Eligibility</Text>
            <Text style={[styles.bodyText, fonts.spiritualBodyFont]}>
              You must be at least 18 years old to use Circle. By using our app, you represent that:{'\n\n'}
              • You are at least 18 years of age{'\n'}
              • You have the legal capacity to enter into this agreement{'\n'}
              • You will comply with all applicable laws{'\n'}
              • All information you provide is accurate and truthful
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, fonts.spiritualLargeTitleFont]}>Account Guidelines</Text>
            
            <Text style={[styles.subsectionTitle, fonts.buttonFont]}>Profile Requirements</Text>
            <Text style={[styles.bodyText, fonts.spiritualBodyFont]}>
              • Use your real name and accurate information{'\n'}
              • Upload genuine, recent photos of yourself{'\n'}
              • One account per person{'\n'}
              • Keep your login information secure
            </Text>

            <Text style={[styles.subsectionTitle, fonts.buttonFont]}>Prohibited Content</Text>
            <Text style={[styles.bodyText, fonts.spiritualBodyFont]}>
              You may not post content that is:{'\n\n'}
              • Inappropriate, offensive, or harmful{'\n'}
              • False, misleading, or impersonating others{'\n'}
              • Sexually explicit or contains nudity{'\n'}
              • Promotes illegal activities{'\n'}
              • Violates others' privacy or rights
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, fonts.spiritualLargeTitleFont]}>User Conduct</Text>
            <Text style={[styles.bodyText, fonts.spiritualBodyFont]}>
              You agree to:{'\n\n'}
              • Treat other users with respect and kindness{'\n'}
              • Use Circle only for its intended purpose{'\n'}
              • Not harass, spam, or abuse other users{'\n'}
              • Report inappropriate behavior{'\n'}
              • Not use the app for commercial purposes{'\n'}
              • Respect others' boundaries and consent
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, fonts.spiritualLargeTitleFont]}>Safety and Security</Text>
            <Text style={[styles.bodyText, fonts.spiritualBodyFont]}>
              While we strive to provide a safe environment, you acknowledge that:{'\n\n'}
              • You are responsible for your own safety when meeting users{'\n'}
              • We recommend meeting in public places{'\n'}
              • We cannot guarantee the identity or intentions of other users{'\n'}
              • You should report any suspicious or inappropriate behavior{'\n'}
              • We reserve the right to remove users who violate our guidelines
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, fonts.spiritualLargeTitleFont]}>Subscription and Payments</Text>
            <Text style={[styles.bodyText, fonts.spiritualBodyFont]}>
              For Circle premium features:{'\n\n'}
              • Subscriptions automatically renew unless cancelled{'\n'}
              • You can cancel anytime through your device settings{'\n'}
              • No refunds for unused portions of subscriptions{'\n'}
              • Prices may change with 30 days notice{'\n'}
              • Premium features are subject to availability
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, fonts.spiritualLargeTitleFont]}>Intellectual Property</Text>
            <Text style={[styles.bodyText, fonts.spiritualBodyFont]}>
              • Circle owns all rights to the app and its content{'\n'}
              • You retain rights to content you create{'\n'}
              • By posting content, you grant us permission to use it within our service{'\n'}
              • You may not copy, modify, or distribute our app without permission
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, fonts.spiritualLargeTitleFont]}>Termination</Text>
            <Text style={[styles.bodyText, fonts.spiritualBodyFont]}>
              We may terminate or suspend your account if you:{'\n\n'}
              • Violate these Terms of Service{'\n'}
              • Engage in harmful or inappropriate behavior{'\n'}
              • Provide false information{'\n'}
              • Use the app for illegal purposes{'\n\n'}
              You may delete your account at any time through the app settings.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, fonts.spiritualLargeTitleFont]}>Disclaimer</Text>
            <Text style={[styles.bodyText, fonts.spiritualBodyFont]}>
              Circle is provided "as is" without warranties of any kind. We do not guarantee:{'\n\n'}
              • That you will find compatible matches{'\n'}
              • Uninterrupted or error-free service{'\n'}
              • The accuracy of user-provided information{'\n'}
              • The outcome of any connections made through our app
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, fonts.spiritualLargeTitleFont]}>Limitation of Liability</Text>
            <Text style={[styles.bodyText, fonts.spiritualBodyFont]}>
              To the fullest extent permitted by law, Circle shall not be liable for any indirect, 
              incidental, special, or consequential damages arising from your use of the app, including 
              but not limited to damages for personal injury, emotional distress, or loss of data.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, fonts.spiritualLargeTitleFont]}>Changes to Terms</Text>
            <Text style={[styles.bodyText, fonts.spiritualBodyFont]}>
              We may update these Terms of Service from time to time. We will notify you of any 
              material changes through the app or by email. Your continued use of Circle after 
              changes indicates your acceptance of the updated terms.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, fonts.spiritualLargeTitleFont]}>Governing Law</Text>
            <Text style={[styles.bodyText, fonts.spiritualBodyFont]}>
              These Terms of Service shall be governed by and construed in accordance with the laws 
              of the State of California, without regard to its conflict of law provisions.
            </Text>
          </View>

          <View style={styles.contactSection}>
            <Text style={[styles.sectionTitle, fonts.spiritualLargeTitleFont]}>Contact Us</Text>
            <Text style={[styles.bodyText, fonts.spiritualBodyFont]}>
              If you have questions about these Terms of Service, please contact us:
            </Text>
            <Text style={[styles.contactText, fonts.buttonFont]}>
              Email: legal@fullcircle.app{'\n'}
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