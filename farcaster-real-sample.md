# Real-Data Testing Strategy for Farcaster Airdrop Eligibility App

## Latest Research Updates (January 2025)

### Key Findings from Recent Research:

1. **Neynar User Quality Score**: Neynar now provides a built-in user quality score (0-1) that measures user authenticity and engagement quality. This is crucial for airdrop eligibility.

2. **OpenRank Integration**: OpenRank provides decentralized reputation scoring for Farcaster users using EigenTrust algorithms. Scores are now available on-chain (Base network) and updated weekly.

3. **Enhanced Power Badge Metrics**: Power badges are now more sophisticated, with Neynar providing dedicated endpoints for power user analysis.

4. **Frame Interaction Tracking**: Frame interactions are now trackable through Pinata FDK and provide valuable engagement metrics for airdrop scoring.

5. **Channel Participation Depth**: Channel-specific engagement metrics are now more detailed, allowing for better community participation scoring.

### Updated API Capabilities:

- **Neynar User Quality Score API**: `/v2/farcaster/user/quality-score`
- **OpenRank Scores**: Available on-chain at Base network
- **Frame Analytics**: Through Pinata FDK integration
- **Enhanced Channel Metrics**: More detailed channel participation data

Here's how to test your app with real Farcaster data using your Neynar API key:

## 1. Test User Lookup Script
```javascript
// testUserLookup.js
import { NeynarAPIClient } from "@neynar/nodejs-sdk";

const API_KEY = "YOUR_NEYNAR_API_KEY";
const client = new NeynarAPIClient(API_KEY);

// Test with real Farcaster FIDs - Updated for 2025
const testFIDs = [
  3,     // Dan Romero (Farcaster founder) - Premium tier expected
  194,   // Rahul (Farcaster engineer) - High tier expected
  183,   // Jason (Early Farcaster user) - High tier expected
  602,   // Varun (Active community member) - Medium-High tier expected
  10235, // New user with minimal activity - Low tier expected
  1,     // Vitalik Buterin - Premium tier expected
  2,     // Balaji - Premium tier expected
  5650,  // Jesse Pollak (Base) - High tier expected
  239,   // Linda Xie - High tier expected
  99     // Early adopter - Medium-High tier expected
];

async function testUserLookup() {
  for (const fid of testFIDs) {
    try {
      const user = await client.lookupUserByFid(fid);
      
      console.log(`\n=== FID ${fid} ===`);
      console.log(`Username: ${user.result.user.username}`);
      console.log(`Display Name: ${user.result.user.displayName}`);
      console.log(`Follower Count: ${user.result.user.followerCount}`);
      console.log(`Following Count: ${user.result.user.followingCount}`);
      console.log(`Verifications: ${user.result.user.verifications.length}`);
      console.log(`Active Status: ${user.result.user.activeStatus}`);
      console.log(`Power User: ${user.result.user.powerBadge}`);
      
      // NEW: Get Neynar User Quality Score
      try {
        const qualityScore = await client.fetchUserQualityScore(fid);
        console.log(`Quality Score: ${qualityScore.result.score}/1.0`);
      } catch (error) {
        console.log(`Quality Score: Not available`);
      }
      
      // NEW: Check OpenRank score (if available)
      console.log(`Account Age: ${Math.floor((Date.now() - new Date(user.result.user.object_timestamp).getTime()) / (1000 * 60 * 60 * 24))} days`);
      
    } catch (error) {
      console.error(`Error fetching FID ${fid}:`, error.message);
    }
  }
}

testUserLookup();
```

