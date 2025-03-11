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

        create index idx_tata_prices_time on tata_prices (time);
        create index idx_tata_prices_time_price on tata_prices (time, price);
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

        create index idx_klines_1m_bucket ON klines_1m (bucket);
        create index idx_klines_1m_open ON klines_1m (open);
        create index idx_klines_1m_high ON klines_1m (high);
        create index idx_klines_1m_low ON klines_1m (low);
        create index idx_klines_1m_close ON klines_1m (close);
        create index idx_klines_1m_volume ON klines_1m (volume);
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

        create index idx_klines_1h_bucket ON klines_1h (bucket);
        create index idx_klines_1h_open ON klines_1h (open);
        create index idx_klines_1h_high ON klines_1h (high);
        create index idx_klines_1h_low ON klines_1h (low);
        create index idx_klines_1h_close ON klines_1h (close);
        create index idx_klines_1h_volume ON klines_1h (volume);

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

        create index idx_klines_1w_bucket ON klines_1w (bucket);
        create index idx_klines_1w_open ON klines_1w (open);
        create index idx_klines_1w_high ON klines_1w (high);
        create index idx_klines_1w_low ON klines_1w (low);
        create index idx_klines_1w_close ON klines_1w (close);
        create index idx_klines_1w_volume ON klines_1w (volume);
    `);

  client.release();
  console.log("Database initialized successfully");
}

initializeDB().catch(console.error);
