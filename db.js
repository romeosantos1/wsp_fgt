// knex.js
const knex = require('knex');

// Configuración de la conexión con la base de datos MySQL
const db = knex({
  client: 'mysql2',  // Asegúrate de usar 'mysql2' como cliente
  connection: {
    host: 'localhost',
    user: 'root',
    //password: 'masterkey',
    database: 'fgtwsapp'
  }, pool: {
    min: 1,
    max: 5,  // Aumenta un poco el límite de conexiones
    acquireTimeoutMillis: 20000, // Espera hasta 20s antes de fallar
    idleTimeoutMillis: 30000,  // Cierra conexiones inactivas después de 30s
    createTimeoutMillis: 5000
  }
});

module.exports = db;
