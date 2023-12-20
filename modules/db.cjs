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

const apiLijst = [];

// mutatie.invloed
const GEEN_INVLOED = 0;
const OPNIEUW_INDELEN = 1;
const NIEUWE_RANGLIJST = 2;

// teamCode
const INTERNE_COMPETITIE = "int";
const RAPID_COMPETTIE    = "ira";
const JEUGD_COMPETTIE    = "ije";
const SNELSCHAKEN        = "izs";
const ZWITSERS_TEST      = "izt";

function isCompetitie(team) {
    return team.teamCode === "" ? false : team.teamCode.substring(0,1) === "i";
}

function isBekerCompetitie(team) {
    return team.teamCode === "" ? false : team.teamCode.substring(1,2) === "b";
}

function isTeam(team) {
    return team.teamCode === "" ? false : team.teamCode.substring(0,1) !== "i";
}

// knsbNummer
const TIJDELIJK_LID_NUMMER = 100
const KNSB_NUMMER          = 1000000;

// uitslag.partij
const AFWEZIG              = "a";
const EXTERNE_PARTIJ       = "e";
const INTERNE_PARTIJ       = "i";
const MEEDOEN              = "m"; // na aanmelden voor interne partij
const NIET_MEEDOEN         = "n"; // na afzeggen
const ONEVEN               = "o";
const PLANNING             = "p";
const REGLEMENTAIRE_REMISE = "r"; // vrijgesteld
const EXTERN_THUIS         = "t"; // na aanmelden voor externe partij
const EXTERN_UIT           = "u"; // na aanmelden voor externe partij
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

const resultaatInvullen = new Map([
    ["",""],
    [WINST, "1-0"],
    [REMISE, "½-½"],
    [VERLIES, "0-1"]]);

function resultaatSelecteren(uitslag) {
    return uitslag.resultaat === "" ? [...resultaatInvullen] : [...resultaatInvullen].slice(1); // met of zonder blanko resultaat
}

const planningInvullen = new Map([
    [PLANNING, MEEDOEN],
    [NIET_MEEDOEN, MEEDOEN],
    [MEEDOEN, NIET_MEEDOEN],
    [EXTERN_THUIS, NIET_MEEDOEN],
    [EXTERN_UIT, NIET_MEEDOEN]]);

function isPlanning(uitslag) {
    return planningInvullen.has(uitslag.partij);
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

// gebruiker.mutatieRechten
const IEDEREEN = 0;
const GEREGISTREERD = 1;
const TEAMLEIDER = 2;
const BESTUUR = 3;
const WEDSTRIJDLEIDER = 4;
const BEHEERDER = 8;
const ONTWIKKElAAR = 9;

// html
const MENU = "menu";

module.exports = { // CommonJS voor node.js
    apiLijst,

    // mutatie.invloed
    GEEN_INVLOED,
    OPNIEUW_INDELEN,
    NIEUWE_RANGLIJST,

    // teamCode
    INTERNE_COMPETITIE,
    RAPID_COMPETTIE,
    JEUGD_COMPETTIE,
    SNELSCHAKEN,
    ZWITSERS_TEST,

    isCompetitie,          // (team)
    isBekerCompetitie,     // (team)
    isTeam,                // (team)

    // knsbNummer
    TIJDELIJK_LID_NUMMER,
    KNSB_NUMMER,

    // uitslag.partij
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
    ONBEKEND,              // na wijzigen indeling
    WIT_TEGEN,             // na wijzigen indeling
    ZWART_TEGEN,           // na wijzigen indeling

    // uitslag.witZwart
    WIT,
    ZWART,
    // uitslag.resultaat
    REMISE,
    WINST,
    VERLIES,
    // uitslag.uithuis
    THUIS,
    UIT,

    resultaatInvullen,
    resultaatSelecteren,   // (uitslag)
    planningInvullen,
    isPlanning,            // (uitslag)
    isMeedoen,             // (uitslag)
    maandInvullen,

    // gebruiker.mutatieRechten
    IEDEREEN,
    GEREGISTREERD,
    TEAMLEIDER,
    BESTUUR,
    WEDSTRIJDLEIDER,
    BEHEERDER,
    ONTWIKKElAAR,

    // html
    MENU
}
