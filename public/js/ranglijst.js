"use strict";

import * as db from "./db.js";

import * as zyq from "./zyq.js";

/*
    verwerk leden=0
           &ronde=<rondeNummer>
 */

const alleLeden = Number(zyq.params.get("leden"));

(async function() {
    await zyq.init();
    zyq.competitieTitel();
    const rondeNummer = Number(zyq.params.get("ronde")) || zyq.o_o_o.vorigeRonde || 1;
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

async function spelersLijst(rondeNummer, kop, lijst, promoties) {
    kop.innerHTML = zyq.seizoenVoluit(zyq.o_o_o.seizoen) + zyq.SCHEIDING + "ranglijst na ronde " + rondeNummer;
    let i = 0;
    const winnaars = {}; // voor winnaarSubgroep() in totalen
    const spelers = await zyq.ranglijst(rondeNummer);
    for (const speler of spelers) {
        if (speler.intern() || speler.oneven() || speler.extern() || alleLeden) {
            lijst.appendChild(zyq.htmlRij(
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
    versies.appendChild(zyq.htmlOptie(0, "versie 0 volgens reglement interne competitie van het seizoen"));
    versies.appendChild(zyq.htmlOptie(2, "versie 2 met afzeggingenAftrek zoals in seizoen = 1819, 1920, 2021"));
    versies.appendChild(zyq.htmlOptie(3, "versie 3 zonder afzeggingenAftrek vanaf seizoen = 2122"));
    versies.appendChild(zyq.htmlOptie(4, "versie 4 volgens reglement rapid competitie"));
    versies.appendChild(zyq.htmlOptie(5, "versie 5 voor snelschaken"));
    versies.value = zyq.o_o_o.versie;
    versies.addEventListener("input",
        function () {
            zyq.naarZelfdePagina(`versie=${versies.value}`);
        });
}

function ledenSelecteren(leden) {
    leden.appendChild(zyq.htmlOptie(0, "alleen actieve leden"));
    leden.appendChild(zyq.htmlOptie(1, "inclusief niet actieve spelers"));
    leden.value = alleLeden;
    leden.addEventListener("input",
        function () {
            zyq.naarZelfdePagina(`leden=${leden.value}`);
        })
}
