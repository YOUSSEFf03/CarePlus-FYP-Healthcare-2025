const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Use only environment variables
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function initializeDatabase() {
  let client;
  try {
    client = await pool.connect();
    console.log(`✅ Connected to PostgreSQL database: ${process.env.DB_NAME}`);

    // Run schema
    const schemaPath = path.join(__dirname, "schema.sql");
    const schemaSQL = fs.readFileSync(schemaPath, "utf8");
    await client.query(schemaSQL);
    console.log("✅ Schema created successfully");

    // Run seed (if exists)
    const seedPath = path.join(__dirname, "seed.sql");
    if (fs.existsSync(seedPath)) {
      const seedSQL = fs.readFileSync(seedPath, "utf8");
      await client.query(seedSQL);
      console.log("✅ Seed data inserted successfully");
    } else {
      console.log("ℹ️ No seed.sql file found, skipping seed step.");
    }

    console.log("🎉 Database initialization completed!");
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    process.exit(1);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

initializeDatabase();
