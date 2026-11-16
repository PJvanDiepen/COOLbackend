"use strict";

import * as html from "./html.js";
import * as db from "./db.js";
import { o_o_o, init, competitieTitel, vorigeRonde, rondeGegevens, rondeSelecteren } from "./o_o_o.js"

import * as zyq from "./zyq.js";

/*
    verwerk ronde=<rondeNummer>
           &wit=<knsbNummer>
           &zwart=<knsbNummer>
           &uitslag=<resultaten wit>
 */
(async function() {
    await init();
    competitieTitel();
    o_o_o.team = o_o_o.competitie;
    const rondeNummer = Number(html.params.get("ronde")) || vorigeRonde() || 1;
    const mutatie = await uitslagMuteren(rondeNummer);
    await html.menu(zyq.gebruiker.mutatieRechten,[db.BEHEERDER, `ranglijst na ronde ${rondeNummer}`, function() {
            html.anderePagina(`ranglijst.html?ronde=${rondeNummer}`);
        }],
        [db.ONTWIKKElAAR, `backup uitslagen ronde ${rondeNummer}` , async function () {
            zyq.backupSQL("uitslag", await zyq.serverFetch(
                `/${o_o_o.club}/${o_o_o.seizoen}/${o_o_o.team}/${rondeNummer}/backup/uitslagen/${rondeNummer}`));
        }],
        [db.WEDSTRIJDLEIDER, `verwijder indeling ronde ${rondeNummer}`, async function () {
            const mutaties = await zyq.serverFetch(
                `/${zyq.uuidToken}/${o_o_o.club}/${o_o_o.seizoen}/${o_o_o.team}/${rondeNummer}/verwijder/indeling`);
            if (mutaties) {
                html.anderePagina(`indelen.html?ronde=${rondeNummer}`)
            } else {
                console.log(`Verwijder indeling ronde ${rondeNummer} is mislukt.`);
            }
        }],
        [db.BEHEERDER, `verwijder ronde ${rondeNummer} (pas op!)`, async function () {
            const mutaties = await zyq.serverFetch(
                `/${zyq.uuidToken}/${o_o_o.club}/${o_o_o.seizoen}/${o_o_o.team}/${rondeNummer}/verwijder/ronde`);
            if (!mutaties) {
                console.log(`Verwijder ronde ${rondeNummer} is mislukt.`);
            }
        }]);
    await rondeSelecteren(o_o_o.competitie, rondeNummer);
    await uitslagenRonde(rondeNummer, mutatie, html.id("uitslagen"));
    html.id("kop").textContent =
        `Ronde ${rondeNummer}${html.SCHEIDING}${zyq.datumLeesbaar(rondeGegevens(o_o_o.team, rondeNummer))}`;
})();

async function uitslagMuteren(rondeNummer) {
    const wit = html.params.get("wit");
    const zwart = html.params.get("zwart");
    const uitslag = html.params.get("uitslag");
    if (wit && zwart && uitslag) {
        const mutaties = await zyq.serverFetch(
            `/${zyq.uuidToken}/${o_o_o.club}/${o_o_o.seizoen}/${o_o_o.competitie}/${rondeNummer}/${wit}/uitslag/${zwart}/${uitslag}`);
    }
    return {wit: Number(wit), zwart: Number(zwart)};
}

