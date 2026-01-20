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
 * In de browser verzorgt server.js het synchroniseren met de server aan de hand van synchroon en boom.
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
    mutaties: {} // alle mutaties op de server sinds de start van de server
}

function mutatiesBijwerken(key) {
    synchroon.mutaties[key] = ++synchroon.revisie;
}

/**
 * TODO verwijderen
 *
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

/**
 * groei laat eventueel takken groeien en klim in de boom aan de hand van gevraagde informatie in object.
 *
 * @param object gevraagde informatie
 * @returns {Promise<*[]>} tak met club, seizoen, team, ronde, uitslag of minder
 */
async function groei(object) {
    const tak = [];
    await alleClubs();
    if ((tak[0] = clubTak(object.clubCode))) {
        await tak[0].alleSeizoenen();
        if ((tak[1] = tak[0].seizoenTak(object.seizoen))) {
            await tak[1].alleTeams();
            if ((tak[2] = tak[1].teamTak(object.teamCode))) {
                await tak[2].alleRonden();
                tak[3] = tak[2].rondeTak(object.rondeNummer);
                if ((tak[3] = tak[2].rondeTak(object.rondeNummer))) {
                    await tak[3].alleUitslagen();
                    tak[4] = tak[3].uitslagTak(object.knsbNummer);
                }
            }
        }
    }
    return tak;
}

/**
 * klim in de boom aan de hand van gevraagde informatie in object.
 *
 * @param object gevraagde informatie
 * @returns tak met club, seizoen, team, ronde, uitslag of minder
 */
function klim(object) {
    const tak = [];
    if ((tak[0] = clubTak(object.clubCode))) {
        if ((tak[1] = tak[0].seizoenTak(object.seizoen))) {
            if ((tak[2] = tak[1].teamTak(object.teamCode))) {
                tak[3] = tak[2].rondeTak(object.rondeNummer);
                if ((tak[3] = tak[2].rondeTak(object.rondeNummer))) {
                    tak[4] = tak[3].uitslagTak(object.knsbNummer);
                }
            }
        }
    }
    return tak;
}

async function alleClubs() {
    if (boom.club.length === 0) {
        boom.club.splice(0, 0, ...(await boom.leesClubs()).map(clubMaken));
    }
    return boom.club;
}

function clubTak(clubCode) {
    const index = boom.club.findIndex(function(eenClub) {
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
            seizoen.splice(0, 0, ...(await boom.leesSeizoenen(object)).map(seizoenMaken));
        }
        return seizoen;
    }

    function seizoenTak(seizoenCode) {
        const index = seizoen.findIndex(function(eenSeizoen) {
            return eenSeizoen.seizoen === seizoenCode;
        });
        if (index < 0) {
            console.log(`seizoenTak(${clubCode}, ${seizoenCode}) niet gevonden`);
            return undefined;
        }
        return seizoen[index];
    }

    return Object.freeze({
        object,
        clubCode,      // key
        vereniging,
        teamNaam,
        clubTekst,
        seizoen,
        alleSeizoenen, // ()
        seizoenTak     // (seizoenCode)
    });
}

/* seizoen char(4)
Seizoenen volgen elkaar standaard op: "1819", "1920", "2021", enz.
De Waagtoren Jeugd en andere schaakverenigingen hebben een voorjaar en najaar competitie
met de seizoensovergangen in januari en juli. Bijvoorbeeld: "2309", "2401", "2409", enz.
 */
