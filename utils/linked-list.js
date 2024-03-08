class LinkedList {
  constructor(array) {
    this.index = -1;
    this.array = array;
  }

  get length() {
    return this.array.length;
  }

  push(item) {
    this.array.push(item);
    return this;
  }

  get() {
    this.index += 1;

    if (!this.array[this.index]) {
      this.index = 0;
    }

    return this.array[this.index];
  }
}

module.exports = { LinkedList };
