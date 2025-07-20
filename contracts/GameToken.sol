// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.27;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title A native token for zerok gambling application
/// @custom:security-contact novasuper11@proton.me
contract Kybit is ERC20, Ownable {
	constructor(address initialOwner)
		ERC20("Kybit", "KYB")
		Ownable(initialOwner) {
			_mint(msg.sender, 1000 * 10 ** decimals());
		}
	
	function mint(address to, uint256 amount) public onlyOwner {
		_mint(to, amount);
	}

	uint256 public claimAmount = 100 * 10 ** decimals();
	mapping(address => bool) public hasClaimed;

	function claim() public {
		require(!hasClaimed[msg.sender], "Already claimed");
		hasClaimed[msg.sender] = true;

		_mint(msg.sender, claimAmount);
	}

	function setClaimAmount(uint256 _claimAmount) public onlyOwner {
		claimAmount = _claimAmount;
	}
}
