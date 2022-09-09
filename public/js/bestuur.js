"use strict";

/*
    verwerk lid=<knsbNummer>
 */

(async function() {
    await init();
    const lidNummer = Number(params.get("lid"));
    menu([GEREGISTREERD, "systeembeheer", function () {
            naarAnderePagina("beheer.html");
        }]);
    ledenLijst(
        lidNummer,
        document.getElementById("kop"),
        document.getElementById("competities"),
        document.getElementById("tabel"));
    olaBestandLezen();
})();

async function ledenLijst(lidNummer, kop, competities, tabel) {
    kop.innerHTML = seizoenVoluit(o_o_o.seizoen) + SCHEIDING + "overzicht voor bestuur";
    const personen = await serverFetch(`/personen/${o_o_o.seizoen}`);
    competities.appendChild(htmlRij("personen in 0-0-0", personen.length - 11)); // aantal personen zonder onbekend en 10 x niemand
    const tijdelijkNummer = await serverFetch(`/nummer`); // vanaf 100
    tabel.appendChild(htmlRij(
        htmlLink(`lid.html?lid=${tijdelijkNummer}`, "----- iemand toevoegen -----"),
        "", // knsbRating
        "", // eventueel interne rating
        "", // knsbTeam
        "", // nhsbTeam
        "", // competities
        "")); // functie

    const olaLid = [];
    for (const lid of personen) {
        const knsbNummer = Number(lid.knsbNummer);
        olaLid[knsbNummer] = knsbNummer; // bekend in persoon tabel
    }
    const olaBestand = JSON.parse(sessionStorage.getItem("OLA"));
    if (olaBestand) {
        for (const olaRegel of olaBestand) {
            const knsbNummer = Number(olaRegel.knsbNummer);
            if (isNaN(knsbNummer)) {
                // console.log(olaRegel.knsbNummer);
            } else if (olaLid[knsbNummer] === knsbNummer) {
                olaLid[Number(knsbNummer)] = olaRegel; // bekend in persoon tabel
            } else {
                tabel.appendChild(htmlRij(
                    htmlLink(`lid.html?lid=${knsbNummer}`, olaRegel.olaNaam),
                    olaRegel.knsbRating,
                    "", // interne rating
                    "", // knsbTeam
                    "", // nhsbTeam
                    "", // competities
                    "")); // functie
            }
        }
    }

    let aantalGebruikers = 0;
    let aantalPerTeam = {};
    const teams = await localFetch("/teams/" + o_o_o.seizoen); // competities en teams
    for (const team of teams) {
        if (teamOfCompetitie(team.teamCode)) {
            aantalPerTeam[team.teamCode] = 0;
        }
    }
    for (const lid of personen) {
        const knsbNummer = Number(lid.knsbNummer);
        if (knsbNummer > 100) {
            if (lid.mutatieRechten !== null) {
                aantalGebruikers++;
            }
            if (lid.knsbTeam !== null && lid.knsbTeam) {
                aantalPerTeam[lid.knsbTeam]++;
            }
            if (lid.nhsbTeam !== null && lid.nhsbTeam) {
                aantalPerTeam[lid.nhsbTeam]++;
            }
            if (lid.intern1 !== null &&  lid.intern1) {
                aantalPerTeam[lid.intern1]++;
            }
            if (lid.intern2 !== null &&  lid.intern2) {
                aantalPerTeam[lid.intern2]++;
            }
            if (lid.intern3 !== null &&  lid.intern3) {
                aantalPerTeam[lid.intern3]++;
            }
            if (lid.intern4 !== null &&  lid.intern4) {
                aantalPerTeam[lid.intern4]++;
            }
            if (lid.intern5 !== null &&  lid.intern5) {
                aantalPerTeam[lid.intern5]++;
            }
            const link = htmlLink(`lid.html?lid=${knsbNummer}`, lid.naam);
            const olaRating = !olaLid[knsbNummer] || typeof olaLid[knsbNummer] === "number" ? 0 : Number(olaLid[knsbNummer].knsbRating);
            htmlVerwerkt(link,knsbNummer === lidNummer);
            tabel.appendChild(htmlRij(
                link,
                olaRating ? olaRating : lid.knsbRating === null ? "" : lid.knsbRating,
                lid.interneRating === null ? "" : lid.interneRating === lid.knsbRating ? VINKJE : lid.interneRating,
                lid.knsbTeam === null ? "" : lid.knsbTeam,
                lid.nhsbTeam === null ? "" : lid.nhsbTeam,
                lid.intern1 === null ? "" : "intern en rapid", // TODO uitsplitsen
                lid.mutatieRechten === null ? "" : gebruikerFunctieVoluit(lid) // TODO zoals bij beheer.html
            ));
        }
    }
    competities.appendChild(htmlRij("gebruikers van 0-0-0", aantalGebruikers));
    competities.appendChild(htmlRij("----- competitie of team toevoegen -----", "")); // TODO naar competitie.html
    for (const team of teams) {
        if (teamOfCompetitie(team.teamCode)) {
            competities.appendChild(htmlRij(teamVoluit(team.teamCode), aantalPerTeam[team.teamCode]));
        }
    }
}

