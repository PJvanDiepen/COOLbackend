"use strict";

/*
    verwerk datum=<datum>
 */
(async function() {
    await init();
    menu([]);
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
    const spelers = await serverFetch(`/${uuidToken}/teamleider/${o_o_o.seizoen}/${datumSQL(wedstrijdDatum)}`);
    let nhsb = false;
    let aantalWedstrijden = 0;
    let wedstrijd = [];
    for (const w of wedstrijden) {
        if (w.datum === wedstrijdDatum) {
            nhsb = nhsb || w.teamCode.substring(0,1) === "n"; // KNSB en NHSB wedstrijden nooit op dezelfde dag!
            w.gevraagd = 0;
            w.toegezegd = 0;
            w.hoogsteRating = ratingInvaller(spelers, w.teamCode, nhsb);
            wedstrijd[aantalWedstrijden++] = w;
        }
    }
    tussenkop.innerHTML = `${nhsb ? "NHSB" : "KNSB"} wedstrijd${aantalWedstrijden > 1 ? "en" : ""} op ${datumLeesbaar({datum: wedstrijdDatum})}`;
    let vorigeSpeler = 0;
    for (const s of spelers) {
        const heeftToegezegd = s.partij === EXTERN_THUIS || s.partij === EXTERN_UIT; // heeft voor 1 team toegezegd
        let knsbVast = "";
        let nhsbVast = "";
        let invallerTeam = s.teamCode === null || s.teamCode === "" ? "" : s.teamCode === s.knsbTeam || s.teamCode === s.nhsbTeam ? "" : s.teamCode;
        let invaller = "";
        for (const w of wedstrijd) {
            const isGevraagd = s.knsbTeam === w.teamCode || s.nhsbTeam === w.teamCode || s.teamCode === w.teamCode; // is voor minstens 1 team gevraagd
            if (isGevraagd) {
                w.gevraagd++;
            }
            if (w.teamCode === s.teamCode) { // is voor deze wedstijd van dit team gevraagd
                if (heeftToegezegd) {
                    w.toegezegd++;
                    if (w.teamCode === s.knsbTeam) {
                        knsbVast = VINKJE;
                    } else if (w.teamCode === s.nhsbTeam) {
                        nhsbVast = VINKJE;
                    } else {
                        invaller = VINKJE;
                    }
                } else {
                    if (w.teamCode === s.knsbTeam) {
                        knsbVast = STREEP;
                    } else if (w.teamCode === s.nhsbTeam) {
                        nhsbVast = STREEP;
                    } else {
                        invaller = STREEP;
                    }
                }
            }
        }
        const nummer = s.knsbNummer > 1000000 ? s.knsbNummer : "";
        const invallerWedstrijd =
            s.knsbNummer === vorigeSpeler ? teamVoluit(invallerTeam) + "  " : wedstrijdSelecteren(s, invallerTeam, wedstrijd, wedstrijdDatum);
        vorigeSpeler = s.knsbNummer;
        tabel.appendChild(htmlRij(naarSpeler(s), nummer, s.knsbRating, s.knsbTeam, knsbVast, s.nhsbTeam, nhsbVast, invallerWedstrijd, invaller));
    }
    for (const w of wedstrijd) {
        lijst.appendChild(htmlRij(wedstrijdVoluit(w), w.naam, w.gevraagd, w.toegezegd, w.borden === w.toegezegd ? VINKJE : STREEP));
    }
}

function ratingInvaller(spelers, teamCode, nhsb) {
    for (const s of spelers) {
        if (nhsb && s.nhsbTeam === teamCode) {
            return s.knsbRating + 80;
        } else if (s.knsbTeam === teamCode) {
            return s.knsbRating + 40;
        }
    }
    return 3000; // hoogste rating indien team zonder vaste spelers
}

function wedstrijdSelecteren(speler, invallerTeam, wedstrijd, wedstrijdDatum) {
    let invallerMogelijkheden = 0;
    const select = document.createElement("select");
    let wedstrijdNummer = -1; // geen wedstrijd;
    if (invallerTeam === "") {
        select.appendChild(htmlOptie(wedstrijdNummer, ""));
    }
    for (let i = 0; i < wedstrijd.length; i++) {
        if (wedstrijd[i].teamCode === invallerTeam) {
            wedstrijdNummer = i;
        }
        if (speler.knsbTeam !== wedstrijd[i].teamCode &&
            speler.nhsbTeam !== wedstrijd[i].teamCode &&
            speler.knsbRating < wedstrijd[i].hoogsteRating) {
            invallerMogelijkheden++;
            select.appendChild(htmlOptie(i, teamVoluit(wedstrijd[i].teamCode)));
        }
    }
    if (invallerMogelijkheden === 0) {
        return invallerTeam;
    } else {
        select.value = wedstrijdNummer;
        select.addEventListener("input",async function () {
            const team = wedstrijd[select.value].teamCode;
            const ronde = wedstrijd[select.value].rondeNummer;
            const mutaties = await serverFetch(
                `/${uuidToken}/agenda/${o_o_o.seizoen}/${team}/${ronde}/${speler.knsbNummer}/n/${datumSQL(wedstrijdDatum)}/int`);
            naarZelfdePagina(`datum=${wedstrijdDatum}&wedstrijd=${select.value}`);
        });
        return select;
    }
}