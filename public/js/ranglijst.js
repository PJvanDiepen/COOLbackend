"use strict";

const alleLeden = Number(params.get("leden"));

(async function() {
    await gebruikerVerwerken();
    menu(naarBeheer,
        naarAgenda,
        naarGebruiker,
        terugNaar);
    seizoenSelecteren(INTERNE_COMPETITIE);
    teamSelecteren(INTERNE_COMPETITIE);
    rondeSelecteren(INTERNE_COMPETITIE, 0);
    versieSelecteren(document.getElementById("versies"));
    ledenSelecteren(document.getElementById("leden"));
// TODO bijbehorende voorlopige indeling
    ranglijst(document.getElementById("kop"), document.getElementById("tabel"));
})();

/*
 -- ranglijst
 select s.knsbNummer, naam, subgroep, knsbRating, internTotalen(@seizoen, s.knsbNummer) as totalen
 from speler s
 join persoon p on s.knsbNummer = p.knsbNummer
 where seizoen = @seizoen
 order by totalen desc;
  */
function ranglijst(kop, lijst) {
    let datumTot = params.get("datum");
    if (datumTot) {
        kop.innerHTML = vereniging + SCHEIDING + seizoenVoluit(seizoen) + SCHEIDING + "tot ronde " + rondeNummer;
    } else {
        datumTot = datumSQL();
        kop.innerHTML = vereniging + SCHEIDING + seizoenVoluit(seizoen);
    }
    const winnaars = {};
    mapAsync(`/ranglijst/${seizoen}/${versie}/${datumTot}`,
        function (speler, i) {
            const t = spelerTotalen(speler);
            if (t.inRanglijst() || alleLeden) {
                lijst.appendChild(htmlRij(
                    i + 1,
                    naarSpeler(speler.knsbNummer, speler.naam),
                    t.punten() ? t.punten() : "",
                    t.eigenWaardeCijfer(),
                    t.winnaarSubgroep(winnaars),
                    t.scoreIntern(),
                    t.percentageIntern(),
                    t.saldoWitZwart() ? t.saldoWitZwart() : "",
                    t.intern() && t.afzeggingen() ? t.afzeggingen() : "",
                    t.oneven() ? t.oneven() : "",
                    t.scoreExtern(),
                    t.percentageExtern(),
                    speler.knsbRating));
            }});
}

async function versieSelecteren(versies) {
    versies.appendChild(htmlOptie(0, "versie 0 volgens huidige reglement"));
    versies.appendChild(htmlOptie(1, "versie 1 zonder aftrek na 10x afzeggen"));
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
