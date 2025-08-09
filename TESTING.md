# Testing the Airdrop Eligibility Checker

## Production Setup Required

⚠️ **This application now uses REAL data sources and requires API keys to function properly.**

## Quick Start

### 1. Get Required API Keys
- **Basescan API**: Get free key at [basescan.org/apis](https://basescan.org/apis)
- **Neynar API**: Get key at [neynar.com](https://neynar.com) for Farcaster data

### 2. Configure Environment
```bash
cp .env.example .env.local
# Edit .env.local with your API keys
```

### 3. Start Development Server
```bash
npm install
npm run dev
```

## Testing Real Data

### ✅ Blockchain Analysis (Real Data)
Test with any Ethereum address:
- `0x742d35Cc6634C0532925a3b8D4C9db96590e4CAF`
- `0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045` (Vitalik)

**Provides:**
- Real transaction count from Base chain
- Actual contract interactions
- Bridge activity detection
- Airdrop eligibility based on real activity

### ✅ Farcaster Analysis (Real Data)
Test with Farcaster usernames:
- `@dwr.eth` (Dan Romero)
- `@vitalik.eth` (Vitalik Buterin)
- `@jhunsaker` (From Kaito leaderboard)

**Provides:**
- Real profile data from Farcaster
- Actual follower/following counts
- Cast count and engagement metrics
- Verification status

### ✅ Kaito Analysis (Real Data)
Test with Twitter usernames on Kaito:
- `@jhunsaker`
- Any username from [yaps.kaito.ai](https://yaps.kaito.ai) leaderboard

**Provides:**
- Real Yap scores from Kaito
- Leaderboard rankings
- Weekly activity metrics
- Engagement scores

## API Testing

### Test API Directly
```bash
# Get API info
curl http://localhost:3000/api/analyze

# Analyze real address
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"address":"0x742d35Cc6634C0532925a3b8D4C9db96590e4CAF"}'

# Analyze Farcaster user
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"address":"@dwr.eth"}'
```

## Features Now Working

### 🔥 Real Blockchain Data
- Live transaction counts from Base chain
- Real contract interaction analysis
- Bridge activity detection (Orbiter, Hop)
- Actual airdrop eligibility calculation

### 🔥 Real Social Data
- Live Farcaster profiles via Neynar API
- Real follower counts and cast metrics
- Actual verification status
- Kaito Yap scores from live leaderboard

### 🔥 Intelligent Analysis
- Multi-source data aggregation
- Weighted scoring algorithm
- Personalized recommendations
- Risk factor identification

## Error Handling

The app gracefully handles:
- Missing API keys (shows configuration error)
- Rate limiting (shows retry message)
- Network failures (shows network error)
- Invalid addresses/usernames
- Partial data availability

## Performance Features

- Parallel API calls for faster analysis
- Graceful degradation when services fail
- Comprehensive error reporting
- Service status tracking

## Production Deployment

See [SETUP.md](./SETUP.md) for complete production deployment guide including:
- API key setup instructions
- Vercel deployment steps
- Environment variable configuration
- Rate limiting and optimization tips

## Troubleshooting

### "Service configuration error"
- Add required API keys to `.env.local`
- Verify keys are valid and active

### "Rate limit exceeded"
- Wait a few minutes before retrying
- Consider upgrading to paid API tiers

### "Network error"
- Check internet connection
- Verify API endpoints are accessible

## Real vs Mock Data

✅ **Now Using Real Data:**
- Blockchain transactions (via Basescan + viem)
- Farcaster profiles (via Neynar API)
- Kaito engagement (via Yaps API)

❌ **No More Mock Data:**
- All mock/fake data has been removed
- Results are now based on actual user activity
- Scores reflect real airdrop eligibility