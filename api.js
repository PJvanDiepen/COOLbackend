'use strict'

const Gebruiker = require('./models/gebruiker');
const Mutatie = require('./models/mutatie');
const Persoon = require('./models/persoon');
const Ronde = require('./models/ronde');
const Speler = require('./models/speler');
const Team = require('./models/team');
const Uitslag = require('./models/uitslag');

const { fn, ref } = require('objection');

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
            url: ctx.request.url.substring(38), // zonder uuidToken TODO %C2%BD vervangen door ½
            aantal: aantal,
            invloed: invloed});
    }
}

module.exports = router => {

    // geef values zonder keys van 1 kolom -----------------------------------------------------------------------------

    router.get('/gewijzigd', async function (ctx) {
        ctx.body = laatsteMutaties;
    });

    router.get('/:uuidToken/deelnemers/:seizoen/:teamCode/:rondeNummer', async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuidToken);
        let deelnemers = {};
        if (gebruiker.juisteRechten(GEREGISTREERD)) {
            deelnemers = await Uitslag.query()
                .select('uitslag.knsbNummer')
                .where('uitslag.seizoen', ctx.params.seizoen)
                .andWhere('uitslag.teamCode', ctx.params.teamCode)
                .andWhere('uitslag.rondeNummer', ctx.params.rondeNummer)
                .andWhere('uitslag.partij', MEEDOEN);
        }
        if (deelnemers.length === 0 && gebruiker.juisteRechten(WEDSTRIJDLEIDER)) {
            deelnemers = await Uitslag.query()
                .select('uitslag.knsbNummer')
                .whereIn('uitslag.partij', [INTERNE_PARTIJ, ONEVEN, REGLEMENTAIRE_WINST])
                .andWhere('uitslag.seizoen', ctx.params.seizoen)
                .andWhere('uitslag.teamCode', ctx.params.teamCode)
                .andWhere('uitslag.rondeNummer', ctx.params.rondeNummer);
        }
        ctx.body = deelnemers.map(function(uitslag) {return uitslag.knsbNummer});
    });

    router.get('/seizoenen/:teamCode', async function (ctx) {
        const seizoenen = await Team.query()
            .select('team.seizoen')
            .where('team.teamCode', ctx.params.teamCode);
        ctx.body = seizoenen.map(function(team) {return team.seizoen});
    });

    // geef key - value paren per kolom --------------------------------------------------------------------------------

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
    router.get('/ranglijst/:seizoen/:versie/:datum', async function (ctx) {
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
        and u.anderTeam = 'int'
    order by u.datum, u.bordNummer;
     */
    router.get('/uitslagen/:seizoen/:versie/:knsbNummer', async function (ctx) {
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
            .andWhere('uitslag.anderTeam', INTERNE_COMPETITIE)
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
    router.get('/agenda/:seizoen/:knsbNummer', async function (ctx) { // TODO met uuid
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
            .whereIn('ronde.teamCode', [INTERNE_COMPETITIE, ref('s.knsbTeam'), ref('s.nhsbTeam')])
            .andWhere('ronde.seizoen', ctx.params.seizoen)
            .orderBy('ronde.datum');
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

    router.get('/ronden/:seizoen/:teamCode', async function (ctx) {
        ctx.body = await Ronde.query()
            .where('ronde.seizoen', ctx.params.seizoen)
            .andWhere('ronde.teamCode', ctx.params.teamCode)
            .orderBy('ronde.rondeNummer');
    });

    router.get('/wedstrijden/:seizoen', async function (ctx) {
        ctx.body = await Ronde.query()
            .where('ronde.seizoen', ctx.params.seizoen)
            .andWhere('ronde.teamCode','<>', INTERNE_COMPETITIE)
            .orderBy('ronde.datum', 'ronde.teamCode');
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

    router.get('/:uuidToken/agenda/:seizoen/:teamCode/:rondeNummer/:knsbNummer/:partij/:datum/:anderTeam', async function (ctx) {
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
                    anderTeam: ctx.params.anderTeam});
            aantal = 1;
            await mutatie(gebruiker, ctx, aantal, GEEN_INVLOED);
        }
        ctx.body = aantal;
    });

    router.get('/:uuidToken/partij/:seizoen/:teamCode/:rondeNummer/:knsbNummer/:partij', async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuidToken);
        let aantal = 0;
        if (gebruiker.juisteRechten(WEDSTRIJDLEIDER) || gebruiker.eigenData(GEREGISTREERD, ctx.params.knsbNummer)) {
            aantal = await Uitslag.query()
                .where('uitslag.seizoen', ctx.params.seizoen)
                .andWhere('uitslag.teamCode', ctx.params.teamCode)
                .andWhere('uitslag.rondeNummer', ctx.params.rondeNummer)
                .andWhere('uitslag.knsbNummer', ctx.params.knsbNummer)
                .patch({partij: ctx.params.partij});
            await mutatie(gebruiker, ctx, aantal, OPNIEUW_INDELEN);
        }
        ctx.body = aantal;
    });

    router.get('/:uuidToken/indelen/:seizoen/:teamCode/:rondeNummer/:bordNummer/:knsbNummer/:tegenstanderNummer', async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuidToken);
        let aantal = 0;
        if (gebruiker.juisteRechten(WEDSTRIJDLEIDER)) {
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
        if (gebruiker.juisteRechten(WEDSTRIJDLEIDER)) {
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
        if (gebruiker.juisteRechten(WEDSTRIJDLEIDER)) {
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

    router.get('/:uuidToken/verwijder/ronde/:seizoen/:teamCode/:rondeNummer', async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuidToken);
        let aantal = 0;
        if (gebruiker.juisteRechten(WEDSTRIJDLEIDER)) {
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
        if (gebruiker.juisteRechten(WEDSTRIJDLEIDER) ||
            gebruiker.eigenData(GEREGISTREERD, ctx.params.knsbNummer) ||
            gebruiker.eigenData(GEREGISTREERD, ctx.params.tegenstanderNummer)) {
            if (await Uitslag.query()
                .where('uitslag.seizoen', ctx.params.seizoen)
                .andWhere('uitslag.teamCode', ctx.params.teamCode)
                .andWhere('uitslag.rondeNummer', ctx.params.rondeNummer)
                .andWhere('uitslag.knsbNummer', ctx.params.knsbNummer)
                .patch({resultaat: ctx.params.resultaat})) {
                aantal++;
                if (Number(ctx.params.tegenstanderNummer) > 0) {
                    if (await Uitslag.query()
                        .where('uitslag.seizoen', ctx.params.seizoen)
                        .andWhere('uitslag.teamCode', ctx.params.teamCode)
                        .andWhere('uitslag.rondeNummer', ctx.params.rondeNummer)
                        .andWhere('uitslag.knsbNummer', ctx.params.tegenstanderNummer)
                        .patch({resultaat: resultaatTegenstander(ctx.params.resultaat)})) {
                        aantal++;
                    }
                }
            }
            await mutatie(gebruiker, ctx, aantal, NIEUWE_RANGLIJST);
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

// TODO const.js

// teamCode
const INTERNE_COMPETITIE = "int";
// uitslag.partij
const AFWEZIG              = "a";
const EXTERNE_PARTIJ       = "e";
const INTERNE_PARTIJ       = "i";
const MEEDOEN              = "m"; // na aanmelden
const NIET_MEEDOEN         = "n"; // na afzeggen
const ONEVEN               = "o";
const REGLEMENTAIRE_REMISE = "r"; // vrijgesteld
const REGLEMENTAIR_VERLIES = "v";
const REGLEMENTAIRE_WINST  = "w";
// uitslag.witZwart
const WIT = "w";
const ZWART = "z";
// uitslag.resultaat
const REMISE = "½";
const WINST = "1";
const VERLIES = "0";

function resultaatTegenstander(resultaat) {
    if (resultaat === WINST) {
        return VERLIES;
    } else if (resultaat === VERLIES) {
        return WINST;
    } else {
        return resultaat; // remise of wissen
    }
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
