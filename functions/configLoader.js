// configLoader.js
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

class ConfigLoader {
  constructor() {
    this.config = {};
    this.loadConfig();
  }

  loadConfig() {
    try {
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
        throw new Error('Missing required configuration: GOOGLE_CLOUD_VISION_CREDENTIALS');
      }

      // Load Google Cloud Project ID
      this.config.projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || 
                             (this.config.visionCredentials ? this.config.visionCredentials.project_id : null);
      
      if (!this.config.projectId) {
        throw new Error('Missing required configuration: GOOGLE_CLOUD_PROJECT_ID');
      }

      // Load verification thresholds
      this.config.faceQualityThreshold = parseFloat(process.env.FACE_QUALITY_THRESHOLD || '0.6');
      this.config.similarityThreshold = parseFloat(process.env.SIMILARITY_THRESHOLD || '0.7');

      // Additional configuration as needed
      this.config.environment = process.env.NODE_ENV || 'development';
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
    if (!this.config.visionCredentials) {
      throw new Error('Missing Google Cloud Vision credentials');
    }
    
    if (!this.config.projectId) {
      throw new Error('Missing Google Cloud Project ID');
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
    console.log(`🔑 Project ID: ${this.config.projectId}`);
    console.log(`👤 Service Account: ${this.config.visionCredentials.client_email}`);
    console.log(`🧮 Face Quality Threshold: ${this.config.faceQualityThreshold}`);
    console.log(`🔍 Similarity Threshold: ${this.config.similarityThreshold}`);
  }
}

// Export a singleton instance
module.exports = new ConfigLoader();