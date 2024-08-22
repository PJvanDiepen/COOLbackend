"use strict";

import * as html from "./html.js";
import * as db from "./db.js";
import { o_o_o, init, ranglijst } from "./o_o_o.js";

import * as zyq from "./zyq.js";

const versieIndelen = Number(html.params.get("indelen")) || 0;
const indeling = html.id("indeling");

/*
    verwerk ronde=<ronde>
           &rangnummers=aan
           &indelen=<versienummer indelen algoritme>
 */

(async function() {
    await init();
    db.competitieTitel();
    const rondeNummer = Number(html.params.get("ronde")) || o_o_o.huidigeRonde;
    const totDatum = o_o_o.ronde[rondeNummer].datum;
    html.id("subkop").textContent =
        `Indeling ronde ${rondeNummer}${html.SCHEIDING}${zyq.datumLeesbaar({datum: totDatum})}`;

    let laatsteBord = 0;
    const paren = await zyq.serverFetch(`/${zyq.uuidToken}/${db.key(o_o_o.ronde[rondeNummer])}/paren`);
    for (const paar of paren) {
        laatsteBord = paar.bordNummer;
        indeling.append(html.rij(laatsteBord,
            zyq.naarSpeler({knsbNummer: paar.knsbNummer, naam: paar.wit}),
            zyq.naarSpeler({knsbNummer: paar.tegenstanderNummer, naam: paar.zwart}),
            ""));
    }
    const r = await ranglijstOpPuntenRating(rondeNummer, await deelnemersRonde(rondeNummer));
    const partijen = rondeNummer === 1
        ? indelenRonde1 (r)
        : indelenFun[versieIndelen][1](r, rondeNummer);
    const rangnummers = rangnummersToggle(document.querySelector("details"), rondeNummer);
    let bordNummer = laatsteBord;
    for (const [wit, zwart] of partijen) {
        const nietIngedeeld = zwart < 0;
        const oneven = wit === zwart;
        indeling.append(html.rij(nietIngedeeld || oneven ? "" : ++bordNummer,
            zyq.naarSpeler(r[wit]),
            nietIngedeeld ? "niet ingedeeld" : oneven ? "oneven" : zyq.naarSpeler(r[zwart]),
            rangnummers ? `${wit + 1} - ${zwart + 1}` : ""));
    }

    const uithuis = await zyq.serverFetch(
        `/${zyq.uuidToken}/${o_o_o.club}/${o_o_o.seizoen}/uithuis/${zyq.datumSQL(totDatum)}`); // actuele situatie
    for (const speler of uithuis) {
        const bord = // EXTERN_THUIS heeft extra bord nodig EXTERN_UIT niet
            speler.partij === db.EXTERN_THUIS ? ++bordNummer : "";
        indeling.append(html.rij(bord, zyq.naarSpeler(speler), "", "extern"));
    }
    if (rangnummers) {
        deelnemersLijst(r, html.id("lijst"), rondeNummer);
    }
    await html.menu(zyq.gebruiker.mutatieRechten,
        [db.WEDSTRIJDLEIDER, `handmatig indelen ronde ${rondeNummer}`, function () {
            html.anderePagina(`paren.html?ronde=${rondeNummer}`);
        }],

        [db.WEDSTRIJDLEIDER, "indeling definitief maken", async function () {
            let mutaties = 0;
            const planning = {
                clubCode: o_o_o.club,
                seizoen: o_o_o.seizoen,
                teamCode: o_o_o.competitie,
                rondeNummer: rondeNummer};
            for (const paar of paren) {
                mutaties += await zyq.serverFetch(
                    `/${zyq.uuidToken}/${db.key(planning)}/${paar.knsbNummer}/indelen/${paar.bordNummer}/${paar.tegenstanderNummer}`);
            }
            let bordNummer = laatsteBord;
            for (const [wit, zwart] of partijen) {
                if (zwart < 0 || wit === zwart) { // niet ingedeeld of oneven
                    mutaties += await zyq.serverFetch(
                        `/${zyq.uuidToken}/${db.key(planning)}/${r[wit].knsbNummer}/oneven`);
                } else {
                    bordNummer++;
                    mutaties += await zyq.serverFetch(
                        `/${zyq.uuidToken}/${db.key(planning)}/${r[wit].knsbNummer}/indelen/${bordNummer}/${r[zwart].knsbNummer}`);
                }
            }
            mutaties += await zyq.serverFetch(`/${zyq.uuidToken}/${db.key(planning)}/afwezig`);
            mutaties += await zyq.serverFetch(`/${zyq.uuidToken}/${db.key(planning)}/extern`);
            if (mutaties) {
                html.anderePagina(`ronde.html?ronde=${rondeNummer}`);
            }
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
        return await zyq.serverFetch(
            `/${zyq.uuidToken}/${o_o_o.club}/${o_o_o.seizoen}/${o_o_o.competitie}/${rondeNummer}/deelnemers`); // actuele situatie
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

/**
 * indelenRonde1
 *
 * @param r ranglijst
 * @returns {*[]} indeling partijen als paren
 *
 * een paar bestaat uit: wit tegen zwart
 * of speler tegen zichzelf indien oneven
 * of speler tegen -1 indien niet ingedeeld
 */
function indelenRonde1(r) {
    const oneven = r.length % 2 === 0 ? 0 : r.length - 1;  // laatste speler is oneven
    const aantalSpelers = oneven ? oneven : r.length;
    const aantalPartijen = aantalSpelers / 2;
    const aantalGroepen = juisteAantalGroepen(3, aantalSpelers);
    const helftGroep = Math.floor(aantalPartijen / aantalGroepen);
    const tot = (aantalGroepen - 1) * helftGroep; // tot laatste groep
    const partijen = [];
    for (let van = 0; van < tot; van += helftGroep) {
        groepIndelenRonde1(partijen, van, van + helftGroep);
    }
    groepIndelenRonde1(partijen, tot, aantalPartijen);
    if (oneven) {
        partijen.push([oneven, oneven]);
    }
    return partijen;
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

function groepIndelenRonde1(partijen, van, tot) {
    const sterkste = van % 2; // op van, van + 2, van + 4 heeft de sterkste speler zwart
    for (let i = van; i < tot; i++) {
        partijen.push(i % 2 === sterkste ? [i + tot, i + van] : [i + van, i + tot]);
    }
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

function deelnemersLijst(r, lijst, rondeNummer) {
    for (let i = 0; i < r.length; i++) {
        const speler = r[i];
        const magNietTegenstanders = [];
        const lieverNietTegenstanders = [];
        for (let j = 0; j < r.length; j++) {
            if (!r[i].tegen(r[j])) {
                magNietTegenstanders.push(j + 1);
            } else if (nietTegen(r, i, j, rondeNummer)) {
                lieverNietTegenstanders.push(j + 1);
            }
        }
        lijst.append(html.rij(i + 1,
            zyq.naarSpeler(speler),
            speler.punten(),
            speler.eigenWaardeCijfer(),
            speler.intern(),
            magNietTegenstanders.join(", "),
            lieverNietTegenstanders.join(", "),
            speler.saldoWitZwart() ? speler.saldoWitZwart() : ""));
    }
}

/**
 * indelenFun
 *
 * @param r ranglijst
 * @param rondeNummer van ronde die wordt ingedeeld
 * @returns {*[]} indeling partijen als paren
 *
 * een paar bestaat uit: wit tegen zwart
 * of speler tegen zichzelf indien oneven
 * of speler tegen -1 indien niet ingedeeld
 *
 * TODO indelenFun stap voor stap verbeteren
 * TODO indelenFun: oneven, wit en zwart zijn overbodig
 */
const indelenFun = [
    // het enige verschil tussen deze versie en 0.8.17 is dat een aantal regels code zijn verwijderd.
    ["0-0-0.nl versie 0.8.52", function (r, rondeNummer) {
        const oneven = onevenSpeler(r);
        const wit = [];
        const zwart = [];
        let nietIngedeeld = vooruitIndelen(r, wit, zwart, oneven, rondeNummer);
        if (nietIngedeeld.length > 0) {
            let poging = [];
            console.log("--- niet ingedeelde spelers eerst indelen ---");
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
            if (nietIngedeeld.length > 0) {
                console.log("--- mislukt ---");
            }
        }
        const partijen = [];
        for (let i = 0; i < wit.length; i++) {
            partijen.push([wit[i], zwart[i]]);
        }
        if (oneven) {
            partijen.push([oneven, oneven]);
        }
        for (const speler of nietIngedeeld) {
            partijen.push([speler, -1])
        }
        return partijen
    }],

    ["0-0-0.nl versie 0.8.17", function (r, rondeNummer) {
        const oneven = onevenSpeler(r);
        const wit = [];
        const zwart = [];
        let nietIngedeeld = vooruitIndelen(r, wit, zwart, oneven, rondeNummer);
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
        const partijen = [];
        for (let i = 0; i < wit.length; i++) {
            partijen.push([wit[i], zwart[i]]);
        }
        if (oneven) {
            partijen.push([oneven, oneven]);
        }
        for (const speler of nietIngedeeld) {
            partijen.push([speler, -1])
        }
        return partijen
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
    if (!r[i].tegen(r[j])) {
        return true;
    } else if (o_o_o.competitie === db.RAPID_COMPETITIE || versieIndelen > 0) { // rapid en oudere versies zonder heuristieken
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
    while (j >= 0 && j < r.length && (ingedeeld(j, wit, zwart, oneven) || !r[speler].tegen(r[j]))) { // zonder heuristieken
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