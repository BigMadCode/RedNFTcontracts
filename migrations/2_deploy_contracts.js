var Red = artifacts.require('./Red.sol');
var RedNFT = artifacts.require('./RedNFT.sol');
var RedMarketplace = artifacts.require('./RedMarketplace.sol');
var RedGovernance = artifacts.require('./RedGovernance.sol');
require('dotenv').config({ path: '../.env' });
// const BN = web3.utils.BN;

module.exports = async function (deployer) {
	deployer.deploy(Red, process.env.INITIAL_TOKENS).then(instanceRed => {
		console.log(instanceRed);
		return deployer.deploy(RedNFT).then(instanceRedNFT => {
			console.log(instanceRedNFT);
			return (
				deployer.deploy(RedMarketplace, instanceRed.address) &&
				deployer.deploy(RedGovernance, instanceRed.address)
			);
		});
	});
	// let instance = await MyToken.deployed();
};
