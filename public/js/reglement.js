/*
 * Deze module bevat code voor alle ranglijst berekeningen zoals die zijn vastgelegd in het reglement.
 */

import { o_o_o } from "./o_o_o.js";

import * as zyq from "./zyq.js";
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
TODO naar reglement.js
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