function seizoenMaken(object) {
    const {
        clubCode,
        seizoen // geen seizoen in database en daarom is seizoenCode niet nodig
    } = object;
    // TODO seizoenTekst in plaats van seizoenVoluit
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
            team.splice(0, 0, ...(await boom.leesTeams(object)).map(teamMaken));
        }
        return team;
    }

    function teamTak(teamCode) {
        const index = team.findIndex(function(eenTeam) {
            return eenTeam.teamCode === teamCode;
        });
        if (index < 0) {
            console.log(`teamTak(${clubCode}, ${seizoen}), ${teamCode}) niet gevonden`);
            return undefined;
        }
        return team[index];
    }

    return Object.freeze({
        object,
        clubCode,
        seizoen,       // key vanaf clubCode
        seizoenTekst,
        seizoenDaarna, // ()
        team,
        alleTeams,     // ()
        teamTak        // (teamCode)
    });
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
            ronde.splice(0, 0, ...(await boom.leesRonden(object)).map(rondeMaken));
        }
        return ronde;
    }

    const actueel = [];

    async function actueleRonden() {
        await alleRonden();
        actueel.length = 0; // begin met alleRonden en geen actuele ronden
        for (const eenRonde of ronde) {
            if (await eenRonde.uitslagenInvullen()) {
                actueel.push(eenRonde);
            }
        }
        return actueel;
    }

    function rondeTak(rondeNummer) {
        const index = ronde.findIndex(function(eenRonde) {
            return eenRonde.rondeNummer === rondeNummer;
        });
        if (index < 0) {
            console.log(`rondeTak(${clubCode}, ${seizoen}, ${teamCode}, ${rondeNummer}) niet gevonden`);
            return undefined;
        }
        return ronde[index];
    }

    return Object.freeze({
        object,
        clubCode,
        seizoen,
        teamCode,      // key vanaf clubCode
        reglement,
        maand,
        jaar,
        bond,          // TODO verwijderen
        poule,         // TODO verwijderen
        omschrijving,
        borden,
        teamleider,    // TODO verwijderen
        teamTekst,
        ronde,
        alleRonden,    // ()
        actueleRonden, // ()
        rondeTak       // (rondeNummer)
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

function teamVoluit(teamCode) { // TODO naar teamMaken en leesCompetities
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
    // TODO rondeTekst in plaats van wedstrijdVoluit
    const rondeTekst = isCompetitie(object)
        ? `${teamVoluit(teamCode)}` // competitieronde
        : uithuis === THUIS
        ? `${teamVoluit(teamCode)} - ${tegenstander}` // thuiswedstrijd
        : `${tegenstander} - ${teamVoluit(teamCode)}`; // uitwedstrijd
    console.log(`rondeMaken = ronde ${rondeNummer} ${rondeTekst}`);
    if (typeof rondeNummer !== "number") {
        console.log("rondeNummer niet numeriek");
        return undefined;
    }

    const uitslag = [];

    async function alleUitslagen() {
        if (uitslag.length === 0) {
            uitslag.splice(0, 0, ...(await boom.leesUitslagen(object)).map(uitslagMaken));
        }
        return uitslag;
    }

    async function uitslagenInvullen() {
        await alleUitslagen();
        for (const eenUitslag of uitslag) {
            if (eenUitslag.zonderResultaat()) {
                return true; // indien geen resultaat dan nog uitslagenInvullen
            }
        }
        return false; // alle uitslagen zijn ingevuld
    }

    function uitslagTak(knsbNummer) {
        const index = uitslag.findIndex(function(eenUitslag) {
            return eenUitslag.knsbNummer === knsbNummer;
        });
        if (index < 0) {
            console.log(`uitslagTak(${clubCode}, ${seizoen}), ${teamCode}, ${rondeNummer}, ${knsbNummer}) niet gevonden`);
            return undefined;
        }
        return uitslag[index];
    }

    return Object.freeze({
        object,
        clubCode,
        seizoen,
        teamCode,
        rondeNummer,       // key vanaf clubCode
        uithuis,
        tegenstander,
        datum,
        rondeTekst,
        uitslag,
        alleUitslagen,     // ()
        uitslagenInvullen, // ()
        uitslagTak         // (knsbNummer)
    });
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

    function zonderResultaat() {
        if (planningInvullen.has(partij)) {
            return true;
        } else if (partij === EXTERNE_PARTIJ || geenPartijInvullen.has(partij)) {
            return false; // externe partij of geen partij tijdens interne competitie is wel resultaat
        } else if (resultaatInvullen.has(resultaat)) {
            return resultaat === ""; // blanko is geen resultaat
        }
    }

    return Object.freeze({
        object,
        clubCode,
        seizoen,
        teamCode,
        rondeNummer,
        bordNummer,         // niet in key
        knsbNummer,         // key vanaf clubCode
        partij,
        witZwart,
        tegenstanderNummer,
        resultaat,
        datum,
        competitie,
        uitslagTekst,
        zonderResultaat     // ()
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
const AFWEZIG              = "a"; // TODO verwijderen?
const EXTERNE_PARTIJ       = "e";
const INTERNE_PARTIJ       = "i";
const MEEDOEN              = "m"; // na aanmelden voor interne partij
const NIET_MEEDOEN         = "n"; // na afzeggen voor interne partij
const ONEVEN               = "o";
const PLANNING             = "p"; // TODO verwijderen
const REGLEMENTAIRE_REMISE = "r"; // bye of vrijgesteld
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
    [PLANNING, MEEDOEN], // TODO verwijderen
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

module.exports = { // CommonJS voor node.js
    synchroon,
    mutatiesBijwerken,     // (key)
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
    groei,                 // (object)
    klim,                  // (object)
    alleClubs,             // ()
    clubTak,               // (object)
    // clubCode int
    WAAGTOREN,
    WAAGTOREN_JEUGD,
    clubMaken,             // (object)
    seizoenMaken,          // (object)
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
    rondeMaken,            // (object)
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
    REGLEMENTAIRE_REMISE,  // bye of vrijgesteld
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
    gebruikerFunctie       // (speler)
}