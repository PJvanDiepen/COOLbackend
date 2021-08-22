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
    return await ranglijst(seizoen, versie, datumTot, deelnemers);
}

function deelnemers(lijst, ranglijst) {
    ranglijst.forEach(function(t, i) {
        lijst.appendChild(htmlRij(i + 1, t.naam, t.punten(), t.rating()));
    });
}

function deelnemers0(lijst, ranglijst) {
    for (let i = 0; i < ranglijst.length; i++) {
        const t = ranglijst[i];
        lijst.appendChild(htmlRij(i + 1, t.naam, t.punten(), t.rating()));
    }
}

function partijen(lijst, ranglijst) {
    let wit = [];
    let zwart = [];
    indelenEersteRonde(evenAantal(ranglijst.length), 3, wit, zwart);
    for (let i = 0; i < wit.length; i++) {
        lijst.appendChild(htmlRij(i + 1, ranglijst[wit[i]].naam, ranglijst[zwart[i]].naam, `${wit[i]+1} - ${zwart[i]+1}`));
    }
}

function evenAantal(aantal) {
    return aantal % 2 === 0 ? aantal : aantal + 1;
}

function indelenEersteRonde(aantalSpelers, aantalGroepen, wit, zwart) {
    const aantalPartijen = aantalSpelers / 2;
    aantalGroepen = juisteAantalGroepen(aantalGroepen, aantalSpelers);
    const helftGroep = Math.ceil(aantalPartijen / aantalGroepen);
    const tot = (aantalGroepen - 1) * helftGroep;
    for (let van = 0; van < tot; van += helftGroep) {  // laatste groep niet indelen
        groepIndelenEersteRonde(van, van + helftGroep, wit, zwart);
    }
    if (tot < aantalPartijen) {
        groepIndelenEersteRonde(tot, aantalPartijen, wit, zwart); // laatste groep
    }
}

function juisteAantalGroepen(aantalGroepen, aantalSpelers) {
    if (aantalSpelers < 7) {
        return 1;
    } else if (aantalSpelers < 11 && aantalGroepen > 2) {
        return 2;
    } else if (aantalSpelers < 15 && aantalGroepen > 3) {
        return 3;
    } else if (aantalGroepen > 4) { // TODO testen met meer dan 4 groepen
        return 4;
    } else {
        return aantalGroepen;
    }
}

function groepIndelenEersteRonde(van, tot, wit, zwart) {
    for (let i = van; i < tot; i++) {
        if (i % 2 == 0) {
            wit[i] = i + tot;
            zwart[i] = i + van;
        } else {
            wit[i] = i + van;
            zwart[i] = i + tot;
        }
    }
}