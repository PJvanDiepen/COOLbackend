"use strict";

actieSelecteren(document.getElementById("actieSelecteren"),
    hamburgerMenu,
    naarAgenda,
    [10, "partij = x",
        async function () {
            const mutaties = await serverFetch("/partij/x");
            console.log("partij = x: " + mutaties);
        }],
    [9, "partij = y",
        async function () {
            const mutaties = await serverFetch("/partij/y");
            console.log("partij = y: " + mutaties);
        }],
    terugNaar
);
seizoenSelecteren(document.getElementById("seizoenSelecteren"), INTERNE_COMPETITIE);
teamSelecteren(document.getElementById("teamSelecteren"), INTERNE_COMPETITIE);
rondeSelecteren(document.getElementById("rondeSelecteren"), INTERNE_COMPETITIE, 0);
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
            if (t.inRanglijst()) {
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