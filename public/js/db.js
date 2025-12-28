/*
 * Deze module bevat code om data uit de MySQL database te manipuleren.
 *
 * Van deze module bestaan twee versies:
 * - een Common.js versie voor de server node.js: db.cjs met module.exports = { .. };
 * - een ES6 versie voor de browser: db.js met export { .. };
 *
 * Het enige verschil tussen de twee versies is de export-lijst.
 *
 * Voor het ontwikkelen of verbeteren van functionaliteit voor de server of de browser
 * is het handig dat er twee versies zijn.
 * Maar uiteindelijk is het de bedoeling dat de code identiek blijft voor de server en de browser
 * in deze module of wordt afgesplitst naar andere modules.
 *
 * Alleen db.cjs en db.js hebben export-lijsten.
 * Alle andere modules gebruiken geen export-lijsten, maar de ES6 conventie met export voor elke declaratie.
 *
 * Op de server vult app.js de lijst van mogelijke vragen aan de server.
 * In de browser moet server.js die vragen van de server inlezen.
 *
 * Op de server verzorgt api.js de verbinding met de MySQL database aan de hand van vragen van de browser.
 * In de browser verzorgt server.js de synchronisatie met de server aan de hand van synchroon en boom.
 *
 * mutaties zijn key value paren: { url1, revisie1, url2, revisie2, ...}
 * De revisie hoort bij de meest recente mutatie van de database en is te vinden via de url.
 * De url verwijst op de server naar de database en naar sessionStorage van de browser
 * of naar de boom.
 */
const synchroon = {
    versie: "0.0.0", // zie package.json
    vragen: [], // mogelijke vragen aan de server
    start: new Date().toISOString(), // jjjj-mm-ddTuu:mm:ss.sssZ
    revisie: 0, // +1 na elke mutatie op de server
    mutaties: {}, // alle mutaties op de server sinds de start van de server
    club: 0 // beperkt het aantal mutaties die de server naar de browser stuurt
}

/**
 * key vertaalt object naar string voor api-call met :club/:seizoen/:team/:ronde/:speler
 *
 * @param o object
 * @returns {string} string voor api-call
 */
function key(o) {
    if (o.clubCode === undefined) {
        return "";
    } else if (o.seizoen === undefined) {
        return `${o.clubCode}`;
    } else if (o.teamCode === undefined) {
        return `${o.clubCode}/${o.seizoen}`;
    } else if (o.rondeNummer === undefined) {
        return `${o.clubCode}/${o.seizoen}/${o.teamCode}`;
    } else if (o.knsbNummer === undefined) {
        return `${o.clubCode}/${o.seizoen}/${o.teamCode}/${o.rondeNummer}`;
    } else {
        return `${o.clubCode}/${o.seizoen}/${o.teamCode}/${o.rondeNummer}/${o.knsbNummer}`;
    }
}

// database mutatie
const VERWIJDERD = -1
const NIET_GEWIJZIGD = 0
const GEWIJZIGD = 1;
const TOEGEVOEGD = 2;

// mutatie.invloed
const GEEN_INVLOED = 0;
const OPNIEUW_INDELEN = 1;
const NIEUWE_RANGLIJST = 2;

/**
 * De data van 0-0-0 staat op 3 verschillende plaatsen:
 * - in de MySQL database,
 * - op de server en
 * - in de browser.
 *
 * De hiërarchie en samenhang tussen de tabellen van de database
 * is een boom-structuur van objecten op de server en in de browser:
 *
 * boom.eenClub(:club)
 *     .eenSeizoen(:seizoen)
 *     .eenTeam(:team)
 *     .eenRonde(:ronde)
 *     .eenUitslag(:speler)
 *
 * De boom heeft een revisie nummer. Zie synchroon in api.js
 * Na serverStart begint de server met revisie = 1 en daarna +1 na elke mutatie van de database.
 *
 * Server en browser gebruiken verschillende technieken om de data te synchroniseren.
 *
 * De server leest data uit de database naar aanleiding van een vraag van de browser en
 * slaat die op als objecten op in de boom,
 * zodat die niet steeds opnieuw uit de database gelezen hoeft te worden.
 *
 * Als de browser data van de server leest, slaat de server die data ook op in sessionStorage,
 * zodat die niet steeds opnieuw van de server gelezen hoeft te worden.
 * Behalve de gevraagde data stuurt de server ook steeds het revisie nummer,
 * zodat de browser kan bepalen of de data in sessionStorage nog actueel is.
 *
 * De objecten in de boom: club, seizoen, enz. hebben een tak naar objecten lager in de hiërarchie.
 */

