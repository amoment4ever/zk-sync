const ccxt = require('ccxt');
const { OKX_API_KEY, SECRET_OKX, OKX_PHRASE } = require('../secret');
const { logger } = require('../utils/logger');

const exchange = new ccxt.okx({
  apiKey: OKX_API_KEY,
  secret: SECRET_OKX,
  password: OKX_PHRASE,
  enableRateLimit: true,
});

async function getTokenBalance(token) {
  const balance = await exchange.fetchBalance({ type: 'funding' });

  return balance[token]?.free;
}

async function withdrawToken(address, amount, token, network) {
  try {
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
  } catch (error) {
    logger.error('Error withdraw', error);
  }
}

module.exports = {
  withdrawToken,
  getTokenBalance,
};
