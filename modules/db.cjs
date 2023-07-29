/*
 * Deze module bevat alle code voor het valideren van de velden in de tabellen van de MySQL database
 *
 * Van deze module bestaan twee versies:
 * - een Common.js versie voor node.js: db.cjs met module.exports = { .. };
 * - een ES6 versie voor de browser: db.js met export { .. };
 *
 * Het enige verschil tussen de twee versies is de export-lijst.
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

// uitslag.partij
const AFWEZIG              = "a";
const EXTERNE_PARTIJ       = "e";
const INTERNE_PARTIJ       = "i";
const VRAAG_INVALLER       = "k"; // kandidaat deelnemer of invaller
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

const resultaatInvullen = new Map([
    ["",""],
    [WINST, "1-0"],
    [REMISE, "½-½"],
    [VERLIES, "0-1"]]);

function resultaatSelecteren(uitslag) {
    return uitslag.resultaat === "" ? [...resultaatInvullen] : [...resultaatInvullen].slice(1); // met of zonder blanko resultaat
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

function agenda(partij) {
    return partij === MEEDOEN || partij === NIET_MEEDOEN || partij === EXTERN_THUIS || partij === EXTERN_UIT;
}

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

function hoera() {
    return " db.cjs hoera!";
}

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

    // uitslag.partij
    AFWEZIG,
    EXTERNE_PARTIJ,
    INTERNE_PARTIJ,
    VRAAG_INVALLER,
    MEEDOEN,               // na aanmelden
    NIET_MEEDOEN,          // na afzeggen
    ONEVEN,
    REGLEMENTAIRE_REMISE,  // vrijgesteld
    EXTERN_THUIS,          // na aanmelden voor externe partij thuis op dinsdag
    EXTERN_UIT,            // na aanmelden voor externe partij uit op dinsdag
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
    maandInvullen,
    agenda,                // (partij)

    // gebruiker.mutatieRechten
    IEDEREEN,
    GEREGISTREERD,
    TEAMLEIDER,
    BESTUUR,
    WEDSTRIJDLEIDER,
    BEHEERDER,
    ONTWIKKElAAR,

    // html
    MENU,

    hoera                  // ()
}
