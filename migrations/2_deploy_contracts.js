var RedNFT = artifacts.require('./RedNFT.sol');
var RedMarketplace = artifacts.require('./RedMarketplace.sol');
require('dotenv').config({ path: '../.env' });
// const BN = web3.utils.BN;

module.exports = async function (deployer) {
	await deployer.deploy(RedNFT);
	await deployer.deploy(RedMarketplace, process.env.RED_TOKEN);
	// let instance = await MyToken.deployed();
};
