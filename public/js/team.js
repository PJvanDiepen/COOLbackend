"use strict";

(async function() {
    await init();
    menu([GEREGISTREERD, "systeembeheer", function () {
            naarAnderePagina("beheer.html");
        }],
        [BEHEERDER, "backup uitslagen van alle ronden" , async function () {
            const rijen = await serverFetch(`/backup/ronde/uitslag/${o_o_o.seizoen}/${o_o_o.team}/1/9`);
            backupSQL("uitslag", rijen);
        }]);
    await teamSelecteren(o_o_o.team);
    await uitslagenTeam(document.getElementById("kop"), document.getElementById("ronden"));
})();

async function uitslagenTeam(kop, rondenTabel) {
    const teams = await localFetch("/teams/" + o_o_o.seizoen);
    for (const team of teams) {
        if (team.teamCode === o_o_o.team) {
            kop.innerHTML = [teamVoluit(o_o_o.team), seizoenVoluit(o_o_o.seizoen), team.omschrijving].join(SCHEIDING);
            break;
        }
    }
    const rondeUitslagen = await uitslagenTeamAlleRonden(o_o_o.team);
    for (let i = 0; i < rondeUitslagen.length; ++i) {
        uitslagenTeamPerRonde(rondeUitslagen[i], i + 1, rondenTabel);
    }
}

function uitslagenTeamPerRonde(u, rondeNummer, rondenTabel) {
    if (u) { // eventueel ronde overslaan, wegens oneven aantal teams in een poule
        const datumKolom = datumLeesbaar(u.ronde);
        const uitslagKolom = uitslagTeam(u.ronde.uithuis, u.winst, u.verlies, u.remise);
        rondenTabel.appendChild(htmlRij(u.ronde.rondeNummer, datumKolom, naarTeam(u.ronde), uitslagKolom));
        if (u.uitslagen.length) {
            const div = document.getElementById("ronde" + rondeNummer); // 9 x div met id="ronde1".."ronde9"
            div.appendChild(document.createElement("h2")).innerHTML = ["Ronde " + rondeNummer, datumKolom].join(SCHEIDING);
            const tabel = div.appendChild(document.createElement("table"));
            tabel.appendChild(htmlRij("", wedstrijdVoluit(u.ronde), "", uitslagKolom));
            for (let uitslag of u.uitslagen) {
                tabel.appendChild(uitslag);
            }
        }
    }
}