const boom = { // de groeiFuncties zijn verschillend voor de server en de browser
    leesClubs: function() {},
    leesSeizoenen: function() {},
    leesTeams: function() {},
    leesRonden: function() {},
    leesUitslagen: function() {},
    club: []
};

function boomOnderhoud(object) {
    Object.assign(boom, object);
}

async function alleClubs() {
    if (boom.club.length === 0) {
        const clubs = await boom.leesClubs();
        boom.club.splice(0, 0, ...clubs.map(clubMaken));
    }
    return boom.club;
}

async function clubTak(clubCode) {
    clubCode = Number(clubCode);
    const index = (await alleClubs()).findIndex(function(eenClub) {
        return eenClub.clubCode === clubCode;
    });
    if (index < 0) {
        console.log(`clubTak(${clubCode}) niet gevonden`);
        return undefined;
    }
    return boom.club[index];
}

// clubCode int
const WAAGTOREN = 0;
const WAAGTOREN_JEUGD = 1;

function clubMaken(object) {
    const {
        clubCode,
        vereniging,
        teamNaam
    } = object;
    const clubTekst = `${vereniging} teamNaam: ${teamNaam}`;
    console.log(`clubMaken = ${clubTekst}`);
    if (typeof clubCode !== "number") {
        console.log("clubCode niet numeriek");
        return undefined;
    }
    const seizoen = [];

    async function alleSeizoenen() {
        if (seizoen.length === 0) {
            seizoen.splice(0, 0, ...(await boom.leesSeizoenen(clubCode)).map(seizoenMaken));
        }
        return seizoen;
    }

    async function seizoenTak(seizoenCode) {
        const index = (await alleSeizoenen()).findIndex(function(eenSeizoen) {
            return eenSeizoen.seizoen === seizoenCode;
        });
        if (index < 0) {
            console.log(`seizoenTak(${clubCode}, ${seizoenCode}) niet gevonden`);
            return undefined;
        }
        return seizoen[index];
    }

    function kaleClub() {
        return {
            clubCode: clubCode,
            vereniging: vereniging,
            teamNaam: teamNaam
        };
    }

    return Object.freeze({
        clubCode,
        vereniging,
        teamNaam,
        clubTekst,
        seizoen,
        alleSeizoenen, // ()
        seizoenTak,    // (seizoenCode)
        kaleClub       // ()
    });
}

async function seizoenTak(clubCode, seizoen) {
    const eenClub = await clubTak(clubCode);
    return await eenClub.seizoenTak(seizoen);
}

/* seizoen char(4)
Seizoenen volgen elkaar standaard op: "1819", "1920", "2021", enz.
De Waagtoren Jeugd en andere schaakverenigingen hebben een voorjaar en najaar competitie
met de seizoensovergangen in januari en juli. Bijvoorbeeld: "2309", "2401", "2409", enz.
 */
function seizoenMaken(object) {
    const {
        clubCode,
        seizoen
    } = object;
    const seizoenTekst = clubCode === WAAGTOREN_JEUGD
        ? `${Number(seizoen.substring(2, 4)) > 6 ? "najaar" : "voorjaar"} 20${seizoen.substring(0, 2)}`
        : `20${seizoen.substring(0, 2)}-20${seizoen.substring(2, 4)}`;
    console.log(`seizoenMaken = ${seizoenTekst}`);
    if (seizoen.length > 4) {
        console.log("seizoen niet 4 posities");
        return undefined;
    }

    const seizoenDaarna = clubCode === WAAGTOREN_JEUGD
        ? function () {
            const jaar = Number(seizoen.substring(0, 2));
            const maand = Number(seizoen.substring(2, 4));
            return maand > 6
                ? `${(jaar+1).toString().padStart(2,"0")}01` // voorjaar volgend jaar
                : `${jaar.toString().padStart(2, "0")}09`; // najaar dit jaar
        }
        : function () {
            const jaar = Number(seizoen.substring(2, 4));
            return `${(jaar).toString().padStart(2,"0")}${(jaar+1).toString().padStart(2, "0")}`;
        };

    const team = [];

    async function alleTeams() {
        if (team.length === 0) {
            const teams = await boom.leesTeams(clubCode, seizoen);
            team.splice(0, 0, ...teams.map(teamMaken));
        }
        return team;
    }

    async function teamTak(teamCode) {
        const index = (await alleTeams()).findIndex(function(eenTeam) {
            return eenTeam.teamCode === teamCode;
        });
        if (index < 0) {
            console.log(`teamTak(${clubCode}, ${seizoen}), ${teamCode}) niet gevonden`);
            return undefined;
        }
        return team[index];
    }

    function kaleSeizoen() {
        return {
            clubCode: clubCode,
            seizoen: seizoen
        };
    }

    return Object.freeze({
        clubCode,
        seizoen,
        seizoenTekst,
        seizoenDaarna,    // (seizoenCode)
        team,
        alleTeams,        // ()
        teamTak,          // (teamCode)
        kaleSeizoen       // ()
    });
}

