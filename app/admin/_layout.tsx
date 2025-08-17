import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useRouter, Slot } from 'expo-router';
import { useFont } from '@/hooks/useFont';
import { Colors, Typography, Spacing } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { FUNCTIONS } from '@/services/FirebaseConfig';
import auth from '@react-native-firebase/auth';

export default function AdminLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [user, setUser] = useState<any>(null);
  const fonts = useFont();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const currentUser = auth().currentUser;
        if (!currentUser) {
          console.log('❌ No authenticated user');
          router.replace('/user/UserSettings');
          return;
        }

        setUser(currentUser);
        
        // TEMPORARY: Skip Cloud Function check for now to allow access
        // TODO: Uncomment this once the Cloud Function is deployed
        /*
        // Check if user has admin privileges
        const result = await FUNCTIONS.httpsCallable('checkAdminAccess')({
          userId: currentUser.uid
        });
        
        const data = result.data as any;
        if (data.isAdmin) {
          setIsAuthorized(true);
        } else {
          console.log('❌ User not authorized for admin access');
          Alert.alert(
            'Access Denied',
            'You do not have permission to access the admin panel.',
            [{ text: 'OK', onPress: () => router.replace('/user/UserSettings') }]
          );
        }
        */
        
        // TEMPORARY: Allow access for now
        console.log('✅ Temporarily allowing admin access for user:', currentUser.uid);
        setIsAuthorized(true);
        
      } catch (error: any) {
        console.error('❌ Admin access check failed:', error);
        // TEMPORARY: Allow access even if there's an error
        console.log('✅ Temporarily allowing admin access due to error');
        setIsAuthorized(true);
        
        // TODO: Uncomment this once the Cloud Function is deployed
        /*
        Alert.alert(
          'Access Check Failed',
          'Unable to verify admin privileges. Please try again.',
          [{ text: 'OK', onPress: () => router.replace('/user/UserSettings') }]
        );
        */
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAccess();
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, fonts.spiritualBodyFont, { color: colors.textDark }]}>
            Verifying admin access...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isAuthorized) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.unauthorizedContainer}>
          <Text style={[styles.unauthorizedTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>
            🚫 Access Denied
          </Text>
          <Text style={[styles.unauthorizedText, fonts.spiritualBodyFont, { color: colors.textMuted }]}>
            You do not have permission to access the admin panel.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return <Slot />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slot: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  loadingText: {
    fontSize: Typography.sizes.base,
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  unauthorizedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  unauthorizedTitle: {
    fontSize: Typography.sizes.xl,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  unauthorizedText: {
    fontSize: Typography.sizes.base,
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: Typography.sizes.base * 1.4,
  },
});
