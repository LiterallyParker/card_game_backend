async function seedTypes(client) {
  try {
    const { types } = require("./data");
    for (let type of types) {
      await client.query(`INSERT INTO types(name) VALUES($1)`, [type.name])
    }  
  } catch (error) {
    console.error(error);
  };
};

module.exports = { seedTypes }