const express = require("express");
const { addToLeaderboard, getLeaderboardChunk } = require("../database/leaderboard");
const { requireUser, rejectUser } = require("../middleware/auth");
const { getHandById } = require("../database/hands");
const leaderboardRouter = express.Router();

leaderboardRouter.get("/:index/:length", async (req, res, next) => {
  const { index, length } = req.params;
  try {
    const leaderboard = await getLeaderboardChunk(Number(index), Number(length));
    if (!leaderboard || !leaderboard.length) {
      res.status(500).send({
        error: true,
        name: "LeaderboardError",
        message: "Nothing to see..."
      })
      return
    }
    res.status(200).send({ error: false, leaderboard });
  } catch (error) {
    next(error);
  };
}); 

leaderboardRouter.post("/", requireUser, async (req, res, next) => {
  const { id, handId } = req.user;
  try {
    const hand = await getHandById(handId);
    const { cards, type } = hand
    const leaderboardEntry = await addToLeaderboard(id, hand);
    if (!leaderboardEntry) {
      res.status(500).send({
        error: true,
        name: "LeaderboardError",
        message: "User already submitted this hand."
      });
      return;
    };
    res.status(200).send({ error: false, cards, type });
  } catch (error) {
    next(error);
  };
});

module.exports = leaderboardRouter;