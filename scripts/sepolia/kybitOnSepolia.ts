import "@nomiclabs/hardhat-ethers";
import { ethers } from "hardhat";

async function main() {
	//deploy Game token
	const [deployer] = await ethers.getSigners();
	const ownerAddress = await deployer.getAddress();
	console.log("Deployer address:", ownerAddress);

	const Kybit = await ethers.getContractFactory("Kybit");
	const kybit = await Kybit.deploy(ownerAddress);
	const kybitAddress = await kybit.getAddress();

	console.log("Kybit contract address:", kybitAddress);
}

main();
