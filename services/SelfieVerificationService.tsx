import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import functions from '@react-native-firebase/functions';
import * as FileSystem from 'expo-file-system';

export interface VerificationResult {
  success: boolean;
  verified: boolean;
  score: number;
  reason: string;
  timestamp: string;
}

export interface VerificationHistory {
  id: string;
  userId: string;
  verified: boolean;
  reason: string;
  similarityScore: number;
  confidence: number;
  timestamp: Date;
  selfieImage: string;
  status: 'verified' | 'failed';
}

export class SelfieVerificationService {
  /**
   * Test authentication with a simple function call
   */
  static async testAuthentication(): Promise<boolean> {
    try {
      console.log('🧪 Testing authentication...');
      
      const user = auth().currentUser;
      if (!user) {
        console.error('❌ No current user');
        return false;
      }

      console.log('✅ Current user:', user.uid);
      console.log('📧 User email:', user.email);
      console.log('🔍 User metadata:', {
        displayName: user.displayName,
        emailVerified: user.emailVerified,
        phoneNumber: user.phoneNumber,
        providerData: user.providerData.map(p => ({ providerId: p.providerId, uid: p.uid }))
      });
      
      // Get current ID token to check if it's valid
      const idTokenResult = await user.getIdTokenResult();
      console.log('🔑 Token claims:', {
        authTime: idTokenResult.authTime,
        issuedAtTime: idTokenResult.issuedAtTime,
        expirationTime: idTokenResult.expirationTime,
        signInProvider: idTokenResult.signInProvider,
        claims: idTokenResult.claims
      });
      
      // Test with a simple function call if available
      try {
        const testFunction = functions().httpsCallable('checkNotificationStatus');
        const result = await testFunction({});
        console.log('✅ Authentication test successful:', result.data);
      } catch (error: any) {
        console.log('ℹ️ Test function not available, but auth token is valid');
      }
      
      return true;
    } catch (error: any) {
      console.error('❌ Authentication test failed:', error);
      return false;
    }
  }

