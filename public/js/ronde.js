"use strict";

import * as html from "./html.js";
import * as db from "./db.js";
import { o_o_o, init, competitieTitel, vorigeRonde, rondeGegevens, rondeSelecteren } from "./o_o_o.js"

import * as zyq from "./zyq.js";

/*
    verwerk ronde=<rondeNummer>
           &wit=<knsbNummer>
           &zwart=<knsbNummer>
           &uitslag=<uitslag wit>
 */
(async function() {
    await init();
    competitieTitel();
    o_o_o.team = o_o_o.competitie;
    const rondeNummer = Number(html.params.get("ronde")) || vorigeRonde() || 1;
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
    await uitslagenRonde(rondeNummer, html.id("uitslagen"));
    html.id("kop").textContent =
        `Ronde ${rondeNummer}${html.SCHEIDING}${zyq.datumLeesbaar(rondeGegevens(o_o_o.team, rondeNummer))}`;
})();

async function uitslagenRonde(rondeNummer, lijst) {
    const gewijzigd = await uitslagMutatie(rondeNummer);
    const uitslagen = await zyq.serverFetch(
        `/${o_o_o.club}/${o_o_o.seizoen}/${o_o_o.competitie}/${rondeNummer}/ronde`); // actuele situatie
    if (uitslagen.length > 0) {
        for (const uitslag of uitslagen) {
            const resultaatKolom = resultaatSelecteren(rondeNummer, uitslag);
            html.verwerkt(resultaatKolom, uitslag.knsbNummer === gewijzigd.wit && uitslag.tegenstanderNummer === gewijzigd.zwart);
            lijst.append(html.rij(
                uitslag.bordNummer,
                zyq.naarSpeler({knsbNummer: uitslag.knsbNummer, naam: uitslag.wit}),
                zyq.naarSpeler({knsbNummer: uitslag.tegenstanderNummer, naam: uitslag.zwart}),
                resultaatKolom));
        }
    } else {
        lijst.append(html.rij("nog", "geen", "uitslagen", ""));
    }
}

/*
    verwerk &ronde=<rondeNummer>&wit=<wit>&zwart=<zwart>&uitslag=<uitslag>
 */
async function uitslagMutatie(rondeNummer) {
    const wit = html.params.get("wit");
    const zwart = html.params.get("zwart");
    const uitslag = html.params.get("uitslag");
    if (wit && zwart && uitslag) {
        const mutaties = await zyq.serverFetch(
            `/${zyq.uuidToken}/${o_o_o.club}/${o_o_o.seizoen}/${o_o_o.competitie}/${rondeNummer}/${wit}/uitslag/${zwart}/${uitslag}`);
    }
    return {wit: Number(wit), zwart: Number(zwart)};
}

function resultaatSelecteren(rondeNummer, uitslag) {
    if (uitslagWijzigen(uitslag)) {
        const knop = document.createElement("select");
        html.selectie(knop, uitslag.resultaat, db.resultaatSelecteren(uitslag), function (resultaat) {
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
