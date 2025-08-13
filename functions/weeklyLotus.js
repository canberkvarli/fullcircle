const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');

/**
 * Weekly Lotus Assignment Cloud Function
 * Runs every Sunday at midnight UTC to assign free lotus to eligible users
 * Similar to Hinge's rose feature - gives users 1 lotus if they have 0
 */
exports.assignWeeklyLotus = functions.pubsub
  .schedule('0 0 * * 0')
  .timeZone('UTC')
  .onRun(async (context) => {
    try {
      console.log('🪷 Starting weekly lotus assignment...');
      
      const usersRef = admin.firestore().collection('users');
      
      // Find users who have 0 lotus
      const eligibleUsers = await usersRef
        .where('numOfLotus', '==', 0)
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
    
    console.log('🪷 Manual weekly lotus assignment triggered by:', context.auth.uid);
    
    // Find users who have 0 lotus
    const usersRef = admin.firestore().collection('users');
    const eligibleUsers = await usersRef
      .where('numOfLotus', '==', 0)
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

/**
 * Test Weekly Lotus Function (for development/testing)
 * Simulates weekly lotus assignment for testing purposes
 */
exports.testWeeklyLotus = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    
    console.log('🧪 Testing weekly lotus functionality...');
    
    const usersRef = admin.firestore().collection('users');
    
    // Get current user stats
    const totalUsers = await usersRef.count().get();
    const usersWithLotus = await usersRef.where('numOfLotus', '>', 0).count().get();
    const usersWithoutLotus = await usersRef.where('numOfLotus', '==', 0).count().get();
    
    console.log('📊 Current User Statistics:');
    console.log(`   Total users: ${totalUsers.data().count}`);
    console.log(`   Users with lotus: ${usersWithLotus.data().count}`);
    console.log(`   Users without lotus: ${usersWithoutLotus.data().count}`);
    
    // Find users who have 0 lotus (limit to first 5 for testing)
    const eligibleUsers = await usersRef
      .where('numOfLotus', '==', 0)
      .limit(5)
      .get();
    
    if (eligibleUsers.empty) {
      return {
        success: true,
        message: 'No users eligible for weekly lotus this week',
        processedCount: 0,
        timestamp: new Date().toISOString(),
        stats: {
          totalUsers: totalUsers.data().count,
          usersWithLotus: usersWithLotus.data().count,
          usersWithoutLotus: usersWithoutLotus.data().count
        }
      };
    }
    
    console.log(`🎯 Found ${eligibleUsers.size} eligible users for weekly lotus (showing first 5):`);
    
    // Show some eligible users
    eligibleUsers.docs.forEach((doc, index) => {
      const userData = doc.data();
      console.log(`   ${index + 1}. ${userData.firstName || 'Unknown'} (${doc.id})`);
    });
    
    console.log('🔄 Simulating weekly lotus assignment...');
    
    // Batch update all eligible users
    const batch = admin.firestore().batch();
    let processedCount = 0;
    
    eligibleUsers.docs.forEach(doc => {
      const userData = doc.data();
      console.log(`   Processing: ${userData.firstName || 'Unknown'} (${doc.id})`);
      
      batch.update(doc.ref, {
        numOfLotus: 1,
        lastLotusAssignedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      processedCount++;
    });
    
    // Commit the batch update
    await batch.commit();
    
    console.log(`✅ Successfully assigned weekly lotus to ${processedCount} users`);
    
    // Show updated stats
    const updatedUsersWithLotus = await usersRef.where('numOfLotus', '>', 0).count().get();
    const updatedUsersWithoutLotus = await usersRef.where('numOfLotus', '==', 0).count().get();
    
    console.log('📊 Updated User Statistics:');
    console.log(`   Users with lotus: ${updatedUsersWithLotus.data().count} (+${updatedUsersWithLotus.data().count - usersWithLotus.data().count})`);
    console.log(`   Users without lotus: ${updatedUsersWithoutLotus.data().count} (-${usersWithoutLotus.data().count - updatedUsersWithoutLotus.data().count})`);
    
    return {
      success: true,
      message: `Successfully assigned weekly lotus to ${processedCount} users`,
      processedCount,
      timestamp: new Date().toISOString(),
      eligibleUsersCount: eligibleUsers.size,
      stats: {
        totalUsers: totalUsers.data().count,
        usersWithLotus: updatedUsersWithLotus.data().count,
        usersWithoutLotus: updatedUsersWithoutLotus.data().count,
        change: {
          usersWithLotus: updatedUsersWithLotus.data().count - usersWithLotus.data().count,
          usersWithoutLotus: updatedUsersWithoutLotus.data().count - usersWithoutLotus.data().count
        }
      }
    };
    
  } catch (error) {
    console.error('❌ Error in weekly lotus test:', error);
    throw new functions.https.HttpsError('internal', 'Failed to test weekly lotus', error);
  }
});

/**
 * Reset Lotus For Testing (for development/testing)
 * Resets lotus for users who have > 0 lotus (use with caution)
 */
exports.resetLotusForTesting = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    
    console.log('🔄 Resetting lotus for testing purposes...');
    
    const usersRef = admin.firestore().collection('users');
    
    // Find users who have lotus and reset them to 0 (limit to first 10 for safety)
    const usersWithLotus = await usersRef
      .where('numOfLotus', '>', 0)
      .limit(10)
      .get();
    
    if (usersWithLotus.empty) {
      return {
        success: true,
        message: 'No users have lotus to reset',
        resetCount: 0,
        timestamp: new Date().toISOString()
      };
    }
    
    console.log(`🎯 Found ${usersWithLotus.size} users with lotus to reset (showing first 10):`);
    
    const batch = admin.firestore().batch();
    let resetCount = 0;
    
    usersWithLotus.docs.forEach((doc, index) => {
      const userData = doc.data();
      console.log(`   ${index + 1}. ${userData.firstName || 'Unknown'} (${doc.id}) - Current lotus: ${userData.numOfLotus}`);
      
      batch.update(doc.ref, {
        numOfLotus: 0,
        lastLotusAssignedAt: null
      });
      
      resetCount++;
    });
    
    await batch.commit();
    
    console.log(`✅ Successfully reset lotus for ${resetCount} users`);
    
    return {
      success: true,
      message: `Successfully reset lotus for ${resetCount} users`,
      resetCount,
      timestamp: new Date().toISOString(),
      resetUsers: usersWithLotus.docs.map(doc => ({
        id: doc.id,
        firstName: doc.data().firstName || 'Unknown',
        previousLotus: doc.data().numOfLotus
      }))
    };
    
  } catch (error) {
    console.error('❌ Error resetting lotus:', error);
    throw new functions.https.HttpsError('internal', 'Failed to reset lotus', error);
  }
});