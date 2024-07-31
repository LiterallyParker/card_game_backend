const bcrypt = require("bcrypt");
const client = require("../database");
const { dbFields } = require("../util");
const { generateRandomHand } = require("./cards");

async function addUser({ firstname, lastname, username, email, password }) {
  const role = "Guest"
  // Hash Password
  const hash = await bcrypt.hash(password, Number(process.env.SALT_ROUNDS));
  delete password;

  // Build SQLs
  const userSQL = `
  INSERT INTO users(firstname, lastname, username, email, role, hash, card1id, card2id, card3id, card4id, card5id, "typeId")
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
  RETURNING id, firstname, lastname, username, email, role, card1id, card2id, card3id, card4id, card5id, "typeId"`;

  try {
    const { cardIds, type } = await generateRandomHand();
    const SQLvalues = [ firstname, lastname, username, email, role, hash, ...cardIds ]
    SQLvalues.push(type.id);
    const { rows:[user] } = await client.query(userSQL, SQLvalues);
    // Return Response
    return user;

  } catch (error) {
    console.error(error);

  };
};

async function getUserByEmail(email) {
  const SQL = `SELECT email FROM users WHERE email=($1);`
  try {
    const { rows } = await client.query(SQL, [email]);
    return rows[0];

  } catch (error) {
    console.error(error)
  }
};

async function getUserByUsername(username) {
  const SQL = `SELECT id, firstname, lastname, username, email, role, hash FROM users WHERE username=($1);`
  try {
    const { rows } = await client.query(SQL, [username]);
    return rows[0];

  } catch (error) {
    console.error(error);
  };
};

async function getUserById(id) {
  const SQL = `
  SELECT id, firstname, lastname, username, email, role
  FROM users
  WHERE id = ($1);
  `

  try {
    const { rows:[user] } = await client.query(SQL, [id]);
    return user;

  } catch (error) {
    console.error(error);
  
  };
};

async function getUser({ username, password }) {
  try {
    const user = await getUserByUsername(username);
    if (!user) return;
    const comparison = await bcrypt.compare(password, user.hash);
    delete user.hash;
    return comparison ? user : null

  } catch (error) {
    console.error(error);

  };
};

async function updateUserInfo(id, fields = {}) {

  const { insert, vals } = dbFields(fields)
  if (!insert || !vals) return { 
      error: true,
      name: "MissingFieldError",
      message: "Please supply at least one field."
    };

  const SQL = `
  UPDATE users
  SET ${ insert }
  WHERE id=${ id }
  RETURNING id, username, email, firstname, lastname;
  `;

  try {
    const { rows:[userInfo] } = await client.query(SQL, vals);
    return { error: false, userInfo };

  } catch (error) {
    console.error(error);

  };
};

async function deleteUserById(id) {
  const SQL = `DELETE FROM users WHERE id = $1`;
  try {
    const response = await client.query(SQL, [id]);
    return response;
  } catch (error) {
    console.error(error);
  };
};

module.exports = {
  addUser,
  getUserById,
  getUserByEmail,
  getUserByUsername,
  getUser,
  updateUserInfo,
  deleteUserById
};