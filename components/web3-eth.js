const { Web3 } = require('web3');
const { RPCS } = require('../constants/constants');

const RPC_ETH = RPCS.find((item) => item.chain === 'ETH');

const web3Eth = new Web3(new Web3.providers.HttpProvider(RPC_ETH.rpc));

module.exports = {
  web3Eth,
};
