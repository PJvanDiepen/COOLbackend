/*
 * Deze module bevat alle code voor het valideren van de velden in de tabellen van de MySQL database.
 *
 * Van deze module bestaan twee versies:
 * - een Common.js versie voor node.js: db.cjs met module.exports = { .. };
 * - een ES6 versie voor de browser: db.js met export { .. };
 *
 * Het enige verschil tussen de twee versies is de export-lijst.
 *
 * Alleen db.cjs en db.js hebben export-lijsten.
 * Alle andere modules gebruiken geen export-lijsten, maar de ES6 conventie met export voor elke declaratie.
 */

const apiLijst = []; // zie app.js

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

// mutatie.invloed
const GEEN_INVLOED = 0;
const OPNIEUW_INDELEN = 1;
const NIEUWE_RANGLIJST = 2;

// clubCode int
const WAAGTOREN = 0;
const WAAGTOREN_JEUGD = 1;

/* seizoen char(4)

Seizoenen volgen elkaar standaard op: "1819", "1920", enz.

Indien seizoenCode is ingevuld is een andere volgorde mogelijk: "2309", "2401", "2409", enz.
 */
function seizoenVoluit(seizoen, seizoenCode = 0) {
    return seizoenCode === WAAGTOREN_JEUGD
        ? `${seizoen.substring(2, 4) === "09" ? "najaar" : "voorjaar"} 20${seizoen.substring(0, 2)}`
        : `20${seizoen.substring(0, 2)}-20${seizoen.substring(2, 4)}`;
}

// teamCode char(3)
const INTERNE_COMPETITIE = "int";
const RAPID_COMPETITIE= "ira";
const JEUGD_COMPETITIE= "ije";
const SNELSCHAKEN= "izs";
const ZWITSERS_TEST= "izt";

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

// knsbNummer int
const TIJDELIJK_LID_NUMMER = 100
const KNSB_NUMMER          = 1000000;

// speler.intern
function inCompetitie(speler, teamCode) { // volgens database
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

const resultaatInvullen = new Map([
    ["",""],
    [WINST, "1-0"],
    [REMISE, "½-½"],
    [VERLIES, "0-1"]]);

function isResultaat(uitslag) {
    return resultaatInvullen.has(uitslag.resultaat);
}

function resultaatSelecteren(uitslag) {
    return uitslag.resultaat === "" ? [...resultaatInvullen] : [...resultaatInvullen].slice(1); // met of zonder blanko resultaat
}

const planningInvullen = new Map([
    [PLANNING, MEEDOEN],
    [NIET_MEEDOEN, MEEDOEN],
    [MEEDOEN, NIET_MEEDOEN],
    [EXTERN_THUIS, NIET_MEEDOEN],
    [EXTERN_UIT, NIET_MEEDOEN],
    [INGEDEELD, NIET_MEEDOEN],
    [TOCH_INGEDEELD, NIET_MEEDOEN]]);

function isPlanning(uitslag) {
    return planningInvullen.has(uitslag.partij);
}

function isPaar(uitslag) {
    return uitslag.partij === INGEDEELD || uitslag.partij === TOCH_INGEDEELD;
}

function isGeenPaar(uitslag) {
    return uitslag.partij === PLANNING || uitslag.partij === MEEDOEN || uitslag.partij === NIET_MEEDOEN;
}

function isMeedoen(uitslag) {
    return planningInvullen.get(uitslag.partij) === NIET_MEEDOEN;
}

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

// gebruiker.mutatieRechten int
const IEDEREEN = 0;
const GEREGISTREERD = 1;
const TEAMLEIDER = 2;
const BESTUUR = 3;
const WEDSTRIJDLEIDER = 4;
const BEHEERDER = 8;
const ONTWIKKElAAR = 9;

const functieInvullen = new Map ([
    [ONTWIKKElAAR, "ontwikkelaar"],
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

// html
const MENU = "menu";

export { // ES6 voor browser,
    apiLijst,

    key,                   // (object)

    // mutatie.invloed
    GEEN_INVLOED,
    OPNIEUW_INDELEN,
    NIEUWE_RANGLIJST,

    // clubCode int
    WAAGTOREN,
    WAAGTOREN_JEUGD,

    // seizoen char(4)
    seizoenVoluit,         // (seizoen, seizoensOvergang)

    // teamCode char(3)
    INTERNE_COMPETITIE,
    RAPID_COMPETITIE,
    JEUGD_COMPETITIE,
    SNELSCHAKEN,
    ZWITSERS_TEST,

    isCompetitie,          // (team)
    isBekerCompetitie,     // (team)
    isTeam,                // (team)

    // knsbNummer int
    TIJDELIJK_LID_NUMMER,
    KNSB_NUMMER,

    inCompetitie,            // (speler, teamCode)

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

    resultaatInvullen,
    isResultaat,           // (uitslag)
    resultaatSelecteren,   // (uitslag)
    planningInvullen,
    isPlanning,            // (uitslag)
    isPaar,                // (uitslag)
    isGeenPaar,            // (uitslag)
    isMeedoen,             // (uitslag)
    maandInvullen,

    // gebruiker.mutatieRechten int
    IEDEREEN,
    GEREGISTREERD,
    TEAMLEIDER,
    BESTUUR,
    WEDSTRIJDLEIDER,
    BEHEERDER,
    ONTWIKKElAAR,

    functieInvullen,
    gebruikerFunctie,      // (speler)

    // html
    MENU
}
