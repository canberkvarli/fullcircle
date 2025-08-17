const { onCall, HttpsError } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

/**
 * Check if a user has admin access
 * This function verifies if the authenticated user has admin privileges
 */
exports.checkAdminAccess = onCall({
  enforceAppCheck: false,
  region: 'us-central1'
}, async (request) => {
  // Debug logging
  console.log('🔍 Admin access check called with context:', {
    hasAuth: !!request.auth,
    authUid: request.auth?.uid,
    contextKeys: Object.keys(request),
    data: request.data
  });
  
  // Verify user is authenticated
  if (!request.auth) {
    console.log('❌ No auth context found');
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = request.auth.uid;
  const { userId: requestedUserId } = request.data;
  
  try {
    console.log(`🔍 Checking admin access for user: ${userId}`);
    
    // For now, hardcode admin UIDs - you can expand this to use a database lookup
    const adminUids = [
      // Add your admin UIDs here
      'EkZXptcU7Jbv8oFDBzOCeYkm05G3',
      'qEgQRaZwvVXojndE28bVr3971802',
      // Add more admin UIDs as needed
    ];
    
    const isAdmin = adminUids.includes(userId);
    
    console.log(`✅ Admin access check result for ${userId}: ${isAdmin}`);
    
    return { 
      isAdmin,
      userId,
      message: isAdmin ? 'User has admin access' : 'User does not have admin access'
    };
    
  } catch (error) {
    console.error('❌ Admin access check error:', error);
    throw new HttpsError('internal', 'Failed to check admin access');
  }
});

/**
 * Get list of admin users
 * This function returns the list of users with admin privileges
 */
exports.getAdminUsers = onCall({
  enforceAppCheck: false,
  region: 'us-central1'
}, async (request) => {
  // Debug logging
  console.log('🔍 Get admin users called with context:', {
    hasAuth: !!request.auth,
    authUid: request.auth?.uid,
    contextKeys: Object.keys(request),
    data: request.data
  });
  
  // Verify user is authenticated
  if (!request.auth) {
    console.log('❌ No auth context found');
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = request.auth.uid;
  
  try {
    console.log(`🔍 Getting admin users list for user: ${userId}`);
    
    // For now, hardcode admin UIDs - you can expand this to use a database lookup
    const adminUids = [
      // Add your admin UIDs here
      'your-admin-uid-here', // Replace with your actual admin UID
      // Add more admin UIDs as needed
    ];
    
    // Check if the requesting user is an admin
    const isRequestingUserAdmin = adminUids.includes(userId);
    
    if (!isRequestingUserAdmin) {
      console.log(`❌ User ${userId} not authorized to view admin list`);
      throw new HttpsError('permission-denied', 'Only admins can view admin user list');
    }
    
    console.log(`✅ Admin users list retrieved by ${userId}`);
    
    return { 
      adminUsers: adminUids,
      count: adminUids.length,
      message: 'Admin users list retrieved successfully'
    };
    
  } catch (error) {
    console.error('❌ Get admin users error:', error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError('internal', 'Failed to get admin users list');
  }
});
