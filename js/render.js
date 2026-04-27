import { escapeHtml, formatNumber, roundNice } from "./utils.js";

export function clearResults({ statsBox, chartBox, errorBox }) {
  statsBox.innerHTML = "";
  chartBox.innerHTML = "";
  errorBox.textContent = "";
}

export function populatePresetSelect(selectElement, presets) {
  selectElement.innerHTML = "";

  for (const [key, preset] of Object.entries(presets)) {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = preset.label;
    selectElement.appendChild(option);
  }
}

export function addRandomObjectRow({ tableBody, name, quantity, outcomes }) {
  const card = document.createElement("article");
  card.className = "object-card";

  card.innerHTML = `
    <div class="object-card-header">
      <label>
        Name
        <input class="object-name" value="${escapeHtml(name)}" />
      </label>

      <label>
        Qty
        <input class="object-qty" type="number" min="0" value="${quantity}" />
      </label>
    </div>

    <label>
      Outcomes
      <textarea class="object-outcomes">${escapeHtml(outcomes)}</textarea>
    </label>

    <div class="object-card-actions">
      <button class="secondary duplicate-row">Duplicate</button>
      <button class="danger remove-row">Remove</button>
    </div>
  `;

  card.querySelector(".remove-row").addEventListener("click", () => {
    card.remove();
  });

  card.querySelector(".duplicate-row").addEventListener("click", () => {
    addRandomObjectRow({
      tableBody,
      name: card.querySelector(".object-name").value,
      quantity: card.querySelector(".object-qty").value,
      outcomes: card.querySelector(".object-outcomes").value
    });
  });

  tableBody.appendChild(card);
}

export function renderStats(statsBox, stats) {
  statsBox.innerHTML = `
    <div class="stat">Trials <strong>${formatNumber(stats.trials)}</strong></div>
    <div class="stat">Sim mean <strong>${formatNumber(stats.mean)}</strong></div>
    <div class="stat">Expected mean <strong>${formatNumber(stats.expectedMean)}</strong></div>
    <div class="stat">Expected σ <strong>${formatNumber(stats.expectedStandardDeviation)}</strong></div>
    <div class="stat">Within ±1σ <strong>${formatNumber(stats.withinOneExpectedStandardDeviationPercent)}%</strong></div>
    <div class="stat">Count in ±1σ <strong>${formatNumber(stats.withinOneExpectedStandardDeviationCount)}</strong></div>
  `;
}

export function renderHistogram(chartBox, counts, trials, maxRows, expected) {
  let entries = [...counts.entries()]
    .map(([value, count]) => ({
      value: Number(value),
      count
    }))
    .sort((a, b) => a.value - b.value);

  if (entries.length === 0) {
    chartBox.innerHTML = "";
    return;
  }

  const range = getExpectedDisplayRange(entries, expected);
  const bins = createCenteredIntegerBins(entries, range.min, range.max, maxRows);

  const maxCount = Math.max(...bins.map(bin => bin.count), 1);

  chartBox.innerHTML = `
    <div class="vertical-histogram">
      <div class="y-axis-label">Frequency</div>

      <div class="plot-area">
        ${bins.map(bin => {
          const percent = bin.count / trials * 100;
          const height = bin.count / maxCount * 100;

          return `
            <div class="histogram-bar-wrapper" title="Sum: ${escapeHtml(bin.label)}
Frequency: ${bin.count}
Percent: ${percent.toFixed(2)}%">
              <div class="histogram-bar-value">${bin.count}</div>
              <div 
                class="histogram-bar" 
                style="height: ${height}%"
              ></div>
              <div class="histogram-x-label">${escapeHtml(bin.label)}</div>
            </div>
          `;
        }).join("")}
      </div>

      <div class="x-axis-label">
        Sum, centered on expected mean ± 4σ
      </div>
    </div>
  `;
}

function getExpectedDisplayRange(entries, expected) {
  const observedMin = Math.min(...entries.map(entry => entry.value));
  const observedMax = Math.max(...entries.map(entry => entry.value));

  if (
    !expected ||
    !Number.isFinite(expected.mean) ||
    !Number.isFinite(expected.standardDeviation) ||
    expected.standardDeviation === 0
  ) {
    return {
      min: Math.floor(observedMin),
      max: Math.ceil(observedMax)
    };
  }

  return {
    min: Math.floor(expected.mean - 4 * expected.standardDeviation),
    max: Math.ceil(expected.mean + 4 * expected.standardDeviation)
  };
}

function createCenteredIntegerBins(entries, min, max, maxBins) {
  const totalIntegerValues = max - min + 1;
  const interiorBinCount = Math.min(maxBins, totalIntegerValues);
  const bucketSize = Math.max(1, Math.ceil(totalIntegerValues / interiorBinCount));

  const bins = [];

  bins.push({
    start: -Infinity,
    end: min - 1,
    label: `< ${min}`,
    count: 0
  });

  for (let start = min; start <= max; start += bucketSize) {
    const end = Math.min(max, start + bucketSize - 1);

    bins.push({
      start,
      end,
      label: start === end ? String(start) : `${start}–${end}`,
      count: 0
    });
  }

  bins.push({
    start: max + 1,
    end: Infinity,
    label: `> ${max}`,
    count: 0
  });

  for (const entry of entries) {
    const matchingBin = bins.find(bin => {
      return entry.value >= bin.start && entry.value <= bin.end;
    });

    if (matchingBin) {
      matchingBin.count += entry.count;
    }
  }

  return bins.filter(bin => bin.count > 0 || Number.isFinite(bin.start));
}