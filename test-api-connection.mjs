#!/usr/bin/env node

/**
 * Test API Connection and Find Working Usernames
 */

import { NeynarAPIClient, Configuration } from '@neynar/nodejs-sdk';
import { readFileSync } from 'fs';

// Load API key
let API_KEY;
try {
  const envContent = readFileSync('.env.local', 'utf8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    if (line.startsWith('NEYNAR_API_KEY=')) {
      API_KEY = line.split('=')[1].trim().replace(/"/g, '');
      break;
    }
  }
} catch (error) {
  console.error('Could not read .env.local file');
}

console.log(`🔑 Using API Key: ${API_KEY ? API_KEY.substring(0, 8) + '...' : 'NOT FOUND'}`);

if (!API_KEY) {
  console.error('❌ NEYNAR_API_KEY not found in .env.local');
  process.exit(1);
}

const config = new Configuration({
  apiKey: API_KEY,
  baseOptions: {
    headers: {
      "x-neynar-experimental": true,
    },
  },
});

const client = new NeynarAPIClient(config);

// Test with real Farcaster usernames provided by user
const testUsernames = [
  'biterror_eth',    // Real Farcaster user
  'yuga',            // Real Farcaster user  
  'kokocodesthese'   // Real Farcaster user
];

async function testBasicConnection() {
  console.log('\n🧪 Testing Basic API Connection\n');

  for (const username of testUsernames) {
    try {
      console.log(`📋 Testing: @${username}`);
      
      const response = await client.lookupUserByUsername({ username });
      
      if (response.result?.user) {
        const user = response.result.user;
        console.log(`✅ SUCCESS! Found user:`);
        console.log(`   Username: @${user.username}`);
        console.log(`   Display Name: ${user.display_name || 'N/A'}`);
        console.log(`   FID: ${user.fid}`);
        console.log(`   Followers: ${user.follower_count?.toLocaleString() || 0}`);
        console.log(`   Power Badge: ${user.power_badge ? '✅' : '❌'}`);
        console.log(`   Verified: ${user.verifications?.length > 0 ? '✅' : '❌'}`);
        
        // This user works - let's use it for further testing
        return user;
      } else {
        console.log(`❌ No user found for: @${username}`);
      }

    } catch (error) {
      console.log(`❌ Error with @${username}: ${error.message}`);
      
      if (error.message.includes('429')) {
        console.log('⏳ Rate limited - waiting 5 seconds...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      } else if (error.message.includes('401')) {
        console.log('🔑 Authentication error - API key may be invalid');
        break;
      }
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return null;
}

async function testWithWorkingUser(user) {
  if (!user) {
    console.log('\n❌ No working user found to test with');
    return;
  }
  
  console.log(`\n🔍 Testing detailed analysis with @${user.username}\n`);
  
  try {
    // Test cast fetching
    console.log('📝 Fetching recent casts...');
    const castsResponse = await client.fetchUserCasts({ fid: user.fid, limit: 10 });
    const casts = castsResponse.result?.casts || [];
    
    console.log(`✅ Found ${casts.length} casts`);
    
    if (casts.length > 0) {
      const recentCast = casts[0];
      console.log(`   Latest cast: "${recentCast.text.substring(0, 50)}..."`);
      console.log(`   Likes: ${recentCast.reactions?.likes_count || 0}`);
      console.log(`   Recasts: ${recentCast.reactions?.recasts_count || 0}`);
      console.log(`   Replies: ${recentCast.reactions?.replies_count || 0}`);
    }
    
  } catch (error) {
    console.log(`❌ Error fetching casts: ${error.message}`);
  }
  
  // Test quality score (may not work on free tier)
  try {
    console.log('\n🎯 Testing quality score...');
    const qualityResponse = await client.fetchUserQualityScore({ fid: user.fid });
    const score = qualityResponse.result?.score;
    console.log(`✅ Quality Score: ${score ? (score * 100).toFixed(1) + '%' : 'N/A'}`);
  } catch (error) {
    console.log(`❌ Quality score not available: ${error.message}`);
  }
}

async function runConnectionTest() {
  console.log('🚀 NEYNAR API CONNECTION TEST\n');
  console.log('Testing API connectivity and finding working usernames...\n');
  
  const workingUser = await testBasicConnection();
  await testWithWorkingUser(workingUser);
  
  console.log('\n🎉 CONNECTION TEST COMPLETE!\n');
  
  if (workingUser) {
    console.log('✅ API connection is working');
    console.log(`✅ Found working user: @${workingUser.username}`);
    console.log('✅ Ready to test with the application');
    
    console.log('\n📝 NEXT STEPS:');
    console.log(`1. Test the app with: @${workingUser.username}`);
    console.log('2. Start the dev server: npm run dev');
    console.log('3. Visit: http://localhost:3000');
    console.log(`4. Enter: @${workingUser.username}`);
  } else {
    console.log('❌ No working users found');
    console.log('🔑 Check if your API key is valid');
    console.log('📋 Try different usernames');
  }
}

runConnectionTest().catch(console.error);