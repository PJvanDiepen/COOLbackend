'use strict'

const Gebruiker = require('./models/gebruiker');
const Mutatie = require('./models/mutatie');
const Persoon = require('./models/persoon');
const Ronde = require('./models/ronde');
const Speler = require('./models/speler');
const Team = require('./models/team');
const Uitslag = require('./models/uitslag');

const { fn, ref } = require('objection');

module.exports = router => {

    router.get('/spelers/:seizoen', async function (ctx) {
        ctx.body = await Speler.query()
            .select('naam', 'persoon.knsbNummer')
            .join('persoon', 'persoon.knsbNummer', 'speler.knsbNummer') // TODO .joinRelated('fk_speler_persoon')
            .where('speler.seizoen', ctx.params.seizoen)
            .orderBy('naam');
    });

    router.get('/seizoenen/:teamCode', async function (ctx) {
        ctx.body = await Team.query()
            .select('team.seizoen')
            .where('team.teamCode', ctx.params.teamCode);
    });

    router.get('/teams/:seizoen', async function (ctx) {
        ctx.body = await Team.query()
            .where('team.seizoen', ctx.params.seizoen)
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
            .where('seizoen', ctx.params.seizoen)
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
        u.partij,
        r.uithuis,
        r.tegenstander,
        punten(@seizoen, @knsbNummer, waardeCijfer(@seizoen, @knsbNummer), u.teamCode, u.partij, u.tegenstanderNummer, u.resultaat) as punten
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
                'uitslag.partij',
                'ronde.uithuis',
                'ronde.tegenstander',
                {punten: fn('punten',
                        ctx.params.seizoen,
                        ctx.params.knsbNummer,
                        fn('waardeCijfer', ctx.params.seizoen, ctx.params.knsbNummer),
                        ref('uitslag.teamCode'),
                        ref('uitslag.partij'),
                        ref('uitslag.tegenstanderNummer'),
                        ref('uitslag.resultaat'))})
            .join('persoon', 'persoon.knsbNummer', 'uitslag.tegenstanderNummer')
            .join('ronde', function(join) {
                join.on('uitslag.seizoen', 'ronde.seizoen')
                    .andOn('uitslag.teamCode', 'ronde.teamCode')
                    .andOn('uitslag.rondeNummer','ronde.rondeNummer')})
            .where('uitslag.seizoen', ctx.params.seizoen)
            .andWhere('uitslag.knsbNummer', ctx.params.knsbNummer)
            .andWhere('uitslag.anderTeam', 'int')
            .orderBy(['uitslag.datum','uitslag.bordNummer']);
    });


    /*
    -- agenda voor alle interne en externe ronden per speler
    with
      s as (select * from speler where seizoen = @seizoen and knsbNummer = @knsbNummer),
      u as (select * from uitslag where seizoen = @seizoen and knsbNummer = @knsbNummer)
    select r.*, u.bordNummer, u.partij, u.witZwart, u.tegenstanderNummer, u.resultaat
      from ronde r
      join s on r.seizoen = s.seizoen
      left join u on r.seizoen = u.seizoen and r.teamCode = u.teamCode and r.rondeNummer = u.rondeNummer
    where r.seizoen = @seizoen and r.teamCode in ('int', s.knsbTeam, s.nhsbTeam)
    order by r.datum;
     */
    router.get('/agenda/:seizoen/:knsbNummer', async function (ctx) {
        ctx.body = await Ronde.query()
            .with('s', function (qb) {
                qb.from('speler')
                    .where('speler.seizoen', ctx.params.seizoen)
                    .andWhere('speler.knsbNummer', ctx.params.knsbNummer)
            })
            .with('u',function (qb) {
                qb.from('uitslag')
                    .where('uitslag.seizoen', ctx.params.seizoen)
                    .andWhere('uitslag.knsbNummer', ctx.params.knsbNummer)
            })
            .select('ronde.*',
                'u.bordNummer',
                'u.partij',
                'u.witZwart',
                'u.tegenstanderNummer',
                'u.resultaat')
            .join('s', 's.seizoen', 'ronde.seizoen')
            .leftJoin('u', function(join) {
                join.on('u.seizoen', 'ronde.seizoen')
                    .andOn('u.teamCode', 'ronde.teamCode')
                    .andOn('u.rondeNummer', 'ronde.rondeNummer')})
            .whereIn('ronde.teamCode', ['int', ref('s.knsbTeam'), ref('s.nhsbTeam')])
            .andWhere('ronde.seizoen', ctx.params.seizoen)
            .orderBy('ronde.datum');
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

    router.get('/deelnemers/:seizoen/:teamCode/:rondeNummer', async function (ctx) {
        ctx.body = await Uitslag.query()
            .select('uitslag.knsbNummer', 'persoon.naam')
            .join('persoon', 'uitslag.knsbNummer', 'persoon.knsbNummer')
            .where('uitslag.seizoen', ctx.params.seizoen)
            .andWhere('uitslag.teamCode', ctx.params.teamCode)
            .andWhere('uitslag.rondeNummer', ctx.params.rondeNummer)
            .andWhere('uitslag.partij', 'm'); // MEEDOEN
    });

    router.get('/ronden/:seizoen/:teamCode', async function (ctx) {
        ctx.body = await Ronde.query()
            .where('ronde.seizoen', ctx.params.seizoen)
            .andWhere('ronde.teamCode', ctx.params.teamCode)
            .orderBy('ronde.rondeNummer');
    });

    router.get('/wedstrijden/:seizoen', async function (ctx) {
        ctx.body = await Ronde.query()
            .where('ronde.seizoen', ctx.params.seizoen)
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
        const gebruiker = await gebruikerRechten(ctx.params.uuidToken);
        ctx.body = gebruiker.dader;
    });

    router.get('/gebruikers', async function (ctx) {
       ctx.body = await Gebruiker.query()
           .select('gebruiker.knsbNummer', 'naam', 'datumEmail')
           .join('persoon', 'gebruiker.knsbNummer', 'persoon.knsbNummer')
           .orderBy('naam');
    });

    router.get('/mutaties/:van/:tot/:aantal', async function (ctx) {
        ctx.body = await Mutatie.query()
            .select('naam', 'mutatie.*')
            .join('persoon', 'mutatie.knsbNummer', 'persoon.knsbNummer')
            .whereBetween('invloed', [ctx.params.van, ctx.params.tot])
            .orderBy('tijdstip', 'desc')
            .limit(ctx.params.aantal);
    });

    router.get('/:uuidToken/agenda/:seizoen/:teamCode/:rondeNummer/:knsbNummer/:partij/:datum/:anderTeam', async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuidToken);
        if (gebruiker.juisteRechten(1)) {
            const uitslag = await Uitslag.query()
                .insert({seizoen: ctx.params.seizoen,
                    teamCode: ctx.params.teamCode,
                    rondeNummer: ctx.params.rondeNummer,
                    bordNummer: 0,
                    knsbNummer: ctx.params.knsbNummer,
                    partij: ctx.params.partij,
                    witZwart: "",
                    tegenstanderNummer: 0,
                    resultaat: "",
                    datum: ctx.params.datum,
                    anderTeam: ctx.params.anderTeam});
            await mutatie(gebruiker, ctx, 1, GEEN_INVLOED);
            ctx.body = 1;
        } else {
            ctx.body = 0;
        }
    });

    router.get('/:uuidToken/partij/:seizoen/:teamCode/:rondeNummer/:knsbNummer/:partij', async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuidToken);
        if (gebruiker.juisteRechten(8) || gebruiker.eigenData(1, ctx.params.knsbNummer)) {
            const aantal = await Uitslag.query()
                .where('uitslag.seizoen', ctx.params.seizoen)
                .andWhere('uitslag.teamCode', ctx.params.teamCode)
                .andWhere('uitslag.rondeNummer', ctx.params.rondeNummer)
                .andWhere('uitslag.knsbNummer', ctx.params.knsbNummer)
                .patch({partij: ctx.params.partij});
            await mutatie(gebruiker, ctx, aantal, OPNIEUW_INDELEN);
            ctx.body = aantal;
        } else {
            ctx.body = 0;
        }
    });

    router.get('/:uuidToken/verwijder/speler/:seizoen/:knsbNummer', async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuidToken);
        if (gebruiker.vorigSeizoen(9, ctx.params.seizoen)) {
            const uitslagen = await Uitslag.query()
                .where('seizoen', ctx.params.seizoen)
                .andWhere('knsbNummer',ctx.params.knsbNummer)
                .limit(1);
            if (uitslagen.length) {
                ctx.body = 0; // indien uitslagen van speler dan niet speler verwijderen
            } else {
                const aantal = await Speler.query()
                    .delete()
                    .where('seizoen', ctx.params.seizoen)
                    .andWhere('knsbNummer',ctx.params.knsbNummer);
                await mutatie(gebruiker, ctx, aantal, GEEN_INVLOED);
                ctx.body = aantal;
            }
        } else {
            ctx.body = 0;
        }
    });

    router.get('/:uuidToken/verwijder/afzeggingen/:seizoen/:knsbNummer', async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuidToken);
        if (gebruiker.vorigSeizoen(9, ctx.params.seizoen)) {
            const intern = await Uitslag.query()
                .where('seizoen', ctx.params.seizoen)
                .andWhere('knsbNummer',ctx.params.knsbNummer)
                .andWhere('partij', 'i')
                .limit(1);
            if (intern.length) {
                ctx.body = 0; // indien interne partijen dan geen afzeggingen verwijderen
            } else {
                const aantal = await Uitslag.query()
                    .delete()
                    .where('seizoen', ctx.params.seizoen)
                    .andWhere('knsbNummer',ctx.params.knsbNummer)
                    .andWhere('partij', 'a');
                await mutatie(gebruiker, ctx, aantal, GEEN_INVLOED);
                ctx.body = aantal;
            }
        } else {
            ctx.body = 0;
        }
    });

}

