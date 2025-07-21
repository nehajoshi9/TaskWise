const OpenAI = require('openai');

// Replace with your actual API key
const apiKey = process.env.OPENAI_API_KEY || 'key_45P79xZI6oG5e46w';

const openai = new OpenAI({ apiKey });

async function checkQuota() {
  try {
    console.log('Checking OpenAI API quota...\n');
    
    // Test a simple API call to see if it works
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Hello" }],
      max_tokens: 10
    });
    
    console.log('✅ API is working!');
    console.log('Response:', response.choices[0].message.content);
    
    // Note: OpenAI doesn't provide quota info via API, you need to check the dashboard
    
  } catch (error) {
    console.log('❌ API Error:');
    console.log('Status:', error.status);
    console.log('Message:', error.message);
    console.log('Type:', error.type);
    console.log('Code:', error.code);
    
    if (error.status === 429) {
      console.log('\n🔴 QUOTA EXCEEDED - You need to check your billing!');
      console.log('📊 Go to: https://platform.openai.com/account/billing');
    } else if (error.status === 401) {
      console.log('\n🔴 INVALID API KEY - Check your API key!');
      console.log('🔑 Go to: https://platform.openai.com/account/api-keys');
    } else if (error.status === 404) {
      console.log('\n🔴 MODEL NOT FOUND - Check the model name!');
    }
    
    console.log('\n📋 To check your quota and billing:');
    console.log('1. Go to: https://platform.openai.com/account/billing');
    console.log('2. Check your current usage and remaining credits');
    console.log('3. Add payment method if needed');
  }
}

checkQuota(); 