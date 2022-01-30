"use strict";

/*
    verwerk vereniging=[vereniging]
 */

(async function() {
    const plaatje = document.getElementById("plaatje");
    if (competitie.vereniging === "Waagtoren") {
        plaatje.appendChild(htmlPlaatje("images/waagtoren.gif",60, 150, 123));
    }
    document.getElementById("kop").innerHTML = competitie.vereniging + SCHEIDING + seizoenVoluit(competitie.seizoen);
    seizoenSelecteren(INTERNE_COMPETITIE);
})();

async function seizoenSelecteren(teamCode) {
    const seizoenen = document.getElementById("seizoenSelecteren");
    (await localFetch("/seizoenen/" + teamCode)).forEach(
        function (seizoen) {
            seizoenen.appendChild(htmlOptie(seizoen, seizoenVoluit(seizoen)));
        });
    seizoenen.value = competitie.seizoen; // werkt uitsluitend na await
    seizoenen.addEventListener("input",
        function () {
            sessionStorage.setItem("seizoen", seizoenen.value);
            naarZelfdePagina();
        });
}

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