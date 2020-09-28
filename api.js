'use strict'

const Speler = require('./models/Speler')
const Persoon = require('./models/Persoon')
const { fn, ref } = require('objection');

module.exports = router => {
  router.get('/', ctx => {
    ctx.body = 'Hier is COOL!'
  })

  router.get('/test', getMessage)

  function *getMessage() {
    ctx.body = "Test COOL!";
  }

  router.get('/hello', async ctx => {
    ctx.body = await ctx.render('first_view')
  })

  // https://stackoverflow.com/questions/24024566/display-a-static-html-file-with-koa-js

  // https://www.youtube.com/watch?v=z84uTk5zmak

  router.get('/personen', async ctx => {
    ctx.body = await Persoon.query()
  })

  router.get('/persoon/:knsbNummer/', async ctx => {
    ctx.body = await Persoon.query().findById(ctx.params.knsbNummer);
  })

  router.get('/speler/:seizoen/:knsbNummer/', async ctx => {
    ctx.body = await Speler.query()
        .select('speler.*', 'persoon.*')
        .join('persoon', 'persoon.knsbNummer', 'speler.knsbNummer')
        .findById([ctx.params.seizoen, ctx.params.knsbNummer]);
  })

  router.get('/ranglijst/:seizoen/', async ctx => {
    ctx.body = await Speler.query()
        .select('speler.knsbNummer', 'persoon.naam', {totaal: fn('totaal', ctx.params.seizoen, ref('speler.knsbNummer'))})
        .join('persoon', 'persoon.knsbNummer', 'speler.knsbNummer')
        .where('seizoen', '=', ctx.params.seizoen)
        .orderBy('totaal', 'desc');
  })

}