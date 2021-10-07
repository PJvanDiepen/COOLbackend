"use strict";

const versieIndelen = Number(params.get("indelen")) || 0;

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
        naarTeamleider,
        naarRanglijst,
        naarTeamleider,
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
    versieSelecteren(document.getElementById("versies"), rondeNummer);
})();

async function deelnemersRonde(rondeNummer) {
    if (GEREGISTREERD <= gebruiker.mutatieRechten) {
        return await serverFetch(`/${uuidToken}/deelnemers/${seizoen}/${INTERNE_COMPETITIE}/${rondeNummer}`); // actuele situatie
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
            naarZelfdePagina(`?ronde=${rondeNummer}&indelen=${versieIndelen}&rangnummers=aan`);
        });
    }
    return rangnummersAan;
}

function partijenLijst(r, wit, zwart, oneven, rangnummers, partijen) {
    for (let i = 0; i < wit.length; i++) {
        partijen.appendChild(htmlRij(
            i + 1,
            naarSpeler(r[wit[i]].knsbNummer, r[wit[i]].naam),
            naarSpeler(r[zwart[i]].knsbNummer, r[zwart[i]].naam),
            rangnummers ? `${wit[i]+1} - ${zwart[i]+1}` : ""
        ));
    }
    if (oneven) {
        partijen.appendChild(htmlRij("", naarSpeler(r[oneven].knsbNummer, r[oneven].naam), "", "oneven"));
    }
}

function deelnemersLijst(r, lijst) {
    r.forEach(function(t, i) {
        lijst.appendChild(htmlRij(
            i + 1,
            naarSpeler(t.knsbNummer, t.naam),
            t.zonderAftrek(),
            t.eigenWaardeCijfer(),
            t.intern() ? t.intern() : "",
            t.saldoWitZwart() ? t.saldoWitZwart() : ""));
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

function versieSelecteren(versies, rondeNummer) {  // TODO: software en tekst samen in structuur
    versies.appendChild(htmlOptie(0, "indelen zonder aanpassingen"));
    versies.appendChild(htmlOptie(1, "indelen met aanpassing"));
    versies.value = versieIndelen;
    versies.addEventListener("input",
        function () {
            naarZelfdePagina(`?ronde=${rondeNummer}&indelen=${versies.value}&rangnummers=aan`);
        });
}

function indelenRonde(r, wit, zwart) {
    return indelenFun[versieIndelen](r, wit, zwart); // TODO verschillende indelenFun proberen indien mislukt
}

const indelenFun = [
    function (r, wit, zwart) {
        console.log("--- indelen met algoritme van ronde 6 ---");
        let overslaan = [];
        let oneven = onevenSpeler(r, overslaan);
        let i = 0;
        while (i < r.length) {
            if (overslaan.includes(i)) {
                overslaan.shift(); // eerste van overslaan
            } else {
                if (overslaan.length) {
                    console.log(`overslaan: [${spelersLijst(r, overslaan).join(", ")}]`);
                }
                let j = i + 1;
                while (j < r.length && (overslaan.includes(j) || !r[i].tegen(r[j]))) { // volgende indien overslaan of mag niet tegen
                    j++;
                }
                if (j < r.length) {
                    if (r[i].metWit(r[j])) {
                        wit.push(i);
                        zwart.push(j);
                    } else {
                        wit.push(j);
                        zwart.push(i);
                    }
                    overslaan.push(j);
                }
            }
            i++;
        }
        return oneven;
    },
    function (r, wit, zwart) {
        console.log("--- indelen met algoritme van ronde 2 ---");
        let overslaan = [];
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
            overslaan.push(oneven);
        }
        let i = 0;
        while (i < r.length) {
            if (overslaan.includes(i)) {
                overslaan.shift(); // eerste van overslaan
            } else {
                if (overslaan.length) {
                    console.log(`overslaan: [${spelersLijst(r, overslaan).join(", ")}]`);
                }
                let j = i + 1;
                while (j < r.length && (overslaan.includes(j) || !r[i].tegen(r[j]))) { // volgende indien overslaan of mag niet tegen
                    j++;
                }
                if (j < r.length) {
                    if (r[i].metWit(r[j])) {
                        wit.push(i);
                        zwart.push(j);
                    } else {
                        wit.push(j);
                        zwart.push(i);
                    }
                    overslaan.push(j);
                }
            }
            i++;
        }
        if (overslaan.length) {
            console.log(`zonder tegenstanders: [${spelersLijst(r, overslaan).join(", ")}]`);
        }
        return oneven;
    }];

function spelersLijst(ranglijst, spelers) {
    return spelers.map(function (speler) {
        return ranglijst[speler].naam;
    });
}

/**
 * indien er een oneven aantal deelnemers is, is er een onevenSpeler
 * de onevenSpeler is de laagste speler op de ranglijst met meeste aantal partijen, die niet eerder oneven was
 * de onevenSpeler wordt toegevoegd aan de overslaan lijst van spelers die al zijn ingedeeld
 *
 * @param r ranglijst
 * @param overslaan lijst van spelers die al zijn ingedeeld
 * @returns {number|number}
 */
function onevenSpeler(r, overslaan) {
    let oneven = r.length % 2 === 0 ? 0 : r.length - 1;  // laatste speler is oneven
    if (oneven) {
        while (r[oneven].oneven()) {
            console.log(`${r[oneven].naam} is al oneven geweest`);
            oneven--;
        }
        for (let i = oneven - 1; i < -1; i--) {
            if (r[i].oneven()) {
                console.log(`${r[i].naam} is ook al oneven geweest`);
            } else if (r[i].intern() > r[i].intern()) {
                console.log(`${r[i].naam} heeft meer interne partijen gespeeld dan ${r[oneven].naam}`);
                oneven = i;
            }
        }
        overslaan.push(oneven);
    }
    return oneven;
}

