"use strict"

const db = require("./modules/db.cjs");

/*
TODO standaard api calls: uuid, schaakvereniging (0 = Waagtoren), laatste mutatie tijdstippen, enz.
 */

const Gebruiker = require("./models/gebruiker");
const Mutatie = require("./models/mutatie");
const Persoon = require("./models/persoon");
const Rating = require("./models/rating");
const Ronde = require("./models/ronde");
const Speler = require("./models/speler");
const Team = require("./models/team");
const Uitslag = require("./models/uitslag");

const { fn, ref } = require("objection");

const package_json = require("./package.json");
const tijdstip = new Date();

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
            url: ctx.request.url.substring(38).replace("%C2%BD", db.REMISE), // zonder uuid en TODO "%20" vervangen door spatie?
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

/**
 * de url van een endpoint bestaat uit een of meer commando's en parameters
 * de vaste parameters van een endpoint staan in een vaste volgorde
 *
 *  :uuid
 *      uuidToken van een gebruiker
 *      deze ontbreekt indien de informatie openbaar is en de gebruiker niets muteert
 *  :club
 *      clubCode van de vereniging
 *  :seizoen
 *      van de interne competities en (externe) teams per vereniging
 *  :team of :competitie
 *      teamCode van competitie of (extern) team
 *  :ronde
 *      rondeNummer van ronde van competitie of (extern) team
 *  :speler
 *      knsbNummer van deelnemer
 *
 *  na de vaste parameters volgt het commando van het endpoint
 *  en daarna eventueel andere parameters
 *      /:uuid/:club/:seizoen/:competitie/:ronde/:speler:/uitslag/:tegenstander/:resultaat
 *      enz.
 *
 *  indien vaste parameters ontbreken staat het commando op die plek
 *  maar niet waar :uuid ontbreekt
 *      /:club/seizoenen/:team
 *      enz.
 */
