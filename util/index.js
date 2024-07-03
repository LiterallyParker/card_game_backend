function generateNumbers(n) {
  const array = []
  for (let i = 1; i <= n; i++) {
    array.push(i);
  };
  return array;
};

function dbFields(fields) {
  const insert = Object.keys(fields).map(
    (key, index) => `"${ key }"=$${ index + 1 }`
  ).join(', ');
  // then we can use: (${ insert }) in our string template
  
  // need something like $1, $2, $3
  const select = Object.keys(fields).map(
    (_, index) => `$${index + 1}`).join(', ');
  // then we can use (${ select }) in our string template

  const vals = Object.values(fields);
  return {insert, select, vals};
}

function generateCardIds() {
  const handLength = 5
  const deckLength = 52
  const cardIds = []
  let ids = generateNumbers(deckLength);
  for (let i = 0; i < handLength; i++) {
    let randomId = Math.ceil(Math.random()*deckLength);
    const existsingId = ids.find((id) => id === randomId);
    if (existsingId) {
      ids = ids.filter((id) => id !== randomId);
      cardIds.push(existsingId);
      continue;
    };
    i--;
  };
  return cardIds;
}

function getLargest(numArray) {
  const result = numArray.reduce((largest, value) => value > largest ? value : largest, -Infinity);
  return result;
}

function getSmallest(numArray) {
  const restult = numArray.reduce((smallest, value) => value < smallest ? value : smallest, Infinity);
  return restult;
}

module.exports = {
  getLargest,
  getSmallest,
  generateCardIds,
  dbFields
};