/*
 * Deze module bevat alle code voor de interactie met de server op 0-0-0.nl
 *
 * De server verzorgt de interactie met de database en krijgt vragen van browsers van gebruikers.
 * Daarom is het noodzakelijk om de browser voortdurend te synchroniseren met de server.
 *
 * Daarnaast probeert de browser zo min mogelijk vragen te stellen aan de server
 * door antwoorden van de server in sessionStorage te gebruiken.
 *
 * De browser stelt een vraag aan de server door middel van een url.
 * Het antwoord van de server bestaat uit synchroon en daarna de gevraagdeData.
 * Na synchroniseren slaat de browser een antwoord op in sessionStorage met
 * een key die bestaat uit url zonder uuid en revisie en
 * een value die bestaat uit revisie en de gevraagdeData.
 */

import { server, url } from "./html.js";
import * as db from "./db.js";

function groeiFuncties () {
    const clubsVraag = vraag("/clubs");

    async function leesClubs() {
        return await clubsVraag.antwoorden();
    }

    const seizoenenVraag = vraag("/seizoenen");

    async function leesSeizoenen(object) {
         return await seizoenenVraag.specificeren(object).antwoorden();
    }

    const teamsVraag = vraag("/teams");

    async function leesTeams(object) {
        return await teamsVraag.specificeren(object).antwoorden();
    }

    const rondenVraag = vraag("/ronden");

    async function leesRonden(object) {
        return await rondenVraag.specificeren(object).antwoorden();
    }

    const uitslagenVraag = vraag("/uitslagen");

    async function leesUitslagen(object) {
        return await uitslagenVraag.specificeren(object).antwoorden();
    }

    return Object.freeze({
        leesClubs,
        leesSeizoenen,
        leesTeams,
        leesRonden,
        leesUitslagen
    });
}

const SESSIE = "sessie";
/**
 * synchroonBijwerken werkt synchroon van de browser bij met synchroon van de server.
 * Zie db.js
 *
 * Uitsluitend als in synchroon mogelijke vragen aan de server staan,
 * zijn dat de meest actuele vragen die de browser aan de server kan stellen.
 *
 * @param synchroon van de server
 */
function synchroonBijwerken(synchroon) {
    db.synchroon.versie = synchroon.versie;
    if (synchroon.vragen.length > 0) {
        db.synchroon.vragen = synchroon.vragen;
    }
    db.synchroon.start = synchroon.start;
    db.synchroon.revisie = synchroon.revisie;
    sessionStorage.setItem(SESSIE, JSON.stringify(db.synchroon));
}

/**
 * eersteContact van de browser synchroniseert met de server. Zie api.js
 *
 * Bij eersteContact stuurt de server antwoord
 * met synchroon zonder mutaties en de mogelijke vragen en zonder gevraagdeData.
 * De browser is helemaal synchroon, want begint zonder eerdere antwoorden.
 *
 * Indien de browser al eerder contact had tijdens een SESSIE stuurt de server antwoord
 * met synchroon en mutaties vanaf de browserRevisie en zonder gevraagdeData.
 * De browser is al synchroon tot de browserRevisie en de mogelijke vragen zijn al verstuurd.
 *
 * @returns {Promise<void>}
 */
export async function eersteContact() {
    Object.assign(db.synchroon, JSON.parse(sessionStorage.getItem(SESSIE)));
    synchroniseren(await vraagServer(`/${db.synchroon.revisie}/${url.club}/synchroon`));
    db.boomOnderhoud(groeiFuncties());
    await db.alleClubs(); // 1 club
    await db.alleGebruikers(); // 1 gebruiker
}

/**
 * Het antwoord van de server bestaat uit synchroon en gevraagdeData. Zie api.js
 *
 * De browser gebruikt synchroon om te synchroniseren met de server
 * en geeft de gevraagdeData terug.
 * Eventueel zal synchroniseren synchroonBijwerken met synchroon van de server.
 *
 * Indien de server later was gestart dan de browser of de vorige server start
 * dan zijn alle antwoorden van de server in sessionStorage niet meer actueel en
 * verwijdert synchroniseren alle antwoorden in sessionStorage.
 *
 * synchroniseren vergelijkt de mutaties in synchroon met de antwoorden in sessionStorage.
 * Indien revisie van mutatie in synchroon > dan revisie van antwoord server in sessionStorage
 * dan is dat antwoord in sessionStorage niet meer actueel en verwijdert synchroniseren dat antwoord.
 * De antwoorden in sessionStorage die overblijven zijn allemaal actueel.
 *
 * In sessionStorage staan antwoorden die beginnen met revisie en daarna de gevraagdeData.
 *
 * @param antwoord van server
 * @returns [] gevraagdeData
 */
