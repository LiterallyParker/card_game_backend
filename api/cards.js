const express = require("express");
const { getCards, generateRandomHand } = require("../database/cards");
const cardsRoutes = express.Router();

cardsRoutes.get("/", async (req, res, next) => {
  try {
    const cards = await getCards();
    if (!cards || !cards.length) {
      res.status(500).send({
        error: true,
        message: "Cards not found."
      });
      return;
    }
    res.status(200).send({ error: false, cards });

  } catch (error) {
    next(error);

  };
});

cardsRoutes.get("/hand", async (req, res, next) => {
  try {
    const hand = await generateRandomHand();
    if (!hand) {
      res.status(500).send({
        error: true,
        message: "Problem generating a Hand."
      });
      return;
    }
    res.status(200).send(hand);

  } catch (error) {
    next(error);
  };
});

module.exports = cardsRoutes;