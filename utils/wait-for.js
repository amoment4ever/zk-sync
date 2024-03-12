const { default: BigNumber } = require('bignumber.js');
const { getTokenBalance, transferFromSubToMaster } = require('../components/okx');
const { web3Eth } = require('../components/web3-eth');
const { MAX_GWEI_ETH } = require('../settings');
const { logger } = require('./logger');
const { retry } = require('./retry');
const { sleep } = require('./sleep');

async function waitForLowerGasPrice() {
  await retry(async () => {
    while (true) {
      // Получаем текущую цену газа в сети
      const currentGasPrice = await web3Eth.eth.getGasPrice();
      const currentGasPriceInGwei = web3Eth.utils.fromWei(currentGasPrice, 'gwei');

      logger.info(`Current gas ${currentGasPriceInGwei} GWEI`);

      // Проверяем, не опустилась ли цена ниже или равна заданной
      if (parseFloat(currentGasPriceInGwei) <= MAX_GWEI_ETH) {
        logger.info(`Gas price has reached the desired level: ${MAX_GWEI_ETH} GWEI`);
        break;
      } else {
        logger.info(`Expect gas prices to decrease to ${MAX_GWEI_ETH} GWEI...`);
        // Ожидаем некоторое время перед следующей проверкой
        await sleep(10000);
      }
    }
  }, 10, 12000);
}

async function waitForOkxBalance(amount, token) {
  await retry(async () => {
    while (true) {
      const balance = await getTokenBalance(token);

      logger.info('Balance okx', {
        balance,
        expect: amount,
      });

      if (balance > amount) {
        break;
      } else {
        logger.info('Sleep 10000ms, waiting for deposit ETH on OKX');
        await sleep(10000);

        logger.info('Check sub accounts');
        await transferFromSubToMaster('ETH').catch((exc) => {
          logger.error('transfer from sub account error', exc);
        });
      }
    }
  }, 3, 10000);
}

async function waitForTokenBalance(erc20Contract, amount, address) {
  await retry(async () => {
    while (true) {
      const decimals = await erc20Contract.getDecimals();
      const balance = await erc20Contract.getBalance(address);

      const readableBalance = new BigNumber(balance).div(10 ** Number(decimals));

      logger.info('Balance', {
        address,
        readableBalance,
        expect: amount,
      });

      if (readableBalance.gte(amount)) {
        break;
      } else {
        logger.info('Sleep 10000ms, wait for tokens');
        await sleep(10000);
      }
    }
  }, 10, 12000);
}

async function waitForEthBalance(web3, amount, address) {
  await retry(async () => {
    while (true) {
      const balance = await web3.eth.getBalance(address);

      const readableBalance = new BigNumber(balance).div(10 ** 18);

      logger.info('Balance', {
        address,
        readableBalance,
        expect: amount,
      });

      if (readableBalance.gte(amount)) {
        break;
      } else {
        logger.info('Sleep 10000ms, wait for tokens');
        await sleep(10000);
      }
    }
  }, 10, 12000);
}

module.exports = {
  waitForTokenBalance,
  waitForOkxBalance,
  waitForEthBalance,
  waitForLowerGasPrice,
};
