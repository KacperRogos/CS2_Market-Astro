// Case calculator interactive logic
// Used on /kalkulator/[slug] pages

interface CalcState {
  quantity: number;
  targetRarity: string;
}

export function initCaseCalculator() {
  const quantityInput = document.getElementById('calc-quantity') as HTMLInputElement;
  const raritySelect = document.getElementById('calc-rarity') as HTMLSelectElement;
  const resultBox = document.getElementById('calc-result');

  if (!quantityInput || !raritySelect || !resultBox) return;

  const DROP_RATES: Record<string, number> = {
    'mil-spec':     0.7992,
    'restricted':   0.1598,
    'classified':   0.032,
    'covert':       0.0064,
    'rare-special': 0.0026,
  };

  const RARITY_LABELS: Record<string, string> = {
    'mil-spec':     'Mil-Spec (niebieski)',
    'restricted':   'Restricted (fioletowy)',
    'classified':   'Classified (różowy)',
    'covert':       'Covert (czerwony)',
    'rare-special': 'Nóż / Rękawice (złote)',
  };

  const keyPrice = parseFloat(document.getElementById('calc-key-price')?.getAttribute('data-price') || '10.49');
  const casePrice = parseFloat(document.getElementById('calc-case-price')?.getAttribute('data-price') || '0.09');
  const costPerOpen = keyPrice + casePrice;

  function calculate() {
    const qty = parseInt(quantityInput.value) || 1;
    const rarity = raritySelect.value;
    const rate = DROP_RATES[rarity] || 0.0064;

    // Probability of getting at least one
    const probAtLeastOne = 1 - Math.pow(1 - rate, qty);

    // Expected number of items
    const expectedCount = qty * rate;

    // Total cost
    const totalCost = qty * costPerOpen;

    // Avg cases needed for guaranteed statistical one
    const avgNeeded = Math.round(1 / rate);
    const avgCost = avgNeeded * costPerOpen;

    resultBox.innerHTML = `
      <div class="calc-results-grid">
        <div class="calc-result-item">
          <span class="calc-result-label">Szansa na przynajmniej 1</span>
          <span class="calc-result-value ${probAtLeastOne > 0.5 ? 'positive' : ''}">${(probAtLeastOne * 100).toFixed(2)}%</span>
        </div>
        <div class="calc-result-item">
          <span class="calc-result-label">Oczekiwana liczba skinów</span>
          <span class="calc-result-value">${expectedCount.toFixed(3)}</span>
        </div>
        <div class="calc-result-item">
          <span class="calc-result-label">Koszt ${qty} otwarć</span>
          <span class="calc-result-value">${totalCost.toFixed(2)} zł</span>
        </div>
        <div class="calc-result-item highlight">
          <span class="calc-result-label">Statystycznie 1 ${RARITY_LABELS[rarity]} co</span>
          <span class="calc-result-value accent">~${avgNeeded} otwarć / ~${avgCost.toFixed(0)} zł</span>
        </div>
      </div>
      <div class="calc-probability-bar">
        <div class="calc-bar-fill" style="width: ${Math.min(probAtLeastOne * 100, 100).toFixed(1)}%"></div>
      </div>
      <p class="calc-bar-label">Prawdopodobieństwo przy ${qty} otwarciach: ${(probAtLeastOne * 100).toFixed(2)}%</p>
    `;
  }

  quantityInput.addEventListener('input', calculate);
  raritySelect.addEventListener('change', calculate);

  // Init
  calculate();
}