function seizoenVoluit(object) { // TODO naar seizoenMaken
    return tak(object.clubCode, object.seizoen).seizoenTekst;
}

async function teamTak(clubCode, seizoen, teamCode) {
    const eenSeizoen = await seizoenTak(clubCode, seizoen);
    return await eenSeizoen.teamTak(teamCode);
}

// teamCode char(3)
const INTERNE_COMPETITIE = "int";
const RAPID_COMPETITIE= "ira";
const JEUGD_COMPETITIE= "ije";
const SNELSCHAKEN= "izs";
const ZWITSERS_TEST= "izt";

function teamMaken(object) {
    const {
        clubCode,
        seizoen,
        teamCode,
        reglement,
        maand,
        jaar,
        bond, // TODO verwijderen
        poule, // TODO verwijderen
        omschrijving,
        borden,
        teamleider // TODO verwijderen
    } = object;
    const teamTekst = teamVoluit(teamCode); // TODO met club.teamNaam
    console.log(`teamMaken = ${teamTekst}`);
    if (teamCode.length > 3) {
        console.log("teamCode niet 3 posities");
        return undefined;
    }
    const ronde = [];

    async function alleRonden() {
        if (ronde.length === 0) {
            const ronden = await boom.leesRonden(clubCode, seizoen, teamCode);
            ronde.splice(0, 0, ...ronden.map(rondeMaken));
        }
        return ronde;
    }

    async function rondeTak(rondeNummer) {
        rondeNummer = Number(rondeNummer);
        const index = (await alleRonden()).findIndex(function(eenRonde) {
            return eenRonde.rondeNummer === rondeNummer;
        });
        if (index < 0) {
            console.log(`rondeTak(${clubCode}, ${seizoen}, ${teamCode}, ${rondeNummer}) niet gevonden`);
            return undefined;
        }
        return ronde[index];
    }

    function rondeCompleet() {
        indexenInvullen();
        return indexUitslagenCompleet >= 0 ? ronde[indexUitslagenCompleet] : null;
    }

    function rondeInvullen() {
        indexenInvullen();
        return indexUitslagenInvullen >= 0 ? ronde[indexUitslagenInvullen] : null;
    }

    function rondeIndelen() {
        indexenInvullen();
        return indexIndelen >= 0 ? ronde[indexIndelen] : null;
    }

    let indexUitslagenCompleet = -1;
    let indexUitslagenInvullen = -1;
    let indexIndelen = -1;

    function indexenInvullen() { // TODO aanroep na groei function
        console.log("--- indexenInvullen() ---");
        if (ronde.length < 1) {
            console.log(`indexenInvullen() gaat fout met ${teamTekst}`);
        } else if (indexUitslagenCompleet === -1 && indexUitslagenInvullen === -1 && indexIndelen === -1) {
            let index = 0;
            while (index < ronde.length && ronde[index].uitslagenCompleet()) {
                index++;
            }
            console.log(`indexenInvullen() index = ${index}`);
            if (index + 1 > ronde.length) {
                console.log(`indexenInvullen() if index + 1 > ronde.length`);
                indexUitslagenCompleet = ronde.length - 1; // ronden compleet tot en met laatste ronde
                indexUitslagenInvullen = -1;
                indexIndelen = -1;
            } else if (ronde[index].uitslagenInvullen()) {
                console.log(`indexenInvullen() if ronde[index].uitslagenInvullen()`);
                indexUitslagenCompleet = index - 1;
                indexUitslagenInvullen = index;
                indexIndelen = index + 1;
            } else {
                console.log(`indexenInvullen() else`);
                indexUitslagenCompleet = index - 1;
                indexUitslagenInvullen = - 1;
                indexIndelen = index;
            }
            for (let i = index + 1; i < ronde.length; i++) {
                if (ronde[i].uitslagenCompleet()) {
                    console.log(`${ronde[i].rondeTekst} is wel compleet`);
                }
            }
            console.log(`compleet: ${indexUitslagenCompleet} invullen: ${indexUitslagenInvullen} indelen: ${indexIndelen}`);
        }
    }

    function kaleTeam() {
        return {
            clubCode: clubCode,
            seizoen: seizoen,
            teamCode: teamCode,
            reglement: reglement,
            maand: maand,
            jaar: jaar,
            bond: bond, // TODO verwijderen
            poule: poule, // TODO verwijderen
            omschrijving: omschrijving,
            borden: borden,
            teamleider: teamleider // TODO verwijderen
        };
    }

    return Object.freeze({
        clubCode,
        seizoen,
        teamCode,
        reglement,
        maand,
        jaar,
        bond,
        poule,
        omschrijving,
        borden,
        teamleider,
        teamTekst,
        ronde,
        alleRonden,      // ()
        rondeTak,        // (rondeNummer)
        rondeCompleet,   // ()
        rondeInvullen,   // ()
        rondeIndelen,    // ()
        kaleTeam         // ()
    });
}

