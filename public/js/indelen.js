"use strict";

/*
TODO indeling alsof het de eerste ronde is
 */


(async function() {
    await gebruikerVerwerken();
    const ronden = await localFetch(`/ronden/${seizoen}/${INTERNE_COMPETITIE}`);
    const datumTot = ronden[rondeNummer - 1].datum;
    menu(naarBeheer,
        naarAgenda,
        naarRanglijst,
        [WEDSTRIJDLEIDER, `ranglijst tot ronde ${rondeNummer}`, function() {
            naarAnderePagina(`ranglijst.html?datum=${datumSQL(datumTot)}`);
        }],
        [WEDSTRIJDLEIDER, `indeling ronde ${rondeNummer}`, function () {
            naarAnderePagina(`indelen.html?${datumSQL(datumTot)}`);
        }],
        naarGebruiker,
        terugNaar);
    rondeSelecteren(INTERNE_COMPETITIE, rondeNummer);
    document.getElementById("subkop").innerHTML = "Ronde " + rondeNummer + SCHEIDING + datumLeesbaar(datumTot);
    const ranglijst = await ranglijstDeelnemers(datumTot);
    deelnemers(document.getElementById("tabel"), ranglijst);
    partijen(document.getElementById("partijen"), ranglijst);
})();

async function ranglijstDeelnemers(datumTot) {
    let deelnemers = await serverFetch(`/deelnemers/${seizoen}/${INTERNE_COMPETITIE}/${rondeNummer}/${MEEDOEN}`);
    if (deelnemers.length === 0) {
        deelnemers = await serverFetch(`/deelnemers/${seizoen}/${INTERNE_COMPETITIE}/${rondeNummer}/${INTERNE_PARTIJ}`);
    }
    return spelersUitRanglijst(seizoen, deelnemers, datumTot);
}

function deelnemers(lijst, ranglijst) {
    for (let i = 0; i < ranglijst.length; i++) {
        const t = spelerTotalen(ranglijst[i]);
        lijst.appendChild(htmlRij(i + 1, t.naam, t.punten(), t.rating()));
    }
}

function partijen(lijst, ranglijst) {
    const helft = ranglijst.length / 2;
    for (let i = 0; i < helft; i++) {
        const s = spelerTotalen(ranglijst[i]);
        const t = spelerTotalen(ranglijst[i + helft]);
        lijst.appendChild(htmlRij(i + 1, s.naam, t.naam, `${i+1} - ${i+helft+1}`));
    }
}