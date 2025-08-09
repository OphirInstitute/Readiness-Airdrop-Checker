#!/usr/bin/env node

/**
 * Test Real Usernames - Test the specific usernames provided by the user
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

const config = new Configuration({
  apiKey: API_KEY,
});

const client = new NeynarAPIClient(config);

// Real usernames provided by the user
const realUsernames = [
  'biterror.eth',    // @biterror.eth
  'blankspace',      // @blankspace  
  'zeni.eth'         // @zeni.eth
];

async function testRealUsernames() {
  console.log('🔍 Testing Real Farcaster Usernames\n');
  
  for (const username of realUsernames) {
    try {
      console.log(`📋 Testing: @${username}`);
      
      const response = await client.lookupUserByUsername({ username });
      console.log('Raw response:', JSON.stringify(response, null, 2));
      
      if (response.user) {
        const user = response.user;
        console.log(`✅ FOUND: @${user.username} (FID: ${user.fid})`);
        console.log(`   Display: ${user.display_name}`);
        console.log(`   Followers: ${user.follower_count || 0}`);
        console.log(`   Power Badge: ${user.power_badge ? 'Yes' : 'No'}`);
        console.log(`   Verifications: ${user.verifications?.length || 0}`);
        
        // Test cast fetching
        try {
          const castsResponse = await client.fetchCastsForUser({ fid: user.fid, limit: 5 });
          console.log('Casts response:', JSON.stringify(castsResponse, null, 2));
          
          const casts = castsResponse.casts || [];
          console.log(`   Recent Casts: ${casts.length}`);
          
          if (casts.length > 0) {
            const recentCast = casts[0];
            console.log(`   Latest: "${recentCast.text.substring(0, 50)}..."`);
          }
        } catch (castError) {
          console.log(`   Cast fetch error: ${castError.message}`);
        }
        
      } else {
        console.log(`❌ Not found: @${username}`);
        console.log('Response structure:', Object.keys(response));
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.log(`❌ Error with @${username}: ${error.message}`);
      if (error.response) {
        console.log('Error response:', error.response.status, error.response.statusText);
      }
    }
  }
}

async function testAppIntegration() {
  console.log('\n🚀 Testing App Integration\n');
  
  for (const username of realUsernames) {
    try {
      console.log(`📊 Testing app with @${username}`);
      
      const response = await fetch('http://localhost:3000/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: `@${username}`
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('App response:', JSON.stringify(result, null, 2));
        
        if (result.success && result.data?.socialAnalysis?.farcasterProfile) {
          const fc = result.data.socialAnalysis.farcasterProfile;
          console.log(`✅ App found profile: ${fc.hasProfile}`);
          if (fc.profile) {
            console.log(`   Username: @${fc.profile.username}`);
            console.log(`   Followers: ${fc.profile.followerCount}`);
            console.log(`   Tier: ${fc.airdropTier}`);
          }
        } else {
          console.log(`❌ App didn't find profile`);
        }
      } else {
        console.log(`❌ App request failed: ${response.status}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.log(`❌ App test error: ${error.message}`);
    }
  }
}

async function runTest() {
  console.log('🎯 REAL USERNAME TEST\n');
  console.log('Testing with the specific usernames you provided...\n');
  
  await testRealUsernames();
  
  // Check if app is running
  try {
    const healthCheck = await fetch('http://localhost:3000/api/analyze');
    if (healthCheck.ok) {
      await testAppIntegration();
    } else {
      console.log('\n⚠️ App not running - start with: npm run dev');
    }
  } catch (error) {
    console.log('\n⚠️ App not accessible - make sure it\'s running on localhost:3000');
  }
  
  console.log('\n✅ Test complete!');
}

runTest().catch(console.error);