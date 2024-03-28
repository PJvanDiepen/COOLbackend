"use strict";

import * as html from "./html.js";
import * as db from "./db.js";

import {rondeSelecteren, perTeamRondenUitslagen} from "./o_o_o.js"

import * as zyq from "./zyq.js";

/*
    verwerk ronde=<rondeNummer>
           &wit=<knsbNummer>
           &zwart=<knsbNummer>
           &uitslag=<uitslag wit>
 */
(async function() {
    await zyq.init();
    zyq.competitieTitel();
    zyq.o_o_o.team = zyq.o_o_o.competitie;
    const rondeNummer = Number(html.params.get("ronde")) || zyq.o_o_o.vorigeRonde || 1;
    await html.menu(zyq.gebruiker.mutatieRechten,[db.BEHEERDER, `ranglijst na ronde ${rondeNummer}`, function() {
            html.anderePagina(`ranglijst.html?ronde=${rondeNummer}`);
        }],
        [db.ONTWIKKElAAR, `backup uitslagen ronde ${rondeNummer}` , async function () {
            const rijen = await zyq.serverFetch(`/backup/ronde/uitslag/${zyq.o_o_o.seizoen}/${zyq.o_o_o.team}/${rondeNummer}/${rondeNummer}`);
            zyq.backupSQL("uitslag", rijen);
        }],
        [db.WEDSTRIJDLEIDER, `verwijder indeling ronde ${rondeNummer}`, async function () {
            const mutaties = await zyq.serverFetch(
                `/${zyq.uuidToken}/verwijder/indeling/${zyq.o_o_o.seizoen}/${zyq.o_o_o.competitie}/${rondeNummer}`);
            if (mutaties) {
                html.anderePagina(`indelen.html?ronde=${rondeNummer}`)
            } else {
                console.log(`Verwijder indeling ronde ${rondeNummer} is mislukt.`);
            }
        }],
        [db.BEHEERDER, `wijzig ronde ${rondeNummer}`, async function () {
            html.anderePagina(`wijzig.html?ronde=${rondeNummer}`);
        }],
        [db.BEHEERDER, `verwijder ronde ${rondeNummer} (pas op!)`, async function () {
            const mutaties = await zyq.serverFetch(
                `/${zyq.uuidToken}/verwijder/ronde/${zyq.o_o_o.seizoen}/int/${rondeNummer}`);
            if (!mutaties) {
                console.log(`Verwijder ronde ${rondeNummer} is mislukt.`);
            }
        }]);
    await rondeSelecteren(zyq.o_o_o.competitie, rondeNummer);
    await uitslagenRonde(rondeNummer, html.id("uitslagen"));
    await wedstrijdenBijRonde(rondeNummer, html.id("wedstrijden"));
    html.id("kop").textContent =
        `Ronde ${rondeNummer}${html.SCHEIDING}${zyq.datumLeesbaar(zyq.o_o_o.ronde[rondeNummer])}`;
    if (zyq.o_o_o.competitie === zyq.INTERNE_COMPETITIE) {
        html.id("subkop").textContent = "Andere ronden en wedstrijden";
    }
})();

async function uitslagenRonde(rondeNummer, lijst) {
    const gewijzigd = await uitslagMutatie(rondeNummer);
    const uitslagen = await zyq.serverFetch(`/ronde/${zyq.o_o_o.seizoen}/${zyq.o_o_o.competitie}/${rondeNummer}`); // actuele situatie
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
            `/${zyq.uuidToken}/uitslag/${zyq.o_o_o.seizoen}/${zyq.o_o_o.competitie}/${rondeNummer}/${wit}/${zwart}/${uitslag}`);
        if (mutaties > 0) {
            for (const key of Object.keys(sessionStorage)) {
                if (key.startsWith(`/ranglijst/${zyq.o_o_o.seizoen}`) ||
                    key.startsWith(`/uitslagen/${zyq.o_o_o.seizoen}`)) {
                    sessionStorage.removeItem(key);
                }
            }
        }
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
    if (zyq.o_o_o.seizoen !== zyq.ditSeizoen) { // vorig seizoen nooit wijzigen
        return false;
    } else if (zyq.gebruiker.mutatieRechten >= db.WEDSTRIJDLEIDER) {
        return true;
    } else if (zyq.gebruiker.mutatieRechten >= db.GEREGISTREERD && uitslag.resultaat === "") { // indien nog geen resultaat
        return uitslag.knsbNummer === zyq.gebruiker.knsbNummer || uitslag.tegenstanderNummer === zyq.gebruiker.knsbNummer;
    } else {
        return false;
    }
}

async function wedstrijdenBijRonde(rondeNummer, lijst) {
    if (rondeNummer > 1) {
        lijst.append(rondeInterneCompetitie(rondeNummer - 1)); // vorige ronde
    }
    let dezeRonde = false;
    if (zyq.o_o_o.competitie === db.INTERNE_COMPETITIE) { // wedstrijden die meetellen voor de interne competitie
        const wedstrijden = await zyq.localFetch(`/wedstrijden/${zyq.o_o_o.seizoen}`);
        for (const wedstrijd of wedstrijden) {
            if (!dezeRonde && zyq.o_o_o.ronde[rondeNummer].datum === wedstrijd.datum) {
                lijst.append(rondeInterneCompetitie(rondeNummer));
                dezeRonde = true; // deze ronde een keer in de lijst
            }
            if (wedstrijdBijRonde(rondeNummer, wedstrijd.datum)) {
                const datumKolom = zyq.datumLeesbaar(wedstrijd);
                const wedstrijdKolom = zyq.naarTeam(wedstrijd);
                const rondeUitslagen = await perTeamRondenUitslagen(wedstrijd.teamCode);
                const u = rondeUitslagen[wedstrijd.rondeNummer];
                const uitslagKolom = zyq.uitslagTeam(u.ronde.uithuis, u.winst, u.verlies, u.remise);
                lijst.append(html.rij("", datumKolom, wedstrijdKolom, uitslagKolom));
            }
        }
    }
    if (!dezeRonde) { // indien deze ronde nog niet in de lijst
        lijst.append(rondeInterneCompetitie(rondeNummer));
    }
    if (zyq.o_o_o.laatsteRonde > rondeNummer) {
        lijst.append(rondeInterneCompetitie(rondeNummer + 1)); // volgende ronde
        }
    }

function rondeInterneCompetitie(rondeNummer) {
    return html.rij(rondeNummer,
        html.naarPagina(`ronde.html?ronde=${rondeNummer}`, zyq.datumLeesbaar(zyq.o_o_o.ronde[rondeNummer])),
        zyq.teamVoluit(zyq.o_o_o.competitie),
        "");
}

function wedstrijdBijRonde(rondeNummer, datum) {
    if (rondeNummer === 1) {
        return datum <= zyq.o_o_o.ronde[1].datum; // bij ronde 1 uitsluitend wedstrijden tot en met datum ronde 1
    } else if (rondeNummer === zyq.o_o_o.laatsteRonde) {
        return datum > zyq.o_o_o.ronde[rondeNummer - 1].datum; // bij laatste ronde alle wedstrijden vanaf voorlaatste ronde
    } else {
        return datum > zyq.o_o_o.ronde[rondeNummer - 1].datum && datum <= zyq.o_o_o.ronde[rondeNummer].datum;
    }
}