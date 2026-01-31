const hre = require("hardhat");

async function main() {
  const TouristID = await hre.ethers.getContractFactory("TouristID");
  const touristID = await TouristID.deploy();

  await touristID.waitForDeployment();

  console.log("TouristID deployed to:", await touristID.getAddress());
  
  // Save contract address for frontend use
  const fs = require('fs');
  const contractInfo = {
    address: await touristID.getAddress(),
    network: hre.network.name,
    timestamp: new Date().toISOString()
  };
  
  fs.writeFileSync('./contract-address.json', JSON.stringify(contractInfo, null, 2));
  console.log("Contract address saved to contract-address.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
