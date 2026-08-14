"use strict";

const http = require("node:http");

const port = Number.parseInt(process.env.PORT || "4000", 10);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535");
}

function sendJson(response, statusCode, value) {
  const body = JSON.stringify(value);
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(body),
  });
  response.end(body);
}

const server = http.createServer((request, response) => {
  if (request.method === "GET" && request.url === "/health") {
    sendJson(response, 200, { status: "ok" });
    return;
  }

  if (request.method === "GET" && request.url === "/price") {
    sendJson(response, 200, { price: 25 });
    return;
  }

  sendJson(response, 404, { error: "not_found" });
});

server.listen(port, "0.0.0.0", () => {
  process.stdout.write(`Pricing service listening on port ${port}\n`);
});

function shutdown(signal) {
  process.stdout.write(`Pricing service received ${signal}; shutting down\n`);
  server.close(() => process.exit(0));
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
