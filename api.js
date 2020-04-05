'use strict'

const Speler = require('./models/Speler')

module.exports = router => {
  router.get('/spelers', async ctx => {
    ctx.body = await Speler.query()
  })

  router.get('/spelers/:id/', async ctx => {
    ctx.body = await Speler.query().findById(ctx.params.id)
  })
}