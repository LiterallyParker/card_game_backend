require("dotenv").config();
const { Client } = require("pg");

const DATABASE = process.env.MODE === "production" ? process.env.DATABASE : "";

const client = new Client({connectionString:DATABASE, ssl:{rejectUnauthorized:false}});

module.exports = client;