"use strict";

/*
    verwerk datum=[datum]
 */
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
    await wedstrijdenOverzicht(document.getElementById("kop"), wedstrijden, wedstrijdDatum);
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

async function wedstrijdenOverzicht(kop, wedstrijden, wedstrijdDatum) {
    kop.innerHTML = "Externe competitie" + SCHEIDING + datumLeesbaar(wedstrijdDatum);
    let wedstrijdNummer = 0;
    for (const w of wedstrijden) {
        if (w.datum === wedstrijdDatum) {
            wedstrijdNummer++;
            const div = document.getElementById("wedstrijd" + wedstrijdNummer); // 9 x div met id="wedstrijd".."wedstrijd9"
            div.appendChild(document.createElement("h2")).innerHTML = wedstrijdVoluit(w) + SCHEIDING + w.naam;
            const tabel = div.appendChild(document.createElement("table"));
            tabel.appendChild(htmlRij("", "", "rating", "team", "aanwezig"));
            let aanwezigen = 0;
            (await serverFetch(`/${uuidToken}/teamleider/${w.seizoen}/${w.teamCode}/${datumSQL(wedstrijdDatum)}`)).forEach(
                function (u) {
                    tabel.appendChild(htmlRij(
                        u.partij === NIET_MEEDOEN ? "" : (++aanwezigen),
                        naarSpeler(u.knsbNummer, u.naam),
                        u.knsbRating,
                        vasteSpelerOfInvaller(u, w.teamCode),
                        aanwezig(u)));
                });
        }
    }
}

const INVALLER = "invaller";

function vasteSpelerOfInvaller(speler, teamCode) {
    if (speler.nhsbTeam === teamCode) {
        return speler.nhsbOpgegeven === teamCode ? teamCode : INVALLER;
    } else if (speler.knsbTeam === teamCode) {
        return speler.knsbOpgegeven === teamCode ? teamCode : INVALLER;
    } else {
        return INVALLER;
    }
}

function aanwezig(u) {
    if (u.partij === EXTERNE_PARTIJ) {
        return `bord ${u.bordNummer} ${u.witZwart} ${u.resultaat}`;
    } else if (u.partij === NIET_MEEDOEN) {
        return STREEP;
    } else if (u.partij === MEEDOEN) {
        return VINKJE;
    } else {
        return "???";
    }
}