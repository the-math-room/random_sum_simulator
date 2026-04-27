import { presets } from "./presets.js";
import { parseOutcomes } from "./parser.js";
import { runSimulation } from "./simulator.js";
import {
  addRandomObjectRow,
  clearResults,
  populatePresetSelect,
  renderHistogram,
  renderStats
} from "./render.js";

const elements = {
  preset: document.getElementById("preset"),
  presetQty: document.getElementById("presetQty"),
  addPreset: document.getElementById("addPreset"),
  clearObjects: document.getElementById("clearObjects"),
  objectsBody: document.getElementById("objectsBody"),
  trials: document.getElementById("trials"),
  maxRows: document.getElementById("maxRows"),
  run: document.getElementById("run"),
  error: document.getElementById("error"),
  stats: document.getElementById("stats"),
  chart: document.getElementById("chart")
};

initialize();

function initialize() {
  populatePresetSelect(elements.preset, presets);

  elements.addPreset.addEventListener("click", handleAddPreset);
  elements.clearObjects.addEventListener("click", handleClearObjects);
  elements.run.addEventListener("click", handleRunSimulation);

  addStarterObjects();
}

function handleAddPreset() {
  const presetKey = elements.preset.value;
  const quantity = Number(elements.presetQty.value);
  const preset = presets[presetKey];

  addRandomObjectRow({
    tableBody: elements.objectsBody,
    name: preset.name,
    quantity,
    outcomes: preset.outcomes
  });
}

function handleClearObjects() {
  elements.objectsBody.innerHTML = "";

  clearResults({
    statsBox: elements.stats,
    chartBox: elements.chart,
    errorBox: elements.error
  });
}

function handleRunSimulation() {
  clearResults({
    statsBox: elements.stats,
    chartBox: elements.chart,
    errorBox: elements.error
  });

  try {
    const randomObjects = getRandomObjectsFromPage();
    const trials = getTrials();
    const maxRows = getMaxRows();

    const result = runSimulation({
      randomObjects,
      trials
    });

    renderStats(elements.stats, result.stats);
    renderHistogram(elements.chart, result.counts, trials, maxRows, result.expected);
  } catch (error) {
    elements.error.textContent = error.message;
  }
}

function getRandomObjectsFromPage() {
  const rows = [...elements.objectsBody.querySelectorAll(".object-card")];

  if (rows.length === 0) {
    throw new Error("Add at least one random object first.");
  }

  const randomObjects = rows.map(row => {
    const name = row.querySelector(".object-name").value.trim() || "Unnamed object";
    const quantity = Number(row.querySelector(".object-qty").value);
    const outcomesText = row.querySelector(".object-outcomes").value;

    if (!Number.isInteger(quantity) || quantity < 0) {
      throw new Error(`Quantity for "${name}" must be a non-negative whole number.`);
    }

    return {
      name,
      quantity,
      outcomes: parseOutcomes(outcomesText)
    };
  });

  const activeObjects = randomObjects.filter(object => object.quantity > 0);

  if (activeObjects.length === 0) {
    throw new Error("At least one object must have a quantity greater than zero.");
  }

  return activeObjects;
}

function getTrials() {
  const trials = Number(elements.trials.value);

  if (!Number.isInteger(trials) || trials < 1) {
    throw new Error("Trials must be a positive whole number.");
  }

  return trials;
}

function getMaxRows() {
  const maxRows = Number(elements.maxRows.value);

  if (!Number.isInteger(maxRows) || maxRows < 5) {
    throw new Error("Histogram max rows must be at least 5.");
  }

  return maxRows;
}

function addStarterObjects() {
  addRandomObjectRow({
    tableBody: elements.objectsBody,
    name: "Coin",
    quantity: 3,
    outcomes: presets.coin.outcomes
  });

  addRandomObjectRow({
    tableBody: elements.objectsBody,
    name: "d6",
    quantity: 2,
    outcomes: presets.d6.outcomes
  });

  addRandomObjectRow({
    tableBody: elements.objectsBody,
    name: "Weighted bonus",
    quantity: 1,
    outcomes: "0, 60\n5, 30\n20, 10"
  });
}