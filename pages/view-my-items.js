import { ethers } from "ethers";
import { useState, useEffect } from "react";
import Web3Modal from "web3modal"; // way for us to connect to someone's ethereum wallet
import axios from "axios";

import { nftaddress, nftmarketaddress } from '../config'
import NFTMarket from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json'  // this is the compiled contract, abi code
import NFT from '../artifacts/contracts/NFT.sol/NFT.json' 


// component will be returning the item we have purchased our selves
const Viewitems = () => {
    const [nfts, setNFTs] = useState([]); // an empty arrays of nfts
    const [loadingState, setLoadingState] = useState('not-loaded'); // default state is not loaded, we can show or hide our UI and etc

    useEffect(() => {
        loadNfts();
    }, []);

    const loadNfts = async () => {
        const web3Modal = new Web3Modal() 
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection); // creating a web3 provider from the connection because connection needs in browser and metamask using web3modal
        const signer = provider.getSigner(); // getting the signer from the provider, because need to know who is the msg.sender so we can display his nfts
        
        const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider); // getting nftcontract reference in tokenContract
        const marketContract = new ethers.Contract(nftmarketaddress, NFTMarket.abi, signer); // getting nftmarket reference in marketContract
        const data = await marketContract.fetchMyNfts(); // fetching total items of a specific user, the function is coming directly coming from our smart contract we made.
    
        // mapping all over the fetched items : and setting a nice data format to get the nfts and we can show it on our client side
    
        const items = await Promise.all(data.map(async (i) => { // creating an item arrays called items, promise.all to make it async
          const tokenUri = await tokenContract.tokenURI(i.tokenId); // getting the tokenURI from the smart contract, we will getting metadata with that tokenUri from the token, so we can work with it. e.g: to depoly at ipfs using metadata
          const meta = await axios.get(tokenUri) // getting metadata from the tokenUri
          let price = ethers.utils.formatUnits(i.price.toString(), 'ether') // formattting the price to ethers(matic) format. not some big Number
          let item = {
            price,
            tokenId: i.tokenId.toNumber(), 
            seller: i.seller,
            owner: i.owner,
            image: meta.data.image,
          }
          return item;
        }));
    
        setNFTs(items); // setting the items to our nfts state
        setLoadingState('loaded'); // setting the loading state to loaded
      }

      // check if nfts is loaded or not
      if (loadingState === 'loaded' &&  !nfts.length) return (
        <h1 className="px-20 py-10 text-3xl"> 
          No Nfts Owned, Please refresh or Create Yourself!!
        </h1>
      )



  return (
    <div className="flex justify-center">
    <div className="p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
        {
          nfts.map((nft, i) => (
            <div key={i} className="border shadow rounded-xl overflow-hidden">
              <img src={nft.image} className="rounded" />
              <div className="p-4 bg-black">
                <p className="text-2xl font-bold text-white">Price - {nft.price} Eth</p>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  </div>
  )
}

export default Viewitems;

// How to know which provider do you choose ?
// https://stackoverflow.com/questions/70714338/which-provider-should-i-choose-web3provider-infuraprovider-jsonrpcprovider