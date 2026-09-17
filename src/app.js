const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const uploadRoutes = require("./routes/upload.routes");
const speciesRoutes = require("./routes/species.routes");
const observationRoutes = require("./routes/observation.routes");
const collectionRoutes = require("./routes/collection.routes");
const leaderboardRoutes = require("./routes/leaderboard.routes");
const aiRoutes = require("./routes/ai.routes");
const natureVisionRoutes = require("./routes/natureVision.routes");
const dexRoutes = require("./routes/dex.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Wildlife API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/observations", observationRoutes);
app.use("/api/species", speciesRoutes);
app.use("/api/collections", collectionRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/ai", aiRoutes);
app.use(
  "/api/nature-vision",
  natureVisionRoutes
);
app.use("/api/dex", dexRoutes);



app.use((error, req, res, next) => {
  console.error("API error:", error);

  return res.status(error.statusCode || 500).json({
    message: error.message || "Internal server error",
  });
});

module.exports = app;