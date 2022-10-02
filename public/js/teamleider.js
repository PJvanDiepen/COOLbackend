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
    const vandaag = datumSQL();
    let datum;
    for (const wedstrijd of wedstrijden) {
        datum = wedstrijd.datum;
        if (datumSQL(datum) >= vandaag) {
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
    let nhsb = false;
    let aantalWedstrijden = 0;
    let wedstrijd = [];
    for (const w of wedstrijden) {
        if (w.datum === wedstrijdDatum) {
            nhsb = nhsb || w.teamCode.substring(0,1) === "n";
            w.gevraagd = 0;
            w.toegezegd = 0;
            wedstrijd[aantalWedstrijden++] = w;
        }
    }
    console.log(wedstrijd);
    tussenkop.innerHTML = `${nhsb ? "NHSB" : "KNSB"} wedstrijd${aantalWedstrijden > 1 ? "en" : ""} op ${datumLeesbaar({datum: wedstrijdDatum})}`;
    const spelers = await serverFetch(`/${uuidToken}/teamleider/${o_o_o.seizoen}/${datumSQL(wedstrijdDatum)}`);
    for (const s of spelers) {
        console.log(s);
        let knsbVast = "";
        let nhsbVast = "";
        let invallerTeam = "?";
        let invaller = "";
        for (const w of wedstrijd) {
            const isGevraagd = s.teamCode === w.teamCode;
            if (isGevraagd) {
                w.gevraagd++;
            }
            const heeftToegezegd = s.partij === EXTERN_THUIS || s.partij === EXTERN_UIT;
            if (isGevraagd && heeftToegezegd) {
                w.toegezegd++;
            }
            if (w.teamCode === s.knsbTeam) {
                knsbVast = heeftToegezegd ? VINKJE : STREEP;
            } else if (w.teamCode === s.nhsbTeam) {
                nhsbVast = heeftToegezegd ? VINKJE : STREEP;
            } else if (w.teamCode === invallerTeam) {
                invaller = heeftToegezegd ? VINKJE : STREEP;
            }
        }
        const link = htmlLink(`speler.html?team=${o_o_o.competitie}&speler=${s.knsbNummer}&naam=${s.naam}`, s.naam);
        // htmlVerwerkt(link, knsbNummer === lidNummer);
        tabel.appendChild(htmlRij(naarSpeler(s), s.knsbRating, s.knsbTeam, knsbVast, s.nhsbTeam, nhsbVast, invallerTeam, invaller));
    }
    for (const w of wedstrijd) {
        lijst.appendChild(htmlRij(wedstrijdVoluit(w), w.naam, w.gevraagd, w.toegezegd, w.borden === w.toegezegd ? VINKJE : KRUISJE));
    }
}

function invallerVragen(speler, wedstrijd) {
    if (uitslagWijzigen(uitslag)) {
        return uitslagSelecteren(rondeNummer, uitslag)
    } else if (uitslag.resultaat === WINST) {
        return "1-0";
    } else if (uitslag.resultaat === REMISE) {
        return "½-½";
    } else if (uitslag.resultaat === VERLIES) {
        return "0-1";
    } else {
        return "";
    }
}