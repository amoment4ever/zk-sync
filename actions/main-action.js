const { default: BigNumber } = require('bignumber.js');
const { EthAccount } = require('../components/account');
const { EraLand } = require('../components/eraland');
const { ERC20Contract } = require('../components/erc20');
const { withdrawToken } = require('../components/okx');
const { SyncSwap } = require('../components/syncswap');
const { web3sLinea } = require('../components/web3-linea');
const {
  USDC_TOKEN_ADDRESS, USDT_TOKEN_ADDRESS, WETH_TOKEN_CONTRACT, ZERO_ADDRESS,
} = require('../constants/constants');
const {
  SLEEP_MIN_MS, SLEEP_MAX_MS, AMOUNT_BORROW_PERCENT, LEAVE_AMOUNT_ETH_MIN, LEAVE_AMOUNT_ETH_MAX, MIN_AMOUNT_ETH, MAX_AMOUNT_ETH, PERCENT_SWAP_USDC, MAX_SWAP_USDC,
} = require('../settings');
const { randomNumber, getRandomInt } = require('../utils/getRandomInt');
const { logger } = require('../utils/logger');
const { retry } = require('../utils/retry');
const { sleep } = require('../utils/sleep');
const { waitForEthBalance, waitForOkxBalance } = require('../utils/wait-for');
const {
  depositEraLandAction, borrowEraLandAction, repayEraLand, withdrawEraLandAction, depositZeroLend, withdrawZeroLend, depositReactorFusion, withdrawReactorFusion,
} = require('./actions-landings');

const { doSwapSyncSwap, doSwapOdos } = require('./actions-swaps');
const { doBridge } = require('./do-bridge');
const { transferAction } = require('./transferAction');

async function sleepWithLog() {
  const sleepMs = getRandomInt(SLEEP_MIN_MS, SLEEP_MAX_MS);

  logger.info('Sleep', {
    sleepMs,
  });

  await sleep(sleepMs);
}

