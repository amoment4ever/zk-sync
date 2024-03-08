const request = require('request-promise');
const { logger } = require('../utils/logger');

class Odos {
  constructor(web3, proxy = null) {
    this.web3 = web3;
    this.proxy = proxy;

    this.request = request.defaults({
      json: true,
      gzip: true,
      proxy: this.proxy?.proxy,
    });
  }

  async quote(fromToken, toToken, amount, slippage, address) {
    const url = 'https://api.odos.xyz/sor/quote/v2';

    const data = {
      chainId: Number(await this.web3.eth.getChainId()), // Assuming web3 instance is available in `this`
      inputTokens: [{
        tokenAddress: this.web3.utils.toChecksumAddress(fromToken),
        amount: `${amount}`,
      }],
      outputTokens: [{
        tokenAddress: this.web3.utils.toChecksumAddress(toToken),
        proportion: 1,
      }],
      slippageLimitPercent: slippage,
      userAddr: address, // Assuming address is available in `this`
      referralCode: 0, // czbag ref
      compact: true,
    };

    try {
      const response = await this.request.post({
        url,
        method: 'POST',
        body: data,
      });
      return response;
    } catch (error) {
      logger.error(`[${this.accountId}][${this.address}] Bad Odos request`);
      throw error;
    }
  }

  async assemble(pathId, address) {
    const url = 'https://api.odos.xyz/sor/assemble';
    const data = {
      userAddr: address, // Assuming address is available in `this`
      pathId,
      simulate: false,
    };

    try {
      const response = await this.request({
        url,
        method: 'POST',
        body: data,
      });
      return response;
    } catch (error) {
      logger.error(`[${this.accountId}][${this.address}] Bad Odos request`);
      throw error;
    }
  }

  async swap(fromTokenAddress, toTokenTokenAddress, amount, slippage, address) {
    const quoteData = await this.quote(fromTokenAddress, toTokenTokenAddress, amount, slippage, address);

    const transactionData = await this.assemble(quoteData.pathId, address);

    const { transaction } = transactionData;

    return transaction;
  }
}

module.exports = {
  Odos,
};
