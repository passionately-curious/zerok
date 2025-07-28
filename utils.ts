import "@nomiclabs/hardhat-ethers";
import { ethers } from "hardhat";
import { Contract } from "ethers";

// deploy vrf mock and return address
async function deployVrfMock(): Contract {
	const VRFCoordinatorMock = await ethers.getContractFactory("VRFCoordinatorV2_5Mock");
	const vrfCoordinator = await VRFCoordinatorMock.deploy(
		ethers.parseEther("0.1"),
		ethers.parseUnits("1", "gwei"),
		ethers.parseUnits("0.003", "ether")
	);

	return vrfCoordinator;
}

// create subscription and return subId
async function createSub(vrfCoordinator) {
	const tx = await vrfCoordinator.createSubscription();
	const receipt = await tx.wait();

	const logs = receipt.logs
		.map(log => {
			return vrfCoordinator.interface.parseLog(log);
		})
		.filter(log => log && log.name === "SubscriptionCreated");

	const subId = logs[0].args.subId;

	return subId;
}

// fund subscription
async function fundSub(vrfCoordinator, subId) {
	const amount = ethers.parseUnits("100", 18);
	const tx = await vrfCoordinator.fundSubscription(subId, amount);
	await tx.wait();
}

// add consumer
async function addConsumer(vrfCoordinator, subId, consumerContractAddress) {
	const tx = await vrfCoordinator.addConsumer(subId, consumerContractAddress);
	await tx.wait();
}

// automate callback
async function listenCallback(vrfCoordinator) {
	vrfCoordinator.on("RandomWordsRequested", async function(keyHash, requestId, preSeed, subId, minimumRequestConfirmations, callbackGasLimit, numWords, extraArgs, sender) {
		const tx = await vrfCoordinator.fulfillRandomWords(requestId, sender);
		await tx.wait();
	});
}

export { deployVrfMock, createSub, fundSub, addConsumer, listenCallback };
