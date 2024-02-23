"use strict";

import * as html from "./html.js";
import * as db from "./db.js";

import {ranglijst} from "./o_o_o.js"

import * as zyq from "./zyq.js";

const versieIndelen = Number(html.params.get("indelen")) || 0;
const partijen = html.id("partijen");

/*
    verwerk ronde=<ronde>
           &rangnummers=aan
           &indelen=<versienummer indelen algoritme>
 */

(async function() {
    await zyq.init();
    zyq.competitieTitel();
    const rondeNummer = Number(html.params.get("ronde")) || zyq.o_o_o.huidigeRonde;
    const totDatum = zyq.o_o_o.ronde[rondeNummer].datum;
    html.id("subkop").textContent =
        `Indeling ronde ${rondeNummer}${html.SCHEIDING}${zyq.datumLeesbaar({datum: totDatum})}`;

    let bordNummer = 0;
    const paren = await zyq.serverFetch(`/${zyq.uuidToken}/paren/${db.key(zyq.o_o_o.ronde[rondeNummer])}`);
    if (paren.length) {
        for (const paar of paren) {
            bordNummer = paar.bordNummer;
            partijen.append(html.rij(bordNummer, paar.wit, paar.zwart, ""));
        }
    }

    /*
    TODO partijen lijst met db.INGEDEELD && db.TOCH_INGEDEELD en toevoegen in wit en zwart?
    TODO alles in een overzichtelijke vorm zetten
    TODO begin bij volgende bordNummer voor automatisch indelen
    TODO invullen externe wedstrijden afsplitsen van partijenLijst()
     */

    const wit = [];
    const zwart = [];
    let oneven = 0; // eerste speler is nooit oneven
    const deelnemers = await deelnemersRonde(rondeNummer);
    const r = await ranglijstOpPuntenRating(rondeNummer, deelnemers);
    if (rondeNummer === 1) { // Alkmaar systeem eerste ronde
        oneven = r.length % 2 === 0 ? 0 : r.length - 1;  // laatste speler is oneven
        indelenEersteRonde(oneven ? oneven : r.length, 3, wit, zwart);
    } else { // Alkmaar systeem andere ronden
        oneven = indelenRonde(r, wit, zwart, rondeNummer);
    }
    const rangnummers = rangnummersToggle(document.querySelector("details"), rondeNummer);
    const uithuis = await zyq.serverFetch(`/${zyq.uuidToken}/uithuis/${zyq.o_o_o.seizoen}/${zyq.datumSQL(totDatum)}`); // actuele situatie
    partijenLijst(r, wit, zwart, oneven, rangnummers, uithuis);
    if (rangnummers) {
        deelnemersLijst(r, html.id("lijst"));
    }
    await html.menu(
        zyq.gebruiker.mutatieRechten,
        [db.WEDSTRIJDLEIDER, "indeling definitief maken", async function () {
            await definitief(rondeNummer, wit, r, zwart, oneven);
        }],
        [db.WEDSTRIJDLEIDER, `handmatig indelen ronde ${rondeNummer}`, function () {
            html.anderePagina(`paren.html?ronde=${rondeNummer}`);
        }]);
    const versieOpties = [];
    for (let i = 0; i < indelenFun.length; i++) {
        versieOpties.push([i, indelenFun[i][0]]);
    }
    html.selectie(html.id("versies"), versieIndelen, versieOpties, function (versie) {
        html.zelfdePagina(`ronde=${rondeNummer}&indelen=${versie}&rangnummers=aan`);
    });
})();

async function deelnemersRonde(rondeNummer) {
    if (db.GEREGISTREERD <= zyq.gebruiker.mutatieRechten) {
        return await zyq.serverFetch(`/${zyq.uuidToken}/deelnemers/${zyq.o_o_o.seizoen}/${zyq.o_o_o.competitie}/${rondeNummer}`); // actuele situatie
    } else {
        return [0]; // een onbekende deelnemer, zodat niet alle spelers worden geselecteerd
    }
}

