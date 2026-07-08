const Koa = require('koa');
const cors = require('@koa/cors');
const KoaRouter = require('@koa/router');
const bodyParser = require('koa-bodyparser');
const Knex = require('knex');

const config = require('config');

const registerApi = require('./api');

const { Model } = require('objection');

// Tot mei 2023 was Knex(config.get('knex')) nog voldoende.
const knex = Knex(JSON.parse(JSON.stringify(config.get('knex'))));

Model.knex(knex);

const { synchroon } = require('./modules/db.cjs');
const package_json = require("./package.json");

function createApp() {
  const router = new KoaRouter();
  const app = new Koa();

  app.use(cors()); // Also worth mentioning that app.use(cors()) has to go before ANY routes (i.e. app.use(router.routes())).

  registerApi(router);

  synchroon.versie = package_json.version;
  synchroon.vragen = router.stack.map(function (route) {
    return route.path;
  });

  app.use(bodyParser());
  app.use(router.routes());
  app.use(router.allowedMethods());

  return app;
}

function start(port = process.env.PORT || 3000) {
  const app = createApp();
  const server = app.listen(port, function() {
    console.log(`0-0-0 luistert op localhost:${server.address().port}`)
  });

  return server;
}

if (require.main === module) {
  start();
}

module.exports = { createApp, start };
