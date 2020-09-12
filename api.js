'use strict'

const Speler = require('./models/Speler')
const Persoon = require('./models/Persoon')

module.exports = router => {
  router.get('/personen', async ctx => {
    ctx.body = await Persoon.query()
  })

  router.get('/persoon/:knsbNummer/', async ctx => {
    ctx.body = await Persoon.query().findById(ctx.params.knsbNummer);
  })

  router.get('/speler/:seizoen/:knsbNummer/', async ctx => {
    ctx.body = await Speler.query().findById([ctx.params.seizoen, ctx.params.knsbNummer]);
  })

}