async function ranglijstOpPuntenRating(rondeNummer, deelnemers) {
    const lijst = await ranglijst(rondeNummer, deelnemers);
    lijst.sort(function (een, ander) {
        return ander.totaal() - een.totaal(); // van hoog naar laag
    });
    return lijst;
}
function rangnummersToggle(rangnummers, rondeNummer) {
    const rangnummersAan = html.params.get("rangnummers");
    if (rangnummersAan) {
        rangnummers.open = true;
    } else {
        rangnummers.addEventListener("toggle",function () {
            html.zelfdePagina(`ronde=${rondeNummer}&indelen=${versieIndelen}&rangnummers=aan`);
        });
    }
    return rangnummersAan;
}

async function definitief(rondeNummer, wit, r, zwart, oneven) {
    const planning = {seizoen: zyq.o_o_o.seizoen, teamCode: zyq.o_o_o.competitie, rondeNummer: rondeNummer};
    let mutaties = 0;
    for (let i = 0; i < wit.length; i++) {
        if (await zyq.serverFetch(
            `/${zyq.uuidToken}/indelen/${db.key(planning)}/${i + 1}/${r[wit[i]].knsbNummer}/${r[zwart[i]].knsbNummer}`)) {
            mutaties += 2;
        }
    }
    if (oneven) {
        if (await zyq.serverFetch(`/${zyq.uuidToken}/oneven/${db.key(planning)}/${r[oneven].knsbNummer}`)) {
            mutaties += 1;
        }
    }
    mutaties += await zyq.serverFetch(`/${zyq.uuidToken}/afwezig/${db.key(planning)}`);
    mutaties += await zyq.serverFetch(`/${zyq.uuidToken}/extern/${db.key(planning)}`);
    if (mutaties) {
        html.anderePagina(`ronde.html?ronde=${rondeNummer}`);
    }
}

function partijenLijst(r, wit, zwart, oneven, rangnummers, extern) {
    for (let i = 0; i < wit.length; i++) {
        partijen.append(html.rij(
            i + 1,
            zyq.naarSpeler(r[wit[i]]),
            zyq.naarSpeler(r[zwart[i]]),
            rangnummers ? `${wit[i] + 1} - ${zwart[i] + 1}` : ""
        ));
    }
    if (oneven) {
        partijen.append(html.rij(
            "",
            zyq.naarSpeler(r[oneven]),
            "",
            "oneven"));
    }
    let bord = wit.length;
    for (const speler of extern) { // EXTERN_THUIS heeft extra bord nodig EXTERN_UIT niet
        partijen.append(html.rij(
            speler.partij === db.EXTERN_THUIS ? ++bord : "",
            zyq.naarSpeler(speler),
            "",
            "extern"));
    }
}

