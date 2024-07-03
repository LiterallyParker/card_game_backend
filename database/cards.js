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

async function generateHand() {

  // Builds handIds Array
  const cardIds = generateCardIds();
  // Get cards based on random array of 5 ids
  const cards = await getCardsFromIds(cardIds);
  // score the cards
  const result = await attachScore(cards);
  result.cardIds = cardIds

  return result;

};

async function getCardsFromIds(ids = []) {
  try {
    const cards = [];
    for (let id of ids) {
      let card = await getCardById(id);
      cards.push(card);
    }
    return cards;
  } catch (error) {
    console.error(error);
  };
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
    suits[card.suit] += 1
  })
  return suits;
}

function getValues(cards) {
  const values = [];
  cards.forEach((card) => {
    values.push(card.value);
  });
  values.sort((other, value) => other - value);
  return values;
}

function getHighCard(cards) {
  const sortedCards = cards.sort((other, card) => {
    if (card.value === other.value) {
      return card.suitId - other.suitId
    }
    return card.value - other.value
    })
  return { id: sortedCards[0].id, value: sortedCards[0].value }
}

function getCardsInfo(cards) {
  const suits = getSuits(cards);
  const ranks = getRanks(cards);
  const values = getValues(cards);
  let highCard = getHighCard(cards);
  return { cards, suits, ranks, values, highCard }
}

async function attachScore(cards) {
  const InfoObject = getCardsInfo(cards);
  const type = generateType({
    ranks: InfoObject.ranks,
    suits: InfoObject.suits,
    values: InfoObject.values
  })
  const { name } = await getTypeById(type.id);
  type.name = name;
  InfoObject.type = type;

  return InfoObject;

}

module.exports = {
  getCards,
  generateHand,
  getCardById,
  getCardsFromIds,
  attachScore
};