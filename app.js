const Koa = require('koa');
const cors = require('@koa/cors');
const KoaRouter = require('koa-router');
const bodyParser = require('koa-bodyparser');
const Knex = require('knex');

const config = require('config');

const registerApi = require('./api');

const { Model } = require('objection');

// Tot mei 2023 was Knex(config.get('knex')) nog voldoende.
const knex = Knex(JSON.parse(JSON.stringify(config.get('knex'))));

Model.knex(knex);

const router = new KoaRouter();
const app = new Koa();

app.use(cors()); // Also worth mentioning that app.use(cors()) has to go before ANY routes (i.e. app.use(router.routes())).

registerApi(router);

const { apiLijst } = require('./modules/db.cjs');

for (const route of router.stack) {
  apiLijst.push(route.path); // lijst van routes in db.cjs
}

app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());

const server = app.listen(3000, function() {
  console.log(`0-0-0 luistert op localhost:${server.address().port}`)
});
