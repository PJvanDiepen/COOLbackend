"use strict";

// teamCode
const INTERNE_COMPETITIE = "int";
const RAPID_COMPETTIE    = "ira";
const JEUGD_COMPETTIE    = "ije";

function interneCompetitie(teamCode) {
    return teamCode.substring(0,1) === "i";
}

// uitslag.partij
const AFWEZIG              = "a";
const EXTERNE_PARTIJ       = "e";
const INTERNE_PARTIJ       = "i";
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

const pagina = new URL(location);
const server = pagina.host.match("localhost") ? "http://localhost:3000" : "https://0-0-0.nl";
const params = pagina.searchParams;

const ditSeizoen = (function () {
    const datum = new Date();
    const i = datum.getFullYear() - (datum.getMonth() > 6 ? 2000 : 2001);
    return `${voorloopNul(i)}${voorloopNul(i + 1)}`;
})();

function eindeSeizoen(seizoen) {
    return new Date(2000 + Number(seizoen.substring(2)), 6, 30);
}

const competitie = (function () {
    const competitie = {
        vereniging: "Waagtoren",
        seizoen: ditSeizoen,
        versie: 0, // versie is een getal
        competitie: INTERNE_COMPETITIE,
        team: INTERNE_COMPETITIE,
        speler: 0, // knsbNummer is een getal
        naam: "onbekend"};
    for (let [key, value] of Object.entries(competitie)) {
        let parameter = params.get(key); // inlezen van url
        if (parameter) {
            sessionStorage.setItem(key, parameter); // opslaan voor sessie
        } else {
            parameter = sessionStorage.getItem(key); // inlezen van sessie
        }
        if (parameter) {
            competitie[key] = value === 0 ? Number(parameter) : parameter; // indien 0 dan getal anders tekst
        }
    }
    // TODO lees tabel reglement: verie, omschrijving en tabel versie: seizoen / competitie -->
    if (competitie.competitie === INTERNE_COMPETITIE && competitie.versie === 0 && competitie.seizoen === "2122") {
        competitie.versie = 3;
    } else if (competitie.competitie === INTERNE_COMPETITIE && competitie.versie === 0) {
        competitie.versie = 2;
    } else {
        competitie.versie = 4; // rapid competitie
    }
    return competitie;
})();

function competitieTitel() {
    document.getElementById("competitie").innerHTML = competitie.vereniging + SCHEIDING + teamVoluit(competitie.competitie);
}

const uuidActiveren = params.get("uuid");
const vorigeSessie = localStorage.getItem(competitie.vereniging);
const uuidToken = uuidCorrect(uuidActiveren || vorigeSessie);
const gebruiker = {}; // gebruikerVerwerken
// gebruiker.mutatieRechten
const GEEN_LID = 0;
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
async function init() {
    await gebruikerVerwerken();
    await rondenVerwerken();
}

/**
 * 0-0-0 genereert een uuid om de gebruiker te herkennen.
 * De gebruiker krijgt uuid via email, moet uuidActiveren en legt uuid vast in localStorage.
 * gebruikerVerwerken geeft de uuid van een geregistreerde gebruiker om knsbNummer, naam en mutatieRechten van gebruiker te lezen.
 *
 * De gebruiker moet een uuid aanvragen door zich te registreren.
 * Bij het registreren tijdens een vorigeSessie zijn knsbNummer, naam en email vastgelegd in localStorage.
 * In een volgende sessie leest gebruikerVerwerken deze gegevens met mutatieRechten = 0.
 * 0-0-0 herkent de gebruiker nog niet, maar ziet dat een aanvraag in behandeling is.
 *
 * Indien de gebruiker tijdens een vorigeSessie zich niet heeft geregistreert,
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
        gebruiker.email = ""; // 0-0-0 stuurt geen email
        gebruiker.mutatieRechten = Number(registratie.mutatieRechten);
    } else if (vorigeSessie) {
        const json = JSON.parse(vorigeSessie);
        gebruiker.knsbNummer = Number(json.knsbNummer);
        gebruiker.naam = json.naam;
        gebruiker.email = json.email;
        gebruiker.mutatieRechten = 0;
    } else {
        gebruiker.knsbNummer = 0;
        gebruiker.naam = "onbekend";
        gebruiker.email = "";
        gebruiker.mutatieRechten = 0;
    }
}

function uuidCorrect(uuid) {
    return /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi.test(uuid) ? uuid : "";
}

function volgendeSessie(json) {
    try {
        localStorage.setItem(competitie.vereniging, json);
    } catch (error) {
        console.error(error); // TODO per sessie fouten verzamelen?
    }
}

async function rondenVerwerken() {
    competitie.ronde = [];
    competitie.vorigeRonde = 0;
    competitie.huidigeRonde = 0;
    const ronden = await localFetch(`/ronden/${competitie.seizoen}/${competitie.team}`);
    for (const ronde of ronden) {
        competitie.ronde[ronde.rondeNummer] = ronde;
        competitie.laatsteRonde = ronde.rondeNummer; // eventueel rondeNummer overslaan
        if (ronde.resultaten > 0) {
            competitie.vorigeRonde = ronde.rondeNummer;
        } else if (competitie.huidigeRonde === 0) {
            competitie.huidigeRonde = ronde.rondeNummer;
            if (await serverFetch( // actuele situatie
                `/indeling/${competitie.seizoen}/${competitie.team}/${competitie.laatsteRonde}`)) {
                competitie.ronde[competitie.huidigeRonde].resultaten = 0; // indeling zonder resultaten
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
async function menu(...menuKeuzes) {
    const acties = document.getElementById("menu");
    acties.appendChild(htmlOptie(0, "\u2630 menu")); // hamburger
    let functies = [function () {
    }];
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

async function gewijzigd() {
    const laatsteMutaties = await serverFetch("/gewijzigd");
    // console.log("/gewijzigd");
    // console.log(laatsteMutaties);
    return laatsteMutaties;
}

/**
 * localFetch optimaliseert de verbinding met de database op de server
 * door het antwoord van de server ook lokaal op te slaan
 *
 * @param url de vraag aan de database op de server
 * @returns {Promise<any>} het antwoord van de server
 */
