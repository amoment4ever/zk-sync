const ABI_ERC20 = require('../data/abi-erc20.json');

class ERC20Contract {
  constructor(web3, address) {
    this.address = address;
    this.web3 = web3;
    this.contract = new web3.eth.Contract(ABI_ERC20, this.address);
  }

  getBalance(address) {
    return this.contract.methods.balanceOf(address).call();
  }

  getAllowance(address, spender) {
    return this.contract.methods.allowance(address, spender).call();
  }

  getDecimals() {
    return this.contract.methods.decimals().call();
  }

  transfer(to, value) {
    return this.contract.methods.transfer(to, value);
  }

  approve(spender, value) {
    return this.contract.methods.approve(spender, value);
  }

  totalSupply() {
    return this.contract.methods.totalSupply().call();
  }
}

module.exports = {
  ERC20Contract,
};
