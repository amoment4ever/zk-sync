const { default: BigNumber } = require('bignumber.js');
const { logger } = require('../utils/logger');

async function transferAction(ethAccount, fromAddress, toAddress, chain) {
  const gasLimit = 21000; // Стандартный лимит газа для транзакции ETH

  const balance = await ethAccount.getBalance();

  const leaveAmouht = new BigNumber(0.0003).multipliedBy(1e18);

  const value = new BigNumber(balance).minus(leaveAmouht).toString();

  const { gasPrice } = await ethAccount.getGasPrice();

  const tx = {
    from: fromAddress,
    to: toAddress,
    value,
    gas: gasLimit,
    gasPrice,
  };

  const data = await ethAccount.sendTransaction(tx);

  logger.info('Transfer to okx', {
    txHash: data.transactionHash,
    chain,
  });
}

module.exports = {
  transferAction,
};