async function localFetch(url) {
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
async function serverFetch(url) {
    try {
        const response = await fetch(server + url);
        return await response.json();
    } catch (error) {
        console.error(error); // TODO per sessie fouten verzamelen?
    }
}

function htmlOptie(value, text) {
    const option = document.createElement("option");
    option.value = value;
    option.text = text;
    return option;
}

function htmlTekst(tekst) {
    return tekst.nodeType === Node.ELEMENT_NODE ? tekst : document.createTextNode(tekst);
}

function htmlVerwerkt(htmlNode, toevoegen) {
    if (toevoegen) {
        htmlNode.classList.add("verwerkt")
    }
}

function htmlVet(htmlNode, toevoegen) {
    if (toevoegen) {
        htmlNode.classList.add("vet")
    }
}

function htmlRij(...kolommen) {
    const tr = document.createElement("tr");
    kolommen.map(function (kolom) {
        const td = document.createElement("td");
        td.appendChild(htmlTekst(kolom));
        tr.appendChild(td);
    });
    return tr;
}

function htmlLink(link, tekst) {
    const a = document.createElement("a");
    a.appendChild(htmlTekst(tekst));
    a.href = "";
    a.addEventListener("click", function (event) {
        event.preventDefault();
        naarAnderePagina(link);
    });
    return a;
}

function naarAnderePagina(naarPagina) { // pagina en parameters
    location.replace(pagina.pathname.replace(/\w+.html/, naarPagina));
}

function naarZelfdePagina(parameters) {
    location.replace(pagina.pathname + (parameters ? "?" + parameters : ""));
}

function naarSpeler(speler) {
    const link = htmlLink(`speler.html?team=${competitie.competitie}&speler=${speler.knsbNummer}&naam=${speler.naam}`, speler.naam);
    htmlVet(link, speler.knsbNummer === gebruiker.knsbNummer);
    return link;
}

function naarTeam(uitslag) {
    return htmlLink(`team.html?team=${uitslag.teamCode}#ronde${uitslag.rondeNummer}`, wedstrijdVoluit(uitslag));
}

function seizoenVoluit(seizoen) {
    if (seizoen.substring(2,4) === "ra") {
        return `rapid 20${seizoen.substring(0,2)}-20${voorloopNul(Number(seizoen.substring(0,2)))}`;
    } else {
        return `20${seizoen.substring(0,2)}-20${seizoen.substring(2,4)}`;
    }
}

function tijdGeleden(jsonDatum) {
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

function datumLeesbaar(object) {
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
function datumSQL(jsonDatum, dagen) {
    const datum = jsonDatum ? new Date(jsonDatum) : new Date();
    if (dagen) {
        datum.setDate(datum.getDate() + dagen);
    }
    return `${datum.getFullYear()}-${voorloopNul(datum.getMonth()+1)}-${voorloopNul(datum.getDate())}`;
}

function voorloopNul(getal) {
    return getal < 10 ? "0" + getal : getal;
}

function teamVoluit(teamCode) { // TODO omschrijving uit database
    if (teamCode === INTERNE_COMPETITIE) {
        return "interne competitie";
    } else if (teamCode === RAPID_COMPETTIE) {
        return "rapid competitie";
    } else if (teamCode === "kbe") {
        return competitie.vereniging + " KNSB bekerteam";
    } else if (teamCode === "nbe") {
        return competitie.vereniging + " NHSB bekerteam";
    } else {
        return competitie.vereniging + " " + teamCode;
    }
}

function wedstrijdVoluit(ronde) {
    const eigenTeam = teamVoluit(ronde.teamCode);
    return ronde.uithuis === THUIS ? eigenTeam + " - " + ronde.tegenstander : ronde.tegenstander + " - " + eigenTeam;
}

function score(winst, remise, verlies) {
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

function wedstrijdUitslag(winst, remise, verlies) {
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

function uitslagTeam(uithuis, winst, verlies, remise) {
    return uithuis === THUIS ? wedstrijdUitslag(winst, remise, verlies) : wedstrijdUitslag(verlies, remise, winst);
}

function percentage(winst, remise, verlies) {
    const partijen = winst + remise + verlies;
    if (partijen) {
        return (100 * (winst + remise / 2) / partijen).toFixed() + "%";
    } else {
        return "";
    }
}

async function teamSelecteren(teamCode) {
    const teams = document.getElementById("teamSelecteren");
    (await localFetch("/teams/" + competitie.seizoen)).forEach(
        function (team) {
            teams.appendChild(htmlOptie(team.teamCode, teamVoluit(team.teamCode)));
        });
    teams.value = teamCode; // werkt uitsluitend na await
    teams.addEventListener("input", function () {
        if (interneCompetitie(teams.value)) {
            naarAnderePagina("ranglijst.html?team=" + teams.value);
        } else {
            naarAnderePagina("team.html?team=" + teams.value);
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
async function ranglijst(rondeNummer, selectie) {
    const totDatum = rondeNummer === competitie.laatsteRonde ? eindeSeizoen(competitie.seizoen) : competitie.ronde[rondeNummer + 1].datum;
    let spelers = await localFetch(
        `/ranglijst/${competitie.seizoen}/${competitie.competitie}/${rondeNummer}/${datumSQL(totDatum)}/${competitie.versie}`);
    if (selectie) {
        spelers = spelers.filter(function (speler) {return selectie.includes(speler.knsbNummer)})
    }
    return spelers.map(spelerTotalen);
}

/*
totaal
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
[19] rondenVerschil
tegenstanders met n = 0, 1, 2, enz.
[20 + n] rondeNummer
[21 + n] kleur (1 = wit, 0 = zwart)
[22 + n] tegenstander
einde indien rondeNummer = 0
[20 + n] rondeNummer = 0
[21 + n] knsbNummer
verboden tegenstanders met  m = 1, 2, 3, enz.
[22 + n + m] tegenstander
 */
function spelerTotalen(speler) {
    const knsbNummer = Number(speler.knsbNummer);
    const naam = speler.naam;
    const subgroep = speler.subgroep;
    const totaal = speler.totalen.split(" ").map(Number);

    function inRanglijst() {
        return totaal[0];
    }

    function punten() {
        if (!intern()) {
            return "";
        } else {
            return totaal[0];
        }
    }

    function winnaarSubgroep(winnaars) {
        if (!intern()) {
            return "";
        } else if (winnaars[subgroep]) { // indien winnaar van subgroep al bekend
            return subgroep;
        } else if (totaal[1]) { // indien recht op prijs dan is dit winnaar van de subgroep
            winnaars[subgroep] = true;
            return subgroep + "*"; // winnaar
        } else {
            return subgroep + "-"; // geen recht op prijs
        }
    }

    function rating() {
        return totaal[4];
    }

    function intern() {
        return totaal[2] + totaal[5] + totaal[6];
    }

    function scoreIntern() {
        return score(totaal[2],totaal[5],totaal[6]);
    }

    function percentageIntern() {
        return percentage(totaal[2],totaal[5],totaal[6]);
    }

    function saldoWitZwart() {
        return totaal[7] - totaal[8];
    }

    function oneven() {
        return totaal[9];
    }

    function afzeggingen() {
        return totaal[10];
    }

    function aftrek() {
        return - totaal[11];
    }

    function zonderAftrek() {
        return totaal[12] + totaal[13];
    }

    function startPunten() {
        return totaal[13];
    }

    function eigenWaardeCijfer() {
        return totaal[14];
    }

    function extern() {
        return totaal[3] + totaal[15] + totaal[16];
    }

    function scoreExtern() {
        return score(totaal[3],totaal[15],totaal[16]);
    }

    function percentageExtern() {
        return percentage(totaal[3],totaal[15],totaal[16]);
    }

    function saldoWitZwartExtern() {
        return totaal[17] - totaal[18];
    }

    function rondenVerschil() {
        return totaal[19];
    }

    function vorigeKeer(tegenstander) {
        let i = 20;
        let j = 0;
        while (totaal[i]) { // indien rondeNummer
            if (totaal[i + 2] === tegenstander.knsbNummer) { // indien zelfde tegenstander
                j = i;
            }
            i = i + 3; // volgende rondeNummer, kleur en knsbNummer
        }
        return j; // vorigeKeer zelfde tegenstander of 0
    }

    function vorigeAfdrukken(i, tegenstander) {
        console.log(`${naam} met ${totaal[i + 1] ? "wit" : "zwart"} tegen ${tegenstander.naam} in ronde ${totaal[i]}`);
    }

    function tegen(tegenstander, rondeNummer)  {
        const i = vorigeKeer(tegenstander);
        if (i) {
            vorigeAfdrukken(i, tegenstander);  // TODO verwijderen
            // console.log("rondeNummer: " + rondeNummer);
            // console.log("totaal[i]: " + totaal[i]);
            // console.log("rondenVerschil(): " + rondenVerschil());
            return (rondeNummer - totaal[i]) > rondenVerschil();
        } else {
            return true; // nog niet tegen gespeeld
        }
    }

    /**
     * metWit berekent welke kleur tegen tegenstander
     *
     * @param tegenstander totalen
     * @returns {boolean|*} indien wit anders zwart
     */
    function metWit(tegenstander) {
        const i = vorigeKeer(tegenstander);
        if (i) {
            return totaal[i + 1] === 0 // wit indien vorige keer zwart
        } else if (saldoWitZwart() !== tegenstander.saldoWitZwart()) {
            afdrukken(i, tegenstander, saldoWitZwart() < tegenstander.saldoWitZwart(), "wit-zwart");  // TODO verwijderen
            return saldoWitZwart() < tegenstander.saldoWitZwart(); // wit indien vaker met zwart
        } else if (zonderAftrek() !== tegenstander.zonderAftrek()) {
            afdrukken(i, tegenstander, zonderAftrek() < tegenstander.zonderAftrek(), "punten");  // TODO verwijderen
            return zonderAftrek() < tegenstander.zonderAftrek(); // wit indien minder punten
        } else {
            afdrukken(i, tegenstander, rating() < tegenstander.rating(), "rating");  // TODO verwijderen
            return rating() < tegenstander.rating(); // wit indien lagere rating
        }
    }

    function afdrukken(i, tegenstander, kleur, wegens) {
        console.log(`${naam} met ${kleur ? "wit" : "zwart"} tegen ${tegenstander.naam} wegens ${wegens}`);
    }
    return Object.freeze({ // Zie blz. 17.1 Douglas Crockford: How JavaScript Works
        knsbNummer,
        naam,
        subgroep,
        rating,
        intern,
        inRanglijst,
        punten,
        winnaarSubgroep,
        scoreIntern,
        percentageIntern,
        saldoWitZwart,
        oneven,
        afzeggingen,
        aftrek,
        zonderAftrek,
        startPunten,
        eigenWaardeCijfer,
        extern,
        scoreExtern,
        percentageExtern,
        saldoWitZwartExtern,
        rondenVerschil,
        tegen,
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
async function uitslagenTeamAlleRonden(teamCode) {
    const rondeUitslagen = [];
    (await localFetch("/ronden/" + competitie.seizoen + "/" + teamCode)).forEach(
        function (ronde) {
            rondeUitslagen[ronde.rondeNummer - 1] = {ronde: ronde, winst: 0, remise: 0, verlies: 0, uitslagen: []};
        });
    (await localFetch("/team/" + competitie.seizoen + "/" + teamCode)).forEach(
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

function backupUitslag(rijen) {
    let velden = [];
    for (const [key, value] of Object.entries(rijen[0])) {
        velden.push(key);
    }
    console.log(`insert into uitslag (${velden.join(", ")}) values`);
    for (const rij of rijen) {
        let kolommen = [];
        for (const [key, value] of Object.entries(rij)) {
            // TODO backupRij = selecteer(key, value); waarbij selecteer als parameter aan backup doorgeven
            kolommen.push(valueSQL(value));
        }
        console.log(`(${kolommen.join(", ")}),`);
    }
}

/*
insert into uitslag (seizoen, teamCode, rondeNummer, bordNummer, knsbNummer, partij, witZwart, tegenstanderNummer, resultaat, datum, anderTeam) values
('2021', 'int', '1', '0', '101', 'a', '', '0', '', '2020-08-25', 'int'),
 */
function valueSQL(value) {
    if (typeof value === "string") {
        const datum = new Date(value);
        if (value.length > 10 && datum instanceof Date && !isNaN(datum)) {
            return `'${datumSQL(value)}'`;
        } else {
            return `'${value}'`;
        }
    } else if (typeof value === "number") {
        return value;
    }
}