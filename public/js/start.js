"use strict";
/*
    verwerk vereniging=[vereniging]
 */

(async function() {
    await init();
    const plaatje = document.getElementById("plaatje");
    if (o_o_o.vereniging === "Waagtoren") {
        plaatje.appendChild(htmlPlaatje("images/waagtoren.gif",60, 150, 123));
    }
    document.getElementById("kop").innerHTML = o_o_o.vereniging + SCHEIDING + seizoenVoluit(o_o_o.seizoen);
    document.getElementById("competitie").appendChild(
        htmlLinkEnTerug("ranglijst.html", `Ranglijst ${teamVoluit(o_o_o.competitie)} na ronde ${o_o_o.vorigeRonde}`));
    document.getElementById("ronde").appendChild(
        htmlLinkEnTerug("ronde.html", `Uitslagen ronde ${o_o_o.vorigeRonde}`));
    if (o_o_o.vorigeRonde < o_o_o.laatsteRonde) {
        document.getElementById("indelen").appendChild(
            htmlLinkEnTerug("indelen.html", `Voorlopige indeling ronde ${o_o_o.huidigeRonde}`));
    }
    seizoenSelecteren(INTERNE_COMPETITIE);
    competitieSelecteren();
})();


function htmlPlaatje(plaatje, percentage, breed, hoog) {
    const img = document.createElement("img");
    img.src = plaatje;
    const factor = (window.innerWidth * percentage / 100) / breed; // percentage maximale breedte
    if (factor > 1.0) {
        img.width = breed;
        img.height = hoog;
    } else {
        img.width = Math.round(breed * factor);
        img.height = Math.round(hoog * factor);
    }
    return img;
}

async function seizoenSelecteren(teamCode) {
    const seizoenen = document.getElementById("seizoenSelecteren");
    (await localFetch("/seizoenen/" + teamCode)).forEach(
        function (seizoen) {
            seizoenen.appendChild(htmlOptie(seizoen, seizoenVoluit(seizoen)));
        });
    seizoenen.value = o_o_o.seizoen; // werkt uitsluitend na await
    seizoenen.addEventListener("input",
        function () {
            sessionStorage.setItem("seizoen", seizoenen.value);
            sessionStorage.setItem("competitie", INTERNE_COMPETITIE);
            sessionStorage.setItem("team", INTERNE_COMPETITIE);
            naarZelfdePagina();
        });
}

async function competitieSelecteren() {
    const competities = document.getElementById("competitieSelecteren");
    (await localFetch("/teams/" + o_o_o.seizoen)).forEach(
        function (team) {
            if (interneCompetitie(team.teamCode)) {
                competities.appendChild(htmlOptie(team.teamCode, team.omschrijving));
            }
        });
    competities.value = o_o_o.competitie; // werkt uitsluitend na await
    competities.addEventListener("input",
        function () {
            sessionStorage.setItem("competitie", competities.value);
            sessionStorage.setItem("team", competities.value);
            naarZelfdePagina();
        });
}