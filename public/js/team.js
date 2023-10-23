"use strict";

import * as html from "./html.js";
import * as db from "./db.js";

import * as zyq from "./zyq.js";

/*
verwerk team=<teamCode>
 */
(async function() {
    await zyq.init();
    await html.menu(zyq.gebruiker.mutatieRechten,[db.ONTWIKKElAAR, "backup uitslagen van alle ronden" , async function () {
            const rijen = await zyq.serverFetch(`/backup/ronde/uitslag/${zyq.o_o_o.seizoen}/${zyq.o_o_o.team}/1/9`);
            zyq.backupSQL("uitslag", rijen);
        }]);
    await teamSelecteren(zyq.o_o_o.team);
    await uitslagenTeam(document.getElementById("kop"), document.getElementById("ronden"));
})();

async function teamSelecteren(teamCode) {
    const teams = (await zyq.localFetch("/teams/" + zyq.o_o_o.seizoen)).filter(function (team) {
        return zyq.teamOfCompetitie(team.teamCode);
    }).map(function (team) {
        return [team.teamCode, zyq.teamVoluit(team.teamCode)];
    });
    html.selectie(html.id("teamSelecteren"), teamCode, teams, function (team) {
        if (zyq.interneCompetitie(team)) {
            html.anderePagina(`ranglijst.html?competitie=${team}`);
        } else {
            html.anderePagina(`team.html?team=${team}`);
        }
    });
}

async function uitslagenTeam(kop, rondenTabel) {
    const teams = await zyq.localFetch(`/teams/${zyq.o_o_o.seizoen}`);
    for (const team of teams) {
        if (team.teamCode === zyq.o_o_o.team) {
            kop.innerHTML = [zyq.teamVoluit(zyq.o_o_o.team), zyq.seizoenVoluit(zyq.o_o_o.seizoen), team.omschrijving].join(html.SCHEIDING);
            break;
        }
    }
    const rondeUitslagen = await zyq.uitslagenTeamAlleRonden(zyq.o_o_o.team);
    for (let i = 0; i < rondeUitslagen.length; ++i) {
        uitslagenTeamPerRonde(rondeUitslagen[i], i + 1, rondenTabel);
    }
}

function uitslagenTeamPerRonde(u, rondeNummer, rondenTabel) {
    if (u) { // eventueel ronde overslaan, wegens oneven aantal teams in een poule
        const datumKolom = zyq.datumLeesbaar(u.ronde);
        const uitslagKolom = zyq.uitslagTeam(u.ronde.uithuis, u.winst, u.verlies, u.remise);
        rondenTabel.append(html.rij(u.ronde.rondeNummer, datumKolom, zyq.naarTeam(u.ronde), uitslagKolom));
        if (u.uitslagen.length) {
            const div = document.getElementById("ronde" + rondeNummer); // 9 x div met id="ronde1".."ronde9"
            div.appendChild(document.createElement("h2")).innerHTML = ["Ronde " + rondeNummer, datumKolom].join(html.SCHEIDING);
            const tabel = div.appendChild(document.createElement("table"));
            tabel.append(html.rij("", zyq.wedstrijdVoluit(u.ronde), "", uitslagKolom));
            for (let uitslag of u.uitslagen) {
                tabel.append(uitslag);
            }
        }
    }
}