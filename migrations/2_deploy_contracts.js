var RedNFT = artifacts.require("./RedNFT.sol");
// require('dotenv').config({ path: '../.env' });
// const BN = web3.utils.BN;

module.exports = async function (deployer) {
  deployer.deploy(RedNFT);
  // let instance = await MyToken.deployed();
};