function synchroniseren(antwoord) {
    const synchroon = antwoord[0];
    if (synchroon.revisie > db.synchroon.revisie || synchroon.start > db.synchroon.start) {
        const juisteClub = `/${url.club}`;
        for (const key of Object.keys(sessionStorage)) {
            if (key.startsWith(juisteClub)) {
                sessionStorage.removeItem(key); // alle antwoorden zijn niet meer actueel
            }
        }
        synchroonBijwerken(synchroon);
    } else {
        for (const [key, value] of Object.entries(synchroon.mutaties)) {
            if (Number(value) > Number(sessionStorage.getItem(key)[0])) { // revisies vergelijken
                sessionStorage.removeItem(key); // niet actueel antwoord verwijderen
            }
        }
    }
    return antwoord.slice(1); // gevraagdeData
}

export function vraag(commando) {
    const vraagAanServer = vraagZoeken(commando);
    if (!vraagAanServer) {
        return Object.freeze({});
    }
    const specificatie = { // zie api.js
        uuid: "",
        revisie: 0,
        club: 0,        // clubCode
        seizoen: "",
        team: "",       // teamCode
        competitie: "", // TODO verwijderen
        ronde: 0,       // rondeNummer
        speler: 0,      // knsbNummer
        maand: 0,
        jaar: 0,
        csv: ""
    };

    function specificeren(object) {
        for (const [key, value] of Object.entries(object)) {
            if (key === "teamCode") {
                specificatie.team = value;
            } else if (key === "rondeNummer") {
                specificatie.ronde = value;
            } else if (key === "knsbNummer") {
                specificatie.speler = value;
            } else {
                specificatie[key] = value;
            }
        }
        return this;
    }

    function invullen() {
        return vraagAanServer
            .replace(":uuid", url.uuid) // uit localStorage zie html.js
            .replace(":revisie", db.synchroon.revisie) // meest recente revisie
            .replace(":club", url.club) // uit url zie html.js
            .replace(":seizoen", specificatie.seizoen)
            .replace(":team", specificatie.team)
            .replace(":competitie", specificatie.competitie)
            .replace(":ronde", specificatie.ronde)
            .replace(":speler", specificatie.speler)
            .replace(":maand", specificatie.maand)
            .replace(":jaar", specificatie.jaar)
            .replace(":csv", specificatie.csv);
    }

    const zonder = vraagAanServer.startsWith("/:uuid/:revisie")
        ? function (url) {
            return url.replace(/^(?:[^/]*\/){3}/, ""); // vanaf derde deel
        }
        : (vraagAanServer.startsWith("/:uuid") || vraagAanServer.startsWith("/:revisie"))
            ? function (url) {
                return url.replace(/^[^/]*\//, ""); // vanaf tweede deel
            }
            : function (url) { // vanaf eerste deel
                return url;
            };

    function afdrukken(tekst = "") {
        if (tekst) {
            console.log(`--- ${tekst} ---`);
        }
        console.log(vraagAanServer);
        console.log(specificatie);
        console.log(invullen());
        return this;
    }

    async function antwoorden() {
        const url = invullen();
        const key = zonder(url);
        const value = JSON.parse(sessionStorage.getItem(key));
        if (value) {
            return value.slice(1); // gevraagdeData zonder revisie
        } else {
            const antwoord = synchroniseren(await vraagServer(url));
            sessionStorage.setItem(key, JSON.stringify([db.synchroon.revisie, ...antwoord]));
            return antwoord;
        }
    }

    async function muteren() { // of andere actie op de server
        return synchroniseren(await vraagServer(invullen()));
    }

    return Object.freeze({
        specificeren, // (object) ->
        zonder,       // TODO alleen voor testen daarna verwijderen
        afdrukken,    // () ->
        antwoorden,   // ()
        muteren
    });
}

function vraagZoeken(commando) {
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
 * vraagServer maakt verbinding met de server
 *
 * @param url vraag aan de server
 * @returns {Promise<any>} antwoord van de server
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