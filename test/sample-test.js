// writing test for our smart contract to check bugs(if exists) and all
const { expect } = require("chai"); // Chai is a BDD / TDD assertion library, it's basically for testing, expect is a type of style that comes in chai for BDD testing.
const { ethers } = require("hardhat");


// describe statement is creating a group of test cases, we describe only a one contract and can have multiple describe statements.
describe("NFTMarket", function () { 
  //                                                           async function because have to wait for the result
  it("Should be able to create Items and perform market sales", async function () { // "it" is a test case, it is a test case for one contract.
    const Market = await ethers.getContractFactory("NFTMarket"); // get the contract factory for NFTMarket
    const market = await Market.deploy(); // deploy the contract
    await market.deployed(); // check if the contract is deployed
    const marketAddress = market.address // get the market address of the contract, will be needed in NFT.sol contract in constructor

    const NFT = await ethers.getContractFactory("NFT"); // get the contract factory for NFT
    const nft = await NFT.deploy(marketAddress); // deploy the contract and passing the address of the market contract to the constructor
    await nft.deployed(); // check if the contract is deployed
    const nftContractAddress = nft.address // nft contract address

    let listingPrice = await market.getListingPrice(); // get the listing price from the contract
    listingPrice = listingPrice.toString(); // convert the listing price to string, so we can interact with it

    const auctionPrice = ethers.utils.parseUnits("100", "ether"); // create the price which nft will be used to auction for.

    await nft.createToken("https://www.mymytokenlocloc.com") // create the token
    await nft.createToken("https://www.mymytokenlocloc2.com")

    await market.createMarketItem(nftContractAddress, 1, auctionPrice, { value: listingPrice }); // create the market item, token Id is incrementing through counter, so first one will be one , second item we will create will have token id of 2, passing the value of listingprice so we can check require statement.
    await market.createMarketItem(nftContractAddress, 2, auctionPrice, { value: listingPrice }); // creating market id of token id 2

    const [_, buyerAddress] = await ethers.getSigners(); // inshort, ether library gives us a way to get accounts addresss using getSigners function, we will use the first account which is _ as a seller or we can say as a contract address, second one we have to write it as a buyer .

    await market.connect(buyerAddress).createMarketSale(nftContractAddress, 1, { value: auctionPrice }); // create the market sale, passing the value of auction price so we can check require statement, using buyeraddress to connect to the market and passing parameters

    let items = await market.fetchMarketItems() // fetch the items from the market.

    items = await Promise.all(items.map(async i => { // map the items to get the token id, token id is the first element of the array), Promise.all will allow us to do async mapping of items.
      const tokenUri = await nft.tokenURI(i.tokenId) // get the token uri from the nft contract
      let item = { // create the item object
        price: i.price.toString(), // will get wei, a very big number
        tokenId: i.tokenId.toString(),
        seller: i.seller,
        owner: i.owner, // is any empty address, so it's all 0x000... address
        tokenUri // which we defined
      }
      return item // return the item object, that we created above
    }));

    console.log('items: ', items) // print the items
  });
});