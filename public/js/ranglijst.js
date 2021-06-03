"use strict";

menu(naarAgenda,
    naarGebruiker,
    [8, "zonder niet actieve spelers", function () {
        naarAnderePagina("ranglijst.html?informatie=0");
    }],
    [8, "inclusief niet actieve spelers", function () {
        naarAnderePagina("ranglijst.html?informatie=9");
    }],
    [9, "Arie Boots / mutatieRechten = 1", function () {
        sessionStorage.setItem("uuidToken", "d94400be-adb3-11eb-947d-7c0507c81823");
        naarAnderePagina("ranglijst.html?informatie=0");
    }],
    [9, "Aad Schuit / mutatieRechten = 0", function () {
        sessionStorage.setItem("uuidToken", "1eb9375f-adb9-11eb-947d-7c0507c81823");
        naarAnderePagina("ranglijst.html?informatie=0");
    }],
    [9, "onbekend / mutatieRechten = 0", function () {
        sessionStorage.setItem("uuidToken", "f77cf407-af70-11eb-947d-7c0507c81823");
        naarAnderePagina("ranglijst.html?informatie=0");
    }],
    terugNaar);
seizoenSelecteren(INTERNE_COMPETITIE);
teamSelecteren(INTERNE_COMPETITIE);
rondeSelecteren(INTERNE_COMPETITIE, 0);
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
    kop.innerHTML = schaakVereniging + SCHEIDING + seizoenVoluit(seizoen);
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
                    t.intern() ? t.afzeggingen() : "", // TODO afzeggingen verwijderen indien geen interne partijen
                    t.oneven(),
                    t.scoreExtern(),
                    t.percentageExtern(),
                    speler.knsbRating));
            }});
}