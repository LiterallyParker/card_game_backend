const { generateRandomHand } = require("./cards");
const client = require("./index");

async function getUserCardIds(userId) {
  const SQL = `SELECT id, card1id, card2id, card3id, card4id, card5id, card1val, card2val, card3val, card4val, card5val, "typeId"
  FROM users
  WHERE id = $1
  `
  try {
    const { rows: [result] } = await client.query(SQL, [userId]);
    return Object.values(result);
  } catch (error) {
    console.error(error);
  };
};

async function setNewHand(id) {
  SQL = `
  UPDATE users
  SET "card1id"=$1, "card2id"=$2, "card3id"=$3, "card4id"=$4, "card5id"=$5, "card1val"=$6, "card2val"=$7, "card3val"=$8, "card4val"=$9, "card5val"=$10, "typeId"=$11
  WHERE id=$12
  RETURNING id;
  `
  try {
    const hand = await generateRandomHand();
    const { QUERY, type } = hand;
    const SQLvalues = [...QUERY, type.id, id];
    const result = await client.query(SQL, SQLvalues);
    if (!result) return;
    return hand;

  } catch (error) {
    console.error(error);
  };
};

async function getHandById(id) {
  const SQL = `SELECT id, "userId", card1id, card2id, card3id, card4id, card5id, card1val, card2val, card3val, card4val, card5val, "typeId"
  FROM hands
  WHERE id = $1
  `
  try {
    const { rows: [hand] } = await client.query(SQL, [id]);
    return hand;

  } catch (error) {
    console.error(error);
  }
}

async function deleteHandById(id) {
  const SQL = `DELETE FROM hands WHERE id = $1`
  try {
    const response = await client.query(SQL, [id]);
    if (!response.rowCount) return false;
    return true;
  } catch (error) {
    console.error(error);
  };
};

async function saveUserHand(userId) {
  const SQL = `INSERT INTO hands("userId", card1id, card2id, card3id, card4id, card5id, card1val, card2val, card3val, card4val, card5val, "typeId")
  VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`
  try {
    const SQLvalues = await getUserCardIds(userId);
    const result = await client.query(SQL, SQLvalues);
    return result.rowCount;

  } catch (error) {
    return;
  };
};

async function getHandsByUserId(userId) {
  const SQL = `SELECT id, "userId", card1id, card2id, card3id, card4id, card5id, card1val, card2val, card3val, card4val, card5val, "typeId"
  FROM hands
  WHERE "userId" = $1
  ORDER BY "typeId" desc, card1val desc, card2val desc, card3val desc, card4val desc, card5val desc, card1id desc, card2id desc, card3id desc, card4id desc, card5id desc
  `
  try {
    const { rows } = await client.query(SQL, [userId]);
    return rows;

  } catch (error) {
    console.error(error);
  };
};

async function getAllHands() {
  const SQL = `
  SELECT
    hands.id as id,
    users.username as username,
    users.id as "userId",
    hands.card1id as card1id,
    hands.card2id as card2id,
    hands.card3id as card3id,
    hands.card4id as card4id,
    hands.card5id as card5id,
    hands."typeId" as "typeId"
  FROM hands
  JOIN users ON users.id = hands."userId"
  ORDER BY
    hands."typeId" desc,
    hands.card1val desc,
    hands.card2val desc,
    hands.card3val desc,
    hands.card4val desc, 
    hands.card5val desc, 
    hands.card1id desc, 
    hands.card2id desc, 
    hands.card3id desc, 
    hands.card4id desc, 
    hands.card5id desc
  `
  try {
    const { rows } = await client.query(SQL);
    return rows;

  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  setNewHand,
  getHandById,
  deleteHandById,
  getUserCardIds,
  saveUserHand,
  getHandsByUserId,
  getAllHands
};