## 1.5 Enhanced User Quality Testing (NEW)
```javascript
// testUserQuality.js - Using latest Neynar features
import { NeynarAPIClient } from "@neynar/nodejs-sdk";

const API_KEY = "YOUR_NEYNAR_API_KEY";
const client = new NeynarAPIClient(API_KEY);

async function testEnhancedUserMetrics(fid) {
  try {
    console.log(`\n=== Enhanced Metrics for FID ${fid} ===`);
    
    // Get basic user data
    const user = await client.lookupUserByFid(fid);
    const userData = user.result.user;
    
    // NEW: Get Neynar User Quality Score
    let qualityScore = null;
    try {
      const qualityResponse = await client.fetchUserQualityScore(fid);
      qualityScore = qualityResponse.result.score;
      console.log(`Neynar Quality Score: ${qualityScore}/1.0`);
    } catch (error) {
      console.log(`Neynar Quality Score: Not available`);
    }
    
    // Enhanced power user analysis
    const isPowerUser = userData.power_badge;
    console.log(`Power Badge Status: ${isPowerUser ? '✅ Verified Power User' : '❌ Standard User'}`);
    
    // Account maturity analysis
    const accountAge = Math.floor((Date.now() - new Date(userData.object_timestamp).getTime()) / (1000 * 60 * 60 * 24));
    console.log(`Account Age: ${accountAge} days`);
    
    // Storage allocation (premium feature indicator)
    const hasStorage = userData.storage_allocated || false;
    const storageUsed = userData.storage_used || 0;
    console.log(`Storage Allocation: ${hasStorage ? `✅ ${storageUsed} units used` : '❌ No allocation'}`);
    
    // Verification depth
    const verifications = userData.verifications || [];
    console.log(`Verified Addresses: ${verifications.length}`);
    verifications.forEach((addr, i) => {
      console.log(`  ${i + 1}. ${addr}`);
    });
    
    // Calculate composite airdrop score
    let airdropScore = 0;
    
    // Quality score weight (40%)
    if (qualityScore) airdropScore += qualityScore * 40;
    
    // Power badge weight (25%)
    if (isPowerUser) airdropScore += 25;
    
    // Account age weight (15%)
    if (accountAge >= 365) airdropScore += 15;
    else if (accountAge >= 180) airdropScore += 12;
    else if (accountAge >= 90) airdropScore += 8;
    else if (accountAge >= 30) airdropScore += 4;
    
    // Verification weight (10%)
    if (verifications.length >= 2) airdropScore += 10;
    else if (verifications.length >= 1) airdropScore += 7;
    
    // Storage allocation weight (10%)
    if (hasStorage) airdropScore += 10;
    
    console.log(`\n🎯 COMPOSITE AIRDROP SCORE: ${airdropScore.toFixed(1)}/100`);
    
    // Tier classification
    let tier = 'Minimal';
    if (airdropScore >= 80) tier = 'Premium';
    else if (airdropScore >= 65) tier = 'High';
    else if (airdropScore >= 45) tier = 'Medium';
    else if (airdropScore >= 25) tier = 'Low';
    
    console.log(`🏆 AIRDROP TIER: ${tier}`);
    
    return { fid, qualityScore, airdropScore, tier };
    
  } catch (error) {
    console.error(`Error analyzing FID ${fid}:`, error.message);
    return null;
  }
}

// Test enhanced metrics
const enhancedTestFIDs = [3, 194, 602, 10235, 1, 2];
Promise.all(enhancedTestFIDs.map(fid => testEnhancedUserMetrics(fid)))
  .then(results => {
    console.log('\n=== SUMMARY COMPARISON ===');
    results.filter(r => r).forEach(result => {
      console.log(`FID ${result.fid}: ${result.tier} (${result.airdropScore.toFixed(1)}/100)`);
    });
  });
```

