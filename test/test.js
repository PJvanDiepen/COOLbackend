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
      assert.ok(routes.includes("/server"));
      assert.ok(routes.includes("/:revisie/:club/synchroon"));
      assert.ok(routes.length > 50);
    }],
    ["/server returns runtime synchronisation metadata", async function () {
      const response = await request(app, "/server");
      const serverInfo = JSON.parse(response.body);

      assert.strictEqual(response.statusCode, 200);
      assert.strictEqual(serverInfo.versie, packageJson.version);
      assert.strictEqual(typeof serverInfo.start, "string");
      assert.ok(Number.isInteger(serverInfo.revisie));
      assert.ok(serverInfo.revisie >= 1);
    }],
    ["/synchroon returns version, revision and available routes", async function () {
      const response = await request(app, "/0/13/synchroon");
      const payload = JSON.parse(response.body);
      const synchroon = payload[0];

      assert.strictEqual(response.statusCode, 200);
      assert.strictEqual(synchroon.versie, packageJson.version);
      assert.ok(synchroon.vragen.includes("/api"));
      assert.ok(synchroon.vragen.includes("/:revisie/:club/synchroon"));
      assert.ok(Number.isInteger(synchroon.revisie));
      assert.deepStrictEqual(payload.slice(1), []);
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
