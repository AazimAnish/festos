import { network } from "hardhat";

async function main() {
  console.log("🚀 Deploying EventFactory contract...");

  try {
    const { viem } = await network.connect();
    
    // Deploy the contract
    console.log("📦 Deploying contract...");
    const eventFactory = await viem.deployContract("EventFactory");
    
    const address = eventFactory.address;
    console.log("✅ EventFactory deployed successfully!");
    console.log("📍 Contract address:", address);
    
    // Get deployment info
    console.log("🔗 Contract deployed to:", address);
    
    // Verify contract on block explorer (optional)
    console.log("\n🔍 To verify on block explorer, run:");
    console.log(`npx hardhat verify --network ${process.env.HARDHAT_NETWORK || 'localhost'} ${address}`);
    
    // Save deployment info
    const deploymentInfo = {
      contract: "EventFactory",
      address: address,
      network: process.env.HARDHAT_NETWORK || 'localhost',
      deployedAt: new Date().toISOString(),
    };
    
    console.log("\n📋 Deployment Summary:");
    console.log(JSON.stringify(deploymentInfo, null, 2));
    
    // Save to file for reference
    const fs = await import('fs');
    const deploymentsDir = './deployments';
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    
    const deploymentFile = `${deploymentsDir}/event-factory-${process.env.HARDHAT_NETWORK || 'localhost'}.json`;
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log(`💾 Deployment info saved to: ${deploymentFile}`);
    
    return address;
    
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

// Run deployment
main()
  .then((address) => {
    console.log("\n🎉 Deployment completed successfully!");
    console.log("Contract address:", address);
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Deployment failed:", error);
    process.exit(1);
  });
