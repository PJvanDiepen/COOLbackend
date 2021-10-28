"use strict";

const alleLeden = Number(params.get("leden"));

(async function() {
    await gebruikerVerwerken();
    menu(naarAgenda,
        naarIndelen,
        naarTeamleider,
        naarGebruiker,
        naarBeheer);
    seizoenSelecteren(INTERNE_COMPETITIE);
    teamSelecteren(INTERNE_COMPETITIE);
    rondeSelecteren(INTERNE_COMPETITIE, 0);
    versieSelecteren(document.getElementById("versies"));
    ledenSelecteren(document.getElementById("leden"));
    spelersLijst(document.getElementById("kop"), document.getElementById("tabel"));
})();

async function spelersLijst(kop, lijst) {
    const [rondeNummer, datumRonde, totDatum]  = await rondenVerwerken(INTERNE_COMPETITIE, Number(params.get("ronde")), 0);
    kop.innerHTML = "Ranglijst" + SCHEIDING + "na ronde " + rondeNummer;
    const winnaars = {}; // voor winnaarSubgroep() in totalen
    (await ranglijst(seizoen, versie, totDatum)).forEach(function (t, i) {
        if (t.inRanglijst() || alleLeden) {
            lijst.appendChild(htmlRij(
                i + 1,
                naarSpeler(t.knsbNummer, t.naam),
                t.punten() ? t.punten() : "",
                t.winnaarSubgroep(winnaars),
                t.scoreIntern(),
                t.percentageIntern(),
                t.saldoWitZwart() ? t.saldoWitZwart() : "",
                t.intern() && t.afzeggingen() ? t.afzeggingen() : "",
                t.oneven() ? t.oneven() : "",
                t.scoreExtern(),
                t.percentageExtern()));
        }
    });
}

function versieSelecteren(versies) {  // TODO: versies en teksten in database
    versies.appendChild(htmlOptie(0, "versie 0 volgens reglement van het seizoen"));
    versies.appendChild(htmlOptie(2, "versie 2 met afzeggingenAftrek zoals in seizoen = 1819, 1920, 2021"));
    versies.appendChild(htmlOptie(3, "versie 3 zonder afzeggingenAftrek vanaf seizoen = 2122"));
    versies.value = versie;
    versies.addEventListener("input",
        function () {
            naarZelfdePagina("?versie=" + versies.value);
        });
}

function ledenSelecteren(leden) {
    leden.appendChild(htmlOptie(0, "alleen actieve leden"));
    leden.appendChild(htmlOptie(1, "inclusief niet actieve spelers"));
    leden.value = alleLeden;
    leden.addEventListener("input",
        function () {
            naarZelfdePagina("?leden=" + leden.value);
        })
}
