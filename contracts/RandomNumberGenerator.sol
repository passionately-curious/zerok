// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

abstract contract RNG is VRFConsumerBaseV2Plus {
	uint256 s_subscriptionId;
	address vrfCoordinator;
	bytes32 s_keyHash;
	uint32 public callbackGasLimit = 200000;
	uint16 requestConfirmations = 3;
	uint32 numWords = 1;

	constructor(uint256 _subId, address _vrfCoordinator, bytes32 _keyHash) VRFConsumerBaseV2Plus(_vrfCoordinator) {
		s_subscriptionId = _subId;
		vrfCoordinator = _vrfCoordinator;
		s_keyHash = _keyHash;
	}

	function request() internal returns(uint256) {
		uint256 requestId = s_vrfCoordinator.requestRandomWords(
			VRFV2PlusClient.RandomWordsRequest({
				keyHash: s_keyHash,
				subId: s_subscriptionId,
				requestConfirmations: requestConfirmations,
				callbackGasLimit: callbackGasLimit,
				numWords: numWords,
				extraArgs: VRFV2PlusClient._argsToBytes(
					VRFV2PlusClient.ExtraArgsV1({
						nativePayment: false
					})
				)
			})
		);

		return requestId;
	}

	function setCallBackGasLimit(uint32 _newLimit) external onlyOwner {
		require(_newLimit >= 20000 && _newLimit <= 2500000);
		callbackGasLimit = _newLimit;
	}

}
