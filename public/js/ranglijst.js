"use strict";

menu(naarBeheer,
    naarAgenda,
    naarGebruiker,
    [8, "zonder niet actieve spelers", function () {
        naarAnderePagina("ranglijst.html?informatie=0");
    }],
    [8, "inclusief niet actieve spelers", function () {
        naarAnderePagina("ranglijst.html?informatie=9");
    }],
    terugNaar);
seizoenSelecteren(INTERNE_COMPETITIE);
teamSelecteren(INTERNE_COMPETITIE);
rondeSelecteren(INTERNE_COMPETITIE, 0);
// TODO ranglijst tot bepaalde datum (zie ronde.js)
// TODO bijbehorende voorlopige indeling
ranglijst(document.getElementById("kop"), document.getElementById("tabel"));

/*
 -- ranglijst
 select s.knsbNummer, naam, subgroep, knsbRating, internTotalen(@seizoen, s.knsbNummer) as totalen
 from speler s
 join persoon p on s.knsbNummer = p.knsbNummer
 where seizoen = @seizoen
 order by totalen desc;
  */
function ranglijst(kop, lijst) {
    kop.innerHTML = vereniging + SCHEIDING + seizoenVoluit(seizoen);
    const winnaars = {};
    mapAsync("/ranglijst/" + seizoen,
        function (speler, i) {
            const t = totalen(speler.totalen);
            if (t.inRanglijst() || informatieNivo > 0) {
                lijst.appendChild(htmlRij(
                    i + 1,
                    naarSpeler(speler.knsbNummer, speler.naam),
                    t.punten(),
                    t.winnaarSubgroep(winnaars, speler.subgroep),
                    t.scoreIntern(),
                    t.percentageIntern(),
                    t.saldoWitZwart(),
                    t.intern() ? t.afzeggingen() : "",
                    t.oneven(),
                    t.scoreExtern(),
                    t.percentageExtern(),
                    speler.knsbRating));
            }});
}