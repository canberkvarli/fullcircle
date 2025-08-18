import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import functions from '@react-native-firebase/functions';
import * as FileSystem from 'expo-file-system';
import { FUNCTIONS } from './FirebaseConfig';

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
      
      // Test with a simple function call
      const testFunction = FUNCTIONS.httpsCallable('checkNotificationStatus');
      const result = await testFunction({});
      
      console.log('✅ Authentication test successful:', result.data);
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
      // If it's already a base64 string, return it
      if (imageUri.startsWith('data:image')) {
        return imageUri;
      }

      // If it's a file URI, convert it to base64
      if (imageUri.startsWith('file://') || imageUri.startsWith('http')) {
        const base64 = await FileSystem.readAsStringAsync(imageUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        // Determine MIME type from file extension or default to jpeg
        const extension = imageUri.split('.').pop()?.toLowerCase();
        let mimeType = 'image/jpeg';
        
        if (extension === 'png') {
          mimeType = 'image/png';
        } else if (extension === 'gif') {
          mimeType = 'image/gif';
        } else if (extension === 'webp') {
          mimeType = 'image/webp';
        }
        
        return `data:${mimeType};base64,${base64}`;
      }

      // If it's already a base64 string without data URL prefix, add it
      if (imageUri.length > 100 && !imageUri.includes(' ')) {
        return `data:image/jpeg;base64,${imageUri}`;
      }

      throw new Error('Unsupported image format');
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw new Error('Failed to process image. Please try again.');
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
      
      // Get current user
      const user = auth().currentUser;
      if (!user) {
        console.error('❌ User not authenticated');
        throw new Error('User not authenticated');
      }

      console.log('✅ User authenticated:', user.uid);
      console.log('📧 User email:', user.email);
      console.log('🔑 User provider:', user.providerData[0]?.providerId);
      
      // Check if user needs re-authentication
      const needsReauth = await user.getIdTokenResult(false);
      console.log('🔄 Current token info:', {
        hasToken: !!needsReauth.token,
        tokenExpiration: needsReauth.expirationTime,
        isExpired: new Date(needsReauth.expirationTime) < new Date(),
        authTime: needsReauth.authTime
      });
      
      // Ensure user is recently authenticated
      console.log('🔄 Refreshing authentication token...');
      const tokenResult = await user.getIdTokenResult(true);
      if (!tokenResult.token) {
        console.error('❌ Failed to get authentication token');
        throw new Error('Authentication token not available');
      }
      
      console.log('✅ Authentication token refreshed');
      console.log('🆕 New token info:', {
        hasToken: !!tokenResult.token,
        tokenExpiration: tokenResult.expirationTime,
        authTime: tokenResult.authTime
      });

      // Force token refresh to ensure it's valid
      console.log('🔄 Force refreshing token...');
      const freshToken = await user.getIdToken(true);
      console.log('✅ Fresh token obtained, length:', freshToken.length);
      console.log('🔑 Token preview:', freshToken.substring(0, 50) + '...');
      
      // Verify the token is valid
      try {
        const decodedToken = await user.getIdTokenResult(true);
        console.log('🔍 Token verification result:', {
          claims: decodedToken.claims,
          authTime: decodedToken.authTime,
          expirationTime: decodedToken.expirationTime,
          issuedAtTime: decodedToken.issuedAtTime,
          signInProvider: decodedToken.signInProvider
        });
      } catch (tokenError) {
        console.error('❌ Token verification failed:', tokenError);
        throw new Error('Authentication token verification failed');
      }
      
      // Convert image to base64
      console.log('🔄 Converting image to base64');
      const imageBase64 = await this.convertImageToBase64(imageUri);
      console.log('✅ Image converted to base64');
      console.log('📏 Image base64 length:', imageBase64.length);
      console.log('📊 Image data preview:', imageBase64.substring(0, 100) + '...');
      
      // Validate image size (max 10MB in base64)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (imageBase64.length > maxSize) {
        throw new Error('Image is too large. Please use a smaller image.');
      }
      
      // Call the Firebase Cloud Function
      console.log('📡 Calling Firebase Cloud Function: verifySelfie');
      console.log('📤 Sending data to function:', {
        imageBase64Length: imageBase64.length,
        profileImageUrl,
        userId: user.uid
      });
      
      const verifySelfieFunction = FUNCTIONS.httpsCallable('verifySelfie');
      
      const result = await verifySelfieFunction({
        imageBase64,
        profileImageUrl,
        userId: user.uid
      });
      
      const verificationData = result.data as VerificationResult;
      console.log('✅ Verification completed:', verificationData);
      
      // Update user's verification status in the main user document
      await this.updateUserVerificationStatus(verificationData.verified, verificationData.score);
      
      return verificationData;
    } catch (error: any) {
      console.error('❌ Selfie verification failed:', error);
      console.error('❌ Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        stack: error.stack
      });
      
      // Improve error handling with specific messages
      if (error.code === 'functions/unauthenticated') {
        throw new Error('Authentication failed. Please log out and log back in.');
      } else if (error.code === 'functions/invalid-argument') {
        throw new Error('Invalid image data. Please try again with a different photo.');
      } else if (error.code === 'functions/internal') {
        throw new Error('Server error during verification. Please try again later.');
      } else {
        throw new Error(error.message || 'Verification failed. Please try again.');
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

      // Ensure user is recently authenticated
      await user.getIdTokenResult(true);
      
      // Call the Firebase Cloud Function
      const getHistoryFunction = FUNCTIONS.httpsCallable('getVerificationHistory');
      
      const result = await getHistoryFunction({
        userId: user.uid
      });

      const verifications = Array.isArray(result.data)
        ? result.data
        : (result.data && Array.isArray((result.data as any).verifications))
          ? (result.data as any).verifications
          : [];

      return verifications as VerificationHistory[];
    } catch (error: any) {
      console.error('Failed to get verification history:', error);
      throw new Error('Failed to load verification history');
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
      await userRef.update({
        'settings.isSelfieVerified': verified,
        'settings.selfieVerificationDate': verified ? new Date() : null,
        ...(score && { verificationScore: score })
      });
      
      console.log('✅ User verification status updated');
    } catch (error: any) {
      console.error('Failed to update user verification status:', error);
      throw new Error('Failed to update verification status');
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
    if (!imageUri.startsWith('data:') && !imageUri.startsWith('http') && !imageUri.startsWith('file://')) {
      return { valid: false, error: 'Invalid image format' };
    }

    // Check if base64 data is too large (max 1MB)
    if (imageUri.startsWith('data:') && imageUri.length > 1000000 * 1.37) { // ~1MB in base64
      return { valid: false, error: 'Image is too large (max 1MB)' };
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

    return null;
  }
}