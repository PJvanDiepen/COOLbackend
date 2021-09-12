"use strict";

(async function() {
    await gebruikerVerwerken();
    const [rondeNummer, totDatum] = await rondenVerwerken(INTERNE_COMPETITIE, Number(params.get("ronde")), 1);
    document.getElementById("subkop").innerHTML = "Indeling ronde " + rondeNummer + SCHEIDING + datumLeesbaar(totDatum);
    const r = await ranglijstSorteren(totDatum, await deelnemersRonde(rondeNummer));
    const wit = [];
    const zwart = [];
    let oneven = 0; // eerste speler is nooit oneven
    if (rondeNummer === 1) {
        oneven = r.length % 2 === 0 ? 0 : r.length - 1;  // laatste speler is oneven
        indelenEersteRonde(oneven ? oneven : r.length, 3, wit, zwart);
    } else {
        oneven = indelenRonde(r, wit, zwart);
    }
    const rangnummers = rangnummersToggle(document.querySelector("details"), rondeNummer);
    partijenLijst(r, wit, zwart, oneven, rangnummers, document.getElementById("partijen"));
    if (rangnummers) {
        deelnemersLijst(r, document.getElementById("lijst"));
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
                naarAnderePagina("ronde.html?ronde=" + rondeNummer);
            }
        }]);
})();

async function deelnemersRonde(rondeNummer) {
    if (GEREGISTREERD <= gebruiker.mutatieRechten) {
        return await serverFetch(`/${uuidToken}/deelnemers/${seizoen}/${INTERNE_COMPETITIE}/${rondeNummer}`);
    } else {
        return [0];
    }
}

async function ranglijstSorteren(totDatum, deelnemers) {
    const lijst = await ranglijst(seizoen, versie, totDatum, deelnemers);
    let gesorteerdTot = 1;
    while (gesorteerdTot < lijst.length && lijst[gesorteerdTot - 1].zonderAftrek() >= lijst[gesorteerdTot].zonderAftrek()) {
        gesorteerdTot++;
    }
    if (gesorteerdTot >= lijst.length) {
        return lijst; // ranglijst was al gesorteerd
    } else {
        let tussenvoegen = gesorteerdTot; // lijst is gesorteerdTot de rest tussenvoegen
        let gesorteerd = [];
        for (let i = 0; i < gesorteerdTot; i++) {
            while (tussenvoegen < lijst.length && lijst[tussenvoegen].zonderAftrek() >= lijst[i].zonderAftrek()) {
                gesorteerd.push(lijst[tussenvoegen++]);
            }
            gesorteerd.push(lijst[i])
        }
        return gesorteerd;
    }
}

function rangnummersToggle(rangnummers, rondeNummer) {
    const rangnummersAan = params.get("rangnummers");
    if (rangnummersAan) {
        rangnummers.open = true;
    } else {
        rangnummers.addEventListener("toggle",function () {
            naarZelfdePagina(`?ronde=${rondeNummer}&rangnummers=aan`);
        });
    }
    return rangnummersAan;
}

function partijenLijst(r, wit, zwart, oneven, rangnummers, partijen) {
    for (let i = 0; i < wit.length; i++) {
        partijen.appendChild(htmlRij(i + 1, r[wit[i]].naam, r[zwart[i]].naam, rangnummers ? `${wit[i]+1} - ${zwart[i]+1}` : ""));
    }
    if (oneven) {
        partijen.appendChild(htmlRij("", r[oneven].naam, "", "oneven"));
    }
}

function deelnemersLijst(r, lijst) {
    r.forEach(function(t, i) {
        lijst.appendChild(htmlRij(
            i + 1,
            naarSpeler(t.knsbNummer, t.naam),
            t.zonderAftrek(),
            t.eigenWaardeCijfer(),
            t.intern(),
            t.saldoWitZwart()));
    });
}

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
    let oneven = r.length % 2 === 0 ? 0 : r.length - 1;  // laatste speler is oneven
    if (oneven) {
        let partijen = r[oneven].intern();
        let i = oneven - 1;
        while (r[oneven].zonderAftrek() === r[i].zonderAftrek()) {
            if (partijen < r[i].intern()) {
                oneven = i; // deze speler heeft evenveel punten, heeft meer partijen gespeeld en is daarom oneven
            }
            i--;
        }
    }
    let i = 0;
    // while (i < r.length && r[i].tegen(r[i + 1])) {
    while (i < r.length) {
        if (i === oneven) {
            i++;
        } else {
            if (r[i].kleur(r[i + 1])) {
                wit.push(i + 1);
                zwart.push(i);
            } else {
                wit.push(i);
                zwart.push(i + 1);
            }
            i += 2;
        }
    }
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