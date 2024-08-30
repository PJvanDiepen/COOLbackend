/*
 * Deze module bevat code om data uit de MySQL database te manipuleren.
 *
 * Van deze module bestaan twee versies:
 * - een Common.js versie voor de server node.js: db.cjs met module.exports = { .. };
 * - een ES6 versie voor de browser: db.js met export { .. };
 *
 * Het enige verschil tussen de twee versies is de export-lijst.
 *
 * Alleen db.cjs en db.js hebben export-lijsten.
 * Alle andere modules gebruiken geen export-lijsten, maar de ES6 conventie met export voor elke declaratie.
 *
 * Op de server vult app.js de lijst van mogelijke vragen aan de server.
 * In de browser moet o_o_o.js die vragen van de server inlezen.
 */
const vragen = [];

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

/**
 * De data van 0-0-0 staat op 3 verschillende plaatsen:
 * - in de MySQL database,
 * - op de server en
 * - in de browser.
 *
 * Er is een hiërarchie en samenhang tussen de tabellen van de database
 * en de data objecten op de server en in de browser:
 * data.eenClub(:club)
 *     .eenSeizoen(:seizoen)
 *     .eenTeam(:team)
 *     .eenRonde(:ronde)
 *     .eenUitslag(:speler)
 *
 * Server en browser gebruiken verschillende technieken om de data te synchroniseren.
 *
 * De server leest data uit de database die gevraagd wordt en slaat die op in data,
 * zodat die niet steeds opnieuw uit de database gelezen hoeft te worden.
 * De server legt vast als de data van een seizoen compleet is of
 * als alle ronden de van een team (of competitie) compleet zijn of
 * als alle uitslagen van een ronde compleet zijn.
 *
 * Na elke mutatie op de database krijgt compleet in synchroon een nieuw volgnummer.
 * Bovendien houdt de server in synchroon bij welke data compleet is.
 * De data staat in data. In synchroon staan objecten in revisie met compleet: en een volgnummer:
 * synchroon.revisie[index(:club)][index(:seizoen)]
 * synchroon.revisie[index(:club)][index(:seizoen)][index(:team)]
 * synchroon.revisie[index(:club)][index(:seizoen)][index(:team)][index(:ronde)]
 * TODO nog verder uitwerken
 *
 * Als de browser data van de server leest, slaat de server die data ook op in sessionStorage,
 * zodat die niet steeds opnieuw van de server gelezen hoeft te worden.
 * Behalve de gevraagde data stuurt de server ook steeds de actuele synchroon,
 * zodat de browser kan bepalen of de data in sessionStorage nog actueel is.
 *
 * Indien data compleet is, is de data in sessionStorage actueel.
 * Indien data niet compleet is, leest de browser de data van de server,
 * want niet complete data kan nog veranderen en compleet worden op de server.
 *
 * De objecten voor data, club, seizoen, enz. hebben een Index naar een object lager in de hiërarchie.
 * De objecten voor club, seizoen, enz. verwijzen naar een object hoger in de hiërarchie.
 */
const data = dataMaken();

function dataMaken() {
    const club = [];

    function clubIndex(clubCode) {
        return club.findIndex(function(eenClub) {
            return eenClub.clubCode === clubCode;
        })
    }

    function eenClub(clubCode) {
        const index = clubIndex(clubCode);
        return club[index < 0 ? 0 : index]; // eerste of gevonden club
    }

    return Object.freeze( {
        club,
        clubIndex, // (clubCode)
        eenClub    // (clubCode)
    });
}

function clubToevoegen(compleet, object) {
    const club = clubMaken(compleet, object);
    if (club) {
        const clubIndex = data.clubIndex(club.clubCode);
        if (clubIndex >= 0) {
            console.log(`${club.clubCode}: ${data.club[clubIndex].vereniging} overschrijft ${club.vereniging}`);
            data.club[clubIndex] = club;
        } else {
            data.club.push(club);
        }
    }
    return club;
}

// clubCode int
const WAAGTOREN = 0;
const WAAGTOREN_JEUGD = 1;

