import { useState } from 'react';
import { ethers } from 'ethers';
import { useRouter } from 'next/router'; // allow us to routes , read values from the route uri dynamically
import { create as ipfsHttpClient } from 'ipfs-http-client'; // way to access ipfs for uploading and downloading files
import Web3Modal from 'web3modal';

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0'); // an infura url that sets and pins items to ipfs .

import { nftaddress, nftmarketaddress } from '../config'
import NFTMarket from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json'  // this is the compiled contract, abi code
import NFT from '../artifacts/contracts/NFT.sol/NFT.json' 

export default function SellItems() {
    const [fileUrl, setFileUrl] = useState(null) // ipfs file , going to allow user to upload
    const [formInput, updateFormInput] = useState({price: '', name: '', description: ''}) // set the price , name and description for nft item, in ipfs

    const router = useRouter() // referencing the router

    // creating and updating the file url
    const onChange = async (e) => { // will be invoke with the event
        const file = e.target.files[0]; // getting the file from the event, we will only get one file
        try {
            const added = await client.add(file, { progress: (prog) => console.log(`received: ${prog}`) } ); // adding the file to ipfs, and getting the progrss in callback, we can see the progress of the upload
            // after the file is uploaded we will be able to get added variable , we will use it to get url by added.path
            console.log(added);
            const url = `https://ipfs.infura.io/ipfs/${added.path}`; // url of the file/nft , so we can use it later to show it in client side
            setFileUrl(url); // setting the url to the state
        } catch (error) {
            console.log(error);
        }
    }

    // creating and updating the form input, name, image, description etc .

    //function to create the item and save it in ipfs

    const createItem = async () => {
        const {name, description, price} = formInput; // destructuring the form input  
        if (!name || !description || !price || !fileUrl) { // if any of the fields are empty
            alert(`Please fill all the fields and don't forget the fileUrl`);
            return;
        }
        const data = JSON.stringify({name, description, image: fileUrl}); // stringify the data
        // then we can save the data in ipfs
        try{
            const added = await client.add(data)
            const url = `https://ipfs.infura.io/ipfs/${added.path}`; // url contains name, description and the image url to the seperate ipfs location. and with url we can set this set this as a token uri

            createSale(url); // create the sale

        } catch (error) {
            console.log("Error Uploading File: " , error);
        }
        
    }


    const createSale = async (url) => {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()

        // Interacting with two contracts, in the same function
        let contract = new ethers.Contract(nftaddress, NFT.abi, signer) // interact with the nft contract
        let transaction = await contract.createToken(url) // passing the uri actually
        let tx = await transaction.wait() // wait for the transaction to be mined

        console.log("tx ", tx);

        // need token id return freom the transaction
        let event = tx.events[0] // get the event from the transaction
        let value = event.args[2] // get the token id from the event
        console.log("value ", value);
        let tokenId = value.toNumber() // convert the bigNumber to number
        console.log("converting value to number ", tokenId);

        const price = ethers.utils.parseUnits(formInput.price, "ether"); // convert the normal number into wei or something like that
        console.log("price after converting", price);

        
        contract = new ethers.Contract(nftmarketaddress, NFTMarket.abi, signer) // interact with the nft market contract, using same reference to signer
        let listingPrice = await contract.getListingPrice()
        console.log("listing price ", listingPrice);
        listingPrice = listingPrice.toString()  // converting so we can send it in to the createrMarketItem function in our contract as a require check
        console.log("listing price after converting to String", listingPrice);

        transaction = await contract.createMarketItem(nftaddress, tokenId, price, { value: listingPrice } ) // passing the token id, price and listing price
        // { value: listingPrice } will be extracted from our wallet as a msg.value

        await transaction.wait()
        router.push('/') // after the transaction is completed , we will re route to the main page where we will render out the item to the user
    }

    return (
        <div className='flex justify-center'>
            <div className='w-1/2 flex flex-col pb-12'>
                <input 
                    placeholder="nft name"
                    className='mt-8 border rounded p-4'
                    onChange={e => updateFormInput({...formInput, name: e.target.value})} // changing the name of the nft item only
                />
                <textarea
                    placeholder="nft description"
                    className='mt-8 border rounded p-4'
                    onChange={e => updateFormInput({...formInput, description: e.target.value})} // changing the description of the nft item only
                />
                <input
                    placeholder="nft price"
                    className='mt-8 border rounded p-4'
                    onChange={e => updateFormInput({...formInput, price: e.target.value})} // changing the price of the nft item only
                />
                <input
                    type="file"
                    className='my-4'
                    onChange={onChange} // on change of the file, input the file for upload
                    name="nft"
                />
                {/* showing the file image , if there is a fileUrl as a preview */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {fileUrl && <img src={fileUrl} alt="nft preview" className='w-1/2 h-64 rounded mt-4' />}
                {/* clicking on the button will create the item by running the function associated with onclick */}
                <button 
                    className='mt-4 font-bold bg-blue-500 text-white rounded p-4 shadow-xl'
                    onClick={createItem} // on click of the button, create the item
                > Create Nft Item 
                </button>
            </div>
        </div>
    )

}

