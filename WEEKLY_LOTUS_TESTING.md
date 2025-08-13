# Weekly Lotus Testing Guide 🪷

This guide explains how to test the weekly lotus functionality in FullCircle, both through the mobile app and via command line scripts.

## Overview

The weekly lotus system automatically assigns 1 free lotus to users who have 0 lotus every Sunday at midnight UTC. This is similar to Hinge's rose feature.

## Testing Methods

### 1. Mobile App Testing (Recommended for Development)

#### Prerequisites
- App running in development mode (`__DEV__` is true)
- User account with 0 lotus
- Firebase functions deployed

#### Steps
1. Open the FullCircle app
2. Go to **Settings** → **🧪 Developer Tools** (only visible in dev mode)
3. Tap **Test Weekly Lotus**
4. The function will:
   - Find all users with 0 lotus
   - Assign 1 lotus to each eligible user
   - Update `lastLotusAssignedAt` timestamp
   - Refresh your user data to show updated lotus count

#### What You'll See
- Loading indicator with Ouroboros animation
- Success/error alerts with detailed information
- Updated lotus count in the Profile section
- Last assignment date (if available)

### 2. Command Line Testing

#### Prerequisites
- Node.js installed
- Firebase service account key at `server/keys/fullcircle-dev-1aafd-firebase-adminsdk.json`
- Firebase functions deployed

#### Usage

Navigate to the functions directory and run:

```bash
# Test weekly lotus assignment
node ../scripts/testWeeklyLotus.js

# Reset lotus for testing (set users back to 0)
node ../scripts/testWeeklyLotus.js reset

# Test with specific command
node ../scripts/testWeeklyLotus.js test
```

#### What the Script Does
- Shows current user statistics
- Lists eligible users (those with 0 lotus)
- Simulates the weekly lotus assignment
- Updates user documents in Firestore
- Shows before/after statistics

## Firebase Functions

### Automatic Assignment
- **Function**: `assignWeeklyLotus`
- **Schedule**: Every Sunday at midnight UTC
- **Trigger**: Cloud Scheduler (Pub/Sub)
- **Logic**: Finds users with 0 lotus and assigns 1

### Manual Testing
- **Function**: `manualAssignWeeklyLotus`
- **Trigger**: HTTP callable function
- **Access**: Authenticated users only
- **Logic**: Same as automatic but can be called manually

## Database Schema

### User Document Fields
```typescript
{
  numOfLotus: number,           // Current lotus count
  lastLotusAssignedAt: Timestamp, // When lotus was last assigned
  // ... other user fields
}
```

### Weekly Lotus Function Updates
```typescript
{
  numOfLotus: 1,                                    // Set to 1
  lastLotusAssignedAt: serverTimestamp()            // Current time
}
```

## Testing Scenarios

### 1. Normal Operation
- User has 0 lotus → Gets 1 lotus
- User has 1+ lotus → No change
- Timestamp is updated

### 2. Edge Cases
- No eligible users → Function completes successfully
- Database errors → Function fails with detailed logging
- Authentication issues → Function rejects unauthenticated calls

### 3. Performance Testing
- Large number of eligible users
- Batch processing efficiency
- Memory usage during execution

## Monitoring & Debugging

### Firebase Console
- **Functions**: Monitor execution logs
- **Firestore**: Check user document updates
- **Analytics**: Track function performance

### App Logs
- Console logs show detailed execution flow
- Error messages include stack traces
- Success metrics are logged

### Common Issues

#### Function Not Deployed
```
Error: Function 'manualAssignWeeklyLotus' not found
```
**Solution**: Deploy Firebase functions

#### Authentication Error
```
Error: User must be authenticated
```
**Solution**: Ensure user is logged in

#### Database Permission Error
```
Error: Permission denied
```
**Solution**: Check Firestore security rules

## Development Workflow

1. **Local Testing**: Use command line script
2. **Function Updates**: Modify `functions/weeklyLotus.js`
3. **Deploy**: `firebase deploy --only functions`
4. **App Testing**: Use mobile app developer tools
5. **Production**: Monitor automatic Sunday execution

## Safety Features

- **Batch Processing**: Atomic updates prevent partial failures
- **Error Handling**: Comprehensive error logging and user feedback
- **Rate Limiting**: Functions have built-in Firebase rate limits
- **Data Validation**: Checks for valid user data before processing

## Future Enhancements

- **Admin Dashboard**: Web interface for manual lotus management
- **Analytics**: Track lotus usage patterns
- **Customization**: Allow admins to adjust lotus amounts
- **Notifications**: Alert users when lotus is assigned

## Support

For issues or questions about weekly lotus testing:
1. Check Firebase function logs
2. Review app console output
3. Verify database permissions
4. Test with command line script first
