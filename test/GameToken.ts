import "@nomiclabs/hardhat-ethers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { Contract, Signer } from "ethers";

describe("Kybit", async function() {
	let kybit: Contract;
	let owner: Signer;
	let addr1: Signer;
	let addr2: Signer;
	let decimals;

	beforeEach(async function() {
		[owner, addr1, addr2] = await ethers.getSigners();

		const Kybit = await ethers.getContractFactory("Kybit");
		kybit = await Kybit.deploy(await owner.getAddress());
		decimals = await kybit.decimals();
	});

	it("should check owner's balance", async function() {
		const balance = await kybit.balanceOf(await owner.getAddress());
		expect(balance).to.equal(ethers.parseUnits("30000", decimals));
	});

	it("should allow owner to mint tokens", async function() {
		const addr1Address = await addr1.getAddress();
		const tx = await kybit.mint(addr1Address, ethers.parseUnits("100", decimals));
		await tx.wait();

		const balance = await kybit.balanceOf(addr1Address);
		expect(balance).to.equal(ethers.parseUnits("100", decimals));
	});

	it("should not allow non-owner to mint", async function() {
		const kybitAddr1 = kybit.connect(addr1);
		const addr1Address = await addr1.getAddress();

		await expect(
			kybitAddr1.mint(addr1Address, ethers.parseUnits("100", decimals))
		).to.be.reverted;
	});

	it("should allow to claim only once", async function() {
		const kybitAddr1 = kybit.connect(addr1);
		const addr1Address = await addr1.getAddress();

		const tx = await kybitAddr1.claim();
		await tx.wait();

		const balance = await kybitAddr1.balanceOf(addr1Address);
		expect(balance).to.equal(ethers.parseUnits("100", decimals));

		await expect(
			kybitAddr1.claim()
		).to.be.reverted;
	});

	it("should allow only owner to update claimAmount", async function() {
		const newClaimAmount = ethers.parseUnits("200", decimals);
		const tx = await kybit.setClaimAmount(newClaimAmount);
		await tx.wait();

		const claimAmount = await kybit.claimAmount();
		expect(claimAmount).to.equal(newClaimAmount)

		const kybitAddr1 = kybit.connect(addr1);
		await expect(
			kybitAddr1.setClaimAmount(newClaimAmount)
		).to.be.reverted;
	});

	it("should transfer 10 tokens to addr1", async function() {
		const addr1Address = await addr1.getAddress();
		const tx = await kybit.transfer(addr1Address, ethers.parseUnits("10", decimals));
		await tx.wait();
		
		expect(await kybit.balanceOf(addr1Address)).to.equal(ethers.parseUnits("10", decimals));
	});

	it("should allow only owner to transfer tokens", async function() {
		const addr1Address = await addr1.getAddress();
		const kybitOwner = kybit.connect(owner);
		const value = ethers.parseUnits("100", decimals);

		const tx = await kybitOwner.distribute(addr1Address, value);
		await tx.wait();
		
		expect(await kybit.balanceOf(addr1Address)).to.equal(value);

		const kybitAddr1 = kybit.connect(addr1);
		await expect(
			kybitAddr1.distribute(addr1Address, value)
		).to.be.reverted;
	});
});
