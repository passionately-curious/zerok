import "@nomiclabs/hardhat-ethers";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { expect } from "chai";

describe("Random", function() {
	let random: Contract;
	let vrfCoordinator: Contract;
	let vrfCoordinatorAddress;
	let subId;
	let consumerContractAddress;
	let requestId;

	// deploy vrfCoordinatorMock
	it("should be deployed with a proper address", async function() {
		const baseFee = ethers.parseEther("0.1");
		const gasPriceLink = ethers.parseUnits("1", "gwei");
		const weiPerUnitLink = ethers.parseUnits("0.003", "ether");

		const VRFCoordinatorMock = await ethers.getContractFactory("VRFCoordinatorV2_5Mock");
		vrfCoordinator = await VRFCoordinatorMock.deploy(
			baseFee,
			gasPriceLink,
			weiPerUnitLink
		);
		vrfCoordinatorAddress = await vrfCoordinator.getAddress();
		expect(vrfCoordinatorAddress).to.be.properAddress;
	});
	
	// create subscription
	it("should create subscription and emit SubscriptionCreated", async function() {
		const tx = await vrfCoordinator.createSubscription();
		const receipt = await tx.wait();

		const logs = receipt.logs
			.map(log => {
				return vrfCoordinator.interface.parseLog(log);
			})
			.filter(log => log && log.name === "SubscriptionCreated");

		// createSubscription is called only once
		expect(logs.length).to.equal(1);

		subId = logs[0].args.subId;
		let owner = logs[0].args.owner;

		expect(subId).to.not.be.undefined;
		expect(subId).to.be.a("bigint");

		const [signer] = await ethers.getSigners();
		const address = await signer.getAddress();
		expect(owner).to.equal(address);
		
	});

	// fund subscription
	it("should fund subscription", async function() {
		const amount = ethers.parseUnits("100", 18);

		const tx = await vrfCoordinator.fundSubscription(subId, amount);
		const receipt = await tx.wait();

		const logs = receipt.logs
			.map(log => {
				return vrfCoordinator.interface.parseLog(log);
			})
			.filter(log => log && log.name === "SubscriptionFunded");

		// funded only once in this mock contract
		expect(logs.length).to.equal(1);

		const [ subIdEvent, oldBalance, currBalance ] = logs[0].args;

		expect(subIdEvent).to.equal(subId);
		expect(oldBalance).to.equal(0);
		expect(currBalance).to.equal(amount);
	});



	// deploy consumer contract(Random contract)
	it("should deploy Random contract", async function() {
		// some random value
		const keyHash = "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae";

		const Random = await ethers.getContractFactory("Random");
		random = await Random.deploy(subId, vrfCoordinatorAddress, keyHash);

		consumerContractAddress = await random.getAddress();
		expect(consumerContractAddress).to.be.properAddress;
	});
	


	// add consumer
	it("should add consumer", async function() {
		const tx =  await vrfCoordinator.addConsumer(subId, consumerContractAddress);
		const receipt = await tx.wait();

	});

	// call requestRandomWrods
	it("should request randomness", async function() {
		const tx = await random.request();
		const receipt = await tx.wait();

		const event = receipt.logs.find(log => log.fragment?.name === "requested");

		requestId = event.args[0];
	});

	// simulate VRFcoordinator by calling fulfillRandomWords
	it("should call fulfillRandomWords function", async function() {
		const tx = await vrfCoordinator.fulfillRandomWords(requestId, consumerContractAddress);
		await tx.wait();
	});

	// listen for the generated event
	it("should listen and print random number", async function() {
		// setup a listener in frontend instead of querying logs
		const filter = random.filters.generated();
		const events = await random.queryFilter(filter);
		const randomWord = events[0].args[0];
		console.log(randomWord);
	});

})
