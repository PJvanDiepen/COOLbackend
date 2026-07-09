const assert = require("assert");

const { createApp } = require("../app");
const packageJson = require("../package.json");
const { request } = require("./helpers/app");
const { run } = require("./helpers/runner");

async function main() {
  const app = createApp();

  await run([
    ["/api returns the registered API routes", async function () {
      const response = await request(app, "/api");
      const routes = JSON.parse(response.body);

      assert.strictEqual(response.statusCode, 200);
      assert.ok(routes.includes("/api"));
      assert.ok(routes.includes("/vragen"));
      assert.ok(routes.includes("/versie"));
      assert.ok(routes.length > 50);
    }],
    ["/versie returns the package version and server start time", async function () {
      const response = await request(app, "/versie");
      const versie = JSON.parse(response.body);

      assert.strictEqual(response.statusCode, 200);
      assert.strictEqual(versie.versie, packageJson.version);
      assert.strictEqual(typeof versie.tijdstip, "string");
    }],
    ["/synchroon returns synchronisation metadata", async function () {
      const response = await request(app, "/synchroon");
      const synchroon = JSON.parse(response.body);

      assert.strictEqual(response.statusCode, 200);
      assert.strictEqual(typeof synchroon.serverStart, "string");
      assert.ok(Number.isInteger(synchroon.compleet));
    }],
    ["unknown routes return 404", async function () {
      const response = await request(app, "/route-die-niet-bestaat");

      assert.strictEqual(response.statusCode, 404);
    }]
  ]);
}

main().catch(function (error) {
  console.error(error);
  process.exitCode = 1;
});