## 2. Activity Analysis Test
```javascript
// testActivityAnalysis.js
import { NeynarAPIClient } from "@neynar/nodejs-sdk";

const API_KEY = "YOUR_NEYNAR_API_KEY";
const client = new NeynarAPIClient(API_KEY);

async function analyzeUserActivity(fid) {
  try {
    // Get user casts
    const casts = await client.fetchAllCastsCreatedByUser(fid, { limit: 100 });
    
    // Calculate activity metrics
    const now = new Date();
    const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));
    
    const recentCasts = casts.result.casts.filter(
      cast => new Date(cast.timestamp) > sevenDaysAgo
    );
    
    const castDates = recentCasts.map(cast => 
      new Date(cast.timestamp).toISOString().split('T')[0]
    );
    
    const uniqueCastDays = [...new Set(castDates)].length;
    
    console.log(`\n=== Activity Analysis for FID ${fid} ===`);
    console.log(`Total Casts: ${casts.result.casts.length}`);
    console.log(`Last 7 Days: ${recentCasts.length} casts`);
    console.log(`Active Days: ${uniqueCastDays}/7 days`);
    console.log(`Engagement Rate: ${calculateEngagement(recentCasts)}%`);
    
    // Channel participation
    const channels = new Set();
    recentCasts.forEach(cast => {
      if (cast.channel && cast.channel.id) channels.add(cast.channel.id);
    });
    
    console.log(`Channels Active In: ${channels.size}`);
    
  } catch (error) {
    console.error(`Error analyzing FID ${fid}:`, error.message);
  }
}

function calculateEngagement(casts) {
  let totalEngagement = 0;
  
  casts.forEach(cast => {
    totalEngagement += cast.replies.count + 
                      cast.reactions.likes.length +
                      cast.reactions.recasts.length;
  });
  
  return casts.length > 0 
    ? (totalEngagement / casts.length).toFixed(1)
    : 0;
}

// Test with sample users
analyzeUserActivity(3);   // Dan Romero
analyzeUserActivity(10235); // New user
```

## 3. Eligibility Scoring Test
```javascript
// testEligibilityScore.js
import { NeynarAPIClient } from "@neynar/nodejs-sdk";

const API_KEY = "YOUR_NEYNAR_API_KEY";
const client = new NeynarAPIClient(API_KEY);

async function calculateEligibilityScore(fid) {
  try {
    const user = await client.lookupUserByFid(fid);
    const casts = await client.fetchAllCastsCreatedByUser(fid, { limit: 100 });
    
    // Eligibility factors
    const factors = {
      verified: user.result.user.verifications.length > 0 ? 1 : 0,
      powerBadge: user.result.user.powerBadge ? 1 : 0,
      activeStatus: user.result.user.activeStatus === 'active' ? 1 : 0,
      followerCount: Math.min(user.result.user.followerCount / 1000, 1),
      channelParticipation: calculateChannelParticipation(casts.result.casts),
      recentActivity: calculateRecentActivity(casts.result.casts),
      engagementRate: calculateEngagementRate(casts.result.casts)
    };
    
    // Weighted score calculation
    const weights = {
      verified: 0.15,
      powerBadge: 0.20,
      activeStatus: 0.10,
      followerCount: 0.10,
      channelParticipation: 0.15,
      recentActivity: 0.15,
      engagementRate: 0.15
    };
    
    let totalScore = 0;
    for (const factor in factors) {
      totalScore += factors[factor] * weights[factor];
    }
    
    console.log(`\n=== Eligibility Score for ${user.result.user.displayName} ===`);
    console.log(`User FID: ${fid}`);
    console.log('Factor Scores:');
    for (const factor in factors) {
      console.log(`  ${factor}: ${(factors[factor] * 100).toFixed(0)}%`);
    }
    console.log(`TOTAL SCORE: ${(totalScore * 100).toFixed(1)}%`);
    
    return totalScore;
    
  } catch (error) {
    console.error(`Error calculating score for FID ${fid}:`, error.message);
    return 0;
  }
}

function calculateChannelParticipation(casts) {
  const channels = new Set();
  casts.forEach(cast => {
    if (cast.channel && cast.channel.id) channels.add(cast.channel.id);
  });
  return Math.min(channels.size / 5, 1); // Max 5 channels
}

function calculateRecentActivity(casts) {
  if (casts.length === 0) return 0;
  
  const now = Date.now();
  const lastCastDate = new Date(casts[0].timestamp).getTime();
  const daysSinceLastCast = (now - lastCastDate) / (1000 * 60 * 60 * 24);
  
  return daysSinceLastCast <= 3 ? 1 : 
         daysSinceLastCast <= 7 ? 0.5 : 0;
}

function calculateEngagementRate(casts) {
  if (casts.length === 0) return 0;
  
  let totalEngagement = 0;
  casts.slice(0, 20).forEach(cast => { // Last 20 casts
    totalEngagement += cast.replies.count + 
                      cast.reactions.likes.length +
                      cast.reactions.recasts.length;
  });
  
  const avgEngagement = totalEngagement / Math.min(casts.length, 20);
  return Math.min(avgEngagement / 5, 1); // Max 5 engagements per cast
}

// Test with different profile types
calculateEligibilityScore(3);      // High activity
calculateEligibilityScore(194);    // Medium activity
calculateEligibilityScore(10235);  // Low activity
```

