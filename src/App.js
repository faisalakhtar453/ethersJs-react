import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import './App.css';

const CONTRACT_ADDRESS = "0x5c104157248a41d644584b0bfe7efc1d41675bcc";

const ABI = [
  {
    "inputs": [],
    "name": "sendEthContract",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      }
    ],
    "name": "sendEthUser",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_num",
        "type": "uint256"
      }
    ],
    "name": "setValue",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_address",
        "type": "address"
      }
    ],
    "name": "accountBalance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "contractBalance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getValue",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const PROVIDER_URL = "https://sepolia.infura.io/v3/385c149789d744ee8fa6af9310e18725";

function App() {
  const [contractName, setContractName] = useState('');
  const [storedValue, setStoredValue] = useState('');
  const [contractBalance, setContractBalance] = useState('');
  const [userBalance, setUserBalance] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  const userAddress = "0x766D17c1aC60eD4f48bFC041529F4261DfBcEA44"; // Replace or prompt dynamically

  const fetchData = async () => {
    try {
      const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

      const name = await contract.name();
      const value = await contract.getValue();
      const contractBal = await contract.contractBalance();
      const userBal = await contract.accountBalance(userAddress);

      setContractName(name);
      setStoredValue(value.toString());
      setContractBalance(ethers.formatEther(contractBal));
      setUserBalance(ethers.formatEther(userBal));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const refreshBalances = async () => {
    try {
      const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
      const contractBal = await contract.contractBalance();
      const userBal = await contract.accountBalance(userAddress);

      setContractBalance(ethers.formatEther(contractBal));
      setUserBalance(ethers.formatEther(userBal));
    } catch (err) {
      console.error("Balance fetch error:", err);
    }
  };

  useEffect(() => {
    fetchData();
    refreshBalances();
  }, []);

  const handleSetValue = async () => {
    if (!inputValue || isNaN(inputValue)) {
      alert("Please enter a valid number.");
      return;
    }

    try {
      setLoading(true);

      if (!window.ethereum) {
        alert("MetaMask is not detected.");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      const tx = await contract.setValue(Number(inputValue));
      await tx.wait();

      alert("Value updated successfully!");
      setInputValue('');
      fetchData();
    } catch (error) {
      console.error("Transaction failed:", error);
      alert("Transaction failed. Check the console for details.");
    } finally {
      setLoading(false);
    }
  };

  const sendEthToContract = async () => {
    try {
      setLoading(true);
      if (!window.ethereum) return alert("MetaMask not detected");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      const tx = await contract.sendEthContract({
        value: ethers.parseEther("0.001") // Send 0.001 ETH
      });

      await tx.wait();
      alert("0.001 ETH sent to contract!");
      refreshBalances();
    } catch (err) {
      console.error("Send error:", err);
      alert("Failed to send ETH.");
    } finally {
      setLoading(false);
    }
  };

  const withdrawFromContract = async () => {
    try {
      setLoading(true);

      if (!window.ethereum) {
        alert("MetaMask not detected");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      const tx = await contract.sendEthUser(userAddress, {
        value: ethers.parseEther("0.001"), // sending 0.001 ETH
      });
      await tx.wait();

      alert("0.001 ETH withdrawn to your wallet!");
    } catch (error) {
      console.error("Withdraw failed:", error);
      alert("Transaction failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>Smart Contract Dashboard</h1>
      <p><strong>Contract Name:</strong> {contractName}</p>
      <p><strong>Stored Value:</strong> {storedValue}</p>
      <p><strong>Contract Balance:</strong> {contractBalance} ETH</p>
      <p><strong>User Balance:</strong> {userBalance} ETH</p>

      <div className="input-section">
        <input
          type="number"
          placeholder="Enter a number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button onClick={handleSetValue} disabled={loading}>{loading ? "Processing..." : "Set Value"}</button>

        <button onClick={sendEthToContract} disabled={loading}>{loading ? "Processing..." : "Send 0.001 ETH to Contract"}</button>
        <button onClick={withdrawFromContract} disabled={loading}>{loading ? "Processing..." : "Send 0.001 ETH to User"}</button>
      </div>
    </div>
  );
}

export default App;