/*
Zie Matt Frisbie: Professional JavaScript for Web Developers blz. 760
 */
function olaBestandLezen() {
    const filesList = document.getElementById("olaFile");
    filesList.addEventListener("change", function (event) {
        const output = document.getElementById("output");
        const files = event.target.files;
        const reader = new FileReader();
        reader.readAsText(files[0]);
        reader.onerror = function() {
            output.innerHTML = "Could not read file, error code is " + reader.error.code;
        };
        reader.onload = function() {
            const olaTabel = [];
            const regels = reader.result.split('\n');
            for (const regel of regels) {
                olaVerwerken(olaTabel, csv(regel));
            }
            sessionStorage.setItem("OLA", JSON.stringify(olaTabel));
            naarZelfdePagina();
        };
    });
}

const olaRegex = /(),|(\d*),|"([^"]*)",|([^,]*),/g;

/**
 * bovenstaande regular expression onderscheid kolommen geschieden door komma's
 * per kolom is er een groep met een komma
 * groep 0 is de complete match
 * groep 1 indien leeg
 * groep 2 indien getal
 * groep 3 indien tekst met "" (eventueel met komma's)
 * groep 4 indien tekst zonder ""
 *
 * Zie https://regex101.com/codegen?language=javascript
 *
 * csv verwerkt een regel tot kolommen met behulp van olaRegex
 * behalve de laatste kolom, want die heeft geen komma
 *
 * @param regel in csv
 * @returns {*[]} kolommen
 */

function csv(regel) {
    let kolommen = [];
    let m;
    while ((m = olaRegex.exec(regel)) !== null) {
        if (m.index === olaRegex.lastIndex) {
            olaRegex.lastIndex++; // This is necessary to avoid infinite loops with zero-width matches
        } else {
            m.forEach(function (match, groupIndex) {
                if (groupIndex === 1 && match !== undefined) {
                    kolommen.push("");
                } else if (groupIndex === 2 && match !== undefined) {
                    kolommen.push(Number(match));
                } else if (groupIndex === 3 && match !== undefined) {
                    kolommen.push(match);
                } else if (groupIndex === 4 && match !== undefined) {
                    kolommen.push(match);
                }
            });
        }
    }
    return kolommen;
}

const naamRegex = /(.*),.*\.\s(.*)\((.*)\)/;

/**
 * maak van de olaNaam een normaleNaam
 *
 * @param olaNaam uit Online Leden Administratie van KNSB
 * @returns {string|*} voorNaam tussenvoegsel achterNaam
 *
 * Diepen, P.J. van (Peter) -> Peter van Diepen
 * Bakker, J. (Jos) -> Jos Bakker
 * Meiden, D. van der (Dirk) -> Dirk van der Meiden
 * Horst, C.A. v.d. (Corné) -> Corné Horst (gaat fout wegens tussenvoegsel met punten!)
 *
 */
function normaleNaam(olaNaam) {
    let voornaam = "";
    let tussenvoegsel = "";
    let achternaam = "";
    let m;
    if ((m = naamRegex.exec(olaNaam)) !== null) {
        m.forEach(function (match, groupIndex) {
            if (groupIndex === 3) {
                voornaam = match;
            } else if (groupIndex === 2) {
                tussenvoegsel = match;
            } else if (groupIndex === 1) {
                achternaam = match;
            }
        });
        return `${voornaam} ${tussenvoegsel}${achternaam}`; // geen spatie tussen tussenvoegsel en achternaam!
    }
    return olaNaam;
}

/*
00 Relatienummer > knsbNummer
01 Volledige naam > voornaam, tussenvoegsel, achternaam
02 Geslacht > M of V
03 Geboortejaar
04 Categorie > S of J
05 Email
06 Telefoonnummer 1
07 Telefoonnummer 2
08 Adres > straat, huisNummer
09 Postcode
10 Plaatsnaam
11 Landnaam
12 Lidmaatschap
13 Lid sinds
14 Afgemeld per
15 KNSB-rating > knsbRating
16 FIDE-rating
17 Jeugdrating
18 Stappenniveau
19 Verlengingsdatum
20 Gebruik NAW
21 Beeldmateriaal (laatste kolom ontbreekt!)
 */
function olaVerwerken(olaTabel, kolom) {
    if ((typeof kolom[0]) === "number") {
        olaTabel.push({
            knsbNummer: kolom[0],
            olaNaam: kolom[1],
            naam: normaleNaam(kolom[1]),
            email: kolom[5],
            knsbRating: Number(kolom[15]) // indien "" dan 0
        });
    }
}