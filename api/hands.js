const express = require("express");
const { setNewHand, saveUserHand, getHandsByUserId, deleteHandById, getHandById } = require("../database/hands");
const { requireUser } = require("../middleware/auth");
const { generateHand } = require("../database/cards");
const { getUserCardIds } = require("../database/hands");
const { sortHands } = require("../util");
const { error } = require("console");
const handsRoutes = express.Router();

handsRoutes.get("/", requireUser, async (req, res, next) => {
  // userId
  const { id } = req.user;
  try {

    // Gets the array of cardIds from the users table
    const cardIds = await getUserCardIds(id);

    // Last digit is the TypeId, don't need it for this.
    cardIds.pop();

    // Creates a hand object from the cardIds
    const hand = await generateHand(cardIds);

    res.status(200).send({ error: false, hand });

  } catch (error) {
    next(error);
  };

});

handsRoutes.put("/", requireUser, async (req, res, next) => {
  const { id } = req.user;
  try {

    // Sets new cardIds in the users table
    const hand = await setNewHand(id);

    if (!hand) {
      res.status(500);
      next({
        error:true,
        name: "NewHandError",
        message: "Something went wrong creating a new user hand."
      });
    };

    res.status(200).send({ error: false, hand });

  } catch (error) {
    next(error);
  };

});

handsRoutes.post("/", requireUser, async (req, res, next) => {
  const { id } = req.user;
  const MAX_HANDS = 50
  try {
    const hands = await getHandsByUserId(id);
    if (hands.length >= MAX_HANDS) {
      res.status(500).send({
        error: true,
        message: `Only allowed ${MAX_HANDS} hands. Delete a hand to add more.`
      });
      return;
    }
    const result = await saveUserHand(id);
    if (!result) {
      res.status(500).send({
        error: true,
        message: "User already submitted this hand."
      });
      return;
    }
    res.send({
      error: false,
      message: "Successfully submitted."
    });
  } catch (error) {
    next(error);
  }
})

handsRoutes.get("/:userId", async (req, res, next) => {
  const { userId } = req.params;
  try {
    const hands = await getHandsByUserId(userId);
    if (!hands.length) {
      res.status(500).send({
        error: true,
        message: "No hands!"
      });
      return;
    };
    const unsortedResult = [];
    for (const { id, card1id, card2id, card3id, card4id, card5id } of hands ) {
      const cardIds = [card1id, card2id, card3id, card4id, card5id];
      const { cards, type } = await generateHand(cardIds);
      cards.forEach(card => {
        delete card.imageUrl;
      });
      unsortedResult.push({ id, cards, type, cardIds });
    };
    const result = sortHands(unsortedResult);
    res.send(result);

  } catch (error) {
    next(error);
  };
});

handsRoutes.delete("/:handId", requireUser, async (req, res, next) => {
  const { handId } = req.params;
  const { id } = req.user;
  try {
    const { userId } = getHandById(handId);
    if (!id === userId) {
      res.status(500).send({
        error: true,
        message: "Unauthorized."
      });
      return;
    }
    const response = await deleteHandById(handId);
    if (!response) {
      res.status(500).send({
        error: true,
        message: `Couldn't find/delete hand with id ${handId}`
      });
      return;
    };
    res.send({
      error: false,
      message: "Successfully deleted."
    });

  } catch (error) {
    next(error);

  };
});

module.exports = handsRoutes;