const client = require("../database");
const { generateCardIds } = require("../util");
const { generateType, getTypeById } = require("../database/types");
async function getCards() {
  const SQL = `
  SELECT cards.id as id, suits.name as suit, ranks.name as rank, ranks.value as value, suits."imageUrl" as "imageUrl" FROM cards
  JOIN suits on suits.id = cards."suitId"
  JOIN ranks on ranks.id = cards."rankId"
  `
  try {
    const { rows } = await client.query(SQL);
    return rows;

  } catch (error) {
    console.error(error);

  };
};

async function getCardById(id) {
  const SQL = `
  SELECT cards.id as id, suits.name as suit, suits.id as "suitId", ranks.name as rank, ranks.value as value, suits."imageUrl" as "imageUrl"
  FROM cards   
  JOIN suits on suits.id = cards."suitId"
  JOIN ranks on ranks.id = cards."rankId"
  WHERE cards.id = $1
  `
  try {
    const { rows: [card] } = await client.query(SQL, [id])
    return card;
  } catch (error) {
    console.error(error);
  };
};

async function generateRandomHand() {
  const cardIds = generateCardIds();
  const hand = await generateHand(cardIds);
  return hand;
}

async function generateHand(cardIds) {
  
  // Get cards
  const cards = await getCardsFromIds(cardIds);
  // score the cards
  const unsortedHand = await attachScore(cards);
  // sort the cards
  const hand = sortCards(unsortedHand);

  return hand;
  
};
const sortCards = (hand) => {
  const { ranks, cards } = hand;
  cards.sort((other, card) => {
    if (other.value === card.value) {
      return card.suitId - other.suitId;
    };
    return card.value - other.value;
  });
  cards.sort((other, card) => ranks[card.value] - ranks[other.value])
  hand.cardIds = hand.cards.map(card => card.id);
  return hand;
};

async function getCardsFromIds(cardIds = []) {
  const cards = []
  for (let id of cardIds) {
    cards.push(await getCardById(id));
  }
  return cards;
};

function getRanks(cards) {
  const ranks = {}
  cards.forEach((card) => {
    if (ranks[card.value] === undefined) {
      ranks[card.value] = 0;
    };
    ranks[card.value] += 1
  })
  return ranks;
}

function getSuits(cards) {
  const suits = {}
  cards.forEach((card) => {
    if (suits[card.suit] === undefined) {
      suits[card.suit] = 0;
    };
    suits[card.suit] += 1;
  });
  return suits;
};

function getValues(cards) {
  const values = [];
  cards.forEach((card) => {
    values.push(card.value);
  });
  return values;
}

async function getValuesFromIds(cardIds) {
  const SQL = `
  SELECT ranks.value as value
  FROM cards
  WHERE id = $1
  JOIN ranks ON ranks.id = cards."rankId"
  `
  try {
    const values = []
    for (let id of cardIds) {
      const { rows: [card] } = await client.query(SQL, [id]);
      values.push(card.value);
    }
    return values;
  } catch (error) {
    
  }
}

async function getValuesFromIds(ids = []) {
  const SQL = `
  SELECT ranks.value as value
  FROM cards
  JOIN suits on suits.id = cards."suitId"
  JOIN ranks on ranks.id = cards."rankId"
  WHERE cards.id = $1
  `
  try {
    const values = []
    for (let id of ids) {
      const { rows: [card] } = await client.query(SQL, [id])
      values.push(card.value);
    }
    return values;
  } catch (error) {
    console.error(error);
  };
}

function sortValues(ranks, values) {
  values.sort((other, value) => value - other);
  values.sort((other, value) => ranks[value] - ranks[other]);
  return values;
};

function getCardsInfo(cards) {
  const suits = getSuits(cards);
  const ranks = getRanks(cards);
  const unsortedValues = getValues(cards);
  const values = sortValues(ranks, unsortedValues);
  return { cards, suits, ranks, values };
};

async function attachScore(hand) {
  const scoredHand = getCardsInfo(hand);
  const type = generateType({
    ranks: scoredHand.ranks,
    suits: scoredHand.suits,
    values: scoredHand.values
  });
  const { name } = await getTypeById(type.id);
  type.name = name;
  scoredHand.type = type;

  return scoredHand;

}

module.exports = {
  getCards,
  generateHand,
  getCardById,
  getValuesFromIds,
  getCardsFromIds,
  getValuesFromIds,
  sortValues,
  sortCards,
  attachScore,
  generateRandomHand
};