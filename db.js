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
  }
});

module.exports = db;
