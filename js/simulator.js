export function runSimulation({ randomObjects, trials }) {
  const counts = new Map();

  let total = 0;
  let totalSquared = 0;
  let min = Infinity;
  let max = -Infinity;

  for (let trial = 0; trial < trials; trial++) {
    const sum = runSingleTrial(randomObjects);

    counts.set(sum, (counts.get(sum) || 0) + 1);

    total += sum;
    totalSquared += sum * sum;
    min = Math.min(min, sum);
    max = Math.max(max, sum);
  }

  const mean = total / trials;
  const variance = totalSquared / trials - mean * mean;
  const standardDeviation = Math.sqrt(Math.max(0, variance));

  return {
    counts,
    stats: {
      trials,
      mean,
      standardDeviation,
      min,
      max,
      uniqueSums: counts.size
    }
  };
}

function runSingleTrial(randomObjects) {
  let sum = 0;

  for (const object of randomObjects) {
    for (let i = 0; i < object.quantity; i++) {
      sum += pickWeighted(object.outcomes);
    }
  }

  return sum;
}

function pickWeighted(outcomes) {
  const r = Math.random();

  for (const outcome of outcomes) {
    if (r <= outcome.cumulative) {
      return outcome.value;
    }
  }

  return outcomes[outcomes.length - 1].value;
}