## 4. Full Workflow Test
```javascript
// fullWorkflowTest.js
import { NeynarAPIClient } from "@neynar/nodejs-sdk";

const API_KEY = "YOUR_NEYNAR_API_KEY";
const client = new NeynarAPIClient(API_KEY);

async function fullAirdropCheck(fid) {
  try {
    console.log(`\nStarting airdrop check for FID: ${fid}`);
    
    // 1. Fetch user profile
    const userResponse = await client.lookupUserByFid(fid);
    const user = userResponse.result.user;
    console.log(`User found: ${user.displayName} (@${user.username})`);
    
    // 2. Get user activity
    const castsResponse = await client.fetchAllCastsCreatedByUser(fid, { limit: 100 });
    const casts = castsResponse.result.casts;
    console.log(`Found ${casts.length} casts`);
    
    // 3. Calculate eligibility factors
    const factors = {
      isVerified: user.verifications.length > 0,
      hasPowerBadge: user.powerBadge,
      isActive: user.activeStatus === 'active',
      minFollowers: user.followerCount > 100,
      minFollowing: user.followingCount > 50,
      recentActivity: calculateRecentActivity(casts),
      channelParticipation: calculateChannelParticipation(casts) >= 2,
      engagementRate: calculateEngagementRate(casts) > 0.5
    };
    
    // 4. Determine eligibility
    const eligibilityStatus = determineEligibility(factors);
    
    // 5. Generate report
    console.log("\n=== AIRDROP ELIGIBILITY REPORT ===");
    console.log(`User: ${user.displayName} (@${user.username})`);
    console.log(`FID: ${fid}`);
    console.log("\nFactors:");
    for (const [factor, value] of Object.entries(factors)) {
      console.log(`  ${factor}: ${value ? '✅' : '❌'}`);
    }
    console.log(`\nStatus: ${eligibilityStatus}`);
    
    return eligibilityStatus;
    
  } catch (error) {
    console.error(`Error in airdrop check for FID ${fid}:`, error.message);
    return "Error in processing";
  }
}

// Helper functions (implement these based on previous examples)

// Run tests
const testUsers = [
  3,    // Should qualify
  194,  // Should qualify
  602,  // Should qualify
  10235 // Probably not qualify
];

testUsers.forEach(fid => fullAirdropCheck(fid));
```

