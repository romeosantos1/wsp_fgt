const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Inicializa Express
const app = express();
const port = 3000;

// Define las opciones de Swagger (esto es lo que describirá tu API)
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',  // La versión de OpenAPI (Swagger 3.0)
    info: {
      title: 'Mi API',
      version: '1.0.0',
      description: 'Una API para gestionar usuarios', // Descripción general
      contact: {
        name: 'Tu Nombre',
        email: 'tu-email@dominio.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000', // URL base de la API
      },
    ],
  },
  // Ruta de los archivos que contienen los comentarios para la documentación Swagger
  apis: ['./routes/*.js'],  // Aquí especificas la ruta a tus archivos de rutas
};

// Inicializa el generador Swagger
const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Usa Swagger UI para mostrar la documentación en una ruta accesible
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Ejemplo de una ruta en tu API
app.get('/usuarios', (req, res) => {
  res.json([{ id: 1, nombre: 'Juan' }, { id: 2, nombre: 'Ana' }]);
});

// Inicia el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
  console.log(`Documentación de la API disponible en http://localhost:${port}/api-docs`);
});
