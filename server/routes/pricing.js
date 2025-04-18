const express = require("express");
const router = express.Router();

router.post("/calculate-fee", (req, res) => {
  const { hours } = req.body;

  let fee;
  if (hours <= 1) {
    fee = 15;
  } else if (hours <= 3) {
    fee = 30;
  } else {
    fee = 50;
  }

  res.json({ fee });
});

module.exports = router;
