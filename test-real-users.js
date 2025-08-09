#!/usr/bin/env node

/**
 * Test with Real Users - Try to find working Farcaster usernames
 */

const { NeynarAPIClient, Configuration } = require('@neynar/nodejs-sdk');
const fs = require('fs');

// Load API key
let API_KEY;
try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
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

// Try the usernames you provided plus some variations
const testUsernames = [
  // Your provided usernames
  'biterror_eth',
  'yuga', 
  'kokocodesthese',
  
  // Variations without underscores/special chars
  'biterror',
  'biteth',
  'koko',
  'kokocodes',
  
  // Common short usernames that might exist
  'dan',
  'v',
  'a',
  'b',
  'c',
  'test',
  'user',
  'farcaster',
  'fc'
];

async function findWorkingUsers() {
  console.log('🔍 Searching for working Farcaster usernames...\n');
  
  const workingUsers = [];
  
  for (const username of testUsernames) {
    try {
      console.log(`Testing: @${username}`);
      
      const response = await client.lookupUserByUsername({ username });
      
      if (response.result?.user) {
        const user = response.result.user;
        console.log(`✅ FOUND: @${user.username} (FID: ${user.fid})`);
        console.log(`   Display: ${user.display_name}`);
        console.log(`   Followers: ${user.follower_count || 0}`);
        console.log(`   Power Badge: ${user.power_badge ? 'Yes' : 'No'}`);
        
        workingUsers.push(user);
        
        // If we find a working user, test the enhanced analysis
        if (workingUsers.length === 1) {
          console.log(`\n🧪 Testing enhanced analysis with @${user.username}...\n`);
          await testEnhancedAnalysis(user);
        }
        
      } else {
        console.log(`❌ Not found: @${username}`);
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      if (error.message.includes('404')) {
        console.log(`❌ Not found: @${username}`);
      } else if (error.message.includes('429')) {
        console.log(`⏳ Rate limited on @${username} - waiting...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      } else {
        console.log(`❌ Error with @${username}: ${error.message}`);
      }
    }
  }
  
  return workingUsers;
}

async function testEnhancedAnalysis(user) {
  try {
    // Test cast fetching
    console.log('📝 Testing cast fetching...');
    const castsResponse = await client.fetchCastsForUser({ fid: user.fid, limit: 10 });
    const casts = castsResponse.result?.casts || [];
    console.log(`✅ Found ${casts.length} casts`);
    
    if (casts.length > 0) {
      const recentCast = casts[0];
      console.log(`   Latest: "${recentCast.text.substring(0, 50)}..."`);
      console.log(`   Engagement: ${(recentCast.reactions?.likes_count || 0)} likes`);
    }
    
    // Test channel fetching
    console.log('\n📺 Testing channel fetching...');
    const channelsResponse = await client.fetchUserChannels({ fid: user.fid });
    const channels = channelsResponse.result?.channels || [];
    console.log(`✅ Found ${channels.length} channels`);
    
    if (channels.length > 0) {
      console.log(`   Channels: ${channels.slice(0, 3).map(c => c.name || c.id).join(', ')}`);
    }
    
    // Calculate a simple eligibility score
    let score = 0;
    if (user.power_badge) score += 25;
    if (user.verifications?.length > 0) score += 20;
    if (user.follower_count >= 100) score += 20;
    if (casts.length >= 10) score += 20;
    if (user.active_status === 'active') score += 15;
    
    console.log(`\n🎯 Simple Eligibility Score: ${score}/100`);
    
    const tier = score >= 80 ? 'Premium' : 
                 score >= 60 ? 'High' : 
                 score >= 40 ? 'Medium' : 
                 score >= 20 ? 'Low' : 'Minimal';
    
    console.log(`🏆 Tier: ${tier}`);
    
    return { user, score, tier, casts: casts.length, channels: channels.length };
    
  } catch (error) {
    console.log(`❌ Enhanced analysis failed: ${error.message}`);
    return null;
  }
}

async function testWithApp(workingUsers) {
  if (workingUsers.length === 0) {
    console.log('\n❌ No working users found to test with the app');
    return;
  }
  
  console.log('\n🚀 Testing with the actual app...\n');
  
  const testUser = workingUsers[0];
  
  try {
    const response = await fetch('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: `@${testUser.username}`
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      
      if (result.success && result.data?.socialAnalysis?.farcasterProfile?.hasProfile) {
        const fc = result.data.socialAnalysis.farcasterProfile;
        console.log(`✅ App successfully analyzed @${testUser.username}!`);
        console.log(`🎯 Eligibility Score: ${fc.eligibilityScore}/100`);
        console.log(`🏆 Airdrop Tier: ${fc.airdropTier}`);
        console.log(`📊 Profile Found: ${fc.profile ? 'Yes' : 'No'}`);
        
        if (fc.profile) {
          console.log(`   Followers: ${fc.profile.followerCount}`);
          console.log(`   Power Badge: ${fc.profile.hasPowerBadge ? 'Yes' : 'No'}`);
          console.log(`   Recent Casts: ${fc.profile.recentCastCount}`);
        }
        
        console.log('\n🎉 SUCCESS! The enhanced Farcaster integration is working!');
        
      } else {
        console.log(`❌ App analysis failed or no profile found`);
      }
      
    } else {
      console.log(`❌ App request failed: ${response.status}`);
    }
    
  } catch (error) {
    console.log(`❌ Error testing with app: ${error.message}`);
    console.log('   Make sure the app is running: npm run dev');
  }
}

async function runTest() {
  console.log('🎯 REAL FARCASTER USER TEST\n');
  console.log('Searching for working usernames and testing enhanced features...\n');
  
  const workingUsers = await findWorkingUsers();
  
  console.log(`\n📊 RESULTS SUMMARY:`);
  console.log(`✅ Found ${workingUsers.length} working users`);
  
  if (workingUsers.length > 0) {
    console.log('\n🎉 Working Users:');
    workingUsers.forEach((user, i) => {
      console.log(`  ${i + 1}. @${user.username} (${user.display_name})`);
    });
    
    await testWithApp(workingUsers);
    
  } else {
    console.log('\n❌ No working users found');
    console.log('📝 This could mean:');
    console.log('   1. The usernames provided don\'t exist');
    console.log('   2. The API key has limitations');
    console.log('   3. The usernames need different formatting');
    console.log('   4. Rate limiting is preventing access');
  }
  
  console.log('\n✅ Test complete!');
}

runTest().catch(console.error);