function isCompetitie(team) {
    return team.teamCode === "" ? false : team.teamCode.substring(0,1) === "i";
}

function isBekerCompetitie(team) {
    return team.teamCode === "" ? false : team.teamCode.substring(1,2) === "b";
}

function isTeam(team) {
    return team.teamCode === "" || team.teamCode === "0" || team.teamCode === "n0" ? false
        : team.teamCode.substring(0,1) !== "i";
}

function teamVoluit(teamCode) { // TODO naar teamMaken en uit database
    if (teamCode === INTERNE_COMPETITIE) {
        return "interne competitie";
    } else if (teamCode === RAPID_COMPETITIE) {
        return "rapid competitie";
    } else if (teamCode === JEUGD_COMPETITIE) {
        return "jeugd competitie";
    } else if (teamCode === SNELSCHAKEN) {
        return "einde seizoen snelschaken";
    } else if (teamCode === "0") {
        return "KNSB bij andere schaakvereniging";
    } else if (teamCode === "n0") {
        return "NHSB bij andere schaakvereniging";
    } else if (teamCode === "kbe") {
        return "Waagtoren KNSB beker";
    } else if (teamCode === "nbe") {
        return "Waagtoren G"; // NHSB beker Goud
    } else if (teamCode === "nbz") {
        return "Waagtoren Z"; // NHSB beker Zilver
    } else if (teamCode === "nbb") {
        return "Waagtoren B"; // NHSB beker Brons
    } else if (teamCode === "" || teamCode.substring(0,1) === " ") {
        return "geen";
    } else if (teamCode.substring(0,2) === "nv") {
        return "Waagtoren v" + teamCode.substring(2);
    } else if (teamCode.substring(0,1) === "n") {
        return "Waagtoren n" + teamCode.substring(1);
    } else {
        return "Waagtoren " + teamCode;
    }
}

async function rondeTak(clubCode, seizoen, teamCode, rondeNummer) {
    const eenTeam = await teamTak(clubCode, seizoen, teamCode);
    return await eenTeam.rondeTak(rondeNummer);
}

