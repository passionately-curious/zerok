import "@nomiclabs/hardhat-ethers";
import { ethers } from "hardhat";

async function main() {
	// deploy VRF mock
	const VRFCoordinatorMock = await ethers.getContractFactory("VRFCoordinatorV2_5Mock");
	const vrfCoordinator = await VRFCoordinatorMock.deploy(
		ethers.parseEther("0.1"),
		ethers.parseUnits("1", "gwei"),
		ethers.parseUnits("0.003", "ether")
	);
	const vrfCoordinatorAddress = await vrfCoordinator.getAddress();
	console.log("VRF coordinator address:", vrfCoordinatorAddress);

	// create subscription
	const createSubTx = await vrfCoordinator.createSubscription();
	const createSubReceipt = await createSubTx.wait();

	const logs = createSubReceipt.logs
		.map(log => {
			return vrfCoordinator.interface.parseLog(log);
		})
		.filter(log => log && log.name === "SubscriptionCreated");

	const subId = logs[0].args.subId;

	// fund subscription
	const amount = ethers.parseUnits("100", 18);
	const fundSubTx = await vrfCoordinator.fundSubscription(subId, amount);
	await fundSubTx.wait();

	// deploy consumer contract
	const keyHash = "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae";

	const Random = await ethers.getContractFactory("Random");
	const random = await Random.deploy(subId, vrfCoordinatorAddress, keyHash);

	const consumerContractAddress = await random.getAddress();
	console.log("Consumer Contract address:", consumerContractAddress);

	// add consumer
	const addConsumerTx = await vrfCoordinator.addConsumer(subId, consumerContractAddress);
	await addConsumerTx.wait();
}

main().catch(function(error) {
	console.error(error);
	process.exit(1);
})
