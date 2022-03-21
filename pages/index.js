import { ethers } from "ethers";
import { useState, useEffect } from "react";
import Web3Modal from "web3modal"; // way for us to connect to someone's ethereum wallet
import axios from "axios";

import {nftaddress, nftmarketaddress} from '../config'

import NFTMarket from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json'  // this is the compiled contract, abi code
import NFT from '../artifacts/contracts/NFT.sol/NFT.json' 

export default function Home() {
  const [nfts, setNFTs] = useState([]); // an empty arrays of nfts
  const [loadingState, setLoadingState] = useState('not-loaded'); // default state is not loaded, we can show or hide our UI and etc

  // the function where we will call our smart contract and fetch our nfts
  // will be called when the page is loaded , so we will be using it in useEffect
  useEffect(() => {
    loadNfts();
  }, []);

  // loading nfts function
  const loadNfts = async () => {
    const provider = new ethers.providers.JsonRpcProvider(); // this is the provider we will use to connect to our smart contract
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider); // getting nftcontract reference in tokenContract
    const marketContract = new ethers.Contract(nftmarketaddress, NFTMarket.abi, provider); // getting nftmarket reference in marketContract
    const data = await marketContract.fetchMarketItems(); // fetching all the nfts from the market, the function is coming directly coming from our smart contract we made.

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
        name: meta.data.name,
        description: meta.data.description,
      }
      return item;
    }));

    setNFTs(items); // setting the items to our nfts state
    setLoadingState('loaded'); // setting the loading state to loaded
  }

  // An option to buy a nft function , using web3 modal 
  const buyNft = async (nft) => {
    const web3Modal = new Web3Modal() // creating a new web3 modal
    const connection = await web3Modal.connect() // connecting to the user's wallet
    const provider = new ethers.providers.Web3Provider(connection); // creating a provider from the connection

    // writing an actual transaction will need users address, and will need their signer so they can execute that transaction
    const signer = provider.getSigner(); // getting the signer from the provider
    const contract = new ethers.Contract(nftmarketaddress, NFTMarket.abi, signer);  // https://docs.ethers.io/v5/api/contract/contract/

    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether') // converting it to back to a number so we can use it

    const transaction = await contract.createMarketSale(nftaddress, nft.tokenId, {value: price}); // creating a transaction to buy the nft, value is msg.value which will be equal to price listed
    await transaction.wait(); // waiting for the transaction to be mined

    // then we have to reload the page to remove that nft from the page
    loadNfts(); // reloading the page, and we will have 1 less nft to show
  }

  
  // If we have loaded the nfts, but it is empty, we will show a message.
  if (loadingState === 'loaded' &&  !nfts.length) return (
    <h1 className="px-20 py-10 text-3xl"> 
      No Items in Marketplace, Please refresh or Create Yourself!!
    </h1>
  )

  return (
    <div className="flex justify-center">
      <div className="px-4" style={{ maxWidth: '1600px' }}> {/* setting maxwidth manually without using tailwind */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {nfts.map((nft, i) => (  // mapping over the nfts array
            <div key={i} className="border shadow rounded-xl overflow-hidden"> {/*  You should put the key on the outer element */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={nft.image} alt="nft img"/>
              <div className='p-4'> {/*  wrapping name description in another div*/}
                <p style={{ height: '64px' }} className="text-2xl font-semibold">{nft.name}</p>
                <div style={{ height: '70px', overflow: 'hidden'}}>
                  <p className='text-gray-400'>{nft.description}</p>
                </div>
              </div>
              {/* price and buy button */}
              <div className='p-4 bg-black'>
                <p className='text-2xl mb-4 font-bold text-white'>{nft.price} MATIC</p>
                <button className='w-full bg-pink-500 text-white font-bold py-2 px-12 rounded' onClick={() => buyNft(nft)}>
                  Buy  
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
