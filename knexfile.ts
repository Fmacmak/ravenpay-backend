import type { Knex } from "knex";
import path from 'path';

const config: Knex.Config = {
  client: 'sqlite3',
  connection: {
    filename: path.join(__dirname, 'database.sqlite')
  },
  useNullAsDefault: true,
  migrations: {
    directory: './src/db/migrations',
    tableName: 'knex_migrations',
    extension: 'ts'
  }
};

module.exports = config;