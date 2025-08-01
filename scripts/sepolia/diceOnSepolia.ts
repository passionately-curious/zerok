import "@nomiclabs/hardhat-ethers";
import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
	const KYBIT_ADDRESS = process.env.KYBIT_ADDRESS!;
	const VRF_COORDINATOR = process.env.VRF_COORDINATOR!;
	const KEY_HASH = process.env.KEY_HASH!;
	const SUBSCRIPTION_ID = BigInt(process.env.CHAINLINK_SUB_ID!);

	const Dice = await ethers.getContractFactory("Dice");
	const dice = await Dice.deploy(
		KYBIT_ADDRESS,
		SUBSCRIPTION_ID,
		VRF_COORDINATOR,
		KEY_HASH
	);
	const diceAddress = await dice.getAddress();

	console.log("Dice contract address:", diceAddress);
}

main();
