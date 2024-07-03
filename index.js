require("dotenv").config();
const express = require("express");
const cors = require("cors");
const client = require("./database")

client.connect()
const server = express();
server.use(cors());
server.use(express.json());
const { addUserToReq } = require("./auth");
server.use(addUserToReq)

const api = require("./api");
server.use("/api", api);

server.get('*', (req, res, next) => {
  res.status(404).send({error: '404 - Not Found', message: 'No route found for the requested URL'});
});

const PORT = process.env.PORT;

server.use((error, req, res, next) => {
  console.error('SERVER ERROR: ', error);
  res.send({error: error.error, name: error.name, message: error.message, table: error.table});
});

server.listen(PORT, () => console.log(`Listening on port ${PORT} CLOSE IT WHEN UR DUN DAMNIT`));