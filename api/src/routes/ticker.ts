import { Router } from "express";
import pool from "../dbConnection";

export const tickersRouter = Router();

tickersRouter.get("/", async (req, res) => {
  const { symbol } = req.query;
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
  const tickerData = result.rows[0];

  const firstPrice = parseFloat(tickerData.firstprice);
  const lastPrice = parseFloat(tickerData.lastprice);
  const priceChange = lastPrice - firstPrice;
  const priceChangePercent = (priceChange / firstPrice) * 100;

  const response = {
    startTime: tickerData.starttime,
    firstPrice: tickerData.firstprice,
    high: tickerData.high,
    low: tickerData.low,
    lastPrice: tickerData.lastprice,
    volume: tickerData.volume,
    priceChange: priceChange.toFixed(2),
    priceChangePercent: priceChangePercent.toFixed(2),
  };

  res.json(response);
});
