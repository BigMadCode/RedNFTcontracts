import React, { Component } from 'react';
import Red from './contracts/RED.json';
import RedBasicPresubs from './contracts/RedBasicPresubs.json';
import getWeb3 from './getWeb3';
import './App.css';

export const connectWallet = async () => {
	if (window.ethereum) {
		//check if Metamask is installed
		try {
			const address = await window.ethereum.eth_requestAccounts(); //connect Metamask
			const obj = {
				connectedStatus: true,
				status: '',
				address: address,
			};
			return obj;
		} catch (error) {
			return {
				connectedStatus: false,
				status: '🦊 Connect to Metamask using the button on the top right.',
			};
		}
	} else {
		return {
			connectedStatus: false,
			status: '🦊 You must install Metamask into your browser: https://metamask.io/download.html',
		};
	}
};

class App extends Component {
	state = { loaded: false, tokenAddress: '0x123...', creatorAddress: 'null', redAddress: '' };

	componentDidMount = async () => {
		try {
			// Get network provider and web3 instance.
			this.web3 = await getWeb3();

			// Use web3 to get the user's accounts.
			this.accounts = await this.web3.eth.getAccounts();

			// Get the contract instance.
			this.networkId = await this.web3.eth.getChainId();

			this.redToken = new this.web3.eth.Contract(
				Red.abi,
				Red.networks[this.networkId] && Red.networks[this.networkId].address,
			);

			this.basicPresub = new this.web3.eth.Contract(
				RedBasicPresubs.abi,
				RedBasicPresubs.networks[this.networkId] && RedBasicPresubs.networks[this.networkId].address,
			);

			// Set web3, accounts, and contract to the state, and then proceed with an
			// example of interacting with the contract's methods.
			this.listenToTokenTransfer();
			this.setState(
				{
					loaded: true,
					redAddress: this.redToken._address,
				},
				this.updateUserTokens,
			);
		} catch (error) {
			// Catch any errors for any of the above operations.
			alert(`Failed to load web3, accounts, or contract. Check console for details.`);
			console.error(error);
		}
	};

	updateUserTokens = async () => {
		let userTokens = await this.redToken.methods.balanceOf(this.accounts[0]).call();
		this.setState({ userTokens: userTokens });
	};

	updateContractAllowance = async () => {
		let remainingBalace = await this.redToken.methods.allowance(this.accounts[0], process.env.PRESUB_ADDRESS).call;
		this.setState({ remainingBalace: remainingBalace });
	};

	listenToTokenTransfer = () => {
		this.redToken.events.Transfer({ to: this.accounts[0] }).on('data', this.updateUserTokens);
	};
	listenToAllowance = () => {
		this.redToken.events
			.approval({ to: '0xf641aaf2C46F04dB506E0bc58694F3Cc4EA4264E' })
			.on('data', this.updateContractAllowance);
	};

	handleInputChange = event => {
		const target = event.target;
		const value = target.type === 'checkbox' ? target.checked : target.value;
		const name = target.name;
		this.setState({
			[name]: value,
		});
	};
	//This code is used to test approval client side
	handleApprove = async () => {
		const { redAddress } = this.state;
		let presubAddress = process.env.PRESUB_ADDRESS;

		await this.redToken.methods.approve(
			{ spender: '0xf641aaf2C46F04dB506E0bc58694F3Cc4EA4264E', value: this.web3.utils.toWei('1000000000') },
			{
				owner: this.accounts[2],
			},
		);
		alert('Account ' + presubAddress + ' is now approved for ' + redAddress);
	};

	handleBuyToken = async () => {
		await this.web3.eth.sendTransaction({
			from: this.accounts[0],
			to: this.basicPresub.address,
			value: 1,
		});
	};

	render() {
		if (!this.state.loaded) {
			return <div>Loading Web3, accounts, and contract...</div>;
		}
		return (
			<div className="App">
				<h1>RED Tokens for RedEye Network</h1>
				{<h2>Approve Crowdsale Contract</h2>}
				Approve Contract address for 1 Billion RED:{' '}
				<br>
					{/* <input
					type="text"
					name="presubAddress"
					value={this.state.presubAddress}
					onChange={this.handleInputChange}
				/> */}
				</br>
				<button type="button" onClick={this.handleApprove}>
					Approve Sale Contract
				</button>
				<p>Contract's current RED allowance is: {this.state.remainingBalace} RED</p>
				<h2>Buy RED tokens Below</h2>
				<p>Get RED by sending BNB to this Address: {process.env.PRESUB_ADDRESS} </p>
				<p>OR </p>
				<p>Buy tokens directly here: </p>
				{/* {
					<input
						type="text"
						name="basicAddress"
						value={this.state.basicAddress}
						onChange={this.handleInputChange}
					/>
				} */}
				<button type="button" onClick={this.handleBuyToken}>
					Buy RED
				</button>
				<p>Your current RED balance is: {this.state.userTokens} RED</p>
			</div>
		);
	}
}

export default App;
