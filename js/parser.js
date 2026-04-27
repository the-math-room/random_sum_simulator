export function parseOutcomes(text) {
  const outcomes = [];

  const lines = text
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    const parts = line.split(",").map(part => part.trim());

    const value = Number(parts[0]);
    const weight = parts.length >= 2 ? Number(parts[1]) : 1;

    if (!Number.isFinite(value)) {
      throw new Error(`Invalid outcome value: "${line}"`);
    }

    if (!Number.isFinite(weight) || weight <= 0) {
      throw new Error(`Invalid weight: "${line}". Weight must be positive.`);
    }

    outcomes.push({ value, weight });
  }

  if (outcomes.length === 0) {
    throw new Error("Every object needs at least one outcome.");
  }

  return normalizeWeights(outcomes);
}

function normalizeWeights(outcomes) {
  const totalWeight = outcomes.reduce((sum, item) => sum + item.weight, 0);

  let cumulative = 0;

  const weighted = outcomes.map(item => {
    const probability = item.weight / totalWeight;
    cumulative += probability;

    return {
      value: item.value,
      weight: item.weight,
      probability,
      cumulative
    };
  });

  weighted[weighted.length - 1].cumulative = 1;

  return weighted;
}