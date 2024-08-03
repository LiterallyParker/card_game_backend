const express = require("express");
const api = express.Router();

const usersRoutes = require("./users");
api.use("/users", usersRoutes);

const cardsRoutes = require("./cards");
api.use("/cards", cardsRoutes);

const handsRoutes = require("./hands");
api.use("/hands", handsRoutes);

const leaderboardRoutes = require("./leaderboard");
api.use("/leaderboard", leaderboardRoutes);

module.exports = api;