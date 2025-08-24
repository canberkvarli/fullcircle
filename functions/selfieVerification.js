// selfieVerification.js - Updated for Cloud Functions v2
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { setGlobalOptions } = require('firebase-functions/v2');
const admin = require('firebase-admin');
const vision = require('@google-cloud/vision');
const configLoader = require('./configLoader');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

// Set global options for v2
setGlobalOptions({
  region: 'us-central1',
  maxInstances: 10,
  memory: '1GiB',
  timeoutSeconds: 60
});

// Initialize Firestore
const db = admin.firestore();

// Initialize Google Cloud Vision client using configLoader with error handling
let visionClient;
try {
  console.log('🔧 Initializing Google Cloud Vision client...');
  const credentials = configLoader.get('visionCredentials');
  const projectId = configLoader.get('projectId');
  
  console.log('🔧 Vision credentials loaded:', !!credentials);
  console.log('🔧 Project ID loaded:', projectId);
  
  if (!credentials || !projectId) {
    throw new Error('Missing required configuration for Google Cloud Vision');
  }
  
  visionClient = new vision.ImageAnnotatorClient({
    credentials: credentials,
    projectId: projectId
  });
  
  console.log('✅ Google Cloud Vision client initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Google Cloud Vision client:', error);
  visionClient = null;
}



// Function to verify selfie using Google Cloud Vision API - V2 Format
exports.verifySelfie = onCall({
  cors: true,
  region: 'us-central1'
}, async (request) => {
  const { data, auth } = request;
  
  console.log('🔍 verifySelfie function called');
  console.log('📊 Request data:', {
    hasImageBase64: !!data.imageBase64,
    hasProfileImageUrl: !!data.profileImageUrl,
    hasUserId: !!data.userId,
    imageBase64Length: data.imageBase64 ? data.imageBase64.length : 0
  });
  
  // Check if vision client is available
  if (!visionClient) {
    console.error('❌ Google Cloud Vision client not initialized');
    throw new HttpsError('internal', 'Image analysis service not available');
  }
  
  // Ensure user is authenticated
  if (!auth) {
    console.error('❌ User not authenticated - auth is missing');
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Log authentication info for debugging
  console.log('✅ Authentication context:', {
    uid: auth.uid,
    token: auth.token ? 'Present' : 'Missing',
    email: auth.token?.email || 'Not available'
  });

  const { imageBase64, profileImageUrl, userId } = data;

  // Validate input parameters
  if (!imageBase64 || !profileImageUrl || !userId) {
    console.error('❌ Missing required parameters:', {
      hasImageBase64: !!imageBase64,
      hasProfileImageUrl: !!profileImageUrl,
      hasUserId: !!userId
    });
    throw new HttpsError('invalid-argument', 'Missing required parameters');
  }

  // Ensure the requesting user is the same as the userId
  if (auth.uid !== userId) {
    console.error('❌ User ID mismatch:', {
      authUid: auth.uid,
      requestUserId: userId
    });
    throw new HttpsError('permission-denied', 'You can only verify your own selfie');
  }

  try {
    console.log('🚀 Starting selfie verification process');
    
    // 1. Analyze the selfie image
    console.log('🔍 Analyzing selfie image');
    const selfieAnalysis = await analyzeImage(imageBase64);
    console.log('✅ Selfie analysis completed');
    
    // 2. Analyze the profile image
    console.log('🔍 Analyzing profile image');
    let profileAnalysis;
    if (profileImageUrl.startsWith('data:')) {
      profileAnalysis = await analyzeImage(profileImageUrl.split(',')[1]);
    } else {
      profileAnalysis = await analyzeImageFromUrl(profileImageUrl);
    }
    console.log('✅ Profile analysis completed');

    // 3. Compare the two images for similarity
    console.log('🔍 Comparing images');
    const similarityScore = await compareImages(imageBase64, profileImageUrl);
    console.log('✅ Image comparison completed');
    
    // 4. Perform face detection and quality checks
    console.log('🔍 Detecting faces');
    const faceDetection = await detectFaces(imageBase64);
    console.log('✅ Face detection completed');
    
    // 5. Determine verification result
    console.log('🔍 Determining verification result');
    const verificationResult = determineVerificationResult(
      selfieAnalysis, 
      profileAnalysis, 
      similarityScore, 
      faceDetection
    );
    console.log('✅ Verification result determined:', verificationResult);

    // 6. Store verification result in Firestore
    console.log('💾 Storing verification result');
    await storeVerificationResult(userId, verificationResult);
    console.log('✅ Verification result stored');

    console.log('🎉 Verification completed successfully:', verificationResult);
    return {
      success: true,
      verified: verificationResult.verified,
      score: verificationResult.similarityScore,
      reason: verificationResult.reason,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ Selfie verification error:', error);
    console.error('❌ Error stack:', error.stack);
    throw new HttpsError('internal', 'Verification failed: ' + error.message);
  }
});

// Import HttpsError from v2 - moved to top

async function analyzeImage(imageBase64) {
  try {
    console.log('🔍 Starting image analysis...');
    console.log('🔍 Image base64 length:', imageBase64 ? imageBase64.length : 'undefined');
    console.log('🔍 Vision client available:', !!visionClient);
    
    const request = {
      image: {
        content: imageBase64
      },
      features: [
        { type: 'FACE_DETECTION' },
        { type: 'LABEL_DETECTION' },
        { type: 'SAFE_SEARCH_DETECTION' },
        { type: 'TEXT_DETECTION' }
      ]
    };

    console.log('🔍 Sending request to Google Cloud Vision API...');
    const [result] = await visionClient.annotateImage(request);
    
    console.log('✅ Image analysis completed successfully');
    return result;
  } catch (error) {
    console.error('❌ Image analysis error:', error);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      status: error.status,
      details: error.details
    });
    throw new Error('Failed to analyze image: ' + error.message);
  }
}

