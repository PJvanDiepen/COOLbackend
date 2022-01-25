'use strict'

const Gebruiker = require('./models/gebruiker');
const Mutatie = require('./models/mutatie');
const Persoon = require('./models/persoon');
const Ronde = require('./models/ronde');
const Speler = require('./models/speler');
const Team = require('./models/team');
const Uitslag = require('./models/uitslag');

const { fn, ref } = require('objection');

const package_json = require('./package.json');

// mutatie.invloed
const GEEN_INVLOED = 0;
const OPNIEUW_INDELEN = 1;
const NIEUWE_RANGLIJST = 2;

const laatsteMutaties = [];
let uniekeMutaties = 0;

async function mutatie(gebruiker, ctx, aantal, invloed) {
    if (aantal) {
        laatsteMutaties[invloed] = uniekeMutaties++;
        await Mutatie.query().insert({ // await is noodzakelijk, want anders gaat insert niet door
            knsbNummer: gebruiker.dader.knsbNummer,
            volgNummer: uniekeMutaties,
            url: ctx.request.url.substring(38).replace("%C2%BD", REMISE), // zonder uuidToken
            aantal: aantal,
            invloed: invloed});
    }
}

module.exports = router => {

    // geef values zonder keys van 1 kolom -----------------------------------------------------------------------------

    router.get('/versie', async function (ctx) {
        ctx.body = JSON.stringify(package_json.version);
    });

    router.get('/gewijzigd', async function (ctx) {
        ctx.body = laatsteMutaties;
    });

    router.get('/seizoenen/:teamCode', async function (ctx) {
        const seizoenen = await Team.query()
            .select('team.seizoen')
            .where('team.teamCode', ctx.params.teamCode);
        ctx.body = seizoenen.map(function(team) {return team.seizoen});
    });

    /*
    -- volgende externe wedstrijd
    select datum from uitslag where seizoen = @seizoen and teamCode not in ('int', 'ipv') and partij in ('m', 'n') order by datum limit 1;
     */
    router.get('/extern/:seizoen', async function (ctx) {
        const volgende = await Uitslag.query()
            .select('uitslag.datum')
            .where('uitslag.seizoen', ctx.params.seizoen)
            .whereNotIn('uitslag.teamCode', [INTERNE_COMPETITIE, GEEN_COMPETITIE])
            .whereIn('uitslag.partij', [MEEDOEN, NIET_MEEDOEN])
            .orderBy('uitslag.datum')
            .limit(1);
        // console.log(volgende);
        // console.log(volgende[0]);
        ctx.body = volgende.map(function (uitslag) {return uitslag.datum})[0]; // TODO zonder map en function
    });

    /*
   -- volgende interne wedstrijd
   select rondeNummer, datum from uitslag where seizoen = @seizoen and teamCode = 'int' and partij in ('m', 'n') order by datum limit 1
    */
    router.get('/intern/:seizoen', async function (ctx) {
        const volgende = await Uitslag.query()
            .select('uitslag.rondeNummer', 'uitslag.datum')
            .where('uitslag.seizoen', ctx.params.seizoen)
            .andWhere('uitslag.teamCode', INTERNE_COMPETITIE)
            .whereIn('uitslag.partij', [MEEDOEN, NIET_MEEDOEN])
            .orderBy('uitslag.datum')
            .limit(1);
        ctx.body = volgende.map(function (uitslag) {return [uitslag.rondeNummer, uitslag.datum]});
    });

    router.get('/:uuidToken/deelnemers/:seizoen/:teamCode/:rondeNummer', async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuidToken);
        let deelnemers = {};
        if (gebruiker.juisteRechten(GEREGISTREERD)) { // voorlopige indeling uitsluitend voor geregistreerde gebruikers
            deelnemers = await Uitslag.query()
                .select('uitslag.knsbNummer')
                .where('uitslag.seizoen', ctx.params.seizoen)
                .andWhere('uitslag.teamCode', ctx.params.teamCode)
                .andWhere('uitslag.rondeNummer', ctx.params.rondeNummer)
                .andWhere('uitslag.partij', MEEDOEN);
        }
        if (deelnemers.length === 0) { // voor opnieuw indelen
            deelnemers = await Uitslag.query()
                .select('uitslag.knsbNummer')
                .whereIn('uitslag.partij', [INTERNE_PARTIJ, ONEVEN, REGLEMENTAIRE_WINST])
                .andWhere('uitslag.seizoen', ctx.params.seizoen)
                .andWhere('uitslag.teamCode', ctx.params.teamCode)
                .andWhere('uitslag.rondeNummer', ctx.params.rondeNummer);
        }
        ctx.body = deelnemers.map(function(uitslag) {return uitslag.knsbNummer});
    });

    // geef key - value paren per kolom --------------------------------------------------------------------------------

    router.get('/:uuidToken/externintern/:seizoen/:rondeNummer', async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuidToken);
        let deelnemers = {};
        if (gebruiker.juisteRechten(GEREGISTREERD)) { // extern ingedeeld uitsluitend voor geregistreerde gebruikers
            deelnemers = await Uitslag.query()
                .select('naam', 'uitslag.knsbNummer')
                .join('persoon', 'persoon.knsbNummer', 'uitslag.knsbNummer')
                .where('uitslag.seizoen', ctx.params.seizoen)
                .andWhere('uitslag.teamCode', INTERNE_COMPETITIE)
                .andWhere('uitslag.rondeNummer', ctx.params.rondeNummer)
                .andWhere('uitslag.partij', EXTERN_INDELEN)
                .orderBy('naam');

        }
        ctx.body = deelnemers;
    });

    router.get('/spelers/:seizoen', async function (ctx) {
        ctx.body = await Speler.query()
            .select('naam', 'persoon.knsbNummer')
            .join('persoon', 'persoon.knsbNummer', 'speler.knsbNummer') // TODO .joinRelated('fk_speler_persoon')
            .where('speler.seizoen', ctx.params.seizoen)
            .orderBy('naam');
    });

    router.get('/teams/:seizoen', async function (ctx) {
        ctx.body = await Team.query()
            .where('team.seizoen', ctx.params.seizoen)
            .andWhere('team.teamCode', '<>', ''); // niet geen team
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
     */
    router.get('/ranglijst/:seizoen/:versie/:competitie/:datum', async function (ctx) { // TODO omwisselen /:competitie/:versie
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
                        ctx.params.versie,
                        ref('speler.knsbNummer'),
                        ctx.params.competitie,
                        ctx.params.datum)})
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
                        ctx.params.versie,
                        ctx.params.knsbNummer,
                        fn('waardeCijfer', ctx.params.versie, fn('rating', ctx.params.seizoen, ctx.params.knsbNummer)),
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
            .andWhere('uitslag.anderTeam', ctx.params.competitie) // TODO anderTeam = competitie
            .orderBy(['uitslag.datum','uitslag.bordNummer']);
    });

    /*
    -- ronden per seizoen en competitie met aantal uitslagen
    with u as
      (select seizoen, teamCode, rondeNummer, count(resultaat) resultaten
      from uitslag where seizoen = @seizoen and teamCode = @teamCode and resultaat in ('1', '0', '½') group by rondeNummer)
    select r.*, ifnull(resultaten, 0) aantal from ronde r
    left join u on r.seizoen = u.seizoen and r.teamCode = u.teamCode and r.rondeNummer = u.rondeNummer
    where r.seizoen = @seizoen and r.teamCode = @teamCode
    order by r.rondeNummer;
     */
     router.get('/rondjes/:seizoen/:teamCode', async function (ctx) { // TODO rondjes <-- ronden
         ctx.body = await Ronde.query()
             .with('u',function (qb) {
                 qb.from('uitslag')
                     .select(
                         'uitslag.seizoen',
                         'uitslag.teamCode',
                         'uitslag.rondeNummer',
                         {resultaten: fn('count', 'uitslag.resultaat')})
                     .whereIn('uitslag.resultaat', [WINST, VERLIES, REMISE])
                     .andWhere('uitslag.seizoen', ctx.params.seizoen)
                     .andWhere('uitslag.teamCode', ctx.params.teamCode)
                     .groupBy('uitslag.rondeNummer')
             })
             .select('ronde.*',
                 {aantal: fn('ifnull', ref('resultaten'), 0)})
             .leftJoin('u', function(join) {
                 join.on('u.seizoen', 'ronde.seizoen')
                     .andOn('u.teamCode', 'ronde.teamCode')
                     .andOn('u.rondeNummer', 'ronde.rondeNummer')})
             .where('ronde.seizoen', ctx.params.seizoen)
             .andWhere('ronde.teamCode', ctx.params.teamCode)
             .orderBy('ronde.rondeNummer');
    });

    router.get('/:uuidToken/teamleider/:seizoen/:teamCode/:datum', async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuidToken);
        if (gebruiker.juisteRechten(TEAMLEIDER)) {
            ctx.body = await Uitslag.query()
                .select(
                    'uitslag.knsbNummer',
                    'uitslag.bordNummer',
                    'uitslag.partij',
                    'uitslag.witZwart',
                    'uitslag.resultaat',
                    'speler.nhsbTeam',
                    'speler.nhsbOpgegeven',
                    'speler.knsbTeam',
                    'speler.knsbOpgegeven',
                    'speler.knsbRating',
                    'persoon.naam')
                .join('persoon', 'uitslag.knsbNummer', 'persoon.knsbNummer')
                .join('speler', function(join) {
                    join.on('uitslag.seizoen', 'speler.seizoen')
                        .andOn('uitslag.knsbNummer','speler.knsbNummer')})
                .where('uitslag.seizoen', ctx.params.seizoen)
                .andWhere('uitslag.teamCode', ctx.params.teamCode)
                .andWhere('uitslag.datum', ctx.params.datum)
                .whereNotIn('uitslag.teamCode', [INTERNE_COMPETITIE, GEEN_COMPETITIE])
                .orderBy('speler.knsbRating', 'desc');
        } else {
            ctx.body = [];
        }
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
    where seizoen = @seizoen and teamCode = 'int' and rondeNummer = @rondeNummer and witZwart = 'w'
    order by uitslag.seizoen, bordNummer;
     */
    router.get('/ronde/:seizoen/:rondeNummer', async function (ctx) {
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
            .andWhere('uitslag.teamCode', INTERNE_COMPETITIE)
            .andWhere('uitslag.rondeNummer', ctx.params.rondeNummer)
            .andWhere('uitslag.witZwart', WIT)
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
    where uitslag.seizoen = @seizoen and uitslag.teamCode = @teamCode and uitslag.team = 'e'
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
            .andWhere('uitslag.partij', EXTERNE_PARTIJ)
            .orderBy(['uitslag.seizoen','uitslag.rondeNummer','uitslag.bordNummer']);
    });

    router.get('/ronden/:seizoen/:teamCode', async function (ctx) { // TODO verwijderen
        ctx.body = await Ronde.query()
            .where('ronde.seizoen', ctx.params.seizoen)
            .andWhere('ronde.teamCode', ctx.params.teamCode)
            .orderBy('ronde.rondeNummer');
    });

    /*
    -- alle externe wedstrijden van het seizoen
    select r.*, bond, poule, omschrijving, borden, naam from ronde r
    join team t on r.seizoen = t.seizoen and r.teamCode = t.teamCode
    join persoon on teamleider = knsbNummer
    where r.seizoen = @seizoen and r.teamCode not in ('int', 'ipv')
    order by r.datum, r.teamCode;
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
            .whereNotIn('ronde.teamCode',[INTERNE_COMPETITIE, GEEN_COMPETITIE])
            .orderBy(['ronde.datum', 'ronde.teamCode']);
    });

    router.get('/backup/uitslag/:seizoen/:teamCode/:van/:tot', async function (ctx) {
        ctx.body = await Uitslag.query()
            .where('uitslag.seizoen', ctx.params.seizoen)
            .andWhere('uitslag.teamCode', ctx.params.teamCode)
            .whereBetween('uitslag.rondeNummer', [ctx.params.van, ctx.params.tot])
            .orderBy(['uitslag.rondeNummer','uitslag.bordNummer','uitslag.partij','witZwart']);
    });

    router.get('/:uuidToken/gebruikers', async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuidToken);
        if (gebruiker.juisteRechten(BEHEERDER)) {
            ctx.body = await Gebruiker.query()
                .select('gebruiker.knsbNummer', 'naam', 'email', 'mutatieRechten', 'datumEmail')
                .join('persoon', 'gebruiker.knsbNummer', 'persoon.knsbNummer')
                .orderBy('naam');
        } else {
            ctx.body = await Gebruiker.query()
                .select('gebruiker.knsbNummer', 'naam', 'email', 'mutatieRechten', 'datumEmail')
                .join('persoon', 'gebruiker.knsbNummer', 'persoon.knsbNummer')
                .where('mutatieRechten', '>=', BEHEERDER);
        }
    });

    router.get('/:uuidToken/mutaties/:van/:tot/:aantal', async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuidToken);
        if (gebruiker.juisteRechten(BEHEERDER)) {
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
     */
    router.get('/:uuidToken/email/:knsbNummer', async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuidToken);
        if (gebruiker.juisteRechten(BEHEERDER)) {
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
    */
    router.get('/gebruiker/:uuidToken', async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuidToken);
        ctx.body = gebruiker.dader;
    });

    // geef aantal mutaties --------------------------------------------------------------------------------------------

    /*
    registratie aanvragen voor gebruiker
     */
    router.get('/registreer/:knsbNummer/:email', async function (ctx) {
        await Gebruiker.query()
            .insert({knsbNummer: ctx.params.knsbNummer,
                mutatieRechten: GEREGISTREERD,
                uuidToken: fn('uuid'),
                email: ctx.params.email});
        ctx.body = 1;
    });

    /*
    registratie voor gebruiker activeren
     */
    router.get('/activeer/:uuidToken', async function (ctx) {
        ctx.body = await Gebruiker.query()
            .findById(ctx.params.uuidToken)
            .patch({datumEmail: fn('curdate')});
    });

    router.get('/:uuidToken/agenda/:seizoen/:teamCode/:rondeNummer/:knsbNummer/:partij/:datum/:competitie', async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuidToken);
        let aantal = 0;
        if (gebruiker.juisteRechten(GEREGISTREERD)) {
            await Uitslag.query()
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
                    anderTeam: ctx.params.competitie}); // TODO anderTeam = competitie
            aantal = 1;
            await mutatie(gebruiker, ctx, aantal, GEEN_INVLOED);
        }
        ctx.body = aantal;
    });

    router.get('/:uuidToken/partij/:seizoen/:teamCode/:rondeNummer/:knsbNummer/:partij', async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuidToken);
        let aantal = 0;
        if (gebruiker.juisteRechten(WEDSTRIJDLEIDER) || gebruiker.eigenData(GEREGISTREERD, ctx.params.knsbNummer)) {
            const uitslag = await Uitslag.query()
                .select('uitslag.partij', 'uitslag.datum')
                .findById([ctx.params.seizoen, ctx.params.teamCode, ctx.params.rondeNummer, ctx.params.knsbNummer]);
            if ((uitslag.partij === MEEDOEN && ctx.params.partij === NIET_MEEDOEN) ||
                (uitslag.partij === NIET_MEEDOEN && ctx.params.partij === MEEDOEN)) { // uitsluitend aanmelden of afzeggen
                aantal = await Uitslag.query()
                    .findById([ctx.params.seizoen, ctx.params.teamCode, ctx.params.rondeNummer, ctx.params.knsbNummer])
                    .patch({partij: ctx.params.partij});
                await mutatie(gebruiker, ctx, aantal, OPNIEUW_INDELEN);
            }
        }
        ctx.body = aantal;
    });

    router.get('/:uuidToken/indelen/:seizoen/:teamCode/:rondeNummer/:bordNummer/:knsbNummer/:tegenstanderNummer', async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuidToken);
        let aantal = 0;
        if (gebruiker.juisteRechten(WEDSTRIJDLEIDER)) { // indeling definitief maken
            if (await Uitslag.query()
                .where('uitslag.seizoen', ctx.params.seizoen)
                .andWhere('uitslag.teamCode', ctx.params.teamCode)
                .andWhere('uitslag.rondeNummer', ctx.params.rondeNummer)
                .andWhere('uitslag.knsbNummer', ctx.params.knsbNummer)
                .patch({bordNummer: ctx.params.bordNummer,
                    partij: INTERNE_PARTIJ,
                    witZwart: WIT,
                    tegenstanderNummer: ctx.params.tegenstanderNummer,
                    resultaat: ""})) {
                aantal++;
                if (await Uitslag.query()
                    .where('uitslag.seizoen', ctx.params.seizoen)
                    .andWhere('uitslag.teamCode', ctx.params.teamCode)
                    .andWhere('uitslag.rondeNummer', ctx.params.rondeNummer)
                    .andWhere('uitslag.knsbNummer', ctx.params.tegenstanderNummer)
                    .patch({bordNummer: ctx.params.bordNummer,
                        partij: INTERNE_PARTIJ,
                        witZwart: ZWART,
                        tegenstanderNummer: ctx.params.knsbNummer,
                        resultaat: ""})) {
                    aantal++;
                }
            }
            await mutatie(gebruiker, ctx, aantal, GEEN_INVLOED);
        }
        ctx.body = aantal;
    });

    router.get('/:uuidToken/oneven/:seizoen/:teamCode/:rondeNummer/:knsbNummer', async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuidToken);
        let aantal = 0;
        if (gebruiker.juisteRechten(WEDSTRIJDLEIDER)) { // oneven definitief maken
            aantal = await Uitslag.query()
                .where('uitslag.seizoen', ctx.params.seizoen)
                .andWhere('uitslag.teamCode', ctx.params.teamCode)
                .andWhere('uitslag.rondeNummer', ctx.params.rondeNummer)
                .andWhere('uitslag.knsbNummer', ctx.params.knsbNummer)
                .patch({partij: ONEVEN});
            await mutatie(gebruiker, ctx, aantal, GEEN_INVLOED);
        }
        ctx.body = aantal;
    });

    router.get('/:uuidToken/afwezig/:seizoen/:teamCode/:rondeNummer', async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuidToken);
        let aantal = 0;
        if (gebruiker.juisteRechten(WEDSTRIJDLEIDER)) { // afwezig definitief maken
            aantal = await Uitslag.query()
                .where('uitslag.seizoen', ctx.params.seizoen)
                .andWhere('uitslag.teamCode', ctx.params.teamCode)
                .andWhere('uitslag.rondeNummer', '<=', ctx.params.rondeNummer) // ook voor eerdere ronden
                .andWhere('uitslag.partij', NIET_MEEDOEN)
                .patch({partij: AFWEZIG});
            await mutatie(gebruiker, ctx, aantal, GEEN_INVLOED);
        }
        ctx.body = aantal;
    });

    router.get('/:uuidToken/verwijder/indeling/:seizoen/:teamCode/:rondeNummer', async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuidToken);
        let aantal = 0;
        if (gebruiker.juisteRechten(WEDSTRIJDLEIDER)) { // definitief maken terugdraaien
            const aanmelden = await Uitslag.query()
                .whereIn('uitslag.partij', [INTERNE_PARTIJ, ONEVEN, REGLEMENTAIRE_WINST])
                .andWhere('uitslag.seizoen', ctx.params.seizoen)
                .andWhere('uitslag.teamCode', ctx.params.teamCode)
                .andWhere('uitslag.rondeNummer', ctx.params.rondeNummer)
                .patch({bordNummer: 0,
                    partij: MEEDOEN,
                    witZwart: "",
                    tegenstanderNummer: 0,
                    resultaat: ""});
            const afzeggen = await Uitslag.query()
                .where('uitslag.seizoen', ctx.params.seizoen)
                .andWhere('uitslag.teamCode', ctx.params.teamCode)
                .andWhere('uitslag.rondeNummer', ctx.params.rondeNummer)
                .andWhere('uitslag.partij', AFWEZIG)
                .patch({bordNummer: 0,
                    partij: NIET_MEEDOEN,
                    witZwart: "",
                    tegenstanderNummer: 0,
                    resultaat: ""});
            aantal = aanmelden + afzeggen;
            await mutatie(gebruiker, ctx, aantal, GEEN_INVLOED);
        }
        ctx.body = aantal;
    });

    router.get('/:uuidToken/uitslag/:seizoen/:teamCode/:rondeNummer/:knsbNummer/:tegenstanderNummer/:resultaat', async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuidToken);
        let aantal = 0;
        const allesWijzigen = gebruiker.juisteRechten(WEDSTRIJDLEIDER); // uitslag van andere gebruiker wijzigen
        if (allesWijzigen ||
            gebruiker.eigenData(GEREGISTREERD, ctx.params.knsbNummer) || // eigen uitslag wijzigen
            gebruiker.eigenData(GEREGISTREERD, ctx.params.tegenstanderNummer)) {
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
            await mutatie(gebruiker, ctx, aantal, NIEUWE_RANGLIJST);
        }
        ctx.body = aantal;
    });

    router.get('/:uuidToken/schuif/ronde/:seizoen/:teamCode/:rondeNummer/:naarRonde', async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuidToken);
        let aantal = 0;
        if (gebruiker.juisteRechten(BEHEERDER)) {
            if (await Ronde.query()
                .findById([ctx.params.seizoen, ctx.params.teamCode, ctx.params.rondeNummer])
                .patch({rondeNummer: ctx.params.naarRonde})) { // plus bijbehorende uitslagen wegens fk_uitslag_ronde
                aantal = 1;
                await mutatie(gebruiker, ctx, aantal, GEEN_INVLOED);
            }
        }
        ctx.body = aantal;
    });

    router.get('/:uuidToken/verwijder/ronde/:seizoen/:teamCode/:rondeNummer', async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuidToken);
        let aantal = 0;
        if (gebruiker.juisteRechten(BEHEERDER)) {
            const resultaten = await Uitslag.query()
                .whereIn('uitslag.resultaat', [WINST, VERLIES, REMISE])
                .andWhere('uitslag.seizoen', ctx.params.seizoen)
                .andWhere('uitslag.teamCode', ctx.params.teamCode)
                .andWhere('uitslag.rondeNummer', ctx.params.rondeNummer)
                .limit(1);
            if (resultaten.length === 0) { // ronde en uitslagen verwijderen indien geen resultaten
                const uitslagen = await Uitslag.query()
                    .delete()
                    .andWhere('uitslag.seizoen', ctx.params.seizoen)
                    .andWhere('uitslag.teamCode', ctx.params.teamCode)
                    .andWhere('uitslag.rondeNummer', ctx.params.rondeNummer);
                const ronden = await Ronde.query()
                    .delete()
                    .andWhere('ronde.seizoen', ctx.params.seizoen)
                    .andWhere('ronde.teamCode', ctx.params.teamCode)
                    .andWhere('ronde.rondeNummer', ctx.params.rondeNummer);
                aantal = uitslagen + ronden;
                await mutatie(gebruiker, ctx, aantal, GEEN_INVLOED);
            }
        }
        ctx.body = aantal;
    });

    router.get('/:uuidToken/verwijder/speler/:seizoen/:knsbNummer', async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuidToken);
        let aantal = 0;
        if (gebruiker.vorigSeizoen(BEHEERDER, ctx.params.seizoen)) {
            const uitslagen = await Uitslag.query()
                .where('seizoen', ctx.params.seizoen)
                .andWhere('knsbNummer', ctx.params.knsbNummer)
                .limit(1);
            if (uitslagen.length === 0) { // speler verwijderen indien geen uitslagen
                aantal = await Speler.query()
                    .delete()
                    .where('seizoen', ctx.params.seizoen)
                    .andWhere('knsbNummer', ctx.params.knsbNummer);
                await mutatie(gebruiker, ctx, aantal, GEEN_INVLOED);
            }
        }
        ctx.body = aantal;
    });

    router.get('/:uuidToken/verwijder/afzeggingen/:seizoen/:knsbNummer', async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuidToken);
        let aantal = 0;
        if (gebruiker.vorigSeizoen(BEHEERDER, ctx.params.seizoen)) {
            const intern = await Uitslag.query()
                .where('seizoen', ctx.params.seizoen)
                .andWhere('knsbNummer',ctx.params.knsbNummer)
                .andWhere('partij', INTERNE_PARTIJ)
                .limit(1);
            if (intern.length === 0) { // afzeggingen verwijderen indien geen interne partijen
                aantal = await Uitslag.query()
                    .delete()
                    .where('seizoen', ctx.params.seizoen)
                    .andWhere('knsbNummer',ctx.params.knsbNummer)
                    .andWhere('partij', AFWEZIG);
                await mutatie(gebruiker, ctx, aantal, GEEN_INVLOED);
            }
        }
        ctx.body = aantal;
    });

}