## 5. OpenRank Integration Test (NEW)
```javascript
// testOpenRank.js - Integrate OpenRank reputation scores
import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { ethers } from "ethers";

const API_KEY = "YOUR_NEYNAR_API_KEY";
const client = new NeynarAPIClient(API_KEY);

// OpenRank contract on Base (0x2238C8b16C36628B3E3d9bD2204FECA6e6A0A9E9)
const OPENRANK_CONTRACT = "0x2238C8b16C36628B3E3d9bD2204FECA6e6A0A9E9";
const BASE_RPC = "https://mainnet.base.org";

async function getOpenRankScore(fid) {
  try {
    const provider = new ethers.JsonRpcProvider(BASE_RPC);
    const contract = new ethers.Contract(
      OPENRANK_CONTRACT,
      ["function getScore(uint256 fid) view returns (uint256)"],
      provider
    );
    
    const score = await contract.getScore(fid);
    return ethers.formatUnits(score, 18); // Convert from wei
  } catch (error) {
    console.error(`Error fetching OpenRank score for FID ${fid}:`, error.message);
    return null;
  }
}

async function comprehensiveAirdropAnalysis(fid) {
  try {
    console.log(`\n=== COMPREHENSIVE ANALYSIS FOR FID ${fid} ===`);
    
    // Get Farcaster data
    const user = await client.lookupUserByFid(fid);
    const userData = user.result.user;
    
    // Get Neynar quality score
    let neynarScore = null;
    try {
      const qualityResponse = await client.fetchUserQualityScore(fid);
      neynarScore = qualityResponse.result.score;
    } catch (error) {
      console.log('Neynar quality score not available');
    }
    
    // Get OpenRank score
    const openRankScore = await getOpenRankScore(fid);
    
    // Get recent activity
    const casts = await client.fetchUserCasts(fid, { limit: 50 });
    const recentCasts = casts.result?.casts || [];
    
    // Calculate comprehensive metrics
    const metrics = {
      basicProfile: {
        username: userData.username,
        displayName: userData.display_name,
        followers: userData.follower_count,
        following: userData.following_count,
        powerBadge: userData.power_badge,
        verifications: userData.verifications?.length || 0
      },
      qualityScores: {
        neynar: neynarScore,
        openRank: openRankScore,
        composite: null
      },
      activityMetrics: {
        totalCasts: userData.cast_count,
        recentCasts: recentCasts.length,
        accountAge: Math.floor((Date.now() - new Date(userData.object_timestamp).getTime()) / (1000 * 60 * 60 * 24))
      }
    };
    
    // Calculate composite score
    let compositeScore = 0;
    let scoreComponents = 0;
    
    if (neynarScore) {
      compositeScore += neynarScore * 40; // 40% weight
      scoreComponents++;
    }
    
    if (openRankScore && parseFloat(openRankScore) > 0) {
      compositeScore += Math.min(parseFloat(openRankScore) * 100, 30); // 30% weight, capped
      scoreComponents++;
    }
    
    // Power badge bonus
    if (userData.power_badge) compositeScore += 20;
    
    // Account age bonus
    if (metrics.activityMetrics.accountAge >= 365) compositeScore += 10;
    else if (metrics.activityMetrics.accountAge >= 180) compositeScore += 7;
    else if (metrics.activityMetrics.accountAge >= 90) compositeScore += 4;
    
    metrics.qualityScores.composite = compositeScore;
    
    // Display results
    console.log('📊 PROFILE OVERVIEW:');
    console.log(`  Username: @${metrics.basicProfile.username}`);
    console.log(`  Display Name: ${metrics.basicProfile.displayName}`);
    console.log(`  Followers: ${metrics.basicProfile.followers.toLocaleString()}`);
    console.log(`  Power Badge: ${metrics.basicProfile.powerBadge ? '✅' : '❌'}`);
    console.log(`  Verifications: ${metrics.basicProfile.verifications}`);
    
    console.log('\n🔍 QUALITY SCORES:');
    console.log(`  Neynar Score: ${neynarScore ? `${(neynarScore * 100).toFixed(1)}%` : 'N/A'}`);
    console.log(`  OpenRank Score: ${openRankScore ? parseFloat(openRankScore).toFixed(6) : 'N/A'}`);
    console.log(`  Composite Score: ${compositeScore.toFixed(1)}/100`);
    
    console.log('\n📈 ACTIVITY METRICS:');
    console.log(`  Total Casts: ${metrics.activityMetrics.totalCasts.toLocaleString()}`);
    console.log(`  Recent Casts (50): ${metrics.activityMetrics.recentCasts}`);
    console.log(`  Account Age: ${metrics.activityMetrics.accountAge} days`);
    
    // Determine final tier
    let finalTier = 'Minimal';
    if (compositeScore >= 85) finalTier = 'Premium';
    else if (compositeScore >= 70) finalTier = 'High';
    else if (compositeScore >= 50) finalTier = 'Medium';
    else if (compositeScore >= 30) finalTier = 'Low';
    
    console.log(`\n🏆 FINAL AIRDROP TIER: ${finalTier}`);
    console.log(`💰 EXPECTED ALLOCATION: ${getFinalAllocationEstimate(finalTier, compositeScore)}`);
    
    return { fid, metrics, finalTier, compositeScore };
    
  } catch (error) {
    console.error(`Error in comprehensive analysis for FID ${fid}:`, error.message);
    return null;
  }
}

function getFinalAllocationEstimate(tier, score) {
  switch (tier) {
    case 'Premium': return `High (${score >= 90 ? '5-10x' : '3-5x'} base allocation)`;
    case 'High': return `Above Average (2-3x base allocation)`;
    case 'Medium': return `Standard (1-2x base allocation)`;
    case 'Low': return `Below Average (0.5-1x base allocation)`;
    default: return `Minimal (May not qualify)`;
  }
}

// Test comprehensive analysis
const comprehensiveTestFIDs = [3, 194, 602, 1, 2, 10235];
console.log('🚀 Starting Comprehensive Airdrop Analysis...\n');

for (const fid of comprehensiveTestFIDs) {
  await comprehensiveAirdropAnalysis(fid);
  await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
}
```

