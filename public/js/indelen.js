"use strict";

(async function() {
    await gebruikerVerwerken();
    const ronden = await localFetch(`/ronden/${seizoen}/${INTERNE_COMPETITIE}`);
    const datumTot = ronden[rondeNummer - 1].datum;
    menu(naarAgenda,
        naarRanglijst,
        naarGebruiker,
        naarBeheer);
    rondeSelecteren(INTERNE_COMPETITIE, rondeNummer);
    document.getElementById("subkop").innerHTML = "Ronde " + rondeNummer + SCHEIDING + datumLeesbaar(datumTot);
    const deelnemers = await serverFetch(`/${uuidToken}/deelnemers/${seizoen}/${INTERNE_COMPETITIE}/${rondeNummer}`);
    const deelnemersRanglijst = await ranglijst(seizoen, versie, datumTot, deelnemers);
    deelnemersLijst(document.getElementById("tabel"), deelnemersRanglijst);
    partijen(document.getElementById("partijen"), deelnemersRanglijst);
})();

function deelnemersLijst(lijst, ranglijst) {
    ranglijst.forEach(function(t, i) {
        lijst.appendChild(htmlRij(i + 1, t.naam, t.punten(), t.rating()));
    });
}

function partijen(lijst, ranglijst) {
    const oneven = ranglijst.length % 2 === 0 ? 0 : ranglijst.length;  // laatste speler is oneven
    let wit = [];
    let zwart = [];
    indelenEersteRonde(evenAantal(ranglijst.length), 3, wit, zwart);
    for (let i = 0; i < wit.length; i++) {
        lijst.appendChild(htmlRij(i + 1, ranglijst[wit[i]].naam, ranglijst[zwart[i]].naam, `${wit[i]+1} - ${zwart[i]+1}`));
    }
    if (oneven) {
        lijst.appendChild(htmlRij("", ranglijst[oneven - 1].naam, "", "oneven"));
    }
}

function evenAantal(aantal) {
    return aantal % 2 === 0 ? aantal : aantal - 1;
}

function indelenEersteRonde(aantalSpelers, aantalGroepen, wit, zwart) {
    const aantalPartijen = aantalSpelers / 2;
    aantalGroepen = juisteAantalGroepen(aantalGroepen, aantalSpelers);
    const helftGroep = Math.ceil(aantalPartijen / aantalGroepen);
    const tot = (aantalGroepen - 1) * helftGroep; // tot laatste groep
    for (let van = 0; van < tot; van += helftGroep) {
        groepIndelenEersteRonde(van, van + helftGroep, wit, zwart);
    }
    groepIndelenEersteRonde(tot, aantalPartijen, wit, zwart);
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
        if (i % 2 === 0) { // op even borden heeft de sterkste speler zwart
            wit[i] = i + tot;
            zwart[i] = i + van;
        } else {
            wit[i] = i + van;
            zwart[i] = i + tot;
        }
    }
}

// TODO mogelijkeTegenstanders aanroepen

async function mogelijkeTegenstanders(lijst, knsbNummer, rondeNummer) {
    const s = (await ranglijst(ditSeizoen(), versie, null, [knsbNummer]))[0];
    const deelnemers = await serverFetch(`/${uuidToken}/deelnemers/${ditSeizoen()}/${INTERNE_COMPETITIE}/${rondeNummer}`);
    const tegenstanders = await ranglijst(ditSeizoen(), versie, null, deelnemers);
    for (const t of tegenstanders) {
        if (s.knsbNummer !== t.knsbNummer) {
            lijst.appendChild(htmlRij(
                naarSpeler(t.knsbNummer, t.naam),
                s.kleur(t),
                t.punten() - s.punten(), // afstand
                s.tegen(t, rondeNummer) ? "" : KRUISJE));  // artikel 3
        }
    }
}