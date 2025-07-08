# NebulaLend Smart Contracts

NebulaLend is a decentralized lending protocol with integrated Chainlink price feeds and VRF (Verifiable Random Function) for secure and fair DeFi operations.

## Features

### 🏦 Core Lending Protocol
- **Deposit & Earn**: Deposit assets to earn competitive yields
- **Borrow Against Collateral**: Borrow assets using your deposits as collateral
- **Dynamic Interest Rates**: Market-driven interest rates based on utilization
- **Health Factor Monitoring**: Real-time liquidation risk assessment

### 🔗 Chainlink Integration
- **Price Feeds**: Real-time, tamper-proof price data from Chainlink oracles
- **VRF (Verifiable Random Function)**: Cryptographically secure randomness for fair liquidation lotteries
- **Automated Liquidations**: Chainlink-powered liquidation system

### 🔄 Automated Market Maker (AMM)
- **Liquidity Pools**: Create and manage liquidity pools for token swaps
- **LP Tokens**: Earn fees by providing liquidity
- **Price Impact Protection**: Chainlink price feed integration for fair swaps

### 🎲 Liquidation Lottery
- **Fair Distribution**: VRF-powered random selection for liquidation rewards
- **Community Incentives**: Reward users for maintaining protocol health

## Smart Contracts

### Core Contracts
- **NebulaLendCore.sol**: Main lending protocol with Chainlink integration
- **NebulaLendToken.sol**: Protocol governance token (NLT)
- **NebulaLendAMM.sol**: Automated market maker with price feed integration
- **NebulaLendLPToken.sol**: Liquidity provider token template

### Mock Contracts (Testing)
- **MockERC20.sol**: Mock ERC20 tokens for testing

## Deployment

### Prerequisites
1. Node.js v16+ and npm
2. Hardhat development environment
3. Ethereum wallet with ETH for gas fees
4. Chainlink VRF subscription (for mainnet/testnet)

### Installation
\`\`\`bash
npm install
\`\`\`

### Environment Setup
1. Copy `.env.example` to `.env`
2. Fill in your private key, API keys, and Chainlink subscription ID

### Local Development
\`\`\`bash
# Start local Hardhat node
npm run node

# Deploy to local network
npm run deploy:localhost

# Deploy mock tokens (for testing)
npm run deploy-mocks
\`\`\`

### Testnet Deployment
\`\`\`bash
# Deploy to Sepolia testnet
npm run deploy:sepolia

# Setup Chainlink integration
npm run setup-chainlink
\`\`\`

### Mainnet Deployment
\`\`\`bash
# Deploy to Ethereum mainnet
npm run deploy:mainnet
\`\`\`

## Chainlink Integration Setup

### 1. VRF Subscription
1. Visit [vrf.chain.link](https://vrf.chain.link/)
2. Create a new subscription
3. Fund it with LINK tokens
4. Add your deployed contract as a consumer

### 2. Price Feeds
The protocol uses the following Chainlink price feeds:
- ETH/USD: `0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419`
- BTC/USD: `0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c`
- USDC/USD: `0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6`
- DAI/USD: `0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9`

## Usage Examples

###
