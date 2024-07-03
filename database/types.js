const client = require("./index");
const { getLargest, getSmallest } = require("../util");
const { types } = require('../seed/data');

// Best function there is
function generateType({ ranks, suits, values }) {
  const scoreCard = {
    nothing:true,
    pair:false,
    twoPair:false,
    threeOfAKind:false,
    straight:false,
    flush:false,
    fullhouse:false,
    fourOfAKind:false,
    straightFlush:false,
    royalFlush:false,
  };
  const ranksArray = Object.keys(ranks);
  ranksArray.forEach((rank) => {
    rank = Number(rank);
    
    if (ranks[rank] === 2) {
      if (scoreCard.pair) {
        scoreCard.twoPair = true;
      };
      if (scoreCard.threeOfAKind) {
        scoreCard.fullhouse = true;
      };
      scoreCard.pair = true;
    };
    
    if (ranks[rank] === 3) {
      if (scoreCard.pair) {
        scoreCard.fullhouse = true;
      };
      scoreCard.threeOfAKind = true;
    };
    
    if (ranks[rank] === 4) {
      scoreCard.fourOfAKind = true;
    };
    
    if (Object.keys(suits).length === 1) {
      scoreCard.flush = true;
    };
    
  });
  
  const straightValues = values;
  const largestValue_preAceCheck = getLargest(straightValues);
  const smallestValue_preAceCheck = getSmallest(straightValues);
  if (largestValue_preAceCheck === 14 && smallestValue_preAceCheck === 2) {
    straightValues.pop()
    straightValues.unshift(1);
  };

  const largestValue = getLargest(straightValues);
  const smallestValue = getSmallest(straightValues);

  if (largestValue - smallestValue === 4) {
    const slice = straightValues.slice(0, -1);
    let count = 0;
    for (let n of slice) {
      if (straightValues[slice.indexOf(n) + 1] === n + 1) {
        count += 1;
      };
    };
    if (count === 4) scoreCard.straight = true;
  };

  if (scoreCard.flush && scoreCard.straight) {
    scoreCard.straightFlush = true;
  };

  if (scoreCard.straightFlush && getSmallest(values) === 10) {
    scoreCard.royalFlush = true;
  };
  const returnObj = { id: 0, name: null }
  const keys = Object.keys(scoreCard).reverse();
  const possibleTypeIds = [];
  keys.forEach(key => {
    if (scoreCard[key]) {
      possibleTypeIds.push(Object.keys(scoreCard).indexOf(key));
    }
  })
  const typeId = getLargest(possibleTypeIds);
  const type = types[typeId]
  return types[typeId];
};

async function getTypeById(id) {
  const SQL = `SELECT name FROM types WHERE id = $1`
  try {
    const { rows: [type] } = await client.query(SQL, [id])
    return type
  } catch (error) {
    console.error(error);
  };
};

module.exports = { generateType, getTypeById };