var MyToken = artifacts.require('./Red.sol');
require('dotenv').config({ path: '../.env' });
const BN = web3.utils.BN;

module.exports = async function (deployer) {
	await deployer.deploy(MyToken, process.env.INITIAL_TOKENS);
	let instance = await MyToken.deployed();
};
