// deploying to local node

const hre = require("hardhat");

async function main() {
  // deploying NFTMarket contract

  const NFTMarket = await hre.ethers.getContractFactory("NFTMarket"); // getting the contract factory
  const nftMarket = await NFTMarket.deploy();
  await nftMarket.deployed();
  console.log("nftMarket deployed to:", nftMarket.address); // printing the address of the deployed contract

  // deploying NFT contract
  const NFT = await hre.ethers.getContractFactory("NFT"); // getting the contract factory
  const nft = await NFT.deploy(nftMarket.address); // deploying the contract with the address of the market contract
  await nft.deployed();
  console.log("nft deployed to:", nft.address); // printing the address of the deployed contract

}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


  // TO TEST IT OUT LOCALLY 

  // to deploy the contract on local node :
  // run npx hardhat node (on a single terminal)
  // then: npx hardhat run scripts/deploy.js --network localhost (on another terminal)

  // AFTER THAT SET nftMarketaddress and nftaddress to config.js (don't close the localhost node)



  // To Deploy it on Mainnet and Testnet

// Network Name: Mumbai TestNet
// New RPC URL: https://rpc-mumbai.maticvigil.com
// Chain ID: 80001
// Currency Symbol: Matic

// Save this, then you should be able to switch to and use the new network!

//request some matic from testnet faucet to the address

// paste this in hardhat.config.js
// mumbai: {
//   url: "https://rpc-mumbai.maticvigil.com",
//   accounts: [process.env.privateKey]
// }

// To deploy to Matic, run the following command:
// npx hardhat run scripts/deploy.js --network mumbai

