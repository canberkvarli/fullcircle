# Firebase Cloud Functions

This directory contains Firebase Cloud Functions for the FullCircle app.

## Functions Overview

### Stripe Functions
- **Subscriptions**: Create, cancel, and manage user subscriptions
- **Purchases**: Handle Radiance and Lotus purchases
- **Webhooks**: Process Stripe webhook events

### Weekly Lotus Function
- **`assignWeeklyLotus`**: Scheduled function that runs every Sunday at midnight UTC
- **`manualAssignWeeklyLotus`**: HTTP callable function for manual testing/admin use

## Weekly Lotus Function

### Purpose
Automatically assigns 1 free lotus to eligible users every week, replacing the unreliable client-side implementation.

### How It Works
1. **Scheduled Execution**: Runs every Sunday at 00:00 UTC using Cloud Scheduler
2. **Eligibility Check**: Users must have:
   - Less than 1 lotus (`numOfLotus < 1`)
   - Not received lotus in the last 7 days (`lastLotusAssignedAt < 7 days ago`)
3. **Batch Processing**: Updates all eligible users in a single Firestore batch operation
4. **Real-time Updates**: Client apps receive updates via Firestore listeners

### Benefits Over Client-Side
- ✅ **Reliable**: Runs regardless of user app usage
- ✅ **Secure**: Server-side validation prevents manipulation
- ✅ **Efficient**: Batch processing for multiple users
- ✅ **Scalable**: Handles any number of users without performance impact
- ✅ **Auditable**: Server logs track all assignments

### Deployment

#### 1. Deploy Functions
```bash
cd functions
npm run deploy
```

#### 2. Verify Deployment
```bash
firebase functions:list
```

You should see:
- `assignWeeklyLotus` (scheduled)
- `manualAssignWeeklyLotus` (callable)

#### 3. Check Logs
```bash
firebase functions:log --only assignWeeklyLotus
```

### Testing

#### Manual Testing (Development)
```typescript
// In your React Native app
import { useUserContext } from '@/context/UserContext';

const { testWeeklyLotusFunction } = useUserContext();

// Test the function
try {
  const result = await testWeeklyLotusFunction();
  console.log('Test result:', result);
} catch (error) {
  console.error('Test failed:', error);
}
```

#### Production Testing
1. **Check Function Logs**: Monitor execution every Sunday
2. **Verify User Updates**: Check that eligible users receive lotus
3. **Monitor Performance**: Ensure batch operations complete successfully

### Configuration

#### Schedule
- **Current**: Every Sunday at 00:00 UTC
- **Modify**: Edit the cron expression in `weeklyLotus.js`
- **Examples**:
  - `0 0 * * 1` = Every Monday at midnight
  - `0 12 * * 0` = Every Sunday at noon
  - `0 0 1 * *` = First day of every month

#### Timezone
- **Current**: UTC
- **Modify**: Change `timeZone` parameter in the function

### Monitoring & Maintenance

#### Key Metrics to Watch
- Function execution success rate
- Number of users processed per week
- Execution time and memory usage
- Error rates and types

#### Common Issues
1. **Function Timeout**: Increase timeout if processing many users
2. **Memory Limits**: Monitor memory usage for large user bases
3. **Firestore Quotas**: Watch for query limits with very large user collections

#### Scaling Considerations
- **Small App (< 1K users)**: Current implementation is sufficient
- **Medium App (1K-10K users)**: Consider pagination for very large queries
- **Large App (10K+ users)**: Implement chunked processing with multiple function calls

### Security Notes
- The manual function includes basic authentication checks
- Consider adding admin role verification for production use
- All database operations use server-side timestamps for consistency

### Cost Considerations
- **Scheduled Functions**: Free tier includes 2 million invocations/month
- **Callable Functions**: Pay per invocation after free tier
- **Firestore Operations**: Standard read/write costs apply

### Future Enhancements
- [ ] Add user notification when lotus is assigned
- [ ] Implement lotus expiration system
- [ ] Add analytics tracking for lotus usage
- [ ] Create admin dashboard for lotus management
- [ ] Add lotus gifting between users
