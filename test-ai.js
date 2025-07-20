// Quick test script for AI functionality
const axios = require('axios');

async function testAI() {
  try {
    console.log('🧪 Testing AI with a simple repository question...');
    
    const response = await axios.post('http://localhost:3000/api/explain/ask-repository', {
      owner: 'test',
      repo: 'test',
      question: 'What is this project about?',
      projectIndex: null
    });
    
    console.log('✅ AI Response:', response.data.answer);
    console.log('📊 Has project index:', response.data.hasProjectIndex);
    
  } catch (error) {
    console.error('❌ AI Test failed:', error.response?.data || error.message);
  }
}

testAI();
