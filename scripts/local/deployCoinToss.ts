import "@nomiclabs/hardhat-ethers";
import { ethers } from "hardhat";
import { deployVrfMock, createSub, fundSub, addConsumer, listenCallback } from "../utils.ts";

async function main() {
	const [owner] = await ethers.getSigners();

	// deploy vrfCoordinator mock
	const vrfMock = await deployVrfMock();
	const vrfCoordinatorAddress = await vrfMock.getAddress();

	// create subscription
	const subId = await createSub(vrfMock);

	// fund subscription
	await fundSub(vrfMock, subId);

	// deploy Game token
	const Kybit = await ethers.getContractFactory("Kybit");
	const kybit = await Kybit.deploy(await owner.getAddress());
	const kybitAddress = await kybit.getAddress();
	const decimals = await kybit.decimals();

	// deploy consumer
	const keyHash = "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae";
	const CoinToss = await ethers.getContractFactory("CoinToss");
	const coinToss = await CoinToss.deploy(kybitAddress, subId, vrfCoordinatorAddress, keyHash);
	const coinTossAddress = await coinToss.getAddress();

	console.log("CoinToss contract address:", coinTossAddress);
	console.log("Kybit contract address:", kybitAddress);

	// add consumer
	await addConsumer(vrfMock, subId, coinTossAddress);

	// add a listener to automate fulfillRandomWords
	listenCallback(vrfMock);

	const ownerKybit = kybit.connect(owner);

	const allowedValue = ethers.parseUnits("10000", decimals);
	const tx = await ownerKybit.allowSpending(coinTossAddress, allowedValue);
	await tx.wait();
}

main();
