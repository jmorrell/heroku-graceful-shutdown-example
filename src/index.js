#!/usr/bin/env node

const cluster = require('cluster');
const http = require('http')
const CONCURRENCY = 4;
const GRACE = 29000;
const WORKER_GRACE = 10000;

if (cluster.isMaster) {
  console.log(`Master is running on pid: ${process.pid}`);

  // Fork workers.
  for (let i = 0; i < CONCURRENCY; i++) {
    cluster.fork();
  }

  process.on('SIGTERM', () => {
    console.log(`Recieved SIGTERM on pid: ${process.pid}`);
    printCountdown();
    setTimeout(() => {
      console.log(`Exiting the Master process at ${GRACE / 1000} seconds`);
      process.exit();
    }, GRACE);
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
    setTimeout(() => {
      console.log(`Shutting down pid: ${process.pid}`);
      process.exit();
    }, WORKER_GRACE);
  });
}

function printCountdown() {
  let i = 30;
  setInterval(() => {
    i -= 1;
    console.log(`timer: ${i}`);
  }, 1000).unref();
}