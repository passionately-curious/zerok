// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./GameToken.sol";
import "./RandomNumberGenerator.sol";

event Requested(uint256 requestId);

interface IKybit {
	function balanceOf(address account) external view returns (uint256);
	function approve(address spender, uint256 value) external returns (bool);
	function transferFrom(address from, address to, uint256 value) external returns (bool);
	function transfer(address to, uint256 value) external returns (bool);
}

contract Dice is RNG {
	Kybit public kybit;
	uint256 public HouseEdge = 2;
	uint256 decimals;

	struct Game {
		address player;
		uint256 rollUnder;
		uint256 stakeAmount;
	}

	event Fulfilled(bool win);
	mapping(uint256 => Game) public requestToGame;

	constructor(
		address _KybitAddress,
		uint256 _subId,
		address _vrfCoordinator,
		bytes32 _keyHash
	) RNG(_subId, _vrfCoordinator, _keyHash) {
		kybit = Kybit(_KybitAddress);
		decimals = kybit.decimals();
	}

	function stake(uint256 _rollUnder, uint256 _stakeAmount) public returns(uint256) {
		// rollUnder to be between 2 and 100
		// require()
		uint256 minStake = 1 * 10 ** (decimals - 1); // 0.1 token
		uint256 maxStake = 100 * 10 ** decimals; // 100 token
		require(_stakeAmount >= minStake && _stakeAmount <= maxStake);

		Game memory game;
		game.player = msg.sender;
		game.rollUnder = _rollUnder;
		game.stakeAmount = _stakeAmount;

		
		require(kybit.balanceOf(msg.sender) >= _stakeAmount, "Not enough balance");
		uint currentAllowance = kybit.allowance(msg.sender, address(this));
		require(currentAllowance >= _stakeAmount, "Insuff allow");
		// contract claims
		require(kybit.transferFrom(msg.sender, address(kybit), _stakeAmount), "didnt transfer");

		// request randomness
		uint256 requestId = request();
		requestToGame[requestId] = game;

		// emit something
		emit Requested(requestId);

		return requestId;
	}

	function fulfillRandomWords(uint requestId, uint256[] calldata randomWords) internal override {
		uint256 result = randomWords[0] % 100 + 1;
		Game memory game = requestToGame[requestId];
		uint256 stakeAmount = game.stakeAmount;
		// calculate reward
		uint256 multiplier = (10000 * 100) / (game.rollUnder - 1); // 10000 for precision
		uint256 withHouseEdge = (multiplier * (100 - HouseEdge)) / 100;
		uint256 reward = (stakeAmount * withHouseEdge) / 10000;

		if(result < game.rollUnder) {
			require(kybit.transferFrom(address(kybit), game.player, reward), "couldn't reward");
			
			emit Fulfilled(true);
		}
		else {
			emit Fulfilled(false);
		}

	}
}
