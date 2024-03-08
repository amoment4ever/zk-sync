const { ZEROLEND_CONTRACT, ZEROLEND_WETH } = require('../constants/constants');
const ABI_ZEROLEND = require('../data/abi-zerolend.json');
const ABI_ERC20 = require('../data/abi-erc20.json');

const BORROW_CONTRACT = '0x4d9429246EA989C9CeE203B43F6d1C7D83e3B8F8';

class ZeroLend {
  constructor(web3) {
    this.web3 = web3;
    this.contractAddress = ZEROLEND_CONTRACT;
    this.contractAddressWeth = ZEROLEND_WETH;

    this.contract = new this.web3.eth.Contract(ABI_ZEROLEND, ZEROLEND_CONTRACT);
    this.contractWeth = new this.web3.eth.Contract(ABI_ERC20, ZEROLEND_WETH);
  }

  getDepoistAmount(address) {
    return this.contractWeth.methods.balanceOf(address).call();
  }

  deposit(address) {
    return this.contract.methods.depositETH(BORROW_CONTRACT, address, 0);
  }

  withdraw(amount, address) {
    return this.contract.methods.withdrawETH(BORROW_CONTRACT, amount, address);
  }
}

module.exports = {
  ZeroLend,
};
