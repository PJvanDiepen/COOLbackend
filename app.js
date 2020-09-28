const Koa = require('koa')
const KoaRouter = require('koa-router')
const bodyParser = require('koa-bodyparser')
const Knex = require('knex')

const config = require('config');

const registerApi = require('./api')
const { Model, ForeignKeyViolationError, ValidationError } = require('objection')

const knex = Knex(config.get('knex'))

Model.knex(knex)

const router = new KoaRouter()
const app = new Koa()

var Pug = require('koa-pug'); // TODO is const i.p.v var beter ?
var pug = new Pug({
  viewPath: './views',
  basedir: './views',
  app: app //Equivalent to app.use(pug)
});

registerApi(router)

app.use(bodyParser())
app.use(router.routes())
app.use(router.allowedMethods())

const server = app.listen(3000, () => {
  console.log('COOL app listening at port %s', server.address().port)
})
