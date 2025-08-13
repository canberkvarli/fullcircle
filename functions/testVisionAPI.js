const vision = require('@google-cloud/vision');
const configLoader = require('./configLoader');

// Test script for Google Cloud Vision API
// Run this to verify your setup is working

async function testVisionAPI() {
  try {
    console.log('🔍 Testing Google Cloud Vision API...');
    
    // Validate configuration
    configLoader.validate();
    configLoader.printSummary();
    
    // Initialize the client using config loader
    const visionClient = new vision.ImageAnnotatorClient({
      credentials: configLoader.get('visionCredentials'),
      projectId: configLoader.get('projectId')
    });
    
    console.log('✅ Vision client initialized successfully');
    
    // Test with a simple image URL (you can replace this with your own test image)
    const testImageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/1200px-Google_2015_logo.svg.png';
    
    console.log('📸 Testing image analysis...');
    
    const request = {
      image: {
        source: {
          imageUri: testImageUrl
        }
      },
      features: [
        { type: 'LABEL_DETECTION' },
        { type: 'SAFE_SEARCH_DETECTION' }
      ]
    };
    
    const [result] = await visionClient.annotateImage(request);
    
    console.log('✅ API call successful!');
    console.log('📊 Results:');
    
    if (result.labelAnnotations) {
      console.log('🏷️  Labels detected:');
      result.labelAnnotations.forEach(label => {
        console.log(`   - ${label.description} (confidence: ${Math.round(label.score * 100)}%)`);
      });
    }
    
    if (result.safeSearchAnnotation) {
      console.log('🛡️  Safe search results:');
      const safeSearch = result.safeSearchAnnotation;
      console.log(`   - Adult: ${safeSearch.adult}`);
      console.log(`   - Violence: ${safeSearch.violence}`);
      console.log(`   - Racy: ${safeSearch.racy}`);
    }
    
    console.log('\n🎉 Vision API test completed successfully!');
    console.log('Your setup is working correctly.');
    
  } catch (error) {
    console.error('❌ Vision API test failed:', error.message);
    
    if (error.message.includes('Missing required configuration')) {
      console.error('\n💡 Solution: Check your configuration setup.');
      console.error('   - Create a .env file in the functions directory');
      console.error('   - Or add Vision API credentials to your config files');
      console.error('   - See config.env.example for reference');
    } else if (error.message.includes('Permission denied')) {
      console.error('\n💡 Solution: Check that your service account has the correct roles assigned.');
      console.error('   Required role: "Cloud Vision API User"');
    } else if (error.message.includes('API not enabled')) {
      console.error('\n💡 Solution: Enable the Cloud Vision API in your Google Cloud Console.');
    } else if (error.message.includes('Unexpected token')) {
      console.error('\n💡 Solution: Check that your Vision API credentials are valid JSON.');
      console.error('   Make sure the private key includes proper newline characters (\\n).');
    }
    
    console.error('\n📚 Check the setup guide for more details: google-vision-setup.md');
  }
}

// Run the test
testVisionAPI();
