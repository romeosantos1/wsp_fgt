// knex.js
const knex = require('knex');

// Configuración de la conexión con la base de datos MySQL
const db = knex({
  client: 'mysql2',  // Asegúrate de usar 'mysql2' como cliente
  connection: {
    host: '127.0.0.1',
    user: 'root',
    //password: 'masterkey',
    database: 'fgtwsapp'
  }, pool: {
    min: 1,
    max: 5,  // Aumenta un poco el límite de conexiones
    acquireTimeoutMillis: 20000, // Espera hasta 20s antes de fallar
    idleTimeoutMillis: 30000,  // Cierra conexiones inactivas después de 30s
    createTimeoutMillis: 5000
  },
  
});
db.on('query-response', (response, obj, builder) => {
  if (Array.isArray(response)) {
    // Si el resultado es un array de objetos
    return response.map(row => {
      const newRow = {};
      for (const key in row) {
        if (row.hasOwnProperty(key)) {
          newRow[key.toUpperCase()] = row[key];
        }
      }
      return newRow;
    });
  } else if (response && typeof response === 'object') {
    // Si el resultado es un único objeto
    const newResponse = {};
    for (const key in response) {
      if (response.hasOwnProperty(key)) {
        newResponse[key.toUpperCase()] = response[key];
      }
    }
    return newResponse;
  }
  return response;
});

module.exports = db;
