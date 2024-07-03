const express = require("express");
const { getHandById, setNewHand } = require("../database/hands");
const { requireUser, checkUserAgainstHand } = require("../middleware/auth");
const handsRoutes = express.Router();

handsRoutes.get("/:id", requireUser, checkUserAgainstHand, async (req, res, next) => {
  const { id } = req.params;
  try {
    const { cards, type } = await getHandById(id);
    res.status(200).send({ error: false, cards, type });
  } catch (error) {
    next(error);
  };

});

handsRoutes.put("/:id", requireUser, checkUserAgainstHand, async (req, res, next) => {
  const { id } = req.params;
  try {
    const { cards, type } = await setNewHand(id);
    if (!cards || !type) {
      res.status(500);
      next({
        error:true,
        name: "NewHandError",
        message: "Something went wrong creating a new user hand."
      })
    }
    res.status(200).send({ error: false, cards, type });
  } catch (error) {
    next(error); 
  };
});

module.exports = handsRoutes;