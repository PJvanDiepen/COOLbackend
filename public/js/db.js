/*
 * Deze module bevat alle code voor interactie met de MySQL database
 *
 * Valideren
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
const VRAAG_INVALLER       = "?";
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
const resultaten = [
    [WINST, "1-0"],
    [REMISE, "½-½"],
    [VERLIES, "0-1"]];
// uitslag.uithuis
const THUIS = "t";
const UIT = "u";

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
    return " db.js hoera!";
}

/*
db.js ES6 voor browser: export { .. };

db.cjs CommonJS voor node.js: module.exports = { .. };
 */

export {
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
    agenda,                // (partij)

    // uitslag.witZwart
    WIT,
    ZWART,
    // uitslag.resultaat
    REMISE,
    WINST,
    VERLIES,
    resultaten,
    // uitslag.uithuis
    THUIS,
    UIT,

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