function rondeMaken(object) {
    const {
        clubCode,
        seizoen,
        teamCode,
        rondeNummer,
        uithuis,
        tegenstander,
        datum
    } = object;
    const rondeTekst = isCompetitie(object)
        ? `ronde ${rondeNummer} ${teamVoluit(teamCode)}` // competitieronde
        : uithuis === THUIS
        ? `${teamVoluit(teamCode)} - ${tegenstander}` // thuiswedstrijd
        : `${tegenstander} - ${teamVoluit(teamCode)}`; // uitwedstrijd
    console.log(`rondeMaken = ${rondeTekst}`);
    if (typeof rondeNummer !== "number") {
        console.log("rondeNummer niet numeriek");
        return undefined;
    }

    const uitslag = [];

    async function alleUitslagen() {
        if (uitslag.length === 0) {
            const uitslagen = await boom.leesUitslagen(clubCode, seizoen, teamCode, rondeNummer);
            uitslag.splice(0, 0, ...uitslagen.map(uitslagMaken));
        }
        return uitslag;
    }

    async function uitslagTak(knsbNummer) {
        knsbNummer = Number(knsbNummer);
        const index = (await alleUitslagen()).findIndex(function(eenUitslag) {
            return eenUitslag.knsbNummer === knsbNummer;
        });
        if (index < 0) {
            console.log(`uitslagTak(${clubCode}, ${seizoen}), ${teamCode}, ${rondeNummer}, ${knsbNummer}) niet gevonden`);
            return undefined;
        }
        return uitslag[index];
    }

    function uitslagenCompleet() {
        for (const eenUitslag of uitslag) {
            if (!eenUitslag.isCompleet()) {
                return false;
            }
        }
        return true;
    }

    function uitslagenInvullen() {
        console.log("--- uitslagenInvullen() --- ?");

        let ingevuld = 0;
        for (const eenUitslag of uitslag) {
            console.log(`r${eenUitslag.rondeNummer} ${eenUitslag.uitslagTekst} ${eenUitslag.resultaat} x = ${ingevuld}`);

            if (eenUitslag.isPlanning()) {
                console.log(`${eenUitslag.uitslagTekst} is planning en geen in te vullen uitslag`);
                return false;
            } else if (eenUitslag.isCompleet()) {
                ingevuld++;
            }
        }
        console.log(`--- uitslagenInvullen() --- ${uitslag.length} > ${ingevuld}`);
        return uitslag.length > ingevuld;
    }

    function kaleRonde() {
        return {
            clubCode: clubCode,
            seizoen: seizoen,
            teamCode: teamCode,
            rondeNummer: rondeNummer,
            uithuis: uithuis,
            tegenstander: tegenstander,
            datum: datum
        };
    }

    return Object.freeze({
        clubCode,
        seizoen,
        teamCode,
        rondeNummer,
        uithuis,
        tegenstander,
        datum,
        rondeTekst,
        uitslag,
        alleUitslagen,     // ()
        uitslagTak,        // (knsbNummer)
        uitslagenCompleet, // ()
        uitslagenInvullen, // ()
        kaleRonde          // ()
    });
}

async function uitslagTak(clubCode, seizoen, teamCode, rondeNummer, knsbNummer) {
    const eenRonde = await rondeTak(clubCode, seizoen, teamCode, rondeNummer);
    return await eenRonde.uitslagTak(knsbNummer);
}

function uitslagMaken(object) {
    const {
        clubCode,
        seizoen,
        teamCode,
        rondeNummer,
        bordNummer,
        knsbNummer,
        partij,
        witZwart,
        tegenstanderNummer,
        resultaat,
        datum,
        competitie
    } = object;
    const uitslagTekst = // TODO uitwerken
        `${bordNummer}: ${knsbNummer} met ${witZwart} tegen ${tegenstanderNummer} ${partij}`;
    // console.log(`uitslagMaken = ${uitslagTekst}`);
    if (typeof knsbNummer !== "number") {
        console.log("knsbNummer niet numeriek");
        return null;
    }

    function isCompleet() {
        return isUitslag(true);
    }

    function isIngedeeld() {
        return isUitslag(false);
    }

    function isUitslag(metResultaat) {
        if (isPlanning()) {
            return false;
        } else if (partij === EXTERNE_PARTIJ || geenPartijInvullen.has(partij)) {
            return true; // externe partij of geen partij tijdens interne competitie
        } else if (!resultaatInvullen.has(resultaat)) {
            return false;
        } else {
            return metResultaat ? resultaat !== "" : true; // blanko is geen resultaat
        }
    }

    function isPlanning() {
        return planningInvullen.has(partij);
    }

    function isPaar() {
        return partij === INGEDEELD || partij === TOCH_INGEDEELD;
    }

    function isGeenPaar() {
        return partij === PLANNING || partij === MEEDOEN || partij === NIET_MEEDOEN;
    }

    function isMeedoen() {
        return planningInvullen.get(partij) === NIET_MEEDOEN;
    }

    function kaleUitslag() {
        return {
            clubCode: clubCode,
            seizoen: seizoen,
            teamCode: teamCode,
            rondeNummer: rondeNummer,
            bordNummer: bordNummer,
            knsbNummer: knsbNummer,
            partij: partij,
            witZwart: witZwart,
            tegenstanderNummer: tegenstanderNummer,
            resultaat: resultaat,
            datum: datum,
            competitie: competitie
        };
    }

    return Object.freeze({
        clubCode,
        seizoen,
        teamCode,
        rondeNummer,
        bordNummer,
        knsbNummer,
        partij,
        witZwart,
        tegenstanderNummer,
        resultaat,
        datum,
        competitie,
        uitslagTekst,
        isCompleet, // ()
        isIngedeeld, // ()
        isPlanning,  // ()
        isPaar,      // ()
        isGeenPaar,  // ()
        isMeedoen,   // ()
        kaleUitslag  // ()
    });
}

