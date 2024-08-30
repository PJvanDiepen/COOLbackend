/*
 * Deze module bevat globale variabelen en code die op meer dan een pagina wordt gebruikt.
 *
 * De eerste pagina van 0-0-0.nl staat in index.html en start.html is de pagina, die de 0-0-0 app start.
 * De bijhorende start.js verwerkt de url, vult de pagina aan en reageert op de gebruiker.
 *
 * Dit geldt voor alle vervolg pagina's. Bij agenda.html hoort agenda.js, bij bestuur.html hoort bestuur.js en zo voort.
 * Daarnaast zijn er modules:
 *
 * html.js bevat alle code voor interactie met HTML en CSS
 * db.js bevat alle code voor het valideren van de velden in de tabellen van de MySQL database
 * enz.
 */

import * as html from "./html.js";
import * as db from "./db.js";

import * as zyq from "./zyq.js";

/**
 * init voor aanmelden.js
 *           agenda.js
 *           beheer.js
 *           bestuur.js
 *           email.js
 *           indelen.js
 *           lid.js
 *           paren.js
 *           ranglijst.js
 *           ronde.js
 *           rondenlijst.js
 *           speler.js
 *           start.js
 *           team.js
 *
 * Elke verwerking van een pagina van 0-0-0 begint met init(), eventueel competitieTitel() en het verwerken van mutaties.
 * Daarna pagina maken en mutaties markeren met gewijzigd() en meestal een menu().
 */
export async function init() {
    console.log("--- start init ---");
    await synchroniseren();
    urlVerwerken();
    versieBepalen();
    await zyq.gebruikerVerwerken();

    console.log(o_o_o);
    console.log(zyq.gebruiker);

    await seizoenVerwerken();

    Object.assign(zyq.o_o_o, o_o_o); // TODO voorlopig i.v.m.

    /*
    TODO voor de verwerking
    o_o_o.ronde = [];
    o_o_o.vorigeRonde = 0;
    o_o_o.huidigeRonde = 0;
    TODO localFetch(`/${o_o_o.club}/${o_o_o.seizoen}/${o_o_o.competitie}/ronden`);
    TODO update o_o_o.ronde met rondeNummer als index
    TODO verwijder zyq.competitieRondenVerwerken();
     */


    /* TODO zyq.localFetch vervangen door iets wat revisie controleert
    const {revisie, club, seizoenen} = await zyq.localFetch(`/${o_o_o.club}/club`);
    data.club = db.clubToevoegen(club).seizoenToevoegen(seizoenen);
    console.log("--- einde init ---")
    console.log(o_o_o);
     */
}

const synchroon = { }; // versie, serverStart, compleet: 1 en revisie: [] zie api.js

async function synchroniseren() {
    const urlSynchroon = "/synchroon";
    const nietSynchroon = JSON.parse(sessionStorage.getItem(urlSynchroon));
    Object.assign(synchroon, await vraagServer(urlSynchroon));
    if (!nietSynchroon || synchroon.serverStart > nietSynchroon.serverStart) {
        verwijderNietSynchroon(); // na herstart server is niets actueel
    }
    sessionStorage.setItem(urlSynchroon, JSON.stringify(synchroon));
    const vragen = await vraagLokaal("/vragen");
    db.vragen.push(...vragen.data); // data zonder compleet
}

function verwijderNietSynchroon() {
    const verwijderen = [];
    for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key.startsWith("/")) { // indien url
            verwijderen.push(key);
        }
    }
    for (const key of verwijderen) {
        sessionStorage.removeItem(key);
    }
}

export const o_o_o = {
    vereniging: "",
    club: 0, // clubCode is een getal
    seizoen: "",
    versie: 0, // versie is een getal
    competitie: "",
    team: "",
    speler: 0, // knsbNummer is een getal
    naam: ""
};

function urlVerwerken() {
    for (const [key, value] of Object.entries(o_o_o)) {
        let parameter = html.params.get(key); // inlezen van url
        if (parameter) {
            sessionStorage.setItem(key, parameter); // opslaan voor sessie
        } else {
            parameter = sessionStorage.getItem(key); // inlezen van sessie
        }
        if (parameter) {
            o_o_o[key] = value === 0 ? Number(parameter) : parameter; // indien 0 dan getal anders tekst
        }
    }
}

function versieBepalen() { // TODO reglement in team i.p.v. versie
    if (o_o_o.competitie === db.INTERNE_COMPETITIE && o_o_o.versie === 0) {
        if (o_o_o.seizoen === "1819" || o_o_o.seizoen === "1920" || o_o_o.seizoen === "2021") {
            o_o_o.versie = 2;
        } else {
            o_o_o.versie = 3; // vanaf seizoen 2021-2022
        }
    } else if (o_o_o.competitie === db.RAPID_COMPETITIE && o_o_o.versie === 0) {
        o_o_o.versie = 4;
    } else if (o_o_o.competitie.substring(1,2) === "z" && o_o_o.versie === 0) {
        o_o_o.versie = 5; // Zwitsers systeem
    } else if (o_o_o.competitie === db.JEUGD_COMPETITIE && o_o_o.versie === 0) {
        o_o_o.versie = 6;
    }
}

