// Load from LocalStorage
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let categories = JSON.parse(localStorage.getItem('categories')) || ['Food', 'Transport', 'Fun'];
let spendingLimit = parseFloat(localStorage.getItem('spendingLimit')) || 0;

// Chart instance
let chart = null;

// DOM
const addBtn = document.getElementById('add-btn');
const itemName = document.getElementById('item-name');
const itemAmount = document.getElementById('item-amount');
const itemCategory = document.getElementById('item-category');
const totalBalance = document.getElementById('total-balance');
const transactionList = document.getElementById('transaction-list');
const sortSelect = document.getElementById('sort-select');
const addCategoryBtn = document.getElementById('add-category-btn');
const customCategoryInput = document.getElementById('custom-category-input');
const spendingLimitInput = document.getElementById('spending-limit');

// Init limit input
spendingLimitInput.value = spendingLimit || '';

// Render category options
function renderCategoryOptions() {
  const current = itemCategory.value;
  itemCategory.innerHTML = '<option value="">-- Select Category --</option>';
  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    if (cat === current) opt.selected = true;
    itemCategory.appendChild(opt);
  });
}

// Add custom category
addCategoryBtn.addEventListener('click', () => {
  const newCat = customCategoryInput.value.trim();
  if (!newCat) return;
  if (categories.includes(newCat)) {
    alert('Category already exists!');
    return;
  }
  categories.push(newCat);
  localStorage.setItem('categories', JSON.stringify(categories));
  customCategoryInput.value = '';
  renderCategoryOptions();
});

// Save spending limit
spendingLimitInput.addEventListener('change', () => {
  spendingLimit = parseFloat(spendingLimitInput.value) || 0;
  localStorage.setItem('spendingLimit', spendingLimit);
  render();
});

// Add transaction
addBtn.addEventListener('click', () => {
  const name = itemName.value.trim();
  const amount = parseFloat(itemAmount.value);
  const category = itemCategory.value;

  if (!name || !amount || !category) {
    alert('Please fill in all fields!');
    return;
  }

  transactions.push({ id: Date.now(), name, amount, category });
  localStorage.setItem('transactions', JSON.stringify(transactions));

  itemName.value = '';
  itemAmount.value = '';
  itemCategory.value = '';
  render();
});

// Delete transaction
function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  localStorage.setItem('transactions', JSON.stringify(transactions));
  render();
}

// Update balance
function updateBalance() {
  const total = transactions.reduce((sum, t) => sum + t.amount, 0);
  totalBalance.textContent = 'Rp ' + total.toLocaleString('id-ID');

  // Highlight if over limit
  if (spendingLimit > 0 && total > spendingLimit) {
    totalBalance.classList.add('over-limit');
  } else {
    totalBalance.classList.remove('over-limit');
  }
}

// Render list
function renderList() {
  let sorted = [...transactions];
  const sortVal = sortSelect.value;

  if (sortVal === 'amount-asc') sorted.sort((a, b) => a.amount - b.amount);
  else if (sortVal === 'amount-desc') sorted.sort((a, b) => b.amount - a.amount);
  else if (sortVal === 'category') sorted.sort((a, b) => a.category.localeCompare(b.category));

  const total = transactions.reduce((sum, t) => sum + t.amount, 0);

  transactionList.innerHTML = '';
  sorted.forEach(t => {
    const li = document.createElement('li');
    const isOver = spendingLimit > 0 && total > spendingLimit;
    li.className = 'transaction-item' + (isOver ? ' highlight' : '');
    li.innerHTML = `
      <span class="t-name">${t.name}</span>
      <span class="t-category">${t.category}</span>
      <span class="t-amount">Rp ${t.amount.toLocaleString('id-ID')}</span>
      <button onclick="deleteTransaction(${t.id})">Delete</button>
    `;
    transactionList.appendChild(li);
  });
}

// Render chart
function renderChart() {
  const data = categories.map(cat =>
    transactions.filter(t => t.category === cat).reduce((sum, t) => sum + t.amount, 0)
  );

  const colors = categories.map((_, i) =>
    `hsl(${(i * 360 / categories.length)}, 70%, 60%)`
  );

  const ctx = document.getElementById('expense-chart').getContext('2d');
  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: categories,
      datasets: [{ data, backgroundColor: colors }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom' } }
    }
  });
}

// Sort listener
sortSelect.addEventListener('change', render);

// Main render
function render() {
  updateBalance();
  renderList();
  renderChart();
}

// Init
renderCategoryOptions();
render();
