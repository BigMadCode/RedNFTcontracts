var RedNFT = artifacts.require("./RedNFT.sol");
var RedMarketplace = artifacts.require("./RedMarketplace.sol");

module.exports = async function (deployer) {
  deployer
    .deploy(RedMarketplace, "0x2D001A055B29504D6C029fd4f46470b18D74bd17")
    .then((instanceMP) => {
      console.log("Marketplace address " + instanceMP.address);
      return deployer.deploy(RedNFT, instanceMP.address);
    });
};
