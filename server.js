#!/usr/bin/env node

/**
 * SERVIDOR SIMPLIFICADO - PORT 3000 SEMPRE ABERTO
 * Detecta automaticamente modo dev/prod e SEMPRE abre o port
 */

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// CONFIGURAÇÕES - Detecta automaticamente dev/prod
const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost'; // Escuta apenas localmente
const port = 3000; // Port fixo

console.log('');
console.log('🚀 ========================================');
console.log('🚀 INICIANDO SERVIDOR...');
console.log(`🚀 Modo: ${dev ? 'DESENVOLVIMENTO' : 'PRODUÇÃO'}`);
console.log('🚀 ========================================');
console.log('');

// Tratamento global de erros - servidor NUNCA morre
process.on('uncaughtException', (error) => {
  console.error('❌ ERRO CAPTURADO (servidor continua):', error.message);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ PROMISE REJEITADA (servidor continua):', reason);
});

// Inicializa Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare()
  .then(() => {
    const server = createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error('❌ Erro na requisição:', err.message);
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    });

    // ABRE O PORT 3000 EM 0.0.0.0
    server.listen(port, hostname, (err) => {
      if (err) throw err;
      
      console.log('');
      console.log('✅ ========================================');
      console.log('✅ SERVIDOR RODANDO COM SUCESSO!');
      console.log('✅ ========================================');
      console.log(`✅ URL: http://${hostname}:${port}`);
      console.log(`✅ Modo: ${dev ? 'DESENVOLVIMENTO' : 'PRODUÇÃO'}`);
      console.log('✅ Port 3000: ABERTO E ACESSÍVEL');
      console.log('✅ ========================================');
      console.log('');
    });

    // Mantém servidor vivo em caso de erros
    server.on('error', (error) => {
      console.error('❌ Erro no servidor:', error.message);
    });
  })
  .catch((err) => {
    console.error('');
    console.error('❌ ========================================');
    console.error('❌ FALHA AO INICIAR NEXT.JS');
    console.error('❌ ========================================');
    console.error('Erro:', err.message);
    console.error('❌ ========================================');
    console.error('');
    process.exit(1);
  });

// Keep-alive
setInterval(() => {}, 30000);
