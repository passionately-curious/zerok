import "@nomiclabs/hardhat-ethers";
import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

const CONSUMER_ADDRESS = process.env.CONSUMER_ADDRESS!;
console.log(CONSUMER_ADDRESS);

async function main() {
	const [deployer] = await ethers.getSigners();
	const random = await ethers.getContractAt("Random", CONSUMER_ADDRESS, deployer);

	const tx = await random.request();
	const receipt = await tx.wait();

	const event = receipt.logs.find(log => log.fragment?.name === "requested");
	const requestId = event.args[0];
	console.log(requestId);

	random.on("generated", function(randomWord) {
		console.log(randomWord);
		console.log(randomWord % 2);
	})
}

main().catch(console.error);
