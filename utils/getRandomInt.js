/* eslint-disable no-param-reassign */
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomNumber(min, max) {
  return Math.random() * (max - min) + min;
}

module.exports = {
  getRandomInt,
  randomNumber,
};
