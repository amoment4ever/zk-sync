const { default: BigNumber } = require('bignumber.js');
const ABI_ROUTER = require('../data/abi-syncswap/abi-syncswap-router.json');
const ABI_CLASSIC_POOL = require('../data/abi-syncswap/abi-syncswap-classic-pool.json');
const ABI_CLASSIC_POOL_DATA = require('../data/abi-syncswap/abi-syncswap-classic-data.json');
const {
  SYNCSWAP_ROUTER_CONTRACT, SYNCSWAP_POOL_CONTRACT, ZERO_ADDRESS, WETH_TOKEN_CONTRACT, SYNCSWAP_STABLE_POOL_FACTORY,
} = require('../constants/constants');

class SyncSwap {
  constructor(web3) {
    this.web3 = web3;

    this.contractAddress = SYNCSWAP_ROUTER_CONTRACT;
    this.routerContract = new this.web3.eth.Contract(ABI_ROUTER, SYNCSWAP_ROUTER_CONTRACT);
    this.contractClassicPool = new this.web3.eth.Contract(ABI_CLASSIC_POOL, SYNCSWAP_POOL_CONTRACT);
    this.contractStablePool = new this.web3.eth.Contract(ABI_CLASSIC_POOL, SYNCSWAP_STABLE_POOL_FACTORY);
  }

  async getMinOut(poolAddress, tokenAddress, amount, slippage, to) {
    const contractPoolData = new this.web3.eth.Contract(ABI_CLASSIC_POOL_DATA, poolAddress);

    const minAmountOut = await contractPoolData.methods.getAmountOut(tokenAddress, amount, to).call();

    return new BigNumber(minAmountOut).multipliedBy(100 - slippage).div(100).toFixed(0);
  }

  async getAmountIn(poolAddress, tokenAddress, amount, slippage, to) {
    const contractPoolData = new this.web3.eth.Contract(ABI_CLASSIC_POOL_DATA, poolAddress);

    const minAmountIn = await contractPoolData.methods.getAmountIn(tokenAddress, amount, to).call();

    return new BigNumber(minAmountIn).multipliedBy(100 + slippage).div(100).toFixed(0);
  }

  async getPool(fromTokenAddress, toTokenAddress) {
    const poolStable = await this.contractStablePool.methods.getPool(fromTokenAddress, toTokenAddress).call();
    const classicPool = await this.contractClassicPool.methods.getPool(fromTokenAddress, toTokenAddress).call();

    if (poolStable !== ZERO_ADDRESS) {
      return poolStable;
    }

    return classicPool;
  }

  async swap(fromTokenAddress, toTokenAddress, amount, slippage, senderAddress) {
    const poolAddress = await this.getPool(fromTokenAddress, toTokenAddress);

    const minAmountOut = await this.getMinOut(poolAddress, fromTokenAddress, amount, slippage, senderAddress);

    const steps = [{
      pool: poolAddress,
      data: this.web3.eth.abi.encodeParameters(['address', 'address', 'uint8'], [fromTokenAddress, senderAddress, 1]),
      callback: ZERO_ADDRESS,
      callbackData: '0x',
    }];

    const paths = [{
      steps,
      tokenIn: WETH_TOKEN_CONTRACT === fromTokenAddress ? ZERO_ADDRESS : fromTokenAddress,
      amountIn: amount,
    }];

    const deadline = Math.floor(Date.now() / 1000) + 1000000;

    return this.routerContract.methods.swap(
      paths,
      minAmountOut,
      deadline,
    );
  }
}

module.exports = {
  SyncSwap,
};
