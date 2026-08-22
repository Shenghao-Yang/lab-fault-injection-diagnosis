"use strict";

const http = require("node:http");

const port = Number.parseInt(process.env.PORT || "3000", 10);
const pricingUrl = process.env.PRICING_URL || "http://localhost:4000/price";

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

async function checkout(response) {
  try {
    const pricingResponse = await fetch(pricingUrl, {
      signal: AbortSignal.timeout(500),
    });
    if (!pricingResponse.ok) {
      throw new Error(`pricing returned HTTP ${pricingResponse.status}`);
    }

    const pricing = await pricingResponse.json();
    if (typeof pricing.price !== "number" || !Number.isFinite(pricing.price)) {
      throw new Error("pricing returned an invalid price");
    }

    sendJson(response, 200, { total: pricing.price, status: "ok" });
  } catch (error) {
    process.stderr.write(`Pricing request failed: ${error.message}\n`);
    sendJson(response, 503, { error: "pricing_unavailable" });
  }
}

const server = http.createServer(async (request, response) => {
  if (request.method === "GET" && request.url === "/health") {
    sendJson(response, 200, { status: "ok" });
    return;
  }

  if (request.method === "GET" && request.url === "/checkout") {
    await checkout(response);
    return;
  }

  sendJson(response, 404, { error: "not_found" });
});

server.listen(port, "0.0.0.0", () => {
  process.stdout.write(`Checkout service listening on port ${port}\n`);
});

function shutdown(signal) {
  process.stdout.write(`Checkout service received ${signal}; shutting down\n`);
  server.close(() => process.exit(0));
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
