"use strict";

/*
    verwerk // TODO spelers toevoegen, indeling ter plekke wijzigen
 */

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
    const extern = await serverFetch(`/${uuidToken}/externintern/${competitie.seizoen}/${rondeNummer}`); // actuele situatie
    partijenLijst(r, wit, zwart, oneven, rangnummers, document.getElementById("partijen"), extern);
    if (rangnummers) {
        deelnemersLijst(r, document.getElementById("lijst"));
    }
    menu(naarTeamleider,
        naarGebruiker,
        naarBeheer,
        [BEHEERDER, "indeling definitief maken", async function () {
            let mutaties = 0;
            for (let i = 0; i < wit.length; i++) {
                if (await serverFetch(
                    `/${uuidToken}/indelen/${competitie.seizoen}/int/${rondeNummer}/${i + 1}/${r[wit[i]].knsbNummer}/${r[zwart[i]].knsbNummer}`)) {
                    mutaties += 2;
                }
            }
            if (oneven) {
                if (await serverFetch(
                    `/${uuidToken}/oneven/${competitie.seizoen}/int/${rondeNummer}/${r[oneven].knsbNummer}`)) {
                    mutaties += 1;
                }
            }
            mutaties += await serverFetch(`/${uuidToken}/afwezig/${competitie.seizoen}/int/${rondeNummer}`);
            if (mutaties) {
                naarAnderePagina("ronde.html?ronde=" + rondeNummer);
            }
        }]);
versieSelecteren(document.getElementById("versies"), rondeNummer);
})();

async function deelnemersRonde(rondeNummer) {
    if (GEREGISTREERD <= gebruiker.mutatieRechten) {
        return await serverFetch(`/${uuidToken}/deelnemers/${competitie.seizoen}/${INTERNE_COMPETITIE}/${rondeNummer}`); // actuele situatie
    } else {
        return [0];
    }
}

async function ranglijstSorteren(totDatum, deelnemers) {
    const lijst = await ranglijst(competitie.seizoen, competitie.versie, totDatum, deelnemers); // TODO 1 parameter minder voor ranglijst
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
            naarZelfdePagina(`ronde=${rondeNummer}&indelen=${versieIndelen}&rangnummers=aan`);
        });
    }
    return rangnummersAan;
}

