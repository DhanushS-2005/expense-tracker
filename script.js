// Enhanced Expense Tracker with more features

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let editingIndex = null;
let deletingIndex = null;

// Transaction categories
const categories = {
  income: ['Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Other'],
  expense: ['Food & Dining', 'Shopping', 'Transportation', 'Entertainment', 'Bills & Utilities', 'Healthcare', 'Education', 'Other']
};

// Initialize date fields
document.addEventListener('DOMContentLoaded', function() {
  // Set current date in forms
  const dateInputs = document.querySelectorAll('input[type="date"]');
  const today = new Date().toISOString().split('T')[0];
  dateInputs.forEach(input => {
    if (!input.value) input.value = today;
  });

  // Set current date in dashboard
  const currentDateEl = document.getElementById('currentDate');
  if (currentDateEl) {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateEl.textContent = now.toLocaleDateString('en-US', options);
  }

  // Initialize category dropdown in add.html
  initializeCategoryDropdown();
  
  // Load appropriate page
  loadPage();
});

function loadPage() {
  if (document.getElementById('balance')) {
    loadDashboard();
  }
  if (document.getElementById('transactionForm')) {
    initializeTransactionForm();
  }
  if (document.getElementById('transactionList')) {
    loadHistory();
    populateCategoryFilter();
  }
}

// Dashboard Functions
function loadDashboard() {
  updateDashboardStats();
  updateCharts();
  loadRecentTransactions();
}

function updateDashboardStats() {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  let totalIncome = 0;
  let totalExpense = 0;
  let monthIncome = 0;
  let monthExpense = 0;
  let totalTransactions = transactions.length;
  let monthTransactions = 0;

  transactions.forEach(t => {
    const transDate = new Date(t.date);
    const isCurrentMonth = transDate.getMonth() === currentMonth && 
                          transDate.getFullYear() === currentYear;
    
    if (t.type === 'income') {
      totalIncome += t.amount;
      if (isCurrentMonth) monthIncome += t.amount;
    } else {
      totalExpense += t.amount;
      if (isCurrentMonth) monthExpense += t.amount;
    }
    
    if (isCurrentMonth) monthTransactions++;
  });

  const balance = totalIncome - totalExpense;
  const netMonthly = monthIncome - monthExpense;
  const savingsRate = monthIncome > 0 ? Math.round((netMonthly / monthIncome) * 100) : 0;

  // Update UI
  document.getElementById('balance').textContent = `₹${balance.toLocaleString()}`;
  document.getElementById('income').textContent = `₹${totalIncome.toLocaleString()}`;
  document.getElementById('expense').textContent = `₹${totalExpense.toLocaleString()}`;
  document.getElementById('monthIncome').textContent = `₹${monthIncome.toLocaleString()}`;
  document.getElementById('monthExpense').textContent = `₹${monthExpense.toLocaleString()}`;
  document.getElementById('totalTransactions').textContent = totalTransactions;
  document.getElementById('monthTransactions').textContent = monthTransactions;
  document.getElementById('netMonthly').textContent = `₹${netMonthly.toLocaleString()}`;
  document.getElementById('savingsRate').textContent = `${savingsRate}%`;
  
  // Update balance color
  const balanceEl = document.getElementById('balance');
  if (balance < 0) {
    balanceEl.style.color = 'var(--danger)';
  } else if (balance > 0) {
    balanceEl.style.color = 'var(--success)';
  } else {
    balanceEl.style.color = 'var(--primary)';
  }
}

