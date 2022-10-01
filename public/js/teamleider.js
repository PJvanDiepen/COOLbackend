"use strict";

/*
    verwerk datum=[datum]
 */
(async function() {
    await init();
    menu([GEREGISTREERD, "systeembeheer", function () {
            naarAnderePagina("beheer.html");
        }]);
    const wedstrijden = await localFetch("/wedstrijden/" + o_o_o.seizoen);
    const wedstrijdDatum = params.get("datum") || volgendeWedstrijdDatum(wedstrijden);
    datumSelecteren(wedstrijdDatum, wedstrijden);
    await spelersOverzicht(
        document.getElementById("kop"),
        document.getElementById("tabel"),
        document.getElementById("tussenkop"),
        document.getElementById("lijst"),
        wedstrijden,
        wedstrijdDatum);
})();

function volgendeWedstrijdDatum(wedstrijden) {
    console.log(wedstrijden);
    const vandaag = datumSQL();
    let datum;
    for (const wedstrijd of wedstrijden) {
        datum = wedstrijd.datum;
        console.log(datum);
        if (datumSQL(datum) >= vandaag) {
            console.log("gevonden!")
            return datum;
        }
    }
    return datum;
}

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

async function spelersOverzicht(kop, tabel, tussenkop, lijst, wedstrijden, wedstrijdDatum) {
    kop.innerHTML = seizoenVoluit(o_o_o.seizoen) + SCHEIDING + "overzicht voor teamleiders";
    let aantalWedstrijden = 0;
    let nhsb = false;
    for (const w of wedstrijden) {
        if (w.datum === wedstrijdDatum) {
            aantalWedstrijden++;
            nhsb = nhsb || w.teamCode.substring(0,1) === "n";
            console.log(w);
            lijst.appendChild(htmlRij(wedstrijdVoluit(w), w.naam, 0, 0, w.borden));
        }
    }
    tussenkop.innerHTML = `${nhsb ? "NHSB" : "KNSB"} wedstrijd${aantalWedstrijden > 1 ? "en" : ""} op ${datumLeesbaar({datum: wedstrijdDatum})}`;
    const spelers = await localFetch(`/${uuidToken}/teamleider/${o_o_o.seizoen}/${datumSQL(wedstrijdDatum)}`);
    for (const s of spelers) {
        console.log(s);
        tabel.appendChild(htmlRij(s.naam, s.knsbRating, s.knsbTeam, VINKJE, s.nhsbTeam, STREEP, "", KRUISJE));
    }
}

// TODO verwijderen?

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