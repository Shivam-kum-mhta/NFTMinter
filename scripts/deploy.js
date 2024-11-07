// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  try {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const AINFTMinter = await ethers.getContractFactory("NFTMinter");
    const nftMinter = await AINFTMinter.deploy();
    await nftMinter.waitForDeployment();

    const address = await nftMinter.getAddress();
    console.log("AINFTMinter deployed to:", address);

    // Verify the contract on Etherscan
    if (network.name !== "hardhat" && network.name !== "localhost") {
      console.log("Waiting for block confirmations...");
      await nftMinter.deployTransaction.wait(6);
      
      console.log("Verifying contract...");
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: [],
      });
    }

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();