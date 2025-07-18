# zerok

A decentralized gambling application,
built using Solidity smart contracts.  

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