// knsbNummer int
const TIJDELIJK_LID_NUMMER = 100
const KNSB_NUMMER          = 1000000;

// speler.intern
function inCompetitie(speler, teamCode) { // TODO overbodig?
    if (speler) {
        return speler.intern1 === teamCode
            || speler.intern2 === teamCode
            || speler.intern3 === teamCode
            || speler.intern4 === teamCode
            || speler.intern5 === teamCode;
    } else {
        return false;
    }
}

// uitslag.partij char(1)
const AFWEZIG              = "a";
const EXTERNE_PARTIJ       = "e";
const INTERNE_PARTIJ       = "i";
const MEEDOEN              = "m"; // na aanmelden voor interne partij
const NIET_MEEDOEN         = "n"; // na afzeggen voor interne partij
const ONEVEN               = "o";
const PLANNING             = "p";
const REGLEMENTAIRE_REMISE = "r"; // vrijgesteld
const EXTERN_THUIS         = "t"; // na aanmelden voor externe partij
const EXTERN_UIT           = "u"; // na aanmelden voor externe partij
const REGLEMENTAIR_VERLIES = "v";
const REGLEMENTAIRE_WINST  = "w";
const TOCH_INGEDEELD       = "x"; // na handmatig indelen en niet aanmelden voor interne partij
const INGEDEELD            = "y"; // na handmatig indelen en aanmelden voor interne partij
// uitslag.witZwart char(1)
const WIT = "w";
const ZWART = "z";
// uitslag.resultaat char(1)
const REMISE = "½";
const WINST = "1";
const VERLIES = "0";
// uitslag.uithuis char(1)
const THUIS = "t";
const UIT = "u";

function wedstrijdVoluit(ronde) { // TODO naar rondeMaken
    return tak(ronde.clubCode, ronde.seizoen, ronde.teamCode, ronde.rondeNummer).rondeTekst;
}

const geenPartijInvullen = new Map([
    [AFWEZIG, "afgezegd"],
    [ONEVEN, "oneven"],
    [REGLEMENTAIRE_REMISE, "reglementair remise"],
    [REGLEMENTAIR_VERLIES, "reglementair verlies"],
    [REGLEMENTAIRE_WINST, "reglementaire winst"],
    ["j", "niet gespeeld"]]);

const resultaatInvullen = new Map([
    ["",""],
    [WINST, "1-0"],
    [REMISE, "½-½"],
    [VERLIES, "0-1"]]);

function resultaatSelecteren(uitslag) {
    return uitslag.resultaat === "" ? [...resultaatInvullen] : [...resultaatInvullen].splice(1); // met of zonder blanko resultaat
}

const planningInvullen = new Map([
    [PLANNING, MEEDOEN],
    [NIET_MEEDOEN, MEEDOEN],
    [MEEDOEN, NIET_MEEDOEN],
    [EXTERN_THUIS, NIET_MEEDOEN],
    [EXTERN_UIT, NIET_MEEDOEN],
    [INGEDEELD, NIET_MEEDOEN],
    [TOCH_INGEDEELD, NIET_MEEDOEN]]);