async function analyzeImageFromUrl(imageUrl) {
  try {
    console.log('🔍 Starting URL image analysis...');
    console.log('🔍 Image URL:', imageUrl);
    console.log('🔍 Vision client available:', !!visionClient);
    
    const request = {
      image: {
        source: {
          imageUri: imageUrl
        }
      },
      features: [
        { type: 'FACE_DETECTION' },
        { type: 'LABEL_DETECTION' },
        { type: 'SAFE_SEARCH_DETECTION' }
      ]
    };

    console.log('🔍 Sending URL request to Google Cloud Vision API...');
    const [result] = await visionClient.annotateImage(request);
    
    console.log('✅ URL image analysis completed successfully');
    return result;
  } catch (error) {
    console.error('❌ URL image analysis error:', error);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      status: error.status,
      details: error.details
    });
    throw new Error('Failed to analyze profile image: ' + error.message);
  }
}

async function compareImages(selfieBase64, profileImageUrl) {
  try {
    // For now, we'll use a simplified comparison
    // In production, you might want to use more sophisticated image comparison APIs
    // or implement custom similarity algorithms
    
    // This is a placeholder - you could integrate with:
    // - Google Cloud Vision API's web detection
    // - Custom ML models for face similarity
    // - Third-party face recognition services
    
    // For now, return a basic similarity score based on image properties
    return {
      score: 0.85, // Placeholder score
      confidence: 0.8
    };
  } catch (error) {
    console.error('Image comparison error:', error);
    return { score: 0, confidence: 0 };
  }
}

async function detectFaces(imageBase64) {
  try {
    const request = {
      image: {
        content: imageBase64
      },
      features: [
        { type: 'FACE_DETECTION' }
      ]
    };

    const [result] = await visionClient.annotateImage(request);
    return result.faceAnnotations || [];
  } catch (error) {
    console.error('Face detection error:', error);
    throw new Error('Failed to detect faces: ' + error.message);
  }
}

