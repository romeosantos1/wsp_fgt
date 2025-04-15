const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const usersRoutes = require('./api/login'); // <-- Importar el archivo correcto
const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/users', usersRoutes); // rutas API
//app.use(express.static('../frontend')); // sirve tu AngularJS

app.listen(3001, () => {
  console.log('Servidor escuchando en http://localhost:3001 xd');
});