async function seizoenVerwerken() {
    console.log("--- club ---");
    const clubVraag = await vraag("/club");
    const club = await clubVraag.antwoord();
    db.clubToevoegen(club.compleet, club);
    console.log(db.data.eenClub(o_o_o.club));

    console.log("--- seizoenen ---");
    const seizoenenVraag = await vraag("/seizoenen");
    const seizoenen = await seizoenenVraag.antwoord();
    for (const seizoen of seizoenen) {
        db.seizoenToevoegen(seizoen.compleet, seizoen);
    }
    const eenSeizoen = db.data.eenClub(o_o_o.club).eenSeizoen(o_o_o.seizoen);
    o_o_o.seizoen = eenSeizoen.seizoen;
    console.log(db.data.eenClub(o_o_o.club));

    console.log("--- teams van 1 seizoen ---");
    const teamsVraag = await vraag("/teams");
    teamsVraag.afdrukken("juiste /teams?");
    const teams = await teamsVraag.antwoord();
    for (const team of teams) {
        db.teamToevoegen(team.compleet, team);
    }
    console.log(db.data.eenClub(o_o_o.club));
    for (const team of db.data.eenClub(o_o_o.club).eenSeizoen(o_o_o.seizoen).team) {
        console.log(team);
    }
}

export async function vraag(commando) {
    const vraagVanServer = await vraagZoeken(commando);
    if (!vraagVanServer) {
        return Object.freeze({});
    }
    const specificatie = {
        uuid: zyq.uuidToken,
        club: o_o_o.club,
        seizoen: o_o_o.seizoen,
        team: o_o_o.team,
        competitie: o_o_o.competitie,
        ronde: 1,
        speler: 0
    };

    function invullen() {
        return vraagVanServer
            .replace(":uuid", specificatie.uuid)
            .replace(":club", specificatie.club)
            .replace(":seizoen", specificatie.seizoen)
            .replace(":team", specificatie.team)
            .replace(":competitie", specificatie.competitie)
            .replace(":ronde", specificatie.ronde)
            .replace(":speler", specificatie.speler);
    }

    function specificeren(object) {
        for (const [key, value] of Object.entries(object)) {
            specificatie[key] = value;
        }
        return this;
    }

    function afdrukken(tekst = "") {
        if (tekst) {
            console.log(`--- ${tekst} ---`);
        }
        console.log(vraagVanServer);
        console.log(specificatie);
        console.log(invullen());
        return this;
    }

    async function antwoord() {
        return await vraagLokaal(invullen());
    }

    return Object.freeze({
        specificeren, // (object) ->
        afdrukken,    // () ->
        antwoord      // ()
    });
}

async function vraagZoeken(commando) {
    const vragen = db.vragen.filter(function (vraag) {
        return vraag.includes(commando);
    });
    if (vragen.length < 1) {
        console.log(`Server herkent geen commando met ${commando}`);
        return "";
    } else if (vragen.length > 1) {
        console.log(`Server herkent meer commando's met ${commando}`);
        console.log(vragen);
        return vragen[0];
    }
    return vragen[0]; // eerste of enige vraag
}

/**
 * vraagLokaal optimaliseert de verbinding met de server
 * door het antwoord van de server ook lokaal op te slaan
 *
 * vraagLokaal krijgt object van vraagServer met compleet: <getal> data: [...]
 *
 * @param url de vraag aan de server
 * @returns {Promise<any>} compleet en data uit het antwoord van de server
 */
async function vraagLokaal(url) {
    let antwoord = JSON.parse(sessionStorage.getItem(url)); // indien lokaal dan niet vraagServer
    if (!antwoord) {
        antwoord = await vraagServer(url);
        if (Number(antwoord.compleet)) {
            sessionStorage.setItem(url, JSON.stringify(antwoord));
        } // indien niet compleet > 0 niet opslaan en steeds opnieuw vraagServer
    }
    return antwoord;
}

const server = html.pagina.host.match("localhost") ? "http://localhost:3000" : "https://0-0-0.nl";
/**
 * vraagServer maakt verbinding met de server
 *
 * @param url de vraag aan de database op de server
 * @returns {Promise<any>} het antwoord van de server
 */
