const { LinkedList } = require('./utils/linked-list');

const mobileProxies = [
  {
    proxy: '',
    linkToChange: '',
  },
];

const proxies = new LinkedList(mobileProxies);

module.exports = {
  proxies,
};