## Expected Output Examples

### Sample Output for Dan Romero (fid:3)
```
=== AIRDROP ELIGIBILITY REPORT ===
User: Dan Romero (@dwr.eth)
FID: 3

Factors:
  isVerified: ✅
  hasPowerBadge: ✅
  isActive: ✅
  minFollowers: ✅
  minFollowing: ✅
  recentActivity: ✅
  channelParticipation: ✅
  engagementRate: ✅

Status: HIGH ELIGIBILITY - Very likely to qualify for most airdrops
```

### Sample Output for New User (fid:10235)
```
=== AIRDROP ELIGIBILITY REPORT ===
User: New User (@newbie123)
FID: 10235

Factors:
  isVerified: ❌
  hasPowerBadge: ❌
  isActive: ✅
  minFollowers: ❌
  minFollowing: ❌
  recentActivity: ❌
  channelParticipation: ❌
  engagementRate: ❌

Status: LOW ELIGIBILITY - Needs more activity and verification
```

## Testing Recommendations

1. **Test with these real FIDs first**:
   - `3` (Dan Romero - high activity)
   - `194` (Rahul - medium activity)
   - `602` (Varun - active community member)
   - `10235` (New user - low activity)

2. **Verify API responses**:
   - Check profile data completeness
   - Ensure casts are being retrieved correctly
   - Validate engagement metrics

3. **Test edge cases**:
   ```javascript
   // Edge case tests
   fullAirdropCheck(0);      // Invalid FID
   fullAirdropCheck(999999); // Non-existent user
   fullAirdropCheck(2);      // Very early user
   ```

4. **Monitor API limits**:
   - Check your Neynar dashboard for usage
   - Implement error handling for rate limits
   - Cache responses where possible

5. **Validate scoring logic**:
   - Adjust weights based on real-world results
   - Compare your scores with actual airdrop qualifications
   - Test with at least 50 diverse profiles before production

6. **Next Steps for 2025**:
   - ✅ Integrate Neynar User Quality Score (0-1 scale)
   - ✅ Add OpenRank reputation scoring from Base network
   - 🔄 Implement Frame interaction tracking via Pinata FDK
   - 🔄 Add Warpcast channel-specific engagement metrics
   - 🔄 Integrate with Clanker token holder analysis
   - 🔄 Set up real-time monitoring for new Farcaster features
   - 🔄 Add EigenTrust-based sybil resistance scoring

## Updated Integration Priorities (January 2025)

### High Priority:
1. **Neynar Quality Score Integration** - Essential for spam filtering
2. **OpenRank On-chain Scores** - Decentralized reputation layer
3. **Enhanced Power Badge Analysis** - More sophisticated verification
4. **Frame Interaction Metrics** - New engagement vector

### Medium Priority:
1. **Channel-specific Engagement Depth** - Community participation scoring
2. **Clanker Token Holder Analysis** - DeFi participation indicator
3. **Storage Allocation Tracking** - Premium feature usage
4. **Multi-client Activity Analysis** - Cross-platform engagement

### Implementation Notes:
- Use Neynar's experimental headers for latest features
- OpenRank scores update weekly on Base network
- Frame analytics require Pinata FDK integration
- Quality scores range from 0-1, with 0.7+ indicating high-quality users
- Power badge criteria have evolved - check latest Warpcast requirements

Remember to replace `YOUR_NEYNAR_API_KEY` with your actual key, and run these tests in a Node.js environment. Start with individual scripts before combining them into your full application workflow.

## Production Deployment Checklist:
- [ ] Rate limiting implementation (Neynar: 100 req/min free tier)
- [ ] Error handling for API failures
- [ ] Caching strategy for expensive calls
- [ ] Fallback scoring when APIs are unavailable
- [ ] Real-time score updates for active users
- [ ] A/B testing framework for scoring algorithms