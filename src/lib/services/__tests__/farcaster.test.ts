import { farcasterService } from '../farcaster';

// Test configuration
const TEST_CASES = {
  // Well-known Farcaster accounts for testing
  VALID_USERNAME: 'dwr.eth', // Dan Romero - Farcaster co-founder
  VALID_FID: '3', // Dan Romero's FID
  VALID_ADDRESS: '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI contract (should have no Farcaster profile)
  INVALID_USERNAME: 'nonexistentuser12345',
  INVALID_ADDRESS: '0x0000000000000000000000000000000000000000'
};

describe('Farcaster Service Integration Tests', () => {
  // Test with a known username
  test('should analyze valid username successfully', async () => {
    console.log(`\n🧪 Testing Farcaster analysis for username: ${TEST_CASES.VALID_USERNAME}`);
    
    const result = await farcasterService.analyzeUser(TEST_CASES.VALID_USERNAME);
    
    console.log('📊 Analysis Results:');
    console.log(`- Has Profile: ${result.hasProfile}`);
    console.log(`- Eligibility Score: ${result.eligibilityScore}/100`);
    console.log(`- Airdrop Tier: ${result.airdropTier}`);
    
    if (result.profile) {
      console.log(`- Username: @${result.profile.username}`);
      console.log(`- Display Name: ${result.profile.displayName}`);
      console.log(`- FID: ${result.profile.fid}`);
      console.log(`- Followers: ${result.profile.followerCount.toLocaleString()}`);
      console.log(`- Following: ${result.profile.followingCount.toLocaleString()}`);
      console.log(`- Cast Count: ${result.profile.castCount.toLocaleString()}`);
      console.log(`- Account Age: ${result.profile.accountAge} days`);
      console.log(`- Power Badge: ${result.profile.hasPowerBadge ? '✅' : '❌'}`);
      console.log(`- Verified Address: ${result.profile.isVerifiedAddress ? '✅' : '❌'}`);
      console.log(`- Recent Casts (30d): ${result.profile.recentCastCount}`);
      console.log(`- Unique Channels: ${result.profile.uniqueChannelsPosted}`);
      console.log(`- Avg Engagement: ${result.profile.averageLikesPerCast.toFixed(2)} likes/cast`);
    }

    console.log('\n📈 Eligibility Breakdown:');
    Object.entries(result.eligibilityFactors).forEach(([factor, data]) => {
      const statusEmoji = {
        excellent: '🟢',
        good: '🟡',
        fair: '🟠',
        poor: '🔴'
      }[data.status];
      console.log(`- ${factor}: ${data.score} points ${statusEmoji} (${data.status})`);
    });

    if (result.castMetrics) {
      console.log('\n📝 Cast Metrics:');
      console.log(`- Total Casts: ${result.castMetrics.totalCasts}`);
      console.log(`- Recent Casts: ${result.castMetrics.recentCasts}`);
      console.log(`- Casting Streak: ${result.castMetrics.castingStreak} days`);
      console.log(`- Quality Score: ${result.castMetrics.qualityScore.toFixed(1)}`);
      
      if (result.castMetrics.topPerformingCast) {
        console.log(`- Top Cast: "${result.castMetrics.topPerformingCast.text}"`);
        console.log(`  Engagement: ${result.castMetrics.topPerformingCast.likes} likes, ${result.castMetrics.topPerformingCast.recasts} recasts`);
      }
    }

    console.log('\n💡 Recommendations:');
    result.recommendations.forEach((rec, i) => console.log(`${i + 1}. ${rec}`));

    if (result.riskFactors.length > 0) {
      console.log('\n⚠️ Risk Factors:');
      result.riskFactors.forEach((risk, i) => console.log(`${i + 1}. ${risk}`));
    }

    // Assertions
    expect(result.hasProfile).toBe(true);
    expect(result.eligibilityScore).toBeGreaterThan(0);
    expect(result.profile).not.toBeNull();
    expect(result.recommendations).toHaveLength.greaterThan(0);
    
  }, 30000); // 30 second timeout for API calls

  // Test with an Ethereum address
  test('should handle Ethereum address lookup', async () => {
    console.log(`\n🧪 Testing Farcaster analysis for address: ${TEST_CASES.VALID_ADDRESS}`);
    
    const result = await farcasterService.analyzeUser(TEST_CASES.VALID_ADDRESS);
    
    console.log('📊 Analysis Results:');
    console.log(`- Has Profile: ${result.hasProfile}`);
    console.log(`- Eligibility Score: ${result.eligibilityScore}/100`);
    console.log(`- Airdrop Tier: ${result.airdropTier}`);
    
    // This address likely won't have a Farcaster profile
    if (!result.hasProfile) {
      console.log('✅ Correctly identified no Farcaster profile for this address');
      console.log('\n💡 Default Recommendations:');
      result.recommendations.forEach((rec, i) => console.log(`${i + 1}. ${rec}`));
    }

    expect(result).toBeDefined();
    expect(result.recommendations).toHaveLength.greaterThan(0);
    
  }, 15000);

  // Test with invalid username
  test('should handle invalid username gracefully', async () => {
    console.log(`\n🧪 Testing Farcaster analysis for invalid username: ${TEST_CASES.INVALID_USERNAME}`);
    
    const result = await farcasterService.analyzeUser(TEST_CASES.INVALID_USERNAME);
    
    console.log('📊 Analysis Results:');
    console.log(`- Has Profile: ${result.hasProfile}`);
    console.log(`- Eligibility Score: ${result.eligibilityScore}/100`);
    console.log(`- Airdrop Tier: ${result.airdropTier}`);
    
    expect(result.hasProfile).toBe(false);
    expect(result.eligibilityScore).toBe(0);
    expect(result.airdropTier).toBe('Minimal');
    expect(result.recommendations).toHaveLength.greaterThan(0);
    
  }, 15000);

  // Test caching functionality
  test('should use caching for repeated requests', async () => {
    console.log(`\n🧪 Testing caching functionality with username: ${TEST_CASES.VALID_USERNAME}`);
    
    const start1 = Date.now();
    const result1 = await farcasterService.analyzeUser(TEST_CASES.VALID_USERNAME);
    const time1 = Date.now() - start1;
    
    const start2 = Date.now();
    const result2 = await farcasterService.analyzeUser(TEST_CASES.VALID_USERNAME);
    const time2 = Date.now() - start2;
    
    console.log(`- First request: ${time1}ms`);
    console.log(`- Second request: ${time2}ms`);
    console.log(`- Cache effectiveness: ${time2 < time1 / 2 ? '✅ Working' : '❌ Not working'}`);
    
    // Results should be identical
    expect(result1.eligibilityScore).toBe(result2.eligibilityScore);
    expect(result1.hasProfile).toBe(result2.hasProfile);
    
    // Second request should be significantly faster (cached)
    expect(time2).toBeLessThan(time1 / 2);
    
  }, 45000);
});

