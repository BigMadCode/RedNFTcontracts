var RedNFT = artifacts.require('./RedNFT.sol');
var RedMarketplace = artifacts.require('./RedMarketplace.sol');

module.exports = async function (deployer) {
	deployer.deploy(RedMarketplace, '0xD708177C3BedC862BAdf69d63a5BCD7E3Dc993bE').then(instanceMP => {
		console.log('Marketplace address ' + instanceMP.address);
		return deployer.deploy(RedNFT, instanceMP.address);
	});
};
