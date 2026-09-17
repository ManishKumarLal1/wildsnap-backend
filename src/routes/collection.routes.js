const express = require("express");

const authenticate = require("../middleware/auth.middleware");

const {
  getMyCollection,
} = require("../controllers/collection.controller");

const router = express.Router();

router.use(authenticate);

router.get("/", getMyCollection);

module.exports = router;