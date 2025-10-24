// server.js
// Servidor SOAP basado en WSDL-first para una calculadora básica.
// Usa Express para exponer el endpoint y node-soap para montar el servicio.

const express = require('express');
const fs = require('fs');
const soap = require('soap');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const WSDL_PATH = path.join(__dirname, 'calculator.wsdl');

// Implementación de las operaciones definidas en el WSDL (CalculatorPortType)
const serviceDefinition = {
  CalculatorService: {
    CalculatorPort: {
      Add: ({ a, b }) => {
        const result = Number(a) + Number(b);
        return { result };
      },
      Subtract: ({ a, b }) => {
        const result = Number(a) - Number(b);
        return { result };
      },
      Multiply: ({ a, b }) => {
        const result = Number(a) * Number(b);
        return { result };
      },
      Divide: ({ a, b }) => {
        const A = Number(a);
        const B = Number(b);

        if (B === 0) {
          // Para mantener simple la prueba, devolvemos mensaje en lugar de Fault
          return { result: NaN, message: 'Division by zero' };
        }
        return { result: A / B };
      }
    }
  }
};

// Endpoint para revisar que el server vive
app.get('/', (_req, res) => {
  res.send('SOAP Calculator up. WSDL at /calculator?wsdl');
});

const wsdlXml = fs.readFileSync(WSDL_PATH, 'utf8');

// Montamos el servicio SOAP en /calculator
const server = app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
  soap.listen(server, '/calculator', serviceDefinition, wsdlXml);
});

// (A) — Opcional: habilitar CORS simple para pruebas externas (si sirves client.html en otro origen)
const allowCORS = false; // cámbialo a true si lo necesitas
if (allowCORS) {
  const cors = require('cors');
  app.use(cors()); // npm i cors
}

// (B) — Ruta para servir la UI
const CLIENT_PATH = path.join(__dirname, 'client.html');
app.get('/test', (_req, res) => {
  res.sendFile(CLIENT_PATH);
});
