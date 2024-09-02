"use strict";

import * as html from "./html.js";
import * as db from "./db.js";
import { o_o_o, init, teamSelecteren, perTeamRondenUitslagen } from "./o_o_o.js"

import * as zyq from "./zyq.js";

/*
verwerk team=<teamCode>
 */
(async function() {
    await init();
    await html.menu(zyq.gebruiker.mutatieRechten,[db.ONTWIKKElAAR, "backup uitslagen van alle ronden" , async function () {
        zyq.backupSQL("uitslag", await zyq.serverFetch(
            `/${o_o_o.club}/${o_o_o.seizoen}/${o_o_o.team}/1/backup/uitslagen/9`));
    }]);
    await teamSelecteren(o_o_o.team);
    await uitslagenTeam(html.id("kop"), html.id("ronden"));
})();

async function uitslagenTeam(kop, rondenTabel) {
    const teams = await zyq.localFetch(`/${o_o_o.club}/${o_o_o.seizoen}/teams`);
    for (const team of teams) {
        if (team.teamCode === o_o_o.team) {
            kop.textContent = db.isBekerCompetitie(team)
                ? `${db.teamVoluit(team.teamCode)}${html.SCHEIDING}${zyq.seizoenVoluit(o_o_o.seizoen)}`
                : `${db.teamVoluit(team.teamCode)}${html.SCHEIDING}${zyq.seizoenVoluit(o_o_o.seizoen)}${html.SCHEIDING}${team.omschrijving}`;
            break;
        }
    }
    const rondeUitslagen = await perTeamRondenUitslagen(o_o_o.team);
    for (let rondeNummer = 1; rondeNummer < rondeUitslagen.length; ++rondeNummer) {
        uitslagenTeamPerRonde(rondeUitslagen[rondeNummer], rondeNummer, rondenTabel);
    }
}

function uitslagenTeamPerRonde(u, rondeNummer, rondenTabel) {
    if (u) { // eventueel ronde overslaan, wegens oneven aantal teams in een poule
        const datumKolom = zyq.datumLeesbaar(u.ronde);
        const uitslagKolom = zyq.uitslagTeam(u.ronde.uithuis, u.winst, u.verlies, u.remise);
        rondenTabel.append(html.rij(u.ronde.rondeNummer, datumKolom, zyq.naarTeam(u.ronde), uitslagKolom));
        if (u.uitslagen.length) {
            const div = html.id("ronde" + rondeNummer); // 9 x div met id="ronde1".."ronde9"
            div.appendChild(document.createElement("h2")).textContent =
                `Ronde ${rondeNummer}${html.SCHEIDING}${datumKolom}`;
            const tabel = div.appendChild(document.createElement("table"));
            tabel.append(html.rij("", db.wedstrijdVoluit(u.ronde), "", uitslagKolom));
            for (let uitslag of u.uitslagen) {
                tabel.append(html.rij(uitslag.bordNummer, zyq.naarSpeler(uitslag), uitslag.witZwart, uitslag.resultaat));
            }
        }
    }
}