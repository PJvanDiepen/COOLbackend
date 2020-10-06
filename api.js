'use strict'

const Persoon = require('./models/Persoon');
const Ronde = require('./models/Ronde');
const Speler = require('./models/Speler');
const Uitslag = require('./models/Uitslag');

const { fn, ref } = require('objection');

module.exports = router => {
  router.get('/', ctx => {
    ctx.body = 'Hier is COOL!'
  })

  router.get('/test', getMessage)

  function getMessage() {  // TODO waarom werkt deze niet?
    ctx.body = "Test COOL!";
  }

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

  /*
  -- ruwe ranglijst
  select s.knsbNummer, naam, totaal(@seizoen, s.knsbNummer) as punten
  from speler s join persoon p on s.knsbNummer = p.knsbNummer
  where seizoen = @seizoen
  order by punten desc;
   */

  router.get('/ranglijst/:seizoen/', async ctx => {
    ctx.body = await Speler.query()
        .select('speler.knsbNummer', 'persoon.naam', {totaal: fn('totaal', ctx.params.seizoen, ref('speler.knsbNummer'))})
        .join('persoon', 'persoon.knsbNummer', 'speler.knsbNummer')
        .where('seizoen', '=', ctx.params.seizoen)
        .orderBy('totaal', 'desc');
  })

  /*
  -- punten van alle uitslagen per speler

  set @eigenPunten = waardeCijfer(@seizoen, @knsbNummer);

  select
      u.datum,
      u.rondeNummer,
      witZwart,
      t.naam,
      resultaat,
      u.teamCode,
      tegenstander,
      plaats,
      punten(@eigenPunten, u.seizoen, u.teamCode, tegenstanderNummer, resultaat) as punten
  from uitslag u
      join persoon t on u.tegenstanderNummer = t.knsbNummer
      join ronde r on u.seizoen = r.seizoen and u.teamCode = r.teamCode and u.rondeNummer = r.rondeNummer
  where u.seizoen = @seizoen and u.knsbNummer = @knsbNummer
  order by u.datum;
   */

  router.get('/uitslagen/:seizoen/:knsbNummer/', async ctx => {
    let eigenPunten = 10; // TODO await fn('waardeCijfer', ctx.params.seizoen, ctx.params.knsbNummer);
    console.log("eigenPunten: " + eigenPunten);
    ctx.body = await Uitslag.query()
        .select(
            'uitslag.datum',
            'uitslag.rondeNummer',
            'uitslag.witZwart',
            'persoon.naam',
            'uitslag.resultaat',
            'uitslag.teamCode',
            'ronde.tegenstander',
            'ronde.plaats',
            {punten: fn('punten',
                  eigenPunten,
                  ref('uitslag.seizoen'),
                  ref('uitslag.teamCode'),
                  ref('uitslag.tegenstanderNummer'),
                  ref('uitslag.resultaat'))})
        .join('persoon', 'persoon.knsbNummer', 'uitslag.tegenstanderNummer')
        .join('ronde', function() {
          this.on('uitslag.seizoen', '=', 'ronde.seizoen')
              .andOn('uitslag.teamCode', '=', 'ronde.teamCode')
              .andOn('uitslag.rondeNummer', '=', 'ronde.rondeNummer')})
        .where('uitslag.seizoen', ctx.params.seizoen)
        .andWhere('uitslag.knsbNummer', ctx.params.knsbNummer)
        .orderBy('uitslag.datum');
  })
}