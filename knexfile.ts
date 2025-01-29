import dotenv from 'dotenv';
dotenv.config();

export default {
  development: {
    client: 'mysql',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: Number(process.env.DB_PORT) || 3306
    },
    migrations: {
      directory: './src/db/migrations',
      tableName: 'knex_migrations'
    }
  }
};