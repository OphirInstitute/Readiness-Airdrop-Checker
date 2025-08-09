# Production Setup Guide

This guide will help you set up the Airdrop Eligibility Checker with real data sources for production use.

## ✅ Already Working (No API Key Required)

### Kaito Yaps Integration
- **Status**: ✅ Fully functional
- **API**: `https://api.kaito.ai/api/v1/yaps`
- **Test users**: `defi_monk`, `shaaa256`
- **Features**: Yap scores, weekly activity, engagement metrics

### Basic Blockchain Analysis
- **Status**: ✅ Working with Coinbase Developer RPC
- **RPC**: Already configured with your Coinbase Developer endpoint
- **Features**: Transaction counts, balances, basic activity analysis

## Optional API Keys (For Enhanced Features)

### 1. Basescan API Key (For detailed transaction history)
- **Purpose**: Get exact first transaction dates and contract interactions
- **Current**: Using estimated dates based on transaction count
- **Setup**: 
  - Go to [https://basescan.org/register](https://basescan.org/register)
  - Create a free account
  - Go to "API Keys" section and create a new key
  - Add to `.env`: `BASESCAN_API_KEY="your-key-here"`

### 2. Neynar API Key (For Farcaster integration)
- **Purpose**: Analyze Farcaster profiles and social engagement
- **Current**: Returns placeholder recommendations
- **Setup**:
  - Go to [https://neynar.com](https://neynar.com)
  - Sign up for a developer account
  - Create a new app and get your API key
  - Add to `.env`: `NEYNAR_API_KEY="your-key-here"`

## Optional Enhancements

### Enhanced RPC Endpoints
For better reliability and rate limits:

**Alchemy (Recommended)**
- Go to [https://alchemy.com](https://alchemy.com)
- Create account and get API key
- Add to `.env.local`: `ALCHEMY_API_KEY="your-key-here"`
- Update `ETHEREUM_RPC_URL="https://eth-mainnet.g.alchemy.com/v2/your-key-here"`

**Infura**
- Go to [https://infura.io](https://infura.io)
- Create account and get API key
- Add to `.env.local`: `INFURA_API_KEY="your-key-here"`

## Setup Steps

1. **Clone and install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys
   ```

3. **Test the setup**
   ```bash
   npm run dev
   ```

4. **Verify functionality**
   - Test with a real Ethereum address
   - Test with a Farcaster username
   - Check browser console for any API errors

## API Key Setup Instructions

### Basescan API
1. Visit [basescan.org/apis](https://basescan.org/apis)
2. Click "Create Account" or "Login"
3. Go to "API Keys" section
4. Click "Add" to create a new API key
5. Copy the key to your `.env.local` file

### Neynar API (Farcaster)
1. Visit [neynar.com](https://neynar.com)
2. Sign up for a developer account
3. Create a new application
4. Copy the API key from your dashboard
5. Add to your `.env.local` file

## Testing Real Data

### Blockchain Analysis
- Works with any Ethereum address
- Example: `0x742d35Cc6634C0532925a3b8D4C9db96590e4CAF`
- Provides: transaction count, volume, contract interactions, airdrop eligibility

### Farcaster Analysis
- Works with Farcaster usernames or connected addresses
- Example: `@dwr.eth` or `dwr.eth`
- Provides: profile data, follower count, cast count, engagement metrics

### Kaito Analysis
- Works with Twitter usernames that are on Kaito leaderboard
- Example: `@jhunsaker`
- Provides: Yap score, weekly activity, leaderboard ranking

## Production Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Environment Variables for Production
```bash
# Required
BASESCAN_API_KEY="your-production-key"
NEYNAR_API_KEY="your-production-key"

# Recommended
ALCHEMY_API_KEY="your-production-key"
BASE_RPC_URL="https://mainnet.base.org"
ETHEREUM_RPC_URL="https://eth-mainnet.g.alchemy.com/v2/your-key"

# Optional monitoring
SENTRY_DSN="your-sentry-dsn"
NEXT_PUBLIC_SENTRY_DSN="your-public-sentry-dsn"
```

## Rate Limits and Costs

### Free Tier Limits
- **Basescan**: 5 calls/second, 100,000 calls/day
- **Neynar**: 1,000 requests/day (free tier)
- **Public RPCs**: Variable limits

### Optimization Tips
1. Implement caching for repeated requests
2. Use Redis for session storage
3. Add request debouncing on frontend
4. Consider upgrading to paid tiers for production

## Troubleshooting

### Common Issues

**"Service configuration error"**
- Check that API keys are correctly set in `.env.local`
- Verify API keys are valid and not expired

**"Rate limit exceeded"**
- Wait a few minutes before retrying
- Consider upgrading to paid API tiers
- Implement request caching

**"Network error"**
- Check internet connection
- Verify RPC endpoints are accessible
- Try alternative RPC providers

### Debug Mode
Add to `.env.local` for detailed logging:
```bash
NODE_ENV="development"
DEBUG="true"
```

## Support

For issues with:
- **Basescan API**: [basescan.org/contactus](https://basescan.org/contactus)
- **Neynar API**: [docs.neynar.com](https://docs.neynar.com)
- **This application**: Check GitHub issues or create a new one

## Security Notes

- Never commit API keys to version control
- Use environment variables for all sensitive data
- Rotate API keys regularly
- Monitor API usage for unusual activity
- Use HTTPS in production