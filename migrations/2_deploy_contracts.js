var RedNFT = artifacts.require("./RedNFT.sol");
var RedMarketplace = artifacts.require("./RedMarketplace.sol");
// require('dotenv').config({ path: '../.env' });
// const BN = web3.utils.BN;

module.exports = async function (deployer) {
  deployer.deploy(RedNFT);
  deployer.deploy(RedMarketplace);
  // let instance = await MyToken.deployed();
};
