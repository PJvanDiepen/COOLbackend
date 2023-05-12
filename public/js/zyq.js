// because this is a module, I'm strict by default

/*
kopie van const.js met export, zodat zyq.js een module is
 */

const LAAGSTE_RATING = 1000; // volgens Alkmaar Systeem
const HOOGSTE_RATING = 2000;

// teamCode
const INTERNE_COMPETITIE = "int";
const RAPID_COMPETTIE    = "ira";
const JEUGD_COMPETTIE    = "ije";
const SNELSCHAKEN        = "izs";
const ZWITSERS_TEST      = "izt";
const HALVE_COMPETITIE   = "ict";

export {
    LAAGSTE_RATING,
    HOOGSTE_RATING,
// teamCode
    INTERNE_COMPETITIE,
    RAPID_COMPETTIE,
    JEUGD_COMPETTIE,
    SNELSCHAKEN,
    ZWITSERS_TEST,
    HALVE_COMPETITIE
}

export function teamOfCompetitie(teamCode) {
    return teamCode === "" ? false : teamCode.substring(0,1) !== " ";
}

export function interneCompetitie(teamCode) {
    return teamCode === "" ? false : teamCode.substring(0,1) === "i";
}

export function zwitsers(teamCode) {
    return teamCode.substring(1,2) === "z";
}

export function teamVoluit(teamCode) { // TODO omschrijving uit database (eerst team en competitie uitsplitsen?)
    if (teamCode === INTERNE_COMPETITIE) {
        return "interne competitie";
    } else if (teamCode === RAPID_COMPETTIE) {
        return "rapid competitie";
    } else if (teamCode === SNELSCHAKEN) {
        return "einde seizoen snelschaken";
    } else if (teamCode === "kbe") {
        return o_o_o.vereniging + " KNSB bekerteam";
    } else if (teamCode === "nbe") {
        return o_o_o.vereniging + " NHSB bekerteam";
    } else if (!teamOfCompetitie(teamCode)) {
        return "geen";
    } else if (teamCode.substring(0,2) === "nv") {
        return o_o_o.vereniging + " V" + teamCode.substring(2);
    } else if (teamCode.substring(0,1) === "n") {
        return o_o_o.vereniging + " N" + teamCode.substring(1);
    } else {
        return o_o_o.vereniging + " " + teamCode;
    }
}

export function wedstrijdVoluit(ronde) {
    const eigenTeam = teamVoluit(ronde.teamCode);
    return ronde.uithuis === THUIS ? eigenTeam + " - " + ronde.tegenstander : ronde.tegenstander + " - " + eigenTeam;
}

// TODO import * db.js

// uitslag.partij
const AFWEZIG              = "a";
const EXTERNE_PARTIJ       = "e";
const INTERNE_PARTIJ       = "i";
const AGENDA               = "?"; // indien nog niet aanmelden of afzeggen bijvoorbeeld invaller vragen
const MEEDOEN              = "m"; // na aanmelden
const NIET_MEEDOEN         = "n"; // na afzeggen
const ONEVEN               = "o";
const REGLEMENTAIRE_REMISE = "r"; // vrijgesteld
const EXTERN_THUIS         = "t"; // na aanmelden voor externe partij thuis op dinsdag
const EXTERN_UIT           = "u"; // na aanmelden voor externe partij uit op dinsdag
const REGLEMENTAIR_VERLIES = "v";
const REGLEMENTAIRE_WINST  = "w";
const ONBEKEND             = "x"; // na wijzigen indeling
const WIT_TEGEN            = "y"; // na wijzigen indeling
const ZWART_TEGEN          = "z"; // na wijzigen indeling
// uitslag.witZwart
const WIT = "w";
const ZWART = "z";
// uitslag.resultaat
const REMISE = "½";
const WINST = "1";
const VERLIES = "0";
// uitslag.uithuis
const THUIS = "t";
const UIT = "u";

// score
const PUNTEN_UIT = " uit ";
// kop
const SCHEIDING = " \u232A ";
const VINKJE = "\u00a0\u00a0✔\u00a0\u00a0"; // met no break spaces
const STREEP = "___";
const KRUISJE = "\u00a0\u00a0✖\u00a0\u00a0"; // met no break spaces
const FOUTJE = "\u00a0\u00a0?\u00a0\u00a0"; // met no break spaces
const ZELFDE = "\u00a0\u00a0=\u00a0\u00a0"; // met no break spaces

