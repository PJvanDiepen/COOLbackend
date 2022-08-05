"use strict";

/*
    verwerk datum=[datum]
 */
(async function() {
    await init();
    menu([GEREGISTREERD, "systeembeheer", function () {
            naarAnderePagina("beheer.html");
        }],
        [BESTUUR, "speler toevoegen"],
        [BESTUUR, "OLA-bestand inlezen", function () {
            naarAnderePagina("ola.html");
    }]);
    const wedstrijdDatum = params.get("datum");
    const wedstrijden = await localFetch("/wedstrijden/" + o_o_o.seizoen);
    datumSelecteren(wedstrijdDatum, wedstrijden);
    await spelersOverzicht(document.getElementById("kop"), document.getElementById("tabel"), wedstrijden, wedstrijdDatum);
})();

function datumSelecteren(wedstrijdDatum, wedstrijden) {
    const datums = document.getElementById("datumSelecteren");
    wedstrijden.forEach(
        function (wedstrijd) {
            datums.appendChild(htmlOptie(wedstrijd.datum, datumLeesbaar(wedstrijd) + SCHEIDING + wedstrijdVoluit(wedstrijd)));
        });
    datums.value = wedstrijdDatum; // werkt uitsluitend na await
    datums.addEventListener("input",
        function () {
            naarZelfdePagina(`datum=${datums.value}`);
        });
}

async function spelersOverzicht(kop, tabel, wedstrijden, wedstrijdDatum) {
    kop.innerHTML = "Externe competitie" + SCHEIDING + seizoenVoluit(o_o_o.seizoen);
    const spelers = await localFetch(`/rating/${o_o_o.seizoen}`);
    for (const s of spelers) {
        tabel.appendChild(htmlRij(s.naam, s.knsbRating, datumLeesbaar(s), s.knsbTeam, "", s.nhsbTeam, ""));
    }
}

async function wedstrijdenOverzicht(kop, wedstrijden, wedstrijdDatum) {
    kop.innerHTML = "Externe competitie" + SCHEIDING + jsonDatumLeesbaar(wedstrijdDatum);
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
                        naarSpeler(u),
                        u.knsbRating,
                        vasteSpelerOfInvaller(w.teamCode, u),
                        aanwezig(u)));
                });
        }
    }
}

function vasteSpelerOfInvaller(teamCode, speler) {
    return teamCode === speler.nhsbTeam || teamCode === speler.teamCode ? teamCode : "invaller";
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