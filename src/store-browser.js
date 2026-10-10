// Browser-compatible copy of the Lab 4 Store API for opening index.html directly.
// The original ES module remains in Store.js for Node.js and the Lab 4 tests.
function validateName(name) {
  if (typeof name !== 'string' || name.trim() === '') throw new TypeError('item name must be a non-empty string');
}

function validateItem(item) {
  if (item === null || typeof item !== 'object' || Array.isArray(item)) throw new TypeError('item must be an object');
  const { name, price, qty } = item;
  validateName(name);
  if (typeof price !== 'number' || !Number.isFinite(price) || price < 0) throw new TypeError('item price must be a finite, non-negative number');
  if (typeof qty !== 'number' || !Number.isFinite(qty) || qty < 0) throw new TypeError('item quantity must be a finite, non-negative number');
}

function copyItem(item) { return { ...item }; }

class Store {
  #items = [];
  get size() { return this.#items.length; }
  add(item) {
    validateItem(item);
    const storedItem = copyItem(item);
    this.#items.push(storedItem);
    return copyItem(storedItem);
  }
  remove(name) {
    validateName(name);
    const index = this.#items.findIndex((item) => item.name === name);
    if (index === -1) return false;
    this.#items.splice(index, 1);
    return true;
  }
  find(name) {
    if (arguments.length === 0) return this.#items.map(copyItem);
    validateName(name);
    const item = this.#items.find((entry) => entry.name === name);
    return item ? copyItem(item) : undefined;
  }
  total() { return this.#items.reduce((sum, { price, qty }) => sum + price * qty, 0); }
  static from(items) {
    if (!Array.isArray(items)) throw new TypeError('Store.from expects an array');
    const store = new this();
    items.forEach((item) => store.add(item));
    return store;
  }
}

window.Store = Store;
