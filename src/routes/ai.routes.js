const express = require("express");

const {
  identifyAnimal,
} = require("../controllers/ai.controller");

const router = express.Router();

router.post("/identify", identifyAnimal);

module.exports = router;