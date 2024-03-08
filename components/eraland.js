const ABI_ERALAND = require('../data/abi-eraland.json');
const { ERALEND_LANDING, ERALEND_COLLETERAL, ERALEND_BORROW_USDC } = require('../constants/constants');

class EraLand {
  constructor(web3) {
    this.web3 = web3;
    this.contractAddress = ERALEND_LANDING;
    this.colleteralContractAddress = ERALEND_COLLETERAL;
    this.contract = new this.web3.eth.Contract(ABI_ERALAND, this.contractAddress);
    this.colleteralContract = new this.web3.eth.Contract(ABI_ERALAND, this.colleteralContractAddress);
    this.borrowContract = new this.web3.eth.Contract(ABI_ERALAND, ERALEND_BORROW_USDC);
  }

  async getAmountDeposit(address) {
    return this.contract.methods.balanceOfUnderlying(address).call();
  }

  deposit() {
    return this.contract.methods.mint();
  }

  getBorrowAmount(address) {
    return this.borrowContract.methods.borrowBalanceCurrent(address).call();
  }

  withdraw(redeemAmount) {
    return this.contract.methods.redeemUnderlying(redeemAmount);
  }

  borrow(amount) {
    return this.borrowContract.methods.borrow(amount);
  }

  enterMarket() {
    return this.colleteralContract.methods.enterMarkets([this.contractAddress]);
  }

  repay(amount) {
    return this.borrowContract.methods.repayBorrow(amount);
  }
}

module.exports = {
  EraLand,
};
