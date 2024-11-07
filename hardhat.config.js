require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {},
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/85de5f615aa44e5a9381fca701ae43b1`,
      accounts: [`1ee3c774ec7e62bfeb71d867fc205fa80d8ba363dc56804932ce71c7516ee9dd`]
    }
  }
}