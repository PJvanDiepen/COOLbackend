'use strict'

const Persoon = require('./models/persoon');
const Ronde = require('./models/ronde');
const Speler = require('./models/speler');
const Uitslag = require('./models/uitslag');

const { fn, ref } = require('objection');

module.exports = router => {
  router.get('/', ctx => {
    ctx.body = 'Hier is COOL!'
  });

  router.get('/personen', async ctx => {
    ctx.body = await Persoon.query()
  });

  router.get('/persoon/:knsbNummer/', async ctx => {
    ctx.body = await Persoon.query().findById(ctx.params.knsbNummer);
  });

  router.get('/speler/:seizoen/:knsbNummer/', async ctx => {
    ctx.body = await Speler.query()
        .select('speler.*', 'persoon.*')
        .join('persoon', 'persoon.knsbNummer', 'speler.knsbNummer')
        .findById([ctx.params.seizoen, ctx.params.knsbNummer]);
  });

  router.get('/seizoenen', async ctx => {
    ctx.body = await Speler.query()
        .distinct('speler.seizoen')
        .orderBy('speler.seizoen');
  });

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
  });

  /*
  -- punten van alle uitslagen per speler
  select u.datum,
      u.rondeNummer,
      u.bordNummer,
      u.witZwart,
      u.tegenstanderNummer,
      p.naam,
      u.resultaat,
      u.teamCode,
      r.compleet,
      r.uithuis,
      r.tegenstander,
      punten(@seizoen, @knsbNummer, u.teamCode, u.tegenstanderNummer, u.resultaat) as punten
  from uitslag u
  join persoon p on u.tegenstanderNummer = p.knsbNummer
  join ronde r on u.seizoen = r.seizoen and u.teamCode = r.teamCode and u.rondeNummer = r.rondeNummer
  where u.seizoen = @seizoen
      and u.knsbNummer = @knsbNummer
      and u.anderTeam = 'int'
  order by u.datum, u.bordNummer;
   */
  router.get('/uitslagen/:seizoen/:knsbNummer/', async ctx => {
    ctx.body = await Uitslag.query()
        .select(
            'uitslag.datum',
            'uitslag.rondeNummer',
            'uitslag.bordNummer',
            'uitslag.witZwart',
            'uitslag.tegenstanderNummer',
            'persoon.naam',
            'uitslag.resultaat',
            'uitslag.teamCode',
            'ronde.compleet',
            'ronde.uithuis',
            'ronde.tegenstander',
            {punten: fn('punten',
                  ctx.params.seizoen,
                  ctx.params.knsbNummer,
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
        .andWhere(ref('uitslag.anderTeam'), 'int')
        .orderBy(['uitslag.datum','uitslag.bordNummer']);
  });
}