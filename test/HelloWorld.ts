import "@nomiclabs/hardhat-ethers";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { expect } from "chai";

describe("HelloWorld", function () {
	let hello: Contract;

	before(async function () {
		const HelloWorld = await ethers.getContractFactory("HelloWorld");
		hello = await HelloWorld.deploy();
	});

	it("should say hi", async function () {
		const message = await hello.hello();
		expect(message).to.equal("Hello, World!");
	});
})
