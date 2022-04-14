const Marketplace = artifacts.require('RedMarketplace');
const Token = artifacts.require('Red');

const chai = require('./setupchai.js');
const BN = web3.utils.BN;
const expect = chai.expect;

require('dotenv').config({ path: '../.env' });

contract('Marketplace Test', function (accounts) {
	const [deployerAccount, recipient, anotherAccount] = accounts;

	beforeEach(async () => {
		this.redMarketplace = await Marketplace.new(process.env.RED_TOKEN);
	});

	it(' #1 Make sure this is  RED token', async () => {
		let instance = this.myToken;
		let totalSupply = await instance.totalSupply();
		let name = await instance.name();
		let symbol = await instance.symbol();
		let decimal = await instance.decimals();
		//let balance = await instance.balanceOf(accounts[0]);
		//assert.equal(balance.valueOf(), initialSupply.valueOf(), "The balance was not the same");
		console.log(totalSupply.toString());
		console.log(name.toString());
		console.log(symbol.toString());
		console.log(decimal.toString());
		expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(totalSupply);
	});

	it('all tokens should be in my account', async () => {
		let instance = this.myToken;
		let totalSupply = await instance.totalSupply();
		//let balance = await instance.balanceOf(accounts[0]);
		//assert.equal(balance.valueOf(), initialSupply.valueOf(), "The balance was not the same");
		expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(totalSupply);
	});

	it('is not possible to send more tokens than available in total', async () => {
		let instance = this.myToken;
		let balanceOfDeployer = await instance.balanceOf(deployerAccount);

		expect(instance.transfer(recipient, new BN(balanceOfDeployer + 1))).to.eventually.be.rejected;

		expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(balanceOfDeployer);
	});

	it('is possible to set allowances', async () => {
		let instance = this.myToken;
		await expect(instance.increaseAllowance(recipient, 1000000000, { from: deployerAccount })).to.eventually.be
			.fulfilled;
		let allowances = await instance.allowance.call(deployerAccount, recipient);
		return console.log(allowances.toString());
	});

	it('is possible to send tokens between accounts', async () => {
		const sendTokens = 1000000000;
		let instance = this.myToken;
		let balanceR = await instance.balanceOf(recipient);
		console.log(balanceR.toString());
		let totalSupply = await instance.totalSupply();
		expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(totalSupply);
		await expect(instance.transfer(recipient, sendTokens)).to.eventually.be.fulfilled;
		let balanceRA = await instance.balanceOf(recipient);
		console.log(balanceRA.toString());
		expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(
			totalSupply.sub(new BN(sendTokens)),
		);
		expect(instance.balanceOf(recipient)).to.eventually.be.a.bignumber.equal(new BN(sendTokens));
	});
});