function determineVerificationResult(selfieAnalysis, profileAnalysis, similarityScore, faceDetection) {
  // Check if selfie has exactly one face
  if (!faceDetection || faceDetection.length === 0) {
    return {
      verified: false,
      reason: 'No face detected in selfie',
      similarityScore: 0,
      confidence: 0
    };
  }

  if (faceDetection.length > 1) {
    return {
      verified: false,
      reason: 'Multiple faces detected in selfie',
      similarityScore: 0,
      confidence: 0
    };
  }

  // Check face quality
  const face = faceDetection[0];
  const faceQuality = assessFaceQuality(face);
  
  const minFaceQualityScore = configLoader.get('faceQualityThreshold');
  if (faceQuality.score < minFaceQualityScore) {
    return {
      verified: false,
      reason: 'Selfie quality too low for verification',
      similarityScore: 0,
      confidence: faceQuality.score
    };
  }

  // Check for inappropriate content
  if (selfieAnalysis.safeSearchAnnotation) {
    const safeSearch = selfieAnalysis.safeSearchAnnotation;
    if (safeSearch.adult === 'LIKELY' || safeSearch.adult === 'VERY_LIKELY' ||
        safeSearch.violence === 'LIKELY' || safeSearch.violence === 'VERY_LIKELY') {
      return {
        verified: false,
        reason: 'Inappropriate content detected',
        similarityScore: 0,
        confidence: 0
      };
    }
  }

  // Use similarity score to determine verification
  const minSimilarityScore = configLoader.get('similarityThreshold');
  const isSimilar = similarityScore.score >= minSimilarityScore;

  return {
    verified: isSimilar,
    reason: isSimilar ? 'Verification successful' : 'Selfie does not match profile',
    similarityScore: similarityScore.score,
    confidence: similarityScore.confidence * faceQuality.score
  };
}

function assessFaceQuality(face) {
  let score = 1.0;
  let reasons = [];

  // Check face bounds (should be reasonably sized)
  if (face.boundingPoly && face.boundingPoly.vertices) {
    const vertices = face.boundingPoly.vertices;
    const width = Math.abs(vertices[1].x - vertices[0].x);
    const height = Math.abs(vertices[2].y - vertices[1].y);
    
    if (width < 100 || height < 100) {
      score *= 0.8;
      reasons.push('Face too small');
    }
  }

  // Check confidence
  if (face.detectionConfidence && face.detectionConfidence < 0.8) {
    score *= 0.9;
    reasons.push('Low detection confidence');
  }

  // Check roll angle (should be relatively straight)
  if (face.rollAngle && Math.abs(face.rollAngle) > 15) {
    score *= 0.9;
    reasons.push('Face tilted');
  }

  // Check pan angle (should be relatively front-facing)
  if (face.panAngle && Math.abs(face.panAngle) > 20) {
    score *= 0.8;
    reasons.push('Face not front-facing');
  }

  // Check tilt angle
  if (face.tiltAngle && Math.abs(face.tiltAngle) > 15) {
    score *= 0.9;
    reasons.push('Face tilted up/down');
  }

  return {
    score: Math.max(0.1, score),
    reasons
  };
}

async function storeVerificationResult(userId, result) {
  try {
    const verificationData = {
      userId,
      verified: result.verified,
      reason: result.reason,
      similarityScore: result.similarityScore,
      confidence: result.confidence,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      // Note: selfieImage removed due to Firestore 1MB field size limit
      // The image was successfully analyzed but not stored for audit
      status: result.verified ? 'verified' : 'failed'
    };

    // Store in user's verification history
    await db.collection('users').doc(userId)
      .collection('verifications')
      .add(verificationData);

    // Update user's verification status
    if (result.verified) {
      await db.collection('users').doc(userId).update({
        isSelfieVerified: true,
        selfieVerificationDate: admin.firestore.FieldValue.serverTimestamp(),
        verificationScore: result.similarityScore
      });
    }

    return true;
  } catch (error) {
    console.error('Failed to store verification result:', error);
    throw new Error('Failed to store verification result: ' + error.message);
  }
}

// Function to get verification history - V2 Format
exports.getVerificationHistory = onCall(async (request) => {
  const { data, auth } = request;
  
  if (!auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { userId } = data;
  
  // Ensure the requesting user is the same as the userId
  if (auth.uid !== userId) {
    throw new HttpsError('permission-denied', 'You can only view your own verification history');
  }
  
  try {
    const snapshot = await db.collection('users').doc(userId)
      .collection('verifications')
      .orderBy('timestamp', 'desc')
      .limit(10)
      .get();

    const verifications = [];
    snapshot.forEach(doc => {
      verifications.push({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.() || doc.data().timestamp
      });
    });

    return { verifications };
  } catch (error) {
    console.error('Failed to get verification history:', error);
    throw new HttpsError('internal', 'Failed to get verification history: ' + error.message);
  }
});