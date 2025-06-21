// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.17;

contract Wallet {
    string public name = "ContractX Wallet";
    uint public num;
    address public owner;

    // Events
    event ValueSet(uint newValue);
    event DepositReceived(address indexed from, uint amount);
    event EthWithdrawn(address indexed to, uint amount);

    // Set the deployer as the contract owner
    constructor() {
        owner = msg.sender;
    }

    // Modifier to restrict access
    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    // Function to set a new value
    function setValue(uint _num) public {
        num = _num;
        emit ValueSet(_num);
    }

    // Function to get the stored value
    function getValue() public view returns (uint) {
        return num;
    }

    // Fallback to accept ETH directly
    receive() external payable {
        emit DepositReceived(msg.sender, msg.value);
    }

    fallback() external payable {
        emit DepositReceived(msg.sender, msg.value);
    }

    // Explicit function to receive ETH via UI
    function deposit() public payable {
        require(msg.value > 0, "Must send ETH");
        emit DepositReceived(msg.sender, msg.value);
    }

    // Owner-only function to withdraw ETH to a user
    function withdrawToUser(address _to, uint _amount) public onlyOwner {
        require(address(this).balance >= _amount, "Insufficient contract balance");
        payable(_to).transfer(_amount);
        emit EthWithdrawn(_to, _amount);
    }

    // Read: Contract ETH balance
    function contractBalance() public view returns (uint) {
        return address(this).balance;
    }

    // Read: Any account balance
    function accountBalance(address _addr) public view returns (uint) {
        return _addr.balance;
    }
}
