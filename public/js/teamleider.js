"use strict";



(async function() {
    await gebruikerVerwerken();
    menu(naarAgenda,
        naarIndelen,
        naarRanglijst,
        naarGebruiker,
        naarBeheer);
    const wedstrijdDatum = params.get("datum") || await localFetch("/extern/" + seizoen);
    const wedstrijden = await localFetch("/wedstrijden/" + seizoen);
    datumSelecteren(wedstrijdDatum, wedstrijden);
    wedstrijdenOverzicht(document.getElementById("kop"), document.getElementById("wedstrijden"), wedstrijden, wedstrijdDatum);
})();

function datumSelecteren(wedstrijdDatum, wedstrijden) {
    const datums = document.getElementById("datumSelecteren");
    wedstrijden.forEach(
        function (w) {
            datums.appendChild(htmlOptie(w.datum, datumLeesbaar(w.datum) + SCHEIDING + wedstrijdVoluit(w)));
        });
    datums.value = wedstrijdDatum; // werkt uitsluitend na await
    datums.addEventListener("input",
        function () {
            naarZelfdePagina("?datum=" + datums.value);
        });
}

function wedstrijdenOverzicht(kop, tabel, wedstrijden, wedstrijdDatum) {
    let datum = datumLeesbaar(wedstrijdDatum);
    kop.innerHTML = "Externe competitie" + SCHEIDING + datum;
    for (const w of wedstrijden) {
        if (w.datum === wedstrijdDatum) {
            tabel.appendChild(htmlRij(w.teamCode, datum, wedstrijdVoluit(w), w.naam, w.borden));
            datum = ""; // datum 1 x in tabel
        }
    }
}

function uitslagenTeamPerRonde(u, rondeNummer, rondenTabel) {
    if (u) { // eventueel ronde overslaan, wegens oneven aantal teams in een poule
        const datum = datumLeesbaar(u.ronde.datum);
        const wedstrijd = wedstrijdVoluit(u.ronde);
        const uitslag = uitslagTeam(u.ronde.uithuis, u.winst, u.verlies, u.remise);
        rondenTabel.appendChild(htmlRij(u.ronde.rondeNummer, datum, naarTeam(wedstrijd, u.ronde), uitslag));
        if (u.uitslagen.length) {
            const div = document.getElementById("team" + rondeNummer); // 9 x div met id="team1".."team9"
            div.appendChild(document.createElement("h2")).innerHTML = ["Ronde " + rondeNummer, datum].join(SCHEIDING);
            const tabel = div.appendChild(document.createElement("table"));
            tabel.appendChild(htmlRij("", wedstrijd, "", uitslag));
            for (let uitslag of u.uitslagen) {
                tabel.appendChild(uitslag);
            }
        }
    }
}