async function gebruikerRechten(uuidToken) {
    const dader = await Gebruiker.query()
        .findById(uuidToken)
        .select('persoon.knsbNummer', 'mutatieRechten', 'naam')
        .join('persoon', 'gebruiker.knsbNummer', 'persoon.knsbNummer');

    function juisteRechten(minimum) {
        return Number(dader.mutatieRechten) >= minimum;
    }

    function eigenData(minimum, knsbNummer) {
        return juisteRechten(minimum) && dader.knsbNummer === knsbNummer;
    }

    function vorigSeizoen(minimum, seizoen) {
        return juisteRechten(minimum) && ditSeizoen() !== seizoen;
    }

    function ditSeizoen() {  // TODO zie uitslagen.js
        const datum = new Date();
        const i = datum.getFullYear() - (datum.getMonth() > 6 ? 2000 : 2001); // na juli dit jaar anders vorig jaar
        return `${voorloopNul(i)}${voorloopNul(i+1)}`;
    }

    function voorloopNul(getal) { // TODO zie uitslagen.js
        return getal < 10 ? "0" + getal : getal;
    }

    return Object.freeze({dader, juisteRechten, eigenData, vorigSeizoen});
}

// mutatie.invloed
const GEEN_INVLOED = 0;
const OPNIEUW_INDELEN = 1;
const NIEUWE_RANGLIJST = 2;

async function mutatie(gebruiker, ctx, aantal, invloed) {
    if (aantal) {
        await Mutatie.query().insert({ // await is noodzakelijk, want anders gaat insert niet door
            knsbNummer: gebruiker.dader.knsbNummer,
            url: ctx.request.url.substring(38), // zonder uuidToken
            aantal: aantal,
            invloed: invloed});
    }
}
