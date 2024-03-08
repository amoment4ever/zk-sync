const rp = require('request-promise');

class NitroBridge {
  constructor(proxy) {
    this.proxy = proxy;

    this.request = rp.defaults({
      json: true,
      gzip: true,
      proxy: this.proxy,
      // timeout: 6000,
    });
  }

  async getQoute({
    fromTokenAddress,
    toTokenAddress,
    amount,
    fromTokenChainId,
    toTokenChainId,
    partnerId,
  }) {
    const qs = {
      fromTokenAddress,
      toTokenAddress,
      amount,
      fromTokenChainId,
      toTokenChainId,
      partnerId: partnerId || 1,
    };

    const API_URL = 'https://api-beta.pathfinder.routerprotocol.com/api/v2/quote';

    const data = await this.request(API_URL, {
      qs,

    });

    return data;
  }

  async buildTransaction(responseQouter, senderAddress, receiverAddress) {
    const URL = 'https://api-beta.pathfinder.routerprotocol.com/api/v2/transaction';

    const data = await this.request({
      uri: URL,
      method: 'post',
      body: {
        ...responseQouter,
        senderAddress,
        receiverAddress,
      },
    });

    return data;
  }
}

module.exports = {
  NitroBridge,
};