function updateCharts() {
  // Expense Distribution Chart
  const expenseCategories = {};
  const monthlyData = Array(12).fill(0);
  
  transactions.forEach(t => {
    if (t.type === 'expense') {
      expenseCategories[t.category] = (expenseCategories[t.category] || 0) + t.amount;
    }
    
    // Monthly data
    const date = new Date(t.date);
    const month = date.getMonth();
    if (t.type === 'income') {
      monthlyData[month] += t.amount;
    }
  });

  const expenseCtx = document.getElementById('expenseChart');
  if (expenseCtx) {
    new Chart(expenseCtx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(expenseCategories),
        datasets: [{
          data: Object.values(expenseCategories),
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
            '#9966FF', '#FF9F40', '#C9CBCF', '#4D5360'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  // Monthly Overview Chart
  const monthlyCtx = document.getElementById('monthlyChart');
  if (monthlyCtx) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    new Chart(monthlyCtx, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [{
          label: 'Income',
          data: monthlyData,
          backgroundColor: 'rgba(76, 201, 240, 0.7)',
          borderColor: 'rgba(76, 201, 240, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: value => '₹' + value
            }
          }
        }
      }
    });
  }
}

function loadRecentTransactions() {
  const recentList = document.getElementById('recentTransactions');
  const emptyRecent = document.getElementById('emptyRecent');
  
  if (!recentList) return;
  
  // Sort by date (newest first)
  const sorted = [...transactions].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  ).slice(0, 5);
  
  if (sorted.length === 0) {
    recentList.innerHTML = '';
    emptyRecent.style.display = 'block';
    return;
  }
  
  emptyRecent.style.display = 'none';
  recentList.innerHTML = sorted.map(t => `
    <li class="transaction-item">
      <div class="transaction-info">
        <div class="transaction-title">${t.text}</div>
        <div class="transaction-date">${formatDate(t.date)} • ${t.category}</div>
      </div>
      <div class="transaction-amount ${t.type}-amount">
        ${t.type === 'income' ? '+' : '-'}₹${t.amount.toLocaleString()}
      </div>
    </li>
  `).join('');
}

// Transaction Form Functions
function initializeCategoryDropdown() {
  const categorySelect = document.getElementById('category');
  const typeSelect = document.getElementById('type');
  
  if (categorySelect && typeSelect) {
    typeSelect.addEventListener('change', toggleCategory);
    toggleCategory();
  }
}

function toggleCategory() {
  const typeSelect = document.getElementById('type');
  const categorySelect = document.getElementById('category');
  
  if (!typeSelect || !categorySelect) return;
  
  const type = typeSelect.value;
  categorySelect.innerHTML = '<option value="">Select Category</option>';
  
  if (categories[type]) {
    categories[type].forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      categorySelect.appendChild(option);
    });
  }
}

function initializeTransactionForm() {
  const form = document.getElementById('transactionForm');
  if (!form) return;
  
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const transaction = {
      type: document.getElementById('type').value,
      category: document.getElementById('category').value,
      text: document.getElementById('text').value,
      amount: parseFloat(document.getElementById('amount').value),
      date: document.getElementById('date').value,
      notes: document.getElementById('notes').value,
      createdAt: new Date().toISOString()
    };
    
    if (editingIndex !== null) {
      // Update existing transaction
      transactions[editingIndex] = transaction;
      editingIndex = null;
      showNotification('Transaction updated successfully!', 'success');
    } else {
      // Add new transaction
      transactions.push(transaction);
      showNotification('Transaction added successfully!', 'success');
    }
    
    saveTransactions();
    form.reset();
    
    // Set default date
    document.getElementById('date').value = new Date().toISOString().split('T')[0];
    
    // Redirect to dashboard if not editing
    if (window.location.pathname.includes('add.html') && !window.location.search.includes('edit')) {
      setTimeout(() => window.location.href = 'index.html', 1500);
    }
  });
}

function quickAdd(type, text, amount) {
  const transaction = {
    type: type,
    category: type === 'income' ? 'Salary' : 'Food & Dining',
    text: text,
    amount: amount,
    date: new Date().toISOString().split('T')[0],
    notes: 'Quick add',
    createdAt: new Date().toISOString()
  };
  
  transactions.push(transaction);
  saveTransactions();
  showNotification('Transaction added!', 'success');
  
  // Update form fields
  if (document.getElementById('type')) {
    document.getElementById('type').value = type;
    toggleCategory();
    document.getElementById('category').value = transaction.category;
    document.getElementById('text').value = text;
    document.getElementById('amount').value = amount;
  }
}

