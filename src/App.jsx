import React, { useState } from "react";
import { ethers } from "ethers";
import SimpleNFT from "../../artifacts/contracts/NFTMinter.sol/NFTMinter.json";
import sampleImage from "./assets/image.png"; // Import the local image
import axios from "axios";

const pinataApiKey = '3cb6de020c1f735854a6';
const pinataSecretApiKey = `d16f4971af136437d85ce4568ff10961acb72bd697c4fba58eb2659921b08ecb`;
const contractAddress = "0x018a906CB4C9aE34860180f2F54090C4EFedEa8E";

function App() {
    const [imageUrl, setImageUrl] = useState("");
    const [ipfsUrl, setIpfsUrl] = useState("");
    const [message, setMessage] = useState("");
    const [account, setAccount] = useState(null);
    const [contract, setContract] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const generateAIImage = async () => {
        // Replace this with actual AI image generation API call or local image
        const generatedImage = "https://sepolia.etherscan.io/assets/svg/logos/logo-etherscan.svg?v=0.0.5";
        setImageUrl(sampleImage);
    };

    const uploadToPinata = async () => {
        if (!imageUrl) return;

        setMessage("Uploading to IPFS...");

        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const formData = new FormData();
            formData.append("file", blob, "generated-image.png");

            const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
                maxContentLength: "Infinity",
                headers: {
                    "Content-Type": "multipart/form-data",
                    pinata_api_key: pinataApiKey,
                    pinata_secret_api_key: pinataSecretApiKey,
                },
            });

            const ipfsHash = res.data.IpfsHash;
            const url = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
            setIpfsUrl(url);
            setMessage("Image uploaded to IPFS successfully.");
        } catch (error) {
            console.error("Pinata upload error:", error);
            setMessage("Failed to upload image to IPFS.");
        }
    };

    const mintNFT = async () => {
        if (!ipfsUrl) {
            setMessage("Please upload the image to IPFS first.");
            return;
        }

        if (!isAuthenticated) {
            setMessage("Please connect your MetaMask wallet.");
            return;
        }

        try {
            if (!contract) {
                setMessage("Contract is not initialized.");
                return;
            }

            const tx = await contract.mintNFT(account, ipfsUrl);
            await tx.wait(); // Wait for the transaction to be mined

            setMessage("NFT minted successfully!");
        } catch (error) {
            console.error("NFT minting error:", error);
            setMessage("Minting failed. Please try again.");
        }
    };

    const connectToMetaMask = async () => {
      try {
          if (window.ethereum) {
              console.log("MetaMask is installed:", window.ethereum);
              await window.ethereum.request({ method: 'eth_requestAccounts' });
  
              // Initialize provider after requesting accounts
              const provider = new ethers.providers.Web3Provider(window.ethereum);
              const signer = provider.getSigner();
              const address = await signer.getAddress();
              setAccount(address);
  
              const contractInstance = new ethers.Contract(contractAddress, SimpleNFT.abi, signer);
              setContract(contractInstance);
              setIsAuthenticated(true);
  
              console.log("Connected account:", address);
          } else {
              alert('MetaMask is not installed. Please install MetaMask.');
          }
      } catch (error) {
          console.error('Error connecting to MetaMask:', error);
          setMessage("Error connecting to MetaMask.");
      }
  };

    return (
        <div>
            <h1>AI Image NFT Generator</h1>
            {!isAuthenticated ? (
                <button onClick={connectToMetaMask}>Connect MetaMask</button>
            ) : (
                <p>Connected as {account}</p>
            )}
            <button onClick={generateAIImage}>Generate AI Image</button>
            {imageUrl && <img src={imageUrl} alt="Generated AI" width="300" />}
            <br />
            <button onClick={uploadToPinata}>Upload to IPFS</button>
            {ipfsUrl && (
                <>
                    <p>IPFS URL: <a href={ipfsUrl} target="_blank" rel="noopener noreferrer">{ipfsUrl}</a></p>
                    <img src={ipfsUrl} alt="Uploaded to IPFS" width="300" />
                </>
            )}
            <br />
            <button onClick={mintNFT}>Mint NFT</button>
            <p>{message}</p>
        </div>
    );
}

export default App;
