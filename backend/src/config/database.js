const { Sequelize } = require('sequelize');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

let sequelize;

if (process.env.DB_DIALECT === 'mysql') {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'hostelhub',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
  console.log('Database Configured: MySQL Dialect Selected');
} else {
  // Default to SQLite
  const storagePath = path.isAbsolute(process.env.DB_STORAGE || './database.sqlite')
    ? process.env.DB_STORAGE
    : path.join(__dirname, '../../', process.env.DB_STORAGE || 'database.sqlite');
    
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: storagePath,
    logging: false,
  });
  console.log(`Database Configured: SQLite Dialect Selected (Storage: ${storagePath})`);
}

module.exports = sequelize;
