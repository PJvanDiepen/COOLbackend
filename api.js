'use strict'

const db = require('./modules/db.cjs');

const Gebruiker = require('./models/gebruiker');
const Mutatie = require('./models/mutatie');
const Persoon = require('./models/persoon');
const Rating = require('./models/rating');
const Ronde = require('./models/ronde');
const Speler = require('./models/speler');
const Team = require('./models/team');
const Uitslag = require('./models/uitslag');

const { fn, ref } = require('objection');

const package_json = require('./package.json');
const knex = require("knex");

const os = require("os");

const laatsteMutaties = [];
let uniekeMutaties = 0;

async function mutatie(gebruiker, ctx, aantal, invloed) {
    if (aantal) {
        laatsteMutaties[invloed] = uniekeMutaties++;
        await Mutatie.query().insert({
            knsbNummer: gebruiker.dader.knsbNummer,
            volgNummer: uniekeMutaties,
            url: ctx.request.url.substring(38).replace("%C2%BD", db.REMISE), // zonder uuidToken en TODO "%20" vervangen door spatie?
            aantal: aantal,
            invloed: invloed});
    }
}

function teamCodes(competities) {
    const teamCode = [" ", " ", " ", " ", " "]; // voor intern1..5
    let i = 0;
    let j = 0;
    while (i < competities.length && j < teamCode.length) {
        teamCode[j] = competities.substring(i, i + 3);
        i += 3;
        j++;
    }
    return teamCode;
}