// History Functions
function loadHistory() {
  const transactionList = document.getElementById('transactionList');
  const emptyState = document.getElementById('emptyState');
  
  if (!transactionList) return;
  
  // Apply filters
  const filteredTransactions = getFilteredTransactions();
  
  if (filteredTransactions.length === 0) {
    transactionList.innerHTML = '';
    emptyState.style.display = 'block';
    updateFilteredSummary(0, 0);
    return;
  }
  
  emptyState.style.display = 'none';
  
  // Sort by date (newest first)
  const sorted = filteredTransactions.sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );
  
  transactionList.innerHTML = sorted.map((t, index) => `
    <li class="transaction-item fade-in">
      <div class="transaction-info">
        <div class="transaction-title">
          <i class="fas fa-${t.type === 'income' ? 'arrow-down text-success' : 'arrow-up text-danger'}"></i>
          ${t.text}
        </div>
        <div class="transaction-date">
          ${formatDate(t.date)} • ${t.category}
          ${t.notes ? '• ' + t.notes : ''}
        </div>
      </div>
      <div class="transaction-details">
        <div class="transaction-amount ${t.type}-amount">
          ${t.type === 'income' ? '+' : '-'}₹${t.amount.toLocaleString()}
        </div>
        <div class="transaction-actions">
          <button class="action-btn edit-btn" onclick="openEditModal(${index})">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button class="action-btn delete-btn" onclick="openDeleteModal(${index})">
            <i class="fas fa-trash"></i> Delete
          </button>
        </div>
      </div>
    </li>
  `).join('');
  
  // Update summary
  updateFilteredSummary(sorted.length, 
    sorted.reduce((sum, t) => t.type === 'expense' ? sum + t.amount : sum - t.amount, 0));
}

function getFilteredTransactions() {
  const typeFilter = document.getElementById('filterType')?.value || 'all';
  const categoryFilter = document.getElementById('filterCategory')?.value || 'all';
  const monthFilter = document.getElementById('filterMonth')?.value || 'all';
  
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  return transactions.filter(t => {
    // Type filter
    if (typeFilter !== 'all' && t.type !== typeFilter) return false;
    
    // Category filter
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
    
    // Month filter
    if (monthFilter !== 'all') {
      const transDate = new Date(t.date);
      const transMonth = transDate.getMonth();
      const transYear = transDate.getFullYear();
      
      switch(monthFilter) {
        case 'current':
          if (transMonth !== currentMonth || transYear !== currentYear) return false;
          break;
        case 'last':
          let lastMonth = currentMonth - 1;
          let lastYear = currentYear;
          if (lastMonth < 0) {
            lastMonth = 11;
            lastYear--;
          }
          if (transMonth !== lastMonth || transYear !== lastYear) return false;
          break;
        case 'last3':
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
          if (transDate < threeMonthsAgo) return false;
          break;
      }
    }
    
    return true;
  });
}

function filterTransactions() {
  loadHistory();
}

function clearFilters() {
  if (document.getElementById('filterType')) {
    document.getElementById('filterType').value = 'all';
    document.getElementById('filterCategory').value = 'all';
    document.getElementById('filterMonth').value = 'all';
    loadHistory();
  }
}

function updateFilteredSummary(count, total) {
  const countEl = document.getElementById('filteredCount');
  const totalEl = document.getElementById('filteredTotal');
  
  if (countEl) countEl.textContent = `${count} transaction${count !== 1 ? 's' : ''}`;
  if (totalEl) totalEl.textContent = `₹${Math.abs(total).toLocaleString()} ${total < 0 ? '(Expense)' : '(Income)'}`;
}

function populateCategoryFilter() {
  const categoryFilter = document.getElementById('filterCategory');
  if (!categoryFilter) return;
  
  // Get all unique categories from transactions
  const allCategories = [...new Set(transactions.map(t => t.category).filter(Boolean))];
  
  allCategories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
}

