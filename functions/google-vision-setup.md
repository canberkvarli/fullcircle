# Google Cloud Vision API Setup Guide

## Prerequisites
1. Google Cloud Platform account
2. Firebase project with Cloud Functions enabled
3. Billing enabled on your GCP project

## Step 1: Enable Google Cloud Vision API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to "APIs & Services" > "Library"
4. Search for "Cloud Vision API"
5. Click on "Cloud Vision API" and click "Enable"

## Step 2: Create Service Account

1. Go to "IAM & Admin" > "Service Accounts"
2. Click "Create Service Account"
3. Give it a name like "vision-api-service-account"
4. Add description: "Service account for Cloud Vision API access"
5. Click "Create and Continue"
6. For roles, add:
   - "Cloud Vision API User"
   - "Firebase Admin SDK Administrator Service Agent" (if needed)
7. Click "Continue" and then "Done"

## Step 3: Generate Service Account Key

1. Click on the service account you just created
2. Go to "Keys" tab
3. Click "Add Key" > "Create new key"
4. Choose "JSON" format
5. Download the key file
6. **IMPORTANT**: Keep this file secure and never commit it to version control

## Step 4: Configure Environment Variables

### Option A: Using .env file (Recommended for development)

1. Copy the example configuration file:
   ```bash
   cp functions/config.env.example functions/.env
   ```

2. Edit `functions/.env` and replace the placeholder values with your actual credentials:
   - Copy your service account JSON into `GOOGLE_CLOUD_VISION_CREDENTIALS`
   - Update `GOOGLE_CLOUD_PROJECT_ID` with your project ID
   - Adjust verification thresholds if needed

### Option B: Using Firebase Environment Variables (Recommended for production)

1. Set environment variables in Firebase:
   ```bash
   firebase functions:config:set google.vision_credentials="$(cat path/to/service-account-key.json)"
   firebase functions:config:set google.project_id="your-project-id"
   ```

2. Update the code to read from Firebase config instead of process.env

### Option C: Using your existing config structure

Since you have config files in `config/dev/`, `config/staging/`, `config/prod/`, you can:
1. Add the Vision API credentials to your existing config files
2. Update the functions to read from the appropriate config based on environment

## Step 5: Deploy Functions

```bash
cd functions
npm install
firebase deploy --only functions
```

## Step 6: Test the Integration

1. Use the selfie verification screen in your app
2. Check Firebase Functions logs for any errors
3. Verify that verification results are stored in Firestore

## Cost Considerations

Google Cloud Vision API pricing (as of 2024):
- **Face Detection**: $1.50 per 1,000 images
- **Label Detection**: $1.50 per 1,000 images
- **Safe Search Detection**: $1.50 per 1,000 images
- **Text Detection**: $1.50 per 1,000 images

**Estimated cost per verification**: ~$0.006 (6 cents)

## Security Best Practices

1. **Never commit API keys to version control**
2. Use environment variables or Firebase config
3. Restrict service account permissions to minimum required
4. Monitor API usage and set up billing alerts
5. Consider implementing rate limiting

## Troubleshooting

### Common Issues:

1. **"Permission denied" errors**
   - Check service account roles
   - Verify API is enabled

2. **"Invalid credentials" errors**
   - Verify service account key path
   - Check if key file is valid JSON

3. **"Quota exceeded" errors**
   - Check billing status
   - Monitor API usage in GCP Console

### Debug Steps:

1. Check Firebase Functions logs:
   ```bash
   firebase functions:log
   ```

2. Test API directly in GCP Console
3. Verify service account has correct permissions
4. Check if billing is enabled

## Production Considerations

1. **Rate Limiting**: Implement user-level rate limiting
2. **Caching**: Cache verification results to reduce API calls
3. **Monitoring**: Set up alerts for API usage and errors
4. **Backup**: Consider fallback verification methods
5. **Compliance**: Ensure GDPR/privacy compliance for image storage

## Alternative Solutions

If Google Cloud Vision API doesn't meet your needs, consider:

1. **AWS Rekognition**: Similar pricing, good integration with Firebase
2. **Azure Computer Vision**: Microsoft's alternative
3. **Custom ML Models**: Train your own face verification model
4. **Third-party Services**: Services like Face++, Kairos, etc.

## Support

- [Google Cloud Vision API Documentation](https://cloud.google.com/vision/docs)
- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [Google Cloud Support](https://cloud.google.com/support)
