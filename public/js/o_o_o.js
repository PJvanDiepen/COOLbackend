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
import * as server from "./server.js";

import * as zyq from "./zyq.js";

/**
 * Elke verwerking van een pagina van 0-0-0 begint met init(), eventueel competitieTitel() en het verwerken van mutaties.
 * Daarna pagina maken en mutaties markeren met gewijzigd() en meestal een menu().
 */
export async function init() {
    await server.synchroniseren();
    urlVerwerken();
    await zyq.gebruikerVerwerken();
    await seizoenVerwerken();
    o_o_o.competitie = db.isCompetitie({teamCode: o_o_o.team })
        ? o_o_o.team
        : competitieBepalen();
    if (!o_o_o.team) {
        o_o_o.team = o_o_o.competitie;
    }
    o_o_o.versie = versieBepalen();
    Object.assign(zyq.o_o_o, o_o_o); // TODO voorlopig i.v.m. zyq.aanroepen
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

/*
TODO url voor de duidelijkheid afsplitsen van o_o_o
TODO url als geheel opslaan in sessionStorage (geen losse parameters)
 */
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
    console.log("seizoenVerwerken");
    const clubVraag = await server.vraag("/club");
    const club = await clubVraag.antwoord();
    db.clubToevoegen(club.revisie, club);
    const seizoenenVraag = await server.vraag("/seizoenen");
    const seizoenen = await seizoenenVraag.antwoord();
    for (const seizoen of seizoenen) {
        console.log(seizoen);
        db.seizoenToevoegen(seizoen.revisie, seizoen);
    }
    o_o_o.seizoen = seizoenBepalen();
    const eenSeizoen = db.tak(o_o_o.club, o_o_o.seizoen);
    const teamsVraag = await server.vraag("/teams");
    const teams = await teamsVraag.specificeren(o_o_o).antwoord();
    for (const team of teams) {
        db.teamToevoegen(team.revisie, team);
    }
    const rondenVraag = await server.vraag("/ronden");
    for (const team of eenSeizoen.team) {
        const ronden = await rondenVraag
            .specificeren(o_o_o)
            .specificeren({team: team.teamCode})
            .antwoord();
        for (const ronde of ronden) {
            db.rondeToevoegen(ronde.revisie, ronde);
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

    const uitslagenVraag = await server.vraag("/uitslagen");
    for (const eenTeam of eenSeizoen.team) {
        for (const eenRonde of eenTeam.ronde) {
            const uitslagen = await uitslagenVraag
                .specificeren(o_o_o)
                .specificeren({team: eenRonde.teamCode, ronde: eenRonde.rondeNummer})
                .antwoord();
            for (const uitslag of uitslagen) {
                db.uitslagToevoegen(uitslag.revisie, uitslag);
            }
        }
    }
}

function seizoenBepalen() {
    console.log("seizoenBepalen");
    const eenClub = db.tak(o_o_o.club);
    console.log(eenClub);
    const i = eenClub.seizoenIndex(o_o_o.seizoen);
    return eenClub.seizoen[i < 0 ? eenClub.seizoen.length - 1 : i].seizoen; // anders laatste seizoen
}

function competitieBepalen() {
    let competitieRonde = null;
    for (const eenTeam of db.tak(o_o_o.club, o_o_o.seizoen).team) {
        if (db.isCompetitie(eenTeam)) {
            const ronde = eenTeam.rondeIndelen();
            if (ronde !== null && (competitieRonde === null || competitieRonde.datum > ronde.datum)) {
                competitieRonde = ronde;
            }
        }
    }
    return competitieRonde ? competitieRonde.teamCode : db.INTERNE_COMPETITIE;
}

function versieBepalen() { // TODO reglement in team i.p.v. versie
    if (o_o_o.competitie === db.INTERNE_COMPETITIE && o_o_o.versie === 0) {
        if (o_o_o.seizoen === "1819" || o_o_o.seizoen === "1920" || o_o_o.seizoen === "2021") {
            return 2;
        } else if (o_o_o.seizoen === "2526") { // TODO en latere seizoenen?
            return 8;
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
    return o_o_o.versie;
}

/**
 * laatsteUitslagenRonde van team of competitie in seizoen
 * waarvan alle uitslagen zijn ingevuld
 *
 * @returns {number|*} geen of rondeNummer
 */
export function laatsteUitslagenRonde() {
    const ronde = db.tak(o_o_o.club, o_o_o.seizoen, o_o_o.team).rondeCompleet();
    return ronde ? ronde.rondeNummer : 0;
}

/**
 * invullenUitslagenRonde van team of competitie in seizoen
 * waarvan nog niet alle uitslagen zijn ingevuld
 *
 * @returns {number|*} geen of rondeNummer
 */
export function invullenUitslagenRonde() {
    const ronde = db.tak(o_o_o.club, o_o_o.seizoen, o_o_o.team).rondeInvullen();
    return ronde ? ronde.rondeNummer : 0;
}

/**
 * indelenRonde van competitie in seizoen
 * is volgende ronde na ronde waarvan alle uitslagen zijn ingevuld
 *
 * @returns {number|*} geen of rondeNummer
 */
export function indelenRonde() {
    const ronde = db.tak(o_o_o.club, o_o_o.seizoen, o_o_o.team).rondeIndelen();
    return ronde ? ronde.rondeNummer : 0;
}

export function rondeGegevens(teamCode, rondeNummer) {
    const team = db.tak(o_o_o.club, o_o_o.seizoen, teamCode);
    return team.ronde[team.rondeIndex(rondeNummer)];
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
                if (db.planningInvullen.get(uitslag.partij) === db.NIET_MEEDOEN) {
                    rondeUitslag.deelnemers += 1;
                }
                rondeUitslag.geplandeUitslagen.push(uitslag);
            }
        });
    return rondenUitslagen;
}