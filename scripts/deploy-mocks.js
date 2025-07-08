const { ethers } = require("hardhat")

async function main() {
  console.log("🪙 Deploying mock tokens for testing...")

  const [deployer] = await ethers.getSigners()
  const network = await ethers.provider.getNetwork() // Declare the network variable

  // Deploy Mock ERC20 Token factory
  const MockERC20 = await ethers.getContractFactory("MockERC20")

  const tokens = [
    { name: "Wrapped Ether", symbol: "WETH", decimals: 18, supply: "1000000" },
    { name: "Wrapped Bitcoin", symbol: "WBTC", decimals: 8, supply: "21000" },
    { name: "USD Coin", symbol: "USDC", decimals: 6, supply: "1000000000" },
    { name: "Dai Stablecoin", symbol: "DAI", decimals: 18, supply: "1000000000" },
  ]

  const deployedTokens = {}

  for (const token of tokens) {
    console.log(`Deploying ${token.name}...`)

    const mockToken = await MockERC20.deploy(
      token.name,
      token.symbol,
      token.decimals,
      ethers.utils.parseUnits(token.supply, token.decimals),
    )
    await mockToken.deployed()

    deployedTokens[token.symbol] = mockToken.address
    console.log(`✅ ${token.name} deployed to: ${mockToken.address}`)
  }

  // Save mock token addresses
  const fs = require("fs")
  fs.writeFileSync(`deployments/${network.name}-mock-tokens.json`, JSON.stringify(deployedTokens, null, 2))

  console.log(`\n💾 Mock token addresses saved to deployments/${network.name}-mock-tokens.json`)
  console.log("\n🎉 Mock token deployment completed!")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
