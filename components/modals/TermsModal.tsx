import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useColorScheme,
  Platform,
  Dimensions,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";

const { height: screenHeight } = Dimensions.get('window');

interface TermsModalProps {
  visible: boolean;
  onClose: () => void;
  type: 'terms' | 'privacy';
}

export default function TermsModal({ visible, onClose, type }: TermsModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();
  const styles = createStyles(colorScheme, fonts);

  const getContent = () => {
    if (type === 'terms') {
      return {
        title: 'Terms of Service',
        lastUpdated: 'Last updated: January 15, 2025',
        content: [
          {
            section: 'Acceptance of Terms',
            text: 'By creating an account or using Circle, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our app.'
          },
          {
            section: 'Eligibility',
            text: 'You must be at least 18 years old to use Circle. By using our app, you represent that you are at least 18 years of age, have the legal capacity to enter into this agreement, will comply with all applicable laws, and all information you provide is accurate and truthful.'
          },
          {
            section: 'Account Guidelines',
            text: 'Use your real name and accurate information. Upload genuine, recent photos of yourself. One account per person. Keep your login information secure. You may not post content that is inappropriate, offensive, harmful, false, misleading, sexually explicit, promotes illegal activities, or violates others\' privacy or rights.'
          },
          {
            section: 'User Conduct',
            text: 'You agree to treat other users with respect and kindness, use Circle only for its intended purpose, not harass, spam, or abuse other users, report inappropriate behavior, not use the app for commercial purposes, and respect others\' boundaries and consent.'
          },
          {
            section: 'Safety and Security',
            text: 'While we strive to provide a safe environment, you acknowledge that you are responsible for your own safety when meeting users. We recommend meeting in public places. We cannot guarantee the identity or intentions of other users. You should report any suspicious or inappropriate behavior.'
          },
          {
            section: 'Subscription and Payments',
            text: 'For Circle premium features: Subscriptions automatically renew unless cancelled. You can cancel anytime through your device settings. No refunds for unused portions of subscriptions. Prices may change with 30 days notice.'
          },
          {
            section: 'Termination',
            text: 'We may terminate or suspend your account if you violate these Terms of Service, engage in harmful or inappropriate behavior, provide false information, or use the app for illegal purposes. You may delete your account at any time through the app settings.'
          },
          {
            section: 'Contact Us',
            text: 'If you have questions about these Terms of Service, please contact us at legal@fullcircle.app'
          }
        ]
      };
    } else {
      return {
        title: 'Privacy Policy',
        lastUpdated: 'Last updated: January 15, 2025',
        content: [
          {
            section: 'Information We Collect',
            text: 'We collect account information including name, email address, phone number, profile photos, bio information, date of birth, location, gender, and preferences. We also collect usage information such as how you interact with our app, messages and matches, device information, IP address, and location data (with your permission).'
          },
          {
            section: 'How We Use Your Information',
            text: 'We use your information to provide and improve our matching service, facilitate connections between users, ensure safety and prevent fraud, send important updates and notifications, and analyze app usage to enhance user experience.'
          },
          {
            section: 'Information Sharing',
            text: 'We respect your privacy and do not sell your personal information. We may share information only with other users as part of the matching process, when required by law or to protect safety, with service providers who help operate our app, or if our company is acquired or merged.'
          },
          {
            section: 'Data Security',
            text: 'We implement industry-standard security measures to protect your data, including encryption of sensitive information, secure data transmission, regular security audits, and limited access to personal data.'
          },
          {
            section: 'Your Rights',
            text: 'You have the right to access your personal information, correct or update your data, delete your account and data, control privacy settings, and opt out of certain communications.'
          },
          {
            section: 'Data Retention',
            text: 'We retain your information only as long as necessary to provide our services. When you delete your account, we remove your personal information within 30 days, except where required by law or for safety purposes.'
          },
          {
            section: 'Children\'s Privacy',
            text: 'Circle is not intended for users under 18. We do not knowingly collect information from children under 18. If we learn we have collected such information, we will delete it immediately.'
          },
          {
            section: 'Contact Us',
            text: 'If you have questions about this Privacy Policy or your data, please contact us at privacy@fullcircle.app'
          }
        ]
      };
    }
  };

  const content = getContent();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, fonts.spiritualTitleFont]}>
              {content.title}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textDark} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
              <Text style={[styles.lastUpdated, fonts.captionFont]}>
                {content.lastUpdated}
              </Text>

              {content.content.map((section, index) => (
                <View key={index} style={styles.section}>
                  <Text style={[styles.sectionTitle, fonts.spiritualTitleFont]}>
                    {section.section}
                  </Text>
                  <Text style={[styles.bodyText, fonts.spiritualBodyFont]}>
                    {section.text}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colorScheme: 'light' | 'dark', fonts: ReturnType<typeof useFont>) => {
  const colors = Colors[colorScheme];
  
  return StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      width: '95%',
      maxWidth: 450,
      height: screenHeight * 0.85,
      backgroundColor: colors.background,
      borderRadius: BorderRadius.xl,
      overflow: 'hidden',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
        },
        android: {
          elevation: 20,
        },
      }),
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.card,
    },
    headerTitle: {
      fontSize: Typography.sizes.sm,
      fontWeight: Typography.weights.bold,
      color: colors.textDark,
      flex: 1,
      textAlign: 'center',
    },
    closeButton: {
      padding: Spacing.xs,
      borderRadius: BorderRadius.full,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: Spacing.xl,
    },
    lastUpdated: {
      fontSize: 10,
      color: colors.textMuted,
      marginBottom: Spacing.md,
      textAlign: 'center',
    },
    section: {
      marginBottom: Spacing.md,
    },
    sectionTitle: {
      fontSize: Typography.sizes.xs,
      fontWeight: Typography.weights.semibold,
      color: colors.textDark,
      marginBottom: Spacing.sm,
      letterSpacing: 0.1,
    },
    bodyText: {
      fontSize: 11,
      color: colors.textLight,
      lineHeight: 16,
    },
  });
}; 