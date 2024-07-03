const { arrayBuffer } = require("stream/consumers");
const { getCardsFromIds, getCardById } = require("./cards");
const client = require("./index");

async function getLeaderboard() {
  const SQL = `
  SELECT leaderboard.id as id, leaderboard.card1 as card1, leaderboard.card2 as card2, leaderboard.card3 as card3, leaderboard.card4 as card4, leaderboard.card5 as card5, users.username as username, leaderboard."typeId" as "typeId", types.name as type, leaderboard."highCardId" as "highCardId", leaderboard."highCardValue" as "highCardValue"
  FROM leaderboard
  JOIN users ON users.id = leaderboard."userId"
  JOIN types ON types.id = leaderboard."typeId"
  `
  try {
    const { rows: leaderboardRows } = await client.query(SQL);
    const leaderboard = sortLeaderboard(leaderboardRows);
    leaderboard.forEach(entry => entry.placement = leaderboard.indexOf(entry) + 1);
    return leaderboard;
  } catch (error) {
    console.log(error);
  };
};

function sortLeaderboard(leaderboard) {
  const sortedLeaderboard = leaderboard.sort((other, hand) => {
    if (hand.typeId === other.typeId) {
      if (hand.highCardValue === other.highCardValue) {
        return hand.highCardId - other.highCardId
      };
      return hand.highCardValue - other.highCardValue
    };
    return hand.typeId - other.typeId
  })
  return sortedLeaderboard;
}

async function getLeaderboardChunk(index, length) {
  try {
    const leaderboard = await getLeaderboard();
    const leaderboardChunk = getChunk(leaderboard, index, length)
    for (let hand of leaderboardChunk) {
      let { card1, card2, card3, card4, card5 } = hand;
      const cards = await getCardsFromIds([card1, card2, card3, card4, card5]);
      hand.cards = cards;
      delete hand.card1;
      delete hand.card2;
      delete hand.card3;
      delete hand.card4;
      delete hand.card5;
      delete hand.highCardId;
      delete hand.highCardValue;
      delete hand.typeId;
    }
    return leaderboardChunk
  } catch (error) {
    console.log(error);
  }
}

function getChunk(array, index, length) {
  const startingPoint = length * index;
  const endingPoint = startingPoint + length;
  const returnArray = array.slice(startingPoint, startingPoint + length);
  if (!returnArray.length) return null;
  return returnArray
}

async function addToLeaderboard(userId, hand) {
  const { cardIds, type, highCard } = hand;
  const values = cardIds.concat([type.id, highCard.id, highCard.value]);
  values.unshift(userId);
  const SQL = `
  INSERT INTO leaderboard("userId", card1, card2, card3, card4, card5, "typeId", "highCardId", "highCardValue")
  VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)
  `;
  try {
    const result = await client.query(SQL, values);
    return true;
  } catch (error) {
    console.error(error);
  };
};

async function deleteFromLeaderboardByUserId(userId) {
  const SQL = `DELETE FROM leaderboard WHERE "userId" = $1`
  try {
    const response = await client.query(SQL, [userId]);
    if (!response.rowCount) return false;
    return true;
  } catch (error) {
    console.error(error);
  };
}

module.exports = { getLeaderboard, getLeaderboardChunk, addToLeaderboard, deleteFromLeaderboardByUserId };