// teamCode
const INTERNE_COMPETITIE = "int";
const GEEN_COMPETITIE    = "ipv"; // in plaats van interne competitie
// uitslag.partij
const AFWEZIG              = "a";
const EXTERNE_PARTIJ       = "e";
const INTERNE_PARTIJ       = "i";
const EXTERN_INDELEN       = "x"; // aanmelden voor externe partij op dinsdag TODO verwijderen!
const MEEDOEN              = "m"; // na aanmelden
const NIET_MEEDOEN         = "n"; // na afzeggen
const ONEVEN               = "o";
const REGLEMENTAIRE_REMISE = "r"; // vrijgesteld
const EXTERN_THUIS         = "t";
const EXTERN_UIT           = "u";
const REGLEMENTAIR_VERLIES = "v";
const REGLEMENTAIRE_WINST  = "w";
// uitslag.witZwart
const WIT = "w";
const ZWART = "z";
// uitslag.resultaat
const REMISE = "½";
const WINST = "1";
const VERLIES = "0";

function resultaatCorrect(resultaat) {
    return resultaat === REMISE || resultaat === WINST || resultaat === VERLIES || resultaat === "";
}

function resultaatDatabase(eigenResultaat, tegenstanderResultaat) {
    return resultaatCorrect(eigenResultaat) &&
        resultaatCorrect(tegenstanderResultaat) &&
        resultaatTegenstander(eigenResultaat) === tegenstanderResultaat; // database consistent
}

