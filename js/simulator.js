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

  const simulatedMean = total / trials;
  const simulatedVariance = totalSquared / trials - simulatedMean * simulatedMean;
  const simulatedStandardDeviation = Math.sqrt(Math.max(0, simulatedVariance));

  const expected = calculateExpectedStats(randomObjects);

  return {
    counts,
    expected,
    stats: {
      trials,
      mean: simulatedMean,
      standardDeviation: simulatedStandardDeviation,
      expectedMean: expected.mean,
      expectedStandardDeviation: expected.standardDeviation,
      min,
      max,
      uniqueSums: counts.size
    }
  };
}

export function calculateExpectedStats(randomObjects) {
  let totalMean = 0;
  let totalVariance = 0;

  for (const object of randomObjects) {
    const singleMean = calculateSingleObjectMean(object.outcomes);
    const singleVariance = calculateSingleObjectVariance(object.outcomes, singleMean);

    totalMean += object.quantity * singleMean;
    totalVariance += object.quantity * singleVariance;
  }

  return {
    mean: totalMean,
    variance: totalVariance,
    standardDeviation: Math.sqrt(Math.max(0, totalVariance))
  };
}

function calculateSingleObjectMean(outcomes) {
  return outcomes.reduce((sum, outcome) => {
    return sum + outcome.value * outcome.probability;
  }, 0);
}

function calculateSingleObjectVariance(outcomes, mean) {
  return outcomes.reduce((sum, outcome) => {
    const difference = outcome.value - mean;
    return sum + difference * difference * outcome.probability;
  }, 0);
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