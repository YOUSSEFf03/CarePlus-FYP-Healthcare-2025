const fs = require("fs");
const path = require("path");
require("dotenv").config();

// IMPORTANT: Per requirement, do not create new databases or tables automatically.
// This script now only validates connectivity to referenced databases if explicitly requested.

const { getPool } = require('./connections');

async function initializeDatabase() {
  let client;
  try {
    if (process.env.ALLOW_SCHEMA_MIGRATIONS === 'true') {
      // Optional, controlled by env flag, defaults to disabled
      const defaultPool = getPool();
      client = await defaultPool.connect();
      console.log(`✅ Connected to PostgreSQL database: ${process.env.DB_NAME || 'default'}`);

      const schemaPath = path.join(__dirname, "schema.sql");
      const seedPath = path.join(__dirname, "seed.sql");

      if (fs.existsSync(schemaPath)) {
        const schemaSQL = fs.readFileSync(schemaPath, "utf8");
        await client.query(schemaSQL);
        console.log("✅ Schema created successfully (ALLOW_SCHEMA_MIGRATIONS)");
      } else {
        console.log("ℹ️ schema.sql not found; skipping.");
      }

      if (fs.existsSync(seedPath)) {
        const seedSQL = fs.readFileSync(seedPath, "utf8");
        await client.query(seedSQL);
        console.log("✅ Seed data inserted successfully");
      }
    } else {
      // Connectivity checks only
      const pools = [
        { name: 'default', pool: getPool() },
        { name: 'auth', pool: getPool('auth') },
        { name: 'doctor', pool: getPool('doctor') },
      ];
      for (const { name, pool } of pools) {
        client = await pool.connect();
        const { rows } = await client.query('SELECT NOW() AS now');
        console.log(`✅ Connectivity OK for ${name} DB at ${rows[0].now}`);
        client.release();
        client = null;
      }
    }
    console.log("🎉 Database check completed!");
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    process.exit(1);
  } finally {
    if (client) client.release();
  }
}

initializeDatabase();
