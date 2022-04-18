const Marketplace = artifacts.require("RedMarketplace");
const Token = artifacts.require("Red");
const NFTContract = artifacts.require("RedNFT");

const chai = require("./setupchai.js");
const BN = web3.utils.BN;
const expect = chai.expect;

require("dotenv").config({ path: "../.env" });

contract("Marketplace Test", function (accounts) {
  const [deployerAccount, recipient, anotherAccount] = accounts;

  beforeEach(async () => {
    this.redMarketplace = await Marketplace.deployed(123); //new(process.env.RED_TOKEN);
  });

  it(" #1 Make sure contract deployed correctly", async () => {
    let instance = await this.redMarketplace;
    expect(instance.address).not.equal(undefined);
  });

  it("#2 should list token lisitngs", async () => {
    let instance = this.redMarketplace;
    let nftInstance = await NFTContract.deployed();
    let redInstance = await Token.deployed();
    let askingPrice = 10;
    let NFT = expect(
      nftInstance.safeMint(recipient, "www.redeyedcollection.com/")
    ).to.eventually.be.fulfilled;
    expect(
      instance.listItem(
        NFT.tokenId,
        NFT.address,
        askingPrice,
        1,
        recipient.address
      )
    ).to.eventually.be.fulfilled;
  });

  // 	it('#3 it is possible to make an offer', async () => {
  // 		let instance = this.redMarketplace;
  // 		let balanceOfDeployer = await instance.balanceOf(deployerAccount);

  // 		expect(instance.transfer(recipient, new BN(balanceOfDeployer + 1))).to.eventually.be.rejected;

  // 		expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(balanceOfDeployer);
  // 	});

  // 	it('#4 it is possible to cancel offer', async () => {
  // 		let instance = this.myToken;
  // 		await expect(instance.increaseAllowance(recipient, 1000000000, { from: deployerAccount })).to.eventually.be
  // 			.fulfilled;
  // 		let allowances = await instance.allowance.call(deployerAccount, recipient);
  // 		return console.log(allowances.toString());
  // 	});

  // 	it('#5 it is possible to buy directly', async () => {
  // 		const sendTokens = 1000000000;
  // 		let instance = this.myToken;
  // 		let balanceR = await instance.balanceOf(recipient);
  // 		console.log(balanceR.toString());
  // 		let totalSupply = await instance.totalSupply();
  // 		expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(totalSupply);
  // 		await expect(instance.transfer(recipient, sendTokens)).to.eventually.be.fulfilled;
  // 		let balanceRA = await instance.balanceOf(recipient);
  // 		console.log(balanceRA.toString());
  // 		expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(
  // 			totalSupply.sub(new BN(sendTokens)),
  // 		);
  // 		expect(instance.balanceOf(recipient)).to.eventually.be.a.bignumber.equal(new BN(sendTokens));
  // 	});

  // 	it('#6 it is possible to update listing price', async () => {
  // 		const sendTokens = 1000000000;
  // 		let instance = this.myToken;
  // 		let balanceR = await instance.balanceOf(recipient);
  // 		console.log(balanceR.toString());
  // 		let totalSupply = await instance.totalSupply();
  // 		expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(totalSupply);
  // 		await expect(instance.transfer(recipient, sendTokens)).to.eventually.be.fulfilled;
  // 		let balanceRA = await instance.balanceOf(recipient);
  // 		console.log(balanceRA.toString());
  // 		expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(
  // 			totalSupply.sub(new BN(sendTokens)),
  // 		);
  // 		expect(instance.balanceOf(recipient)).to.eventually.be.a.bignumber.equal(new BN(sendTokens));
  // 	});
});
