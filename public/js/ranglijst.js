"use strict";

actieSelecteren(
    naarAgenda,
    [9, "meer informatie", function () {
        naarAnderePagina("ranglijst.html?informatie=9");
    }],
    [9, "minder informatie", function () {
        naarAnderePagina("ranglijst.html?informatie=0");
    }],
    [9, "conversie tegenstanderNummer naar partij", async function () {
        let mutaties = await serverFetch("/verwijder/persoon/1/99"); // verwijder overbodige personen
        console.log("verwijder/persoon: " + mutaties);
        mutaties = await serverFetch("/partij/3/3/a");
        console.log("partij = AFWEZIG: " + mutaties);
        mutaties = await serverFetch("/partij/8/8/b");
        console.log("partij = BYE: " + mutaties);
        mutaties = await serverFetch("/partij/2/2/e");
        console.log("partij = EXTERNE_PARTIJ: " + mutaties);
        mutaties = await serverFetch("/partij/9/9999999/i");
        console.log("partij = INTERNE_PARTIJ: " + mutaties);
        mutaties = await serverFetch("/partij/1/1/o");
        console.log("partij = ONEVEN: " + mutaties);
        mutaties = await serverFetch("/partij/7/7/t");
        console.log("partij = TEAMLEIDER: " + mutaties);
        mutaties = await serverFetch("/partij/6/6/v");
        console.log("partij = REGLEMENTAIR_VERLIES: " + mutaties);
        mutaties = await serverFetch("/partij/5/5/w");
        console.log("partij = REGLEMENTAIRE_WINST: " + mutaties);
        mutaties = await serverFetch("/tegenstander/1/99");
        console.log("tegenstanderNummer = 0: " + mutaties);
    }],
    terugNaar
);
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