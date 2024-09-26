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
 * Elke verwerking van een pagina van 0-0-0 begint met init(), eventueel competitieTitel() en het verwerken van mutaties.
 * Daarna pagina maken en mutaties markeren met gewijzigd() en meestal een menu().
 */
export async function init() {
    await synchroniseren();
    urlVerwerken();
    // console.log("--- na urlVerwerken() ---");
    // console.log(o_o_o);
    await zyq.gebruikerVerwerken();
    await seizoenVerwerken();
    // console.log("--- na seizoenVerwerken() ---");
    // console.log(o_o_o);
    // console.log(db.isCompetitie({teamCode: o_o_o.team }));
    o_o_o.competitie = db.isCompetitie({teamCode: o_o_o.team })
        ? o_o_o.team
        : competitieBepalen();
    if (!o_o_o.team) {
        o_o_o.team = o_o_o.competitie;
    }
    o_o_o.versie = versieBepalen();
    // console.log("--- na versieBepalen() ---");
    // console.log(o_o_o);
    Object.assign(zyq.o_o_o, o_o_o); // TODO voorlopig i.v.m. zyq.aanroepen
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
    vereniging: "Waagtoren", // TODO van server en start.html?vereniging=Waagtoren -> club=0 vertalen
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

async function seizoenVerwerken() {
    const clubVraag = await vraag("/club");
    const club = await clubVraag.antwoord();
    db.clubToevoegen(club.compleet, club);
    const seizoenenVraag = await vraag("/seizoenen");
    const seizoenen = await seizoenenVraag.antwoord();
    for (const seizoen of seizoenen) {
        db.seizoenToevoegen(seizoen.compleet, seizoen);
    }
    o_o_o.seizoen = seizoenBepalen();
    const eenSeizoen = db.tak(o_o_o.club, o_o_o.seizoen);
    const teamsVraag = await vraag("/teams");
    const teams = await teamsVraag.antwoord();
    for (const team of teams) {
        db.teamToevoegen(team.compleet, team);
    }
    const rondenVraag = await vraag("/ronden");
    for (const team of eenSeizoen.team) {
        const ronden = await rondenVraag
            .specificeren({team: team.teamCode}).antwoord();
        for (const ronde of ronden) {
            db.rondeToevoegen(ronde.compleet, ronde);
        }
    }
    // alle ronden van alle teams en competities van het seizoen sorteren op datum
    o_o_o.ronde = [];
    for (const eenTeam of eenSeizoen.team) {
        let i = 0;
        for (const eenRonde of eenTeam.ronde) {
            while (i < o_o_o.ronde.length && o_o_o.ronde[i].datum <= eenRonde.datum) {
                i++;
            }
            o_o_o.ronde.splice(i, 0, eenRonde); // op datum tussenvoegen
        }
    }
}

function seizoenBepalen() {
    const eenClub = db.tak(o_o_o.club);
    const i = eenClub.seizoenIndex(o_o_o.seizoen);
    return eenClub.seizoen[i < 0 ? eenClub.seizoen.length - 1 : i].seizoen; // anders laatste seizoen
}

function competitieBepalen() {
    const vorigeRonde = indexRondeTotDatum(o_o_o.ronde);
    let i = vorigeRonde < 0 ? 0 : vorigeRonde;
    while (i < o_o_o.ronde.length && !db.isCompetitie(o_o_o.ronde[i])) { // volgende competitie ronde
        i++;
    }
    return o_o_o.ronde[i].teamCode;
}

function versieBepalen() { // TODO reglement in team i.p.v. versie
    if (o_o_o.competitie === db.INTERNE_COMPETITIE && o_o_o.versie === 0) {
        if (o_o_o.seizoen === "1819" || o_o_o.seizoen === "1920" || o_o_o.seizoen === "2021") {
            return 2;
        } else {
            return 3; // vanaf seizoen 2021-2022
        }
    } else if (o_o_o.competitie === db.RAPID_COMPETITIE && o_o_o.versie === 0) {
        return 4;
    } else if (o_o_o.competitie.substring(1,2) === "z" && o_o_o.versie === 0) {
        return 5; // Zwitsers systeem
    } else if (o_o_o.competitie === db.JEUGD_COMPETITIE && o_o_o.versie === 0) {
        return 6;
    }
}

export function laatsteRonde() {
    const ronde = db.tak(o_o_o.club, o_o_o.seizoen, o_o_o.team).ronde;
    return ronde[ronde.length - 1].rondeNummer;
}

export function vorigeRonde() {
    const ronde = db.tak(o_o_o.club, o_o_o.seizoen, o_o_o.team).ronde;
    const i = indexRondeTotDatum(ronde);
    return ronde[i < 0 ? ronde.length - 1 : i > 0 ? i - 1 : 1].rondeNummer; // laatste, vorige of eerste ronde
}

export function volgendeRonde() {
    const ronde = db.tak(o_o_o.club, o_o_o.seizoen, o_o_o.team).ronde;
    const i = indexRondeTotDatum(ronde);
    return i < 0 ? 0 : ronde[i].rondeNummer; // geen of volgende ronde
}

/**
 * Bepaal index in rondenlijst tot een gegeven datum.
 *
 * In de rondenlijst kunnen alle ronden staan van een competitie of een team
 * of alle ronden van alle competities en teams van een club / seizoen.
 * De rondenlijst is gesorteerd op datum en rondeNummer.
 *
 * Indien de gegeven datum ontbreekt, is het de datum van vandaag.
 *
 * @param ronde rondenlijst
 * @param jsonDatum gegeven datum
 * @returns {number} index of -1
 *
 * "20240913"
 */
function indexRondeTotDatum(ronde, jsonDatum = null) {
    const peilDatum = jsonDatum ? new Date(jsonDatum) : new Date();
    if (peilDatum >= new Date(ronde[ronde.length - 1].datum)) { // alle ronden zijn na peilDatum
        return -1;
    }
    let index = 0;
    while (new Date(ronde[index].datum) < peilDatum) { // eerste ronde voor peildatum
        index++;
    }
    return index;
}

export function rondeGegevens(teamCode, rondeNummer) {
    const team = db.tak(o_o_o.club, o_o_o.seizoen, teamCode);
    return team.ronde[team.rondeIndex(rondeNummer)];
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
        console.log(`Server herkent geen vraag met ${commando}`);
        return "";
    } else if (vragen.length > 1) {
        console.log(`Server herkent meer vragen met ${commando}`);
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

/**
 * vraagServer maakt verbinding met de server
 *
 * @param url de vraag aan de database op de server
 * @returns {Promise<any>} het antwoord van de server
 */
async function vraagServer(url) {
    try {
        const response = await fetch(`${html.server}${url}`);
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
    const ronden = (await zyq.localFetch(`/${o_o_o.club}/${o_o_o.seizoen}/${teamCode}/ronde/selecteren`)).map(function (ronde) {
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