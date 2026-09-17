const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

require("dotenv").config();

const caPath = path.join(__dirname, "../../ca.pem");

console.log("CA path:", caPath);
console.log("CA exists:", fs.existsSync(caPath));

if (fs.existsSync(caPath)) {
  console.log("CA size:", fs.statSync(caPath).size);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync(caPath, "utf8"),
  },
});

pool.on("connect", () => {
  console.log("PostgreSQL connected");
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL error:", error);
});

module.exports = pool;