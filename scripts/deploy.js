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
