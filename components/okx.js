const ccxt = require('ccxt');
const { OKX_API_KEY, SECRET_OKX, OKX_PHRASE } = require('../secret');
const { logger } = require('../utils/logger');
const { retry } = require('../utils/retry');

const exchange = new ccxt.okx({
  apiKey: OKX_API_KEY,
  secret: SECRET_OKX,
  password: OKX_PHRASE,
  enableRateLimit: true,
});

async function getTokenBalance(token) {
  return await retry(async () => {
    const balance = await exchange.fetchBalance({ type: 'funding' });

    return balance[token]?.free;
  }, 10, 20000);
}

async function withdrawToken(address, amount, token, network) {
  return await retry(async () => {
    const tag = '';

    const networks = await exchange.fetchCurrencies();
    const networkInfo = networks[token].networks[network]; // Например, 'ETH/zkSync'

    const withdrawal = await exchange.withdraw(token, amount, address, tag, {
      network,
      fee: networkInfo.fee,
      //   pwd: '-',
      password: OKX_PHRASE,
    });
    logger.info('Response withdraw', withdrawal);

    return withdrawal;
  }, 10, 20000);
}

async function transferFromSubToMaster(curreny) {
  const { data } = await exchange.privateGetUsersSubaccountList();

  for (const { subAcct } of data) {
    const { data: subAccountBalance } = await exchange.privateGetAssetSubaccountBalances({ subAcct });

    for (const money of subAccountBalance) {
      const {
        availBal,
        bal,
        ccy,
        frozenBal,
      } = money;

      logger.info('Balance sub account', {
        subAcct,
        availBal,
        bal,
        ccy,
        frozenBal,
      });

      if (ccy === curreny && +availBal > 0) {
        const response = await exchange.transfer(ccy, availBal, 6, 6, {
          type: 2,
          subAcct,
        });

        logger.info('Transfer response', {
          response,
        });
      }
    }
  }
}

module.exports = {
  withdrawToken,
  getTokenBalance,
  transferFromSubToMaster,
};
