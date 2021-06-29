"use strict";

inVolgorde();

async function inVolgorde() {
    await gebruikerVerwerken();
    menu(naarBeheer,
        naarAgenda,
        naarRanglijst,
        naarGebruiker,
        terugNaar);
    teamSelecteren(teamCode);
    uitslagenTeam(document.getElementById("kop"),document.getElementById("ronden"));
}

async function uitslagenTeam(kop, rondenTabel) {
    const teams = await localFetch("/teams/" + seizoen);
    for (const team of teams) {
        if (team.teamCode === teamCode) {
            kop.innerHTML = [wedstrijdTeam(teamCode), seizoenVoluit(seizoen), team.omschrijving].join(SCHEIDING);
            break;
        }
    }
    const rondeUitslagen = await uitslagenTeamAlleRonden(teamCode);
    for (let i = 0; i < rondeUitslagen.length; ++i) {
        uitslagenTeamPerRonde(rondeUitslagen[i], i + 1, rondenTabel);
    }
}

function uitslagenTeamPerRonde(u, rondeNummer, rondenTabel) {
    if (u) { // eventueel ronde overslaan, wegens oneven aantal teams in een poule
        const datum = datumLeesbaar(u.ronde.datum);
        const wedstrijd = wedstrijdVoluit(u.ronde);
        const uitslag = uitslagTeam(u.ronde.uithuis, u.winst, u.verlies, u.remise);
        rondenTabel.appendChild(htmlRij(u.ronde.rondeNummer, datum, naarTeam(wedstrijd, u.ronde), uitslag));
        if (u.uitslagen.length) {
            const div = document.getElementById("ronde" + rondeNummer); // 9 x div met id="ronde1".."ronde9"
            div.appendChild(document.createElement("h2")).innerHTML = ["Ronde " + rondeNummer, datum].join(SCHEIDING);
            const tabel = div.appendChild(document.createElement("table"));
            tabel.appendChild(htmlRij("", wedstrijd, "", uitslag));
            for (let uitslag of u.uitslagen) {
                tabel.appendChild(uitslag);
            }
        }
    }
}