const pagina = new URL(location);
const server = pagina.host.match("localhost") ? "http://localhost:3000" : "https://0-0-0.nl";
const params = pagina.searchParams;

// TODO verplaats naar db.js

const ditSeizoen = (function () {
    const datum = new Date();
    const i = datum.getFullYear() - (datum.getMonth() > 6 ? 2000 : 2001);
    return `${voorloopNul(i)}${voorloopNul(i + 1)}`;
})();

export {
// score
    PUNTEN_UIT,
// kop
    SCHEIDING,
    VINKJE,
    STREEP,
    KRUISJE,
    FOUTJE,
    ZELFDE,

    pagina,
    server,
    params,

    ditSeizoen
}

export function eindeSeizoen(seizoen) {
    return new Date(2000 + Number(seizoen.substring(2)), 6, 30);
}

export const o_o_o = {
    vereniging: "Waagtoren",
    seizoen: ditSeizoen,
    versie: 0, // versie is een getal
    competitie: "",
    team: "",
    speler: 0, // knsbNummer is een getal
    naam: ""
};

export function competitieTitel() {
    document.getElementById("competitie").innerHTML = o_o_o.vereniging + SCHEIDING + teamVoluit(o_o_o.competitie);
}

export const uuidActiveren = params.get("uuid");
export const vorigeSessie = localStorage.getItem(o_o_o.vereniging);
export const uuidToken = uuidCorrect(uuidActiveren || vorigeSessie);
export const gebruiker = {}; // gebruikerVerwerken

// TODO import * db.js

// gebruiker.mutatieRechten
const IEDEREEN = 0;
const GEREGISTREERD = 1;
const TEAMLEIDER = 2;
const BESTUUR = 3;
const WEDSTRIJDLEIDER = 8;
const BEHEERDER = 9;

// mutatie.invloed
const GEEN_INVLOED = 0;
const OPNIEUW_INDELEN = 1;
const NIEUWE_RANGLIJST = 2;

/**
 * Elke verwerking van een pagina van 0-0-0 begint met init(), eventueel competitieTitel() en het verwerken van mutaties.
 * Daarna pagina maken en mutaties markeren met gewijzigd() en meestal een menu().
 *
 * @returns {Promise<void>}
 */
export async function init() {
    console.log("zyq.init");
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
        await serverFetch("/activeer/" + uuidToken);
        volgendeSessie(uuidToken);
    }
    if (uuidToken) {
        const registratie = await localFetch("/gebruiker/" + uuidToken);
        gebruiker.knsbNummer = Number(registratie.knsbNummer);
        gebruiker.naam = registratie.naam;
        gebruiker.mutatieRechten = Number(registratie.mutatieRechten);
    } else {
        gebruiker.knsbNummer = 0;
        gebruiker.naam = "onbekend";
        gebruiker.mutatieRechten = 0;
    }
}

export function gebruikerFunctie(lid) {
    if (!lid.datumEmail) {
        return KRUISJE; // TODO eventueel verwijderen
    } else if (Number(lid.mutatieRechten) === GEREGISTREERD) {
        return datumLeesbaar({datum: lid.datumEmail});
    } else if (Number(lid.mutatieRechten) === BEHEERDER) {
        return "systeembeheerder";
    } else if (Number(lid.mutatieRechten) === WEDSTRIJDLEIDER) {
        return "wedstrijdleider";
    } else if (Number(lid.mutatieRechten) === TEAMLEIDER) {
        return "teamleider";
    } else if (Number(lid.mutatieRechten) === BESTUUR) {
        return "bestuur";
    } else {
        return "geen gebruiker"
    }
}

function uuidCorrect(uuid) {
    return /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi.test(uuid) ? uuid : "";
}

function volgendeSessie(json) {
    try {
        localStorage.setItem(o_o_o.vereniging, json);
    } catch (error) {
        console.error(error); // TODO per sessie fouten verzamelen?
    }
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
}

async function competitieBepalen() {
    if (!interneCompetitie(o_o_o.competitie)) {
        const ronden = await localFetch(`/ronden/intern/${o_o_o.seizoen}`);
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
    } else if (o_o_o.competitie === RAPID_COMPETTIE && o_o_o.versie === 0) {
        o_o_o.versie = 4;
    } else if (zwitsers(o_o_o.competitie) && o_o_o.versie === 0) {
        o_o_o.versie = 5; // Zwitsers systeem
    }
}

