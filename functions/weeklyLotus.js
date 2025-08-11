const functions = require('firebase-functions');
const admin = require('firebase-admin');

/**
 * Weekly Lotus Assignment Cloud Function
 * Runs every Sunday at midnight UTC to assign free lotus to eligible users
 */
exports.assignWeeklyLotus = functions.pubsub
  .schedule('0 0 * * 0') // Every Sunday at midnight UTC
  .timeZone('UTC')
  .onRun(async (context) => {
    try {
      console.log('🪷 Starting weekly lotus assignment...');
      
      const usersRef = admin.firestore().collection('users');
      const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
      const now = Date.now();
      const cutoffDate = new Date(now - oneWeekMs);
      
      console.log(`📅 Processing users eligible since: ${cutoffDate.toISOString()}`);
      
      // Query users eligible for weekly lotus:
      // 1. Have less than 1 lotus
      // 2. Haven't received lotus in the last week
      const eligibleUsers = await usersRef
        .where('numOfLotus', '<', 1)
        .where('lastLotusAssignedAt', '<', cutoffDate)
        .get();
      
      if (eligibleUsers.empty) {
        console.log('✅ No users eligible for weekly lotus this week');
        return null;
      }
      
      console.log(`🎯 Found ${eligibleUsers.size} eligible users for weekly lotus`);
      
      // Batch update all eligible users
      const batch = admin.firestore().batch();
      let processedCount = 0;
      
      eligibleUsers.docs.forEach(doc => {
        const userData = doc.data();
        console.log(`🔄 Processing user: ${doc.id} (${userData.firstName || 'Unknown'})`);
        
        batch.update(doc.ref, {
          numOfLotus: 1,
          lastLotusAssignedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        processedCount++;
      });
      
      // Commit the batch update
      await batch.commit();
      
      console.log(`✅ Successfully assigned weekly lotus to ${processedCount} users`);
      
      // Return success metrics
      return {
        success: true,
        processedCount,
        timestamp: new Date().toISOString(),
        eligibleUsersCount: eligibleUsers.size
      };
      
    } catch (error) {
      console.error('❌ Error in weekly lotus assignment:', error);
      
      // Log detailed error information
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      
      // Re-throw to mark function as failed
      throw error;
    }
  });

/**
 * Manual Weekly Lotus Assignment (for testing/admin purposes)
 * Can be called manually via HTTP trigger
 */
exports.manualAssignWeeklyLotus = functions.https.onCall(async (data, context) => {
  try {
    // Verify admin privileges (you can customize this check)
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    
    // Optional: Add additional admin role checks here
    // const userRecord = await admin.auth().getUser(context.auth.uid);
    // if (!userRecord.customClaims?.admin) {
    //   throw new functions.https.HttpsError('permission-denied', 'Admin access required');
    // }
    
    console.log('🪷 Manual weekly lotus assignment triggered by:', context.auth.uid);
    
    // Reuse the same logic as the scheduled function
    const usersRef = admin.firestore().collection('users');
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const cutoffDate = new Date(now - oneWeekMs);
    
    const eligibleUsers = await usersRef
      .where('numOfLotus', '<', 1)
      .where('lastLotusAssignedAt', '<', cutoffDate)
      .get();
    
    if (eligibleUsers.empty) {
      return {
        success: true,
        message: 'No users eligible for weekly lotus',
        processedCount: 0,
        timestamp: new Date().toISOString()
      };
    }
    
    const batch = admin.firestore().batch();
    let processedCount = 0;
    
    eligibleUsers.docs.forEach(doc => {
      batch.update(doc.ref, {
        numOfLotus: 1,
        lastLotusAssignedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      processedCount++;
    });
    
    await batch.commit();
    
    console.log(`✅ Manual assignment completed: ${processedCount} users processed`);
    
    return {
      success: true,
      message: `Successfully assigned weekly lotus to ${processedCount} users`,
      processedCount,
      timestamp: new Date().toISOString(),
      eligibleUsersCount: eligibleUsers.size
    };
    
  } catch (error) {
    console.error('❌ Error in manual weekly lotus assignment:', error);
    throw new functions.https.HttpsError('internal', 'Failed to assign weekly lotus', error);
  }
});
