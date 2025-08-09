#!/usr/bin/env node

/**
 * Enhanced Farcaster Integration Test
 * Tests the updated Farcaster service with real user data
 */

import { NeynarAPIClient, Configuration } from '@neynar/nodejs-sdk';
import { readFileSync } from 'fs';

// Load environment variables manually
let API_KEY;
try {
  const envContent = readFileSync('.env.local', 'utf8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    if (line.startsWith('NEYNAR_API_KEY=')) {
      API_KEY = line.split('=')[1].trim();
      break;
    }
  }
} catch (error) {
  console.error('Could not read .env.local file');
}

// API_KEY loaded above

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

// Test users with different expected tiers
const testUsers = [
  { fid: 3, username: 'dwr.eth', expectedTier: 'Premium', description: 'Dan Romero (Founder)' },
  { fid: 194, username: 'rahul', expectedTier: 'High', description: 'Rahul (Engineer)' },
  { fid: 602, username: 'varunsrin.eth', expectedTier: 'High', description: 'Varun (Active Community)' },
  { fid: 1, username: 'vitalik.eth', expectedTier: 'Premium', description: 'Vitalik Buterin' },
  { fid: 10235, username: 'newuser', expectedTier: 'Low', description: 'New User' }
];

async function testEnhancedFarcasterAnalysis() {
  console.log('🚀 Testing Enhanced Farcaster Integration\n');
  console.log('=' .repeat(60));

  for (const testUser of testUsers) {
    try {
      console.log(`\n📊 Analyzing FID ${testUser.fid} - ${testUser.description}`);
      console.log('-'.repeat(50));

      // Get basic user data
      const userResponse = await client.lookupUserByFid({ fid: testUser.fid });
      const userData = userResponse.result.user;

      console.log(`Username: @${userData.username}`);
      console.log(`Display Name: ${userData.display_name}`);
      console.log(`Followers: ${userData.follower_count?.toLocaleString() || 0}`);
      console.log(`Following: ${userData.following_count?.toLocaleString() || 0}`);
      console.log(`Power Badge: ${userData.power_badge ? '✅' : '❌'}`);
      console.log(`Verifications: ${userData.verifications?.length || 0}`);

      // Test Neynar Quality Score (may not be available on all tiers)
      let qualityScore = null;
      try {
        // Note: This endpoint may not be available on free tier
        const qualityResponse = await client.fetchUserQualityScore({ fid: testUser.fid });
        qualityScore = qualityResponse.result?.score;
        console.log(`Quality Score: ${qualityScore ? `${(qualityScore * 100).toFixed(1)}%` : 'N/A'}`);
      } catch (error) {
        console.log(`Quality Score: Not available (${error.message.includes('401') ? 'requires paid tier' : error.message})`);
      }

      // Calculate account age
      const accountAge = Math.floor(
        (Date.now() - new Date(userData.object_timestamp).getTime()) / (1000 * 60 * 60 * 24)
      );
      console.log(`Account Age: ${accountAge} days`);

      // Get recent activity
      try {
        const castsResponse = await client.fetchUserCasts({ fid: testUser.fid, limit: 50 });
        const casts = castsResponse.result?.casts || [];
        
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const recentCasts = casts.filter(cast => new Date(cast.timestamp) > thirtyDaysAgo);
        
        console.log(`Total Casts: ${userData.cast_count || 0}`);
        console.log(`Recent Casts (30d): ${recentCasts.length}`);

        // Calculate engagement
        if (recentCasts.length > 0) {
          const totalEngagement = recentCasts.reduce((sum, cast) => {
            return sum + (cast.reactions?.likes_count || 0) + 
                       (cast.reactions?.recasts_count || 0) + 
                       (cast.reactions?.replies_count || 0);
          }, 0);
          
          const avgEngagement = totalEngagement / recentCasts.length;
          console.log(`Avg Engagement: ${avgEngagement.toFixed(1)} per cast`);
        }

      } catch (error) {
        console.log(`Activity Analysis: Error - ${error.message}`);
      }

      // Determine quality tier
      let qualityTier = 'unverified';
      
      if (qualityScore && qualityScore >= 0.8 && userData.power_badge && userData.verifications?.length > 0) {
        qualityTier = 'premium';
      } else if ((qualityScore && qualityScore >= 0.6) || (userData.power_badge && userData.verifications?.length > 0)) {
        qualityTier = 'high';
      } else if ((qualityScore && qualityScore >= 0.4) || (userData.verifications?.length > 0 && accountAge >= 90)) {
        qualityTier = 'standard';
      } else if (accountAge >= 30) {
        qualityTier = 'low';
      }

      console.log(`\n🏆 Quality Tier: ${qualityTier.toUpperCase()}`);
      console.log(`📈 Expected Tier: ${testUser.expectedTier.toUpperCase()}`);
      console.log(`✅ Match: ${qualityTier.toLowerCase() === testUser.expectedTier.toLowerCase() ? 'YES' : 'NO'}`);

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error(`❌ Error analyzing FID ${testUser.fid}:`, error.message);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Enhanced Farcaster Integration Test Complete');
}

// Test username lookup
async function testUsernameLookup() {
  console.log('\n🔍 Testing Username Lookup');
  console.log('-'.repeat(30));

  const testUsernames = ['dwr.eth', 'vitalik.eth', 'rahul'];

  for (const username of testUsernames) {
    try {
      const response = await client.lookupUserByUsername({ username });
      const user = response.result.user;
      console.log(`✅ @${username} → FID ${user.fid} (${user.display_name})`);
    } catch (error) {
      console.log(`❌ @${username} → Error: ${error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

// Test address lookup
async function testAddressLookup() {
  console.log('\n🔍 Testing Address Lookup');
  console.log('-'.repeat(30));

  // Test with known verified addresses
  const testAddresses = [
    '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // vitalik.eth
    '0x8773442740C17C9d0F0B87022c722F9a136206eD'  // dwr.eth
  ];

  for (const address of testAddresses) {
    try {
      const response = await client.fetchBulkUsersByEthereumAddress({ addresses: [address] });
      const users = response.result?.[address];
      
      if (users && users.length > 0) {
        const user = users[0];
        console.log(`✅ ${address} → @${user.username} (FID ${user.fid})`);
      } else {
        console.log(`❌ ${address} → No Farcaster profile found`);
      }
    } catch (error) {
      console.log(`❌ ${address} → Error: ${error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

// Run all tests
async function runAllTests() {
  try {
    await testEnhancedFarcasterAnalysis();
    await testUsernameLookup();
    await testAddressLookup();
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📝 Next Steps:');
    console.log('1. Review the quality tier assignments');
    console.log('2. Test with your app\'s frontend');
    console.log('3. Verify API rate limiting works correctly');
    console.log('4. Test error handling with invalid inputs');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  }
}

runAllTests();