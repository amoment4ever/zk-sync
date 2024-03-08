const { REACTOR_FUSION_LENDING } = require('../constants/constants');
const ABI_REACTORFUSION = require('../data/abi-reactorfusion.json');

class ReactorFusion {
  constructor(web3) {
    this.web3 = web3;

    this.contract = new this.web3.eth.Contract(ABI_REACTORFUSION, REACTOR_FUSION_LENDING);
  }

  getDepoistAmount(address) {
    return this.contract.methods.balanceOf(address).call();
  }

  deposit() {
    return this.contract.methods.mint();
  }

  withdraw(amount) {
    return this.contract.methods.redeem(amount);
  }
}

module.exports = {
  ReactorFusion,
};
