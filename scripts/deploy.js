const { ethers } = require("hardhat")
const { verify } = require("../utils/verify")
const { network } = require("hardhat") // Import network variable

// Chainlink contract addresses for Ethereum Mainnet
const CHAINLINK_ADDRESSES = {
  VRF_COORDINATOR: "0x271682DEB8C4E0901D1a1550aD2e64D568E69909",
  LINK_TOKEN: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
  KEY_HASH: "0x8af398995b04c28e9951adb9721ef74c74f93e6a478f39e7e0777be13527e7ef",

  // Price feeds
  ETH_USD: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
  BTC_USD: "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c",
  USDC_USD: "0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6",
  DAI_USD: "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9",
  LINK_USD: "0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c",
}

// Mock token addresses (for testnet deployment)
const MOCK_TOKENS = {
  WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  WBTC: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
  USDC: "0xA0b86a33E6417c4c4c4c4c4c4c4c4c4c4c4c4c4c",
  DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
}

async function main() {
  console.log("🚀 Starting NebulaLend deployment...")

  const [deployer] = await ethers.getSigners()
  console.log("Deploying contracts with account:", deployer.address)
  console.log("Account balance:", (await deployer.getBalance()).toString())

  // Deploy NebulaLend Token
  console.log("\n📄 Deploying NebulaLend Token...")
  const NebulaLendToken = await ethers.getContractFactory("NebulaLendToken")
  const nebulaLendToken = await NebulaLendToken.deploy(deployer.address)
  await nebulaLendToken.deployed()
  console.log("✅ NebulaLend Token deployed to:", nebulaLendToken.address)

  // Deploy Core Protocol
  console.log("\n🏦 Deploying NebulaLend Core...")
  const NebulaLendCore = await ethers.getContractFactory("NebulaLendCore")
  const nebulaLendCore = await NebulaLendCore.deploy(
    CHAINLINK_ADDRESSES.VRF_COORDINATOR,
    1, // Subscription ID (you'll need to create this on Chainlink)
    CHAINLINK_ADDRESSES.KEY_HASH,
    500000, // Callback gas limit
    deployer.address, // Fee recipient
  )
  await nebulaLendCore.deployed()
  console.log("✅ NebulaLend Core deployed to:", nebulaLendCore.address)

  // Deploy AMM
  console.log("\n🔄 Deploying NebulaLend AMM...")
  const NebulaLendAMM = await ethers.getContractFactory("NebulaLendAMM")
  const nebulaLendAMM = await NebulaLendAMM.deploy()
  await nebulaLendAMM.deployed()
  console.log("✅ NebulaLend AMM deployed to:", nebulaLendAMM.address)

  // Add supported tokens to core protocol
  console.log("\n🪙 Adding supported tokens...")

  const tokens = [
    {
      name: "WETH",
      address: MOCK_TOKENS.WETH,
      priceFeed: CHAINLINK_ADDRESSES.ETH_USD,
      ltv: 75,
      liquidationThreshold: 80,
      borrowRate: 500, // 5%
      supplyRate: 300, // 3%
    },
    {
      name: "WBTC",
      address: MOCK_TOKENS.WBTC,
      priceFeed: CHAINLINK_ADDRESSES.BTC_USD,
      ltv: 70,
      liquidationThreshold: 75,
      borrowRate: 450,
      supplyRate: 250,
    },
    {
      name: "USDC",
      address: MOCK_TOKENS.USDC,
      priceFeed: CHAINLINK_ADDRESSES.USDC_USD,
      ltv: 85,
      liquidationThreshold: 90,
      borrowRate: 800,
      supplyRate: 600,
    },
    {
      name: "DAI",
      address: MOCK_TOKENS.DAI,
      priceFeed: CHAINLINK_ADDRESSES.DAI_USD,
      ltv: 85,
      liquidationThreshold: 90,
      borrowRate: 750,
      supplyRate: 550,
    },
  ]

  for (const token of tokens) {
    console.log(`Adding ${token.name}...`)
    await nebulaLendCore.addToken(
      token.address,
      token.priceFeed,
      token.ltv,
      token.liquidationThreshold,
      token.borrowRate,
      token.supplyRate,
    )
    console.log(`✅ ${token.name} added successfully`)
  }

  // Create AMM pools
  console.log("\n🏊 Creating AMM pools...")

  const pools = [
    {
      name: "ETH/USDC",
      token0: MOCK_TOKENS.WETH,
      token1: MOCK_TOKENS.USDC,
      priceFeed0: CHAINLINK_ADDRESSES.ETH_USD,
      priceFeed1: CHAINLINK_ADDRESSES.USDC_USD,
      fee: 30, // 0.3%
    },
    {
      name: "WBTC/DAI",
      token0: MOCK_TOKENS.WBTC,
      token1: MOCK_TOKENS.DAI,
      priceFeed0: CHAINLINK_ADDRESSES.BTC_USD,
      priceFeed1: CHAINLINK_ADDRESSES.DAI_USD,
      fee: 30,
    },
    {
      name: "USDC/DAI",
      token0: MOCK_TOKENS.USDC,
      token1: MOCK_TOKENS.DAI,
      priceFeed0: CHAINLINK_ADDRESSES.USDC_USD,
      priceFeed1: CHAINLINK_ADDRESSES.DAI_USD,
      fee: 5, // 0.05% for stablecoin pair
    },
  ]

  for (const pool of pools) {
    console.log(`Creating ${pool.name} pool...`)
    await nebulaLendAMM.createPool(pool.token0, pool.token1, pool.priceFeed0, pool.priceFeed1, pool.fee)
    console.log(`✅ ${pool.name} pool created successfully`)
  }

  // Set up token minting permissions
  console.log("\n🔑 Setting up permissions...")
  await nebulaLendToken.addMinter(nebulaLendCore.address)
  console.log("✅ Core contract added as token minter")

  // Display deployment summary
  console.log("\n📋 DEPLOYMENT SUMMARY")
  console.log("====================")
  console.log("NebulaLend Token:", nebulaLendToken.address)
  console.log("NebulaLend Core:", nebulaLendCore.address)
  console.log("NebulaLend AMM:", nebulaLendAMM.address)
  console.log("Deployer:", deployer.address)

  // Save deployment addresses
  const deploymentInfo = {
    network: network.name,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      NebulaLendToken: nebulaLendToken.address,
      NebulaLendCore: nebulaLendCore.address,
      NebulaLendAMM: nebulaLendAMM.address,
    },
    chainlinkAddresses: CHAINLINK_ADDRESSES,
    supportedTokens: tokens,
    ammPools: pools,
  }

  const fs = require("fs")
  fs.writeFileSync(`deployments/${network.name}-deployment.json`, JSON.stringify(deploymentInfo, null, 2))

  console.log(`\n💾 Deployment info saved to deployments/${network.name}-deployment.json`)

  // Verify contracts on Etherscan (if not local network)
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("\n🔍 Verifying contracts on Etherscan...")

    try {
      await verify(nebulaLendToken.address, [deployer.address])
      await verify(nebulaLendCore.address, [
        CHAINLINK_ADDRESSES.VRF_COORDINATOR,
        1,
        CHAINLINK_ADDRESSES.KEY_HASH,
        500000,
        deployer.address,
      ])
      await verify(nebulaLendAMM.address, [])
      console.log("✅ All contracts verified successfully")
    } catch (error) {
      console.log("❌ Verification failed:", error.message)
    }
  }

  console.log("\n🎉 NebulaLend deployment completed successfully!")
  console.log("\n📝 Next steps:")
  console.log("1. Create Chainlink VRF subscription and fund it with LINK")
  console.log("2. Add the Core contract as a VRF consumer")
  console.log("3. Deploy mock ERC20 tokens for testing (if needed)")
  console.log("4. Add initial liquidity to AMM pools")
  console.log("5. Update frontend with new contract addresses")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
