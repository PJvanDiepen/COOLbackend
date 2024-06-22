// because this is a module, I'm strict by default

// teamCode
const INTERNE_COMPETITIE = "int";
const RAPID_COMPETITIE = "ira";
const JEUGD_COMPETITIE = "ije";
const JEUGD_COMPETITIE_VOORJAAR = "ijv";
const SNELSCHAKEN = "izs";

// TODO teamVoluit(clubCode, teamCode)

export function teamVoluit(teamCode) { // TODO omschrijving uit database (eerst team en competitie uitsplitsen?)
    if (teamCode === INTERNE_COMPETITIE) {
        return "interne competitie";
    } else if (teamCode === RAPID_COMPETITIE) {
        return "rapid competitie";
    } else if (teamCode === JEUGD_COMPETITIE) {
        return "jeugd competitie";
    } else if (teamCode === JEUGD_COMPETITIE_VOORJAAR) {
        return "jeugd voorjaarscompetitie";
    } else if (teamCode === SNELSCHAKEN) {
        return "einde seizoen snelschaken";
    } else if (teamCode === "0") {
        return "KNSB bij andere schaakvereniging";
    } else if (teamCode === "n0") {
        return "NHSB bij andere schaakvereniging";
    } else if (teamCode === "kbe") {
        return o_o_o.vereniging + " KNSB beker";
    } else if (teamCode === "nbe") {
        return o_o_o.vereniging + " NHSB beker";
    } else if (teamCode === "nbz") {
        return o_o_o.vereniging + " NHSB beker (zilver)";
    } else if (teamCode === "nbb") {
        return o_o_o.vereniging + " NHSB beker (brons)";
    } else if (teamCode === "" || teamCode.substring(0,1) === " ") {
        return "geen";
    } else if (teamCode.substring(0,2) === "nv") {
        return o_o_o.vereniging + " v" + teamCode.substring(2);
    } else if (teamCode.substring(0,1) === "n") {
        return o_o_o.vereniging + " n" + teamCode.substring(1);
    } else {
        return o_o_o.vereniging + " " + teamCode;
    }
}

export function wedstrijdVoluit(ronde) {
    const eigenTeam = teamVoluit(ronde.teamCode);
    return ronde.uithuis === THUIS ? eigenTeam + " - " + ronde.tegenstander : ronde.tegenstander + " - " + eigenTeam;
}

// uitslag.resultaat
const REMISE = "½";
// uitslag.uithuis
const THUIS = "t";

const pagina = new URL(location);
const server = pagina.host.match("localhost") ? "http://localhost:3000" : "https://0-0-0.nl";
const params = pagina.searchParams;

// TODO deze is voor club = 0, andere versie voor club = 1

export const ditSeizoen = (function () { // TODO verschillen tussen Waagtoren en Jeugd
    const datum = new Date();
    const i = datum.getFullYear() - (datum.getMonth() > 6 ? 2000 : 2001);
    return `${voorloopNul(i)}${voorloopNul(i + 1)}`;
})();

export function eindeSeizoen(seizoen) {
    return new Date(2000 + Number(seizoen.substring(2)), 6, 30);
}

export const o_o_o = {
    vereniging: "Waagtoren",
    club: 0, // clubCode is een getal
    seizoen: ditSeizoen,
    versie: 0, // versie is een getal
    competitie: INTERNE_COMPETITIE, // zie competitieBepalen()
    team: INTERNE_COMPETITIE,
    speler: 0, // knsbNummer is een getal
    naam: ""
};

const SCHEIDING = " \u232A ";
export function competitieTitel() {
    document.getElementById("competitie").textContent = // TODO html.id()
        `${o_o_o.vereniging}${SCHEIDING}${teamVoluit(o_o_o.competitie)}`;
}

export const uuidActiveren = params.get("uuid");
if (uuidActiveren === "wissen") {
    localStorage.clear();
}
export const vorigeSessie = localStorage.getItem(o_o_o.vereniging);
export const uuidToken = uuidCorrect(uuidActiveren || vorigeSessie);
export const gebruiker = {}; // gebruikerVerwerken

