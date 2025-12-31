// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract PerfectCircleReport is ERC721URIStorage {
    uint256 private _nextTokenId;

    constructor() ERC721("PerfectCircleReport", "PCR") {}

    function mintReport(address recipient, string memory tokenURI) public returns (uint256) {
        uint256 newItemId = _nextTokenId++;
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);
        return newItemId;
    }
}
