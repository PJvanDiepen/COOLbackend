/*
db uit de MySQL database

globale variabelen voor server en pagina's in de browser
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
// uitslag.uithuis
const THUIS = "t";
const UIT = "u";

// gebruiker.mutatieRechten
const IEDEREEN = 0;
const GEREGISTREERD = 1;
const TEAMLEIDER = 2;
const BESTUUR = 3;
const WEDSTRIJDLEIDER = 8;
const BEHEERDER = 9;


function hoera() {
    return " db.cjs hoera!";
}

/*
db.js ES6 voor browser: export { .. };

db.cjs CommonJS voor node.js: module.exports = { .. };
 */

module.exports = {
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

    // gebruiker.mutatieRechten
    IEDEREEN,
    GEREGISTREERD,
    TEAMLEIDER,
    BESTUUR,
    WEDSTRIJDLEIDER,
    BEHEERDER,

    hoera                  // ()
}
