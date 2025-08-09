'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle, Database, Star, Clock, Wallet } from 'lucide-react';
import type { FarcasterProfile } from '@/lib/types';
import {
  formatAccountAge,
  getAccountMaturityIndicator,
  truncateAddress,
  formatStorageUsage,
  getStorageStatusIndicator,
  formatQualityScore,
  getQualityScoreStatus,
  formatVerificationCount,
  getVerificationStatus
} from '@/lib/utils/farcaster-display';

interface FarcasterAccountStatusProps {
  profile: FarcasterProfile;
}

export default function FarcasterAccountStatus({ profile }: FarcasterAccountStatusProps) {
  const maturityIndicator = getAccountMaturityIndicator(profile.accountAge);
  const storageStatus = getStorageStatusIndicator(profile.storageUsed, profile.hasStorageAllocation);
  const qualityScoreStatus = getQualityScoreStatus(profile.neynarQualityScore);
  const verificationStatus = getVerificationStatus(profile.verifications);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Account Status & Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Account Age and Maturity */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Account Maturity
          </h4>
          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-bold text-foreground">
                {formatAccountAge(profile.accountAge)}
              </span>
              <Badge 
                variant="outline"
                style={{ 
                  borderColor: maturityIndicator.color,
                  color: maturityIndicator.color,
                  backgroundColor: `${maturityIndicator.color}10`
                }}
              >
                {maturityIndicator.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Account created {profile.accountAge} days ago
            </p>
            <div className="mt-2 w-full bg-muted rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min((profile.accountAge / 365) * 100, 100)}%`,
                  backgroundColor: maturityIndicator.color 
                }}
              />
            </div>
          </div>
        </div>

        {/* Verification Details */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Verification Status
          </h4>
          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg font-bold" style={{ color: verificationStatus.color }}>
                {formatVerificationCount(profile.verifications)}
              </span>
              <Badge 
                variant="outline"
                style={{ 
                  borderColor: verificationStatus.color,
                  color: verificationStatus.color,
                  backgroundColor: `${verificationStatus.color}10`
                }}
              >
                {verificationStatus.label}
              </Badge>
            </div>
            
            {profile.verifications.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground mb-2">Verified addresses:</p>
                {profile.verifications.map((address, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                    <Wallet className="h-3 w-3 text-muted-foreground" />
                    <code className="text-xs font-mono text-foreground">
                      {truncateAddress(address)}
                    </code>
                    <CheckCircle className="h-3 w-3 text-green-500 dark:text-green-400" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No verified addresses. Consider verifying your wallet address to improve eligibility.
              </p>
            )}
          </div>
        </div>

        {/* Storage Allocation */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Database className="h-4 w-4" />
            Storage Allocation
          </h4>
          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-bold text-foreground">
                {formatStorageUsage(profile.storageUsed, profile.hasStorageAllocation)}
              </span>
              <Badge 
                variant="outline"
                style={{ 
                  borderColor: storageStatus.color,
                  color: storageStatus.color,
                  backgroundColor: `${storageStatus.color}10`
                }}
              >
                {storageStatus.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {profile.hasStorageAllocation 
                ? `Using ${profile.storageUsed} storage units`
                : 'No storage allocation available'
              }
            </p>
            {profile.hasStorageAllocation && (
              <div className="mt-2 w-full bg-muted rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${profile.storageUsed > 0 ? Math.min((profile.storageUsed / 10000) * 100, 100) : 0}%`,
                    backgroundColor: storageStatus.color 
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Quality Scores */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Star className="h-4 w-4" />
            Quality Metrics
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Neynar Quality Score */}
            <div className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-foreground">Neynar Score</span>
                <Badge 
                  variant="outline"
                  style={{ 
                    borderColor: qualityScoreStatus.color,
                    color: qualityScoreStatus.color,
                    backgroundColor: `${qualityScoreStatus.color}10`
                  }}
                >
                  {qualityScoreStatus.label}
                </Badge>
              </div>
              <div className="text-2xl font-bold mb-1" style={{ color: qualityScoreStatus.color }}>
                {formatQualityScore(profile.neynarQualityScore)}
                {profile.neynarQualityScore !== null && <span className="text-sm font-normal">/100</span>}
              </div>
              <p className="text-xs text-muted-foreground">
                {profile.neynarQualityScore !== null 
                  ? 'Quality assessment from Neynar'
                  : 'Quality score not available'
                }
              </p>
              {profile.neynarQualityScore !== null && (
                <div className="mt-2 w-full bg-muted rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(profile.neynarQualityScore * 100)}%`,
                      backgroundColor: qualityScoreStatus.color 
                    }}
                  />
                </div>
              )}
            </div>

            {/* OpenRank Score */}
            <div className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-foreground">OpenRank</span>
                <Badge variant="outline" className="text-xs">
                  {profile.openRankScore ? 'Available' : 'N/A'}
                </Badge>
              </div>
              <div className="text-2xl font-bold mb-1 text-purple-600 dark:text-purple-400">
                {profile.openRankScore ? profile.openRankScore.toLocaleString() : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                {profile.openRankScore 
                  ? 'Reputation score from OpenRank'
                  : 'OpenRank score not available'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Active Status and Additional Metrics */}
        <div className="space-y-3">
          <h4 className="font-semibold">Additional Status</h4>
          <div className="grid grid-cols-2 gap-4">
            {/* Active Status */}
            <div className="border border-border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <div 
                  className={`h-2 w-2 rounded-full ${profile.isActive ? 'bg-green-500 dark:bg-green-400' : 'bg-muted-foreground'}`}
                ></div>
                <span className="font-medium text-sm text-foreground">Account Status</span>
              </div>
              <div className={`text-lg font-bold ${profile.isActive ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                {profile.isActive ? 'Active' : 'Inactive'}
              </div>
            </div>

            {/* Frame Interactions */}
            <div className="border border-border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm text-foreground">Frame Interactions</span>
              </div>
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {profile.frameInteractions || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Summary Status */}
        <div className="bg-muted rounded-lg p-4">
          <h5 className="font-medium mb-2 text-foreground">Account Summary</h5>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Verified Address:</span>
              <span className="ml-2 font-semibold text-foreground">
                {profile.isVerifiedAddress ? 'Yes' : 'No'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Quality Tier:</span>
              <span className="ml-2 font-semibold capitalize text-foreground">
                {profile.qualityTier}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}