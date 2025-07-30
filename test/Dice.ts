import "@nomiclabs/hardhat-ethers";
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";
import { expect } from "chai";
import { deployVrfMock, createSub, fundSub, addConsumer, listenCallback } from "../utils.ts";

describe("Dice", async function() {
	let dice: Contract;
	let vrfMock: Contract;
	let kybit: Contract;
	let owner: Signer;
	let addr1: Signer;
	let addr2: Signer;
	let decimals;
	let stakeAmount;
	let diceAddress;
	let kybitAddress;
	let allowedValue;

	before(async function() {
		[owner, addr1, addr2] = await ethers.getSigners();

		// deploy vrfCoordinator mock
		vrfMock = await deployVrfMock();
		const vrfCoordinatorAddress = await vrfMock.getAddress();

		// create subscription
		const subId = await createSub(vrfMock);

		// fund subscription
		await fundSub(vrfMock, subId);

		// deploy Game token
		const Kybit = await ethers.getContractFactory("Kybit");
		kybit = await Kybit.deploy(await owner.getAddress());
		kybitAddress = await kybit.getAddress();
		decimals = await kybit.decimals();

		// deploy consumer
		const keyHash = "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae";
		const Dice = await ethers.getContractFactory("Dice");
		dice = await Dice.deploy(kybitAddress, subId, vrfCoordinatorAddress, keyHash);
		diceAddress = await dice.getAddress();

		// add consumer
		await addConsumer(vrfMock, subId, diceAddress);

		// add a listener to automate fulfillRandomWords
		listenCallback(vrfMock);

		const ownerKybit = kybit.connect(owner);

		allowedValue = ethers.parseUnits("10000", decimals);
		const tx = await ownerKybit.allowSpending(diceAddress, allowedValue);
		await tx.wait();
	});

	it("should check spending allowance given to Dice contract", async function() {
		const allowance = await kybit.allowance(kybitAddress, diceAddress);
		expect(allowance).to.equal(allowedValue);
	});

	it("should have enough balance and staking should be possible", async function() {
		const addr1Address = await addr1.getAddress();

		const kybitAddr1 = kybit.connect(addr1);
		await kybitAddr1.claim();

		const diceAddr1 = dice.connect(addr1);

		const game1 = new Promise(function(resolve) {
			dice.on("Fulfilled", async function(win) {
				const currBalance = await kybit.balanceOf(addr1Address);
				if(win) {
					expect(currBalance).to.be.greaterThan(prevBalance);
				}
				else {
					expect(currBalance).to.be.lessThan(prevBalance);
				}
				
				resolve();
			});
		});

		stakeAmount = ethers.parseUnits("10", decimals);
		await kybitAddr1.approve(diceAddress, stakeAmount);
		const prevBalance = await kybit.balanceOf(addr1Address);
		await diceAddr1.stake(60, stakeAmount);

		await game1;
	});
});
