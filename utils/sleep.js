/* eslint-disable no-promise-executor-return */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = {
  sleep,
};