// Modal Functions
function openEditModal(index) {
  editingIndex = index;
  const transaction = transactions[index];
  
  document.getElementById('editText').value = transaction.text;
  document.getElementById('editAmount').value = transaction.amount;
  document.getElementById('editDate').value = transaction.date;
  document.getElementById('editType').value = transaction.type;
  
  // Populate category dropdown
  const editCategory = document.getElementById('editCategory');
  if (editCategory) {
    editCategory.innerHTML = '';
    categories[transaction.type].forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      if (category === transaction.category) option.selected = true;
      editCategory.appendChild(option);
    });
  }
  
  document.getElementById('editModal').style.display = 'flex';
}

function closeEditModal() {
  editingIndex = null;
  document.getElementById('editModal').style.display = 'none';
  document.getElementById('editForm').reset();
}

function openDeleteModal(index) {
  deletingIndex = index;
  const transaction = transactions[index];
  
  document.getElementById('deletePreviewText').textContent = transaction.text;
  document.getElementById('deletePreviewAmount').textContent = 
    `${transaction.type === 'income' ? '+' : '-'}₹${transaction.amount}`;
  document.getElementById('deletePreviewDate').textContent = formatDate(transaction.date);
  
  document.getElementById('deleteModal').style.display = 'flex';
}

function closeDeleteModal() {
  deletingIndex = null;
  document.getElementById('deleteModal').style.display = 'none';
}

function confirmDelete() {
  if (deletingIndex !== null) {
    transactions.splice(deletingIndex, 1);
    saveTransactions();
    showNotification('Transaction deleted!', 'warning');
    closeDeleteModal();
    loadHistory();
    if (document.getElementById('balance')) {
      updateDashboardStats();
      updateCharts();
      loadRecentTransactions();
    }
  }
}

// Utility Functions
function saveTransactions() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function showNotification(message, type) {
  // Remove existing notifications
  const existingNotification = document.querySelector('.notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
    <span>${message}</span>
  `;
  
  // Add styles
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? 'var(--success)' : 'var(--warning)'};
    color: white;
    padding: 15px 25px;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    display: flex;
    align-items: center;
    gap: 10px;
    z-index: 1000;
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Add CSS animations for notification
if (!document.querySelector('#notification-styles')) {
  const style = document.createElement('style');
  style.id = 'notification-styles';
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

// Export/Import functionality (bonus feature)
function exportData() {
  const dataStr = JSON.stringify(transactions, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `expense-tracker-${new Date().toISOString().split('T')[0]}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        transactions = imported;
        saveTransactions();
        showNotification('Data imported successfully!', 'success');
        loadPage();
      } else {
        showNotification('Invalid file format', 'warning');
      }
    } catch (error) {
      showNotification('Error importing file', 'warning');
    }
  };
  reader.readAsText(file);
}

// Add export/import buttons to navigation (optional)
function addExportImportButtons() {
  const nav = document.querySelector('.nav-links');
  if (nav && !document.querySelector('.export-btn')) {
    const exportBtn = document.createElement('a');
    exportBtn.className = 'export-btn';
    exportBtn.innerHTML = '<i class="fas fa-download"></i> Export';
    exportBtn.href = '#';
    exportBtn.onclick = (e) => {
      e.preventDefault();
      exportData();
    };
    
    const importBtn = document.createElement('a');
    importBtn.className = 'import-btn';
    importBtn.innerHTML = '<i class="fas fa-upload"></i> Import';
    importBtn.href = '#';
    
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.style.display = 'none';
    fileInput.onchange = importData;
    
    importBtn.onclick = (e) => {
      e.preventDefault();
      fileInput.click();
    };
    
    nav.appendChild(exportBtn);
    nav.appendChild(importBtn);
    document.body.appendChild(fileInput);
  }
}

// Call this function after DOM loads
setTimeout(addExportImportButtons, 1000);