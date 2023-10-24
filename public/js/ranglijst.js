"use strict";

import * as html from "./html.js";

import {teamSelecteren, rondeSelecteren, ranglijst} from "./o_o_o.js"

import * as zyq from "./zyq.js";

/*
    verwerk leden=<alleleden>&ronde=<rondeNummer>
 */
(async function() {
    await zyq.init();
    zyq.competitieTitel();
    const rondeNummer = Number(html.params.get("ronde")) || zyq.o_o_o.vorigeRonde || 1;
    await html.menu(zyq.gebruiker.mutatieRechten,[]);
    await teamSelecteren(zyq.o_o_o.competitie);
    await rondeSelecteren(zyq.o_o_o.competitie, rondeNummer);
    const versies = [
        [0, "versie 0 volgens reglement interne competitie van het seizoen"],
        [2, "versie 2 met afzeggingenaftrek zoals in seizoen = 1819, 1920, 2021"],
        [3, "versie 3 zonder afzeggingenaftrek vanaf seizoen = 2122"],
        [4, "versie 4 volgens reglement rapid competitie"],
        [5, "versie 5 voor snelschaken"]];
    html.selectie(html.id("versies"), zyq.o_o_o.versie, versies, function (versie) {
        html.zelfdePagina(`versie=${versie}`);
    });
    const alleLeden = Number(html.params.get("leden")); // 0 indien niet alleLeden
    const optiesLeden = [
        [0, "alleen actieve leden"],
        [1, "inclusief niet actieve spelers"]];
    html.selectie(html.id("leden"), alleLeden, optiesLeden, function (leden) {
        html.zelfdePagina(`leden=${leden}`);
    });
    html.id("kop").innerHTML = zyq.seizoenVoluit(zyq.o_o_o.seizoen) + html.SCHEIDING + "ranglijst na ronde " + rondeNummer;
    const lijst = html.id("tabel");
    const winnaars = {}; // voor winnaarSubgroep() in totalen
    (await ranglijst(rondeNummer)).filter(function (speler) {
        return speler.intern() || speler.oneven() || speler.extern() || alleLeden;
    }).forEach(function (speler, rangnummer) {
        lijst.append(html.rij(rangnummer + 1,
            zyq.naarSpeler(speler),
            speler.intern() || speler.oneven() ? speler.punten() : "",
            speler.winnaarSubgroep(winnaars),
            speler.rating(),
            speler.scoreIntern(),
            speler.percentageIntern(),
            speler.saldoWitZwart() ? speler.saldoWitZwart() : "",
            speler.oneven() ? speler.oneven() : "",
            speler.scoreExtern(),
            speler.percentageExtern()));
    });
})();