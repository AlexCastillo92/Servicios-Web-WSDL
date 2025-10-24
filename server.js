// server.js
const express = require('express');
const fs = require('fs');
const soap = require('soap');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const WSDL_PATH = path.join(__dirname, 'calculator.wsdl');

// ---- (1) Servicio SOAP ----
const serviceDefinition = {
  CalculatorService: {
    CalculatorPort: {
      Add: ({ a, b }) => ({ result: Number(a) + Number(b) }),
      Subtract: ({ a, b }) => ({ result: Number(a) - Number(b) }),
      Multiply: ({ a, b }) => ({ result: Number(a) * Number(b) }),
      Divide: ({ a, b }) => {
        const A = Number(a), B = Number(b);
        if (B === 0) return { result: NaN, message: 'Division by zero' };
        return { result: A / B };
      }
    }
  }
};

const wsdlXml = fs.readFileSync(WSDL_PATH, 'utf8');

// ---- (2) Estático: podrá abrirse /client.html ----
app.use(express.static(__dirname)); // sirve archivos de la carpeta del proyecto

// ---- (3) Ruta directa: /test sirve client.html ----
app.get('/test', (_req, res) => {
  const file = path.resolve(__dirname, 'client.html');
  res.sendFile(file);
});

// ---- (4) Ping simple ----
app.get('/', (_req, res) => {
  res.send('SOAP Calculator up. WSDL at /calculator?wsdl — UI at /test o /client.html');
});

// ---- (5) Monta SOAP en /calculator ----
const server = app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
  soap.listen(server, '/calculator', serviceDefinition, wsdlXml);
});
