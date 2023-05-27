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
    zyq.menu([]);
    zyq.teamSelecteren(zyq.o_o_o.competitie);
    zyq.rondeSelecteren(zyq.o_o_o.competitie, rondeNummer);
    versieSelecteren(document.getElementById("versies"));
    ledenSelecteren(document.getElementById("leden"));
    spelersLijst(rondeNummer,
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

function versieSelecteren(versies) {  // TODO: versies en teksten in database
    versies.append(html.optie(0, "versie 0 volgens reglement interne competitie van het seizoen"));
    versies.append(html.optie(2, "versie 2 met afzeggingenAftrek zoals in seizoen = 1819, 1920, 2021"));
    versies.append(html.optie(3, "versie 3 zonder afzeggingenAftrek vanaf seizoen = 2122"));
    versies.append(html.optie(4, "versie 4 volgens reglement rapid competitie"));
    versies.append(html.optie(5, "versie 5 voor snelschaken"));
    versies.value = zyq.o_o_o.versie;
    versies.addEventListener("input",
        function () {
            html.zelfdePagina(`versie=${versies.value}`);
        });
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
