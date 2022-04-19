const Marketplace = artifacts.require("RedMarketplace");
const Token = artifacts.require("Red");
const NFTContract = artifacts.require("RedNFT");

const chai = require("./setupchai.js");
const BN = web3.utils.BN;
const expect = chai.expect;

require("dotenv").config({ path: "../.env" });

contract("Marketplace Test", function (accounts) {
  const [deployerAccount, recipient, anotherAccount] = accounts;

  //   before(async () => {
  //     this.redMarketplace = await Marketplace.deployed(); //new(process.env.RED_TOKEN);
  //   });

  it(" #1 Make sure contract deployed correctly", async () => {
    this.redMarketplace = await Marketplace.deployed();
    let instance = await this.redMarketplace;
    let contractAddress = instance.address;
    console.log(contractAddress.toString());
    expect(instance.address).not.equal(undefined);
  });

  it("#2 should list token lisitngs", async () => {
    this.redMarketplace = await Marketplace.deployed();
    let instance = this.redMarketplace;
    let nftInstance = await NFTContract.deployed();
    let balanceRecipient = await nftInstance.balanceOf(recipient);
    console.log(
      balanceRecipient.toString() + " this is balance of Recipient before Mint"
    );
    let redInstance = await Token.deployed();
    let askingPrice = 10;
    let NFT = await expect(
      nftInstance.safeMint(recipient, "www.redeyedcollection.com/")
    ).to.eventually.be.fulfilled;
    let nftTokenId = NFT.logs[0].args.tokenId.toString();
    let nftAddress = NFT.logs[0].address.toString();
    let balanceRecipient1 = await nftInstance.balanceOf(recipient);

    console.log(nftTokenId + " This is the Token ID");
    console.log(nftAddress + " This is the NFT address");
    console.log(nftInstance.address);

    console.log(
      balanceRecipient1.toString() + " this is balance of Recipient1 after Mint"
    );
    let listedItem = await expect(
      instance.listItem(nftTokenId, nftAddress, askingPrice, true, recipient, {
        from: recipient,
      })
    ).to.eventually.be.fulfilled;
  });

  it("#3 should update asking price", async () => {
    this.redMarketplace = await Marketplace.deployed();
    let instance = this.redMarketplace;
    let nftInstance = await NFTContract.deployed();
    let balanceRecipient = await nftInstance.balanceOf(recipient);
    console.log(
      balanceRecipient.toString() + " this is balance of Recipient before Mint"
    );
    let askingPrice = 10;
    let NFT = await expect(
      nftInstance.safeMint(recipient, "www.redeyedcollection.com/")
    ).to.eventually.be.fulfilled;
    let nftTokenId = NFT.logs[0].args.tokenId.toString();
    let nftAddress = NFT.logs[0].address.toString();
    let balanceRecipient1 = await nftInstance.balanceOf(recipient);

    console.log(nftTokenId + " This is the Token ID");
    console.log(nftAddress + " This is the NFT address");
    console.log(nftInstance.address);

    console.log(
      balanceRecipient1.toString() + " this is balance of Recipient1 after Mint"
    );
    let listedItem = await expect(
      instance.listItem(nftTokenId, nftAddress, askingPrice, true, recipient, {
        from: recipient,
      })
    ).to.eventually.be.fulfilled;
    let item = listedItem.logs[0].args.item;
    expect(item.askingPrice).to.be.equal("10");

    await instance.updateAskingPrice(item.itemId, 20, { from: recipient });

    item = listedItem.logs[0].args.item;
    let updatedItem = await instance.getListingById(item.itemId);

    expect(updatedItem.askingPrice).to.be.equal("20");
  });

  it("#4 it is possible to make an offer", async () => {
    let instance = this.redMarketplace;
    let balanceOfDeployer = await instance.balanceOf(deployerAccount);

    expect(instance.transfer(recipient, new BN(balanceOfDeployer + 1))).to
      .eventually.be.rejected;

    expect(
      instance.balanceOf(deployerAccount)
    ).to.eventually.be.a.bignumber.equal(balanceOfDeployer);
  });

  // it('#4 it is possible to cancel offer', async () => {
  // 	let instance = this.myToken;
  // 	await expect(instance.increaseAllowance(recipient, 1000000000, { from: deployerAccount })).to.eventually.be
  // 		.fulfilled;
  // 	let allowances = await instance.allowance.call(deployerAccount, recipient);
  // 	return console.log(allowances.toString());
  // });

  // it('#5 it is possible to buy directly', async () => {
  // 	const sendTokens = 1000000000;
  // 	let instance = this.myToken;
  // 	let balanceR = await instance.balanceOf(recipient);
  // 	console.log(balanceR.toString());
  // 	let totalSupply = await instance.totalSupply();
  // 	expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(totalSupply);
  // 	await expect(instance.transfer(recipient, sendTokens)).to.eventually.be.fulfilled;
  // 	let balanceRA = await instance.balanceOf(recipient);
  // 	console.log(balanceRA.toString());
  // 	expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(
  // 		totalSupply.sub(new BN(sendTokens)),
  // 	);
  // 	expect(instance.balanceOf(recipient)).to.eventually.be.a.bignumber.equal(new BN(sendTokens));
  // });

  // it('#6 it is possible to update listing price', async () => {
  // 	const sendTokens = 1000000000;
  // 	let instance = this.myToken;
  // 	let balanceR = await instance.balanceOf(recipient);
  // 	console.log(balanceR.toString());
  // 	let totalSupply = await instance.totalSupply();
  // 	expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(totalSupply);
  // 	await expect(instance.transfer(recipient, sendTokens)).to.eventually.be.fulfilled;
  // 	let balanceRA = await instance.balanceOf(recipient);
  // 	console.log(balanceRA.toString());
  // 	expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(
  // 		totalSupply.sub(new BN(sendTokens)),
  // 	);
  // 	expect(instance.balanceOf(recipient)).to.eventually.be.a.bignumber.equal(new BN(sendTokens));
  // });
});