async function competitieRondenVerwerken() {
    o_o_o.ronde = [];
    o_o_o.vorigeRonde = 0;
    o_o_o.huidigeRonde = 0;
    const ronden = await localFetch(`/ronden/${o_o_o.seizoen}/${o_o_o.competitie}`);
    for (const ronde of ronden) {
        o_o_o.ronde[ronde.rondeNummer] = ronde;
        o_o_o.laatsteRonde = ronde.rondeNummer; // eventueel rondeNummer overslaan
        if (ronde.resultaten > 0) {
            o_o_o.vorigeRonde = ronde.rondeNummer;
        } else if (o_o_o.huidigeRonde === 0) {
            o_o_o.huidigeRonde = ronde.rondeNummer;
            if (await serverFetch( // actuele situatie
                `/indeling/${o_o_o.seizoen}/${o_o_o.competitie}/${o_o_o.laatsteRonde}`)) {
                o_o_o.ronde[o_o_o.huidigeRonde].resultaten = 0; // indeling zonder resultaten
            }
        }
    }
}

/**
 * menu() verwerkt alle menuKeuzes tot een select-menu met htmlOptie's en zet een eventListener klaar.
 *
 * Elke menuKeuze bestaat uit [ <minimumRechten>, <menuKeuze tekst>, <bijhorende functie> ].
 * Indien gebruiker niet voldoende mutatieRechten heeft, komt de menuKeuze niet in het menu.
 * Elke htmlOptie krijgt een tekst en een volgnummer.
 * Het volgnummer verwijst naar de bijbehorende functie in functies.
 *
 * De eventListener krijgt het volgnummer door en start de bijbehorende functie.
 *
 * @param menuKeuzes
 * @returns {Promise<void>}
 */
export async function menu(...menuKeuzes) {
    const acties = document.getElementById("menu");
    const startKeuzes = JSON.parse(sessionStorage.getItem("menu")); // menu van start pagina (in omgekeerde volgorde)
    for (const [minimumRechten, tekst, naarPagina] of startKeuzes) {
        if (!pagina.href.includes(naarPagina)) { // niet naar huidige pagina
            menuKeuzes.unshift([minimumRechten, tekst, function() {
                naarAnderePagina(naarPagina);
            }]);
        }
    }
    menuKeuzes.unshift([IEDEREEN, "\u2630"]); // hamburger bovenaan in het menu
    menuKeuzes.push([GEREGISTREERD, "systeembeheer", function () { // onderaan in het menu
        naarAnderePagina("beheer.html"); // TODO niet indien huidige pagina = beheer.html
    }]); // TODO naar documentatie voor deze pagina
    let functies = [];
    for (let [minimumRechten, tekst, functie] of menuKeuzes) {
        if (minimumRechten <= gebruiker.mutatieRechten) {
            acties.appendChild(htmlOptie(functies.length, tekst));
            functies.push(functie ? functie :
                function () {
                    console.log(tekst);
                });
        }
    }
    acties.addEventListener("input",
        function () {
            functies[acties.value]();
            acties.value = 0;
        });
}

