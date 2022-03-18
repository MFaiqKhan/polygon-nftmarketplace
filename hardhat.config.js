require("@nomiclabs/hardhat-waffle"); // Waffle is a tool that helps you test your code on the latest version of the Ethereum client.
require('dotenv').config();

const PRIVATE_KEY = process.env.PRIVATE_KEY


// This is a sample hardhat configuration file.
module.exports = {
  networks: {
    hardhat: {
      chainId: 1337, // Chain ID for the hardhat development network is 1337. You can find the chain ID of any network in the network configuration file.
    },
    // not really want to define accounts when working on a local test network because hardhat will automatically figure it out from 20 accounts which hardhat gave
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com", //testnet
      accounts: [PRIVATE_KEY], // account(s) private key from which we are deploying our contracts
    },
    //have to define accounts in mainnet as it requires real payment
    mainnet: {
      url: "https://polygon-rpc.com", //mainnet
      accounts: [PRIVATE_KEY], 
    },
  },
  solidity: "0.8.4",
};

//use infura for rpc endpoints for polygon network because public nodes are so slow and sometimes unavailable
//I will be using public endpoints because I dont have money to pay for private endpoints like infura etc.

// explain chainId ?
// ChainID is an additional way to tell chains apart , was introduced in EIP-155 to prevent replay attacks between the main ETH and ETC chains
//https://ethereum.stackexchange.com/questions/26/what-is-a-replay-attack