/**
 * Elke verwerking van een pagina van 0-0-0 begint met init(), eventueel competitieTitel() en het verwerken van mutaties.
 * Daarna pagina maken en mutaties markeren met gewijzigd() en meestal een menu().
 *
 * @returns {Promise<void>}
 */
export async function init() {
    await gebruikerVerwerken();
    urlVerwerken();
    await competitieBepalen();
    versieBepalen();
    await competitieRondenVerwerken();
}

/**
 * Bestuur vult e-mail in voor gebruiker. 0-0-0 genereert 0-0-0 een uuid om de gebruiker te herkennen.
 * De gebruiker krijgt uuid via email, moet uuidActiveren en legt uuid vast in localStorage.
 * gebruikerVerwerken geeft de uuid van een geregistreerde gebruiker om knsbNummer, naam en mutatieRechten van gebruiker te lezen.
 *
 * Indien de gebruiker tijdens een vorigeSessie zich niet heeft geregistreerd,
 * leest gebruikerVerwerken gegevens van een onbekende gebruiker met knsbNummer = 0 en mutatieRechten = 0.
 *
 * @returns {Promise<void>}
 */
async function gebruikerVerwerken() {
    if (uuidActiveren && uuidActiveren === uuidToken) {
        await serverFetch(`/${uuidToken}/activeer`);
        localStorage.setItem(o_o_o.vereniging, uuidToken);
    }
    if (uuidToken) {
        const registratie = await localFetch(`/${uuidToken}/gebruiker`);
        gebruiker.knsbNummer = Number(registratie.knsbNummer);
        gebruiker.naam = registratie.naam;
        gebruiker.mutatieRechten = Number(registratie.mutatieRechten);
        gebruiker.email = registratie.email;
    } else {
        gebruiker.knsbNummer = 0;
        gebruiker.naam = "onbekend";
        gebruiker.mutatieRechten = 0;
        gebruiker.email = "";
    }
}

function uuidCorrect(uuid) {
    return /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi.test(uuid) ? uuid : "";
}

function urlVerwerken() {
    for (let [key, value] of Object.entries(o_o_o)) {
        let parameter = params.get(key); // inlezen van url
        if (parameter) {
            sessionStorage.setItem(key, parameter); // opslaan voor sessie
        } else {
            parameter = sessionStorage.getItem(key); // inlezen van sessie
        }
        if (parameter) {
            o_o_o[key] = value === 0 ? Number(parameter) : parameter; // indien 0 dan getal anders tekst
        }
    }
    if (o_o_o.club === 1) {
        o_o_o.seizoen = "2401";
        o_o_o.competitie = "ije";
    }
}

async function competitieBepalen() {
    if (o_o_o.competitie.substring(0,1) !== "i") { // TODO vervangen door db.isCompetitie
        const ronden = await localFetch(`/${o_o_o.club}/${o_o_o.seizoen}/ronden/intern`);
        const vandaag = datumSQL();
        for (const ronde of ronden) {
            if (datumSQL(ronde.datum) >= vandaag) {
                o_o_o.competitie = ronde.teamCode;
                return;
            }
        }
    }
}

function versieBepalen() {
    // TODO lees tabel reglement: versie, omschrijving en tabel versie: seizoen / competitie -->
    if (o_o_o.competitie === INTERNE_COMPETITIE && o_o_o.versie === 0) {
        if (o_o_o.seizoen === "1819" || o_o_o.seizoen === "1920" || o_o_o.seizoen === "2021") {
            o_o_o.versie = 2;
        } else {
            o_o_o.versie = 3; // vanaf seizoen 2021-2022
        }
    } else if (o_o_o.competitie === RAPID_COMPETITIE && o_o_o.versie === 0) {
        o_o_o.versie = 4;
    } else if (o_o_o.competitie.substring(1,2) === "z" && o_o_o.versie === 0) {
        o_o_o.versie = 5; // Zwitsers systeem
    } else if (o_o_o.competitie === JEUGD_COMPETITIE && o_o_o.versie === 0) {
        o_o_o.versie = 6;
    } else if (o_o_o.competitie === JEUGD_COMPETITIE_VOORJAAR && o_o_o.versie === 0) {
        o_o_o.versie = 6;
    }
}