async function mainAction(ethAccount, web3ZkSync, scan, proxy, depositOkxAddress) {
  const amount = +randomNumber(MIN_AMOUNT_ETH, MAX_AMOUNT_ETH).toFixed(5);

  await waitForOkxBalance(amount, 'ETH');

  await withdrawToken(ethAccount.address, amount, 'ETH', 'zkSync Era');

  await waitForEthBalance(web3ZkSync, amount * 0.96, ethAccount.address);

  await sleepWithLog();

  // 30 процентов вероятности заюзать зероленд
  if (Math.random() < 0.4) {
    await depositZeroLend(ethAccount, web3ZkSync, scan, amount);
    await sleepWithLog();

    await withdrawZeroLend(ethAccount, web3ZkSync, scan);
    await sleepWithLog();
  }

  if (Math.random() < 0.4) {
    await depositReactorFusion(ethAccount, web3ZkSync, scan, amount);
    await sleepWithLog();
    await withdrawReactorFusion(ethAccount, web3ZkSync, scan);
    await sleepWithLog();
  }

  await depositEraLandAction(ethAccount, web3ZkSync, scan, amount);

  await sleepWithLog();

  const amountBorrowUsdc = +(amount * 3800 * AMOUNT_BORROW_PERCENT).toFixed(5);

  await borrowEraLandAction(ethAccount, web3ZkSync, scan, amountBorrowUsdc);

  const amountToSwap = +Math.min(amountBorrowUsdc * PERCENT_SWAP_USDC, MAX_SWAP_USDC * randomNumber(0.9, 1)).toFixed(5);

  await sleepWithLog();

  if (Math.random() > 0.5) {
    await doSwapOdos(ethAccount, web3ZkSync, scan, proxy, amountToSwap, USDC_TOKEN_ADDRESS, USDT_TOKEN_ADDRESS);
  } else {
    await doSwapSyncSwap(ethAccount, web3ZkSync, scan, amountToSwap, USDC_TOKEN_ADDRESS, USDT_TOKEN_ADDRESS);
  }

  await sleepWithLog();

  const usdtContract = new ERC20Contract(web3ZkSync, USDT_TOKEN_ADDRESS);
  const usdtBalance = await usdtContract.getBalance(ethAccount.address);

  if (Math.random() > 0.5) {
    await doSwapOdos(ethAccount, web3ZkSync, scan, proxy, Number(usdtBalance) / 1e6, USDT_TOKEN_ADDRESS, USDC_TOKEN_ADDRESS);
  } else {
    await doSwapSyncSwap(ethAccount, web3ZkSync, scan, Number(usdtBalance) / 1e6, USDT_TOKEN_ADDRESS, USDC_TOKEN_ADDRESS);
  }

  await sleepWithLog();

  const usdcContract = new ERC20Contract(web3ZkSync, USDC_TOKEN_ADDRESS);
  const usdcCurrentBalance = await usdcContract.getBalance(ethAccount.address);

  const eraLand = new EraLand(web3ZkSync);
  const borrowAmountWei = await eraLand.getBorrowAmount(ethAccount.address);

  const difference = new BigNumber(borrowAmountWei).minus(usdcCurrentBalance);

  if (difference.gte(0)) {
    logger.info('Swap ETH => USDC', {
      usdcCurrentBalance,
      amount: difference.toString(),
      borrowAmountWei,
    });

    const syncSwap = new SyncSwap(web3ZkSync);

    const poolAddress = await syncSwap.getPool(WETH_TOKEN_CONTRACT, USDC_TOKEN_ADDRESS);
    const minAmountIn = await syncSwap.getAmountIn(poolAddress, USDC_TOKEN_ADDRESS, difference.toString(), 1, ethAccount.address);

    await doSwapSyncSwap(ethAccount, web3ZkSync, scan, new BigNumber(minAmountIn).div(10 ** 18), WETH_TOKEN_CONTRACT, USDC_TOKEN_ADDRESS);
  }

  await sleep(10000);

  await repayEraLand(ethAccount, web3ZkSync, scan, USDC_TOKEN_ADDRESS);

  await sleepWithLog();

  await withdrawEraLandAction(ethAccount, web3ZkSync, scan);

  await sleepWithLog();

  if (Math.random() < 0.3) {
    await depositReactorFusion(ethAccount, web3ZkSync, scan, amount);
    await withdrawReactorFusion(ethAccount, web3ZkSync, scan);
    await sleepWithLog();
  }

  if (Math.random() < 0.3) {
    await depositZeroLend(ethAccount, web3ZkSync, scan, amount);
    await sleepWithLog();

    await withdrawZeroLend(ethAccount, web3ZkSync, scan);
    await sleepWithLog();
  }

  const CHAIN_WITHDRAW = 'Linea';
  const currentBalance = await ethAccount.getBalance(ethAccount.address);
  const leaveAmount = +randomNumber(LEAVE_AMOUNT_ETH_MIN, LEAVE_AMOUNT_ETH_MAX).toFixed(5);
  const bridgeAmount = new BigNumber(currentBalance).div(1e18).minus(leaveAmount).toFixed(5);

  logger.info('Do bridge from ZKSYNC', {
    chain: CHAIN_WITHDRAW,
  });
  await doBridge(ethAccount, web3ZkSync, scan, proxy, bridgeAmount, 'ZKSYNC', CHAIN_WITHDRAW);

  logger.info('Wait for ETH in sourceChain', {
    chain: CHAIN_WITHDRAW,
  });
  const web3Dist = web3sLinea.get().web3;
  await waitForEthBalance(web3Dist, bridgeAmount * 0.9, ethAccount.address);

  const ethAccountDist = new EthAccount(ethAccount.privateKey, web3Dist, proxy, scan);

  await retry(async () => {
    await transferAction(ethAccountDist, ethAccount.address, depositOkxAddress, CHAIN_WITHDRAW);
  }, 5, 10000);
  await sleepWithLog();
}

module.exports = {
  mainAction,
};
