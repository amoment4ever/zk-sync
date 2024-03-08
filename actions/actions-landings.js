const { default: BigNumber } = require('bignumber.js');
const { EraLand } = require('../components/eraland');
const { ReactorFusion } = require('../components/reactorfusion');
const { ZeroLend } = require('../components/zerolend');
const { ERALEND_BORROW_USDC, ZEROLEND_WETH, ZEROLEND_CONTRACT } = require('../constants/constants');
const { logger } = require('../utils/logger');
const { retry } = require('../utils/retry');
const { sleep } = require('../utils/sleep');

async function depositEraLandAction(ethAccount, web3, scan, amountDeposit) {
  const AMOUNT_DEPOSIT = amountDeposit;

  const eraLand = new EraLand(web3);

  const amountDepositWei = new BigNumber(AMOUNT_DEPOSIT).multipliedBy(10 ** 18);

  await retry(async () => {
    const { gasPrice } = await ethAccount.getGasPrice();

    const response = await ethAccount.sendTransaction({
      from: ethAccount.address,
      to: eraLand.contractAddress,
      value: amountDepositWei.toString(),
      gasPrice,
      input: '0x1249c58b',
    });

    logger.info('Deposit Eraland response', {
      address: ethAccount.address,
      tx: `${scan}/tx/${response.transactionHash}`,
    });
  }, 4, 20000);
}

async function borrowEraLandAction(ethAccount, web3, scan, amountBorrow) {
  const eraLand = new EraLand(web3);

  const amountBorrowWei = new BigNumber(amountBorrow).multipliedBy(10 ** 6);
  await retry(async () => {
    const { gasPrice } = await ethAccount.getGasPrice();

    logger.info('Do colleteral eraLand');
    const response = await eraLand.enterMarket().send({
      from: ethAccount.address,
      gasPrice,
    });

    await sleep(15000);

    logger.info('Colleteral ETH EraLand response', {
      address: ethAccount.address,
      tx: `${scan}/tx/${response.transactionHash}`,
    });
  }, 3, 20000);

  await retry(async () => {
    const { gasPrice } = await ethAccount.getGasPrice();

    const data = await eraLand.borrow(amountBorrowWei.toString()).send({
      from: ethAccount.address,
      gasPrice,
    });

    logger.info('Borrow usdc', {
      amountBorrowWei,
      tx: `${scan}/tx/${data.transactionHash}`,
    });
  }, 5, 20000);
}

async function withdrawEraLandAction(ethAccount, web3, scan) {
  const eraLand = new EraLand(web3);

  await retry(async () => {
    const { gasPrice } = await ethAccount.getGasPrice();

    const depositedAmount = await eraLand.getAmountDeposit(ethAccount.address);
    logger.info('Deposited amount eralend', {
      depositedAmount,
    });

    if (depositedAmount) {
      const withdraw = await eraLand.withdraw(new BigNumber(depositedAmount).minus(3 * 1e10).toString()).send({
        from: ethAccount.address,
        gasPrice,
      });

      logger.info('Withdraw info eralend', {
        address: ethAccount.address,
        tx: `${scan}/tx/${withdraw.transactionHash}`,
      });
    }
  }, 5, 20000);
}

async function repayEraLand(ethAccount, web3, scan, tokenAddress) {
  await retry(async () => {
    const eraLand = new EraLand(web3);

    const borrowAmount = await eraLand.getBorrowAmount(ethAccount.address);

    if (borrowAmount <= 0) {
      return;
    }
    await ethAccount.checkAndApproveToken(tokenAddress, ERALEND_BORROW_USDC, borrowAmount);
    const { gasPrice } = await ethAccount.getGasPrice();

    const response = await eraLand.repay(borrowAmount).send({
      from: ethAccount.address,
      gasPrice,
    });

    logger.info('Repay info', {
      address: ethAccount.address,
      tx: `${scan}/tx/${response.transactionHash}`,
    });
  }, 5, 20000);
}

async function depositZeroLend(ethAccount, web3, scan, amountDeposit) {
  const zeroLend = new ZeroLend(web3);

  const amountDepositWei = new BigNumber(amountDeposit).multipliedBy(10 ** 18);

  await retry(async () => {
    const { gasPrice } = await ethAccount.getGasPrice();

    const response = await zeroLend.deposit(ethAccount.address).send({
      value: amountDepositWei.toString(),
      from: ethAccount.address,
      gasPrice,
    });

    logger.info('Deposit ZeroLend response', {
      address: ethAccount.address,
      tx: `${scan}/tx/${response.transactionHash}`,
    });
  }, 4, 20000);
}

async function withdrawZeroLend(ethAccount, web3, scan) {
  const zeroLend = new ZeroLend(web3);

  await retry(async () => {
    const { gasPrice } = await ethAccount.getGasPrice();

    const depositedAmount = await zeroLend.getDepoistAmount(ethAccount.address);
    logger.info('Deposited amount zerolend', {
      depositedAmount,
    });

    await ethAccount.checkAndApproveToken(ZEROLEND_WETH, ZEROLEND_CONTRACT, depositedAmount);

    await sleep(10000);

    if (depositedAmount) {
      const estimateGas = await zeroLend.withdraw(depositedAmount, ethAccount.address).estimateGas(
        { from: ethAccount.address },
      );

      const withdraw = await zeroLend.withdraw(depositedAmount, ethAccount.address).send({
        from: ethAccount.address,
        gasPrice,
        gas: Math.floor(Number(estimateGas) * 1.2),
      });

      logger.info('Withdraw info', {
        address: ethAccount.address,
        tx: `${scan}/tx/${withdraw.transactionHash}`,
      });
    }
  }, 3, 10000);
}

async function depositReactorFusion(ethAccount, web3, scan, amountDeposit) {
  const reactorFusion = new ReactorFusion(web3);

  const amountDepositWei = new BigNumber(amountDeposit).multipliedBy(10 ** 18);

  await retry(async () => {
    const { gasPrice } = await ethAccount.getGasPrice();

    const response = await reactorFusion.deposit().send({
      value: amountDepositWei.toString(),
      from: ethAccount.address,
      gasPrice,
    });

    logger.info('Deposit ReactorFusion response', {
      address: ethAccount.address,
      tx: `${scan}/tx/${response.transactionHash}`,
    });
  }, 4, 20000);
}

async function withdrawReactorFusion(ethAccount, web3, scan) {
  const reactorFusion = new ReactorFusion(web3);

  await retry(async () => {
    const { gasPrice } = await ethAccount.getGasPrice();

    const depositedAmount = await reactorFusion.getDepoistAmount(ethAccount.address);
    logger.info('Deposited amount reactorfusion', {
      depositedAmount,
    });

    if (depositedAmount) {
      const estimateGas = await reactorFusion.withdraw(depositedAmount).estimateGas(
        { from: ethAccount.address },
      );

      const withdraw = await reactorFusion.withdraw(depositedAmount).send({
        from: ethAccount.address,
        gasPrice,
        gas: Math.floor(Number(estimateGas) * 1.2),
      });

      logger.info('Withdraw info reactorFusion', {
        address: ethAccount.address,
        tx: `${scan}/tx/${withdraw.transactionHash}`,
      });
    }
  }, 3, 10000);
}

module.exports = {
  depositEraLandAction,
  withdrawEraLandAction,
  borrowEraLandAction,
  repayEraLand,
  depositZeroLend,
  withdrawZeroLend,
  depositReactorFusion,
  withdrawReactorFusion,
};