function deelnemersLijst(r, lijst) {
    r.forEach(function(t, i) {
        lijst.append(html.rij(
            i + 1,
            zyq.naarSpeler(t),
            t.punten(),
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

function indelenRonde(r, wit, zwart, rondeNummer) {
    return indelenFun[versieIndelen][1](r, wit, zwart, rondeNummer); // TODO functie met 1 regel?
}

const indelenFun = [
    ["vooruit indelen met en laatste achteruit indelen zonder heuristieken", function (r, wit, zwart, rondeNummer) { // 0-0-0.nl versie 0.8.17
        const oneven = onevenSpeler(r);
        let nietIngedeeld = vooruitIndelen(r, wit, zwart, oneven, rondeNummer);
        // console.log(nietIngedeeld);
        if (nietIngedeeld.length > 0) {
            let pogingen = 0
            let poging = [];
            for (let volgnummer = 0; volgnummer < 6; volgnummer++) {
                poging = [];
                let speler = 999;
                while (nietIngedeeld.length > 0 && speler > 0 && ++pogingen < 13) {
                    console.log("--- 1 niet ingedeelde speler --- poging #" + pogingen + "/" + volgnummer);
                    opnieuwIndelen(wit, zwart);
                    speler = laatsteNietIngedeeldeSpeler(nietIngedeeld, poging, volgnummer);
                    spelerIndelen(speler, VOORUIT, r, wit, zwart, oneven) || spelerIndelen(speler, ACHTERUIT, r, wit, zwart, oneven);
                    nietIngedeeld = vooruitIndelen(r, wit, zwart, oneven);
                }
            }
            if (nietIngedeeld.length > 0) {
                console.log("--- alle niet ingedeelde spelers --- poging #" + ++pogingen);
                opnieuwIndelen(wit, zwart);
                while (eenNietIngedeeldeSpeler(nietIngedeeld, poging)) {
                    // toevoegen aan poging
                }
                for (const speler of poging) {
                    if (!ingedeeld(speler, wit, zwart, oneven)) {
                        spelerIndelen(speler, VOORUIT, r, wit, zwart, oneven) || spelerIndelen(speler, ACHTERUIT, r, wit, zwart, oneven);
                    }
                }
                nietIngedeeld = vooruitIndelen(r, wit, zwart, oneven, rondeNummer);
            }
            if (nietIngedeeld.length > 0) {
                console.log("--- mislukt ---");
            }
        }
        return oneven;
    }],

    ["vooruit indelen met en achteruit indelen zonder heuristieken", function (r, wit, zwart, rondeNummer) { // 0-0-0.nl versie 0.7.8
        const oneven = onevenSpeler(r);
        let nietIngedeeld = vooruitIndelen(r, wit, zwart, oneven, rondeNummer);
        console.log(nietIngedeeld);
        if (nietIngedeeld.length > 0) {
            let pogingen = 0
            let poging = [];
            for (let volgnummer = 0; volgnummer < 6; volgnummer++) {
                poging = [];
                let speler = 999;
                while (nietIngedeeld.length > 0 && speler > 0 && ++pogingen < 13) {
                    console.log("--- 1 niet ingedeelde speler --- poging #" + pogingen + "/" + volgnummer);
                    opnieuwIndelen(wit, zwart);
                    speler = volgendeNietIngedeeldeSpeler(nietIngedeeld, poging, volgnummer);
                    spelerIndelen(speler, VOORUIT, r, wit, zwart, oneven) || spelerIndelen(speler, ACHTERUIT, r, wit, zwart, oneven);
                    nietIngedeeld = vooruitIndelen(r, wit, zwart, oneven);
                }
            }
            if (nietIngedeeld.length > 0) {
                console.log("--- alle niet ingedeelde spelers --- poging #" + ++pogingen);
                opnieuwIndelen(wit, zwart);
                while (eenNietIngedeeldeSpeler(nietIngedeeld, poging)) {
                    // toevoegen aan poging
                }
                for (const speler of poging) {
                    if (!ingedeeld(speler, wit, zwart, oneven)) {
                        spelerIndelen(speler, VOORUIT, r, wit, zwart, oneven) ||
                        spelerIndelen(speler, ACHTERUIT, r, wit, zwart, oneven);
                    }
                }
                nietIngedeeld = vooruitIndelen(r, wit, zwart, oneven);
            }
            if (nietIngedeeld.length > 0) {
                console.log("--- mislukt ---");
            }
        }
        return oneven;
    }]];

/**
 * Liever nietTegen volgens heuristieken.
 *
 * @param r ranglijst
 * @param i speler
 * @param j tegenstander
 * @param rondeNummer huidige ronde
 * @returns {boolean} indien deze speler liever nietTegen deze tegenstander
 */
function nietTegen(r, i, j, rondeNummer) {
    if (!r[i].tegen(r[j]) || !r[j].tegen(r[i])) {
        return true;
    } else if (zyq.o_o_o.competitie === db.RAPID_COMPETITIE || versieIndelen > 0) { // rapid en oudere versies zonder heuristieken
        return false;
    } else if (rondeNummer < 5) {
        return false;
    } else if (rondeNummer / r[i].intern() < 2 && rondeNummer / r[j].intern() < 2) {
        return false; // spelers hebben niet te weinig gespeeld
    } else if (r[i].eigenWaardeCijfer() - r[j].eigenWaardeCijfer() > 3) { // 0-0-0.nl versie 0.8.17 >= 3 verandert in > 3
        console.log(`${r[i].naam} te sterk voor ${r[j].naam}`);
        return true;
    } else if (r[j].eigenWaardeCijfer() - r[i].eigenWaardeCijfer() > 3) { // 0-0-0.nl versie 0.8.17 >= 3 verandert in > 3
        console.log(`${r[i].naam} te zwak voor ${r[j].naam}`);
        return true;
    }
    return false;
}

function vooruitIndelen(r, wit, zwart, oneven, rondeNummer) {
    const nietIngedeeld = [];
    for (let i = 0; i < r.length; i++) {
        if (!ingedeeld(i, wit, zwart, oneven)) { // indien niet ingedeeld of oneven
            let j = i + 1;
            while (j < r.length && (ingedeeld(j, wit, zwart, oneven) || nietTegen(r, i, j, rondeNummer))) { // met heuristieken
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

const VOORUIT = 1;
const ACHTERUIT = -1;

function spelerIndelen(speler, richting, r, wit, zwart, oneven) {
    console.log(`--- ${r[speler].naam} ${richting === VOORUIT ? "vooruit" : "achteruit"} indelen ---`);
    let j = speler + richting;
    while (j >= 0 && j < r.length && (ingedeeld(j, wit, zwart, oneven) || !r[speler].tegen(r[j]) || !r[j].tegen(r[speler]))) { // zonder heuristieken
        j = j + richting; // volgende / vorige indien al ingedeeld of oneven of mag niet tegen
    }
    if (j >= 0 && j < r.length) {
        if (r[speler].metWit(r[j])) {
            wit.push(speler);
            zwart.push(j);
        } else {
            wit.push(j);
            zwart.push(speler);
        }
        return true;
    } else {
        return false;
    }
}

function ingedeeld(speler, wit, zwart, oneven) {
    return wit.includes(speler) || zwart.includes(speler) || (oneven && speler === oneven);
}

function opnieuwIndelen(wit, zwart) {
    while (wit.length) {
        wit.pop();
        zwart.pop();
    }
}

function eenNietIngedeeldeSpeler(nietIngedeeld, poging) {
    for (const speler of nietIngedeeld) {
        if (!poging.includes(speler)) {
            poging.push(speler);
            return speler;
        }
    }
    return 0;
}

function volgendeNietIngedeeldeSpeler(nietIngedeeld, poging, volgnummer) {
    let nummer = 0;
    for (const speler of nietIngedeeld) {
        if (!poging.includes(speler) && ++nummer >= volgnummer) {
            poging.push(speler);
            return speler;
        }
    }
    return 0;
}

function laatsteNietIngedeeldeSpeler(nietIngedeeld, poging, volgnummer) {
    let nummer = 0;
    for (let i = nietIngedeeld.length - 1; i >= 0; i--) {
        if (!poging.includes(nietIngedeeld[i]) && ++nummer >= volgnummer) {
            poging.push(nietIngedeeld[i]);
            return nietIngedeeld[i];
        }
    }
    return 0;
}

/**
 * Indien er een oneven aantal deelnemers is, is er een onevenSpeler.
 * De onevenSpeler is de laagste speler van de ranglijst met het grootste aantal gespeelde partijen
 * die niet eerder oneven was en
 * die niet bij eerste 8 aanwezige spelers van de ranglijst staat.
 *
 * @param r ranglijst
 * @returns {number|number} 0 indien niemand oneven anders onevenSpeler
 */
function onevenSpeler(r) {
    let oneven = r.length % 2 === 0 ? 0 : r.length - 1;  // laatste speler is oneven
    if (oneven) {
        while (r[oneven].oneven()) {
            console.log(`laatste speler ${r[oneven].naam} was al oneven`);
            oneven--;
        }
        for (let i = oneven; i > 7; i--) { // eerste 8 aanwezige spelers mogen niet oneven zijn
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