import React, { useState } from "react";
import { ethers } from "ethers";
import SimpleNFT from "./NFTMinter.sol/NFTMinter.json";
import axios from "axios";
import "./App.css";

const pinataApiKey = '3cb6de020c1f735854a6';
const pinataSecretApiKey = 'd16f4971af136437d85ce4568ff10961acb72bd697c4fba58eb2659921b08ecb';
const contractAddress = "0x018a906CB4C9aE34860180f2F54090C4EFedEa8E";

function App() {
  const [imageUrl, setImageUrl] = useState("");
  const [ipfsUrl, setIpfsUrl] = useState("");
  const [message, setMessage] = useState("");
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [uploadImageUrl, setUploadImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateImage = async () => {
    setLoading(true);
    setImageUrl("");
    setMessage("");

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      key: "r3c74c2QhiJmpeCW5Ttat4z11l8ivkptsJeAP0O19mQ4v051hQj6OUrwNe1U",
      prompt,
      negative_prompt: "bad quality",
      width: "512",
      height: "512",
      safety_checker: false,
      samples: 1,
    });

    try {
      const response = await fetch("https://modelslab.com/api/v6/realtime/text2img", {
        method: 'POST',
        headers: myHeaders,
        body: raw,
      });
      const result = await response.json();

      if (result?.status === "success" && result.output?.[0]) {
        setImageUrl(result.output[0]);
      } else {
        setMessage("Image generation failed or is taking too long.");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Image generation failed or is taking too long.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadImageUrl(URL.createObjectURL(file));
      setImageUrl(""); // Clear generated image if user uploads a new one
    }
  };

  const uploadToPinata = async () => {
    const currentImageUrl = uploadImageUrl || imageUrl;
    if (!currentImageUrl) return;

    setMessage("Uploading to IPFS...");
    try {
      const response = await fetch(currentImageUrl);
      const blob = await response.blob();
      const formData = new FormData();
      formData.append("file", blob, "image.png");

      const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
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
      await tx.wait();

      setMessage("NFT minted successfully!");
    } catch (error) {
      console.error("NFT minting error:", error);
      setMessage("Minting failed. Please try again.");
    }
  };

  const connectToMetaMask = async () => {
    try {
      if (window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);

        const contractInstance = new ethers.Contract(contractAddress, SimpleNFT.abi, signer);
        setContract(contractInstance);
        setIsAuthenticated(true);
      } else {
        alert('MetaMask is not installed. Please install MetaMask.');
      }
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
      setMessage("Error connecting to MetaMask.");
    }
  };

  return (
    <div className="app">
      <h1>NFT Generator</h1>

      {!isAuthenticated ? (
        <button className="button" onClick={connectToMetaMask}>
          Connect MetaMask
        </button>
      ) : (
        <p>Connected as {account}</p>
      )}

      <div className="image-options">
        <div className="image-generator">
          <h2>AI Image Generator</h2>
          <input
            type="text"
            placeholder="Enter prompt for AI image..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="input-prompt"
          />
          <button
            onClick={generateImage}
            disabled={loading}
            className={`button ${loading ? "loading" : ""}`}
          >
            {loading ? "Generating..." : "Generate Image"}
          </button>
        </div>

        <div className="upload-image">
          <h2>Upload Your Image</h2>
          <input type="file" accept="image/*" onChange={handleFileUpload} className="input-file" />
        </div>
      </div>

      <div className="image-display">
        {(uploadImageUrl || imageUrl) && (
          <img
            src={uploadImageUrl || imageUrl}
            alt="Selected or Generated"
            className="image-preview"
          />
        )}
      </div>

      <button className="button" onClick={uploadToPinata}>
        Upload to IPFS
      </button>

      {ipfsUrl && (
        <div className="ipfs-url">
          <p>
            IPFS URL: <a href={ipfsUrl} target="_blank" rel="noopener noreferrer">{ipfsUrl}</a>
          </p>
        </div>
      )}

      <button className="button" onClick={mintNFT}>
        Mint NFT
      </button>

      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default App;