// Manual test runner for development
export async function runManualTests() {
  console.log('🚀 Running Farcaster Integration Tests...\n');
  
  try {
    // Test 1: Known good username
    console.log('='.repeat(60));
    console.log('TEST 1: Known Farcaster User');
    console.log('='.repeat(60));
    
    const result1 = await farcasterService.analyzeUser('dwr.eth');
    console.log('✅ Test 1 completed successfully');
    
    // Test 2: Ethereum address
    console.log('\n' + '='.repeat(60));
    console.log('TEST 2: Ethereum Address Lookup');
    console.log('='.repeat(60));
    
    const result2 = await farcasterService.analyzeUser('0x6B175474E89094C44Da98b954EedeAC495271d0F');
    console.log('✅ Test 2 completed successfully');
    
    // Test 3: Invalid user
    console.log('\n' + '='.repeat(60));
    console.log('TEST 3: Invalid Username');
    console.log('='.repeat(60));
    
    const result3 = await farcasterService.analyzeUser('nonexistentuser12345');
    console.log('✅ Test 3 completed successfully');
    
    console.log('\n🎉 All tests completed successfully!');
    
    return {
      test1: result1,
      test2: result2,
      test3: result3
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

// Export for use in development
if (require.main === module) {
  runManualTests().catch(console.error);
}