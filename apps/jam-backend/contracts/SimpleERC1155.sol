// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract JamContract is ERC1155, Ownable {

    constructor() ERC1155("") {} 

    function mint(address account, uint256 id, uint256 amount, bytes memory data)
        public
    { // This is our mint function to create new tokens and assign them to an ethereum address
        _mint(account, id, amount, data);
    }

    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
        public
        onlyOwner // Only the smart contract owner can execute this function
    { // The _mintBatch() function enables the Owner to create multiple tokens in a batch with one transaction
        _mintBatch(to, ids, amounts, data);
    } 

    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }
}