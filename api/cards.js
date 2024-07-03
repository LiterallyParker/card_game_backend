const express = require("express");
const { generateHand, getCards } = require("../database/cards");
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
    const { cards, type } = await generateHand();
    res.status(200).send({ cards, type });
  } catch (error) {
    next(error);
  };
});

module.exports = cardsRoutes