module.exports = router => {

    // geef values zonder keys van 1 kolom -----------------------------------------------------------------------------

    /*
    Zie zyq.js
    */
    router.get('/api', async function (ctx) {
        ctx.body = JSON.stringify(db.apiLijst);
    });

    /*
    Zie beheer.js
     */
    router.get('/versie', async function (ctx) {
        ctx.body = JSON.stringify(package_json.version);
    });

    router.get('/geheugen', async function (ctx) {
        ctx.body = JSON.stringify([os.freemem(), os.totalmem()]);
    });

    /*
    Zie zyq.js
     */
    router.get('/gewijzigd', async function (ctx) {
        ctx.body = laatsteMutaties;
    });

    /*
    Zie start.js
     */
    router.get('/seizoenen/:teamCode', async function (ctx) {
        const seizoenen = await Team.query()
            .select('team.seizoen')
            .where('team.teamCode', ctx.params.teamCode);
        ctx.body = seizoenen.map(function(team) {return team.seizoen});
    });

    /*
     Heeft deze ronde al een indeling en nog geen uitslagen?

     Zie zyq.js
     */
    router.get('/indeling/:seizoen/:teamCode/:rondeNummer', async function (ctx) {
        const uitslagen = await Uitslag.query()
            .where('uitslag.seizoen', ctx.params.seizoen)
            .andWhere('uitslag.teamCode', ctx.params.teamCode)
            .andWhere('uitslag.rondeNummer', ctx.params.rondeNummer)
            .andWhere('uitslag.partij', db.INTERNE_PARTIJ)
            .whereNotIn('uitslag.resultaat', [db.WINST, db.VERLIES, db.REMISE])
            .limit(1);
        ctx.body = uitslagen.length; // 1 = indeling zonder uitslagen, 0 = geen indeling
    });

    /*
    Zie indelen.js
     */
    router.get('/:uuidToken/deelnemers/:seizoen/:teamCode/:rondeNummer', async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuidToken);
        let deelnemers = {};
        if (gebruiker.juisteRechten(db.GEREGISTREERD)) { // voorlopige indeling uitsluitend voor geregistreerde gebruikers
            deelnemers = await Uitslag.query()
                .select('uitslag.knsbNummer')
                .where('uitslag.seizoen', ctx.params.seizoen)
                .andWhere('uitslag.teamCode', ctx.params.teamCode)
                .andWhere('uitslag.rondeNummer', ctx.params.rondeNummer)
                .andWhere('uitslag.partij', db.MEEDOEN);
        }
        if (deelnemers.length === 0) { // voor opnieuw indelen reeds gespeelde ronde
            deelnemers = await Uitslag.query()
                .select('uitslag.knsbNummer')
                .whereIn('uitslag.partij', [db.INTERNE_PARTIJ, db.ONEVEN, db.REGLEMENTAIRE_WINST])
                .andWhere('uitslag.seizoen', ctx.params.seizoen)
                .andWhere('uitslag.teamCode', ctx.params.teamCode)
                .andWhere('uitslag.rondeNummer', ctx.params.rondeNummer);
        }
        ctx.body = deelnemers.map(function(uitslag) {return uitslag.knsbNummer});
    });

    // geef key - value paren per kolom --------------------------------------------------------------------------------

    /*
    spelers die externe competitie spelen tijdens interne competitie

    Zie indelen.js
     */
    router.get('/:uuidToken/uithuis/:seizoen/:datum', async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuidToken);
        let uithuis = {};
        if (gebruiker.juisteRechten(db.GEREGISTREERD)) {
            uithuis = await Uitslag.query()
                .select('naam', 'uitslag.knsbNummer', 'uitslag.partij')
                .join('persoon', 'persoon.knsbNummer', 'uitslag.knsbNummer')
                .whereIn('uitslag.partij', [db.EXTERN_THUIS, db.EXTERN_UIT])
                .andWhere('uitslag.seizoen', ctx.params.seizoen)
                .andWhereNot('uitslag.teamCode', ref('uitslag.anderTeam')) // TODO waarom ref()?
                .andWhere('uitslag.datum',ctx.params.datum)
                .orderBy(['uitslag.partij', 'naam']);
        }
        ctx.body = uithuis;
    });

    /*
    Zie wijzig.js
     */
    router.get('/spelers/:seizoen', async function (ctx) {
        ctx.body = await Speler.query()
            .select('naam', 'persoon.knsbNummer')
            .join('persoon', 'persoon.knsbNummer', 'speler.knsbNummer') // TODO .joinRelated('fk_speler_persoon')
            .where('speler.seizoen', ctx.params.seizoen)
            .orderBy('naam');
    });

    /*
    -- alle personen met spelers per seizoen
    with s as
    (select * from speler where seizoen = @seizoen)
    select p.*, s.*, gebruiker.mutatieRechten, gebruiker.datumEmail
    from persoon p
    left join s on s.knsbNummer = p.knsbNummer
    left join gebruiker g on g.knsbNummer = p.knsbNummer
    order by naam;

    Zie bestuur.js
     */
    router.get('/personen/:seizoen', async function (ctx) {
        ctx.body = await Persoon.query()
            .with('s', function (qb) {
                qb.from('speler')
                    .where('speler.seizoen', ctx.params.seizoen)
            })
            .select(
                'persoon.naam',
                'persoon.knsbNummer',
                's.nhsbTeam',
                's.knsbTeam',
                's.knsbRating',
                's.datum',
                's.interneRating',
                's.intern1',
                's.intern2',
                's.intern3',
                's.intern4',
                's.intern5',
                'gebruiker.mutatieRechten',
                'gebruiker.datumEmail')
            .leftJoin('s', 'persoon.knsbNummer', 's.knsbNummer')
            .leftJoin('gebruiker', 'persoon.knsbNummer', 'gebruiker.knsbNummer')
            .orderBy('naam');
    });

    /*
    with s as
    (select * from speler where seizoen = @seizoen and knsbNummer = @knsbNummer)
    select p.*, s.*, g.mutatieRechten, g.datumEmail
    from persoon p
    left join s on s.knsbNummer = p.knsbNummer
    left join gebruiker g on g.knsbNummer = p.knsbNummer
    where p.knsbNummer = @knsbNummer;

    Zie lid.js en agenda.js
     */
    router.get('/persoon/:seizoen/:knsbNummer', async function (ctx) {
        const persoon = await Persoon.query()
            .with('s', function (qb) {
                qb.from('speler')
                    .where('speler.seizoen', ctx.params.seizoen)
                    .andWhere('speler.knsbNummer', ctx.params.knsbNummer)
            })
            .select(
                'persoon.naam',
                'persoon.knsbNummer',
                's.nhsbTeam',
                's.knsbTeam',
                's.knsbRating',
                's.datum',
                's.interneRating',
                's.intern1',
                's.intern2',
                's.intern3',
                's.intern4',
                's.intern5',
                'gebruiker.mutatieRechten',
                'gebruiker.datumEmail')
            .leftJoin('s', 'persoon.knsbNummer', 's.knsbNummer')
            .leftJoin('gebruiker', 'persoon.knsbNummer', 'gebruiker.knsbNummer')
            .where('persoon.knsbNummer', ctx.params.knsbNummer);
        ctx.body = persoon.length > 0 ? persoon[0] : {naam: "onbekend", knsbNummer: 0};
    });

    /*
    Zie zyq.js, start.js, team.js, bestuur.js, lid.js
     */
    router.get('/teams/:seizoen', async function (ctx) {
        ctx.body = await Team.query()
            .select('team.*', 'persoon.naam')
            .join('persoon', 'team.teamleider', 'persoon.knsbNummer')
            .where('team.seizoen', ctx.params.seizoen);
    });

    /*
    -- interne ronden per seizoen van verschillende competities
    select teamCode, rondeNummer, datum from ronde where seizoen = @seizoen and substring(teamCode, 1, 1) = 'i' order by datum, rondeNummer;

    Zie start.js
     */
    router.get('/ronden/intern/:seizoen', async function (ctx) {
        ctx.body = await Ronde.query()
            .select('teamCode', 'rondeNUmmer', 'datum')
            .where('seizoen', ctx.params.seizoen)
            .andWhere(fn('substring', ref('teamCode'), 1, 1), "i")  // TODO zonder fn('substring', ref( enz.
            .orderBy(['datum', 'rondeNummer']);
    });

    /*
    -- ronden per seizoen en competitie met aantal uitslagen
    with u as
      (select seizoen, teamCode, rondeNummer, count(resultaat) aantalResultaten
      from uitslag where seizoen = @seizoen and teamCode = @teamCode and resultaat in ('1', '0', '½') group by rondeNummer)
    select r.*, ifnull(aantalResultaten, 0) resultaten from ronde r
    left join u on r.seizoen = u.seizoen and r.teamCode = u.teamCode and r.rondeNummer = u.rondeNummer
    where r.seizoen = @seizoen and r.teamCode = @teamCode
    order by r.rondeNummer;

    Zie zyq.js
     */
    router.get('/ronden/:seizoen/:teamCode', async function (ctx) {
        ctx.body = await Ronde.query()
            .with('u',function (qb) {
                qb.from('uitslag')
                    .select(
                        'uitslag.seizoen',
                        'uitslag.teamCode',
                        'uitslag.rondeNummer',
                        {aantalResultaten: fn('count', 'uitslag.resultaat')})
                    .whereIn('uitslag.resultaat', [db.WINST, db.VERLIES, db.REMISE])
                    .andWhere('uitslag.seizoen', ctx.params.seizoen)
                    .andWhere('uitslag.teamCode', ctx.params.teamCode)
                    .groupBy('uitslag.rondeNummer')
            })
            .select('ronde.*',
                {resultaten: fn('ifnull', ref('aantalResultaten'), -1)}) // TODO zie /indeling
            .leftJoin('u', function(join) {
                join.on('u.seizoen', 'ronde.seizoen')
                    .andOn('u.teamCode', 'ronde.teamCode')
                    .andOn('u.rondeNummer', 'ronde.rondeNummer')})
            .where('ronde.seizoen', ctx.params.seizoen)
            .andWhere('ronde.teamCode', ctx.params.teamCode)
            .orderBy('ronde.rondeNummer');
    });

    /*
    -- ranglijst
    select
      s.knsbNummer,
      naam,
      subgroep(@seizoen, @versie, s.knsbNummer) as subgroep,
      totalen(@seizoen, @versie, s.knsbNummer, @datum) as totalen
    from speler s
    join persoon p on s.knsbNummer = p.knsbNummer
    where seizoen = @seizoen
    order by totalen desc;

    Zie zyq.js, ronde.js*, speler.js*
     */
    router.get('/ranglijst/:seizoen/:competitie/:ronde/:datum/:versie', async function (ctx) {
        ctx.body = await Speler.query()
            .select(
                'speler.knsbNummer',
                'persoon.naam',
                {subgroep: fn('subgroep',
                        ctx.params.seizoen,
                        ctx.params.versie,
                        ref('speler.knsbNummer'))},
                {totalen: fn('totalen',
                        ctx.params.seizoen,
                        ctx.params.competitie,
                        ctx.params.ronde,
                        ctx.params.datum,
                        ctx.params.versie,
                        ref('speler.knsbNummer'))})
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
        punten(
          @seizoen,
          @versie,
          @knsbNummer,
          waardeCijfer(@versie, rating(@seizoen, @knsbNummer)),
          u.teamCode,
          u.partij,
          u.tegenstanderNummer,
          u.resultaat) as punten
    from uitslag u
    join persoon p on u.tegenstanderNummer = p.knsbNummer
    join ronde r on u.seizoen = r.seizoen and u.teamCode = r.teamCode and u.rondeNummer = r.rondeNummer
    where u.seizoen = @seizoen
        and u.knsbNummer = @knsbNummer
        and u.anderTeam = @competitie
    order by u.datum, u.bordNummer;

    Zie speler.js, ronde.js*
     */
    router.get('/uitslagen/:seizoen/:versie/:knsbNummer/:competitie', async function (ctx) {
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
                        ref('uitslag.teamCode'),
                        ctx.params.versie,
                        ctx.params.knsbNummer,
                        fn('waardeCijfer', ctx.params.versie, fn('rating', ctx.params.seizoen, ctx.params.knsbNummer)),
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
            .andWhere('uitslag.anderTeam', ctx.params.competitie) // TODO anderTeam = competitie
            .orderBy(['uitslag.datum','uitslag.rondeNummer']);
    });

    /*
    -- kalender voor alle interne en externe ronden per speler
    with
      s as (select * from speler where seizoen = @seizoen and knsbNummer = @knsbNummer),
      u as (select * from uitslag where seizoen = @seizoen and knsbNummer = @knsbNummer)
    select r.*, u.partij, u.anderTeam
      from ronde r
      join s on r.seizoen = s.seizoen
    left join u on r.seizoen = u.seizoen and r.teamCode = u.teamCode and r.rondeNummer = u.rondeNummer
    where r.seizoen = @seizoen and r.teamCode in (s.knsbTeam, s.nhsbTeam, s.intern1, s.intern2, s.intern3, s.intern4, s.intern5, u.teamCode))
    order by r.datum, r.teamCode, r.rondeNummer;

    Zie agenda.js
     */
    router.get('/:uuidToken/kalender/:seizoen/:knsbNummer', async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuidToken);
        if (gebruiker.juisteRechten(db.WEDSTRIJDLEIDER) || // kalender van andere gebruiker
            gebruiker.eigenData(db.GEREGISTREERD, ctx.params.knsbNummer)) { // alleen eigen kalender
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
             .select('ronde.*', 'u.partij', 'u.anderTeam')
             .join('s', 's.seizoen', 'ronde.seizoen')
             .leftJoin('u', function(join) {
                 join.on('u.seizoen', 'ronde.seizoen')
                     .andOn('u.teamCode', 'ronde.teamCode')
                     .andOn('u.rondeNummer', 'ronde.rondeNummer')
             })
             .where('ronde.seizoen', ctx.params.seizoen)
             .whereIn('ronde.teamCode', [ // externe teams en interne competities van speler
                 ref('s.knsbTeam'),
                 ref('s.nhsbTeam'),
                 ref('s.intern1'),
                 ref('s.intern2'),
                 ref('s.intern3'),
                 ref('s.intern4'),
                 ref('s.intern5'),
                 ref('u.teamCode')]) // indien speler invaller is
             .orderBy(['ronde.datum', 'ronde.teamCode', 'ronde.rondeNummer']);
        } else {
            ctx.body = [];
        }
    });

    /*
    Zie teamleider.js

    with u as
      (select * from uitslag where seizoen = @seizoen and not teamCode = anderTeam and datum = @datum)
    select s.nhsbTeam, s.knsbTeam, s.knsbNummer, s.knsbRating, naam, u.teamCode, u.partij
    from speler s
      join persoon p on s.knsbNummer = p.knsbNummer
      left join u on s.seizoen = @seizoen and s.knsbNummer = u.knsbNummer
    where s.seizoen = @seizoen
    order by knsbRating desc;
     */
    router.get('/:uuidToken/teamleider/:seizoen/:datum', async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuidToken);
        if (gebruiker.juisteRechten(db.TEAMLEIDER)) {
            ctx.body = await Speler.query()
                .with('u',function (qb) {
                    qb.from('uitslag')
                        .where('uitslag.seizoen', ctx.params.seizoen)
                        .andWhereNot('uitslag.teamCode', ref('uitslag.anderTeam'))
                        .andWhere('uitslag.datum', ctx.params.datum)
                })
                .select(
                    'speler.nhsbTeam',
                    'speler.knsbTeam',
                    'speler.knsbNummer',
                    'speler.knsbRating',
                    'persoon.naam',
                    'u.teamCode',
                    'u.partij')
                .join('persoon', 'speler.knsbNummer', 'persoon.knsbNummer')
                .leftJoin('u', function(join) {
                    join.on('u.seizoen', 'speler.seizoen')
                        .andOn('u.knsbNummer','speler.knsbNummer')})
                .where('speler.seizoen', ctx.params.seizoen)
                .orderBy('speler.knsbRating', 'desc');
        } else {
            ctx.body = [];
        }
    });

    /*
    Zie teamlijder.js

     */
    router.get('/teamlijder/:seizoen', async function (ctx) {
        ctx.body = await Speler.query()
            .select('speler.nhsbTeam', 'speler.knsbTeam', 'speler.knsbNummer', 'speler.knsbRating', 'persoon.naam')
            .join('persoon', 'speler.knsbNummer', 'persoon.knsbNummer')
            .where('speler.seizoen', ctx.params.seizoen)
            .orderBy('speler.knsbRating', 'desc');
    });


    /*
    -- uitslagen interne competitie per ronde
    select
        uitslag.bordNummer,
        uitslag.knsbNummer,
        wit.naam,
        uitslag.tegenstanderNummer,
        zwart.naam,
        uitslag.resultaat
    from uitslag
    join persoon as wit on uitslag.knsbNummer = wit.knsbNummer
    join persoon as zwart on uitslag.tegenstanderNummer = zwart.knsbNummer
    where seizoen = @seizoen and teamCode = @teamCode and rondeNummer = @rondeNummer and witZwart = 'w'
    order by uitslag.seizoen, bordNummer;

    Zie ronde.js
     */
    router.get('/ronde/:seizoen/:teamCode/:rondeNummer', async function (ctx) {
        ctx.body = await Uitslag.query()
            .select(
                'uitslag.bordNummer',
                'uitslag.knsbNummer',
                {wit: ref('wit.naam')},
                'uitslag.tegenstanderNummer',
                {zwart: ref('zwart.naam')},
                'resultaat')
            .join('persoon as wit', 'uitslag.knsbNummer', 'wit.knsbNummer')
            .join('persoon as zwart', 'uitslag.tegenstanderNummer', 'zwart.knsbNummer')
            .where('uitslag.seizoen', ctx.params.seizoen)
            .andWhere('uitslag.teamCode', ctx.params.teamCode)
            .andWhere('uitslag.rondeNummer', ctx.params.rondeNummer)
            .andWhere('uitslag.witZwart', db.WIT)
            .orderBy('uitslag.bordNummer');
    });

    /*
    -- uitslagen en planning externe competitie per team
    select uitslag.rondeNummer,
        uitslag.bordNummer,
        uitslag.witZwart,
        uitslag.resultaat,
        uitslag.partij,
        uitslag.knsbNummer,
        persoon.naam,
    from uitslag
    join persoon on uitslag.knsbNummer = persoon.knsbNummer
    where uitslag.seizoen = @seizoen and uitslag.teamCode = @teamCode
    order by uitslag.seizoen, uitslag.rondeNummer, uitslag.bordNummer;

    Zie 0-0-0.js
     */
    router.get('/team/:seizoen/:teamCode', async function (ctx) {
        ctx.body = await Uitslag.query()
            .select(
                'uitslag.rondeNummer',
                'uitslag.bordNummer',
                'uitslag.witZwart',
                'uitslag.resultaat',
                'uitslag.partij',
                'uitslag.knsbNummer',
                'persoon.naam')
            .join('persoon', 'uitslag.knsbNummer', 'persoon.knsbNummer')
            .where('uitslag.seizoen', ctx.params.seizoen)
            .andWhere('uitslag.teamCode', ctx.params.teamCode)
            .orderBy(['uitslag.seizoen','uitslag.rondeNummer','uitslag.bordNummer']);
    });

    /*
    -- alle externe wedstrijden van het seizoen
    select r.*, bond, poule, omschrijving, borden, naam from ronde r
    join team t on r.seizoen = t.seizoen and r.teamCode = t.teamCode
    join persoon on teamleider = knsbNummer
    where r.seizoen = @seizoen and r.teamCode not in ('int', 'ipv')
    order by r.datum, r.teamCode;

    Zie ronde.js, teamleider.js
    */
    router.get('/wedstrijden/:seizoen', async function (ctx) {
        ctx.body = await Ronde.query()
            .select('ronde.*',
                'team.bond',
                'team.poule',
                'team.omschrijving',
                'team.borden',
                'persoon.naam')
            .join('team', function(join) {
                join.on('team.seizoen', 'ronde.seizoen')
                    .andOn('team.teamCode', 'ronde.teamCode')})
            .join('persoon', 'team.teamleider', 'persoon.knsbNummer')
            .where('ronde.seizoen', ctx.params.seizoen)
            .whereNotIn('ronde.teamCode',[db.INTERNE_COMPETITIE, db.RAPID_COMPETTIE, db.SNELSCHAKEN, db.ZWITSERS_TEST])
            .orderBy(['ronde.datum', 'ronde.teamCode']);
    });

    /*
    Zie bestuur.js
    */
    router.get('/rating/lijsten', async function (ctx) {
        const lijsten = [];
        for (let i = 0; i < 12; i++) {
            const lijst = await Rating.query()
                .select('rating.maand', 'rating.jaar')
                .andWhere('rating.maand', i)
                .limit(1);
            if (lijst.length) {
                lijsten.push(lijst[0]);
            }
        }
        ctx.body = lijsten;
    });

    /*
    Zie lid.js
    */
    router.get('/rating/:maand/:knsbNummer', async function (ctx) {
        const rating = await Rating.query()
            .select('knsbNummer', 'knsbNaam', 'knsbRating', 'maand', 'jaar')
            .where('maand', ctx.params.maand)
            .andWhere('knsbNummer', ctx.params.knsbNummer);
        ctx.body = rating.length > 0
            ? rating[0]
            : {knsbNummer: ctx.params.knsbNummer, knsbNaam: "onbekend", maand: 0, jaar: 0};
    });

    /*
    Zie aanmelden.js
     */
    router.get('/naam/:maand/:zoek/:aantal', async function (ctx) {
        ctx.body = await Rating.query()
            .select('knsbNummer', 'knsbNaam', 'knsbRating', 'geboorteJaar', 'sekse', 'maand', 'jaar')
            .where('maand', ctx.params.maand)
            .andWhere('knsbNaam', 'regexp', ctx.params.zoek)
            .limit(Number(ctx.params.aantal));
    });

    /*
    -- zoek in naam
    select p.*, g.*
    from persoon p left join gebruiker g on g.knsbNummer = p.knsbNUmmer
    where p.naam regexp 'jan';

    Zie aanmelden.js
     */
    router.get('/naam/gebruiker/:zoek', async function (ctx) {
        ctx.body = await Persoon.query()
            .select('persoon.knsbNummer', 'naam', 'gebruiker.mutatieRechten')
            .leftJoin('gebruiker', function(join) {
                join.on('gebruiker.knsbNummer', 'persoon.knsbNummer')})
            .where('naam', 'regexp', ctx.params.zoek);
    });

    /*
    Zie beheer.js
     */
    router.get('/backup/persoon', async function (ctx) {
        ctx.body = await Persoon.query()
            .orderBy(['naam', 'knsbNummer']);
    });

    /*
    Zie beheer.js
     */
    router.get('/backup/speler/:seizoen', async function (ctx) {
        ctx.body = await Speler.query()
            .where('seizoen', ctx.params.seizoen)
            .orderBy('knsbNummer');
    });

    /*
    Zie beheer.js
     */
    router.get('/backup/team/:seizoen', async function (ctx) {
        ctx.body = await Team.query()
            .where('seizoen', ctx.params.seizoen)
            .orderBy('teamCode');
    });

    /*
    Zie beheer.js
     */
    router.get('/backup/ronde/:seizoen', async function (ctx) {
        ctx.body = await Ronde.query()
            .where('seizoen', ctx.params.seizoen)
            .orderBy(['teamCode', 'rondeNummer']);
    });

    /*
    Zie ronde.js
     */
    router.get('/backup/ronde/uitslag/:seizoen/:teamCode/:van/:tot', async function (ctx) {
        ctx.body = await Uitslag.query()
            .where('seizoen', ctx.params.seizoen)
            .andWhere('teamCode', ctx.params.teamCode)
            .whereBetween('rondeNummer', [ctx.params.van, ctx.params.tot])
            .orderBy(['rondeNummer', 'bordNummer', 'partij', 'witZwart', 'knsbNummer']);
    });

    /*
    Zie speler.js
     */
    router.get('/backup/speler/uitslag/:seizoen/:knsbNummer', async function (ctx) {
        ctx.body = await Uitslag.query()
            .where('uitslag.seizoen', ctx.params.seizoen)
            .andWhere('uitslag.knsbNummer', ctx.params.knsbNummer)
            .orderBy(['datum','teamCode']);
    });

    /*
    Zie beheer.js
     */
    router.get('/:uuidToken/backup/gebruiker', async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuidToken);
        if (gebruiker.juisteRechten(db.BEHEERDER)) {
            ctx.body = await Gebruiker.query().orderBy('knsbNummer');
        } else {
            ctx.body = {};
        }
    });

    /*
    Zie beheer.js
     */
    router.get('/:uuidToken/gebruikers', async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuidToken);
        if (gebruiker.juisteRechten(db.BEHEERDER)) {
            ctx.body = await Gebruiker.query()
                .select('gebruiker.knsbNummer', 'naam', 'email', 'mutatieRechten', 'datumEmail')
                .join('persoon', 'gebruiker.knsbNummer', 'persoon.knsbNummer')
                .orderBy('naam');
        } else {
            ctx.body = await Gebruiker.query()
                .select('gebruiker.knsbNummer', 'naam', 'email', 'mutatieRechten', 'datumEmail')
                .join('persoon', 'gebruiker.knsbNummer', 'persoon.knsbNummer')
                .where('mutatieRechten', '>=', db.BEHEERDER);
        }
    });

    /*
    Zie beheer.js
     */
    router.get('/:uuidToken/mutaties/:van/:tot/:aantal', async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuidToken);
        if (gebruiker.juisteRechten(db.BEHEERDER)) {
            ctx.body = await Mutatie.query()
                .select('naam', 'mutatie.*')
                .join('persoon', 'mutatie.knsbNummer', 'persoon.knsbNummer')
                .whereBetween('invloed', [ctx.params.van, ctx.params.tot])
                .orderBy('tijdstip', 'desc')
                .limit(ctx.params.aantal);
        } else {
            ctx.body = await Mutatie.query()
                .select('naam', 'mutatie.*')
                .join('persoon', 'mutatie.knsbNummer', 'persoon.knsbNummer')
                .whereBetween('invloed', [ctx.params.van, ctx.params.tot])
                .andWhere('mutatie.knsbNummer', gebruiker.dader.knsbNummer)
                .orderBy('tijdstip', 'desc')
                .limit(ctx.params.aantal);
        }
    });

    /*
    email aan gebruiker om registratie te activeren

    Zie email.js
     */
    router.get('/:uuidToken/email/:knsbNummer', async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuidToken);
        if (gebruiker.juisteRechten(db.BEHEERDER)) {
            ctx.body = await Gebruiker.query()
                .select('naam', 'email', 'uuidToken')
                .join('persoon', 'gebruiker.knsbNummer', 'persoon.knsbNummer')
                .where('gebruiker.knsbNummer', ctx.params.knsbNummer);
        } else {
            ctx.body = {};
        }
    });

    /*
    knsbNummer, naam en mutatieRechten van gebruiker opzoeken

    Zie zyq.js
    */
    router.get('/gebruiker/:uuidToken', async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuidToken);
        ctx.body = gebruiker.dader;
    });

    // geef aantal mutaties --------------------------------------------------------------------------------------------

    /*
    registratie voor gebruiker activeren

    Zie zyq.js
     */
    router.get('/activeer/:uuidToken', async function (ctx) {
        ctx.body = await Gebruiker.query()
            .findById(ctx.params.uuidToken)
            .patch({datumEmail: fn('curdate')});
    });

    /*
    Zie lid.js
     */
    router.get('/:uuidToken/gebruiker/toevoegen/:knsbNummer/:email', async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuidToken);
        let aantal = 0;
        if (gebruiker.juisteRechten(db.BESTUUR)) {
            if (await Gebruiker.query().insert( {
                knsbNummer: ctx.params.knsbNummer,
                mutatieRechten: db.GEREGISTREERD,
                uuidToken: fn('uuid'),
                email: ctx.params.email} )) {
                aantal = 1;
                await mutatie(gebruiker, ctx, aantal, db.GEEN_INVLOED);
            }
        }
        ctx.body = aantal;
    });

    /*
    Zie lid.js
     */
    router.get('/:uuidToken/gebruiker/email/:knsbNummer/:email', async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuidToken);
        let aantal = 0;
        if (gebruiker.juisteRechten(db.BEHEERDER) || gebruiker.eigenData(db.GEREGISTREERD, ctx.params.knsbNummer)) {
            if (await Gebruiker.query()
                .findById(ctx.params.uuidToken)
                .patch({email: ctx.params.email})) {
                aantal = 1;
            }
            await mutatie(gebruiker, ctx, aantal, db.GEEN_INVLOED);
        }
        ctx.body = aantal;
    });

    /*
   Zie lid.js
    */
    router.get('/:uuidToken/persoon/wijzigen/:lidNummer/:knsbNummer/:naam', async function (ctx) {
        ctx.body = await Persoon.query()
        const gebruiker = await gebruikerRechten(ctx.params.uuidToken);
        let aantal = 0;
        if (gebruiker.juisteRechten(db.BEHEERDER)) {
            if (await Persoon.query()
                .findById(ctx.params.lidNummer)
                .patch({knsbNummer: ctx.params.knsbNummer, naam: ctx.params.naam})) {
                aantal = 1;
                await mutatie(gebruiker, ctx, aantal, db.GEEN_INVLOED);
            }
        }
        ctx.body = aantal;
    });

    /*
    Zie ???
     */
    router.get('/:uuidToken/team/toevoegen/:seizoen/:team/:bond', async function (ctx) { // TODO alle velden invullen
        const gebruiker = await gebruikerRechten(ctx.params.uuidToken);
        let aantal = 0;
        if (gebruiker.juisteRechten(db.BESTUUR)) {
            if (await Team.query().insert({
                seizoen: ctx.params.seizoen,
                teamCode: ctx.params.team,
                bond: ctx.params.bond,
                poule: "",
                omschrijving: ctx.params.bond === "k" ? "KNSB poule" : ctx.params.bond === "k" ? "KNSB poule" : `${ctx.params.team} competitie`,
                borden: 0,
                teamleider: 0} )) {
                aantal = 1;
                await mutatie(gebruiker, ctx, aantal, db.GEEN_INVLOED);
            }
        }
        ctx.body = aantal;
    });

    /*
    Zie ???
     */
    router.get('/:uuidToken/team/wijzigen/:seizoen/:team/:bond/:poule/:omschrijving/:borden/:teamleider', async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuidToken);
        let aantal = 0;
        if (gebruiker.juisteRechten(db.BESTUUR)) {
            if (await Team.query()
                .findById([ctx.params.seizoen, ctx.params.team])
                .patch({
                    bond: ctx.params.bond,
                    poule: ctx.params.poule,
                    omschrijving: ctx.params.omschrijving,
                    borden: ctx.params.borden,
                    teamleider: ctx.params.teamleider})) {
                aantal = 1;
                await mutatie(gebruiker, ctx, aantal, db.GEEN_INVLOED);
            }
        }
        ctx.body = aantal;
    });

    /*
    Zie aanmelden.js via bestuur.js
     */
    router.get('/:uuidToken/persoon/toevoegen/:knsbNummer/:naam', async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuidToken);
        let knsbNummer = Number(ctx.params.knsbNummer);
        let aantal = 0;
        if (gebruiker.juisteRechten(db.BESTUUR)) {
            if (!knsbNummer) {
                const nummers = await Persoon.query()
                    .select('knsbNummer')
                    .where('knsbNummer', '<', db.KNSB_NUMMER) // hoogste tijdelijke knsbNummer
                    .orderBy('knsbNummer', 'desc')
                    .limit(1);
                knsbNummer = nummers[0] ? Number(nummers[0].knsbNummer + 1) : 0;
            }
            if (knsbNummer && await Persoon.query().insert({knsbNummer: knsbNummer, naam: ctx.params.naam})) {
                aantal = 1;
                await mutatie(gebruiker, ctx, aantal, db.GEEN_INVLOED);
            }
        }
        ctx.body = knsbNummer;
    });

    /*
    Zie bestuur.js
    */
    router.get('/:uuidToken/rating/verwijderen/:maand', async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuidToken);
        let aantal = 0;
        if (gebruiker.juisteRechten(db.BESTUUR)) {
            aantal = await Rating.query().delete().where('rating.maand', ctx.params.maand);
            await mutatie(gebruiker, ctx, aantal, db.GEEN_INVLOED);
        }
        ctx.body = aantal;
    });

    /*
    KNSB ratinglijst is CSV bestand met 8 velden

    0 Relatienummer > knsbNummer
    1 Naam achternaam, voornaam > knsbNaam
    2 Titel IM, GM of ... > titel
    3 FED NED of ... > federatie
    4 Rating > knsbRating
    5 Nv > partijen
    6 Geboren > geboorteJaar
    7 S F of . > sekse

    Zie bestuur.js
    */
    router.get('/:uuidToken/rating/toevoegen/:maand/:jaar/:csv', async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuidToken);
        let aantal = 0;
        if (gebruiker.juisteRechten(db.BESTUUR)) {
            const csv = ctx.params.csv.split(';');
            if (await Rating.query().insert({
                knsbNummer: Number(csv[0]),
                knsbNaam: csv[1],
                titel: csv[2],
                federatie: csv[3],
                knsbRating: Number(csv[4]),
                partijen: Number(csv[5]),
                geboorteJaar: Number(csv[6]),
                sekse: csv[7],
                maand: ctx.params.maand,
                jaar: ctx.params.jaar} )) {
                aantal = 1;
                // await mutatie(gebruiker, ctx, aantal, db.GEEN_INVLOED);
            }
        }
        ctx.body = aantal;
    });

    /*
    Zie lid.js
     */
    router.get('/:uuidToken/speler/toevoegen/:seizoen/:knsbNummer/:knsbRating/:interneRating/:nhsb/:knsb/:competities/:datum', async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuidToken);
        let aantal = 0;
        if (gebruiker.juisteRechten(db.BESTUUR) || gebruiker.eigenData(db.GEREGISTREERD, ctx.params.knsbNummer)) {
            const intern = teamCodes(ctx.params.competities);
            if (await Speler.query().insert({
                seizoen: ctx.params.seizoen,
                knsbNummer: ctx.params.knsbNummer,
                knsbRating: ctx.params.knsbRating,
                datum: ctx.params.datum,
                interneRating: ctx.params.interneRating,
                nhsbTeam: ctx.params.nhsb,
                knsbTeam: ctx.params.knsb,
                intern1: intern[0],
                intern2: intern[1],
                intern3: intern[2],
                intern4: intern[3],
                intern5: intern[4]} )) {
                aantal = 1;
                await mutatie(gebruiker, ctx, aantal, db.GEEN_INVLOED);
            }
        }
        ctx.body = aantal;
    });

    /*
    Zie lid.js
     */
    router.get('/:uuidToken/speler/wijzigen/:seizoen/:knsbNummer/:knsbRating/:interneRating/:nhsb/:knsb/:competities/:datum', async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuidToken);
        let aantal = 0;
        if (gebruiker.juisteRechten(db.BESTUUR) || gebruiker.eigenData(db.GEREGISTREERD, ctx.params.knsbNummer)) {
            const intern = teamCodes(ctx.params.competities);
            if (await Speler.query()
                .findById([ctx.params.seizoen, ctx.params.knsbNummer])
                .patch({
                    knsbRating: ctx.params.knsbRating,
                    datum: ctx.params.datum,
                    interneRating: ctx.params.interneRating,
                    nhsbTeam: ctx.params.nhsb,
                    knsbTeam: ctx.params.knsb,
                    intern1: intern[0],
                    intern2: intern[1],
                    intern3: intern[2],
                    intern4: intern[3],
                    intern5: intern[4]})) {
                aantal = 1;
                await mutatie(gebruiker, ctx, aantal, db.GEEN_INVLOED);
            }
        }
        ctx.body = aantal;
    });

    /*
    wedstrijd in agenda toevoegen

    Zie agenda.js en teamleider.js
     */
    router.get('/:uuidToken/uitslag/toevoegen/:seizoen/:teamCode/:rondeNummer/:knsbNummer/:partij/:datum/:competitie', async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuidToken);
        let aantal = 0;
        if (gebruiker.juisteRechten(db.TEAMLEIDER) || // agenda van andere gebruiker
            gebruiker.eigenData(db.GEREGISTREERD, ctx.params.knsbNummer)) { // alleen eigen agenda
            if (await Uitslag.query().insert({
                    seizoen: ctx.params.seizoen,
                    teamCode: ctx.params.teamCode,
                    rondeNummer: ctx.params.rondeNummer,
                    bordNummer: 0,
                    knsbNummer: ctx.params.knsbNummer,
                    partij: ctx.params.partij, // TODO :partij overbodig indien uitsluitend PLANNING in plaats van PLANNING of AFWEZIG
                    witZwart: "",
                    tegenstanderNummer: 0,
                    resultaat: "",
                    datum: ctx.params.datum,
                    anderTeam: ctx.params.competitie} )) { // TODO anderTeam = competitie
                aantal = 1;
                await mutatie(gebruiker, ctx, aantal, db.GEEN_INVLOED);
            }
        }
        ctx.body = aantal;
    });

    /*
    wedstrijd in agenda wijzigen

    -- uitslagen / ronden op dezelfde datum
    select u.teamCode, u.rondeNummer, u.partij, u.anderTeam, r.uithuis
      from uitslag u
      join ronde r on r.seizoen = u.seizoen and r.teamCode = u.teamCode and r.rondeNummer = u.rondeNummer
    where u.seizoen = @seizoen and u.knsbNummer = @knsbNummer and u.datum = @datum
    order by u.teamCode, u.rondeNummer;

    Zie agenda.js

     */
    router.get('/:uuidToken/planning/:seizoen/:teamCode/:rondeNummer/:knsbNummer/:partij/:datum', async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuidToken);
        let aantal = 0;
        if (gebruiker.juisteRechten(db.TEAMLEIDER) || gebruiker.eigenData(db.GEREGISTREERD, ctx.params.knsbNummer)) {
            const ronden = await Uitslag.query()
                .select(
                    'uitslag.seizoen',
                    'uitslag.teamCode',
                    'uitslag.rondeNummer',
                    'uitslag.knsbNummer',
                    'uitslag.partij',
                    'uitslag.anderTeam',
                    'ronde.uithuis')
                .join('ronde', function (join) {
                    join.on('uitslag.seizoen', 'ronde.seizoen')
                        .andOn('uitslag.teamCode', 'ronde.teamCode')
                        .andOn('uitslag.rondeNummer', 'ronde.rondeNummer')
                })
                .where('uitslag.seizoen', ctx.params.seizoen)
                .andWhere('uitslag.knsbNummer', ctx.params.knsbNummer)
                .andWhere('uitslag.datum', ctx.params.datum)
                .orderBy(['uitslag.teamCode', 'uitslag.rondeNummer']);
            const rondeWijzigen = ronden.findIndex(function(ronde) {
                return ronde.teamCode === ctx.params.teamCode && ronde.rondeNummer === Number(ctx.params.rondeNummer);
            });
            if (rondeWijzigen >= 0 && ronden[rondeWijzigen].partij === ctx.params.partij) { // partij uit database moet hetzelfde zijn
                if (db.isMeedoen(ronden[rondeWijzigen])) {
                    aantal += await planningMuteren(ronden[rondeWijzigen], db.NIET_MEEDOEN);
                } else {
                    for (let i = 0; i < ronden.length; i++) {
                        if (i < rondeWijzigen) {
                            aantal += await planningMuteren(ronden[i], db.NIET_MEEDOEN);
                        } else if (i >= rondeWijzigen && ronden[i].teamCode === ronden[i].anderTeam) { // indien meer interne ronden per datum
                            aantal += await planningMuteren(ronden[i], db.MEEDOEN);
                        } else if (i === rondeWijzigen) {
                            aantal += await planningMuteren(ronden[i], ronden[rondeWijzigen].uithuis); // extern uit of thuis meedoen
                        } else {
                            aantal += await planningMuteren(ronden[i], db.NIET_MEEDOEN);
                        }
                    }
                }
                await mutatie(gebruiker, ctx, aantal, db.OPNIEUW_INDELEN);
            }
        }
        ctx.body = aantal;
    });

    /*
    Zie indelen.js
     */
    router.get('/:uuidToken/indelen/:seizoen/:teamCode/:rondeNummer/:bordNummer/:knsbNummer/:tegenstanderNummer', async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuidToken);
        let aantal = 0;
        if (gebruiker.juisteRechten(db.WEDSTRIJDLEIDER)) { // indeling definitief maken
            if (await Uitslag.query()
                .where('uitslag.seizoen', ctx.params.seizoen)
                .andWhere('uitslag.teamCode', ctx.params.teamCode)
                .andWhere('uitslag.rondeNummer', ctx.params.rondeNummer)
                .andWhere('uitslag.knsbNummer', ctx.params.knsbNummer)
                .patch({bordNummer: ctx.params.bordNummer,
                    partij: db.INTERNE_PARTIJ,
                    witZwart: db.WIT,
                    tegenstanderNummer: ctx.params.tegenstanderNummer,
                    resultaat: ""})) {
                aantal++;
                if (await Uitslag.query()
                    .where('uitslag.seizoen', ctx.params.seizoen)
                    .andWhere('uitslag.teamCode', ctx.params.teamCode)
                    .andWhere('uitslag.rondeNummer', ctx.params.rondeNummer)
                    .andWhere('uitslag.knsbNummer', ctx.params.tegenstanderNummer)
                    .patch({bordNummer: ctx.params.bordNummer,
                        partij: db.INTERNE_PARTIJ,
                        witZwart: db.ZWART,
                        tegenstanderNummer: ctx.params.knsbNummer,
                        resultaat: ""})) {
                    aantal++;
                }
            }
            await mutatie(gebruiker, ctx, aantal, db.GEEN_INVLOED);
        }
        ctx.body = aantal;
    });

    /*
    Zie indelen.js
     */
    router.get('/:uuidToken/oneven/:seizoen/:teamCode/:rondeNummer/:knsbNummer', async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuidToken);
        let aantal = 0;
        if (gebruiker.juisteRechten(db.WEDSTRIJDLEIDER)) { // oneven definitief maken
            aantal = await Uitslag.query()
                .where('uitslag.seizoen', ctx.params.seizoen)
                .andWhere('uitslag.teamCode', ctx.params.teamCode)
                .andWhere('uitslag.rondeNummer', ctx.params.rondeNummer)
                .andWhere('uitslag.knsbNummer', ctx.params.knsbNummer)
                .patch({partij: db.ONEVEN});
            await mutatie(gebruiker, ctx, aantal, db.GEEN_INVLOED);
        }
        ctx.body = aantal;
    });

    /*
    Zie indelen.js
     */
    router.get('/:uuidToken/afwezig/:seizoen/:teamCode/:rondeNummer', async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuidToken);
        let aantal = 0;
        if (gebruiker.juisteRechten(db.WEDSTRIJDLEIDER)) { // afwezig definitief maken
            aantal = await Uitslag.query()
                .whereIn('uitslag.partij', [db.NIET_MEEDOEN, db.PLANNING])
                .andWhere('uitslag.seizoen', ctx.params.seizoen)
                .andWhere('uitslag.teamCode', ctx.params.teamCode)
                .andWhere('uitslag.rondeNummer', '<=', ctx.params.rondeNummer) // ook voor eerdere ronden
                .patch({partij: db.AFWEZIG});
            await mutatie(gebruiker, ctx, aantal, db.GEEN_INVLOED);
        }
        ctx.body = aantal;
    });

    /*
    Zie indelen.js
     */
    router.get('/:uuidToken/extern/:seizoen/:teamCode/:rondeNummer', async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuidToken);
        let aantal = 0;
        if (gebruiker.juisteRechten(db.WEDSTRIJDLEIDER)) { // extern uit en extern thuis definitief maken
            aantal = await Uitslag.query()
                .whereIn('uitslag.partij', [db.EXTERN_THUIS, db.EXTERN_UIT])
                .andWhere('uitslag.seizoen', ctx.params.seizoen)
                .andWhere('uitslag.teamCode', ctx.params.teamCode)
                .andWhere('uitslag.rondeNummer', '<=', ctx.params.rondeNummer) // ook voor eerdere ronden
                .patch({partij: db.EXTERNE_PARTIJ});
            await mutatie(gebruiker, ctx, aantal, db.GEEN_INVLOED);
        }
        ctx.body = aantal;
    });

    /*
    resultaten van indelen, oneven en afwezig terugdraaien
    resultaten van extern niet terugdraaien

    Zie ronde.js
     */
    router.get('/:uuidToken/verwijder/indeling/:seizoen/:teamCode/:rondeNummer', async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuidToken);
        let aantal = 0;
        if (gebruiker.juisteRechten(db.WEDSTRIJDLEIDER)) { // definitief maken terugdraaien
            const aanmelden = await Uitslag.query()
                .whereIn('uitslag.partij', [db.INTERNE_PARTIJ, db.ONEVEN, db.REGLEMENTAIRE_WINST])
                .andWhere('uitslag.seizoen', ctx.params.seizoen)
                .andWhere('uitslag.teamCode', ctx.params.teamCode)
                .andWhere('uitslag.rondeNummer', ctx.params.rondeNummer)
                .patch({bordNummer: 0,
                    partij: db.MEEDOEN,
                    witZwart: "",
                    tegenstanderNummer: 0,
                    resultaat: ""});
            const afzeggen = await Uitslag.query()
                .where('uitslag.seizoen', ctx.params.seizoen)
                .andWhere('uitslag.teamCode', ctx.params.teamCode)
                .andWhere('uitslag.rondeNummer', ctx.params.rondeNummer)
                .andWhere('uitslag.partij', db.AFWEZIG)
                .patch({bordNummer: 0,
                    partij: db.NIET_MEEDOEN,
                    witZwart: "",
                    tegenstanderNummer: 0,
                    resultaat: ""});
            aantal = aanmelden + afzeggen;
            await mutatie(gebruiker, ctx, aantal, db.GEEN_INVLOED);
        }
        ctx.body = aantal;
    });

    /*
    uitslag wijzigen

    Zie ronde.js
     */
    router.get('/:uuidToken/uitslag/:seizoen/:teamCode/:rondeNummer/:knsbNummer/:tegenstanderNummer/:resultaat', async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuidToken);
        let aantal = 0;
        const allesWijzigen = gebruiker.juisteRechten(db.WEDSTRIJDLEIDER); // uitslag van andere gebruiker wijzigen
        if (allesWijzigen ||
            gebruiker.eigenData(db.GEREGISTREERD, ctx.params.knsbNummer) || // eigen uitslag wijzigen
            gebruiker.eigenData(db.GEREGISTREERD, ctx.params.tegenstanderNummer)) {
            const eigenUitslag = await Uitslag.query()
                .select('uitslag.resultaat')
                .findById([ctx.params.seizoen, ctx.params.teamCode, ctx.params.rondeNummer, ctx.params.knsbNummer]);
            const tegenstanderUitslag = await Uitslag.query()
                .select('uitslag.resultaat')
                .findById([ctx.params.seizoen, ctx.params.teamCode, ctx.params.rondeNummer, ctx.params.tegenstanderNummer]);
            if (resultaatWijzigen(eigenUitslag.resultaat, tegenstanderUitslag.resultaat, ctx.params.resultaat, allesWijzigen)) {
                if (await Uitslag.query()
                    .findById([ctx.params.seizoen, ctx.params.teamCode, ctx.params.rondeNummer, ctx.params.knsbNummer])
                    .patch({resultaat: ctx.params.resultaat})) {
                    aantal++;
                }
                if (Number(ctx.params.tegenstanderNummer) > 0) {
                    if (await Uitslag.query()
                        .findById([ctx.params.seizoen, ctx.params.teamCode, ctx.params.rondeNummer, ctx.params.tegenstanderNummer])
                        .patch({resultaat: resultaatTegenstander(ctx.params.resultaat)})) {
                        aantal++;
                    }
                }
            }
            await mutatie(gebruiker, ctx, aantal, db.NIEUWE_RANGLIJST);
        }
        ctx.body = aantal;
    });

    /*
    Zie ???.js
     */
    router.get('/:uuidToken/rondenummers/:seizoen/:teamCode', async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuidToken);
        let aantal = 0;
        if (gebruiker.juisteRechten(db.BEHEERDER)) {
            const ronden = await Ronde.query()
                .where('ronde.seizoen', ctx.params.seizoen)
                .andWhere('ronde.teamCode', ctx.params.teamCode);
            let naarRonde = 0;
            for (const ronde of ronden) {
                if (ronde.rondeNummer > ++naarRonde) {
                    if (await Ronde.query()
                        .findById([ctx.params.seizoen, ctx.params.teamCode, ronde.rondeNummer])
                        .patch({rondeNummer: naarRonde})) { // plus bijbehorende uitslagen wegens fk_uitslag_ronde
                        aantal++;
                    }
                }
            }
            await mutatie(gebruiker, ctx, aantal, db.GEEN_INVLOED);
        }
        ctx.body = aantal;
    });

    /*
    Zie ???
     */
    router.get('/:uuidToken/schuif/ronde/:seizoen/:teamCode/:rondeNummer/:naarRonde', async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuidToken);
        let aantal = 0;
        if (gebruiker.juisteRechten(db.BEHEERDER)) {
            if (await Ronde.query()
                .findById([ctx.params.seizoen, ctx.params.teamCode, ctx.params.rondeNummer])
                .patch({rondeNummer: ctx.params.naarRonde})) { // plus bijbehorende uitslagen wegens fk_uitslag_ronde
                aantal = 1;
                await mutatie(gebruiker, ctx, aantal, db.GEEN_INVLOED);
            }
        }
        ctx.body = aantal;
    });

    /*
    Zie ronde.js
     */
    router.get('/:uuidToken/verwijder/ronde/:seizoen/:teamCode/:rondeNummer', async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuidToken);
        let aantal = 0;
        if (gebruiker.juisteRechten(db.BEHEERDER)) {
            const resultaten = await Uitslag.query()
                .whereIn('uitslag.resultaat', [db.WINST, db.VERLIES, db.REMISE])
                .andWhere('uitslag.seizoen', ctx.params.seizoen)
                .andWhere('uitslag.teamCode', ctx.params.teamCode)
                .andWhere('uitslag.rondeNummer', ctx.params.rondeNummer)
                .limit(1);
            if (resultaten.length === 0) { // ronde en uitslagen verwijderen indien geen resultaten
                const uitslagen = await Uitslag.query().delete()
                    .andWhere('uitslag.seizoen', ctx.params.seizoen)
                    .andWhere('uitslag.teamCode', ctx.params.teamCode)
                    .andWhere('uitslag.rondeNummer', ctx.params.rondeNummer);
                const ronden = await Ronde.query().delete()
                    .andWhere('ronde.seizoen', ctx.params.seizoen)
                    .andWhere('ronde.teamCode', ctx.params.teamCode)
                    .andWhere('ronde.rondeNummer', ctx.params.rondeNummer);
                aantal = uitslagen + ronden;
                await mutatie(gebruiker, ctx, aantal, db.GEEN_INVLOED);
            }
        }
        ctx.body = aantal;
    });

    /*
    Zie lid.js
     */
    router.get('/:uuidToken/verwijder/persoon/:knsbNummer', async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuidToken);
        let aantal = 0;
        if (gebruiker.juisteRechten(db.BEHEERDER)) {
            const uitslagen = await Uitslag.query()
                .where('knsbNummer', ctx.params.knsbNummer)
                .limit(1);
            if (uitslagen.length === 0) { // speler, gebruiker en persoon verwijderen indien geen uitslagen
                const spelers = await Speler.query().delete()
                    .where('knsbNummer', ctx.params.knsbNummer);
                const gebruikers = await Gebruiker.query().delete()
                    .where('knsbNummer', ctx.params.knsbNummer);
                const personen = await Persoon.query().delete()
                    .where('knsbNummer', ctx.params.knsbNummer);
                aantal = spelers + gebruikers + personen;
                await mutatie(gebruiker, ctx, aantal, db.GEEN_INVLOED);
            }
        }
        ctx.body = aantal;
    });

    router.get('/:uuidToken/verwijder/mutaties', async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuidToken);
        let aantal = 0;
        if (gebruiker.juisteRechten(db.ONTWIKKElAAR)) {
            aantal = await Mutatie.query().delete()
                .where('knsbNummer', gebruiker.dader.knsbNummer);
            await mutatie(gebruiker, ctx, aantal, db.GEEN_INVLOED);
        }
        ctx.body = aantal;
    });
}