async function competitieRondenVerwerken() {
    console.log("--- begin competitieRondenVerwerken() ---");
    o_o_o.ronde = [];
    o_o_o.vorigeRonde = 0;
    o_o_o.huidigeRonde = 0;
    const ronden = await localFetch(`/${o_o_o.club}/${o_o_o.seizoen}/${o_o_o.competitie}/ronden`);
    console.log(ronden);
    for (const ronde of ronden) {
        o_o_o.ronde[ronde.rondeNummer] = ronde;
        o_o_o.laatsteRonde = ronde.rondeNummer; // eventueel rondeNummer overslaan
        if (ronde.resultaten > 0) {
            o_o_o.vorigeRonde = ronde.rondeNummer;
        } else if (o_o_o.huidigeRonde === 0) {
            o_o_o.huidigeRonde = ronde.rondeNummer;
            if (await serverFetch( // actuele situatie
                `/${o_o_o.club}/${o_o_o.seizoen}/${o_o_o.competitie}/${o_o_o.laatsteRonde}/indeling`)) {
                o_o_o.ronde[o_o_o.huidigeRonde].resultaten = 0; // indeling zonder resultaten
            }
        }
    }
}

/**
 * localFetch optimaliseert de verbinding met de database op de server
 * door het antwoord van de server ook lokaal op te slaan
 *
 * @param url de vraag aan de database op de server
 * @returns {Promise<any>} het antwoord van de server
 */
export async function localFetch(url) {
    let object = JSON.parse(sessionStorage.getItem(url));
    if (!object) {
        object = await serverFetch(url);
        sessionStorage.setItem(url, JSON.stringify(object));
    }
    return object;
}

/**
 * serverFetch maakt verbinding met de database voor actuele situatie
 *
 * @param url de vraag aan de database op de server
 * @returns {Promise<any>} het antwoord van de server
 */
export async function serverFetch(url) {
    try {
        const response = await fetch(server + url);
        if (response.ok) {
            return await response.json();
        } else {
            console.log(`--- serverFetch ---`);
            console.log(response);
            return false;
        }
    } catch (error) {
        console.log(`--- serverFetch error ---`);
        console.error(error);
    }
}

export function htmlVet(htmlNode, indien) {
    if (indien) {
        htmlNode.classList.add("vet");
    }
}

export function htmlLinkEnTerug(link, tekst) {
    const a = document.createElement("a");
    a.append(tekst);
    a.href = link;
    return a;
}

export function htmlLink(link, tekst) {
    const a = document.createElement("a");
    a.append(tekst);
    a.href = "";
    a.addEventListener("click", function (event) {
        event.preventDefault();
        naarAnderePagina(link);
    });
    return a;
}

export function naarAnderePagina(naarPagina) { // pagina en parameters
    location.replace(pagina.pathname.replace(/\w+.html/, naarPagina));
}

export function naarSpeler(speler) {
    const link = htmlLinkEnTerug(`speler.html?team=${o_o_o.competitie}&speler=${speler.knsbNummer}&naam=${speler.naam}`, speler.naam);
    htmlVet(link, speler.knsbNummer === gebruiker.knsbNummer);
    return link;
}

export function naarTeam(uitslag) {
    return htmlLink(`team.html?team=${uitslag.teamCode}#ronde${uitslag.rondeNummer}`, wedstrijdVoluit(uitslag));
}

export function seizoenVoluit(seizoen) {
    if (seizoen.substring(2,4) === "ra") { // TODO verwijderen?
        return `rapid 20${seizoen.substring(0,2)}-20${voorloopNul(Number(seizoen.substring(0,2)))}`;
    } else {
        return `20${seizoen.substring(0,2)}-20${seizoen.substring(2,4)}`;
    }
}

export function tijdGeleden(jsonDatum) {
    const seconden = (new Date() - new Date(jsonDatum)) / 1000;
    if (seconden < 60) {
        return Math.round(seconden) + " sec";
    }
    const minuten = seconden / 60;
    if (minuten < 60) {
        return Math.round(minuten) + " min";
    }
    const uren = minuten / 60;
    if (uren < 24) {
        return Math.round(uren) + " uur";
    }
    const dagen = uren / 24;
    if (dagen < 2) {
        return "1 dag";
    } else if (dagen < 7) {
        return Math.round(dagen) + " dagen";
    }
    const weken = dagen / 7;
    if (weken < 2) {
        return "1 week";
    } else if (dagen < 365) {
        return Math.round(weken) + " weken";
    } else {
        return "langer dan 1 jaar";
    }
}