  /**
   * Convert image URI to base64 string
   */
  static async convertImageToBase64(imageUri: string): Promise<string> {
    try {
      console.log('🔄 Converting image to base64, input type:', typeof imageUri);
      console.log('🔄 Image URI preview:', imageUri.substring(0, 100));
      
      // If it's already a base64 string with data URL, return it
      if (imageUri.startsWith('data:image')) {
        console.log('✅ Image is already base64 with data URL');
        return imageUri.split(',')[1]; // Return just the base64 part
      }

      // If it's a file URI, convert it to base64
      if (imageUri.startsWith('file://') || imageUri.startsWith('/') || imageUri.startsWith('http')) {
        console.log('🔄 Converting file URI to base64');
        const base64 = await FileSystem.readAsStringAsync(imageUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        console.log('✅ File converted to base64, length:', base64.length);
        return base64; // Return just the base64 string, not data URL
      }

      // If it's already a base64 string without data URL prefix, return it
      if (imageUri.length > 100 && !imageUri.includes(' ') && !imageUri.includes('://')) {
        console.log('✅ Image appears to already be base64');
        return imageUri;
      }

      throw new Error('Unsupported image format or URI type');
    } catch (error: any) {
      console.error('❌ Error converting image to base64:', error);
      throw new Error('Failed to process image: ' + error.message);
    }
  }

  /**
   * Verify a selfie against the user's profile image
   */
  static async verifySelfie(
    imageUri: string, 
    profileImageUrl: string
  ): Promise<VerificationResult> {
    try {
      console.log('🔍 Starting selfie verification');
      console.log('📸 Image URI type:', typeof imageUri);
      console.log('📸 Profile image URL:', profileImageUrl);
      
      // Get current user
      const user = auth().currentUser;
      if (!user) {
        console.error('❌ User not authenticated');
        throw new Error('User not authenticated');
      }

      console.log('✅ User authenticated:', user.uid);
      console.log('📧 User email:', user.email);
      
      // Get fresh authentication token
      console.log('🔄 Getting fresh authentication token...');
      try {
        // Force refresh the token to ensure it's current and valid
        const idTokenResult = await user.getIdTokenResult(true);
        console.log('✅ Fresh token obtained:', {
          authTime: idTokenResult.authTime,
          expirationTime: idTokenResult.expirationTime,
          issuedAtTime: idTokenResult.issuedAtTime,
          signInProvider: idTokenResult.signInProvider
        });
        
        // Double check the token is not expired
        const now = new Date().getTime() / 1000;
        const expirationTime = new Date(idTokenResult.expirationTime).getTime() / 1000;
        if (expirationTime <= now) {
          throw new Error('Token is expired');
        }
        
        console.log('✅ Token is valid, expires in:', Math.round((expirationTime - now) / 60), 'minutes');
        
      } catch (tokenError: any) {
        console.error('❌ Token refresh failed:', tokenError);
        throw new Error('Failed to refresh authentication token: ' + tokenError.message);
      }
      
      // Convert image to base64
      console.log('🔄 Converting image to base64...');
      const imageBase64 = await this.convertImageToBase64(imageUri);
      console.log('✅ Image converted, base64 length:', imageBase64.length);
      
      // Validate image size (max 4MB in base64 - which is about 3MB original)
      const maxSize = 4 * 1024 * 1024; // 4MB
      if (imageBase64.length > maxSize) {
        throw new Error('Image is too large. Please use a smaller image (max 3MB).');
      }
      
      // Call the Firebase Cloud Function using React Native Firebase
      console.log('📡 Calling Firebase Cloud Function: verifySelfie');
      console.log('📤 Function call parameters:', {
        imageBase64Length: imageBase64.length,
        profileImageUrl: profileImageUrl,
        userId: user.uid
      });
      
      // Use React Native Firebase functions
      const verifySelfieFunction = functions().httpsCallable('verifySelfie');
      
      // Call the function
      const result = await verifySelfieFunction({
        imageBase64: imageBase64,
        profileImageUrl: profileImageUrl,
        userId: user.uid
      });
      
      console.log('✅ Cloud function response received:', result);
      console.log('📋 Response data:', result.data);
      
      const verificationData = result.data as VerificationResult;
      console.log('✅ Verification completed:', verificationData);
      
      // Update user's verification status in the main user document
      await this.updateUserVerificationStatus(verificationData.verified, verificationData.score);
      
      return verificationData;
      
    } catch (error: any) {
      console.error('❌ Selfie verification failed:', error);
      console.error('❌ Error type:', typeof error);
      console.error('❌ Error keys:', Object.keys(error));
      
      // Log the full error for debugging
      console.error('❌ Full error object:', JSON.stringify(error, null, 2));
      
      // Handle React Native Firebase specific errors
      if (error.code) {
        console.error('❌ Firebase error code:', error.code);
        console.error('❌ Firebase error message:', error.message);
        
        switch (error.code) {
          case 'functions/unauthenticated':
            throw new Error('Authentication failed. Please log out and log back in.');
          case 'functions/invalid-argument':
            throw new Error('Invalid image data. Please try again with a different photo.');
          case 'functions/internal':
            throw new Error('Server error during verification. Please try again later.');
          case 'functions/deadline-exceeded':
            throw new Error('Verification timed out. Please try again with a smaller image.');
          case 'functions/permission-denied':
            throw new Error('Permission denied. Please ensure you are logged in.');
          default:
            throw new Error(`Verification failed: ${error.message}`);
        }
      } else {
        // Handle other types of errors
        const errorMessage = error.message || error.toString() || 'Unknown error occurred';
        throw new Error(`Verification failed: ${errorMessage}`);
      }
    }
  }

  /**
   * Get verification history for a user
   */
  static async getVerificationHistory(): Promise<VerificationHistory[]> {
    try {
      const user = auth().currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Ensure user has a fresh token
      await user.getIdTokenResult(true);
      
      // Call the Firebase Cloud Function
      const getHistoryFunction = functions().httpsCallable('getVerificationHistory');
      
      const result = await getHistoryFunction({
        userId: user.uid
      });

      // Handle different response formats
      const verifications = Array.isArray(result.data)
        ? result.data
        : (result.data && Array.isArray((result.data as any).verifications))
          ? (result.data as any).verifications
          : [];

      return verifications as VerificationHistory[];
    } catch (error: any) {
      console.error('Failed to get verification history:', error);
      throw new Error('Failed to load verification history: ' + (error.message || error.toString()));
    }
  }

  /**
   * Update user's verification status in local context
   */
  static async updateUserVerificationStatus(verified: boolean, score?: number): Promise<void> {
    try {
      const user = auth().currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const userRef = firestore().collection('users').doc(user.uid);
      const updateData: any = {
        'settings.selfieVerification.isVerified': verified,
        'settings.selfieVerification.verifiedAt': verified ? firestore.FieldValue.serverTimestamp() : null,
        'settings.selfieVerification.status': verified ? 'verified' : 'failed',
        'settings.selfieVerification.reason': verified ? 'Verification successful' : 'Verification failed',
        'settings.selfieVerification.lastAttemptAt': firestore.FieldValue.serverTimestamp(),
        'settings.selfieVerification.lastVerifiedAt': verified ? firestore.FieldValue.serverTimestamp() : null,
      };
      
      // Clean up old fields
      const cleanupData = {
        'settings.isSelfieVerified': firestore.FieldValue.delete(),
        'settings.selfieVerificationDate': firestore.FieldValue.delete(),
        'verificationScore': firestore.FieldValue.delete()
      };
      
      await userRef.update({
        ...updateData,
        ...cleanupData
      });
      
      console.log('✅ User verification status updated in Firestore');
    } catch (error: any) {
      console.error('❌ Failed to update user verification status:', error);
      throw new Error('Failed to update verification status: ' + (error.message || error.toString()));
    }
  }

  /**
   * Validate image before sending for verification
   */
  static validateImage(imageUri: string): { valid: boolean; error?: string } {
    if (!imageUri) {
      return { valid: false, error: 'No image provided' };
    }

    // Check if image is a valid URI or base64
    if (!imageUri.startsWith('data:') && !imageUri.startsWith('http') && 
        !imageUri.startsWith('file://') && !imageUri.startsWith('/')) {
      return { valid: false, error: 'Invalid image format or URI' };
    }

    // Check if base64 data is too large (max 4MB base64 = ~3MB original)
    if (imageUri.startsWith('data:') && imageUri.length > 4000000) {
      return { valid: false, error: 'Image is too large (max 3MB)' };
    }

    return { valid: true };
  }

  /**
   * Get profile image URL for comparison
   */
  static getProfileImageUrl(userData: any): string | null {
    // Try to get the first profile photo
    if (userData.photos && userData.photos.length > 0) {
      return userData.photos[0];
    }
    
    // Fallback to profile image
    if (userData.profileImage) {
      return userData.profileImage;
    }

    // Check if it's in settings
    if (userData.settings?.profileImage) {
      return userData.settings.profileImage;
    }

    return null;
  }
}