module.exports = function (url) {

    console.log("--- endpoints ---"); // TODO haal tekst uit db.apiLijst en definieer function hier

    // geef values zonder keys van 1 kolom -----------------------------------------------------------------------------

    /*
    Frontend: zyq.js
     */
    url.get("/api", async function (ctx) {
        ctx.body = JSON.stringify(db.apiLijst); // zie app.js
    });

    /*
    Frontend: beheer.js
     */
    url.get("/versie", async function (ctx) {
        ctx.body = JSON.stringify({versie: package_json.version, tijdstip: tijdstip});
    });

    /*
    Frontend: beheer.js
     */
    url.get("/geheugen", async function (ctx) {
        ctx.body = JSON.stringify([os.freemem(), os.totalmem()]);
    });

    /*
    Frontend: zyq.js
     */
    url.get("/gewijzigd", async function (ctx) {
        ctx.body = laatsteMutaties;
    });

    /*
    Frontend: start.js
     */
    url.get("/:club/seizoenen/:team", async function (ctx) {
        const seizoenen = await Team.query()
            .select("team.seizoen")
            .where("team.clubCode", ctx.params.club)
            .where("team.teamCode", ctx.params.team);
        ctx.body = seizoenen.map(function(team) {return team.seizoen});
    });

    /*
     Heeft deze ronde al een indeling en nog geen uitslagen?

     Frontend: zyq.js
     */
    url.get("/:club/:seizoen/:competitie/:ronde/indeling", async function (ctx) {
        const uitslagen = await Uitslag.query()
            .where("uitslag.clubCode", ctx.params.club)
            .where("uitslag.seizoen", ctx.params.seizoen)
            .where("uitslag.teamCode", ctx.params.competitie)
            .where("uitslag.rondeNummer", ctx.params.ronde)
            .where("uitslag.partij", db.INTERNE_PARTIJ)
            .whereNotIn("uitslag.resultaat", [db.WINST, db.VERLIES, db.REMISE])
            .limit(1);
        ctx.body = uitslagen.length; // 1 = indeling zonder uitslagen, 0 = geen indeling
    });

    /*
    Frontend: indelen.js
     */
    url.get("/:uuid/:club/:seizoen/:competitie/:ronde/deelnemers", async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuid);
        let deelnemers = {};
        if (gebruiker.juisteRechten(db.GEREGISTREERD)) { // voorlopige indeling uitsluitend voor geregistreerde gebruikers
            deelnemers = await Uitslag.query()
                .select("uitslag.knsbNummer")
                .where("uitslag.clubCode", ctx.params.club)
                .where("uitslag.seizoen", ctx.params.seizoen)
                .where("uitslag.teamCode", ctx.params.competitie)
                .where("uitslag.rondeNummer", ctx.params.ronde)
                .where("uitslag.partij", db.MEEDOEN);
        }
        if (deelnemers.length === 0) { // voor opnieuw indelen reeds gespeelde ronde
            deelnemers = await Uitslag.query()
                .select("uitslag.knsbNummer")
                .whereIn("uitslag.partij", [db.INTERNE_PARTIJ, db.ONEVEN, db.REGLEMENTAIRE_WINST])
                .where("uitslag.clubCode", ctx.params.club)
                .where("uitslag.seizoen", ctx.params.seizoen)
                .where("uitslag.teamCode", ctx.params.competitie)
                .where("uitslag.rondeNummer", ctx.params.ronde);
        }
        ctx.body = deelnemers.map(function(uitslag) {return uitslag.knsbNummer});
    });

    // geef key - value paren per kolom ----------------------------------------------------------------------

    /*
    spelers die externe competitie spelen tijdens interne competitie

    Frontend: indelen.js
     */
    url.get("/:uuid/:club/:seizoen/uithuis/:datum", async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuid);
        let uithuis = {};
        if (gebruiker.juisteRechten(db.GEREGISTREERD)) {
            uithuis = await Uitslag.query()
                .select("naam", "uitslag.knsbNummer", "uitslag.partij")
                .join("persoon", "persoon.knsbNummer", "uitslag.knsbNummer")
                .whereIn("uitslag.partij", [db.EXTERN_THUIS, db.EXTERN_UIT])
                .where("uitslag.clubCode", ctx.params.club)
                .where("uitslag.seizoen", ctx.params.seizoen)
                .whereNot("uitslag.teamCode", ref("uitslag.anderTeam"))
                .where("uitslag.datum",ctx.params.datum)
                .orderBy(["uitslag.partij", "naam"]);
        }
        ctx.body = uithuis;
    });

    /*
    -- alle personen met spelers per seizoen
    with s as
    (select * from speler where clubCode = @club and seizoen = @seizoen)
    select p.*, s.*, gebruiker.mutatieRechten, gebruiker.datumEmail
    from persoon p
    left join s on s.knsbNummer = p.knsbNummer
    left join gebruiker g on g.knsbNummer = p.knsbNummer
    order by naam;

    Frontend: bestuur.js
     */
    url.get("/:club/:seizoen/personen", async function (ctx) {
        ctx.body = await Persoon.query()
            .with("s", function (qb) {
                qb.from("speler")
                    .where("speler.clubCode", ctx.params.club)
                    .where("speler.seizoen", ctx.params.seizoen)
            })
            .select("persoon.naam",
                "persoon.knsbNummer",
                "s.nhsbTeam",
                "s.knsbTeam",
                "s.knsbRating",
                "s.datum",
                "s.interneRating",
                "s.intern1",
                "s.intern2",
                "s.intern3",
                "s.intern4",
                "s.intern5",
                "gebruiker.mutatieRechten",
                "gebruiker.datumEmail")
            .leftJoin("s", "persoon.knsbNummer", "s.knsbNummer")
            .leftJoin("gebruiker", "persoon.knsbNummer", "gebruiker.knsbNummer")
            .orderBy("naam");
    });

    /*
    with s as
    (select * from speler clubCode = @club and seizoen = @seizoen and knsbNummer = @knsbNummer)
    select p.*, s.*, g.mutatieRechten, g.datumEmail
    from persoon p
    left join s on s.knsbNummer = p.knsbNummer
    left join gebruiker g on g.knsbNummer = p.knsbNummer
    where p.knsbNummer = @knsbNummer;

    Frontend: lid.js en agenda.js
     */
    url.get("/:club/:seizoen/persoon/:knsbNummer", async function (ctx) {
        const persoon = await Persoon.query()
            .with("s", function (qb) {
                qb.from("speler")
                    .where("speler.clubCode", ctx.params.club)
                    .where("speler.seizoen", ctx.params.seizoen)
                    .where("speler.knsbNummer", ctx.params.knsbNummer)
            })
            .select("persoon.naam",
                "persoon.knsbNummer",
                "s.nhsbTeam",
                "s.knsbTeam",
                "s.knsbRating",
                "s.datum",
                "s.interneRating",
                "s.intern1",
                "s.intern2",
                "s.intern3",
                "s.intern4",
                "s.intern5",
                "gebruiker.mutatieRechten",
                "gebruiker.datumEmail")
            .leftJoin("s", "persoon.knsbNummer", "s.knsbNummer")
            .leftJoin("gebruiker", "persoon.knsbNummer", "gebruiker.knsbNummer")
            .where("persoon.knsbNummer", ctx.params.knsbNummer);
        ctx.body = persoon.length > 0 ? persoon[0] : {naam: "onbekend", knsbNummer: 0};
    });

    /*
    Frontend: bestuur.js
              lid.js
              o_o_o.js
              start.js
              team.js
     */
    url.get("/:club/:seizoen/teams", async function (ctx) {
        ctx.body = await Team.query()
            .select("team.*", "persoon.naam")
            .join("persoon", "team.teamleider", "persoon.knsbNummer")
            .where("team.clubCode", ctx.params.club)
            .where("team.seizoen", ctx.params.seizoen);
    });

    /*
    -- interne ronden per seizoen van verschillende competities
    select teamCode, rondeNummer, datum from ronde where clubCode = @club and seizoen = @seizoen and substring(teamCode, 1, 1) = "i" order by datum, rondeNummer;

    Frontend: start.js
     */
    url.get("/:club/:seizoen/ronden/intern", async function (ctx) {
        ctx.body = await Ronde.query()
            .select("teamCode", "rondeNummer", "datum")
            .where("clubCode", ctx.params.club)
            .where("seizoen", ctx.params.seizoen)
            .where(fn("substring", ref("teamCode"), 1, 1), "i")
            .orderBy(["datum", "rondeNummer"]);
    });

    /*
    -- ronden per seizoen en competitie met aantal uitslagen TODO wordt aantalResultaten ergens gebruikt?
    with u as
      (select seizoen, teamCode, rondeNummer, count(resultaat) aantalResultaten
      from uitslag where clubCode = @club and seizoen = @seizoen and teamCode = @team and resultaat in ("1", "0", "½") group by rondeNummer)
    select r.*, ifnull(aantalResultaten, 0) resultaten from ronde r
    left join u on r.clubCode = u.clubCode and r.seizoen = u.seizoen and r.teamCode = u.teamCode and r.rondeNummer = u.rondeNummer
    where r.seizoen = @seizoen and r.teamCode = @team
    order by r.rondeNummer;

    Frontend: zyq.js
     */
    url.get("/:club/:seizoen/:competitie/ronden", async function (ctx) {
        ctx.body = await Ronde.query()
            .with("u",function (qb) {
                qb.from("uitslag")
                    .select("uitslag.clubCode",
                        "uitslag.seizoen",
                        "uitslag.teamCode",
                        "uitslag.rondeNummer",
                        {aantalResultaten: fn("count", "uitslag.resultaat")})
                    .whereIn("uitslag.resultaat", [db.WINST, db.VERLIES, db.REMISE])
                    .where("uitslag.clubCode", ctx.params.club)
                    .where("uitslag.seizoen", ctx.params.seizoen)
                    .where("uitslag.teamCode", ctx.params.competitie)
                    .groupBy("uitslag.rondeNummer")
            })
            .select("ronde.*",
                {resultaten: fn("ifnull", ref("aantalResultaten"), -1)}) // TODO zie /indeling
            .leftJoin("u", function(join) {
                join.on("u.clubCode", "ronde.clubCode")
                    .on("u.seizoen", "ronde.seizoen")
                    .on("u.teamCode", "ronde.teamCode")
                    .on("u.rondeNummer", "ronde.rondeNummer")})
            .where("ronde.seizoen", ctx.params.seizoen)
            .where("ronde.teamCode", ctx.params.competitie)
            .orderBy("ronde.rondeNummer");
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
    where clubCode = @club and seizoen = @seizoen
    order by totalen desc;

    Frontend: o_o_o.js
     */
    url.get("/:club/:seizoen/:competitie/:ronde/ranglijst/:datum/:versie", async function (ctx) {
        ctx.body = await Speler.query()
            .select("speler.knsbNummer",
                "persoon.naam",
                {subgroep: fn("subgroep", // TODO met :club
                        ctx.params.seizoen,
                        ctx.params.versie,
                        ref("speler.knsbNummer"))},
                {totalen: fn("totalen", // TODO met :club
                        ctx.params.seizoen,
                        ctx.params.competitie,
                        ctx.params.ronde,
                        ctx.params.datum,
                        ctx.params.versie,
                        ref("speler.knsbNummer"))})
            .join("persoon", "persoon.knsbNummer", "speler.knsbNummer")
            .where("clubCode",ctx.params.club)
            .where("seizoen", ctx.params.seizoen)
            .orderBy("totalen", "desc");
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
    join ronde r on u.clubCode = r.clubCode and u.seizoen = r.seizoen and u.teamCode = r.teamCode and u.rondeNummer = r.rondeNummer
    where u.seizoen = @seizoen
        and u.knsbNummer = @knsbNummer
        and u.anderTeam = @competitie
    order by u.datum, u.bordNummer;

    Frontend: speler.js
     */
    url.get("/:club/:seizoen/:competitie/uitslagen/:knsbNummer/:versie", async function (ctx) {
        ctx.body = await Uitslag.query()
            .select("uitslag.datum",
                "uitslag.rondeNummer",
                "uitslag.bordNummer",
                "uitslag.witZwart",
                "uitslag.tegenstanderNummer",
                "persoon.naam",
                "uitslag.resultaat",
                "uitslag.teamCode",
                "uitslag.partij",
                "ronde.uithuis",
                "ronde.tegenstander",
                {punten: fn("punten", // TODO met :club
                        ctx.params.seizoen,
                        ref("uitslag.teamCode"),
                        ctx.params.versie,
                        ctx.params.knsbNummer,
                        fn("waardeCijfer", ctx.params.versie, fn("rating", ctx.params.seizoen, ctx.params.knsbNummer)),
                        ref("uitslag.partij"),
                        ref("uitslag.tegenstanderNummer"),
                        ref("uitslag.resultaat"))})
            .join("persoon", "persoon.knsbNummer", "uitslag.tegenstanderNummer")
            .join("ronde", function(join) {
                join.on("uitslag.clubCode", "ronde.clubCode")
                    .on("uitslag.seizoen", "ronde.seizoen")
                    .on("uitslag.teamCode", "ronde.teamCode")
                    .on("uitslag.rondeNummer","ronde.rondeNummer")})
            .where("uitslag.clubCode", ctx.params.club)
            .where("uitslag.seizoen", ctx.params.seizoen)
            .where("uitslag.knsbNummer", ctx.params.knsbNummer)
            .where("uitslag.anderTeam", ctx.params.competitie) // TODO anderTeam = competitie
            .orderBy(["uitslag.datum","uitslag.rondeNummer"]);
    });

    /*
    -- kalender voor alle interne en externe ronden per speler
    with
      s as (select * from speler where clubCode = @club and seizoen = @seizoen and knsbNummer = @knsbNummer),
      u as (select * from uitslag where clubCode = @club and seizoen = @seizoen and knsbNummer = @knsbNummer)
    select r.*, u.partij, u.anderTeam
      from ronde r
      join s on r.clubCode = s.clubCode and r.seizoen = s.seizoen
    left join u on u.clubCode = r.clubCode and r.seizoen = u.seizoen and r.teamCode = u.teamCode and r.rondeNummer = u.rondeNummer
    where r.clubCode = @club and r.seizoen = @seizoen and r.teamCode in (s.knsbTeam, s.nhsbTeam, s.intern1, s.intern2, s.intern3, s.intern4, s.intern5, u.teamCode))
    order by r.datum, r.teamCode, r.rondeNummer;

    Frontend: agenda.js
     */
    url.get("/:uuid/:club/:seizoen/kalender/:knsbNummer", async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuid);
        if (gebruiker.juisteRechten(db.WEDSTRIJDLEIDER) || // kalender van andere gebruiker
            gebruiker.eigenData(db.GEREGISTREERD, ctx.params.knsbNummer)) { // alleen eigen kalender
         ctx.body = await Ronde.query()
             .with("s", function (qb) {
                 qb.from("speler")
                     .where("speler.clubCode", ctx.params.club)
                     .where("speler.seizoen", ctx.params.seizoen)
                     .where("speler.knsbNummer", ctx.params.knsbNummer)
             })
             .with("u",function (qb) {
                 qb.from("uitslag")
                     .where("uitslag.clubCode", ctx.params.club)
                     .where("uitslag.seizoen", ctx.params.seizoen)
                     .where("uitslag.knsbNummer", ctx.params.knsbNummer)
             })
             .select("ronde.*", "u.partij", "u.anderTeam")
             .join("s", function(join) {
                 join.on("s.clubCode", "ronde.clubCode")
                     .on("s.seizoen", "ronde.seizoen")
             })
             .leftJoin("u", function(join) {
                 join.on("u.clubCode", "ronde.clubCode")
                     .on("u.seizoen", "ronde.seizoen")
                     .on("u.teamCode", "ronde.teamCode")
                     .on("u.rondeNummer", "ronde.rondeNummer")
             })
             .where("ronde.clubCode", ctx.params.club)
             .where("ronde.seizoen", ctx.params.seizoen)
             .whereIn("ronde.teamCode", [ // externe teams en interne competities van speler
                 ref("s.knsbTeam"),
                 ref("s.nhsbTeam"),
                 ref("s.intern1"),
                 ref("s.intern2"),
                 ref("s.intern3"),
                 ref("s.intern4"),
                 ref("s.intern5"),
                 ref("u.teamCode")]) // indien speler invaller is
             .orderBy(["ronde.datum", "ronde.teamCode", "ronde.rondeNummer"]);
        } else {
            ctx.body = [];
        }
    });

    /*
    Frontend: teamleider.js
     */
    url.get("/:club/:seizoen/teamleider", async function (ctx) {
        ctx.body = await Speler.query()
            .select("speler.*", "persoon.naam")
            .join("persoon", "speler.knsbNummer", "persoon.knsbNummer")
            .where("speler.clubCode", ctx.params.club)
            .where("speler.seizoen", ctx.params.seizoen)
            .orderBy("speler.knsbRating", "desc");
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
    where clubCode = @club and seizoen = @seizoen and teamCode = @teamCode and rondeNummer = @ronde and witZwart = "w"
    order by uitslag.seizoen, bordNummer;

    Frontend: ronde.js
     */
    url.get("/:club/:seizoen/:team/:ronde/ronde", async function (ctx) {
        ctx.body = await Uitslag.query()
            .select("uitslag.bordNummer",
                "uitslag.knsbNummer",
                {wit: ref("wit.naam")},
                "uitslag.tegenstanderNummer",
                {zwart: ref("zwart.naam")},
                "resultaat")
            .join("persoon as wit", "uitslag.knsbNummer", "wit.knsbNummer")
            .join("persoon as zwart", "uitslag.tegenstanderNummer", "zwart.knsbNummer")
            .where("uitslag.clubCode", ctx.params.club)
            .where("uitslag.seizoen", ctx.params.seizoen)
            .where("uitslag.teamCode", ctx.params.team)
            .where("uitslag.rondeNummer", ctx.params.ronde)
            .where("uitslag.witZwart", db.WIT)
            .orderBy("uitslag.bordNummer");
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
    where uitslag.clubCode = @club and uitslag.seizoen = @seizoen and uitslag.teamCode = @team
    order by uitslag.seizoen, uitslag.rondeNummer, uitslag.bordNummer;

    Frontend: 0-0-0.js
     */
    url.get("/:club/:seizoen/:team/team", async function (ctx) {
        ctx.body = await Uitslag.query()
            .select("uitslag.rondeNummer",
                "uitslag.bordNummer",
                "uitslag.witZwart",
                "uitslag.resultaat",
                "uitslag.partij",
                "uitslag.knsbNummer",
                "persoon.naam")
            .join("persoon", "uitslag.knsbNummer", "persoon.knsbNummer")
            .where("uitslag.clubCode", ctx.params.club)
            .where("uitslag.seizoen", ctx.params.seizoen)
            .where("uitslag.teamCode", ctx.params.team)
            .orderBy(["uitslag.seizoen","uitslag.rondeNummer","uitslag.bordNummer"]);
    });

    /*
    -- alle externe wedstrijden van het seizoen
    select r.*, bond, poule, omschrijving, borden, naam from ronde r
    join team t on r.seizoen = t.seizoen and r.teamCode = t.team
    join persoon on teamleider = knsbNummer
    where r.seizoen = @seizoen and r.teamCode not in ("int", "ipv")
    order by r.datum, r.teamCode;

    Frontend: ronde.js
     */
    url.get("/:club/:seizoen/wedstrijden", async function (ctx) {
        ctx.body = await Ronde.query()
            .select("ronde.*",
                "team.bond",
                "team.poule",
                "team.omschrijving",
                "team.borden",
                "persoon.naam")
            .join("team", function(join) {
                join.on("team.clubCode", "ronde.clubCode")
                    .on("team.seizoen", "ronde.seizoen")
                    .on("team.teamCode", "ronde.teamCode")})
            .join("persoon", "team.teamleider", "persoon.knsbNummer")
            .where("ronde.clubCode", ctx.params.club)
            .where("ronde.seizoen", ctx.params.seizoen)
            .whereNotIn("ronde.teamCode",[db.INTERNE_COMPETITIE, db.RAPID_COMPETITIE, db.JEUGD_COMPETITIE])
            .orderBy(["ronde.datum", "ronde.teamCode"]);
    });

    /*
    Frontend: bestuur.js
     */
    url.get("/rating/lijsten", async function (ctx) {
        const lijsten = [];
        for (let i = 0; i < 12; i++) {
            const lijst = await Rating.query()
                .select("rating.maand", "rating.jaar")
                .where("rating.maand", i)
                .limit(1);
            if (lijst.length) {
                lijsten.push(lijst[0]);
            }
        }
        ctx.body = lijsten;
    });

    /*
    Frontend: lid.js
     */
    url.get("/rating/:maand/:knsbNummer", async function (ctx) {
        const rating = await Rating.query()
            .select("knsbNummer", "knsbNaam", "knsbRating", "maand", "jaar")
            .where("maand", ctx.params.maand)
            .where("knsbNummer", ctx.params.knsbNummer);
        ctx.body = rating.length > 0
            ? rating[0]
            : {knsbNummer: ctx.params.knsbNummer, knsbNaam: "onbekend", maand: 0, jaar: 0};
    });

    /*
    Frontend: speler.js
     */
    url.get("/rating/:knsbNummer", async function (ctx) {
        ctx.body = await Rating.query()
            .select("knsbNummer", "knsbNaam", "knsbRating", "maand", "jaar")
            .where("knsbNummer", ctx.params.knsbNummer)
            .orderBy([{column: "jaar", order: "desc"}, {column: "maand", order: "desc"}]);
    });

    /*
    Frontend: aanmelden.js
     */
    url.get("/naam/:maand/:zoek/:aantal", async function (ctx) {
        ctx.body = await Rating.query()
            .select("knsbNummer", "knsbNaam", "knsbRating", "geboorteJaar", "sekse", "maand", "jaar")
            .where("maand", ctx.params.maand)
            .where("knsbNaam", "regexp", ctx.params.zoek)
            .limit(Number(ctx.params.aantal));
    });

    /*
    -- zoek in naam
    select p.*, g.*
    from persoon p left join gebruiker g on g.knsbNummer = p.knsbNUmmer
    where p.naam regexp "jan";

    Frontend: aanmelden.js
     */
    url.get("/naam/gebruiker/:zoek", async function (ctx) {
        ctx.body = await Persoon.query()
            .select("persoon.knsbNummer", "naam", "gebruiker.mutatieRechten")
            .leftJoin("gebruiker", function(join) {
                join.on("gebruiker.knsbNummer", "persoon.knsbNummer")})
            .where("naam", "regexp", ctx.params.zoek);
    });

    /*
    Frontend: beheer.js
     */
    url.get("/backup/personen", async function (ctx) {
        ctx.body = await Persoon.query()
            .orderBy(["naam", "knsbNummer"]);
    });

    /*
    Frontend: beheer.js
     */
    url.get("/:club/:seizoen/backup/teams", async function (ctx) {
        ctx.body = await Team.query()
            .where("team.clubCode", ctx.params.club)
            .where("team.seizoen", ctx.params.seizoen)
            .orderBy("teamCode");
    });

    /*
    Frontend: beheer.js
     */
    url.get("/:club/:seizoen/backup/ronde", async function (ctx) { // TODO /ronden werkt niet!
        ctx.body = await Ronde.query()
            .where("clubCode", ctx.params.club)
            .where("seizoen", ctx.params.seizoen)
            .orderBy(["teamCode", "rondeNummer"]);
    });

    /*
    Frontend: beheer.js
     */
    url.get("/:club/:seizoen/:team/spelers", async function (ctx) {
        ctx.body = await Speler.query()
            .where("clubCode", ctx.params.club)
            .where("seizoen", ctx.params.seizoen)
            .where("teamCode", ctx.params.team)
            .orderBy("knsbNummer");
    });

    /*
    Frontend: ronde.js
     */
    url.get("/:club/:seizoen/:team/:ronde/backup/uitslagen/:tot", async function (ctx) {
        ctx.body = await Uitslag.query()
            .where("clubCode", ctx.params.club)
            .where("seizoen", ctx.params.seizoen)
            .where("teamCode", ctx.params.team)
            .whereBetween("rondeNummer", [ctx.params.ronde, ctx.params.tot])
            .orderBy(["rondeNummer", "bordNummer", "partij", "witZwart", "knsbNummer"]);
    });

    /*
    Frontend: speler.js
     */
    url.get("/:club/:seizoen/backup/speler/:knsbNummer", async function (ctx) {
        ctx.body = await Uitslag.query()
            .where("clubCode", ctx.params.club)
            .where("uitslag.seizoen", ctx.params.seizoen)
            .where("uitslag.knsbNummer", ctx.params.knsbNummer)
            .orderBy(["datum","rondeNummer"]);
    });

    /*
    Frontend: beheer.js
     */
    url.get("/:uuid/backup/gebruikers", async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuid);
        if (gebruiker.juisteRechten(db.BEHEERDER)) {
            ctx.body = await Gebruiker.query().orderBy("knsbNummer");
        } else {
            ctx.body = {};
        }
    });

    /*
    Frontend: beheer.js
     */
    url.get("/:uuid/gebruikers", async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuid);
        if (gebruiker.juisteRechten(db.BEHEERDER)) {
            ctx.body = await Gebruiker.query()
                .select("gebruiker.knsbNummer", "naam", "email", "mutatieRechten", "datumEmail")
                .join("persoon", "gebruiker.knsbNummer", "persoon.knsbNummer")
                .orderBy("naam");
        } else {
            ctx.body = await Gebruiker.query()
                .select("gebruiker.knsbNummer", "naam", "email", "mutatieRechten", "datumEmail")
                .join("persoon", "gebruiker.knsbNummer", "persoon.knsbNummer")
                .where("mutatieRechten", ">=", db.BEHEERDER);
        }
    });

    /*
    Frontend: beheer.js
     */
    url.get("/:uuid/mutaties/:van/:tot/:aantal", async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuid);
        if (gebruiker.juisteRechten(db.BEHEERDER)) {
            ctx.body = await Mutatie.query()
                .select("naam", "mutatie.*")
                .join("persoon", "mutatie.knsbNummer", "persoon.knsbNummer")
                .whereBetween("invloed", [ctx.params.van, ctx.params.tot])
                .orderBy("tijdstip", "desc")
                .limit(ctx.params.aantal);
        } else {
            ctx.body = await Mutatie.query()
                .select("naam", "mutatie.*")
                .join("persoon", "mutatie.knsbNummer", "persoon.knsbNummer")
                .whereBetween("invloed", [ctx.params.van, ctx.params.tot])
                .where("mutatie.knsbNummer", gebruiker.dader.knsbNummer)
                .orderBy("tijdstip", "desc")
                .limit(ctx.params.aantal);
        }
    });

    /*
    email aan gebruiker om registratie te activeren

    Frontend: email.js
     */
    url.get("/:uuid/email/:knsbNummer", async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuid);
        if (gebruiker.juisteRechten(db.BEHEERDER)) {
            ctx.body = await Gebruiker.query()
                .select("naam", "email", "uuidToken")
                .join("persoon", "gebruiker.knsbNummer", "persoon.knsbNummer")
                .where("gebruiker.knsbNummer", ctx.params.knsbNummer);
        } else {
            ctx.body = {};
        }
    });

    /*
    knsbNummer, naam en mutatieRechten van gebruiker opzoeken

    Frontend: zyq.js
     */
    url.get("/:uuid/gebruiker", async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuid);
        ctx.body = gebruiker.dader;
    });

    // geef aantal mutaties --------------------------------------------------------------------------------------------

    /*
    registratie voor gebruiker activeren

    Database: gebruiker update

    Frontend: zyq.js
     */
    url.get("/activeer/:uuid", async function (ctx) {
        ctx.body = await Gebruiker.query().findById(ctx.params.uuid)
            .patch({datumEmail: fn("curdate")});
    });

    /*
    Database: gebruiker insert
              mutatie insert

    Frontend: lid.js
     */
    url.get("/:uuid/gebruiker/toevoegen/:knsbNummer/:email", async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuid);
        let aantal = 0;
        if (gebruiker.juisteRechten(db.BESTUUR)) {
            if (await Gebruiker.query().insert( {
                knsbNummer: ctx.params.knsbNummer,
                mutatieRechten: db.GEREGISTREERD,
                uuidToken: fn("uuid"),
                email: ctx.params.email} )) {
                aantal = 1;
                await mutatie(gebruiker, ctx, aantal, db.GEEN_INVLOED);
            }
        }
        ctx.body = aantal;
    });

    /*
    Database: gebruiker update
              mutatie insert

    Frontend: lid.js
     */
    url.get("/:uuid/gebruiker/email/:knsbNummer/:email", async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuid);
        let aantal = 0;
        if (gebruiker.juisteRechten(db.BEHEERDER) || gebruiker.eigenData(db.GEREGISTREERD, ctx.params.knsbNummer)) {
            if (await Gebruiker.query().findById(ctx.params.uuid).patch(
                {email: ctx.params.email})) {
                aantal = 1;
            }
            await mutatie(gebruiker, ctx, aantal, db.GEEN_INVLOED);
        }
        ctx.body = aantal;
    });

    /*
    Database: persoon insert
              mutatie insert

    Frontend: aanmelden.js
              bestuur.js
     */
    url.get("/:uuid/persoon/toevoegen/:knsbNummer/:naam", async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuid);
        let knsbNummer = Number(ctx.params.knsbNummer);
        let aantal = 0;
        if (gebruiker.juisteRechten(db.BESTUUR)) {
            if (!knsbNummer) {
                const nummers = await Persoon.query()
                    .select("knsbNummer")
                    .where("knsbNummer", "<", db.KNSB_NUMMER) // hoogste tijdelijke knsbNummer
                    .orderBy("knsbNummer", "desc")
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
    Database: persoon update
              mutatie insert

    Frontend: lid.js
     */
    url.get("/:uuid/persoon/wijzigen/:lidNummer/:knsbNummer/:naam", async function (ctx) {
        ctx.body = await Persoon.query()
        const gebruiker = await gebruikerRechten(ctx.params.uuid);
        let aantal = 0;
        if (gebruiker.juisteRechten(db.BEHEERDER)) {
            if (await Persoon.query().findById(ctx.params.lidNummer).patch(
                {knsbNummer: ctx.params.knsbNummer, naam: ctx.params.naam})) {
                aantal = 1;
                await mutatie(gebruiker, ctx, aantal, db.GEEN_INVLOED);
            }
        }
        ctx.body = aantal;
    });

    /*
    Database: rating delete

    Frontend: bestuur.js
     */
    url.get("/:uuid/rating/verwijderen/:maand", async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuid);
        let aantal = 0;
        if (gebruiker.juisteRechten(db.BESTUUR)) {
            aantal = await Rating.query().delete().where("rating.maand", ctx.params.maand);
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

    Database: rating insert

    Frontend: bestuur.js
     */
    url.get("/:uuid/rating/toevoegen/:maand/:jaar/:csv", async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuid);
        let aantal = 0;
        if (gebruiker.juisteRechten(db.BESTUUR)) {
            const csv = ctx.params.csv.split(";");
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
    Database: speler insert
              mutatie insert

    Frontend: lid.js
     */
    url.get("/:uuid/:club/:seizoen/:competitie/speler/toevoegen/:knsbNummer/:knsbRating/:interneRating/:nhsb/:knsb/:competities/:datum", async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuid);
        let aantal = 0;
        if (gebruiker.juisteRechten(db.BESTUUR) || gebruiker.eigenData(db.GEREGISTREERD, ctx.params.knsbNummer)) {
            const intern = teamCodes(ctx.params.competities);
            if (await Speler.query().insert({
                clubCode: ctx.params.club,
                seizoen: ctx.params.seizoen,
                teamCode: ctx.params.competitie,
                knsbNummer: ctx.params.knsbNummer,
                knsbRating: ctx.params.knsbRating,
                rol: 0,
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
    Database: speler update
              mutatie insert

    Frontend: lid.js
     */
    url.get("/:uuid/:club/:seizoen/:competitie/speler/wijzigen/:knsbNummer/:knsbRating/:interneRating/:nhsb/:knsb/:competities/:datum", async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuid);
        let aantal = 0;
        if (gebruiker.juisteRechten(db.BESTUUR) || gebruiker.eigenData(db.GEREGISTREERD, ctx.params.knsbNummer)) {
            const intern = teamCodes(ctx.params.competities);
            if (await Speler.query().findById([Number(ctx.params.club), ctx.params.seizoen, ctx.params.competitie, ctx.params.knsbNummer])
                .patch({knsbRating: ctx.params.knsbRating,
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
    Database: speler update

    Frontend: bestuur.js
     */
    url.get("/:uuid/:club/:seizoen/:competitie/speler/rating/:knsbNummer/:knsbRating/:interneRating/:datum", async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuid);
        let aantal = 0;
        if (gebruiker.juisteRechten(db.BESTUUR)) {
            if (await Speler.query().findById([ctx.params.club, ctx.params.seizoen, ctx.params.competitie, ctx.params.knsbNummer])
                .patch({knsbRating: ctx.params.knsbRating,
                    interneRating: ctx.params.interneRating,
                    datum: ctx.params.datum})) {
                aantal = 1;
            }
        }
        ctx.body = aantal;
    });

    /*
    wedstrijd in agenda toevoegen

    Database: uitslag insert
              mutatie insert

    Frontend: agenda.js
              teamleider.js
     */
    url.get("/:uuid/:club/:seizoen/:team/:ronde/:speler/uitslag/toevoegen/:partij/:datum/:competitie", async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuid);
        let aantal = 0;
        if (gebruiker.juisteRechten(db.TEAMLEIDER) || // agenda van andere gebruiker TODO alleen eigen team
            gebruiker.eigenData(db.GEREGISTREERD, ctx.params.speler)) { // alleen eigen agenda
            if (await Uitslag.query().insert({
                    clubCode: ctx.params.club,
                    seizoen: ctx.params.seizoen,
                    teamCode: ctx.params.team,
                    rondeNummer: ctx.params.ronde,
                    bordNummer: 0,
                    knsbNummer: ctx.params.speler,
                    partij: ctx.params.partij, // TODO :partij overbodig indien uitsluitend PLANNING in plaats van PLANNING of AFWEZIG
                    witZwart: "",
                    tegenstanderNummer: 0,
                    resultaat: "",
                    datum: ctx.params.datum,
                    anderTeam: ctx.params.competitie,
                    competitie: ctx.params.competitie
            } )) { // TODO anderTeam = competitie
                aantal = 1;
                await mutatie(gebruiker, ctx, aantal, db.OPNIEUW_INDELEN);
            }
        }
        ctx.body = aantal;
    });

    /*
    wedstrijd in agenda wijzigen

    -- uitslagen / ronden op dezelfde datum
    select u.*, r.uithuis
      from uitslag u
      join ronde r on r.clubCode = u.clubCode and r.seizoen = u.seizoen and r.teamCode = u.teamCode and r.rondeNummer = u.rondeNummer
    where u.clubCode = @club and u.seizoen = @seizoen and u.knsbNummer = @knsbNummer and u.datum = @datum
    order by u.teamCode, u.rondeNummer;

    Database: uitslag update
              mutatie insert

    Frontend: agenda.js

     */
    url.get("/:uuid/:club/:seizoen/:team/:ronde/:speler/planning/:partij/:datum", async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuid);
        let aantal = 0;
        if (gebruiker.juisteRechten(db.TEAMLEIDER) || gebruiker.eigenData(db.GEREGISTREERD, ctx.params.knsbNummer)) {
            const ronden = await Uitslag.query()
                .select("uitslag.*", "ronde.uithuis")
                .join("ronde", function (join) {
                    join.on("uitslag.clubCode", "ronde.clubCode")
                        .on("uitslag.seizoen", "ronde.seizoen")
                        .on("uitslag.teamCode", "ronde.teamCode")
                        .on("uitslag.rondeNummer", "ronde.rondeNummer")
                })
                .where("uitslag.clubCode", ctx.params.club)
                .where("uitslag.seizoen", ctx.params.seizoen)
                .where("uitslag.knsbNummer", ctx.params.speler)
                .where("uitslag.datum", ctx.params.datum)
                .orderBy(["uitslag.teamCode", "uitslag.rondeNummer"]);
            const rondeWijzigen = ronden.findIndex(function(ronde) {
                return ronde.teamCode === ctx.params.team && ronde.rondeNummer === Number(ctx.params.ronde);
            });
            if (rondeWijzigen >= 0 && ronden[rondeWijzigen].partij === ctx.params.partij) { // partij niet gewijzigd?
                if (db.isPaar(ronden[rondeWijzigen])) {
                    aantal += await paarMuteren(ronden[rondeWijzigen]); // speler en tegenstander
                } else if (db.isMeedoen(ronden[rondeWijzigen])) {
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
    Paren door handmatig indelen

    Frontend: paren.js en indelen.js
     */
    url.get("/:uuid/:club/:seizoen/:competitie/:ronde/paren", async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuid);
        let paren = {};
        if (gebruiker.juisteRechten(db.GEREGISTREERD)) {
            paren = await Uitslag.query()
                .select("uitslag.bordNummer",
                    "uitslag.knsbNummer",
                    {wit: ref("wit.naam")},
                    "uitslag.tegenstanderNummer",
                    {zwart: ref("zwart.naam")})
                .join("persoon as wit", "uitslag.knsbNummer", "wit.knsbNummer")
                .join("persoon as zwart", "uitslag.tegenstanderNummer", "zwart.knsbNummer")
                .where("uitslag.seizoen", ctx.params.seizoen)
                .where("uitslag.teamCode", ctx.params.competitie)
                .where("uitslag.rondeNummer", ctx.params.ronde)
                .where("uitslag.witZwart", db.WIT)
                .orderBy("uitslag.bordNummer");
        }
        ctx.body = paren;
    });

    /*
    Database: uitslag update
              mutatie insert

    Frontend: paren.js
     */
    url.get("/:uuid/:club/:seizoen/:competitie/:ronde/:speler/paar/:bord/:tegenstander", async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuid);
        let aantal = 0;
        if (gebruiker.juisteRechten(db.WEDSTRIJDLEIDER)) { // handmatig indelen
            const witSpeler = await Uitslag.query()
                .select("uitslag.partij")
                .findById([ctx.params.club, ctx.params.seizoen, ctx.params.competitie, ctx.params.ronde, ctx.params.speler]);
            const zwartSpeler = await Uitslag.query()
                .select("uitslag.partij")
                .findById([ctx.params.club, ctx.params.seizoen, ctx.params.competitie, ctx.params.ronde, ctx.params.tegenstander]);
            if (db.isGeenPaar(witSpeler) && db.isGeenPaar(zwartSpeler)
                && await Uitslag.query().findById(
                    [ctx.params.club, ctx.params.seizoen, ctx.params.competitie, ctx.params.ronde, ctx.params.speler])
                .patch({bordNummer: ctx.params.bord,
                    partij: witSpeler.partij === db.MEEDOEN ? db.INGEDEELD : db.TOCH_INGEDEELD, // indien NIET_MEEDOEN of PLANNING
                    witZwart: db.WIT,
                    tegenstanderNummer: ctx.params.tegenstander,
                    resultaat: ""})) {
                aantal++;
                if (await Uitslag.query().findById(
                    [ctx.params.club, ctx.params.seizoen, ctx.params.competitie, ctx.params.ronde, ctx.params.tegenstander])
                    .patch({bordNummer: ctx.params.bord,
                        partij: zwartSpeler.partij === db.MEEDOEN ? db.INGEDEELD : db.TOCH_INGEDEELD, // indien NIET_MEEDOEN of PLANNING
                        witZwart: db.ZWART,
                        tegenstanderNummer: ctx.params.speler,
                        resultaat: ""})) {
                    aantal++;
                }
            }
            await mutatie(gebruiker, ctx, aantal, db.OPNIEUW_INDELEN);
        }
        ctx.body = aantal;
    });

    /*
    Database: uitslag update
              mutatie insert

    Frontend: paren.js
     */
    url.get("/:uuid/:club/:seizoen/:competitie/:ronde/:speler/los/:bord/:tegenstander", async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuid);
        let aantal = 0;
        if (gebruiker.juisteRechten(db.WEDSTRIJDLEIDER)) { // handmatig indelen
            const witSpeler = await Uitslag.query()
                .select("uitslag.partij")
                .findById([ctx.params.club, ctx.params.seizoen, ctx.params.competitie, ctx.params.ronde, ctx.params.speler]);
            const zwartSpeler = await Uitslag.query()
                .select("uitslag.partij")
                .findById([ctx.params.club, ctx.params.seizoen, ctx.params.competitie, ctx.params.ronde, ctx.params.tegenstander]);
            if (db.isPaar(witSpeler) && db.isPaar(zwartSpeler)
                && await Uitslag.query().findById(
                    [ctx.params.club, ctx.params.seizoen, ctx.params.competitie, ctx.params.ronde, ctx.params.speler])
                .patch({bordNummer: 0,
                    partij: witSpeler.partij === db.INGEDEELD ? db.MEEDOEN : db.NIET_MEEDOEN, // indien TOCH_INGEDEELD
                    witZwart: "",
                    tegenstanderNummer: 0,
                    resultaat: ""})) {
                aantal++;
                if (await Uitslag.query().findById(
                    [ctx.params.club, ctx.params.seizoen, ctx.params.competitie, ctx.params.ronde, ctx.params.tegenstander])
                    .patch({bordNummer: 0,
                        partij: zwartSpeler.partij === db.INGEDEELD ? db.MEEDOEN : db.NIET_MEEDOEN, // indien TOCH_INGEDEELD
                        witZwart: "",
                        tegenstanderNummer: 0,
                        resultaat: ""})) {
                    aantal++;
                }
            }
            await mutatie(gebruiker, ctx, aantal, db.OPNIEUW_INDELEN);
        }
        ctx.body = aantal;
    });

    /*
    Database: uitslag update
              mutatie insert

    Frontend: indelen.js
     */
    url.get("/:uuid/:club/:seizoen/:competitie/:ronde/:speler/indelen/:bordNummer/:tegenstanderNummer", async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuid);
        let aantal = 0;
        if (gebruiker.juisteRechten(db.WEDSTRIJDLEIDER)) { // indeling definitief maken
            if (await Uitslag.query().findById(
                [ctx.params.club, ctx.params.seizoen, ctx.params.competitie, ctx.params.ronde, ctx.params.speler])
                .patch({bordNummer: ctx.params.bordNummer,
                    partij: db.INTERNE_PARTIJ,
                    witZwart: db.WIT,
                    tegenstanderNummer: ctx.params.tegenstanderNummer,
                    resultaat: ""})) {
                aantal++;
                if (await Uitslag.query().findById(
                    [ctx.params.club, ctx.params.seizoen, ctx.params.competitie, ctx.params.ronde, ctx.params.tegenstanderNummer])
                    .patch({bordNummer: ctx.params.bordNummer,
                        partij: db.INTERNE_PARTIJ,
                        witZwart: db.ZWART,
                        tegenstanderNummer: ctx.params.speler,
                        resultaat: ""})) {
                    aantal++;
                }
            }
            await mutatie(gebruiker, ctx, aantal, db.OPNIEUW_INDELEN);
        }
        ctx.body = aantal;
    });

    /*
    Database: uitslag update
              mutatie insert

    Frontend: indelen.js
     */
    url.get("/:uuid/:club/:seizoen/:competitie/:ronde/:speler/oneven", async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuid);
        let aantal = 0;
        if (gebruiker.juisteRechten(db.WEDSTRIJDLEIDER)) { // oneven definitief maken
            aantal = await Uitslag.query().findById(
                [ctx.params.club, ctx.params.seizoen, ctx.params.competitie, ctx.params.ronde, ctx.params.speler])
                .patch({partij: db.ONEVEN});
            await mutatie(gebruiker, ctx, aantal, db.OPNIEUW_INDELEN);
        }
        ctx.body = aantal;
    });

    /*
    Database: uitslag update
              mutatie insert

    Frontend: indelen.js
     */
    url.get("/:uuid/:club/:seizoen/:competitie/:ronde/afwezig", async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuid);
        let aantal = 0;
        if (gebruiker.juisteRechten(db.WEDSTRIJDLEIDER)) { // afwezig definitief maken
            aantal = await Uitslag.query()
                .whereIn("uitslag.partij", [db.NIET_MEEDOEN, db.PLANNING])
                .where("uitslag.clubCode", ctx.params.club)
                .where("uitslag.seizoen", ctx.params.seizoen)
                .where("uitslag.teamCode", ctx.params.competitie)
                .where("uitslag.rondeNummer", "<=", ctx.params.ronde) // ook voor eerdere ronden
                .patch({partij: db.AFWEZIG});
            await mutatie(gebruiker, ctx, aantal, db.NIEUWE_RANGLIJST);
        }
        ctx.body = aantal;
    });

    /*
    Database: uitslag update
              mutatie insert

    Frontend: indelen.js
     */
    url.get("/:uuid/:club/:seizoen/:competitie/:ronde/extern", async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuid);
        let aantal = 0;
        if (gebruiker.juisteRechten(db.WEDSTRIJDLEIDER)) { // extern uit en extern thuis definitief maken
            aantal = await Uitslag.query()
                .whereIn("uitslag.partij", [db.EXTERN_THUIS, db.EXTERN_UIT])
                .where("uitslag.clubCode", ctx.params.club)
                .where("uitslag.seizoen", ctx.params.seizoen)
                .where("uitslag.teamCode", ctx.params.competitie)
                .where("uitslag.rondeNummer", "<=", ctx.params.ronde) // ook voor eerdere ronden
                .patch({partij: db.EXTERNE_PARTIJ});
            await mutatie(gebruiker, ctx, aantal, db.NIEUWE_RANGLIJST);
        }
        ctx.body = aantal;
    });

    /*
    resultaten van indelen, oneven en afwezig terugdraaien
    resultaten van extern niet terugdraaien

    Database: uitslag update
              mutatie insert

    Frontend: ronde.js
     */
    url.get("/:uuid/:club/:seizoen/:competitie/:ronde/verwijder/indeling", async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuid);
        let aantal = 0;
        if (gebruiker.juisteRechten(db.WEDSTRIJDLEIDER)) { // definitief maken terugdraaien
            const aanmelden = await Uitslag.query()
                .whereIn("uitslag.partij", [db.INTERNE_PARTIJ, db.ONEVEN, db.REGLEMENTAIRE_WINST])
                .where("uitslag.clubCode", ctx.params.club)
                .where("uitslag.seizoen", ctx.params.seizoen)
                .where("uitslag.teamCode", ctx.params.competitie)
                .where("uitslag.rondeNummer", ctx.params.ronde)
                .patch({bordNummer: 0,
                    partij: db.MEEDOEN,
                    witZwart: "",
                    tegenstanderNummer: 0,
                    resultaat: ""});
            const afzeggen = await Uitslag.query()
                .where("uitslag.clubCode", ctx.params.club)
                .where("uitslag.seizoen", ctx.params.seizoen)
                .where("uitslag.teamCode", ctx.params.competitie)
                .where("uitslag.rondeNummer", ctx.params.ronde)
                .where("uitslag.partij", db.AFWEZIG)
                .patch({bordNummer: 0,
                    partij: db.NIET_MEEDOEN,
                    witZwart: "",
                    tegenstanderNummer: 0,
                    resultaat: ""});
            aantal = aanmelden + afzeggen;
            await mutatie(gebruiker, ctx, aantal, db.OPNIEUW_INDELEN);
        }
        ctx.body = aantal;
    });

    /*
    uitslag wijzigen

    Database: uitslag update
              mutatie insert

    Frontend: ronde.js
     */
    url.get("/:uuid/:club/:seizoen/:competitie/:ronde/:speler/uitslag/:tegenstander/:resultaat", async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuid);
        let aantal = 0;
        const allesWijzigen = gebruiker.juisteRechten(db.WEDSTRIJDLEIDER); // uitslag van andere gebruiker wijzigen
        if (allesWijzigen ||
            gebruiker.eigenData(db.GEREGISTREERD, ctx.params.speler) || // eigen uitslag wijzigen
            gebruiker.eigenData(db.GEREGISTREERD, ctx.params.tegenstander)) {
            const eigenUitslag = await Uitslag.query()
                .select("uitslag.resultaat")
                .findById([ctx.params.club, ctx.params.seizoen, ctx.params.competitie, ctx.params.ronde, ctx.params.speler]);
            const tegenstanderUitslag = await Uitslag.query()
                .select("uitslag.resultaat")
                .findById([ctx.params.club, ctx.params.seizoen, ctx.params.competitie, ctx.params.ronde, ctx.params.tegenstander]);
            if (resultaatWijzigen(eigenUitslag.resultaat, tegenstanderUitslag.resultaat, ctx.params.resultaat, allesWijzigen)) {
                if (await Uitslag.query().findById(
                    [ctx.params.club, ctx.params.seizoen, ctx.params.competitie, ctx.params.ronde, ctx.params.speler])
                    .patch(
                        {resultaat: ctx.params.resultaat})) {
                    aantal++;
                }
                if (Number(ctx.params.tegenstander) > 0) {
                    if (await Uitslag.query().findById(
                        [ctx.params.club, ctx.params.seizoen, ctx.params.competitie, ctx.params.ronde, ctx.params.tegenstander])
                        .patch(
                            {resultaat: resultaatTegenstander(ctx.params.resultaat)})) {
                        aantal++;
                    }
                }
            }
            await mutatie(gebruiker, ctx, aantal, db.NIEUWE_RANGLIJST);
        }
        ctx.body = aantal;
    });

    /*
    Database: uitslag en ronde delete
              mutatie insert

    Frontend: ronde.js
     */
    url.get("/:uuid/:club/:seizoen/:competitie/:ronde/verwijder/ronde", async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuid);
        let aantal = 0;
        if (gebruiker.juisteRechten(db.BEHEERDER)) {
            const resultaten = await Uitslag.query()
                .whereIn("uitslag.resultaat", [db.WINST, db.VERLIES, db.REMISE])
                .where("uitslag.clubCode", ctx.params.club)
                .where("uitslag.seizoen", ctx.params.seizoen)
                .where("uitslag.teamCode", ctx.params.competitie)
                .where("uitslag.rondeNummer", ctx.params.ronde)
                .limit(1);
            if (resultaten.length === 0) { // ronde en uitslagen verwijderen indien geen resultaten
                const uitslagen = await Uitslag.query().delete()
                    .where("uitslag.clubCode", ctx.params.club)
                    .where("uitslag.seizoen", ctx.params.seizoen)
                    .where("uitslag.teamCode", ctx.params.competitie)
                    .where("uitslag.rondeNummer", ctx.params.ronde);
                const ronden = await Ronde.query().delete()
                    .where("uitslag.clubCode", ctx.params.club)
                    .where("ronde.seizoen", ctx.params.seizoen)
                    .where("ronde.teamCode", ctx.params.competitie)
                    .where("ronde.rondeNummer", ctx.params.ronde);
                aantal = uitslagen + ronden;
                await mutatie(gebruiker, ctx, aantal, db.GEEN_INVLOED);
            }
        }
        ctx.body = aantal;
    });

    /*
    Database: persoon delete
              mutatie insert

    Frontend: lid.js
     */
    url.get("/:uuid/verwijder/persoon/:knsbNummer", async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuid);
        let aantal = 0;
        if (gebruiker.juisteRechten(db.BEHEERDER)) {
            const uitslagen = await Uitslag.query()
                .where("knsbNummer", ctx.params.knsbNummer)
                .limit(1);
            if (uitslagen.length === 0) { // speler, gebruiker en persoon verwijderen indien geen uitslagen
                const spelers = await Speler.query().delete()
                    .where("knsbNummer", ctx.params.knsbNummer);
                const gebruikers = await Gebruiker.query().delete()
                    .where("knsbNummer", ctx.params.knsbNummer);
                const personen = await Persoon.query().delete()
                    .where("knsbNummer", ctx.params.knsbNummer);
                aantal = spelers + gebruikers + personen;
                await mutatie(gebruiker, ctx, aantal, db.GEEN_INVLOED);
            }
        }
        ctx.body = aantal;
    });

    /*
    Database: mutatie delete
              mutatie insert

    Frontend: beheer.js
     */
    url.get("/:uuid/verwijder/mutaties", async function (ctx) {
        const gebruiker = await gebruikerRechten(ctx.params.uuid);
        let aantal = 0;
        if (gebruiker.juisteRechten(db.ONTWIKKElAAR)) {
            aantal = await Mutatie.query().delete()
                .where("knsbNummer", gebruiker.dader.knsbNummer);
            await mutatie(gebruiker, ctx, aantal, db.GEEN_INVLOED);
        }
        ctx.body = aantal;
    });
}

