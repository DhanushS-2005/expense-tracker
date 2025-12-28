let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

function save() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

/* ADD INCOME */
const incomeForm = document.getElementById("incomeForm");
if (incomeForm) {
  incomeForm.addEventListener("submit", e => {
    e.preventDefault();

    transactions.push({
      type: "income",
      text: incomeText.value,
      amount: +incomeAmount.value,
      date: incomeDate.value
    });

    save();
    alert("Income Added");
    incomeForm.reset();
  });
}

/* ADD EXPENSE */
const expenseForm = document.getElementById("expenseForm");
if (expenseForm) {
  expenseForm.addEventListener("submit", e => {
    e.preventDefault();

    transactions.push({
      type: "expense",
      text: expenseText.value,
      amount: +expenseAmount.value,
      date: expenseDate.value
    });

    save();
    alert("Expense Added");
    expenseForm.reset();
  });
}

/* DASHBOARD */
const balance = document.getElementById("balance");
if (balance) {
  let income = 0, expense = 0;

  transactions.forEach(t => {
    t.type === "income" ? income += t.amount : expense += t.amount;
  });

  document.getElementById("income").innerText = `₹${income}`;
  document.getElementById("expense").innerText = `₹${expense}`;
  balance.innerText = `₹${income - expense}`;

  new Chart(document.getElementById("expenseChart"), {
    type: "pie",
    data: {
      labels: ["Income", "Expense"],
      datasets: [{
        data: [income, expense],
        backgroundColor: ["#2ecc71", "#e74c3c"]
      }]
    }
  });
}

/* HISTORY */
const list = document.getElementById("list");
if (list) {
  transactions.forEach(t => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${t.text}</strong>
      <span>₹${t.amount} (${t.type})</span>
      <small>${t.date}</small>
    `;
    list.appendChild(li);
  });
}
