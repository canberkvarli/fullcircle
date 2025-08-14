// configLoader.js
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables from multiple possible locations
const envPaths = [
  path.join(__dirname, '.env'),                    // functions/.env
  path.join(__dirname, '..', '.env'),             // root/.env
  path.join(__dirname, '..', 'config', 'dev', '.env'), // config/dev/.env
];

// Try to load from each path
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    console.log(`📁 Loading environment from: ${envPath}`);
    dotenv.config({ path: envPath });
    break;
  }
}

class ConfigLoader {
  constructor() {
    this.config = {};
    this.loadConfig();
  }

  loadConfig() {
    try {
      // Load Stripe configuration
      this.config.stripeSecretKey = process.env.STRIPE_SECRET_KEY;
      if (!this.config.stripeSecretKey) {
        console.warn('⚠️ Warning: STRIPE_SECRET_KEY not found in environment variables');
      } else {
        console.log('✅ Stripe secret key loaded');
      }

      // Parse Google Cloud Vision credentials
      if (process.env.GOOGLE_CLOUD_VISION_CREDENTIALS) {
        try {
          // Handle credentials whether they're already an object or a string
          if (typeof process.env.GOOGLE_CLOUD_VISION_CREDENTIALS === 'string') {
            this.config.visionCredentials = JSON.parse(process.env.GOOGLE_CLOUD_VISION_CREDENTIALS);
          } else {
            this.config.visionCredentials = process.env.GOOGLE_CLOUD_VISION_CREDENTIALS;
          }
          
          // Make sure the private_key is properly formatted with newlines
          if (this.config.visionCredentials.private_key) {
            this.config.visionCredentials.private_key = this.config.visionCredentials.private_key
              .replace(/\\n/g, '\n');
          }
        } catch (error) {
          console.error('Error parsing Google Cloud Vision credentials:', error);
          throw new Error('Invalid Google Cloud Vision credentials format. Must be valid JSON.');
        }
      } else {
        console.warn('⚠️ Warning: GOOGLE_CLOUD_VISION_CREDENTIALS not found in environment variables');
      }

      // Load Google Cloud Project ID
      this.config.projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || 
                             (this.config.visionCredentials ? this.config.visionCredentials.project_id : null);
      
      if (!this.config.projectId) {
        console.warn('⚠️ Warning: GOOGLE_CLOUD_PROJECT_ID not found in environment variables');
      }

      // Load verification thresholds
      this.config.faceQualityThreshold = parseFloat(process.env.FACE_QUALITY_THRESHOLD || '0.6');
      this.config.similarityThreshold = parseFloat(process.env.SIMILARITY_THRESHOLD || '0.7');

      // Additional configuration as needed
      this.config.environment = process.env.NODE_ENV || 'development';
      
      // Log environment variables for debugging
      console.log('🔧 Environment variables loaded:');
      console.log(`🌐 NODE_ENV: ${process.env.NODE_ENV}`);
      console.log(`🔑 STRIPE_SECRET_KEY: ${this.config.stripeSecretKey ? '✅ Loaded' : '❌ Missing'}`);
      console.log(`👁️ GOOGLE_CLOUD_VISION_CREDENTIALS: ${this.config.visionCredentials ? '✅ Loaded' : '❌ Missing'}`);
      console.log(`🌍 GOOGLE_CLOUD_PROJECT_ID: ${this.config.projectId || '❌ Missing'}`);
      
    } catch (error) {
      console.error('Config loader error:', error);
      throw error;
    }
  }

  get(key) {
    return this.config[key];
  }

  validate() {
    // Validate essential configuration
    if (!this.config.stripeSecretKey) {
      throw new Error('Missing required configuration: STRIPE_SECRET_KEY');
    }
    
    if (!this.config.visionCredentials) {
      throw new Error('Missing required configuration: GOOGLE_CLOUD_VISION_CREDENTIALS');
    }
    
    if (!this.config.projectId) {
      throw new Error('Missing required configuration: GOOGLE_CLOUD_PROJECT_ID');
    }
    
    // Validate service account structure
    const requiredKeys = ['private_key', 'client_email', 'project_id'];
    for (const key of requiredKeys) {
      if (!this.config.visionCredentials[key]) {
        throw new Error(`Google Cloud Vision credentials missing required field: ${key}`);
      }
    }
    
    return true;
  }

  printSummary() {
    console.log('🔧 Configuration Summary:');
    console.log(`🌐 Environment: ${this.config.environment}`);
    console.log(`🔑 Stripe Key: ${this.config.stripeSecretKey ? '✅ Loaded' : '❌ Missing'}`);
    console.log(`🔑 Project ID: ${this.config.projectId}`);
    console.log(`👤 Service Account: ${this.config.visionCredentials ? this.config.visionCredentials.client_email : '❌ Missing'}`);
    console.log(`🧮 Face Quality Threshold: ${this.config.faceQualityThreshold}`);
    console.log(`🔍 Similarity Threshold: ${this.config.similarityThreshold}`);
  }
}

// Export a singleton instance
module.exports = new ConfigLoader();