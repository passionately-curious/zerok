import "@nomiclabs/hardhat-ethers";
import { ethers } from "hardhat";

async function main() {
	const [deployer] = await ethers.getSigners();
	console.log("Deploying contracts with account:",  deployer.address);

	const contractName = "HelloWorld";
	const HelloWorld = await ethers.getContractFactory(contractName);
	const hello = await HelloWorld.deploy();

	console.log(`${contractName} deployed to:`, await hello.getAddress());
}

main().catch(function(error) {
	console.error(error);
	process.exitCode = 1;
});
