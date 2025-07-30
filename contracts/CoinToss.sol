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

contract CoinToss is RNG {
	enum CoinSide {
		Heads,
		Tails
	}

	struct Game {
		address player;
		CoinSide choice;
		uint256 stakeAmount;
	}

	event Fulfilled(bool win);
	mapping(uint256 => Game) public requestToGame;

	Kybit public kybit;
	uint256 public HouseEdge = 2;
	uint256 decimals;
	
	constructor(
		address _KybitAddress,
		uint256 _subId,
		address _vrfCoordinator,
		bytes32 _keyHash
	) RNG(_subId, _vrfCoordinator, _keyHash) {
		kybit = Kybit(_KybitAddress);
		decimals = kybit.decimals();
	}


	function stake(CoinSide _choice, uint256 stakeAmount) public returns(uint256) {
		uint256 minStake = 1 * 10 ** (decimals - 1); // 0.1 token
		uint256 maxStake = 100 * 10 ** decimals; // 100 token
		require(stakeAmount >= minStake && stakeAmount <= maxStake);

		Game memory game;
		game.player = msg.sender;
		game.choice = _choice;
		game.stakeAmount = stakeAmount;

		require(kybit.balanceOf(msg.sender) >= stakeAmount, "Not enough balance");
		uint currentAllowance = kybit.allowance(msg.sender, address(this));
		require(currentAllowance >= stakeAmount, "Insuff allow");
		// contract claims
		require(kybit.transferFrom(msg.sender, address(kybit), stakeAmount), "didnt transfer");

		// request randomness
		uint256 requestId = request();
		requestToGame[requestId] = game;

		emit Requested(requestId);

		return requestId;
	}

	function fulfillRandomWords(uint requestId, uint256[] calldata randomWords) internal override {
		CoinSide result = CoinSide(randomWords[0] % 2);
		Game memory game = requestToGame[requestId];
		uint256 stakeAmount = game.stakeAmount;
		uint256 payout = (2 * stakeAmount) - ((HouseEdge * stakeAmount) / 100);

		if(game.choice == result) {
			require(kybit.transferFrom(address(kybit), game.player, payout), "couldn't reward");
			
			emit Fulfilled(true);
		}
		else {
			emit Fulfilled(false);
		}
	}

}
