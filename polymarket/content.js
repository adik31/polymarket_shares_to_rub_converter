(function() {
  'use strict';
  console.log('⚡ Polymarket RUB Converter v1');

  const RUB_CLASS = 'pm-rub-badge';

  let rubRate = 0;

  // Загружаем курс
  chrome.storage.sync.get({ rubRate: 0 }, (data) => {
    rubRate = parseFloat(data.rubRate) || 0;
    console.log('💱 Курс ₽:', rubRate);
    updateAllRubBadges();
  });

  // Слушаем изменения курса
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes.rubRate) {
      rubRate = parseFloat(changes.rubRate.newValue) || 0;
      console.log('💱 Курс обновлён:', rubRate);
      updateAllRubBadges();
    }
  });

  // ===== Форматирование =====
  function formatRub(amount) {
    if (amount >= 1_000_000) return (amount / 1_000_000).toFixed(2) + 'M ₽';
    if (amount >= 1000) return (amount / 1000).toFixed(2) + 'K ₽';
    return amount.toFixed(2) + ' ₽';
  }

  function parseShares(text) {
    const cleaned = text.replace(/\s+/g, '');
    let normalized = cleaned;
    if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(cleaned)) {
      // US: 5,641.23 → 5641.23
      normalized = cleaned.replace(/,/g, '');
    } else if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(cleaned)) {
      // EU: 5.641,23 → 5641.23
      normalized = cleaned.replace(/\./g, '').replace(',', '.');
    } else if (/^\d+,\d{3}$/.test(cleaned)) {
      // 5,641 → 5641 (запятая — тысячи)
      normalized = cleaned.replace(',', '');
    } else {
      // 5,64 → 5.64
      normalized = cleaned.replace(',', '.');
    }
    const val = parseFloat(normalized);
    return isNaN(val) ? null : val;
  }

  // ===== Бейджи рублей =====
  // Ищем span вида "5,641 @ 1.82"
  const SHARES_PRICE_RE = /^([\d\s.,]+)\s*@\s*([\d.,]+)$/;

  function updateAllRubBadges() {
    if (!rubRate) return;
    const spans = document.querySelectorAll('span');
    spans.forEach(span => {
      if (span.children.length > 0) return;
      const text = (span.textContent || '').trim();
      const m = text.match(SHARES_PRICE_RE);
      if (!m) return;

      const shares = parseShares(m[1]);
      if (!shares) return;

      const rub = shares * rubRate;
      const display = formatRub(rub);

      let badge = span.parentElement && span.parentElement.querySelector('.' + RUB_CLASS);
      if (badge) {
        if (badge.dataset.rub !== display) {
          badge.textContent = ' ≈ ' + display;
          badge.dataset.rub = display;
        }
      } else {
        badge = document.createElement('span');
        badge.className = RUB_CLASS;
        badge.textContent = ' ≈ ' + display;
        badge.dataset.rub = display;
        badge.style.cssText = 'color:#22c55e; font-weight:bold; font-size:11px; margin-left:6px; vertical-align:middle; pointer-events:none;';
        if (span.nextSibling) {
          span.parentElement.insertBefore(badge, span.nextSibling);
        } else {
          span.parentElement.appendChild(badge);
        }
      }
    });
  }

  // ===== Цикл =====
  function loop() {
    updateAllRubBadges();
    setTimeout(loop, 500);
  }
  loop();

  // Observer на изменения
  const observer = new MutationObserver((mutations) => {
    if (mutations.some(m => m.type === 'characterData' || m.addedNodes.length > 0)) {
      updateAllRubBadges();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });

  setTimeout(updateAllRubBadges, 300);
  setTimeout(updateAllRubBadges, 900);
  setTimeout(updateAllRubBadges, 1800);

  console.log('⚡ Polymarket RUB Converter запущен');
})();