var Red = artifacts.require("./Red.sol");
var RedNFT = artifacts.require("./RedNFT.sol");
var RedMarketplace = artifacts.require("./RedMarketplace.sol");
var RedGovernance = artifacts.require("./RedGovernance.sol");
require("dotenv").config({ path: "../.env" });
// const BN = web3.utils.BN;

module.exports = async function (deployer) {
  deployer.deploy(Red, process.env.INITIAL_TOKENS).then((instanceRed) => {
    console.log("RED address " + instanceRed.address);
    return deployer
      .deploy(RedMarketplace, instanceRed.address)
      .then((instanceMP) => {
        console.log("Marketplace address " + instanceMP.address);
        return deployer.deploy(RedNFT, instanceMP.address);
      });
  });
};
