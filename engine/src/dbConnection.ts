import { Pool } from "pg";

export const pool = new Pool({
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: 5432,
});

export async function getTickerData(market: string): Promise<any> {
  try {
    const query = `select
        min(time) as startTime,
        first(price, time) as firstPrice,
        max(price) as high,
        min(price) as low,
        last(price, time) as lastPrice,
        sum(volume) as volume
      from tata_prices
      where time >= now() - interval '24 hours';`;

    const result = await pool.query(query);

    if (result.rows.length === 0) {
      return {
        success: false,
        error: "No data found for the specified market",
      };
    }

    const tickerData = result.rows[0];
    const firstPrice = parseFloat(tickerData.firstprice) || 0;
    const lastPrice = parseFloat(tickerData.lastprice) || 0;
    const priceChange = lastPrice - firstPrice;
    const priceChangePercent =
      firstPrice !== 0 ? (priceChange / firstPrice) * 100 : 0;

    const response = {
      startTime: tickerData.starttime
        ? tickerData.starttime.toISOString()
        : null,
      firstPrice: tickerData.firstprice || "0",
      high: tickerData.high || "0",
      low: tickerData.low || "0",
      lastPrice: tickerData.lastprice || "0",
      volume: tickerData.volume || "0",
      priceChange: priceChange.toFixed(2),
      priceChangePercent: priceChangePercent.toFixed(2),
    };

    return { response, success: true };
  } catch (error) {
    return {
      success : false,
      error: "Failed to fetch ticker data",
    };
  }
}
