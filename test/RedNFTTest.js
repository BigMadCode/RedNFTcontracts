const RedNFT = artifacts.require('RedNFT');
//const RedMarketplace = artifacts.require('RedMarketplace');

const chai = require('./setupchai.js');
const BN = web3.utils.BN;
const expect = chai.expect;

require('dotenv').config({ path: '../.env' });

contract('RedNFT Test', function (accounts) {
	const [deployerAccount, recipient, anotherAccount] = accounts;

	beforeEach(async () => {
		this.RedNFT = await RedNFT.new();
	});

	it(' #1 Make sure the contract deployed properly', async () => {
		let instance = this.RedNFT;
		let name = await instance.name();
		let symbol = await instance.symbol();
		let uri = await instance.tokenURI();
		console.log(name.toString());
		console.log(symbol.toString());
		console.log(uri.toString());
		expect(instance.balanceOf(recipient)).to.eventually.be.a.bignumber.equal(1);
	});

	it('#2 Tokens should be properly minted to user account', async () => {
		let instance = this.RedNFT;
		let balance = await instance.balanceOf(recipient);
		await expect(instance.safeMint(recipient, 'www.redeyedcollection.com/')).to.eventually.be.fulfilled;
		let uri = await instance.tokenURI(1);
		console.log(uri);
		expect(instance.balanceOf(recipient)).to.eventually.be.a.bignumber.equal(balance + 1);
	});

	it('#3 it is not possible to send tokens that do not exist', async () => {
		let instance = this.RedNFT;
		let balanceOfDeployer = await instance.balanceOf(deployerAccount);

		expect(instance.safeTransferFrom(deployerAccount, recipient, new BN(1))).to.eventually.be.rejected;

		expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(balanceOfDeployer);
	});

	it('#4 is possible to set approval', async () => {
		let instance = this.RedNFT;
		await expect(instance.approve(deployerAccount, 1, { from: recipient })).to.eventually.be.fulfilled;
		let approvals = await instance.getApproved.call(deployerAccount, recipient);
		return console.log(approvals.toString());
	});

	it('#5 is possible to send tokens between accounts', async () => {
		const sendTokens = 1;
		let instance = this.RedNFT;
		let balanceR = await instance.balanceOf(recipient);

		await expect(instance.safeMint(recipient, 'www.redeyedcollection.com/')).to.eventually.be.fulfilled;
		console.log(balanceR.toString());
		await expect(instance.safeTransferFrom(recipient, deployerAccount, sendTokens)).to.eventually.be.fulfilled;
		let balanceRA = await instance.balanceOf(recipient);
		console.log(balanceRA.toString());
		expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(
			recipient.sub(new BN(sendTokens)),
		);
		expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(new BN(sendTokens));
	});
});
