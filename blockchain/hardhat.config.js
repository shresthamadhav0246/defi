require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

//0x944D0F1022186B812E3CD412F92760619147Bd26

const SEPOLIA_RCP_KEY =
  process.env.SEPOLIA_RCP_KEY ||
  "https://eth-sepolia.g.alchemy.com/v2/4y-hi0ixXTpaCNP2AhBKIXFCsUJEx04p";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: SEPOLIA_RCP_KEY,
      accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
      chainId: 11155111,
    },
  },
};