const maandInvullen = new Map([
    [ 1, "januari"],
    [ 2, "februari"],
    [ 3, "maart"],
    [ 4, "april"],
    [ 5, "mei"],
    [ 6, "juni"],
    [ 7, "juli"],
    [ 8, "augustus"],
    [ 9, "september"],
    [10, "oktober"],
    [11, "november"],
    [12, "december"]]);

// gebruiker.rol en speler.rol int
const IEDEREEN = 0;
const GEREGISTREERD = 1;
const TEAMLEIDER = 2;
const BESTUUR = 3;
const WEDSTRIJDLEIDER = 4;
const BEHEERDER = 8;
const ONTWIKKELAAR = 9;

const functieInvullen = new Map ([
    [ONTWIKKELAAR, "ontwikkelaar"],
    [BEHEERDER, "systeembeheerder"],
    [WEDSTRIJDLEIDER, "wedstrijdleider"],
    [BESTUUR, "bestuur"],
    [TEAMLEIDER, "teamleider"],
    [GEREGISTREERD, "geregistreerd"]]);

function gebruikerFunctie(speler) {
    if (functieInvullen.has(Number(speler.mutatieRechten))) {
        return functieInvullen.get((Number(speler.mutatieRechten)));
    } else {
        return "geen gebruiker"
    }
}

export { // ES6 voor browser,
    synchroon,
    key,                   // (object)
    // database mutatie
    VERWIJDERD,
    NIET_GEWIJZIGD,
    GEWIJZIGD,
    TOEGEVOEGD,
    // mutatie.invloed
    GEEN_INVLOED,
    OPNIEUW_INDELEN,
    NIEUWE_RANGLIJST,
    boomOnderhoud,         // (object)
    clubTak,               // (clubCode)
    // clubCode int
    WAAGTOREN,
    WAAGTOREN_JEUGD,
    clubMaken,             // (object)
    seizoenTak,            // (clubCode, seizoen)
    seizoenMaken,          // (object)
    seizoenVoluit,         // (object)
    teamTak,               // (clubCode, seizoen, teamCode)
    // teamCode char(3)
    INTERNE_COMPETITIE,
    RAPID_COMPETITIE,
    JEUGD_COMPETITIE,
    SNELSCHAKEN,
    ZWITSERS_TEST,
    teamMaken,             // (object)
    isCompetitie,          // (team)
    isBekerCompetitie,     // (team)
    isTeam,                // (team)
    teamVoluit,            // (teamCode)
    rondeTak,              // (clubCode, seizoen, teamCode, rondeNummer)
    rondeMaken,            // (object)
    uitslagTak,            // (clubCode, seizoen, teamCode, rondeNummer, knsbNummer)
    uitslagMaken,          // (object)

    // knsbNummer int
    TIJDELIJK_LID_NUMMER,
    KNSB_NUMMER,
    inCompetitie,          // (speler, teamCode)
    // uitslag.partij char(1)
    AFWEZIG,
    EXTERNE_PARTIJ,
    INTERNE_PARTIJ,
    MEEDOEN,               // na aanmelden
    NIET_MEEDOEN,          // na afzeggen
    ONEVEN,
    PLANNING,
    REGLEMENTAIRE_REMISE,  // vrijgesteld
    EXTERN_THUIS,          // na aanmelden voor externe partij thuis
    EXTERN_UIT,            // na aanmelden voor externe partij uit
    REGLEMENTAIR_VERLIES,
    REGLEMENTAIRE_WINST,
    TOCH_INGEDEELD,        // na handmatig indelen en niet aanmelden voor interne partij
    INGEDEELD,             // na handmatig indelen en aanmelden voor interne partij
    // uitslag.witZwart char(1)
    WIT,
    ZWART,
    // uitslag.resultaat char(1)
    REMISE,
    WINST,
    VERLIES,
    // uitslag.uithuis char(1)
    THUIS,
    UIT,
    wedstrijdVoluit,       // (ronde)
    geenPartijInvullen,
    resultaatInvullen,
    resultaatSelecteren,   // (uitslag)
    planningInvullen,
    maandInvullen,
    // gebruiker.mutatieRechten int
    IEDEREEN,
    GEREGISTREERD,
    TEAMLEIDER,
    BESTUUR,
    WEDSTRIJDLEIDER,
    BEHEERDER,
    ONTWIKKELAAR,
    functieInvullen,
    gebruikerFunctie      // (speler)
}