function partijenLijst(r, wit, zwart, oneven, rangnummers, partijen, extern) {
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
    let bord = wit.length;
    for (const speler of extern) {
        // bord++;
        partijen.appendChild(htmlRij(++bord, naarSpeler(speler.knsbNummer, speler.naam), "extern", ""));
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

const versieIndelen = Number(params.get("indelen")) || 0;

function versieSelecteren(versies, rondeNummer) {
    for (let i = 0; i < indelenFun.length; i++) {
        versies.appendChild(htmlOptie(i, indelenFun[i][0]));
    }
    versies.value = versieIndelen;
    versies.addEventListener("input",
        function () {
            naarZelfdePagina(`ronde=${rondeNummer}&indelen=${versies.value}&rangnummers=aan`);
        });
}

function indelenRonde(r, wit, zwart) {
    return indelenFun[versieIndelen][1](r, wit, zwart);
}

function nietTegen(r, i, j) {
    const nogNietTegen = [101, 103, 7269834]; // Ramon Witte, Charles Stoorvogel, Arie Boots
    if (!r[i].tegen(r[j])) {
        return true;
    } else if (versieIndelen > 0) { // oudere versies zonder heuristieken
        return false;
    } else if (r[i].intern() < 4 && nogNietTegen.includes(r[j].knsbNummer)) {
        console.log(`${r[i].naam} nog maar niet tegen ${r[j].naam}`);
        return true; // de eerste 3 x nogNietTegen
    } else if (r[j].intern() < 4 && nogNietTegen.includes(r[i].knsbNummer)) {
        console.log(`${r[j].naam} nog maar niet tegen ${r[i].naam}`);
        return true; // de eerste 3 x nogNietTegen
    } else if (r[i].eigenWaardeCijfer() - r[j].eigenWaardeCijfer() > 3) {
        if (r[j].intern() / r[i].intern() > 2) {
            console.log(`${r[i].naam} te sterk voor ${r[j].naam}`);
            return true; // verschil waardecijfers meer dan 3 en helft minder aantal partijen gespeeld
        }
    } else if (r[j].eigenWaardeCijfer() - r[i].eigenWaardeCijfer() > 3) {
        if (r[i].intern() / r[j].intern() > 2) {
            console.log(`${r[j].naam} te sterk voor ${r[i].naam}`);
            return true; // verschil waardecijfers meer dan 3 en helft minder aantal partijen gespeeld
        }
    }
    return false;
}

const indelenFun = [
    ["indelen met heuristieken en herhalen indien mislukt", function (r, wit, zwart) {
        const oneven = onevenSpeler(r);
        let nietIngedeeld = vooruitIndelen(r, wit, zwart, oneven);
        while (nietIngedeeld.length > 0) {
            console.log("--- mislukt ---");
            while (wit.length > 0) {
                wit.pop();
                zwart.pop();
            }
            for (const speler of nietIngedeeld) {
                achteruitIndelen(speler, r, wit, zwart, oneven);
            }
            nietIngedeeld = vooruitIndelen(r, wit, zwart, oneven);
        }
        return oneven;
    }],
    ["indelen vooruit en eventueel achteruit", function (r, wit, zwart) {
        const oneven = onevenSpeler(r);
        let nietIngedeeld = vooruitIndelen(r, wit, zwart, oneven);
        if (nietIngedeeld.length > 0) {
            console.log("--- mislukt ---");
            while (wit.length > 0) {
                wit.pop();
                zwart.pop();
            }
            for (const speler of nietIngedeeld) {
                achteruitIndelen(speler, r, wit, zwart, oneven);
            }
            nietIngedeeld = vooruitIndelen(r, wit, zwart, oneven);
            if (nietIngedeeld.length > 0) {
                console.log("--- weer mislukt ---");
            }
        }
        return oneven;
    }],
    ["indelen met alleen vooruit gaan", function (r, wit, zwart) {
        console.log("--- indelen met met alleen vooruit gaan ---");
        const oneven = onevenSpeler(r);
        for (let i = 0; i < r.length; i++) {
            if (!ingedeeld(i, wit, zwart, oneven)) { // indien niet ingedeeld of oneven
                let j = i + 1;
                while (j < r.length && (ingedeeld(j, wit, zwart, oneven) || !r[i].tegen(r[j]))) {
                    j++; // volgende indien al ingedeeld of oneven of mag niet tegen
                }
                if (j < r.length) {
                    if (r[i].metWit(r[j])) {
                        wit.push(i);
                        zwart.push(j);
                    } else {
                        wit.push(j);
                        zwart.push(i);
                    }
                }
            }
        }
        return oneven;
    }]];

function spelersLijst(ranglijst, spelers) {
    return spelers.map(function (speler) {
        return ranglijst[speler].naam;
    });
}

function vooruitIndelen(r, wit, zwart, oneven) {
    const nietIngedeeld = [];
    for (let i = 0; i < r.length; i++) {
        if (!ingedeeld(i, wit, zwart, oneven)) { // indien niet ingedeeld of oneven
            let j = i + 1;
            while (j < r.length && (ingedeeld(j, wit, zwart, oneven) || nietTegen(r, i, j))) {
                j++; // volgende indien al ingedeeld of oneven of mag niet tegen
            }
            if (j < r.length) {
                if (r[i].metWit(r[j])) {
                    wit.push(i);
                    zwart.push(j);
                } else {
                    wit.push(j);
                    zwart.push(i);
                }
            }
        }
        if (!ingedeeld(i, wit, zwart, oneven)) { // indien niet ingedeeld of oneven
            console.log(`${r[i].naam} is niet ingedeeld`);
            nietIngedeeld.push(i);
        }
    }
    return nietIngedeeld;
}

function achteruitIndelen(i, r, wit, zwart, oneven) {
    let j = i - 1;
    while (j >= 0 && (ingedeeld(j, wit, zwart, oneven) || nietTegen(r, i, j))) {
        j--; // vorige indien al ingedeeld of oneven of mag niet tegen
    }
    if (j >= 0) {
        if (r[i].metWit(r[j])) {
            wit.push(i);
            zwart.push(j);
        } else {
            wit.push(j);
            zwart.push(i);
        }
    }
}

function ingedeeld(speler, wit, zwart, oneven) {
    return wit.includes(speler) || zwart.includes(speler) || (oneven && speler === oneven);
}

/**
 * indien er een oneven aantal deelnemers is, is er een onevenSpeler
 * de onevenSpeler is de laagste speler op de ranglijst met meeste aantal partijen, die niet eerder oneven was
 *
 * @param r ranglijst
 * @returns {number|number} 0 indien niemand oneven anders onevenSpeler
 */
function onevenSpeler(r) {
    let oneven = r.length % 2 === 0 ? 0 : r.length - 1;  // laatste speler is oneven
    if (oneven) {
        while (r[oneven].oneven()) {
            console.log(`${r[oneven].naam} was al oneven`);
            oneven--;
        }
        for (let i = oneven - 1; i > -1; i--) {
            if (r[i].oneven()) {
                console.log(`${r[i].naam} was al oneven`);
            } else if (r[i].intern() > r[oneven].intern()) {
                console.log(`${r[i].naam} heeft meer interne partijen gespeeld dan ${r[oneven].naam}`);
                oneven = i;
            }
        }
        console.log(`${r[oneven].naam} is oneven`);
    }
    return oneven;
}

