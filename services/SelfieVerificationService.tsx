import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import functions from '@react-native-firebase/functions';

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
   * Verify a selfie against the user's profile image
   */
  static async verifySelfie(
    imageBase64: string, 
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
      
      // Ensure user is recently authenticated
      const tokenResult = await user.getIdTokenResult(true);
      if (!tokenResult.token) {
        console.error('❌ Failed to get authentication token');
        throw new Error('Authentication token not available');
      }
      
      console.log('✅ Authentication token refreshed');
      
      // Format image data properly
      let processedImageBase64 = imageBase64;
      if (imageBase64.startsWith('data:image')) {
        // Extract base64 content from data URL
        processedImageBase64 = imageBase64.split(',')[1];
        console.log('✅ Image data processed');
      }
      
      // Call the Firebase Cloud Function
      console.log('📡 Calling Firebase Cloud Function: verifySelfie');
      const verifySelfieFunction = functions().httpsCallable('verifySelfie');
      
      const result = await verifySelfieFunction({
        imageBase64: processedImageBase64,
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
      const getHistoryFunction = functions().httpsCallable('getVerificationHistory');
      
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