async function planningMuteren(uitslag, partij) {
    if (!db.isPlanning(uitslag)) { // uitsluitend planningMuteren
        return 0;
    } else if (await Uitslag.query()
        .findById([uitslag.seizoen, uitslag.teamCode, uitslag.rondeNummer, uitslag.knsbNummer])
        .patch({partij: partij})) {
        return 1;
    } else {
        return 0;
    }
}

function resultaatCorrect(resultaat) { // TODO naar db.cjs
    return resultaat === db.REMISE || resultaat === db.WINST || resultaat === db.VERLIES || resultaat === "";
}

function uitslagCorrect(eigenResultaat, tegenstanderResultaat) { // TODO naar db.cjs
    return resultaatCorrect(eigenResultaat) && resultaatCorrect(tegenstanderResultaat) &&
        resultaatTegenstander(eigenResultaat) === tegenstanderResultaat; // indien wit wint, verliest zwart en omgekeerd
}

function resultaatTegenstander(resultaat) { // TODO naar db.cjs
    if (resultaat === db.WINST) {
        return db.VERLIES;
    } else if (resultaat === db.VERLIES) {
        return db.WINST;
    } else {
        return resultaat; // remise of wissen
    }
}

function resultaatWijzigen(eigenResultaat, tegenstanderResultaat, resultaat, allesWijzigen) { // TODO naar db.cjs
    if (resultaatCorrect(resultaat) && uitslagCorrect(eigenResultaat, tegenstanderResultaat)) {
        if (resultaat === "") {
            return allesWijzigen; // gebruiker mag resultaat wissen indien gebruiker alles mag wijzigen
        } else {
            return allesWijzigen || eigenResultaat === ""; // gebruiker mag alles wijzigen of uitsluitend resultaat invullen
        }
    }
    return false;
}

async function gebruikerRechten(uuidToken) {
    const dader = await Gebruiker.query()
        .findById(uuidToken)
        .select('persoon.knsbNummer', 'mutatieRechten', 'naam', 'email')
        .join('persoon', 'gebruiker.knsbNummer', 'persoon.knsbNummer');

    function juisteRechten(minimum) {
        return Number(dader.mutatieRechten) >= minimum;
    }

    function eigenData(minimum, knsbNummer) {
        return juisteRechten(minimum) && dader.knsbNummer === Number(knsbNummer);
    }

    return Object.freeze({dader, juisteRechten, eigenData});
}
