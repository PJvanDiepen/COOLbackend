"use strict";

import * as html from "./html.js";

import * as zyq from "./zyq.js";

/*
    verwerk leden=0
           &ronde=<rondeNummer>
 */

const alleLeden = Number(html.params.get("leden"));

(async function() {
    await zyq.init();
    zyq.competitieTitel();
    const rondeNummer = Number(html.params.get("ronde")) || zyq.o_o_o.vorigeRonde || 1;
    await zyq.menu([]);
    await zyq.teamSelecteren(zyq.o_o_o.competitie);
    await zyq.rondeSelecteren(zyq.o_o_o.competitie, rondeNummer);
    const versies = [
        [0, "versie 0 volgens reglement interne competitie van het seizoen"],
        [2, "versie 2 met afzeggingenaftrek zoals in seizoen = 1819, 1920, 2021"],
        [3, "versie 3 zonder afzeggingenaftrek vanaf seizoen = 2122"],
        [4, "versie 4 volgens reglement rapid competitie"],
        [5, "versie 5 voor snelschaken"]];
    html.selectie("versies", zyq.o_o_o.versie, versies, function (versie) {
        html.zelfdePagina(`versie=${versie}`);
    });
    const ledenFun = function (leden) {
        html.zelfdePagina(`leden=${leden}`);
    };
    const welkeLeden = [
        [0, "alleen actieve leden", ledenFun],
        [1, "inclusief niet actieve spelers", ledenFun]];
    html.selectie("leden", alleLeden, welkeLeden, ledenFun);
    await spelersLijst(rondeNummer,
        document.getElementById("kop"),
        document.getElementById("tabel"),
        document.getElementById("promoties"));
})();

async function spelersLijst(rondeNummer, kop, lijst) {
    kop.innerHTML = zyq.seizoenVoluit(zyq.o_o_o.seizoen) + html.SCHEIDING + "ranglijst na ronde " + rondeNummer;
    let i = 0;
    const winnaars = {}; // voor winnaarSubgroep() in totalen
    const spelers = await zyq.ranglijst(rondeNummer);
    for (const speler of spelers) {
        if (speler.intern() || speler.oneven() || speler.extern() || alleLeden) {
            lijst.append(html.rij(
                ++i,
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
        }
    }
}

function ledenSelecteren(leden) {
    leden.append(html.optie(0, "alleen actieve leden"));
    leden.append(html.optie(1, "inclusief niet actieve spelers"));
    leden.value = alleLeden;
    leden.addEventListener("input",
        function () {
            html.zelfdePagina(`leden=${leden.value}`);
        })
}