async function paarMuteren(uitslag) {
    const tegenstander = await Uitslag.query().findById(
        [uitslag.clubCode, uitslag.seizoen, uitslag.teamCode, uitslag.rondeNummer, uitslag.tegenstanderNummer]);
    if (!db.isPaar(tegenstander)) { // uitsluitend indien paar
        return 0;
    }
    let aantal = 0;
    if (await Uitslag.query().findById(
        [uitslag.clubCode, uitslag.seizoen, uitslag.teamCode, uitslag.rondeNummer, uitslag.knsbNummer])
        .patch({bordNummer: 0,
            partij: db.NIET_MEEDOEN, // speler heeft afgezegd
            witZwart: "",
            tegenstanderNummer: 0})) {
        aantal++;
    }
    if (await Uitslag.query().findById(
        [uitslag.seizoen, uitslag.teamCode, uitslag.rondeNummer, uitslag.tegenstanderNummer])
        .patch({bordNummer: 0,
            partij: uitslag.partij === db.INGEDEELD ? db.MEEDOEN : db.NIET_MEEDOEN, // indien TOCH_INGEDEELD
            witZwart: "",
            tegenstanderNummer: 0})) {
        aantal++;
    }
    return aantal;
}

async function planningMuteren(uitslag, partij) {
    if (!db.isPlanning(uitslag)) { // uitsluitend indien planning
        return 0;
    } else if (await Uitslag.query().findById(
        [uitslag.clubCode, uitslag.seizoen, uitslag.teamCode, uitslag.rondeNummer, uitslag.knsbNummer])
        .patch(
            {partij: partij})) {
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

async function gebruikerRechten(uuid) {
    const dader = await Gebruiker.query()
        .findById(uuid)
        .select("persoon.knsbNummer", "mutatieRechten", "naam", "email")
        .join("persoon", "gebruiker.knsbNummer", "persoon.knsbNummer");

    function juisteRechten(minimum) {
        return Number(dader.mutatieRechten) >= minimum;
    }

    function eigenData(minimum, knsbNummer) {
        return juisteRechten(minimum) && dader.knsbNummer === Number(knsbNummer);
    }

    return Object.freeze({dader, juisteRechten, eigenData});
}