async function uitslagenRonde(rondeNummer, mutatie, lijst) {
    const uitslagen = await zyq.serverFetch(
        `/${o_o_o.club}/${o_o_o.seizoen}/${o_o_o.competitie}/${rondeNummer}/ronde`); // actuele situatie
    if (uitslagen.length === 0) {
        lijst.append(html.rij("nog", "geen", "uitslagen", ""));
    } else {
        for (const uitslag of uitslagen) {
            const partij = resultaatSelecteren(rondeNummer, uitslag);
            if (uitslag.knsbNummer === mutatie.wit && uitslag.tegenstanderNummer === mutatie.zwart) {
                html.verwerkt(partij, true);
            }
            lijst.append(html.rij(
                uitslag.bordNummer,
                zyq.naarSpeler({knsbNummer: uitslag.knsbNummer, naam: uitslag.wit}),
                zyq.naarSpeler({knsbNummer: uitslag.tegenstanderNummer, naam: uitslag.zwart}),
                partij));
            if (uitslag.resultaten.length > 1) {
                lijst.append(html.rij(
                    "",
                    zyq.naarSpeler({knsbNummer: uitslag.tegenstanderNummer, naam: uitslag.zwart}),
                    zyq.naarSpeler({knsbNummer: uitslag.knsbNummer, naam: uitslag.wit}),
                    resultaatRevanche(uitslag.resultaten[1])));
            }
        }
        // Matheus de Boer, Peter van Diepen, Anton Schermer, Ton Fasel, Joris Hartog
        if ([100, 6212404, 7443172, 8112654, 8744494].includes(zyq.gebruiker.knsbNummer)) {
            lijst.append(html.rij("", "----- 0-0-0 issues ------", "", ""));
            const uitslag = eenUitslag(uitslagen, zyq.gebruiker.knsbNummer);
            lijst.append(html.rij(
                uitslag.bordNummer,
                zyq.naarSpeler({knsbNummer: uitslag.knsbNummer, naam: uitslag.wit}),
                zyq.naarSpeler({knsbNummer: uitslag.tegenstanderNummer, naam: uitslag.zwart}),
                html.naarPaginaEnTerug(
                    `uitslag.html?bord=${uitslag.bordNummer}` +
                    `&wit=${uitslag.knsbNummer}` +
                    `&zwart=${uitslag.tegenstanderNummer}` +
                    `&resultaten${uitslag.resultaten}`,
                    db.resultaatInvullen.get(uitslag.resultaten[0]))));
        }
    }
}

function eenUitslag(uitslagen, knsbNummer) {
    for (const uitslag of uitslagen) {
        if (uitslag.knsbNummer === knsbNummer || uitslag.tegenstanderNummer.knsbNummer === knsbNummer) {
            return uitslag;
        }
        return uitslagen[0];
    }
}

function resultaatRevanche(resultaat) {
    return db.resultaatInvullen.get(
        resultaat === db.WINST ? db.VERLIES : resultaat === db.VERLIES ? db.WINST : db.REMISE);
}

function resultaatSelecteren(rondeNummer, uitslag) {
    if (uitslag.resultaten.length > 1) { // 2 uitslagen niet wijzigen
        return db.resultaatInvullen.get(uitslag.resultaten[0]);
    } else if (uitslagWijzigen(uitslag)) {
        const knop = document.createElement("select");
        const opties = uitslag.resultaat === "" // met of zonder blanko resultaat
            ? [...db.resultaatInvullen]
            : [...db.resultaatInvullen].slice(1);
        html.selectie(knop, uitslag.resultaat, opties, function (resultaat) {
            html.zelfdePagina(`ronde=${rondeNummer}&wit=${uitslag.knsbNummer}&zwart=${uitslag.tegenstanderNummer}&uitslag=${resultaat}`);
        });
        return knop;
    } else {
        return db.resultaatInvullen.get(uitslag.resultaat);
    }
}

function uitslagWijzigen(uitslag)  {
    if (o_o_o.seizoen !== zyq.ditSeizoen) { // vorig seizoen nooit wijzigen
        return false;
    } else if (zyq.gebruiker.mutatieRechten >= db.WEDSTRIJDLEIDER) {
        return true;
    } else if (zyq.gebruiker.mutatieRechten >= db.GEREGISTREERD && uitslag.resultaat === "") { // indien nog geen resultaat
        return uitslag.knsbNummer === zyq.gebruiker.knsbNummer || uitslag.tegenstanderNummer === zyq.gebruiker.knsbNummer;
    } else {
        return false;
    }
}
