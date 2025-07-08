const { ethers, network } = require("hardhat")

async function main() {
  console.log("🔗 Setting up Chainlink integration...")

  const [deployer] = await ethers.getSigners()

  // Load deployment addresses
  const deploymentInfo = require(`../deployments/${network.name}-deployment.json`)

  const nebulaLendCore = await ethers.getContractAt("NebulaLendCore", deploymentInfo.contracts.NebulaLendCore)

  console.log("\n📊 Testing price feeds...")

  const supportedTokens = await nebulaLendCore.getSupportedTokens()

  for (const tokenAddress of supportedTokens) {
    try {
      const price = await nebulaLendCore.getLatestPrice(tokenAddress)
      const tokenInfo = await nebulaLendCore.tokenInfo(tokenAddress)
      console.log(`✅ ${tokenAddress}: $${ethers.utils.formatUnits(price, 8)}`)
    } catch (error) {
      console.log(`❌ Failed to get price for ${tokenAddress}:`, error.message)
    }
  }

  console.log("\n🎲 Testing VRF setup...")

  try {
    // This would require a funded VRF subscription
    console.log("⚠️  VRF testing requires a funded Chainlink subscription")
    console.log("Please visit https://vrf.chain.link/ to create and fund a subscription")
  } catch (error) {
    console.log("❌ VRF test failed:", error.message)
  }

  console.log("\n✅ Chainlink setup verification completed!")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
