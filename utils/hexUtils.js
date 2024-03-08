// Функция для преобразования строки в шестнадцатеричное представление
function stringToHex(str) {
  let hex = '';
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < str.length; i++) {
    hex += str.charCodeAt(i).toString(16);
  }
  return hex;
}

module.exports = {
  stringToHex,
};
