/*
 * Deze module bevat globale variabelen en code die op meer dan een pagina wordt gebruikt.
 *
 * De eerste pagina van 0-0-0.nl staat in index.html en start.html is de pagina, die de 0-0-0 app start.
 * De bijhorende start.js verwerkt de url, vult de pagina aan en reageert op de gebruiker.
 *
 * Dit geldt voor alle vervolg pagina's. Bij agenda.html hoort agenda.js, bij bestuur.html hoort bestuur.js en zo voort.
 * Daarnaast zijn er modules:
 *
 * html.js bevat alle code voor interactie met HTML en CSS
 * db.js bevat alle code voor het valideren van de velden in de tabellen van de MySQL database
 * en zo voort
 */

import * as html from "./html.js";
import * as db from "./db.js";

import * as zyq from "./zyq.js";

export const data = db.dataToevoegen();

/**
 * init voor aanmelden.js
 *           agenda.js
 *           beheer.js
 *           bestuur.js
 *           email.js
 *           indelen.js
 *           lid.js
 *           paren.js
 *           ranglijst.js
 *           ronde.js
 *           rondenlijst.js
 *           speler.js
 *           start.js
 *           team.js
 *
 * Elke verwerking van een pagina van 0-0-0 begint met init(), eventueel competitieTitel() en het verwerken van mutaties.
 * Daarna pagina maken en mutaties markeren met gewijzigd() en meestal een menu().
 */
export async function init() {
    console.log("--- start init ---");
    await synchroniseren();
    urlVerwerken();
    versieBepalen();
    await zyq.gebruikerVerwerken();

    let test = await html.vraagAanServer("/club");
    test.afdrukken();
    // test.invullen({ club: o_o_o.club}).vraag();

    o_o_o.seizoen = "2324";
    o_o_o.competitie = db.INTERNE_COMPETITIE;

    console.log(o_o_o);
    console.log(zyq.gebruiker);
    console.log("--- test init ---");

    Object.assign(zyq.o_o_o, o_o_o); // TODO voorlopig i.v.m.
    // await zyq.competitieRondenVerwerken();


    /* TODO zyq.localFetch vervangen door iets wat revisie controleert
    const {revisie, club, seizoenen} = await zyq.localFetch(`/${o_o_o.club}/club`);
    data.club = db.clubToevoegen(club).seizoenToevoegen(seizoenen);
    console.log("--- einde init ---")
    console.log(o_o_o);
     */
}

async function synchroniseren() {
    const urlSynchroon = "/synchroon";
    const nietSynchroon = JSON.parse(sessionStorage.getItem(urlSynchroon));
    Object.assign(html.synchroon, await html.vraagServer(urlSynchroon));
    if (!nietSynchroon || html.synchroon.serverStart > nietSynchroon.serverStart) {
        verwijderNietSynchroon(); // na herstart server is niets actueel
    }
    sessionStorage.setItem(urlSynchroon, JSON.stringify(html.synchroon));
    const vragen = await html.vraagLokaal("/vragen");
    db.vragen.push(...vragen);
}

function verwijderNietSynchroon() {
    const verwijderen = [];
    for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key.startsWith("/")) { // indien url
            verwijderen.push(key);
        }
    }
    for (const key of verwijderen) {
        sessionStorage.removeItem(key);
    }
}

export const o_o_o = {
    vereniging: "",
    club: 0, // clubCode is een getal
    seizoen: "",
    versie: 0, // versie is een getal
    competitie: "",
    team: "",
    speler: 0, // knsbNummer is een getal
    naam: ""
};

