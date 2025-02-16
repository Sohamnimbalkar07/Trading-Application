import pool from "./dbConnection";

async function refreshViews() {
  const client = await pool.connect();
  try {
    await client.query("REFRESH MATERIALIZED VIEW klines_1m");
    await client.query("REFRESH MATERIALIZED VIEW klines_1h");
    await client.query("REFRESH MATERIALIZED VIEW klines_1w");

    // console.log("Materialized views refreshed successfully");
  } finally {
    client.release();
  }
}

refreshViews().catch(console.error);

setInterval(() => {
  refreshViews();
}, 1000 * 10);
