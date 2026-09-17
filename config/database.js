const { Sequelize } = require('sequelize');
const config = require('./app.config');

const sequelize = new Sequelize(
  config.db.name,
  config.db.user,
  config.db.password,
  {
    host: config.db.host,
    port: config.db.port,
    dialect: 'postgres',
    logging: config.nodeEnv === 'development' ? false : false, // set console.log jika butuh debug SQL
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      paranoid: true, // soft delete -> otomatis menambahkan kolom deleted_at
      underscored: true, // snake_case untuk nama kolom di database PostgreSQL
      freezeTableName: true,
    },
  }
);

module.exports = sequelize;
