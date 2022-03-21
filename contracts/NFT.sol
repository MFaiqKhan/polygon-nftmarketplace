// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4; // solidity compiler version

import "@openzeppelin/contracts/token/ERC721/ERC721.sol"; // ERC721 standard token
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol"; //extension for ERC721 storage , allow us to set token URI, will give all the functionality of ERC721 standard token.
import "@openzeppelin/contracts/utils/Counters.sol"; // easy to use utility for icrementing numbers .


// defining my contract

 contract NFT is ERC721URIStorage{  //Inheriting from ERC721URIStorage to get all the functionality of ERC721 standard token as erc721uirstorage also inherits from ERC721 contract
    using Counters for Counters.Counter; // using Counters utility for incrementing numbers
    Counters.Counter private _tokenIds; // private counter for tokenIds , declaring variable _tokenIds ,meant to unique identifier for ids as it will increment whenever a new tokenId comes
    address contractAddress; // variable called contract address, address of the marketplace that will interact with the nfts, change the ownership, transsact etc from a seprate contract.

    // FIRST WE WILL be deploying market place contract then it will interact with the NFT contract address contract
    constructor(address marketplaceAddress) ERC721("Legacy Tokens", "LTT") { // 
        contractAddress = marketplaceAddress; // setting the contract address to the marketplace address
    }

    // function to mint a new token
    function createToken(string memory tokenURI) public returns (uint) { //passing only tokenURI because address, who is invoking it tokenid all the things are stored in this contract itself we will get all other metadata from it anyways
        _tokenIds.increment(); // incrementing the tokenIds
        uint256 newItemId = _tokenIds.current(); // getting the current tokenId after incrementing, e.g: when we increment the tokenId when the user mint first nft, initially it will be 0 after first mint it will become 1 , so in current we will get 1 output

        _mint(msg.sender, newItemId); // calling the _mint function to mint the token, got it from ERC721 standard token , it will set the owner of the token to the sender of the transaction and set the tokenId to the newItemId, || msg.sender is the sender of the transaction , newItemId is the tokenId
        _setTokenURI(newItemId, tokenURI); // calling the _setTokenURI function to set the tokenURI, got it from ERC721URIStorage.
        setApprovalForAll(contractAddress, true); // setting the approval for all to true, so that the marketplace can interact with the token , approval for token to interact with any other user contract addresses.
        return newItemId; // returning the newItemId  //returning the Id so we can get it on the front end (client side and putting as selling etc) by its id
    }
}



// _setTokenURI function comes from ERC721URIStorage.sol , AND It's an expensive operation 
// we can use tokenUri from ERC721
// BUT IF you are minting dynamically nfts and dynamic meta data , then its better to use _setotkenUri from erc721URIStorage