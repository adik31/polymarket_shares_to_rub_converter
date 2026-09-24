const rateInput = document.getElementById('rate');
const status = document.getElementById('status');

chrome.storage.sync.get({ rubRate: 0 }, (data) => {
  rateInput.value = data.rubRate || '';
});

document.getElementById('save').addEventListener('click', () => {
  const val = parseFloat(rateInput.value);
  if (!val || val <= 0) {
    status.style.color = '#dc2626';
    status.textContent = 'Введите положительное число';
    return;
  }
  chrome.storage.sync.set({ rubRate: val }, () => {
    status.style.color = '#16a34a';
    status.textContent = 'Сохранено ✓';
    setTimeout(() => status.textContent = '', 1500);
  });
});