export function datumLeesbaar(object) {
    const datum = new Date(object.datum);
    return `${voorloopNul(datum.getDate())}-${voorloopNul(datum.getMonth()+1)}-${datum.getFullYear()}`;
}

/**
 * datumSQL maakt datum, die geschikt is voor SQL om door te geven aan de backend
 * indien er een gegeven datum is, moet het een jsonDatum zijn die komt van de backend
 * indien geen er geen datum of null is, wordt de datum vandaag
 *
 * @param jsonDatum of vandaag
 * @param dagen optellen bij gegeven datum
 * @returns {string} jjjj-mm-dd evenetueel met voorloopNul voor maand en dag
 */
export function datumSQL(jsonDatum = null, dagen = 0) {
    const datum = jsonDatum ? new Date(jsonDatum) : new Date();
    if (dagen) {
        datum.setDate(datum.getDate() + dagen);
    }
    return `${datum.getFullYear()}-${voorloopNul(datum.getMonth()+1)}-${voorloopNul(datum.getDate())}`;
}

export function voorloopNul(getal) {
    return getal < 10 ? "0" + getal : getal;
}

const PUNTEN_UIT = " uit ";
export function score(winst, remise, verlies) {
    const partijen = winst + remise + verlies;
    if (partijen) {
        while (remise >= 2) {
            winst += 1;
            remise -= 2;
        }
        if (remise === 0) {
            return winst + PUNTEN_UIT + partijen;
        } else if (winst === 0) {
            return REMISE + PUNTEN_UIT + partijen;
        } else {
            return winst + REMISE + PUNTEN_UIT + partijen;
        }
    } else {
        return "";
    }
}

export function wedstrijdUitslag(winst, remise, verlies) {
    while (remise >= 2) {
        winst += 1;
        verlies += 1;
        remise -= 2;
    }
    if (winst === 0 && remise === 0 && verlies === 0) {
        return "";
    } else if (remise === 0) {
        return winst + " - " + verlies;
    } else if (winst === 0) {
        return REMISE + " - " + verlies + REMISE;
    } else if (verlies === 0) {
        return winst + REMISE + " - " + REMISE;
    } else {
        return winst + REMISE + " - " + verlies + REMISE;
    }
}

export function uitslagTeam(uithuis, winst, verlies, remise) {
    return uithuis === THUIS ? wedstrijdUitslag(winst, remise, verlies) : wedstrijdUitslag(verlies, remise, winst);
}

export function percentage(winst, remise, verlies) {
    const partijen = winst + remise + verlies;
    if (partijen) {
        return (100 * (winst + remise / 2) / partijen).toFixed() + "%";
    } else {
        return "";
    }
}

export function backupSQL(tabel, rijen) {
    let velden = [];
    for (const [key, value] of Object.entries(rijen[0])) {
        velden.push(key);
    }
    let tekst = `insert into ${tabel} (${velden.join(", ")}) values\n`;
    for (let i = 0; i < rijen.length; i++) {
        let kolommen = [];
        for (const [key, value] of Object.entries(rijen[i])) {
            kolommen.push(valueSQL(key, value));
        }
        tekst += `(${kolommen.join(", ")})${i === rijen.length - 1 ? ";" : ","}\n`; // afsluiten met ;
    }
    console.log(tekst);
}

function valueSQL(key, value) {
    if (typeof value === "number") { // number zonder quotes
        return value;
    } else if (typeof value !== "string") {
        return "???";
    } else if (key === "datum" && jsonDate(value)) {
        return `'${datumSQL(value)}'`; // datum met enkele quotes
    } else {
        return JSON.stringify(value); // string met dubbele quotes
    }
}

export function jsonDate(jsonDatum) {
    if (jsonDatum.length > 10) {
        const datum = new Date(jsonDatum);
        if (datum instanceof Date) {
            return !isNaN(datum);
        }
    }
    return false;
}