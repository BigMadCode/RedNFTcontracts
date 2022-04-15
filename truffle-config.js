const path = require('path');
require('dotenv').config({ path: './.env' });
const HDWalletProvider = require('@truffle/hdwallet-provider');
const AccountIndex = 0;

module.exports = {
	// See <http://truffleframework.com/docs/advanced/configuration>
	// to customize your Truffle configuration!
	contracts_build_directory: path.join(__dirname, 'client/src/contracts'),
	networks: {
		// mydevelopment: {
		// 	port: 8545,
		// 	host: '127.0.0.1',
		// 	network_id: '*',
		// },
		development: {
			port: 7545,
			host: '127.0.0.1',
			network_id: 1337,
		},
		ganache_local: {
			provider: function () {
				return new HDWalletProvider(process.env.MNEMONIC, 'http://127.0.0.1:7545', AccountIndex);
			},
			network_id: 1337,
		},

		// goerli_infura: {
		// 	provider: function () {
		// 		return new HDWalletProvider(
		// 			process.env.MNEMONIC,
		// 			'https://goerli.infura.io/v3/09fe022bd1da4dd7b44360612349bd93',
		// 			AccountIndex,
		// 		);
		// 	},
		// 	network_id: 5,
		// },
		// ropsten_infura: {
		// 	provider: function () {
		// 		return new HDWalletProvider(
		// 			process.env.MNEMONIC,
		// 			'https://ropsten.infura.io/v3/09fe022bd1da4dd7b44360612349bd93',
		// 			AccountIndex,
		// 		);
		// 	},
		// 	network_id: 3,
		// },
		// testnet: {
		// 	provider: () =>
		// 		new HDWalletProvider(process.env.MNEMONIC2, `https://data-seed-prebsc-1-s1.binance.org:8545`),
		// 	network_id: 97,
		// 	confirmations: 10,
		// 	timeoutBlocks: 200,
		// 	skipDryRun: true,
		// },
		// bsc: {
		// 	provider: () => new HDWalletProvider(process.env.MNEMONIC2, `https://bsc-dataseed1.binance.org`),
		// 	network_id: 56,
		// 	confirmations: 10,
		// 	timeoutBlocks: 200,
		// 	skipDryRun: true,
		// },
	},
	compilers: {
		solc: {
			version: '0.8.11',
		},
	},
};
