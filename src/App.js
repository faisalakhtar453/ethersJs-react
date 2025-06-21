import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import ABI from './contract/abi.json';

const CONTRACT_ADDRESS = "0x91138A8d6395583080d1723207E701458EE3ba29";
const PROVIDER_URL = "https://sepolia.infura.io/v3/385c149789d744ee8fa6af9310e18725";

function App() {
  const [contractName, setContractName] = useState('');
  const [storedValue, setStoredValue] = useState('');
  const [contractBalance, setContractBalance] = useState('');
  const [userBalance, setUserBalance] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const notify = (message, type = 'info') => {
    toast[type](message, {
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const getWalletAddress = async () => {
    try {
      if (!window.ethereum) return notify("MetaMask not detected", 'error');

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setUserAddress(address);
    } catch (error) {
      console.error("Failed to get wallet address:", error);
      notify("Failed to get wallet address", 'error');
    }
  };

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
      notify("Failed to fetch contract data", 'error');
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
      notify("Failed to refresh balances", 'error');
    }
  };

  useEffect(() => {
    getWalletAddress();
  }, []);

  useEffect(() => {
    if (userAddress !== '') {
      fetchData();
      refreshBalances();
    }
  }, [userAddress]);

  const handleSetValue = async () => {
    if (!inputValue || isNaN(inputValue)) {
      return notify("Please enter a valid number.", 'warning');
    }

    try {
      setLoading(true);

      if (!window.ethereum) return notify("MetaMask not detected.", 'error');

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      const tx = await contract.setValue(Number(inputValue));
      await tx.wait();

      notify("Value updated successfully!", 'success');
      setInputValue('');
      fetchData();
    } catch (error) {
      console.error("Transaction failed:", error);
      notify("Transaction failed. See console for details.", 'error');
    } finally {
      setLoading(false);
    }
  };

  const sendEthToContract = async () => {
    try {
      setLoading(true);
      if (!window.ethereum) return notify("MetaMask not detected", 'error');

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      const tx = await contract.deposit({
        value: ethers.parseEther("0.001")
      });

      await tx.wait();
      notify("0.001 ETH sent to contract!", 'success');
      refreshBalances();
    } catch (err) {
      console.error("Send error:", err);
      notify("Failed to send ETH.", 'error');
    } finally {
      setLoading(false);
    }
  };

  const withdrawFromContract = async () => {
    try {
      setLoading(true);
      if (!window.ethereum) return notify("MetaMask not detected", 'error');

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      const tx = await contract.withdrawToUser(userAddress, ethers.parseEther("0.001"));
      await tx.wait();

      notify("0.001 ETH withdrawn to your wallet!", 'success');
      refreshBalances();
    } catch (error) {
      console.error("Withdraw failed:", error);
      notify("Withdraw failed.", 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <ToastContainer />
      <h1>ContractX Wallet Dashboard</h1>

      <div className="info-section">
        <p><strong>Contract Name:</strong> {contractName}</p>
        <p><strong>Stored Value:</strong> {storedValue}</p>
        <p><strong>Contract Balance:</strong> {contractBalance} ETH</p>
        <p><strong>User Balance:</strong> {userBalance} ETH</p>
      </div>

      <div className="input-section">
        <input
          type="number"
          placeholder="Enter a number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />

        <div className="button-group">
          <button onClick={handleSetValue} disabled={loading}>
            {loading ? "Processing..." : "Set Value"}
          </button>
          <button onClick={sendEthToContract} disabled={loading}>
            {loading ? "Processing..." : "Send 0.001 ETH to Contract"}
          </button>
          <button onClick={withdrawFromContract} disabled={loading}>
            {loading ? "Processing..." : "Withdraw 0.001 ETH"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
