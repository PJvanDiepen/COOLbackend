/*
 * Deze module bevat alle code die op meer dan een pagina van de 0-0-0 app wordt toegepast.
 *
 * De eerste pagina van 0-0-0.nl staat in index.html en start.html is de pagina, die de 0-0-0 app start.
 * De bijhorende start.js verwerkt de url, vult de pagina aan en reageert op de gebruiker.
 *
 * Dit geldt voor alle vervolg pagina's. Bij agenda.html hoort agenda.js, bij bestuur.html hoort bestuur.js en zo voort.
 * Daarnaast zijn er modules:
 *
 * html.js bevat alle code voor voor interactie met HTML en CSS
 * db.js bevat alle code voor het valideren van de velden in de tabellen van de MySQL database
 * en zo voort
 */

import * as html from "./html.js";
import * as db from "./db.js";

import * as zyq from "./zyq.js"; // TODO verwijderen

/**
 * teamSelecteren voor ranglijst.js en team.js
 *
 * TODO bijna hetzelfde als start.js: competitieSelecteren en teamlijder.js: teamSelecteren
 *
 * @param teamCode team of competitie
 * @returns {Promise<void>}
 */
export async function teamSelecteren(teamCode) {
    const teams = (await zyq.localFetch("/teams/" + zyq.o_o_o.seizoen)).filter(function (team) {
        return zyq.teamOfCompetitie(team.teamCode);
    }).map(function (team) {
        return [team.teamCode, zyq.teamVoluit(team.teamCode)];
    });
    html.selectie(html.id("teamSelecteren"), teamCode, teams, function (team) {
        if (zyq.interneCompetitie(team)) {
            html.anderePagina(`ranglijst.html?competitie=${team}`);
        } else {
            html.anderePagina(`team.html?team=${team}`);
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
    zyq.o_o_o.team = zyq.o_o_o.competitie;
    const ronden = (await zyq.localFetch("/ronden/" + zyq.o_o_o.seizoen + "/" + teamCode)).map(function (ronde) {
        return [ronde.rondeNummer, zyq.datumLeesbaar(ronde) + html.SCHEIDING + "ronde " + ronde.rondeNummer];
    });
    html.selectie(html.id("rondeSelecteren"), rondeNummer, ronden, function (ronde) {
        html.anderePagina(`ronde.html?ronde=${ronde}`);
    });
}

/**
 * perTeamRondenUitslagen voor ronde.js, team.js en teamleider.js TODO ook voor start.js
 *
 * @param teamCode team
 * @returns {Promise<*[]>} rondenUitslagen
 *
 * rondenUitslagen is een lijst van ronden
 * met per ronde: ronde informatie, aantal keer winst, remise en verlies en een lijst met uitslagen
 * met per uitslag: bordNummer, speler, kleur en resultaat
 */
export async function perTeamRondenUitslagen(teamCode) {
    const rondenUitslagen = [];
    (await zyq.localFetch(`/ronden/${zyq.o_o_o.seizoen}/${teamCode}`)).forEach(
        function (ronde) {
            rondenUitslagen[ronde.rondeNummer] = {ronde: ronde, winst: 0, remise: 0, verlies: 0, uitslagen: []};
        });
    (await zyq.localFetch(`/team/${zyq.o_o_o.seizoen}/${teamCode}`)).forEach(
        function (uitslag) {
            const rondeUitslag = rondenUitslagen[uitslag.rondeNummer];
            if (uitslag.resultaat === db.WINST) {
                rondeUitslag.winst += 1;
            } else if (uitslag.resultaat === db.REMISE) {
                rondeUitslag.remise += 1;
            } else if (uitslag.resultaat === db.VERLIES) {
                rondeUitslag.verlies += 1;
            }
            rondeUitslag.uitslagen.push(uitslag);
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
export async function ranglijst(rondeNummer, selectie) {
    const totDatum = rondeNummer === zyq.o_o_o.laatsteRonde ? zyq.eindeSeizoen(zyq.o_o_o.seizoen) : zyq.o_o_o.ronde[rondeNummer + 1].datum;
    let spelers = await zyq.localFetch(
        `/ranglijst/${zyq.o_o_o.seizoen}/${zyq.o_o_o.competitie}/${rondeNummer}/${zyq.datumSQL(totDatum)}/${zyq.o_o_o.versie}`);
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
[19] partijenVerschil
tegenstanders met n = 0, 4, 8, enz.
[20 + n] rondeNummer
[21 + n] kleur (0 = wit, 1 = zwart)
[22 + n] tegenstander
[23 + n] resultaat (0 = verlies, 1 = remise, 2 = winst)
einde indien rondeNummer = 0

TODO spelerTotalen moeten compleet zijn tot een bepaalde datum en rondeNummer inclusief de tellingen, dat moet op server geregeld worden
 */
function spelerTotalen(speler) {
    const knsbNummer = Number(speler.knsbNummer);
    const naam = speler.naam;
    const subgroep = speler.subgroep;
    const totalen = speler.totalen.split(" ").map(Number);

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

    function percentageExtern() {
        return zyq.percentage(totalen[3],totalen[15],totalen[16]);
    }

    function saldoWitZwartExtern() {
        return totalen[17] - totalen[18];
    }

    function partijenVerschil() {
        return totalen[19];
    }

    function tegen(tegenstander)  {
        const zelfdeTegenstander = vorigeKeer(tegenstander);
        if (zelfdeTegenstander) {
            afdrukken(tegenstander, totalen[zelfdeTegenstander + 1], `in ronde ${totalen[zelfdeTegenstander]}`);
            const partijenGeleden = laatsteKeer(tegenstander);
            if (partijenGeleden < partijenVerschil()) {
                console.log(`${naam} speelde ${partijenGeleden} partijen geleden tegen ${tegenstander.naam}`);
                return false; // indien minder dan partijenVerschil tegen gespeeld
            }
        }
        return true; // nog niet tegen gespeeld of mag nog een keer tegen spelen
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

    function laatsteKeer(tegenstander) {
        let i = 20;
        let partijenGeleden = 1000;
        while (totalen[i]) { // indien rondeNummer
            if (totalen[i + 2] === tegenstander.knsbNummer) { // indien zelfde tegenstander
                partijenGeleden = 1;
            } else {
                partijenGeleden++;
            }
            i = i + 4; // volgende rondeNummer, kleur (0 = wit, 1 = zwart), knsbNummer en resultaat (0 = verlies, 1 = remise, 2 = winst)
        }
        return partijenGeleden; // laatsteKeer zelfde tegenstander was partijenGeleden of groter dan 1000
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
        percentageExtern,
        saldoWitZwartExtern,
        partijenVerschil,
        tegen,
        vorigeKleur,
        metWit
    });
}