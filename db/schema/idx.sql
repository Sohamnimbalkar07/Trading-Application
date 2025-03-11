create index idx_tata_prices_time on tata_prices (time);
create index idx_tata_prices_time_price on tata_prices (time, price);

create index idx_klines_1m_bucket on klines_1m (bucket);
create index idx_klines_1h_bucket on klines_1h (bucket);
create index idx_klines_1w_bucket on klines_1w (bucket);

create index idx_klines_1m_open on klines_1m (open);
create index idx_klines_1m_high on klines_1m (high);
create index idx_klines_1m_low on klines_1m (low);
create index idx_klines_1m_close on klines_1m (close);
create index idx_klines_1m_volume on klines_1m (volume);

create index idx_klines_1h_open on klines_1h (open);
create index idx_klines_1h_high on klines_1h (high);
create index idx_klines_1h_low on klines_1h (low);
create index idx_klines_1h_close on klines_1h (close);
create index idx_klines_1h_volume on klines_1h (volume);

create index idx_klines_1w_open on klines_1w (open);
create index idx_klines_1w_high on klines_1w (high);
create index idx_klines_1w_low on klines_1w (low);
create index idx_klines_1w_close on klines_1w (close);
create index idx_klines_1w_volume on klines_1w (volume);

create index idx_tata_prices_time_bucket on tata_prices (time_bucket('1 minute', time));