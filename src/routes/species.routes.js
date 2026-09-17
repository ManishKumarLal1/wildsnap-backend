const express = require("express");

const {
  getAllSpecies,
  getSpecies,
  getSpeciesByName,
} = require("../controllers/species.controller");

const router = express.Router();

router.get("/", getAllSpecies);

router.get("/name/:name", getSpeciesByName);

router.get("/:id", getSpecies);

module.exports = router;