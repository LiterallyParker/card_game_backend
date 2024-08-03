const express = require("express");
const { getAllHands } = require("../database/hands");
const { regenerateCards } = require("../database/cards");
const leaderboardRoutes = express.Router();

leaderboardRoutes.get("/", async (req, res, next) => {
    try {
        const hands = await getAllHands();
        if (!hands || !hands.length) {
            res.status(500).send({
                error:true,
                message:"Nothing found."
            });
            return;
        }
        const leaderboard = hands.slice(0,100);
        const result = [];
        for (let hand of leaderboard) {
            let returnHand = { username: hand.username };
            returnHand.placement = leaderboard.indexOf(hand) + 1;
            let QUERY = [hand.userId, hand.card1id, hand.card2id, hand.card3id, hand.card4id, hand.card5id, hand.card1val, hand.card2val, hand.card3val, hand.card4val, hand.card5val, hand.typeId]
            returnHand.hand = await regenerateCards(QUERY);
            returnHand.id = hand.id;
            returnHand.hand.cards.map(card => {
                delete card.imageUrl;
            })
            result.push(returnHand);
        }
        res.send({ leaderboard: result });
    } catch (error) {
        next(error);
    }
})

module.exports = leaderboardRoutes;