function clubMaken(compleet, object) {
    const { clubCode, vereniging, teamNaam } = object;
    if (typeof clubCode !== 'number') {
        return null;
    }
    const clubTekst = `${clubCode}: ${vereniging} teamNaam: ${teamNaam}`;

    function clubAfdrukken() {
        console.log(clubTekst);
        return this;
    }

    const seizoenen = [];
    const seizoen = [];

    function seizoenIndex(seizoenCode) {
        const index = seizoenen.indexOf(seizoenCode);
        return seizoen[index < 0 ? seizoenen.length - 1 : index]; // laatste of gevonden seizoen
    }

    function zonderSeizoen() {
        return { compleet: compleet, clubCode: clubCode, vereniging: vereniging, teamNaam: teamNaam };
    }

    return Object.freeze({
        compleet,
        clubCode,
        vereniging,
        teamNaam,
        clubTekst,
        clubAfdrukken,  // () ->
        seizoenen,
        seizoen,
        seizoenIndex,   // (seizoenCode) ->
        zonderSeizoen // ()
    });
}

function seizoenToevoegen(compleet, object) {
    const clubIndex = data.clubIndex(object.clubCode);
    if (clubIndex < 0) {
        return null;
    }
    const club = data.club[clubIndex];
    const seizoen = seizoenMaken(compleet, object);
    if (seizoen) {
        club.seizoenen.push(seizoen.seizoen); // voor seizoenIndex() in club
        club.seizoen.push(seizoen);
    }
    return seizoen;
}

/* seizoen char(4)
Seizoenen volgen elkaar standaard op: "1819", "1920", "2021", enz.
De Waagtoren Jeugd en andere schaakverenigingen hebben een voorjaar en najaar competitie
met de seizoensovergangen in januari en juli. Bijvoorbeeld: "2309", "2401", "2409", enz.
 */
function seizoenMaken(compleet, object) {
    const { clubCode, seizoen } = object;
    if (seizoen.length > 4) {
        return null;
    }
    const seizoenTekst = clubCode === WAAGTOREN_JEUGD
        ? `${Number(seizoen.substring(2, 4)) > 6 ? "najaar" : "voorjaar"} 20${seizoen.substring(0, 2)}`
        : `20${seizoen.substring(0, 2)}-20${seizoen.substring(2, 4)}`;

    function seizoenAfdrukken() {
        console.log(`${clubCode}: ${seizoenTekst}`);
        return this;
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

    const teams = [];
    const team = [];

    function zonderTeam() {
        return { compleet: compleet, clubCode: clubCode, seizoen: seizoen };
    }

    return Object.freeze({
        compleet,
        clubCode,
        seizoen,
        seizoenTekst,
        seizoenAfdrukken, // () ->
        seizoenDaarna,    // (seizoen)
        teams,
        team,
        zonderTeam
    });
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

// TODO teamVoluit uitsluitend op server en voluit: in object naar browser

function teamVoluit(teamCode) { // TODO omschrijving uit database (eerst team en competitie uitsplitsen?)
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
        return "Waagtoren NHSB beker";
    } else if (teamCode === "nbz") {
        return "Waagtoren NHSB beker (zilver)";
    } else if (teamCode === "nbb") {
        return "Waagtoren NHSB beker (brons)";
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

function wedstrijdVoluit(ronde) {
    const eigenTeam = teamVoluit(ronde.teamCode);
    return ronde.uithuis === THUIS ? eigenTeam + " - " + ronde.tegenstander : ronde.tegenstander + " - " + eigenTeam;
}

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
const MENU = "menu"; // TODO verplaatsen naar html.js

export { // ES6 voor browser,
    vragen,

    key,                   // (object)

    // mutatie.invloed
    GEEN_INVLOED,
    OPNIEUW_INDELEN,
    NIEUWE_RANGLIJST,

    data,
    dataMaken,
    clubToevoegen,         // (compleet, object)

    // clubCode int
    WAAGTOREN,
    WAAGTOREN_JEUGD,

    clubMaken,             // (synchroon, object)
    seizoenToevoegen,      // (synchroon, object)
    seizoenMaken,          // (synchroon, object)

    // teamCode char(3)
    INTERNE_COMPETITIE,
    RAPID_COMPETITIE,
    JEUGD_COMPETITIE,
    SNELSCHAKEN,
    ZWITSERS_TEST,

    isCompetitie,          // (team)
    isBekerCompetitie,     // (team)
    isTeam,                // (team)
    teamVoluit,            // (teamCode)

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