export async function gewijzigd() {
    const laatsteMutaties = await serverFetch("/gewijzigd");
    return laatsteMutaties;
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

/*
TODO const html = {id1: , id2: } alle DOM elementen met id

https://stackoverflow.com/questions/59068548/how-to-get-all-of-the-element-ids-on-the-same-time-in-javascript
 */

export function htmlCheckbox(id, value, tekst) {
    const input = document.createElement("input");
    input.type = "checkbox";
    input.id = id;
    input.value = value;
    const label = document.createElement("label");
    label.appendChild(input);
    label.appendChild(htmlTekst(` ${tekst}`)); // spatie tussen checkbox en label
    return label;
}

export function htmlOptie(value, text) {
    const option = document.createElement("option");
    option.value = value;
    option.text = text;
    return option;
}

export function htmlTekst(tekst) {
    return tekst.nodeType === Node.ELEMENT_NODE ? tekst : document.createTextNode(tekst);
}

export function htmlFout(htmlNode, indien) {
    if (indien) {
        htmlNode.classList.add("fout");
    }
}

export function htmlVerwerkt(htmlNode, indien) {
    if (indien) {
        htmlNode.classList.add("verwerkt");
    }
}

export function htmlVet(htmlNode, indien) {
    if (indien) {
        htmlNode.classList.add("vet");
    }
}

export function htmlRij(...kolommen) {
    const tr = document.createElement("tr");
    kolommen.map(function (kolom) {
        const td = document.createElement("td");
        td.appendChild(htmlTekst(kolom));
        tr.appendChild(td);
    });
    return tr;
}

export function htmlLinkEnTerug(link, tekst) {
    const a = document.createElement("a");
    a.appendChild(htmlTekst(tekst));
    a.href = link;
    return a;
}

export function htmlLink(link, tekst) {
    const a = document.createElement("a");
    a.appendChild(htmlTekst(tekst));
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

export function naarZelfdePagina(parameters) {
    location.replace(pagina.pathname + (parameters ? "?" + parameters : ""));
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
export function datumSQL(jsonDatum, dagen) {
    const datum = jsonDatum ? new Date(jsonDatum) : new Date();
    if (dagen) {
        datum.setDate(datum.getDate() + dagen);
    }
    return `${datum.getFullYear()}-${voorloopNul(datum.getMonth()+1)}-${voorloopNul(datum.getDate())}`;
}

export function voorloopNul(getal) {
    return getal < 10 ? "0" + getal : getal;
}

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

export async function teamSelecteren(teamCode) {
    const teams = document.getElementById("teamSelecteren");
    (await localFetch("/teams/" + o_o_o.seizoen)).forEach(
        function (team) {
            if (teamOfCompetitie(team.teamCode)) {
                teams.appendChild(htmlOptie(team.teamCode, teamVoluit(team.teamCode)));
            }
        });
    teams.value = teamCode; // werkt uitsluitend na await
    teams.addEventListener("input", function () {
        if (interneCompetitie(teams.value)) {
            naarAnderePagina(`ranglijst.html?competitie=${teams.value}`);
        } else {
            naarAnderePagina(`team.html?team=${teams.value}`);
        }
    });
}

export async function rondeSelecteren(teamCode, rondeNummer) {
    o_o_o.team = o_o_o.competitie;
    const ronden = document.getElementById("rondeSelecteren");
    (await localFetch("/ronden/" + o_o_o.seizoen + "/" + teamCode)).forEach(
        function (ronde) {
            ronden.appendChild(htmlOptie(ronde.rondeNummer, datumLeesbaar(ronde) + SCHEIDING + "ronde " + ronde.rondeNummer));
        });
    ronden.appendChild(htmlOptie(0, ronden.length + " ronden"))
    ronden.value = rondeNummer ? rondeNummer : 0; // werkt uitsluitend na await
    ronden.addEventListener("input",
        function () {
            if (ronden.value) {
                naarAnderePagina(`ronde.html?ronde=${ronden.value}`);
            }
        });
}

/**
 * ranglijst geeft lijst totalen van eventueel geselecteerde spelers op volgorde van totalen
 *
 * @param rondeNummer in huidige competitie
 * @param selectie indien null dan alle spelers
 * @returns {Promise<*>}
 */
export async function ranglijst(rondeNummer, selectie) {
    const totDatum = rondeNummer === o_o_o.laatsteRonde ? eindeSeizoen(o_o_o.seizoen) : o_o_o.ronde[rondeNummer + 1].datum;
    let spelers = await localFetch(
        `/ranglijst/${o_o_o.seizoen}/${o_o_o.competitie}/${rondeNummer}/${datumSQL(totDatum)}/${o_o_o.versie}`);
    if (selectie) {
        spelers = spelers.filter(function (speler) {return selectie.includes(speler.knsbNummer)})
    }
    return spelers.map(spelerTotalen);
}

/*
totalen
[0] sorteer (3 posities eventueel voorloopnullen)
[1] prijs (0 = geen prijs, 1 = wel prijs)
[2] winstIntern (2 posities eventueel voorloopnul)
[3] winstExtern (2 posities eventueel voorloopnul)
[4] rating (4 posities eventueel voorloopnul)
[5] remiseIntern
[6] verliesIntern
[7] witIntern
[8] zwartIntern
[9] oneven
[10] afzeggingen
[11] aftrek
[12] totaal
[13] startPunten
[14] eigenWaardeCijfer
[15] remiseExtern
[16] verliesExtern
[17] witExtern
[18] zwartExtern
[19] partijenVerschil
tegenstanders met n = 0, 4, 8, enz.
[20 + n] rondeNummer
[21 + n] kleur (0 = wit, 1 = zwart)
[22 + n] tegenstander
[23 + n] resultaat (0 = verlies, 1 = remise, 2 = winst)
einde indien rondeNummer = 0

TODO spelerTotalen moeten compleet zijn tot een bepaalde datum en rondeNummer inclusief de tellingen, dat moet op server geregeld worden
 */
export function spelerTotalen(speler) {
    const knsbNummer = Number(speler.knsbNummer);
    const naam = speler.naam;
    const subgroep = speler.subgroep;
    const totalen = speler.totalen.split(" ").map(Number);

    let wp = 0;

    function weerstandsPuntenInvullen(weerstand) {
        wp = weerstand;
    }

    function weerstandsPunten() {
        return wp;
    }

    let sb = 0;

    function sonnebornBergerInvullen(weerstand) {
        sb = weerstand;
    }

    function sonnebornBerger() {
        return sb;
    }

    function punten() {
        return totalen[0];
    }

    function prijs() {
        return totalen[1];
    }

    function winnaarSubgroep(winnaars) {
        if (!intern()) {
            return "";
        } else if (!prijs()) { // indien geen recht op prijs
            return subgroep;
        } else if (winnaars[subgroep]) { // indien wel recht op prijs maar winnaar van subgroep al bekend
            return subgroep + "+";
        } else {
            winnaars[subgroep] = true; // winnaar subgroep
            return subgroep + "*";
        }
    }

    function rating() {
        return totalen[4];
    }

    function intern() {
        return totalen[2] + totalen[5] + totalen[6];
    }

    function scoreIntern() {
        return score(totalen[2],totalen[5],totalen[6]);
    }

    function percentageIntern() {
        return percentage(totalen[2],totalen[5],totalen[6]);
    }

    function saldoWitZwart() {
        return totalen[7] - totalen[8];
    }

    function oneven() {
        return totalen[9];
    }

    function afzeggingen() {
        return totalen[10];
    }

    function aftrek() {
        return - totalen[11];
    }

    function totaal() {
        return totalen[12];
    }

    function startPunten() {
        return totalen[13];
    }

    function eigenWaardeCijfer() {
        return totalen[14];
    }

    function extern() {
        return totalen[3] + totalen[15] + totalen[16];
    }

    function scoreExtern() {
        return score(totalen[3],totalen[15],totalen[16]);
    }

    function percentageExtern() {
        return percentage(totalen[3],totalen[15],totalen[16]);
    }

    function saldoWitZwartExtern() {
        return totalen[17] - totalen[18];
    }

    function partijenVerschil() {
        return totalen[19];
    }

    function tegen(tegenstander)  {
        const zelfdeTegenstander = vorigeKeer(tegenstander);
        if (zelfdeTegenstander) {
            afdrukken(tegenstander, totalen[zelfdeTegenstander + 1], `in ronde ${totalen[zelfdeTegenstander]}`);
            const partijenGeleden = laatsteKeer(tegenstander);
            if (partijenGeleden < partijenVerschil()) {
                console.log(`${naam} speelde ${partijenGeleden} partijen geleden tegen ${tegenstander.naam}`);
                return false; // indien minder dan partijenVerschil tegen gespeeld
            }
        }
        return true; // nog niet tegen gespeeld of mag nog een keer tegen spelen
    }

    function vorigeKeer(tegenstander) {
        let i = 20;
        let j = 0;
        while (totalen[i]) { // indien rondeNummer
            if (totalen[i + 2] === tegenstander.knsbNummer) { // indien zelfde tegenstander
                j = i;
            }
            i = i + 4; // volgende rondeNummer, kleur (0 = wit, 1 = zwart), knsbNummer en resultaat (0 = verlies, 1 = remise, 2 = winst)
        }
        return j; // vorigeKeer zelfde tegenstander of 0
    }

    function laatsteKeer(tegenstander) {
        let i = 20;
        let partijenGeleden = 1000;
        while (totalen[i]) { // indien rondeNummer
            if (totalen[i + 2] === tegenstander.knsbNummer) { // indien zelfde tegenstander
                partijenGeleden = 1;
        } else {
                partijenGeleden++;
        }
            i = i + 4; // volgende rondeNummer, kleur (0 = wit, 1 = zwart), knsbNummer en resultaat (0 = verlies, 1 = remise, 2 = winst)
        }
        return partijenGeleden; // laatsteKeer zelfde tegenstander was partijenGeleden of groter dan 1000
    }

    function vorigeKleur() {
        let i = 20;
        let kleur = -1;
        while (totalen[i]) { // indien rondeNummer
            kleur = totalen[i + 1];
            i = i + 4; // volgende rondeNummer, kleur (0 = wit, 1 = zwart), knsbNummer en resultaat (0 = verlies, 1 = remise, 2 = winst)
        }
        return kleur;
    }

    /**
     * metWit berekent welke kleur tegen tegenstander
     *
     * @param tegenstander totalen
     * @returns {boolean|*} indien wit anders zwart
     */
    function metWit(tegenstander) {
        const zelfdeTegenstander = vorigeKeer(tegenstander);
        if (zelfdeTegenstander) {
            return totalen[zelfdeTegenstander + 1] === 1 // wit indien vorige keer zwart = 1 tegen zelfdeTegenstander
        }
        if (saldoWitZwart() !== tegenstander.saldoWitZwart()) { // wit indien vaker met zwart
            return afdrukken(tegenstander, saldoWitZwart() < tegenstander.saldoWitZwart(), "wegens wit-zwart");
        }
        const kleur = vorigeKleur();
        if (kleur !== tegenstander.vorigeKleur()) { // wit indien vorige kleur zwart en vorige kleur tegenstander wit
            return afdrukken(tegenstander, kleur === 1, "wegens vorige kleur");
        } else if (totaal() !== tegenstander.totaal()) { // wit indien minder punten
            return afdrukken(tegenstander, totaal() < tegenstander.totaal(), "wegens punten");
        } else { // wit indien lagere rating
            return afdrukken(tegenstander, rating() < tegenstander.rating(), "wegens rating");
        }
    }

    function afdrukken(tegenstander, kleur, wegens) {
        console.log(`${naam} met ${kleur ? "wit" : "zwart"} tegen ${tegenstander.naam} ${wegens}`);
        return kleur;
    }

    return Object.freeze({ // Zie blz. 17.1 Douglas Crockford: How JavaScript Works
        knsbNummer,
        naam,
        subgroep,
        totalen,
        rating,
        intern,
        weerstandsPuntenInvullen,
        weerstandsPunten,
        sonnebornBergerInvullen,
        sonnebornBerger,
        punten,
        prijs,
        winnaarSubgroep,
        scoreIntern,
        percentageIntern,
        saldoWitZwart,
        oneven,
        afzeggingen,
        aftrek,
        totaal,
        startPunten,
        eigenWaardeCijfer,
        extern,
        scoreExtern,
        percentageExtern,
        saldoWitZwartExtern,
        partijenVerschil,
        tegen,
        vorigeKleur,
        metWit
    });
}

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
where uitslag.seizoen = @seizoen and uitslag.teamCode = @teamCode
order by uitslag.seizoen, uitslag.rondeNummer, uitslag.bordNummer;
 */
export async function uitslagenTeamAlleRonden(teamCode) {
    const rondeUitslagen = [];
    (await localFetch("/ronden/" + o_o_o.seizoen + "/" + teamCode)).forEach(
        function (ronde) {
            rondeUitslagen[ronde.rondeNummer - 1] = {ronde: ronde, winst: 0, remise: 0, verlies: 0, uitslagen: []};
        });
    (await localFetch("/team/" + o_o_o.seizoen + "/" + teamCode)).forEach(
        function (u) {
            const rondeUitslag = rondeUitslagen[u.rondeNummer - 1];
            if (u.resultaat === WINST) {
                rondeUitslag.winst += 1;
            } else if (u.resultaat === REMISE) {
                rondeUitslag.remise += 1;
            } else if (u.resultaat === VERLIES) {
                rondeUitslag.verlies += 1;
            }
            rondeUitslag.uitslagen.push(htmlRij(u.bordNummer, naarSpeler(u), u.witZwart, u.resultaat));
        });
    return rondeUitslagen;
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
            return !isNaN(datum)
        }
    }
    return false;
}