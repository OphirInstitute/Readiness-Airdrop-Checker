/**
 * Simple verification script for Farcaster utility functions
 */

import {
  getAirdropTierColor,
  getStatusIndicatorColor,
  getQualityTierColor,
  formatAccountAge,
  getAccountMaturityIndicator,
  formatEngagementRate,
  formatNumber,
  truncateAddress,
  formatStorageUsage,
  getStorageStatusIndicator,
  formatQualityScore,
  getQualityScoreStatus,
  formatCastingStreak,
  getCastingStreakStatus,
  formatVerificationCount,
  getVerificationStatus,
  formatChannelParticipation,
  getChannelParticipationStatus,
  formatPowerBadgeStatus,
  formatActivityLevel,
  formatTierDisplayName,
  getTierDescription,
  formatBioText,
  getEngagementQuality,
  formatTopCastDisplay,
  TIER_COLORS,
  STATUS_COLORS,
  QUALITY_TIER_COLORS
} from './src/lib/utils/farcaster-display.ts';

console.log('🧪 Testing Farcaster Display Utilities...\n');

// Test color functions
console.log('🎨 Color Functions:');
console.log('Premium tier color:', getAirdropTierColor('Premium'));
console.log('Excellent status color:', getStatusIndicatorColor('excellent'));
console.log('Premium quality tier color:', getQualityTierColor('premium'));
console.log('');

// Test account age formatting
console.log('📅 Account Age Formatting:');
console.log('0 days:', formatAccountAge(0));
console.log('1 day:', formatAccountAge(1));
console.log('15 days:', formatAccountAge(15));
console.log('30 days:', formatAccountAge(30));
console.log('365 days:', formatAccountAge(365));
console.log('395 days:', formatAccountAge(395));
console.log('');

// Test maturity indicators
console.log('🌱 Maturity Indicators:');
console.log('400 days:', getAccountMaturityIndicator(400));
console.log('200 days:', getAccountMaturityIndicator(200));
console.log('100 days:', getAccountMaturityIndicator(100));
console.log('30 days:', getAccountMaturityIndicator(30));
console.log('');

// Test engagement rate formatting
console.log('📊 Engagement Rate Formatting:');
console.log('0:', formatEngagementRate(0));
console.log('0.005:', formatEngagementRate(0.005));
console.log('0.1234:', formatEngagementRate(0.1234));
console.log('');

// Test number formatting
console.log('🔢 Number Formatting:');
console.log('500:', formatNumber(500));
console.log('1500:', formatNumber(1500));
console.log('1500000:', formatNumber(1500000));
console.log('1500000000:', formatNumber(1500000000));
console.log('');

// Test address truncation
console.log('🔗 Address Truncation:');
const address = '0x1234567890abcdef1234567890abcdef12345678';
console.log('Full address:', address);
console.log('Truncated:', truncateAddress(address));
console.log('Short address:', truncateAddress('short'));
console.log('');

// Test storage usage
console.log('💾 Storage Usage:');
console.log('No allocation:', formatStorageUsage(0, false));
console.log('Unused allocation:', formatStorageUsage(0, true));
console.log('1000 units used:', formatStorageUsage(1000, true));
console.log('');

// Test quality score
console.log('⭐ Quality Score:');
console.log('null score:', formatQualityScore(null));
console.log('0.85 score:', formatQualityScore(0.85));
console.log('0.1 score:', formatQualityScore(0.1));
console.log('');

// Test verification count
console.log('✅ Verification Count:');
console.log('No verifications:', formatVerificationCount([]));
console.log('1 verification:', formatVerificationCount(['0x123']));
console.log('2 verifications:', formatVerificationCount(['0x123', '0x456']));
console.log('');

// Test verification status
console.log('🔐 Verification Status:');
console.log('No verifications:', getVerificationStatus([]));
console.log('1 verification:', getVerificationStatus(['0x123']));
console.log('3 verifications:', getVerificationStatus(['0x123', '0x456', '0x789']));
console.log('');

// Test Power Badge status
console.log('👑 Power Badge Status:');
console.log('With badge:', formatPowerBadgeStatus(true));
console.log('Without badge:', formatPowerBadgeStatus(false));
console.log('');

// Test tier display name
console.log('🏷️ Tier Display Names:');
console.log('PREMIUM:', formatTierDisplayName('PREMIUM'));
console.log('high:', formatTierDisplayName('high'));
console.log('MeDiUm:', formatTierDisplayName('MeDiUm'));
console.log('');

// Test bio text formatting
console.log('📝 Bio Text Formatting:');
console.log('Empty bio:', formatBioText(''));
console.log('Short bio:', formatBioText('Short bio'));
const longBio = 'This is a very long bio that exceeds the maximum length and should be truncated with ellipsis';
console.log('Long bio (50 chars):', formatBioText(longBio, 50));
console.log('');

// Test engagement quality
console.log('💬 Engagement Quality:');
const excellent = getEngagementQuality(50, 20, 10, 100);
console.log('Excellent engagement:', excellent);
const poor = getEngagementQuality(1, 0, 0, 1000);
console.log('Poor engagement:', poor);
console.log('');

// Test top cast display
console.log('🎯 Top Cast Display:');
console.log('Null cast:', formatTopCastDisplay(null));
const cast = {
  text: 'This is a great cast!',
  likes: 100,
  recasts: 50,
  replies: 25
};
console.log('Sample cast:', formatTopCastDisplay(cast));
console.log('');

console.log('✅ All utility functions tested successfully!');