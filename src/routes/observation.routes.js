const express = require("express");

const authenticate = require("../middleware/auth.middleware");

const {
  addObservation,
  getMyObservations,
  getObservation,
  removeObservation,
} = require("../controllers/observation.controller");

const router = express.Router();

router.use(authenticate);

router.post("/", addObservation);

router.get("/", getMyObservations);

router.get("/:id", getObservation);

router.delete("/:id", removeObservation);

module.exports = router;