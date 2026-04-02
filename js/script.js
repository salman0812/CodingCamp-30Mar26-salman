// Load from LocalStorage
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// Chart instance
let chart = null;

// DOM elements
const addBtn = document.getElementById('add-btn');
const itemName = document.getElementById('item-name');
const itemAmount = document.getElementById('item-amount');
const itemCategory = document.getElementById('item-category');
const totalBalance = document.getElementById('total-balance');
const transactionList = document.getElementById('transaction-list');

// Add transaction
addBtn.addEventListener('click', () => {
  const name = itemName.value.trim();
  const amount = parseFloat(itemAmount.value);
  const category = itemCategory.value;

  if (!name || !amount || !category) {
    alert('Please fill in all fields!');
    return;
  }

  const transaction = {
    id: Date.now(),
    name,
    amount,
    category
  };

  transactions.push(transaction);
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
}

// Render transaction list
function renderList() {
  transactionList.innerHTML = '';
  transactions.forEach(t => {
    const li = document.createElement('li');
    li.className = 'transaction-item';
    li.innerHTML = `
      <span class="t-name">${t.name}</span>
      <span class="t-category">${t.category}</span>
      <span class="t-amount">Rp ${t.amount.toLocaleString('id-ID')}</span>
      <button onclick="deleteTransaction(${t.id})">Delete</button>
    `;
    transactionList.appendChild(li);
  });
}

// Render pie chart
function renderChart() {
  const categories = ['Food', 'Transport', 'Fun'];
  const data = categories.map(cat =>
    transactions.filter(t => t.category === cat).reduce((sum, t) => sum + t.amount, 0)
  );

  const ctx = document.getElementById('expense-chart').getContext('2d');

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: categories,
      datasets: [{
        data,
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
}

// Main render
function render() {
  updateBalance();
  renderList();
  renderChart();
}

// Init
render();
