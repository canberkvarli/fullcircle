#!/usr/bin/env node

/**
 * Test Script for Weekly Lotus Functionality
 * 
 * This script allows you to test the weekly lotus assignment function
 * without going through the mobile app UI.
 * 
 * Usage:
 * 1. Make sure you're in the functions directory
 * 2. Run: node ../scripts/testWeeklyLotus.js
 * 
 * Prerequisites:
 * - Firebase project must be set up
 * - Service account key must be available
 * - Functions must be deployed
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin (you may need to adjust the path to your service account key)
try {
  const serviceAccount = require('../server/keys/fullcircle-dev-1aafd-firebase-adminsdk.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
  });
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin:', error.message);
  console.log('💡 Make sure you have a service account key at ../server/keys/fullcircle-dev-1aafd-firebase-adminsdk.json');
  process.exit(1);
}

const db = admin.firestore();

async function testWeeklyLotus() {
  try {
    console.log('🪷 Testing Weekly Lotus Functionality...\n');
    
    // Get current user stats
    const usersRef = db.collection('users');
    const totalUsers = await usersRef.count().get();
    const usersWithLotus = await usersRef.where('numOfLotus', '>', 0).count().get();
    const usersWithoutLotus = await usersRef.where('numOfLotus', '==', 0).count().get();
    
    console.log('📊 Current User Statistics:');
    console.log(`   Total users: ${totalUsers.data().count}`);
    console.log(`   Users with lotus: ${usersWithLotus.data().count}`);
    console.log(`   Users without lotus: ${usersWithoutLotus.data().count}\n`);
    
    // Find users who have 0 lotus
    const eligibleUsers = await usersRef
      .where('numOfLotus', '==', 0)
      .limit(5) // Limit to first 5 for testing
      .get();
    
    if (eligibleUsers.empty) {
      console.log('✅ No users eligible for weekly lotus this week');
      return;
    }
    
    console.log(`🎯 Found ${eligibleUsers.size} eligible users for weekly lotus (showing first 5):`);
    
    // Show some eligible users
    eligibleUsers.docs.forEach((doc, index) => {
      const userData = doc.data();
      console.log(`   ${index + 1}. ${userData.firstName || 'Unknown'} (${doc.id})`);
    });
    
    console.log('\n🔄 Simulating weekly lotus assignment...');
    
    // Batch update all eligible users
    const batch = db.batch();
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
    
    console.log(`\n✅ Successfully assigned weekly lotus to ${processedCount} users`);
    
    // Show updated stats
    const updatedUsersWithLotus = await usersRef.where('numOfLotus', '>', 0).count().get();
    const updatedUsersWithoutLotus = await usersRef.where('numOfLotus', '==', 0).count().get();
    
    console.log('\n📊 Updated User Statistics:');
    console.log(`   Users with lotus: ${updatedUsersWithLotus.data().count} (+${updatedUsersWithLotus.data().count - usersWithLotus.data().count})`);
    console.log(`   Users without lotus: ${updatedUsersWithoutLotus.data().count} (-${usersWithoutLotus.data().count - updatedUsersWithoutLotus.data().count})`);
    
    // Return success metrics
    return {
      success: true,
      processedCount,
      timestamp: new Date().toISOString(),
      eligibleUsersCount: eligibleUsers.size
    };
    
  } catch (error) {
    console.error('❌ Error in weekly lotus test:', error);
    throw error;
  }
}

async function resetLotusForTesting() {
  try {
    console.log('🔄 Resetting lotus for testing purposes...\n');
    
    // Find users who have lotus and reset them to 0
    const usersWithLotus = await db.collection('users')
      .where('numOfLotus', '>', 0)
      .limit(10) // Limit to first 10 for safety
      .get();
    
    if (usersWithLotus.empty) {
      console.log('✅ No users have lotus to reset');
      return;
    }
    
    console.log(`🎯 Found ${usersWithLotus.size} users with lotus to reset (showing first 10):`);
    
    const batch = db.batch();
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
    
    console.log(`\n✅ Successfully reset lotus for ${resetCount} users`);
    
  } catch (error) {
    console.error('❌ Error resetting lotus:', error);
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  try {
    switch (command) {
      case 'reset':
        await resetLotusForTesting();
        break;
      case 'test':
      default:
        await testWeeklyLotus();
        break;
    }
    
    console.log('\n🎉 Test completed successfully!');
    
  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
    process.exit(1);
  } finally {
    // Close the connection
    process.exit(0);
  }
}

// Run the main function
if (require.main === module) {
  main();
}

module.exports = { testWeeklyLotus, resetLotusForTesting };
