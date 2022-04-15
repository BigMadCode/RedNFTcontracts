const RedNFT = artifacts.require('RedNFT');
//const RedMarketplace = artifacts.require('RedMarketplace');

const chai = require('./setupchai.js');
const BN = web3.utils.BN;
const expect = chai.expect;

require('dotenv').config({ path: '../.env' });

contract('RedNFT Test', function (accounts) {
	const [deployerAccount, recipient, anotherAccount] = accounts;

	// beforeEach(async () => {
	// 	this.RedNFT = await RedNFT.new();
	// });

	it(' #1 Make sure the contract deployed properly', async () => {
		let instance = await RedNFT.deployed();
		let name = await instance.name();
		let symbol = await instance.symbol();
		//let uri = await instance.tokenURI();
		console.log(name);
		console.log(symbol);
		//console.log(uri.toString());
		//expect(instance.balanceOf(recipient)).to.eventually.be.a.bignumber.equal(new BN(1));
	});

	it('#2 Tokens should be properly minted to user account', async () => {
		let instance = await RedNFT.deployed();
		let balance = await instance.balanceOf(recipient);
		await expect(instance.safeMint(recipient, 'www.redeyedcollection.com/')).to.eventually.be.fulfilled;
		expect(instance.balanceOf(recipient)).to.eventually.be.a.bignumber.equal(balance + 1);
	});

	it('#3 it is not possible to send tokens that do not exist', async () => {
		let instance = await RedNFT.deployed();
		let balanceOfDeployer = await instance.balanceOf(deployerAccount);

		expect(instance.safeTransferFrom(recipient, deployerAccount, new BN(1), { from: recipient })).to.eventually.be
			.rejected;

		expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(balanceOfDeployer);
		console.log(balanceOfDeployer.toString());
	});

	it('#4 is possible to set approval', async () => {
		let instance = await RedNFT.deployed();
		await expect(instance.safeMint(recipient, 'www.redeyedcollection.com/')).to.eventually.be.fulfilled;
		expect(instance.approve(deployerAccount, 1, { from: recipient })).to.eventually.be.fulfilled;
		console.log(deployerAccount.toString());
		let approvals = await instance.getApproved(1);
		console.log(approvals.toString());
	});

	it('#5 is possible to send tokens between accounts', async () => {
		let instance = await RedNFT.deployed();
		let balanceR = await instance.balanceOf(recipient);

		await expect(instance.safeMint(recipient, 'www.redeyedcollection.com/')).to.eventually.be.fulfilled;
		//console.log(balanceR.toString());
		await expect(instance.safeTransferFrom(recipient, deployerAccount, 0, { from: recipient })).to.eventually.be
			.fulfilled;
		let balanceRA = await instance.balanceOf(recipient);
		return console.log(balanceRA.toString());
		//return expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(new BN(sendTokens));
	});
});