function urlVerwerken() {
    for (const [key, value] of Object.entries(o_o_o)) {
        let parameter = html.params.get(key); // inlezen van url
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

function versieBepalen() { // TODO reglement in team i.p.v. versie
    if (o_o_o.competitie === db.INTERNE_COMPETITIE && o_o_o.versie === 0) {
        if (o_o_o.seizoen === "1819" || o_o_o.seizoen === "1920" || o_o_o.seizoen === "2021") {
            o_o_o.versie = 2;
        } else {
            o_o_o.versie = 3; // vanaf seizoen 2021-2022
        }
    } else if (o_o_o.competitie === db.RAPID_COMPETITIE && o_o_o.versie === 0) {
        o_o_o.versie = 4;
    } else if (o_o_o.competitie.substring(1,2) === "z" && o_o_o.versie === 0) {
        o_o_o.versie = 5; // Zwitsers systeem
    } else if (o_o_o.competitie === db.JEUGD_COMPETITIE && o_o_o.versie === 0) {
        o_o_o.versie = 6;
    }
}

export function competitieTitel() { // TODO met (clubCode)
    html.id("competitie").textContent =
        `Waagtoren${html.SCHEIDING}${db.teamVoluit(o_o_o.competitie)}`;
}

/**
 * vinkjeInvullen voor agenda.js en teamleider.js
 *
 * @type {Map<string, string>}
 */
export const vinkjeInvullen = new Map([
    [db.PLANNING, html.VRAAGTEKEN],
    [db.NIET_MEEDOEN, html.STREEP],
    [db.MEEDOEN, html.VINKJE],
    [db.EXTERN_THUIS, html.VINKJE],
    [db.EXTERN_UIT, html.VINKJE],
    [db.INGEDEELD, html.VINKJE],
    [db.TOCH_INGEDEELD, html.VINKJE]]);

/**
 * teamSelecteren voor ranglijst.js en team.js
 *
 * TODO bijna hetzelfde als start.js: competitieSelecteren en teamleider.js: teamSelecteren
 *
 * @param teamCode team of competitie
 * @returns {Promise<void>}
 */
export async function teamSelecteren(teamCode) {
    const teams = (await zyq.localFetch(`/${o_o_o.club}/${o_o_o.seizoen}/teams`)).filter(function (team) {
        return db.isCompetitie(team) || db.isTeam(team);
    }).map(function (team) {
        return [team.teamCode, db.teamVoluit(team.teamCode)];
    });
    html.selectie(html.id("teamSelecteren"), teamCode, teams, function (teamCode) {
        if (teamCode === "" ? false : teamCode.substring(0,1) === "i") {
            html.anderePagina(`ranglijst.html?competitie=${teamCode}`);
        } else {
            html.anderePagina(`team.html?team=${teamCode}`);
        }
    });
}

/**
 * rondeSelecteren voor ranglijst.js en ronde.js
 *
 * @param teamCode team of competitie
 * @param rondeNummer welke ronde
 * @returns {Promise<void>}
 */
export async function rondeSelecteren(teamCode, rondeNummer) {
    o_o_o.team = o_o_o.competitie;
    const ronden = (await zyq.localFetch(`/${o_o_o.club}/${o_o_o.seizoen}/${teamCode}/ronden`)).map(function (ronde) {
        return [ronde.rondeNummer, `${zyq.datumLeesbaar(ronde)}${html.SCHEIDING}ronde ${ronde.rondeNummer}`];
    });
    html.selectie(html.id("rondeSelecteren"), rondeNummer, ronden, function (ronde) {
        html.anderePagina(`ronde.html?ronde=${ronde}`);
    });
}

/**
 * perTeamRondenUitslagen voor ronde.js, team.js en teamleider.js
 *
 * TODO ook voor start.js
 * TODO verplaatsen naar server
 *
 * @param teamCode team
 * @returns {Promise<*[]>} rondenUitslagen
 *
 * rondenUitslagen is een lijst van ronden
 * met per ronde: ronde informatie, aantal keer winst, remise en verlies, een lijst met uitslagen, aantal deelnemers, een lijst met geplandeUitslagen
 * met per uitslag of geplande uitslag: bordNummer, speler (knsbNummer en naam), kleur, resultaat of planning (in partij)
 */
export async function perTeamRondenUitslagen(teamCode) {
    const rondenUitslagen = [];
    (await zyq.serverFetch(`/${o_o_o.club}/${o_o_o.seizoen}/${teamCode}/ronden`)).forEach(
        function (ronde) {
            rondenUitslagen[ronde.rondeNummer]
                = {ronde: ronde, winst: 0, remise: 0, verlies: 0, uitslagen: [], deelnemers: 0, geplandeUitslagen: []};
        });
    (await zyq.serverFetch(`/${o_o_o.club}/${o_o_o.seizoen}/${teamCode}/team`)).forEach(
        function (uitslag) {
            const rondeUitslag = rondenUitslagen[uitslag.rondeNummer];
            if (uitslag.partij === db.EXTERNE_PARTIJ) {
                if (uitslag.resultaat === db.WINST) {
                    rondeUitslag.winst += 1;
                } else if (uitslag.resultaat === db.REMISE) {
                    rondeUitslag.remise += 1;
                } else if (uitslag.resultaat === db.VERLIES) {
                    rondeUitslag.verlies += 1;
                }
                rondeUitslag.uitslagen.push(uitslag);
            } else {
                if (db.isMeedoen(uitslag)) {
                    rondeUitslag.deelnemers += 1;
                }
                rondeUitslag.geplandeUitslagen.push(uitslag);
            }
        });
    return rondenUitslagen;
}

/**
 * ranglijst voor ranglijst.js, speler.js en indelen.js
 *
 * ranglijst geeft lijst totalen van eventueel geselecteerde spelers op volgorde van totalen
 *
 * @param rondeNummer in huidige competitie
 * @param selectie indien null dan alle spelers
 * @returns {Promise<*>}
 */
export async function ranglijst(rondeNummer, selectie = null) {
    const totDatum = rondeNummer === o_o_o.laatsteRonde ? zyq.eindeSeizoen(o_o_o.seizoen) : o_o_o.ronde[rondeNummer + 1].datum;
    let spelers = await zyq.localFetch(
        `/${o_o_o.club}/${o_o_o.seizoen}/${o_o_o.competitie}/${rondeNummer}/ranglijst/${zyq.datumSQL(totDatum)}/${o_o_o.versie}`);
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
[19] minimumPartijenGeleden
tegenstanders met n = 0, 4, 8, enz.
[20 + n] rondeNummer
[21 + n] kleur (0 = wit, 1 = zwart)
[22 + n] tegenstander
[23 + n] resultaat (0 = verlies, 1 = remise, 2 = winst)
einde indien rondeNummer = 0

TODO spelerTotalen moeten compleet zijn tot een bepaalde datum en rondeNummer inclusief de tellingen, dat moet op server geregeld worden
TODO nietTegen per clubCode
 */
function spelerTotalen(speler) {
    const knsbNummer = Number(speler.knsbNummer);
    const naam = speler.naam;
    const subgroep = speler.subgroep;
    const totalen = speler.totalen.split(" ").map(Number);
    const nietTegen =
        knsbNummer === 7640798 ? [8388105] : // vader Johan niet tegen zoon Marijn Wester
        knsbNummer === 8388105 ? [7640798] : // zoon Marijn niet tegen vader Johan Wester
        knsbNummer === 7771665 ? [7777715] : // Yvonne Schol wegens geluid niet tegen Richard Gooijers
        knsbNummer === 8350738 ? [7777715] : // Ramon Witte zegt niets tegen Richard Gooijers
        knsbNummer === 9001586 ? [7777715] : // Abdul Rashid Ayobi spreekt geen Nederlands tegen Richard Gooijers
        knsbNummer === 7777715 ? [7771665, 8350738, 9001586] : []; // Richard Gooijers niet tegen bovenstaande spelers

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
        return zyq.score(totalen[2],totalen[5],totalen[6]);
    }

    function percentageIntern() {
        return zyq.percentage(totalen[2],totalen[5],totalen[6]);
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
        return zyq.score(totalen[3],totalen[15],totalen[16]);
    }

    function scoreGetalExtern() {
        return (totalen[3] + totalen[15] * 0.5) / extern();
    }

    function percentageExtern() {
        return zyq.percentage(totalen[3],totalen[15],totalen[16]);
    }

    function saldoWitZwartExtern() {
        return totalen[17] - totalen[18];
    }

    function minimumPartijenGeleden() {
        return totalen[19];
    }

    function tegen(tegenstander)  {
        if (nietTegen.includes(tegenstander.knsbNummer)) {
            console.log(`${naam} mag niet tegen ${tegenstander.naam}`);
            return false;
        }
        const ronde = vorigeKeer(tegenstander);
        if (ronde && weerTegen(tegenstander) && tegenstander.weerTegen(speler)) {
            afdrukken(tegenstander, totalen[ronde + 1], `wegens kleur in ronde ${totalen[ronde]}`);
            return true; // mogen weerTegen elkaar
        }
        return !ronde; // indien nog niet tegen elkaar gespeeld
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

    function weerTegen(tegenstander) {
        let i = 20;
        let partijenGeleden = minimumPartijenGeleden() + 1;
        while (totalen[i]) { // indien rondeNummer
            if (totalen[i + 2] === tegenstander.knsbNummer) { // zelfde tegenstander
                partijenGeleden = 1;
            } else {
                partijenGeleden++; // andere tegenstander
            }
            i = i + 4; // volgende rondeNummer, kleur (0 = wit, 1 = zwart), knsbNummer en resultaat (0 = verlies, 1 = remise, 2 = winst)
        }
        if (partijenGeleden < minimumPartijenGeleden()) {
            console.log(`${naam} speelde ${partijenGeleden} partijen geleden tegen ${tegenstander.naam}`);
            return false;
        }
        return true; // mag weerTegen
    }

    function tegenstander(rondeNummer) {
        let i = 20;
        while (totalen[i]) { // indien rondeNummer
            if (totalen[i] === rondeNummer) {
                return [totalen[i + 1], totalen[i + 2], totalen[i + 3]];
            }
            i = i + 4; // volgende rondeNummer, kleur (0 = wit, 1 = zwart), knsbNummer en resultaat (0 = verlies, 1 = remise, 2 = winst)
        }
        return [-1, 0, -1]; // geen tegenstander
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
        scoreGetalExtern,
        percentageExtern,
        saldoWitZwartExtern,
        minimumPartijenGeleden,
        tegen,
        weerTegen,
        tegenstander,
        vorigeKleur,
        metWit
    });
}