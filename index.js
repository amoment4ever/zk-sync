const { default: BigNumber } = require('bignumber.js');
const rp = require('request-promise');
const { mainAction } = require('./actions/main-action');
const { EthAccount } = require('./components/account');
const { web3ZksyncList } = require('./components/web3-zksync');
const {
  SLEEP_MIN_MS, SLEEP_MAX_MS,
} = require('./settings');
const { getRandomInt } = require('./utils/getRandomInt');
const { logger } = require('./utils/logger');
const { sleep } = require('./utils/sleep');
const { waitForLowerGasPrice } = require('./utils/wait-for');
const { wallets } = require('./wallets');

async function sleepWithLog() {
  const sleepMs = getRandomInt(SLEEP_MIN_MS, SLEEP_MAX_MS);

  logger.info('sleep', {
    ms: sleepMs,
  });

  await sleep(sleepMs);
}

async function start() {
  for (const { PRIVATE_KEY, DEPOSIT_OKX_ADDRESS } of wallets) {
    const { web3: web3ZkSync, proxy, scan } = web3ZksyncList.get();
    const ethAccount = new EthAccount(PRIVATE_KEY, web3ZkSync, proxy, scan);

    const balance = await ethAccount.getBalance();
    const readableBalance = new BigNumber(balance).div(10 ** 18);

    logger.info('Balance', {
      address: ethAccount.address,
      balance: readableBalance,
    });

    await waitForLowerGasPrice();

    await mainAction(ethAccount, web3ZkSync, scan, proxy, DEPOSIT_OKX_ADDRESS);

    await sleepWithLog();
    try {
      if (proxy?.linkToChange) {
        await rp(proxy.linkToChange);
        logger.info('Changed proxy ip');
      }
    } catch (exc) {
      logger.error('Error change proxy', exc);
    }
  }
}

start();
