module.exports = {
  port: process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 3000,
  ip: process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1',
  pg_config: process.env.OPENSHIFT_POSTGRESQL_DB_URL || 'postgresql://127.0.0.1:5432',
  schema_name: process.env.OPENSHIFT_APP_NAME || process.env.PG_MAP_TABLE_NAME || 'odpad',
  scrape_interval: 24 * 60 * 60 * 1000, // daily (in milliseconds)
  db_inserts_parallel_limit: 5 // number of inserts into DB we want to run in parallel
}
