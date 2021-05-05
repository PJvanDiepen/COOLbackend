"use strict";

actieSelecteren(document.getElementById("actieSelecteren"),
    hamburgerMenu,
    naarRanglijst,
    [1, "wijzigen..."],
    terugNaar
);
teamSelecteren(document.getElementById("teamSelecteren"), teamCode);
uitslagenTeam(document.getElementById("kop"),document.getElementById("ronden"));

async function uitslagenTeam(kop, rondenTabel) {
    await findAsync("/teams/" + seizoen,
        function (team) {
            if (team.teamCode === teamCode) {
                kop.innerHTML = [wedstrijdTeam(teamCode), seizoenVoluit(seizoen), team.omschrijving].join(SCHEIDING);
                return true;
            }
        });
    const rondeUitslagen = await uitslagenTeamAlleRonden(teamCode);
    for (let i = 0; i < rondeUitslagen.length; ++i) {
        uitslagenTeamPerRonde(rondeUitslagen[i], i + 1, rondenTabel);
    }
}

function uitslagenTeamPerRonde(u, rondeNummer, rondenTabel) {
    const datum = datumLeesbaar(u.ronde.datum);
    const wedstrijd = wedstrijdVoluit(u.ronde);
    const uitslag = uitslagTeam(u.ronde.uithuis, u.winst, u.verlies, u.remise);
    rondenTabel.appendChild(htmlRij(u.ronde.rondeNummer, datum, naarTeam(wedstrijd, u.ronde), uitslag));
    const div = document.getElementById("ronde" + rondeNummer); // 9 x div met id="ronde1".."ronde9"
    div.appendChild(document.createElement("h2")).innerHTML = ["Ronde " + rondeNummer, datum].join(SCHEIDING);
    const tabel = div.appendChild(document.createElement("table"));
    tabel.appendChild(htmlRij("", wedstrijd, "", uitslag));
    if (u.uitslagen.length) {
        for (let uitslag of u.uitslagen) {
            tabel.appendChild(uitslag);
        }
    } else {
        tabel.appendChild(htmlRij("","geen uitslagen","",""));
    }
}