// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol"; // security mechanism , that will prevent reentrancy by giving us nonReentrant modifier

contract NFTMarket is ReentrancyGuard { // Inherting from ReentrancyGaurd
    using Counters for Counters.Counter; 
    Counters.Counter private _itemIds;
    Counters.Counter private _itemsSold; 

    address payable owner; // variable of the owner of the contract, so the owner will be getting the commission of every item sold
    uint256 listingPrice = 0.025 ether; // we are deploying to matic , so ether here actually doesn't means ether , it means matic ether, means if the item is sold for 1 matic then it would be 0.025 matic given to market contract owner
//                            //API is the same so we can say that ether is matic which also has 18 decimal points
    constructor() {
        owner = payable(msg.sender); // owner of the address is the person deploying it, that it will be contract address
    }

    struct MarketItem {  // struct is a data type that can be used to store multiple values in one variable
        uint itemId;
        address nftContract;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    // creating mapping for struct MarketItem
    mapping (uint256 => MarketItem) private idToMarketItem; // uint256 is for itemid so we can keep data of all the listed items in our market as their unique market id given in struct marketitem

    // event for when market item was created, 
    // is matching the marketitem struct we created 
    // everytime someone creates a newitem in the market it will emit this event
    // indexed keyword can search for the specific type of variable lets say, a address have created 5 marketItems so if we have indexed keyword in our contract we can search for that how many items have been created by a single address and we can get that address through web3.js or any other library we can get to interact with out contract on blochchain from our client
    event MarketItemCreated( 
        uint indexed itemId,  
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );

    //function for getting listing price directly from the contract and not hardcoding it
    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }

    // function for creating a new item in the market
    function createMarketItem(address nftContract, uint256 tokenId, uint256 price) public payable nonReentrant {
        require(price > 0, "Price must be atleast 1 wei"); // requiring a condition , that every listed price should not be listed for free that is free , so it must be atleast 1 wei which is very very low but it is acceptable.
        require(msg.value == listingPrice, "Price must be equal to listing price"); // need to send value equal to listing price in every transaction, and transaction here refers to creating an item on the market, otherwise it will not be able to create an item and will fail transaction

        _itemIds.increment(); // incrementing item id 
        uint256 itemId = _itemIds.current(); // getting the current item id for the marketplace item we are getting on sale right now
        
        idToMarketItem[itemId] = MarketItem( //  setting the incremented itemid in mapping everytime function runs and creating a marketitem itself and setting the values which will mostly come from function parameters
            itemId, 
            nftContract, 
            tokenId, 
            payable(msg.sender),  // the person selling this is msg.sender recorded in the transaction , so we get that from there
            payable(address(0)),  // setting this as an empty address because no one owns it right now as seller have put it on sale 
            price, 
            false
        ); 

        IERC721(nftContract).safeTransferFrom(msg.sender, address(this), tokenId); // transferring the ownership of the token from the seller to the contract itself, so that the contract can manage the ownership of the token

        emit MarketItemCreated(itemId, nftContract, tokenId, msg.sender, address(0), price, false); // emitting the event for when the item is created
    }

    // function  for selling an item in the market and transfers the ownership of the item as well as funds

    function createMarketSale(address nftContract, uint256 itemId) public payable nonReentrant {
        uint price = idToMarketItem[itemId].price; // getting the price of the item from the mapping
        uint tokenId = idToMarketItem[itemId].tokenId; // getting the token id of the item from the mapping

        require(msg.value == price, "Please submit the asked price in order to complete the purchase"); // requiring the price to be equal to the price of the item, if not it will fail the transaction


        idToMarketItem[itemId].seller.transfer(msg.value); // transferring the value/money of the item to the seller
        IERC721(nftContract).safeTransferFrom(address(this), msg.sender, tokenId); // transferring the ownership of the token to the msg.sender from (this) address which is the contract address
        idToMarketItem[itemId].owner = payable(msg.sender); // setting the owner of the item to the msg.sender , just updating the mapping so it reflect on the local environment
        idToMarketItem[itemId].sold = true;
        _itemsSold.increment(); // keeping a count of the items sold
        payable(owner).transfer(listingPrice); // transferring the commission to the owner of the contract
    }

    //This function will be available from the client side, thats why it is public and view (as its not doing any transactions) and returns an array of marketitems
    function fetchMarketItems() public view returns (MarketItem[] memory) {
        uint itemCount = _itemIds.current(); // total number of items we have created in the market
        uint unsoldItemCount = _itemIds.current() - _itemsSold.current(); // total number of items we have created in the market and not sold yet
        uint currentIndex = 0; // current index of the array , cause we be looping over an array and have to keep some initial and count of number so we can use different methods on that number/index .

        MarketItem[] memory items = new MarketItem[](unsoldItemCount); // An empty array called item, having the length of the number of items we have created in the market and not sold yet, value will of type marketItem struct
        // looping over the number oif items that have been created
        for (uint i = 0; i < itemCount; i++) {
            if (idToMarketItem[i + 1].owner == address((0))) { // checking if the item is not sold yet, as address((0)) is the empty address shows that no ones own it and seller has put it on sale
                uint currentId = idToMarketItem[i + 1].itemId; // getting the current item id
                MarketItem storage currentItem = idToMarketItem[currentId]; // referencing the current item from the mapping so we can easily input it as a variable in an array
                items[currentIndex] = currentItem; // setting the current item in the array
                currentIndex++; // incrementing the current index
            }
        }
        return items; // returning the array of items
    }

    // function for getting the total bought nfts by a user, accessible from the client side
    function fetchMyNfts() public view returns (MarketItem[] memory) {
        uint totalItemCount = _itemIds.current(); // total number of items in the market
        uint itemCount = 0; // number of items that the user has bought
        uint currentIndex = 0; 

        for (uint i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) { // checking if the item is owned by the user
                itemCount++; // incrementing the number of items that the user has bought
            }
        } // looping over the number of items that the user has bought, and we able to return the total of itemCount of user

        MarketItem[] memory items = new MarketItem[](itemCount); // An empty array called item, having the length of the number of items the user has bought, value will of type marketItem struct

        for (uint i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) { // checking if the item is owned by the user
                uint currentId = idToMarketItem[i + 1].itemId; // getting the current item id
                MarketItem storage currentItem = idToMarketItem[currentId]; // referencing the current item from the mapping so we can easily input it as a variable in an array
                items[currentIndex] = currentItem; // setting the current item in the array
                currentIndex++; // incrementing the current index, we can also use counters.counters increment , utils by openzeppelin
            }
        }
        
        return items; // returning the array of items

    }

    // function for getting the NFTs created by the user

    function fetchItemsCreated() public view returns (MarketItem[] memory) {
        uint totalItemCount = _itemIds.current(); // total number of items in the market
        uint itemCount = 0; // number of items that the user has created
        uint currentIndex = 0; 

        for (uint i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].seller == msg.sender) { // seller is the person who created the item
                itemCount++; // incrementing the number of items that the user has created
            }
        } // looping over the number of items that the user has created, and we able to return the total of itemCount of user

        MarketItem[] memory items = new MarketItem[](itemCount); // An empty array called item, having the length of the number of items the user has created, value will of type marketItem struct

        for (uint i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].seller == msg.sender) { 
                uint currentId = idToMarketItem[i + 1].itemId; // getting the current item id
                MarketItem storage currentItem = idToMarketItem[currentId]; // referencing the current item from the mapping so we can easily input it as a variable in an array
                items[currentIndex] = currentItem; // setting the current item in the array
                currentIndex++; // incrementing the current index, we can also use counters.counters increment , utils by openzeppelin
            }
        }
        
        return items; // returning the array of items

    }

}