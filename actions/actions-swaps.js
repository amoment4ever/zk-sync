const { default: BigNumber } = require('bignumber.js');
const { ERC20Contract } = require('../components/erc20');
const { Odos } = require('../components/odos');
const { SyncSwap } = require('../components/syncswap');
const {
  USDC_TOKEN_ADDRESS, ZERO_ADDRESS, WETH_TOKEN_CONTRACT, SYNCSWAP_ROUTER_CONTRACT, USDT_TOKEN_ADDRESS, ODOS_ROUTER_CONTRACT,
} = require('../constants/constants');
const { randomNumber } = require('../utils/getRandomInt');
const { logger } = require('../utils/logger');
const { retry } = require('../utils/retry');
const { sleep } = require('../utils/sleep');

async function getDecimals(web3, tokenAddress) {
  if (tokenAddress === ZERO_ADDRESS) {
    return 18;
  }

  const ercContract = new ERC20Contract(web3, tokenAddress);

  const decimals = await ercContract.getDecimals();

  return Number(decimals);
}

async function doSwapSyncSwap(ethAccount, web3Scroll, scan, amountSwap, fromToken, toToken) {
  return await retry(async () => {
    const AMOUNT_SWAP = amountSwap;
    const SLIPPAGE = 2; // percent

    const syncSwap = new SyncSwap(web3Scroll);

    const TOKENS = {
      USDC: USDC_TOKEN_ADDRESS,
      ETH: WETH_TOKEN_CONTRACT,
      USDT: USDT_TOKEN_ADDRESS,
    };

    logger.info('Try to swap syncswap', {
      amountSwap,
      fromToken,
      toToken,
    });

    const decimals = await getDecimals(web3Scroll, fromToken);
    const amountInWei = new BigNumber(AMOUNT_SWAP).multipliedBy(10 ** decimals);

    const methodSwap = await syncSwap.swap(fromToken, toToken, amountInWei.toString(), SLIPPAGE, ethAccount.address);

    const { gasPrice } = await ethAccount.getGasPrice();

    if (fromToken !== TOKENS.ETH) {
      await ethAccount.checkAndApproveToken(fromToken, SYNCSWAP_ROUTER_CONTRACT, amountInWei);
      await sleep(randomNumber(10000, 20000));
    }

    const response = await methodSwap.send({
      from: ethAccount.address,
      value: TOKENS.ETH === fromToken ? amountInWei.toString() : undefined,
      gasPrice,
    });

    logger.info('Swapped Syncswap', {
      address: ethAccount.address,
      tx: `${scan}/tx/${response.transactionHash}`,
    });
  }, 5, 20000);
}

async function doSwapOdos(ethAccount, web3, scan, proxy, amountSwap, fromToken, toToken) {
  return await retry(async () => {
    const odos = new Odos(web3, proxy);

    logger.info('Try to swap Odos', {
      amountSwap,
      fromToken,
      toToken,
    });

    const SLIPPAGE = 0.5;

    const decimals = await getDecimals(web3, fromToken);

    const amountInWei = new BigNumber(amountSwap).multipliedBy(10 ** decimals);

    if (fromToken !== ZERO_ADDRESS) {
      await ethAccount.checkAndApproveToken(fromToken, ODOS_ROUTER_CONTRACT, amountInWei);
    }

    const data = await odos.swap(fromToken, toToken, amountInWei, SLIPPAGE, ethAccount.address);

    const response = await ethAccount.sendTransaction(data);

    logger.info('Swapped Odos', {
      address: ethAccount.address,
      tx: `${scan}/tx/${response.transactionHash}`,
    });
  }, 5, 20000);
}

module.exports = {
  doSwapSyncSwap,
  doSwapOdos,
};