async function vraagServer(url) {
    try {
        const response = await fetch(`${server}${url}`);
        if (response.ok) {
            return await response.json();
        } else {
            console.log(`--- vraagServer ---`);
            console.log(response);
            return null;
        }
    } catch (error) {
        console.log(`--- vraagServer error ---`);
        console.error(error);
    }
}

export function competitieTitel() { // TODO met (clubCode)
    html.id("competitie").textContent =
        `Waagtoren${html.SCHEIDING}${db.teamVoluit(o_o_o.competitie)}`;
}

/**
 * vinkjeInvullen voor agenda.js en teamleider.js
 *
 * @type {Map<string, string>}
 */
export const vinkjeInvullen = new Map([
    [db.PLANNING, html.VRAAGTEKEN],
    [db.NIET_MEEDOEN, html.STREEP],
    [db.MEEDOEN, html.VINKJE],
    [db.EXTERN_THUIS, html.VINKJE],
    [db.EXTERN_UIT, html.VINKJE],
    [db.INGEDEELD, html.VINKJE],
    [db.TOCH_INGEDEELD, html.VINKJE]]);

/**
 * teamSelecteren voor ranglijst.js en team.js
 *
 * TODO bijna hetzelfde als start.js: competitieSelecteren en teamleider.js: teamSelecteren
 *
 * @param teamCode team of competitie
 * @returns {Promise<void>}
 */
export async function teamSelecteren(teamCode) {
    const teams = (await zyq.localFetch(`/${o_o_o.club}/${o_o_o.seizoen}/teams`)).filter(function (team) {
        return db.isCompetitie(team) || db.isTeam(team);
    }).map(function (team) {
        return [team.teamCode, db.teamVoluit(team.teamCode)];
    });
    html.selectie(html.id("teamSelecteren"), teamCode, teams, function (teamCode) {
        if (teamCode === "" ? false : teamCode.substring(0,1) === "i") {
            html.anderePagina(`ranglijst.html?competitie=${teamCode}`);
        } else {
            html.anderePagina(`team.html?team=${teamCode}`);
        }
    });
}

/**
 * rondeSelecteren voor ranglijst.js en ronde.js
 *
 * @param teamCode team of competitie
 * @param rondeNummer welke ronde
 * @returns {Promise<void>}
 */
export async function rondeSelecteren(teamCode, rondeNummer) {
    o_o_o.team = o_o_o.competitie;
    const ronden = (await zyq.localFetch(`/${o_o_o.club}/${o_o_o.seizoen}/${teamCode}/ronden`)).map(function (ronde) {
        return [ronde.rondeNummer, `${zyq.datumLeesbaar(ronde)}${html.SCHEIDING}ronde ${ronde.rondeNummer}`];
    });
    html.selectie(html.id("rondeSelecteren"), rondeNummer, ronden, function (ronde) {
        html.anderePagina(`ronde.html?ronde=${ronde}`);
    });
}

/**
 * perTeamRondenUitslagen voor ronde.js, team.js en teamleider.js
 *
 * TODO ook voor start.js
 * TODO verplaatsen naar server
 *
 * @param teamCode team
 * @returns {Promise<*[]>} rondenUitslagen
 *
 * rondenUitslagen is een lijst van ronden
 * met per ronde: ronde informatie, aantal keer winst, remise en verlies, een lijst met uitslagen, aantal deelnemers, een lijst met geplandeUitslagen
 * met per uitslag of geplande uitslag: bordNummer, speler (knsbNummer en naam), kleur, resultaat of planning (in partij)
 */
export async function perTeamRondenUitslagen(teamCode) {
    const rondenUitslagen = [];
    (await zyq.serverFetch(`/${o_o_o.club}/${o_o_o.seizoen}/${teamCode}/ronden`)).forEach(
        function (ronde) {
            rondenUitslagen[ronde.rondeNummer]
                = {ronde: ronde, winst: 0, remise: 0, verlies: 0, uitslagen: [], deelnemers: 0, geplandeUitslagen: []};
        });
    (await zyq.serverFetch(`/${o_o_o.club}/${o_o_o.seizoen}/${teamCode}/team`)).forEach(
        function (uitslag) {
            const rondeUitslag = rondenUitslagen[uitslag.rondeNummer];
            if (uitslag.partij === db.EXTERNE_PARTIJ) {
                if (uitslag.resultaat === db.WINST) {
                    rondeUitslag.winst += 1;
                } else if (uitslag.resultaat === db.REMISE) {
                    rondeUitslag.remise += 1;
                } else if (uitslag.resultaat === db.VERLIES) {
                    rondeUitslag.verlies += 1;
                }
                rondeUitslag.uitslagen.push(uitslag);
            } else {
                if (db.isMeedoen(uitslag)) {
                    rondeUitslag.deelnemers += 1;
                }
                rondeUitslag.geplandeUitslagen.push(uitslag);
            }
        });
    return rondenUitslagen;
}