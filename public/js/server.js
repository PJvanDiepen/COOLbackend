/*
 * Deze module bevat alle code voor het synchroniseren van de browser met de server.
 */

import { server, url } from "./html.js";
import * as db from "./db.js";

const sessie = { };

/**
 * synchroniseren (her)start de sessie en synchroniseert met de server
 *
 * @returns {Promise<void>}
 */
export async function synchroniseren() {
    console.log("--- synchroniseren ---");
    console.log(url);
    console.log(db.synchroon);
    const vorigeSessie = JSON.parse(sessionStorage.getItem("sessie")) || db.synchroon;
    console.log(vorigeSessie);
    sessie.club = url.club || vorigeSessie.club || 0;
    console.log(sessie);
    const nietSynchroon = JSON.parse(sessionStorage.getItem(`/${sessie.club}/synchroon`)); // TODO ???
    console.log(nietSynchroon);
    /*
    TODO sessieVerwerken met db.synchroon
    TODO sessieVerwerken zie html.js: urlVerwerken en uuidVerwerken
    TODO hoe te doen met revisie en mutaties?
    TODO synchroon verwerken
    TODO groeiFuncties() compleet maken
    TODO seizoenen van gegeven club
    TODO een seizoen kiezen en dan alle teams van dat seizoen
    TODO gebruiker en teams voor mutatieRechten
    TODO groeiFuncties() voor lezen gebruiker + spelers
    TODO rolGebruiker test in db.js en db.cjs met groeiFunctie
    TODO indien server herstart dan alles verwijderen uit sessionStorage
    TODO vergelijk mutaties sinds start van server met sessionStorage
    TODO verbeter verwijderNietActueel
     */


    const urlSynchroon = "/0/0/synchroon"; // eerste contact met server
    const test = await vraagServer(urlSynchroon);
    console.log(test);
    verwijderNietActueel(!nietSynchroon || synchroon.serverStart > nietSynchroon.serverStart
        ? 0 // na herstart server is niets actueel
        : Number(synchroon.revisie));
    sessionStorage.setItem(urlSynchroon, JSON.stringify(synchroon));
}

function verwijderNietActueel(revisie) {
    console.log("--- verwijderNietActueel(revisie) ---");
    const verwijderen = [];
    for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key.startsWith("/")) { // indien url
            const value = JSON.parse(sessionStorage.getItem(key));
            console.log("--- key value met object ---");
            console.log(key);
            console.log(value);
            console.log(typeof value);
            // verwijderen.push(key);
        }
    }
    if (verwijderen.length > 0) {
        /*
        console.log(`verwijderNietActueel(${revisie}): ${verwijderen.length} sessionStorage items`);
         */
        for (const key of verwijderen) {
            sessionStorage.removeItem(key);
        }
    }
}

async function groeiFuncties () { // zie api.js
    const clubVraag = await server.vraag("/club");

    async function leesClubs() {

    }

    async function leesSeizoenen(clubCode) {

    }

    async function leesTeams(clubCode, seizoen) {

    }

    async function leesRonden(clubCode, seizoen, teamCode) {

    }

    async function leesUitslagen(clubCode, seizoen, teamCode, rondeNummer) {

    }

    return Object.freeze({
        leesClubs,
        leesSeizoenen,
        leesTeams,
        leesRonden,
        leesUitslagen
    });
}

// db.boomOnderhoud(leesDatabase());

export async function vraag(commando) {
    const vraagVanServer = await vraagZoeken(commando);
    if (!vraagVanServer) {
        return Object.freeze({});
    }
    const specificatie = {
        uuid: "",
        revisie: 0,
        club: 0,
        seizoen: "",
        team: "",
        competitie: "",
        ronde: 0,
        speler: 0,
        maand: 0,
        jaar: 0,
        csv: ""
    };

    /*
    TODO url = { }; na invullen door urlVerwerken() en gebruikerVerwerken() en zo voort
    TODO specificeren(url);
     */

    function specificeren(object) {
        for (const [key, value] of Object.entries(object)) {
            specificatie[key] = value;
        }
        return this;
    }

    function invullen() {
        return vraagVanServer
            .replace(":uuid", specificatie.uuid)
            .replace(":revisie", specificatie.revisie)
            .replace(":club", specificatie.club)
            .replace(":seizoen", specificatie.seizoen)
            .replace(":team", specificatie.team)
            .replace(":competitie", specificatie.competitie)
            .replace(":ronde", specificatie.ronde)
            .replace(":speler", specificatie.speler)
            .replace(":maand", specificatie.maand)
            .replace(":jaar", specificatie.jaar)
            .replace(":csv", specificatie.csv);
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

    // TODO synchroon verwerken
    // TODO

    async function muteren() {
        return await vraagServer(invullen());  // TODO aantal mutaties teruggeven
    }

    async function antwoorden() {
        const url = invullen();
        let antwoord = JSON.parse(sessionStorage.getItem(url)); // indien lokaal dan niet vraagServer
        if (!antwoord) {
            antwoord = await vraagServer(url);
            sessionStorage.setItem(url, JSON.stringify(antwoord));
        }
        return antwoord;
    }

    return Object.freeze({
        specificeren, // (object) ->
        afdrukken,    // () ->
        muteren,      // ()
        antwoorden    // ()
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
    }
    return vragen[0]; // eerste of enige vraag
}

/**
 * vraagLokaal optimaliseert de verbinding met de server
 * door het antwoord van de server ook lokaal op te slaan
 *
 * vraagLokaal krijgt object van vraagServer met revisie: <getal> data: [...]
 *
 * @param url de vraag aan de server
 * @returns {Promise<any>} revisie en data uit het antwoord van de server
 */
async function vraagLokaal(url) {
    let antwoord = JSON.parse(sessionStorage.getItem(url)); // indien lokaal dan niet vraagServer
    if (!antwoord) {
        antwoord = await vraagServer(url);
        sessionStorage.setItem(url, JSON.stringify(antwoord));
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
        const response = await fetch(`${server}${url}`); // zie html.js
        if (response.ok) {
            return await response.json();
        } else {
            console.trace(`--- vraagServer ---`);
            console.log(response);
            return null;
        }
    } catch (error) {
        console.trace(`--- vraagServer error ---`);
        console.error(error);
    }
}