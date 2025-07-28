# zerok

A decentralized gambling application,
built using Solidity smart contracts.  

## Kybit Token(KYB)

**Kybit** is a native token for **zerok** decentralized gambling application.  
It is implemented as as ERC-20 token,
ensuring compatibility and ease of integration
across the Ethereum ecosystem.  

### Why Kyber?

**Ky** - a reference to **Kyber**, a post-quantum cryptographic algorithm,
included as a subtle but intentional reminder:
> We must prepare for a post-quantum future.

## What does the project use?

- hardhat - contract development and testing  
- chainlink - oracle for VRF  
- webpack - for the frontend  

## deploy scripts

- [VRFMock](./scripts/VRFMock.ts) - script to automate callback function for local testing.
-

## test scripts

- [Random](./test/Random.ts) - testing local VRF mock contract setup.
-

## Project setup

1. Clone the repository.  
2. Install the dependencies.  

## Deploying in a local network

1. Run a local node using hardhat.
2. Use the deploy script.

```bash
yarn hardhat run scripts/your-deploy-script --network localhost
```

## Running a local hardhat node

```bash
yarn hardhat node
```

## Changes to be made

- [ ] claim -> sell kybit in exchange for testeth
- [ ] distribute kybit: Kybit contract -> other game contracts (or) mint tokens
- [ ] stake amount to be variable with some constraints
