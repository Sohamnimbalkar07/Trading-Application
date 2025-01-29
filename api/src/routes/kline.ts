import { Router, Request, Response } from "express";
import { Kline } from "../types";
import pool from "../dbConnection";

export const klineRouter = Router();

klineRouter.get("/", async (req : Request, res: any) => {
  const { market, interval, startTime, endTime } = req.query;

  let klineQuery;
  switch (interval) {
    case "1m":
      klineQuery = `SELECT * FROM klines_1m WHERE bucket >= $1 AND bucket <= $2`;
      break;
    case "1h":
      klineQuery = `SELECT * FROM klines_1m WHERE  bucket >= $1 AND bucket <= $2`;
      break;
    case "1w":
      klineQuery = `SELECT * FROM klines_1w WHERE bucket >= $1 AND bucket <= $2`;
      break;
    default:
      return res.send("Invalid interval");
  }
  const pgClient = await pool.connect();
  try {
    const startDate = new Date(Number(startTime) * 1000);
    const endDate = new Date(Number(endTime) * 1000);
    const result = await pgClient.query(klineQuery, [startDate, endDate]);
    console.log("result", result);
    const response = result.rows.map((x: any) => ({
      close: x.close,
      end: x.bucket,
      high: x.high,
      low: x.low,
      open: x.open,
      volume: x.volume,
    }));
    res.json(response);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  } finally {
    pgClient.release();
  }
});