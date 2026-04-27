import { escapeHtml, formatNumber, roundNice } from "./utils.js";

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
    <div class="stat">Mean <strong>${formatNumber(stats.mean)}</strong></div>
    <div class="stat">Std. dev. <strong>${formatNumber(stats.standardDeviation)}</strong></div>
    <div class="stat">Min <strong>${formatNumber(stats.min)}</strong></div>
    <div class="stat">Max <strong>${formatNumber(stats.max)}</strong></div>
    <div class="stat">Unique sums <strong>${formatNumber(stats.uniqueSums)}</strong></div>
  `;
}

export function renderHistogram(chartBox, counts, trials, maxRows) {
  let entries = [...counts.entries()]
    .sort((a, b) => Number(a[0]) - Number(b[0]));

  if (entries.length > maxRows) {
    entries = bucketEntries(entries, maxRows);
  } else {
    entries = entries.map(([label, count]) => ({
      label: String(label),
      count
    }));
  }

  const maxCount = Math.max(...entries.map(entry => entry.count));

  chartBox.innerHTML = `
    <div class="vertical-histogram">
      <div class="y-axis-label">Frequency</div>

      <div class="plot-area">
        ${entries.map(entry => {
          const percent = entry.count / trials * 100;
          const height = entry.count / maxCount * 100;

          return `
            <div class="histogram-bar-wrapper" title="Sum: ${escapeHtml(entry.label)}
Frequency: ${entry.count}
Percent: ${percent.toFixed(2)}%">
              <div class="histogram-bar-value">${entry.count}</div>
              <div 
                class="histogram-bar" 
                style="height: ${height}%"
              ></div>
              <div class="histogram-x-label">${escapeHtml(entry.label)}</div>
            </div>
          `;
        }).join("")}
      </div>

      <div class="x-axis-label">Sum</div>
    </div>
  `;
}

export function clearResults({ statsBox, chartBox, errorBox }) {
  statsBox.innerHTML = "";
  chartBox.innerHTML = "";
  errorBox.textContent = "";
}

function bucketEntries(entries, maxRows) {
  const values = entries.map(([value]) => Number(value));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const bucketCount = maxRows;
  const bucketSize = (max - min + 1) / bucketCount;

  const buckets = Array.from({ length: bucketCount }, (_, i) => {
    const start = min + i * bucketSize;
    const end = min + (i + 1) * bucketSize;

    return {
      start,
      end,
      count: 0
    };
  });

  for (const [value, count] of entries) {
    const index = Math.min(
      bucketCount - 1,
      Math.floor((Number(value) - min) / bucketSize)
    );

    buckets[index].count += count;
  }

  return buckets
    .filter(bucket => bucket.count > 0)
    .map(bucket => ({
      label: `${roundNice(bucket.start)}–${roundNice(bucket.end)}`,
      count: bucket.count
    }));
}