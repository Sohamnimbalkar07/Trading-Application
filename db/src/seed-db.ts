import pool from "./dbConnection";

async function initializeDB() {
  const client = await pool.connect();

  await client.query(`create extension if not exists timescaledb;`);

  await client.query(`
        drop table if exists "tata_prices";

        create table "tata_prices"(
            time            timestamp with time zone not null,
            price           double precision,
            volume          double precision
        );

        select create_hypertable('tata_prices', 'time', 'price', 2);
    `);

  await client.query(`
        create materialized view if not exists klines_1m as
        select
            time_bucket('1 minute', time) as bucket,
            first(price, time) as open,
            max(price) as high,
            min(price) as low,
            last(price, time) as close,
            sum(volume) as volume
        from tata_prices
        group by bucket;
    `);

    // first(price, time) -> first(value_column, sort_column)
  await client.query(`
        create materialized view if not exists klines_1h as
        select
            time_bucket('1 hour', time) as bucket,
            first(price, time) as open,
            max(price) as high,
            min(price) as low,
            last(price, time) as close,
            sum(volume) as volume
        from tata_prices
        group by bucket;
    `);

  await client.query(`
        create materialized view if not exists klines_1w as
        select
            time_bucket('1 week', time) as bucket,
            first(price, time) as open,
            max(price) as high,
            min(price) as low,
            last(price, time) as close,
            sum(volume) as volume
        from tata_prices
        group by bucket;
    `);

  client.release();
  console.log("Database initialized successfully");
}

initializeDB().catch(console.error);
