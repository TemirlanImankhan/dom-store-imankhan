const store = new window.Store();
const list = document.querySelector('#product-list');
const form = document.querySelector('#product-form');
const emptyState = document.querySelector('#empty-state');
const errorFields = ['name', 'price', 'qty'];

function money(value) {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(value) + ' ₸';
}

function render() {
  const items = store.find();
  list.replaceChildren(...items.map((item) => {
    const row = document.createElement('tr');
    row.dataset.product = item.name;
    const product = document.createElement('td');
    const cell = document.createElement('div');
    cell.className = 'product-cell';
    const avatar = document.createElement('span');
    avatar.className = 'product-avatar';
    avatar.textContent = item.name.trim().charAt(0).toUpperCase();
    const name = document.createElement('span');
    name.textContent = item.name;
    cell.append(avatar, name);
    product.append(cell);
    const price = document.createElement('td');
    price.className = 'money';
    price.textContent = money(item.price);
    const quantity = document.createElement('td');
    const controls = document.createElement('div');
    controls.className = 'qty-control';
    const minus = document.createElement('button');
    minus.type = 'button'; minus.className = 'qty-button'; minus.dataset.action = 'decrease'; minus.setAttribute('aria-label', `Уменьшить количество: ${item.name}`); minus.textContent = '−';
    const amount = document.createElement('span'); amount.className = 'qty-value'; amount.textContent = item.qty;
    const plus = document.createElement('button');
    plus.type = 'button'; plus.className = 'qty-button'; plus.dataset.action = 'increase'; plus.setAttribute('aria-label', `Увеличить количество: ${item.name}`); plus.textContent = '+';
    controls.append(minus, amount, plus); quantity.append(controls);
    const subtotal = document.createElement('td'); subtotal.className = 'money'; subtotal.textContent = money(item.price * item.qty);
    const actions = document.createElement('td');
    const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'delete-button'; remove.dataset.action = 'remove'; remove.setAttribute('aria-label', `Удалить: ${item.name}`); remove.textContent = '×';
    actions.append(remove);
    row.append(product, price, quantity, subtotal, actions);
    return row;
  }));
  document.querySelector('#product-count').textContent = items.length;
  document.querySelector('#catalog-count').textContent = items.length;
  document.querySelector('#store-total').textContent = money(store.total());
  emptyState.hidden = items.length > 0;
}

function showError(field, message) {
  document.querySelector(`#${field}-error`).textContent = message;
  document.querySelector(`#${field}`).setAttribute('aria-invalid', String(Boolean(message)));
}

function clearErrors() {
  errorFields.forEach((field) => showError(field, ''));
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  clearErrors();
  const values = new FormData(form);
  const name = String(values.get('name') ?? '').trim();
  const priceText = String(values.get('price') ?? '').trim();
  const qtyText = String(values.get('qty') ?? '').trim();
  const price = Number(priceText);
  const qty = Number(qtyText);
  let valid = true;
  if (!name) { showError('name', 'Введите название товара.'); valid = false; }
  if (!priceText || !Number.isFinite(price) || price <= 0) { showError('price', 'Укажите цену больше нуля.'); valid = false; }
  if (!qtyText || !Number.isFinite(qty) || !Number.isInteger(qty) || qty < 0) { showError('qty', 'Укажите целое число от 0.'); valid = false; }
  if (!valid) return;
  if (store.find(name)) { showError('name', 'Товар с таким названием уже есть.'); return; }
  store.add({ name, price, qty });
  form.reset();
  render();
  document.querySelector('#name').focus();
});

// Один обработчик управляет всеми кнопками строк списка (делегирование).
list.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button || !list.contains(button)) return;
  const row = button.closest('tr[data-product]');
  if (!row) return;
  const item = store.find(row.dataset.product);
  if (!item) return;
  if (button.dataset.action === 'remove') {
    store.remove(item.name);
  } else if (button.dataset.action === 'increase' || button.dataset.action === 'decrease') {
    const nextQty = Math.max(0, item.qty + (button.dataset.action === 'increase' ? 1 : -1));
    store.remove(item.name);
    store.add({ ...item, qty: nextQty });
  }
  render();
});

render();
