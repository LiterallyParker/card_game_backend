const express = require("express");
const { getCards, generateRandomHand } = require("../database/cards");
const cardsRoutes = express.Router();

cardsRoutes.get("/", async (req, res, next) => {
  try {
    const cards = await getCards();
    res.status(200).send({ error: false, cards });

  } catch (error) {
    next(error);

  };
});

cardsRoutes.get("/hand", async (req, res, next) => {
  try {
    const hand = await generateRandomHand();
    res.status(200).send(hand);
  } catch (error) {
    next(error);
  };
});

module.exports = cardsRoutes;