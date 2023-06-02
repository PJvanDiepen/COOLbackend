const Koa = require('koa');
const cors = require('@koa/cors');
const KoaRouter = require('koa-router');
const bodyParser = require('koa-bodyparser');
const Knex = require('knex');

const config = require('config');

const registerApi = require('./api');

const { apiLijst } = require('./modules/db.cjs');

const { Model, ForeignKeyViolationError, ValidationError } = require('objection');

const knex = Knex(config.get('knex'));

Model.knex(knex);

const router = new KoaRouter();
const app = new Koa();

app.use(cors()); // Also worth mentioning that app.use(cors()) has to go before ANY routes (i.e. app.use(router.routes())).

registerApi(router);

for (const route of router.stack) {
  apiLijst.push(route.path); // lijst van routes in test.js
}

app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());

const server = app.listen(3000, function() {
  console.log(`0-0-0 luistert op localhost:${server.address().port}`)
});
