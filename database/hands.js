const { getCardsFromIds, generateHand, attachScore } = require("./cards");
const client = require("./index");

async function getHandById(id) {
  const SQL = `
  SELECT hands.card1 as card1, hands.card2 as card2, hands.card3 as card3, hands.card4 as card4, hands.card5 as card5, types.name as type, hands."typeId" as "typeId"
  FROM hands
  JOIN types ON types.id = hands."typeId"
  WHERE hands.id = $1`
  try {
    const { rows: [handObj] } = await client.query(SQL, [id]);
    
    const { card1, card2, card3, card4, card5 } = handObj
    const cardIds = [card1, card2, card3, card4, card5];
    const cards = await getCardsFromIds(cardIds);
    const result = await attachScore(cards);
    return { cardIds, ...result };

  } catch (error) {
    console.error(error);
  }
}

async function setNewHand(id) {
  SQL = `
  UPDATE hands
  SET "card1"=$1, "card2"=$2, "card3"=$3, "card4"=$4, "card5"=$5, "typeId"=$6, "highCardId"=$7, "highCardValue"=$8
  WHERE id=$9
  RETURNING card1, card2, card3, card4, card5;
  `
  try {
    const cards = await generateHand();
    const { cardIds, type, highCard } = cards;
    const values = cardIds.concat([type.id, highCard.id, highCard.value, id]);
    const result = await client.query(SQL, values);
    if (!result) return;
    return { cardIds, ...cards };
  } catch (error) {
    console.error(error);
  };
};

async function deleteHandById(id) {
  const SQL = `DELETE FROM hands WHERE id = $1`
  try {
    const response = await client.query(SQL, [id]);
    if (!response.rowCount) return false;
    return true;
  } catch (error) {
    console.error(error);
  }
}

module.exports = { getHandById, setNewHand, deleteHandById }