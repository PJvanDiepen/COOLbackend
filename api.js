'use strict'

const Gebruiker = require('./models/gebruiker');
const Persoon = require('./models/persoon');
const Ronde = require('./models/ronde');
const Speler = require('./models/speler');
const Team = require('./models/team');
const Uitslag = require('./models/uitslag');

const { fn, ref } = require('objection');

module.exports = router => {

    // geeft array met objects
    router.get('/spelers/:seizoen', async function (ctx) {
        ctx.body = await Speler.query()
            .select('speler.*', 'persoon.*')
            .join('persoon', 'persoon.knsbNummer', 'speler.knsbNummer') // TODO .joinRelated('fk_speler_persoon')
            .where('speler.seizoen', '=', ctx.params.seizoen)
            .orderBy('naam');
    });

    router.get('/seizoenen/:teamCode', async function (ctx) {
        ctx.body = await Team.query()
            .select('team.seizoen')
            .where('team.teamCode', '=', ctx.params.teamCode);
    });

    router.get('/teams/:seizoen', async function (ctx) {
        ctx.body = await Team.query()
            .where('team.seizoen', '=', ctx.params.seizoen)
            .andWhere('team.teamCode', '<>', ''); // niet geen team
    });

    /*
    -- ranglijst
    select s.knsbNummer, naam, subgroep, knsbRating, internTotalen(@seizoen, s.knsbNummer) as totalen
    from speler s
    join persoon p on s.knsbNummer = p.knsbNummer
    where seizoen = @seizoen
    order by totalen desc;

    concat(totaal, ' ', prijs, ' ', winst, ' ', remise, ' ', verlies, ' ', wit, ' ', zwart, ' ', oneven, ' ', afzeggingen, ' ', aftrek, ' ', startPunten);
     */
    router.get('/ranglijst/:seizoen', async function (ctx) {
        ctx.body = await Speler.query()
            .select(
                'speler.knsbNummer',
                'persoon.naam',
                'speler.subgroep',
                'speler.knsbRating',
                {totalen: fn('totalen', ctx.params.seizoen, ref('speler.knsbNummer'))})
            .join('persoon', 'persoon.knsbNummer', 'speler.knsbNummer')
            .where('seizoen', '=', ctx.params.seizoen)
            .orderBy('totalen', 'desc');
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
        punten(@seizoen, @knsbNummer, waardeCijfer(@seizoen, @knsbNummer), u.teamCode, u.tegenstanderNummer, u.resultaat) as punten
    from uitslag u
    join persoon p on u.tegenstanderNummer = p.knsbNummer
    join ronde r on u.seizoen = r.seizoen and u.teamCode = r.teamCode and u.rondeNummer = r.rondeNummer
    where u.seizoen = @seizoen
        and u.knsbNummer = @knsbNummer
        and u.anderTeam = 'int'
    order by u.datum, u.bordNummer;
     */
    router.get('/uitslagen/:seizoen/:knsbNummer', async function (ctx) {
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
                        fn('waardeCijfer', ctx.params.seizoen, ctx.params.knsbNummer),
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
            .andWhere('uitslag.anderTeam', 'int')
            .orderBy(['uitslag.datum','uitslag.bordNummer']);
    });

    /*
    -- uitslagen interne competitie per ronde
    select
        uitslag.knsbNummer,
        wit.naam,
        uitslag.tegenstanderNummer,
        zwart.naam,
        uitslag.resultaat
    from uitslag
    join persoon as wit on uitslag.knsbNummer = wit.knsbNummer
    join persoon as zwart on uitslag.tegenstanderNummer = zwart.knsbNummer
    where seizoen = @seizoen and teamCode = 'int' and rondeNummer = @rondeNummer and witZwart = 'w'
    order by uitslag.seizoen, bordNummer;
     */
    router.get('/ronde/:seizoen/:rondeNummer', async function (ctx) {
        ctx.body = await Uitslag.query()
            .select(
                'uitslag.knsbNummer',
                {wit: ref('wit.naam')},
                'uitslag.tegenstanderNummer',
                {zwart: ref('zwart.naam')},
                'resultaat')
            .join('persoon as wit', 'uitslag.knsbNummer', 'wit.knsbNummer')
            .join('persoon as zwart', 'uitslag.tegenstanderNummer', 'zwart.knsbNummer')
            .where('uitslag.seizoen', ctx.params.seizoen)
            .andWhere('uitslag.teamCode', 'int')
            .andWhere('uitslag.rondeNummer', ctx.params.rondeNummer)
            .andWhere('uitslag.witZwart', 'w')
            .orderBy(['uitslag.seizoen','uitslag.bordNummer']);
    });

    /*
    -- uitslagen externe competitie per team
    select uitslag.rondeNummer,
        uitslag.bordNummer,
        uitslag.witZwart,
        uitslag.resultaat,
        uitslag.knsbNummer,
        persoon.naam,
    from uitslag
    join persoon on uitslag.knsbNummer = persoon.knsbNummer
    where uitslag.seizoen = @seizoen and uitslag.teamCode = @teamCode
    order by uitslag.seizoen, uitslag.rondeNummer, uitslag.bordNummer;
     */
    router.get('/team/:seizoen/:teamCode', async function (ctx) {
        ctx.body = await Uitslag.query()
            .select(
                'uitslag.rondeNummer',
                'uitslag.bordNummer',
                'uitslag.witZwart',
                'uitslag.resultaat',
                'uitslag.knsbNummer',
                'persoon.naam')
            .join('persoon', 'uitslag.knsbNummer', 'persoon.knsbNummer')
            .where('uitslag.seizoen', ctx.params.seizoen)
            .andWhere('uitslag.teamCode', ctx.params.teamCode)
            .orderBy(['uitslag.seizoen','uitslag.rondeNummer','uitslag.bordNummer']);
    });

    router.get('/ronden/:seizoen/:teamCode', async function (ctx) {
        ctx.body = await Ronde.query()
            .where('ronde.seizoen', '=', ctx.params.seizoen)
            .andWhere('ronde.teamCode','=', ctx.params.teamCode)
            .orderBy('ronde.rondeNummer');
    });

    router.get('/wedstrijden/:seizoen', async function (ctx) {
        ctx.body = await Ronde.query()
            .where('ronde.seizoen', '=', ctx.params.seizoen)
            .andWhere('ronde.teamCode','<>', 'int')
            .orderBy('ronde.datum', 'ronde.teamCode');
    });

    /*
    registratie aanvragen voor gebruiker
     */
    router.get('/registreer/:knsbNummer/:email', async function (ctx) {
        ctx.body = await Gebruiker.query()
            .insert({knsbNummer: ctx.params.knsbNummer,
                mutatieRechten: 1,
                uuidToken: fn('uuid'),
                email: ctx.params.email});
    });

    /*
    registratie voor gebruiker activeren
     */
    router.get('/email/:uuidToken', async function (ctx) {
        ctx.body = await Gebruiker.query()
            .findById(ctx.params.uuidToken)
            .patch({datumEmail: fn('curdate')});
    });

    /*
    knsbNummer, naam en mutatieRechten van gebruiker opzoeken
     */
    router.get('/gebruiker/:uuidToken', async function (ctx) {
        ctx.body = await Gebruiker.query()
            .findById(ctx.params.uuidToken)
            .select('persoon.knsbNummer', 'mutatieRechten', 'naam')
            .join('persoon', 'gebruiker.knsbNummer', 'persoon.knsbNummer');
    });

    router.get('/partij/:teken', async function (ctx) {
        ctx.body = await Uitslag.query()
            .patch({partij: ctx.params.teken});
    });

}
