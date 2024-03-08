const { default: BigNumber } = require('bignumber.js');
const { NitroBridge } = require('../components/nitro-router');
const { NATIVE_TOKEN } = require('../constants/constants');
const { logger } = require('../utils/logger');
const { retry } = require('../utils/retry');

const CHAINDS = {
  ZKSYNC: 324,
  SCROLL: 534352,
  'Arbitrum One': 42161,
  Linea: 59144,
};

async function doBridge(ethAccount, web3, scan, proxy, bridgeAmount, fromChain, toChain) {
  const nitroBridge = new NitroBridge(proxy.proxy);

  retry(async () => {
    const accountBalance = await ethAccount.getBalance();

    logger.info('Balance', {
      accountBalance: new BigNumber(accountBalance).div(1e18),
      bridgeAmount,
      address: ethAccount.address,
    });

    const qouteData = await nitroBridge.getQoute({
      fromTokenAddress: NATIVE_TOKEN,
      toTokenAddress: NATIVE_TOKEN,
      fromTokenChainId: CHAINDS[fromChain],
      toTokenChainId: CHAINDS[toChain],
      amount: new BigNumber(bridgeAmount).times(1e18).toString(),
    });

    if (!qouteData.bridgeFee) {
      logger.error('Error get quote data', {
        responseQoute: qouteData,
        account: ethAccount.address,
      });

      return;
    }

    const transactionResponce = await nitroBridge.buildTransaction(
      qouteData,
      ethAccount.address,
      ethAccount.address,
    );

    const {
      bridgeFee, source, destination, txn,
    } = transactionResponce;

    const { amount, decimals } = bridgeFee;

    const feeBrdige = new BigNumber(amount).div(10 ** decimals);
    const sendAmount = new BigNumber(source.tokenAmount).div(10 ** source.asset.decimals);
    const receiveAmount = new BigNumber(destination.tokenAmount).div(10 ** destination.asset.decimals);

    logger.info('Bridge info', {
      feeBrdige,
      sendAmount,
      receiveAmount,
      address: ethAccount.address,
      txn,
    });

    const estimateGas = await ethAccount.getEstimateGas(txn);

    if (estimateGas) {
      const response = await ethAccount.sendTransaction(txn);
      logger.info('Sent transaction', {
        hash: response?.transactionHash,
        address: ethAccount.address,
      });
    }
  }, 7, 12000);
}

module.exports = {
  doBridge,
};
