export const presets = {
  coin: {
    label: "Coin flip: 0 or 1",
    name: "Coin",
    outcomes: "0\n1"
  },

  d6: {
    label: "d6 die: 1 to 6",
    name: "d6",
    outcomes: "1\n2\n3\n4\n5\n6"
  },

  d10: {
    label: "d10 die: 1 to 10",
    name: "d10",
    outcomes: "1\n2\n3\n4\n5\n6\n7\n8\n9\n10"
  },

  weightedCoin: {
    label: "Weighted coin: 70% tails, 30% heads",
    name: "Weighted coin",
    outcomes: "0, 70\n1, 30"
  },

  weird: {
    label: "Weird object: custom weighted values",
    name: "Weird object",
    outcomes: "-5, 1\n0, 5\n2, 10\n7, 2\n20, 1"
  }
};