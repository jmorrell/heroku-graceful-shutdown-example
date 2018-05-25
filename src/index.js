#!/usr/bin/env node

const cluster = require('cluster');
const http = require('http')
const CONCURRENCY = 4;

// Keep the service alive longer than Heroku allows
const GRACE = 31000;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < CONCURRENCY; i++) {
    cluster.fork();
  }

  process.on('SIGTERM', () => {
    console.log(`Recieved SIGTERM on pid: ${process.pid}`);
    setTimeout(() => console.log("This should never run"), GRACE);
  });
} else {
  const PORT = process.env.PORT || 5000

  const server = http.createServer((req, res) => {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/plain')
    res.end(`Hello, world!\n`)
  })

  server.listen(PORT, () => console.log(`Listening on ${PORT} on pid: ${process.pid}`))

  process.on('SIGTERM', () => {
    console.log(`Recieved SIGTERM on pid: ${process.pid}`)
  });
}
