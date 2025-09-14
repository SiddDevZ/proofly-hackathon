const { ethers } = require("hardhat");

async function main() {
  const CredentialRegistry = await ethers.getContractFactory("CredentialRegistry");
  const credentialRegistry = await CredentialRegistry.deploy();

  await credentialRegistry.deployed();

  console.log("CredentialRegistry deployed to:", credentialRegistry.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 