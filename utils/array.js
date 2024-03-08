function getRandomFromArray(list) {
  return list[Math.floor((Math.random() * list.length))];
}

module.exports = {
  getRandomFromArray,
};
