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

// RNG has a constructor, pass its arguments
contract CoinToss is RNG {
	enum CoinSide {
		Heads,
		Tails
	}

	struct Game {
		address player;
		CoinSide choice;
	}

	event Fulfilled(bool win);
	mapping(uint256 => Game) public requestToGame;

	Kybit public kybit;
	uint256 public HouseEdge = 2;
	uint256 decimals;
	uint256 public stakeAmount;
	
	constructor(
		address _KybitAddress,
		uint256 _subId,
		address _vrfCoordinator,
		bytes32 _keyHash
	) RNG(_subId, _vrfCoordinator, _keyHash) {
		kybit = Kybit(_KybitAddress);
		decimals = kybit.decimals();
		stakeAmount = 10 * 10 ** decimals;
	}


	function stake(CoinSide _choice) public returns(uint256) {
		Game memory game;
		game.player = msg.sender;
		game.choice = _choice;

		require(kybit.balanceOf(msg.sender) >= stakeAmount, "Not enough balance");
		uint currentAllowance = kybit.allowance(msg.sender, address(this));
		require(currentAllowance >= stakeAmount, "Insuff allow");
		// contract claims
		require(kybit.transferFrom(msg.sender, address(this), stakeAmount), "didnt transfer");

		// request randomness
		uint256 requestId = request();
		requestToGame[requestId] = game;

		// emit something
		emit Requested(requestId);

		return requestId;
	}

	function fulfillRandomWords(uint requestId, uint256[] calldata randomWords) internal override {
		// random number -> toss result
		CoinSide result = CoinSide(randomWords[0] % 2);
		Game memory game = requestToGame[requestId];
		uint256 reward = (2 * stakeAmount) - ((HouseEdge * stakeAmount) / 100);

		// if win
		if(game.choice == result) {
			require(kybit.transfer(game.player, reward), "couldn't reward");
			
			emit Fulfilled(true);
		}
		else {
			emit Fulfilled(false);
		}
	}

}
