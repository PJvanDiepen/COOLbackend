"use strict";

const rangnummers = params.get("rangnummers");

(async function() {
    document.querySelector("details").addEventListener("toggle",function () {
        if (!rangnummers) {
            naarZelfdePagina("?rangnummers=aan");  // TODO verwijder eventListener
        }
    });
    await gebruikerVerwerken();
    const ronden = await localFetch(`/ronden/${seizoen}/${INTERNE_COMPETITIE}`);
    const datumTot = ronden[rondeNummer - 1].datum;
    document.getElementById("subkop").innerHTML = "Indeling ronde " + rondeNummer + SCHEIDING + datumLeesbaar(datumTot);
    let deelnemers = [0];
    if (GEREGISTREERD <= gebruiker.mutatieRechten) {
        deelnemers = await serverFetch(`/${uuidToken}/deelnemers/${seizoen}/${INTERNE_COMPETITIE}/${rondeNummer}`);
    }
    const r = await ranglijst(seizoen, versie, datumTot, deelnemers);
    const wit = [];
    const zwart = [];
    let oneven = 0;
    if (rondeNummer === 1) {
        oneven = r.length % 2 === 0 ? 0 : r.length - 1;  // laatste speler is oneven
        indelenEersteRonde(oneven ? oneven : r.length, 3, wit, zwart);
    } else {
        oneven = indelenRonde(r, wit, zwart);
    }
    const partijenLijst = document.getElementById("partijen");
    for (let i = 0; i < wit.length; i++) {
        partijenLijst.appendChild(htmlRij(i + 1, r[wit[i]].naam, r[zwart[i]].naam, rangnummers ? `${wit[i]+1} - ${zwart[i]+1}` : ""));
    }
    if (oneven) {
        partijenLijst.appendChild(htmlRij("", r[oneven].naam, "", "oneven"));
    }
    if (rangnummers) {
        const deelnemersLijst = document.getElementById("tabel");
        r.forEach(function(t, i) {
            const pnt = t.zonderAftrek() > t.punten() ? "*" + t.zonderAftrek() : t.punten(); // * indien eerste keer deelnemer
            deelnemersLijst.appendChild(htmlRij(i + 1, naarSpeler(t.knsbNummer, t.naam), pnt, t.rating()));
        });
    }
    menu(naarAgenda,
        naarRanglijst,
        naarGebruiker,
        naarBeheer,
        [BEHEERDER, "indeling definitief maken", async function () {
            let mutaties = 0;
            for (let i = 0; i < wit.length; i++) {
                if (await serverFetch(
                    `/${uuidToken}/indelen/${seizoen}/int/${rondeNummer}/${i + 1}/${r[wit[i]].knsbNummer}/${r[zwart[i]].knsbNummer}`)) {
                    mutaties += 2;
                }
            }
            if (oneven) {
                if (await serverFetch(
                    `/${uuidToken}/oneven/${seizoen}/int/${rondeNummer}/${r[oneven].knsbNummer}`)) {
                    mutaties += 1;
                }
            }
            mutaties += await serverFetch(`/${uuidToken}/afwezig/${seizoen}/int/${rondeNummer}`);
            if (mutaties) {
                console.log("mutaties: " + mutaties);
                naarAnderePagina("ronde.html?ronde=" + rondeNummer);
            }
        }]);
})();

function indelenEersteRonde(aantalSpelers, aantalGroepen, wit, zwart) {
    const aantalPartijen = aantalSpelers / 2;
    aantalGroepen = juisteAantalGroepen(aantalGroepen, aantalSpelers);
    const helftGroep = Math.floor(aantalPartijen / aantalGroepen);
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
    const sterkste = van % 2;
    for (let i = van; i < tot; i++) {
        if (i % 2 === sterkste) { // op van, van + 2, van + 4 heeft de sterkste speler zwart
            wit[i] = i + tot;
            zwart[i] = i + van;
        } else {
            wit[i] = i + van;
            zwart[i] = i + tot;
        }
    }
}

function indelenRonde(r, wit, zwart) {
    console.log(r);
    console.log("indelenRonde()"); // TODO uitwerken
    console.log(wit);
    console.log(zwart);
    let oneven = 0;
    return oneven;
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