function resultaatTegenstander(resultaat) {
    if (resultaat === WINST) {
        return VERLIES;
    } else if (resultaat === VERLIES) {
        return WINST;
    } else {
        return resultaat; // remise of wissen
    }
}

function resultaatWijzigen(eigenResultaat, tegenstanderResultaat, resultaat, allesWijzigen) {
    if (resultaatCorrect(resultaat) && resultaatDatabase(eigenResultaat, tegenstanderResultaat)) {
        if (resultaat === "") {
            return allesWijzigen; // gebruiker mag resultaat wissen indien gebruiker alles mag wijzigen
        } else {
            return allesWijzigen || eigenResultaat === ""; // gebruiker mag alles wijzigen of uitsluitend resultaat invullen
        }
    }
    return false;
}

// gebruiker.mutatieRechten
const GEEN_LID = 0;
const GEREGISTREERD = 1;
const TEAMLEIDER = 2;
const BESTUUR = 3;
const WEDSTRIJDLEIDER = 8;
const BEHEERDER = 9;

async function gebruikerRechten(uuidToken) {
    const dader = await Gebruiker.query()
        .findById(uuidToken)
        .select('persoon.knsbNummer', 'mutatieRechten', 'naam')
        .join('persoon', 'gebruiker.knsbNummer', 'persoon.knsbNummer');

    function juisteRechten(minimum) {
        return Number(dader.mutatieRechten) >= minimum;
    }

    function eigenData(minimum, knsbNummer) {
        return juisteRechten(minimum) && dader.knsbNummer === Number(knsbNummer);
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
