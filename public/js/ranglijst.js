"use strict";

import * as html from "./html.js";
import * as db from "./db.js";

import {o_o_o, init, teamSelecteren, rondeSelecteren, ranglijst} from "./o_o_o.js"

import * as zyq from "./zyq.js";

/*
    verwerk ronde=<rondeNummer>
           &leden=<alleleden> alle leden of alleen actieve leden
           &minimum=<minimumVoorkeur> minimum aantal externe wedstrijden
 */
(async function() {
    await init();
    db.competitieTitel();
    const rondeNummer = Number(html.params.get("ronde")) || o_o_o.vorigeRonde || 1;
    await html.menu(zyq.gebruiker.mutatieRechten,[db.WEDSTRIJDLEIDER, "Rondenlijst", function () {
        html.anderePagina("rondenlijst.html");
    }]);
    await teamSelecteren(o_o_o.competitie);
    await rondeSelecteren(o_o_o.competitie, rondeNummer);
    const versies = [
        [0, "versie 0 volgens reglement interne competitie van het seizoen"],
        [2, "versie 2 met afzeggingenaftrek zoals in seizoen = 1819, 1920, 2021"],
        [3, "versie 3 zonder afzeggingenaftrek vanaf seizoen = 2122"]];
    html.selectie(html.id("versies"), o_o_o.versie, versies, function (versie) {
        html.zelfdePagina(`versie=${versie}`);
    });
    const alleLeden = Number(html.params.get("leden")); // 0 indien niet alleLeden
    const optiesLeden = [
        [0, "alleen actieve leden"],
        [1, "inclusief niet actieve spelers"]];
    html.selectie(html.id("leden"), alleLeden, optiesLeden, function (leden) {
        html.zelfdePagina(`leden=${leden}`);
    });
    const minimumVoorkeur = Number(html.params.get("minimum")) || 5;
    const minimumOpties = [
        [4, "minimaal 4 externe partijen"],
        [5, "minimaal 5 externe partijen"],
        [6, "minimaal 6 externe partijen"]];
    html.selectie(html.id("minimum"), minimumVoorkeur, minimumOpties, function (minimum) {
        html.zelfdePagina(`minimum=${minimum}`);
    });
    html.id("kop").textContent =
        `${zyq.seizoenVoluit(o_o_o.seizoen)}${html.SCHEIDING}ranglijst na ronde ${rondeNummer}`;
    const lijst = html.id("tabel");
    const spelers = (await ranglijst(rondeNummer)).filter(function (speler) {
        return speler.intern() || speler.oneven() || speler.extern() || alleLeden;
    });

    const externeWinnaars = externeScores(spelers, minimumVoorkeur);
    const winnaars = {}; // voor winnaarSubgroep() in totalen
    let rangnummer = 0;
    for (const speler of spelers) {
        rangnummer++;
        const externeWinnaar = externeWinnaars.find(function (winnaar) {
            return winnaar.knsbNummer === speler.knsbNummer;
        });
        lijst.append(html.rij(
            rangnummer,
            zyq.naarSpeler(speler),
            speler.intern() || speler.oneven() ? speler.punten() : "",
            speler.winnaarSubgroep(winnaars),
            speler.rating(),
            speler.scoreIntern(),
            speler.percentageIntern(),
            speler.saldoWitZwart() ? speler.saldoWitZwart() : "",
            speler.oneven() ? speler.oneven() : "",
            speler.scoreExtern(),
            speler.percentageExtern(),
            externeWinnaar ? externeWinnaar.winnaar : ""));
    }
})();

function externeScores(spelers, minimum) {
    const lijst = [];
    for (const speler of spelers) {
        if (speler.extern()) {
            lijst.push({
                knsbNummer: speler.knsbNummer,
                naam: speler.naam, // overbodig
                score: speler.scoreGetalExtern(),
                aantal: speler.extern(),
                winnaar: ""
            });
        }
    }
    lijst.sort(function (een, ander) {
        if (ander.score < een.score) {
            return -1;
        } else if (ander.score > een.score) {
            return 1;
        } else {
            return ander.aantal - een.aantal;
        }
    });
    let hoogsteScore = 0.0;
    for (const speler of lijst) {
        if (speler.aantal < minimum && speler.score >= hoogsteScore) {
            speler.winnaar = "+";
        } else if (speler.score >= hoogsteScore) {
            speler.winnaar = "*";
            hoogsteScore = speler.score;
        }
    }
    return lijst;
}