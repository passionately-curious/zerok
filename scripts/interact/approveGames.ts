import "@nomiclabs/hardhat-ethers";
import { ethers } from "hardhat";
import Kybit from "../../artifacts/contracts/GameToken.sol/Kybit.json";
import { JsonRpcProvider } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();


async function main() {
	const KYBIT_ADDRESS = process.env.KYBIT_ADDRESS!;
	const COINTOSS_ADDRESS = process.env.COINTOSS_ADDRESS!;
	const DICE_ADDRESS = process.env.DICE_ADDRESS!;

	const [signer] = await ethers.getSigners();

	const kybit = new ethers.Contract(KYBIT_ADDRESS, Kybit.abi, signer);

	const value = ethers.parseUnits("10000", 18);

	const tx1 = await kybit.allowSpending(COINTOSS_ADDRESS, value);
	console.log("Transaction sent:", tx1.hash);
	const receipt1 = await tx1.wait();
	console.log("Transaction confirmed in block:", receipt1.blockNumber);

	const tx2 = await kybit.allowSpending(DICE_ADDRESS, value);
	console.log("Transaction sent:", tx2.hash);
	const receipt2 = await tx2.wait();
	console.log("Transaction confirmed in block:", receipt2.blockNumber);
}

main();
