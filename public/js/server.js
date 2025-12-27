/*
 * Deze module bevat alle code voor het synchroniseren van de browser met de server.
 *
 *
 */

import { server, url } from "./html.js";
import * as db from "./db.js";

/**
 * eersteContact van de browser synchroniseert met eersteContact van de server. Zie api.js
 *
 * Bij eersteContact van de server stuurt eersteContact van de server antwoord
 * met synchroon zonder mutaties en de mogelijke vragen als gevraagdeData.
 * De browser is helemaal synchroon, want begint verder zonder data.
 *
 * Indien de browser al eerder contact had tijdens een sessie stuurt eersteContact antwoord
 * zonder gevraagdeData met synchroon en mutaties vanaf de browserRevisie.
 * De browser is al synchroon tot de browserRevisie en de mogelijke vragen zijn al verstuurd.
 *
 * @returns {Promise<void>}
 */
export async function eersteContact() {
    console.log("--- eersteContact: url, db.synchroon, antwoord ---");
    console.log(url);
    Object.assign(db.synchroon, JSON.parse(sessionStorage.getItem("sessie")));
    if (url.hasOwnProperty("club")) {
        db.synchroon.club = url.club;
    }
    console.log(db.synchroon);
    const antwoord = await vraagServer(`/${db.synchroon.revisie}/${db.synchroon.club}/synchroon`);
    console.log(antwoord);
    if (db.synchroon.revisie === 0) {
        db.synchroon.vragen = synchroniseren(antwoord);
    } else {
        synchroniseren(antwoord);
    }
}

/*
TODO synchroniseren ook aanroepen bij vraag antwoorden
TODO groeiFuncties() compleet maken
TODO seizoenen van gegeven club
TODO een seizoen kiezen en dan alle teams van dat seizoen
TODO gebruiker en teams voor mutatieRechten
TODO groeiFuncties() voor lezen gebruiker + spelers
TODO rolGebruiker test in db.js en db.cjs met groeiFunctie
 */

// Save any object (with Dates) to sessionStorage
function saveJSON(key, value) {
    sessionStorage.setItem(key, JSON.stringify(value));
}

// Load JSON and automatically convert ISO strings back to Dates
function loadJSON(key) {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;

    return JSON.parse(raw, (k, v) => {
        // Detect ISO date strings
        if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}T/.test(v)) {
            return new Date(v);
        }
        return v;
    });
}


/**
 * Na eersteContact of vraag aan de server verwerkt synchroniseren het antwoord van de server
 * met synchroon {} en gevraagdeData. Zie api.js
 *
 * @param antwoord van server
 * @returns [] gevraagdeData
 */
function synchroniseren(antwoord) {

    /*
    TODO documenteren
    TODO sessionStorage.setItem("sessie")
    TODO indien server herstart dan alles verwijderen uit sessionStorage
    TODO mutaties synchroniseren (= niet actueel data verwijderen)
    TODO strip mutaties van synchroon
    TODO revisie en gevraagdeData opslaan in sessionStorage met juiste key
     */
    console.log("--- synchroniseren ---")
    return antwoord.slice(1); // gevraagdeData
}

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

    function vanafDerdeDeel(url) {
        return url.replace(/^(?:[^/]*\/){3}/, "");
    }

    function vanafTweedeDeel(url) {
        return url.replace(/^[^/]*\//, "");
    }

    function vanafEersteDeel(url) {
        return url;
    }

    const zonder = vraagVanServer.startsWith("/:uuid/:revisie")
        ? vanafDerdeDeel
        : (vraagVanServer.startsWith("/:uuid") || vraagVanServer.startsWith("/:revisie"))
            ? vanafTweedeDeel
            : vanafEersteDeel;

    function afdrukken(tekst = "") {
        if (tekst) {
            console.log(`--- ${tekst} ---`);
        }
        console.log(vraagVanServer);
        console.log(specificatie);
        console.log(invullen());
        return this;
    }

    async function muteren() {
        return await vraagServer(invullen());  // TODO aantal mutaties teruggeven
    }

    async function antwoorden() {
        const url = invullen();
        const key = zonder(url);
        // TODO synchroniseren aanroepen
        const value = JSON.parse(sessionStorage.getItem(key)); // indien lokaal dan niet vraagServer
        if (!value) {
            const antwoord = await vraagServer(url);
            sessionStorage.setItem(key, JSON.stringify(antwoord));
        }
        return antwoord;
    }

    return Object.freeze({
        specificeren, // (object) ->
        zonder,       // TODO alleen voor testen daarna verwijderen
        afdrukken,    // () ->
        muteren,      // ()
        antwoorden    // ()
    });
}

async function vraagZoeken(commando) {
    const vragen = db.synchroon.vragen.filter(function (vraag) {
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
 * @param key de vraag aan de server
 * @returns {Promise<any>} revisie en data uit het antwoord van de server
 */
async function vraagLokaal(key) {
    let antwoord = JSON.parse(sessionStorage.getItem(key)); // indien lokaal dan niet vraagServer
    if (!antwoord) {
        antwoord = await vraagServer(key);
        sessionStorage.setItem(key, JSON.stringify(antwoord));
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