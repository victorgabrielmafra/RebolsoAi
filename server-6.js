#!/usr/bin/env node

/**
 * Servidor de produção configurado para rodar em 0.0.0.0:3000
 * Garante que o port 3000 sempre esteja aberto e acessível no sandbox
 */

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = false; // SEMPRE modo produção
const hostname = '0.0.0.0'; // Escuta em todas as interfaces
const port = 3000;

// Tratamento global de erros para evitar crashes silenciosos
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  console.error('Stack:', error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
});

// Inicializa o Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('❌ Error handling request:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }).listen(port, hostname, (err) => {
    if (err) {
      console.error('❌ Failed to start server:', err);
      throw err;
    }
    console.log('');
    console.log('✅ ========================================');
    console.log('✅ SERVIDOR RODANDO EM MODO PRODUÇÃO');
    console.log('✅ ========================================');
    console.log(`✅ Host: ${hostname}`);
    console.log(`✅ Port: ${port}`);
    console.log(`✅ URL: http://${hostname}:${port}`);
    console.log('✅ ========================================');
    console.log('');
  });
}).catch((err) => {
  console.error('❌ Failed to prepare Next.js app:', err);
  process.exit(1);
});
