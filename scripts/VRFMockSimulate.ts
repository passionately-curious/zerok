import "@nomiclabs/hardhat-ethers";
import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

// get coordinator and consumer addresses
const COORDINATOR_ADDRESS = process.env.COORDINATOR_ADDRESS!;
console.log(COORDINATOR_ADDRESS);

async function main() {
	const [deployer] = await ethers.getSigners();
	const coordinator = await ethers.getContractAt("VRFCoordinatorV2_5Mock", COORDINATOR_ADDRESS, deployer);

	console.log("Listening for RandomWordsRequested");

//		coordinator.on("RandomWordsRequested", (keyHash, requestId, preSeed, subId, minimumRequestConfirmations, callbackGasLimit, numWords, extraArgs, sender) => {
//	  console.log({
//		keyHash,
//		requestId,
//		preSeed,
//		subId,
//		minimumRequestConfirmations,
//		callbackGasLimit,
//		numWords,
//		extraArgs,
//		sender
//	  });
//	});

	coordinator.on("RandomWordsRequested", async function(keyHash, requestId, preSeed, subId, minimumRequestConfirmations, callbackGasLimit, numWords, extraArgs, sender) {
		console.log(`Detected request: ID=${requestId}`);

		const tx = await coordinator.fulfillRandomWords(requestId, sender);
		await tx.wait();
		console.log(`fulfillRandomWords compolete for request ID ${requestId}`);
	});
}

main().catch(console.error);
